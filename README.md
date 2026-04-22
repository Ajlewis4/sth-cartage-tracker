# STH Cartage Counter — v4 (Firebase real-time sync)

Two-role app with live sync between gate (mobile) and office (desktop editor).
One URL, everyone picks their role on open.

## What's new in v4

- **Role picker** on first launch: Gate or Office
- **Firebase Firestore backend** — gate data syncs to office instantly
- **Live office editor** — Lucy fills material, tip site, rate, docket, invoice as trucks come in
- **Toast notifications** — office gets a flash when a new truck is added or load logged
- **Completed register export from office** — no need to wait for gate's end-of-day
- **"End Day" softer than reset** — job goes inactive but stays in Firebase for reference

## Folder contents

```
index.html                      Main UI (all 3 views: picker, gate, office)
firebase-config.js              Firebase initialization with your project keys
app.js                          All app logic
xlsx.full.min.js                SheetJS (bundled for offline export)
manifest.json                   PWA manifest
service-worker.js               Offline cache (excludes Firebase URLs)
logo.jpg                        STH logo
icon-192.png, icon-512.png      PWA icons
Cartage_Register_BLANK.xlsx     Register template
firestore.rules                 Firestore security rules (paste into Firebase Console)
```

## Deploy

Same as v3 — upload all files to the GitHub repo (replacing v3 files). GitHub Pages rebuilds automatically within 1–2 minutes.

## Security rules

Firestore started in "test mode" which expires after 30 days. Before that:

1. Open Firebase Console → Firestore Database → **Rules** tab
2. Delete what's there
3. Paste the contents of `firestore.rules` (from this zip)
4. Click **Publish**

This keeps the app open (no login needed) but stops obviously malformed writes. For stronger security (username/password required), we can add Firebase Auth later — ~30 minutes of work.

## How the data is stored

```
/jobs/{jobId}
  └── date, client, project, active, createdAt
  └── /trucks/{truckId}
      └── type, rego, company, completed, signature, createdAt
      └── /loads/{loadId}
          └── time, timestamp, material, tipSite, ratePaid, docket, invoice, expImp
```

Only ONE job is marked `active: true` at a time. When someone clicks "End Day", it flips to `false` but stays in the database.

## Viewing old jobs

Old jobs aren't browsable in the app yet — just use the Firebase Console → Firestore → `jobs` collection to see them. If you want an in-app "past jobs" view, that's a small addition for later.

## Costs

Firebase free tier is generous: 50k reads, 20k writes, 20k deletes per day. Even with 5 gate staff + 3 office people watching all day, you'd use maybe 2-3k operations daily. Free forever at this volume.
