// ============================================
// STH Cartage Counter · v3
// Yard Dark design — full working app
// ============================================

// ---------- Service Worker ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}

// ---------- Splash ----------
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('app').classList.add('visible');
  }, 900);
});

// ---------- State ----------
const STORAGE_KEY = 'sth-cartage-state-v3';

let appState = {
  jobDate: '',
  client: '',
  project: '',
  trucks: [],
  currentTruckId: null,
};

const TRUCK_CAPACITIES = { 'Tandem': 10, 'TT': 22, 'Quad': 25 };
const TRUCK_LABELS = { 'Tandem': 'Tandem', 'TT': 'Truck & Trailer', 'Quad': 'Quad' };
const TRUCK_CHIP = { 'Tandem': 'TANDEM · 10m³', 'TT': 'T+T · 22m³', 'Quad': 'QUAD · 25m³' };

// ---------- Persistence ----------
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); }
  catch (e) { console.warn('Save failed:', e); }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    if (saved.jobDate === today) {
      appState = saved;
      document.getElementById('job-date').value = saved.jobDate;
      document.getElementById('client').value = saved.client || '';
      document.getElementById('project').value = saved.project || '';
    } else if (saved.jobDate) {
      // Different day — prompt to carry over job info but clear trucks
      if (confirm(`Previous session was for ${saved.jobDate} (${saved.project || 'unnamed'}).\n\nStart a new day?`)) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        appState = saved;
        document.getElementById('job-date').value = saved.jobDate;
        document.getElementById('client').value = saved.client || '';
        document.getElementById('project').value = saved.project || '';
      }
    }
  } catch (e) { console.warn('Load failed:', e); }
}

