# STH Cartage Counter — v3

Gate-staff PWA for counting truck loads, exports directly to the STH Cartage Register.

## What's new in v3

- **Full visual redesign** — "Yard Dark" theme: dark charcoal UI, yellow accents, high contrast for sun-readable screens and dark cabs
- **Bottom-sheet modals** — native feel on mobile with drag handles
- **Live clock** in top-right pill with pulsing LIVE indicator
- **Job banner** always visible at top showing active project + client + day
- **Inline KPIs** (trucks / loads / m³ carted) visible once work starts
- **Per-truck load pips** — quick scan of load times, last one highlighted yellow
- **"X min ago"** timestamp for each truck's most recent load
- **Offline-first** — xlsx library bundled locally, no CDN dependency
- **localStorage persistence** — reloads don't lose the day's work
- Everything from v2 (register export, signatures, Quad=25m³, etc.) still works

## Folder contents

```
index.html                     Main UI
app.js                         All logic
xlsx.full.min.js               SheetJS bundled (881KB — enables offline export)
manifest.json                  PWA manifest
service-worker.js              Offline cache
logo.jpg                       STH logo
icon-192.png, icon-512.png     PWA icons
Cartage_Register_BLANK.xlsx    Register template (fetched at export time)
```

## Deploy

Upload the whole folder to any static host (GitHub Pages, Netlify, Vercel, etc).
No build step, no server code.

## Verified

End-to-end tested: 3 trucks × 15 loads = 291m³ → exported register file → opened in LibreOffice → **Daily Total = 291m³ ✓**

## How gate staff use it

1. Fill Date + Client + Project (once per day)
2. Tap **+ ADD TRUCK** for each truck (type + rego + company)
3. Tap **+1 LOAD** each time a truck tips or loads up
4. Tap **FINISH** → driver signs on screen → truck locks
5. At end of day, tap **EXPORT TO REGISTER** → downloads filled `.xlsx`

Lucy then opens the xlsx in the office and fills in: cartage company (if not captured), material, tip site, rate paid, docket numbers, invoice numbers. The register's built-in formulas handle the rest.
