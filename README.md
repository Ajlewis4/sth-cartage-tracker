# STH Piling Cartage Tracker

A Progressive Web App for counting and tracking cartage trucks at STH Piling job sites. Features digital signatures, automatic volume calculations, and PDF report generation.

## 🚚 Features

### Core Functionality
- **Splash Screen** - STH Piling logo appears on app launch
- **Job Details** - Track date, client, and project for each job
- **Truck Management** - Add multiple trucks with type and registration
- **Load Counting** - Track each truck's loads with timestamps
- **Real-time Calculations** - Automatic volume calculations based on truck type
- **Digital Signatures** - Driver and STH representative signatures
- **PDF Reports** - Generate and download detailed daily reports

### Truck Types & Capacities
- **Tandem**: 10m³ per load
- **Truck and Trailer**: 22m³ per load
- **Quad**: 30m³ per load

### Workflow
1. Enter job date, client, and project
2. Add trucks (type + registration)
3. Press + button each time truck returns to site
4. View load times and counts in real-time
5. Press = button when truck finishes for the day
6. Driver signs on signature pad
7. When all trucks complete, STH rep signs
8. Enter email address to receive PDF report
9. Report downloads with all details

## 📱 App Screens

### Main Screen
- Job details form (date, client, project)
- Add truck button (+)
- List of all active trucks

### Truck Card
- Truck registration and type
- Load counter
- Last load time display
- All load times list
- + button to add load
- = button to finish truck

### Signature Screens
- Driver signature pad with truck summary
- STH representative signature with job summary
- Clear and save options

### Report
- Complete job details
- Each truck's loads and times
- Total volume calculations (m³)
- Digital signatures

## 🌐 Deploy to GitHub Pages

### Quick Setup

1. **Create Repository**
   ```
   Repository name: sth-cartage-tracker
   Visibility: Public
   ```

2. **Upload Files**
   - index.html
   - app.js
   - manifest.json
   - service-worker.js
   - logo.jpg
   - icon-192.png
   - icon-512.png

3. **Enable GitHub Pages**
   - Settings → Pages
   - Source: main branch
   - Save

4. **Update File Paths**
   
   **In app.js** (line 3):
   ```javascript
   navigator.serviceWorker.register('/sth-cartage-tracker/service-worker.js')
   ```
   
   **In manifest.json** (line 5):
   ```json
   "start_url": "/sth-cartage-tracker/"
   ```

5. **Access App**
   ```
   https://YOUR-USERNAME.github.io/sth-cartage-tracker/
   ```

## 📱 Installation on Devices

### iPhone/iPad
1. Open in Safari
2. Tap Share button
3. "Add to Home Screen"
4. Tap "Add"

### Android
1. Open in Chrome
2. Tap menu (⋮)
3. "Install app"
4. Tap "Install"

## 🎨 Design

### Color Theme
- **Primary**: #2D3748 (Dark Gray/Black)
- **Accent**: #FBBF24 (Yellow)
- **Success**: #10B981 (Green)
- **Danger**: #EF4444 (Red)

Matches the STH Piling logo black and yellow theme.

## 📊 How to Use

### Starting a Job
1. Open app (splash screen shows STH logo)
2. Enter today's date
3. Enter client name
4. Enter project name
5. Press + to add first truck

### Adding Trucks
1. Press + button
2. Select truck type (Tandem/Truck and Trailer/Quad)
3. Enter registration number
4. Press "Add Truck"

### Tracking Loads
1. When truck returns to site, press "+ Add Load"
2. App records the time automatically
3. Load counter increments
4. Last load time displays prominently
5. All load times shown in list

### Finishing a Truck
1. Press "= Finish Day" button
2. Review truck summary (loads, times, volume)
3. Driver signs on signature pad
4. Press "Save Signature"
5. Truck marked as completed

### Completing the Job
1. When all trucks finished, "Complete Job" button appears
2. Press to review full job summary
3. STH representative signs
4. Enter email address
5. PDF report generates and downloads

## 📄 PDF Report Contents

The generated report includes:
- STH Piling header
- Job date, client, project
- Each truck's details:
  - Registration and type
  - All load times
  - Load count
  - Volume (m³)
- Total summary:
  - Total trucks
  - Total loads
  - **Total volume in m³**

## 💾 Data Storage

- All data stored locally on device
- Works completely offline after installation
- No internet required during job
- Data persists until job completion
- New job clears previous data

## 🔧 Customization

### Modify Truck Types
Edit in `app.js`:
```javascript
const TRUCK_CAPACITIES = {
  'Tandem': 10,
  'Truck and Trailer': 22,
  'Quad': 30,
  'Your Type': 25  // Add new types here
};
```

Then add option in `index.html`:
```html
<option value="Your Type">Your Type (25m³)</option>
```

### Change Colors
Edit CSS in `index.html`:
- Primary color: `#2D3748`
- Accent color: `#FBBF24`

### Email Integration
The app currently downloads PDFs. To add email sending:
1. Set up a backend server
2. Send PDF to server endpoint
3. Server sends email via SendGrid/Mailgun/etc.

## 🧪 Testing Locally

```bash
# Python
python -m http.server 8000
# Visit: http://localhost:8000

# Node.js
npx http-server
```

## 📱 Browser Support

- ✅ Chrome (Android & Desktop)
- ✅ Safari (iOS & Desktop)
- ✅ Edge
- ✅ Firefox
- ✅ Samsung Internet

## 🔐 Privacy & Security

- All data stays on user's device
- No external server communication
- Signatures stored as data URLs
- Reports generated client-side
- Complete privacy

## 🚀 Production Features

For production deployment, consider adding:
- Cloud storage backup
- Email server integration
- Multi-user support
- Job history
- Analytics dashboard
- Photo attachments
- GPS location tracking
- Weather conditions
- Job templates

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify all files uploaded to GitHub
3. Confirm paths updated in app.js and manifest.json
4. Test signature functionality on target devices
5. Ensure date/time formats work in your region

## 📦 Files Included

- `index.html` - Main app interface with all screens
- `app.js` - App logic, tracking, signatures, PDF generation
- `manifest.json` - PWA configuration
- `service-worker.js` - Offline functionality
- `logo.jpg` - STH Piling logo
- `icon-192.png` - App icon (192x192)
- `icon-512.png` - App icon (512x512)
- `README.md` - This file
- `USAGE.md` - Quick usage guide

## ✅ Checklist Before Going Live

- [ ] Logo displays correctly
- [ ] All three truck types available
- [ ] Load counter increments properly
- [ ] Times display in correct format
- [ ] Signature pads work on touch devices
- [ ] PDF generates with all data
- [ ] Volume calculations are correct
- [ ] App works offline
- [ ] Installable on iOS and Android
- [ ] Colors match STH branding

---

**STH Piling Cartage Tracker** - Professional truck counting and volume tracking for construction sites.
