// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sth-cartage-tracker/service-worker.js')
      .then(reg => console.log('ServiceWorker registered'))
      .catch(err => console.log('ServiceWorker registration failed:', err));
  });
}

// Splash Screen
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('app').classList.add('visible');
  }, 2000);
});

// App State
let appState = {
  jobDate: '',
  client: '',
  project: '',
  trucks: [],
  currentTruckId: null,
  driverSignatures: {},
  sthSignature: null
};

// Set default date
document.getElementById('job-date').valueAsDate = new Date();

// Truck capacities in m³
const TRUCK_CAPACITIES = {
  'Tandem': 10,
  'Truck and Trailer': 22,
  'Quad': 30
};

// Generate unique ID
function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Format time
function formatTime(date) {
  return date.toLocaleTimeString('en-AU', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

// Add Truck
function addTruck() {
  const date = document.getElementById('job-date').value;
  const client = document.getElementById('client').value;
  const project = document.getElementById('project').value;
  
  if (!date || !client || !project) {
    alert('Please fill in Job Date, Client, and Project before adding trucks');
    return;
  }
  
  appState.jobDate = date;
  appState.client = client;
  appState.project = project;
  
  openModal('add-truck-modal');
}

// Save Truck
function saveTruck() {
  const type = document.getElementById('truck-type').value;
  const rego = document.getElementById('truck-rego').value.toUpperCase();
  
  if (!type || !rego) {
    alert('Please select truck type and enter registration');
    return;
  }
  
  const truck = {
    id: generateId(),
    type: type,
    rego: rego,
    loads: [],
    completed: false,
    signature: null
  };
  
  appState.trucks.push(truck);
  
  // Clear form
  document.getElementById('truck-type').value = '';
  document.getElementById('truck-rego').value = '';
  
  closeModal('add-truck-modal');
  renderTrucks();
  updateCompleteButton();
}

// Render Trucks
function renderTrucks() {
  const container = document.getElementById('trucks-container');
  
  if (appState.trucks.length === 0) {
    container.innerHTML = '<div class="empty-state">No trucks added yet. Click + to add a truck.</div>';
    return;
  }
  
  container.innerHTML = appState.trucks.map(truck => {
    const loadCount = truck.loads.length;
    const lastLoad = truck.loads.length > 0 ? truck.loads[truck.loads.length - 1] : null;
    
    if (truck.completed) {
      return `
        <div class="truck-item">
          <div class="truck-header">
            <div>
              <div class="truck-title">${truck.rego}</div>
              <div style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">
                ${truck.type} (${TRUCK_CAPACITIES[truck.type]}m³)
              </div>
            </div>
            <div class="completed-badge">✓ Completed</div>
          </div>
          
          <div class="load-counter">
            <div class="load-count">${loadCount}</div>
            <div class="load-label">Total Loads</div>
          </div>
          
          <div class="summary-total">
            ${loadCount * TRUCK_CAPACITIES[truck.type]}m³ Total
          </div>
        </div>
      `;
    }
    
    return `
      <div class="truck-item">
        <div class="truck-header">
          <div>
            <div class="truck-title">${truck.rego}</div>
            <div style="font-size: 0.85rem; color: #718096; margin-top: 0.25rem;">
              ${truck.type} (${TRUCK_CAPACITIES[truck.type]}m³)
            </div>
          </div>
          <button class="btn btn-danger" style="padding: 0.5rem 1rem;" onclick="removeTruck('${truck.id}')">Remove</button>
        </div>
        
        <div class="load-counter">
          <div class="load-count">${loadCount}</div>
          <div class="load-label">Loads</div>
        </div>
        
        ${lastLoad ? `
          <div class="last-load">
            <div class="last-load-label">Last Load</div>
            <div class="last-load-time">${lastLoad.time}</div>
          </div>
        ` : ''}
        
        ${truck.loads.length > 0 ? `
          <div class="time-list">
            ${truck.loads.map((load, idx) => `
              <div class="time-item">
                <span><strong>Load ${idx + 1}</strong></span>
                <span>${load.time}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="truck-controls">
          <button class="btn btn-yellow btn-large" onclick="addLoad('${truck.id}')">
            + Add Load
          </button>
          <button class="btn btn-success btn-large" onclick="finishTruck('${truck.id}')">
            = Finish Day
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Add Load to Truck
function addLoad(truckId) {
  const truck = appState.trucks.find(t => t.id === truckId);
  if (!truck) return;
  
  const now = new Date();
  truck.loads.push({
    time: formatTime(now),
    timestamp: now.getTime()
  });
  
  renderTrucks();
  updateCompleteButton();
}

// Remove Truck
function removeTruck(truckId) {
  if (confirm('Remove this truck?')) {
    appState.trucks = appState.trucks.filter(t => t.id !== truckId);
    renderTrucks();
    updateCompleteButton();
  }
}

// Finish Truck
function finishTruck(truckId) {
  const truck = appState.trucks.find(t => t.id === truckId);
  if (!truck) return;
  
  if (truck.loads.length === 0) {
    alert('Cannot finish truck with no loads. Add at least one load or remove the truck.');
    return;
  }
  
  appState.currentTruckId = truckId;
  
  // Show summary
  const capacity = TRUCK_CAPACITIES[truck.type];
  const totalCubes = truck.loads.length * capacity;
  
  const summaryHtml = `
    <div class="truck-summary">
      <div class="summary-row">
        <span><strong>Truck:</strong></span>
        <span>${truck.rego}</span>
      </div>
      <div class="summary-row">
        <span><strong>Type:</strong></span>
        <span>${truck.type}</span>
      </div>
      <div class="summary-row">
        <span><strong>Loads:</strong></span>
        <span>${truck.loads.length}</span>
      </div>
      <div class="summary-row">
        <span><strong>Total Volume:</strong></span>
        <span>${totalCubes}m³</span>
      </div>
    </div>
    
    <div class="summary-title">Load Times:</div>
    <div class="time-list">
      ${truck.loads.map((load, idx) => `
        <div class="time-item">
          <span>Load ${idx + 1}</span>
          <span>${load.time}</span>
        </div>
      `).join('')}
    </div>
  `;
  
  document.getElementById('driver-summary').innerHTML = summaryHtml;
  openModal('driver-signature-modal');
  initializeSignaturePad('driver');
}

// Signature Pads
let driverPad = null;
let sthPad = null;

function initializeSignaturePad(type) {
  const canvas = document.getElementById(type === 'driver' ? 'driver-signature-pad' : 'sth-signature-pad');
  const ctx = canvas.getContext('2d');
  
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  // Clear canvas
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }
  
  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
  }
  
  function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const coords = getCoordinates(e);
    
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    lastX = coords.x;
    lastY = coords.y;
  }
  
  function stopDrawing() {
    isDrawing = false;
  }
  
  // Mouse events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // Touch events
  canvas.addEventListener('touchstart', startDrawing);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', stopDrawing);
  
  if (type === 'driver') {
    driverPad = { canvas, ctx };
  } else {
    sthPad = { canvas, ctx };
  }
}

function clearSignature(type) {
  const pad = type === 'driver' ? driverPad : sthPad;
  if (pad) {
    pad.ctx.fillStyle = 'white';
    pad.ctx.fillRect(0, 0, pad.canvas.width, pad.canvas.height);
  }
}

function isCanvasBlank(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255) {
      return false;
    }
  }
  return true;
}

function saveDriverSignature() {
  const canvas = document.getElementById('driver-signature-pad');
  
  if (isCanvasBlank(canvas)) {
    alert('Please provide a signature');
    return;
  }
  
  const truck = appState.trucks.find(t => t.id === appState.currentTruckId);
  if (!truck) return;
  
  truck.signature = canvas.toDataURL();
  truck.completed = true;
  
  closeModal('driver-signature-modal');
  renderTrucks();
  updateCompleteButton();
  
  appState.currentTruckId = null;
}

// Update Complete Button
function updateCompleteButton() {
  const container = document.getElementById('complete-job-container');
  const allCompleted = appState.trucks.length > 0 && 
                       appState.trucks.every(t => t.completed);
  
  container.style.display = allCompleted ? 'block' : 'none';
}

// Complete Job
function completeJob() {
  const allCompleted = appState.trucks.every(t => t.completed);
  
  if (!allCompleted) {
    alert('All trucks must be completed before finishing the job');
    return;
  }
  
  // Show STH summary
  const totalLoads = appState.trucks.reduce((sum, t) => sum + t.loads.length, 0);
  const totalCubes = appState.trucks.reduce((sum, t) => {
    return sum + (t.loads.length * TRUCK_CAPACITIES[t.type]);
  }, 0);
  
  const summaryHtml = `
    <div class="summary-title">Job Summary</div>
    <div class="truck-summary">
      <div class="summary-row">
        <span><strong>Date:</strong></span>
        <span>${new Date(appState.jobDate).toLocaleDateString('en-AU')}</span>
      </div>
      <div class="summary-row">
        <span><strong>Client:</strong></span>
        <span>${appState.client}</span>
      </div>
      <div class="summary-row">
        <span><strong>Project:</strong></span>
        <span>${appState.project}</span>
      </div>
      <div class="summary-row">
        <span><strong>Total Trucks:</strong></span>
        <span>${appState.trucks.length}</span>
      </div>
      <div class="summary-row">
        <span><strong>Total Loads:</strong></span>
        <span>${totalLoads}</span>
      </div>
    </div>
    
    <div class="summary-total">
      Total Volume: ${totalCubes}m³
    </div>
    
    <div class="summary-title" style="margin-top: 1.5rem;">Trucks</div>
    ${appState.trucks.map(truck => `
      <div class="truck-summary">
        <div class="summary-row">
          <span><strong>${truck.rego}</strong></span>
          <span>${truck.type}</span>
        </div>
        <div class="summary-row">
          <span>Loads:</span>
          <span>${truck.loads.length}</span>
        </div>
        <div class="summary-row">
          <span>Volume:</span>
          <span>${truck.loads.length * TRUCK_CAPACITIES[truck.type]}m³</span>
        </div>
      </div>
    `).join('')}
  `;
  
  document.getElementById('sth-summary').innerHTML = summaryHtml;
  openModal('sth-signature-modal');
  initializeSignaturePad('sth');
}

function saveSTHSignature() {
  const canvas = document.getElementById('sth-signature-pad');
  
  if (isCanvasBlank(canvas)) {
    alert('Please provide a signature');
    return;
  }
  
  appState.sthSignature = canvas.toDataURL();
  
  closeModal('sth-signature-modal');
  openModal('email-modal');
}

// Send Report
async function sendReport() {
  const email = document.getElementById('email-address').value;
  
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }
  
  closeModal('email-modal');
  alert('Generating and sending report...');
  
  // Generate PDF
  const pdf = await generatePDF();
  const pdfBase64 = pdf.output('datauristring').split(',')[1];
  
  // Calculate totals
  const totalLoads = appState.trucks.reduce((sum, t) => sum + t.loads.length, 0);
  const totalCubes = appState.trucks.reduce((sum, t) => {
    return sum + (t.loads.length * TRUCK_CAPACITIES[t.type]);
  }, 0);
  
  // Send via EmailJS
  emailjs.send(service_yjm4216,template_hvydyw3 , {
    to_email: email,
    date: appState.jobDate,
    client: appState.client,
    project: appState.project,
    total_trucks: appState.trucks.length,
    total_loads: totalLoads,
    total_cubes: totalCubes,
    pdf_attachment: pdfBase64,
    filename: `STH_Cartage_Report_${appState.jobDate}.pdf`
  })
  .then(() => {
    alert(`Report sent successfully to ${email}!`);
    if (confirm('Job completed! Start a new job?')) {
      resetApp();
    }
  })
  .catch((error) => {
    console.error('Email error:', error);
    alert('Failed to send email. PDF has been downloaded instead.');
    
    // Fallback: download PDF
    const url = URL.createObjectURL(pdf.output('blob'));
    const a = document.createElement('a');
    a.href = url;
    a.download = `STH_Cartage_Report_${appState.jobDate}.pdf`;
    a.click();
  });
}
  
  // Generate PDF
  const pdf = await generatePDF();
  
  // In a real app, you'd send this to a backend server
  // For now, we'll download it
  const pdfBlob = pdf.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `STH_Cartage_Report_${appState.jobDate}_${appState.project.replace(/\s+/g, '_')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  
  alert(`Report generated! In production, this would be sent to ${email}\n\nFor now, the PDF has been downloaded to your device.`);
  
  // Reset app
  if (confirm('Job completed! Start a new job?')) {
    resetApp();
  }
}

// Generate PDF
async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let y = 20;
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(45, 55, 72);
  doc.text('STH PILING', 105, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(16);
  doc.text('Cartage Report', 105, y, { align: 'center' });
  
  y += 15;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  // Job Details
  doc.text(`Date: ${new Date(appState.jobDate).toLocaleDateString('en-AU')}`, 20, y);
  y += 8;
  doc.text(`Client: ${appState.client}`, 20, y);
  y += 8;
  doc.text(`Project: ${appState.project}`, 20, y);
  
  y += 15;
  
  // Trucks
  doc.setFontSize(14);
  doc.setTextColor(45, 55, 72);
  doc.text('Truck Details', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  for (const truck of appState.trucks) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`${truck.rego} - ${truck.type}`, 20, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Capacity: ${TRUCK_CAPACITIES[truck.type]}m³`, 25, y);
    y += 6;
    doc.text(`Total Loads: ${truck.loads.length}`, 25, y);
    y += 6;
    doc.text(`Total Volume: ${truck.loads.length * TRUCK_CAPACITIES[truck.type]}m³`, 25, y);
    y += 8;
    
    doc.text('Load Times:', 25, y);
    y += 6;
    
    truck.loads.forEach((load, idx) => {
      doc.text(`  Load ${idx + 1}: ${load.time}`, 30, y);
      y += 5;
    });
    
    y += 8;
  }
  
  // Total Summary
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  
  const totalLoads = appState.trucks.reduce((sum, t) => sum + t.loads.length, 0);
  const totalCubes = appState.trucks.reduce((sum, t) => {
    return sum + (t.loads.length * TRUCK_CAPACITIES[t.type]);
  }, 0);
  
  doc.setFillColor(251, 191, 36);
  doc.rect(15, y - 5, 180, 20, 'F');
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(45, 55, 72);
  doc.text(`TOTAL VOLUME: ${totalCubes}m³`, 105, y + 5, { align: 'center' });
  
  y += 20;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Trucks: ${appState.trucks.length}`, 20, y);
  y += 6;
  doc.text(`Total Loads: ${totalLoads}`, 20, y);
  
  // Signatures (if needed, you could add signature images here)
  
  return doc;
}

// Modal Controls
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Reset App
function resetApp() {
  appState = {
    jobDate: '',
    client: '',
    project: '',
    trucks: [],
    currentTruckId: null,
    driverSignatures: {},
    sthSignature: null
  };
  
  document.getElementById('job-date').valueAsDate = new Date();
  document.getElementById('client').value = '';
  document.getElementById('project').value = '';
  
  renderTrucks();
  updateCompleteButton();
}

// Initialize
renderTrucks();