// ---------- Helpers ----------
function generateId() {
  return Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

function fmtTime(date) {
  return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function minutesAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  const remain = mins % 60;
  return `${hrs}h ${remain}m ago`;
}

function readJobFields() {
  appState.jobDate = document.getElementById('job-date').value;
  appState.client = document.getElementById('client').value.trim();
  appState.project = document.getElementById('project').value.trim();
}

function hasJobSetup() {
  return !!(appState.jobDate && appState.project);
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ---------- Clock ----------
function updateClock() {
  document.getElementById('clock').textContent = fmtTime(new Date());
}

// ---------- Truck Management ----------
function addTruck() {
  readJobFields();
  if (!hasJobSetup()) {
    alert('Enter the job date and project before adding trucks.');
    document.getElementById('project').focus();
    return;
  }
  openModal('add-truck-modal');
  setTimeout(() => document.getElementById('truck-type').focus(), 120);
}

function saveTruck() {
  const type = document.getElementById('truck-type').value;
  const rego = document.getElementById('truck-rego').value.toUpperCase().trim();
  const company = document.getElementById('truck-company').value.trim();

  if (!type) { alert('Please select a truck type.'); return; }
  if (!rego) { alert('Please enter a registration.'); return; }

  appState.trucks.push({
    id: generateId(),
    type, rego, company,
    loads: [],
    completed: false,
    signature: null,
  });

  document.getElementById('truck-type').value = '';
  document.getElementById('truck-rego').value = '';
  document.getElementById('truck-company').value = '';

  closeModal('add-truck-modal');
  saveState();
  renderAll();
}

function removeTruck(truckId) {
  const truck = appState.trucks.find(t => t.id === truckId);
  if (!truck) return;
  if (!confirm(`Remove ${truck.rego} and all its loads?`)) return;
  appState.trucks = appState.trucks.filter(t => t.id !== truckId);
  saveState();
  renderAll();
}

function addLoad(truckId) {
  const truck = appState.trucks.find(t => t.id === truckId);
  if (!truck || truck.completed) return;

  const now = new Date();
  truck.loads.push({
    id: generateId(),
    time: fmtTime(now),
    timestamp: now.getTime(),
  });
  saveState();
  renderAll();

  // Bounce the count for feedback
  const el = document.querySelector(`[data-truck-id="${truckId}"] .big-count`);
  if (el) {
    el.style.transform = 'scale(1.18)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 180);
  }
}

function removeLastLoad(truckId) {
  const truck = appState.trucks.find(t => t.id === truckId);
  if (!truck || truck.completed || truck.loads.length === 0) return;
  if (!confirm(`Undo the last load for ${truck.rego}?`)) return;
  truck.loads.pop();
  saveState();
  renderAll();
}

function finishTruck(truckId) {
  const truck = appState.trucks.find(t => t.id === truckId);
  if (!truck) return;
  if (truck.loads.length === 0) {
    alert('This truck has no loads yet. Add at least one load or remove the truck.');
    return;
  }

  appState.currentTruckId = truckId;

  const cap = TRUCK_CAPACITIES[truck.type];
  const totalM3 = truck.loads.length * cap;

  document.getElementById('driver-summary').innerHTML = `
    <div class="summary-row"><span>Truck</span><span class="mono"><strong>${escapeHtml(truck.rego)}</strong></span></div>
    <div class="summary-row"><span>Type</span><span>${TRUCK_LABELS[truck.type]}</span></div>
    ${truck.company ? `<div class="summary-row"><span>Company</span><span>${escapeHtml(truck.company)}</span></div>` : ''}
    <div class="summary-row"><span>Loads</span><span class="mono"><strong>${truck.loads.length}</strong></span></div>
    <div class="summary-row"><span>Total Volume</span><span><strong>${totalM3} m³</strong></span></div>
  `;

  openModal('driver-signature-modal');
  setTimeout(initSignaturePad, 80);
}

// ---------- Rendering ----------
function renderAll() {
  renderJobBanner();
  renderSetupCard();
  renderKpis();
  renderTrucks();
  renderBottomBar();
}

function renderJobBanner() {
  const banner = document.getElementById('job-banner');
  const title = document.getElementById('job-title');
  const flag = document.getElementById('job-flag');
  const sub = document.getElementById('job-sub');

  if (hasJobSetup()) {
    const dateStr = new Date(appState.jobDate).toLocaleDateString('en-AU', {
      weekday: 'short', day: 'numeric', month: 'short'
    }).toUpperCase();
    flag.textContent = `ACTIVE JOB · ${dateStr}`;
    title.textContent = appState.project || 'Unnamed Project';
    title.classList.remove('placeholder');
    sub.textContent = appState.client ? appState.client.toUpperCase() : '—';
    banner.style.cursor = 'pointer';
    banner.onclick = () => {
      // Scroll to setup card for editing
      document.getElementById('setup-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  } else {
    flag.textContent = 'FILL IN JOB DETAILS BELOW';
    title.textContent = 'No Job Active';
    title.classList.add('placeholder');
    sub.textContent = '—';
    banner.onclick = null;
  }
}

function renderSetupCard() {
  const card = document.getElementById('setup-card');
  // Always visible, even after job is set — acts as an edit panel
  card.style.display = 'block';
}

function renderKpis() {
  const kpis = document.getElementById('kpis');
  if (appState.trucks.length === 0) {
    kpis.style.display = 'none';
    return;
  }
  kpis.style.display = 'grid';
  const loads = appState.trucks.reduce((s, t) => s + t.loads.length, 0);
  const m3 = appState.trucks.reduce((s, t) => s + t.loads.length * TRUCK_CAPACITIES[t.type], 0);
  document.getElementById('stat-trucks').textContent = appState.trucks.length;
  document.getElementById('stat-loads').textContent = loads;
  document.getElementById('stat-m3').textContent = m3;
}

function renderTrucks() {
  const container = document.getElementById('trucks-container');
  if (appState.trucks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="big">⊕</div>
        NO TRUCKS ADDED<br>TAP ADD TRUCK BELOW
      </div>
    `;
    return;
  }

  container.innerHTML = appState.trucks.map(t => renderTruckCard(t)).join('');
}

function renderTruckCard(truck) {
  const cap = TRUCK_CAPACITIES[truck.type];
  const count = truck.loads.length;
  const totalM3 = count * cap;
  const last = count > 0 ? truck.loads[count - 1] : null;

  // Build load pips (last one gets 'latest' style)
  const pips = truck.loads.map((l, i) =>
    `<span class="pip${i === count - 1 ? ' latest' : ''}">${l.time}</span>`
  ).join('');

  if (truck.completed) {
    return `
      <div class="truck completed" data-truck-id="${truck.id}">
        <div class="truck-head">
          <div class="truck-head-text">
            <div class="truck-rego">${escapeHtml(truck.rego)}</div>
            <div class="truck-company">${escapeHtml(truck.company || TRUCK_LABELS[truck.type])}</div>
          </div>
          <div class="truck-type-chip done">${TRUCK_CHIP[truck.type]}</div>
        </div>
        <div class="truck-main">
          <div class="big-count">${count}</div>
          <div class="count-side">
            <div class="count-label">LOADS</div>
            <div class="count-m3">${totalM3} m³</div>
            ${last ? `<div class="count-last">LAST · <strong>${last.time}</strong></div>` : ''}
          </div>
        </div>
        ${pips ? `<div class="load-strip">${pips}</div>` : ''}
        <div class="truck-done-footer">
          ✓ SIGNED &amp; COMPLETE
          <span class="remove" onclick="removeTruck('${truck.id}')">REMOVE</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="truck" data-truck-id="${truck.id}">
      <div class="truck-head">
        <div class="truck-head-text">
          <div class="truck-rego">${escapeHtml(truck.rego)}</div>
          <div class="truck-company">${escapeHtml(truck.company || TRUCK_LABELS[truck.type])}</div>
        </div>
        <div class="truck-type-chip">${TRUCK_CHIP[truck.type]}</div>
      </div>
      <div class="truck-main">
        <div class="big-count">${count}</div>
        <div class="count-side">
          <div class="count-label">LOADS</div>
          <div class="count-m3">${totalM3} m³</div>
          ${last ? `<div class="count-last">LAST · <strong>${last.time}</strong> · ${minutesAgo(last.timestamp)}</div>` : `<div class="count-last" style="opacity:0.5;">NO LOADS YET</div>`}
        </div>
      </div>
      ${pips ? `<div class="load-strip">${pips}</div>` : ''}
      <div class="truck-actions">
        <button class="ta-btn ta-primary" onclick="addLoad('${truck.id}')">+1 LOAD</button>
        <button class="ta-btn ta-secondary" onclick="removeLastLoad('${truck.id}')" ${count === 0 ? 'disabled' : ''}>UNDO</button>
        <button class="ta-btn ta-finish" onclick="finishTruck('${truck.id}')">FINISH</button>
      </div>
    </div>
  `;
}

function renderBottomBar() {
  const bar = document.getElementById('bottom-bar');
  if (appState.trucks.length === 0) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'block';
}

// ---------- Signature Pad ----------
let padCtx = null, padCanvas = null;

function initSignaturePad() {
  padCanvas = document.getElementById('driver-signature-pad');
  if (!padCanvas) return;
  padCtx = padCanvas.getContext('2d');

  // Size canvas for retina
  const rect = padCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  padCanvas.width = rect.width * dpr;
  padCanvas.height = rect.height * dpr;
  padCtx.scale(dpr, dpr);

  padCtx.fillStyle = '#fff';
  padCtx.fillRect(0, 0, padCanvas.width, padCanvas.height);
  padCtx.strokeStyle = '#0B0D10';
  padCtx.lineWidth = 2.5;
  padCtx.lineCap = 'round';
  padCtx.lineJoin = 'round';

  let drawing = false, lastX = 0, lastY = 0;

  function getPos(e) {
    const rect = padCanvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : null;
    const x = (t ? t.clientX : e.clientX) - rect.left;
    const y = (t ? t.clientY : e.clientY) - rect.top;
    return { x, y };
  }
  function start(e) { e.preventDefault(); drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; }
  function move(e) {
    if (!drawing) return; e.preventDefault();
    const p = getPos(e);
    padCtx.beginPath(); padCtx.moveTo(lastX, lastY); padCtx.lineTo(p.x, p.y); padCtx.stroke();
    lastX = p.x; lastY = p.y;
  }
  function end() { drawing = false; }

  padCanvas.onmousedown = start;
  padCanvas.onmousemove = move;
  padCanvas.onmouseup = end;
  padCanvas.onmouseleave = end;
  padCanvas.ontouchstart = start;
  padCanvas.ontouchmove = move;
  padCanvas.ontouchend = end;
}

function clearSignature() {
  if (!padCtx || !padCanvas) return;
  padCtx.fillStyle = '#fff';
  padCtx.fillRect(0, 0, padCanvas.width, padCanvas.height);
}

function isPadBlank() {
  if (!padCanvas) return true;
  const img = padCtx.getImageData(0, 0, padCanvas.width, padCanvas.height).data;
  for (let i = 0; i < img.length; i += 4) {
    if (img[i] !== 255 || img[i+1] !== 255 || img[i+2] !== 255) return false;
  }
  return true;
}

function saveDriverSignature() {
  if (isPadBlank()) { alert('Please sign before saving.'); return; }
  const truck = appState.trucks.find(t => t.id === appState.currentTruckId);
  if (!truck) return;

  truck.signature = padCanvas.toDataURL();
  truck.completed = true;
  appState.currentTruckId = null;

  closeModal('driver-signature-modal');
  saveState();
  renderAll();
}

// ---------- Export Summary Modal ----------
function openExportSummary() {
  readJobFields();
  if (appState.trucks.length === 0) { alert('No trucks to export.'); return; }

  const loads = appState.trucks.reduce((s, t) => s + t.loads.length, 0);
  const m3 = appState.trucks.reduce((s, t) => s + t.loads.length * TRUCK_CAPACITIES[t.type], 0);
  const unsigned = appState.trucks.filter(t => !t.completed).length;

  document.getElementById('export-summary').innerHTML = `
    <div class="summary-row"><span>Date</span><span class="mono">${escapeHtml(appState.jobDate) || '—'}</span></div>
    <div class="summary-row"><span>Project</span><span>${escapeHtml(appState.project) || '—'}</span></div>
    <div class="summary-row"><span>Client</span><span>${escapeHtml(appState.client) || '—'}</span></div>
    <div class="summary-row"><span>Trucks</span><span class="mono"><strong>${appState.trucks.length}</strong></span></div>
    <div class="summary-row"><span>Total Loads</span><span class="mono"><strong>${loads}</strong></span></div>
    <div class="summary-row"><span>Total Volume</span><span><strong>${m3} m³</strong></span></div>
    ${unsigned > 0 ? `<div class="warn-box" style="margin-top:12px;">⚠ ${unsigned} truck(s) not yet signed. They'll still be included in the export.</div>` : ''}
  `;
}

// ---------- Register Export ----------
const REG_DAY_START = 17;
const REG_BLOCK = 36;
const REG_ROWS_PER_DAY = 30;

async function exportRegister() {
  readJobFields();
  if (!hasJobSetup()) {
    alert('Please fill in Date and Project before exporting.');
    return;
  }

  try {
    const resp = await fetch('Cartage_Register_BLANK.xlsx');
    if (!resp.ok) throw new Error('Blank register template not found. Make sure Cartage_Register_BLANK.xlsx is in the same folder.');
    const buf = await resp.arrayBuffer();

    const wb = XLSX.read(buf, { type: 'array', cellStyles: true, cellFormula: true });
    const ws = wb.Sheets[wb.SheetNames[0]];

    // Flatten all loads into register rows (one row per load)
    const rows = [];
    const jobDate = new Date(appState.jobDate);
    const dateSerial = toExcelSerial(jobDate);

    for (const truck of appState.trucks) {
      for (const _load of truck.loads) {
        rows.push({
          date: dateSerial,
          rego: truck.rego,
          type: truck.type,
          company: truck.company || '',
          loads: 1,
        });
      }
    }

    if (rows.length > REG_ROWS_PER_DAY) {
      const overflow = rows.length - REG_ROWS_PER_DAY;
      if (!confirm(`You have ${rows.length} loads — one day block fits ${REG_ROWS_PER_DAY}. The first ${REG_ROWS_PER_DAY} will go in Day 1, the remaining ${overflow} will spill into Day 2. Continue?`)) {
        return;
      }
    }

    rows.forEach((r, idx) => {
      const dayIdx = Math.floor(idx / REG_ROWS_PER_DAY);
      const rowInDay = idx % REG_ROWS_PER_DAY;
      const blockStart = REG_DAY_START + dayIdx * REG_BLOCK;
      const rowNum = blockStart + 2 + rowInDay;

      setCell(ws, rowNum, 1, { t: 'n', v: r.date, z: 'd/m/yyyy' });
      if (r.company) setCell(ws, rowNum, 2, { t: 's', v: r.company });
      setCell(ws, rowNum, 3, { t: 's', v: r.rego });
      setCell(ws, rowNum, 4, { t: 's', v: r.type });
      setCell(ws, rowNum, 6, { t: 'n', v: r.loads });
    });

    const outName = `Cartage_Register_${sanitize(appState.project)}_${appState.jobDate}.xlsx`;
    const outBuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    downloadBlob(new Blob([outBuf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), outName);

    closeModal('export-modal');
    setTimeout(() => alert(`Exported as:\n${outName}\n\nLucy can now fill in cartage company, material, tip site, rate paid, and docket numbers.`), 200);
  } catch (err) {
    console.error(err);
    alert('Export failed: ' + err.message);
  }
}

function setCell(ws, row, col, cell) {
  const addr = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
  ws[addr] = { ...ws[addr], ...cell };
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  if (row - 1 > range.e.r) range.e.r = row - 1;
  if (col - 1 > range.e.c) range.e.c = col - 1;
  ws['!ref'] = XLSX.utils.encode_range(range);
}

function toExcelSerial(d) {
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const ms = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - epoch.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

function sanitize(s) {
  return (s || 'Job').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- Reset ----------
function confirmReset() {
  if (!confirm('Reset everything and start fresh? This clears all trucks, loads, and job details.')) return;
  appState = { jobDate: '', client: '', project: '', trucks: [], currentTruckId: null };
  document.getElementById('job-date').valueAsDate = new Date();
  document.getElementById('client').value = '';
  document.getElementById('project').value = '';
  localStorage.removeItem(STORAGE_KEY);
  renderAll();
}

// ---------- Modals ----------
function openModal(id) {
  if (id === 'export-modal') openExportSummary();
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Close modal on backdrop click
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});

// ---------- Field change listeners ----------
['job-date', 'client', 'project'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('change', () => {
    readJobFields();
    saveState();
    renderJobBanner();
  });
  el.addEventListener('input', () => {
    readJobFields();
    renderJobBanner();
  });
});

// ---------- Init ----------
document.getElementById('job-date').valueAsDate = new Date();
loadState();
updateClock();
setInterval(updateClock, 30000);
// Re-render every minute so "minutes ago" timestamps stay fresh
setInterval(() => { if (appState.trucks.length) renderTrucks(); }, 60000);
renderAll();
