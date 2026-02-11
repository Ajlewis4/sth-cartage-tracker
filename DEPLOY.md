# 🚀 Deployment Guide - STH Piling Cartage Tracker

## Quick Deploy to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: **sth-cartage-tracker**
3. Description: "STH Piling Cartage Tracking App"
4. Visibility: **Public**
5. Click **"Create repository"**

### Step 2: Upload Files

**Option A: Web Upload (Easiest)**
1. Click **"uploading an existing file"**
2. Drag and drop ALL these files:
   - ✓ index.html
   - ✓ app.js
   - ✓ manifest.json
   - ✓ service-worker.js
   - ✓ logo.jpg
   - ✓ icon-192.png
   - ✓ icon-512.png
3. Scroll down and click **"Commit changes"**

**Option B: Git Command Line**
```bash
cd sth-cartage-counter
git init
git add .
git commit -m "Initial commit - STH Cartage Tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/sth-cartage-tracker.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. In your repository, click **Settings**
2. Scroll down to **Pages** (in left sidebar)
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main** / (root)
4. Click **Save**
5. Wait 2-3 minutes for deployment

### Step 4: Update File Paths ⚠️ CRITICAL

Your app will be at: `https://YOUR-USERNAME.github.io/sth-cartage-tracker/`

You MUST update these paths:

**📝 Edit app.js (Line 3)**

On GitHub:
1. Click `app.js`
2. Click pencil icon (Edit)
3. Find line 3:
   ```javascript
   navigator.serviceWorker.register('/service-worker.js')
   ```
4. Change to:
   ```javascript
   navigator.serviceWorker.register('/sth-cartage-tracker/service-worker.js')
   ```
5. Click "Commit changes"

**📝 Edit manifest.json (Line 5)**

1. Click `manifest.json`
2. Click pencil icon (Edit)
3. Find line 5:
   ```json
   "start_url": "/"
   ```
4. Change to:
   ```json
   "start_url": "/sth-cartage-tracker/"
   ```
5. Click "Commit changes"

### Step 5: Access Your App

1. Wait 1-2 minutes after edits
2. Visit: `https://YOUR-USERNAME.github.io/sth-cartage-tracker/`
3. App should load with STH logo splash screen

## 📱 Installing on Field Devices

### iPhone/iPad Setup
1. Open Safari (not Chrome!)
2. Go to your app URL
3. Tap **Share** button (box with arrow)
4. Scroll down, tap **"Add to Home Screen"**
5. Name it "STH Tracker"
6. Tap **"Add"**
7. Icon appears on home screen

### Android Setup
1. Open Chrome
2. Go to your app URL
3. Tap menu (three dots ⋮)
4. Tap **"Install app"** or **"Add to Home screen"**
5. Tap **"Install"**
6. Icon appears on home screen

## ✅ Testing Checklist

Before rolling out to workers, test:

- [ ] Splash screen shows logo
- [ ] Can add trucks with all 3 types
- [ ] + button adds load with time
- [ ] = button opens signature pad
- [ ] Signature pad works (draw with finger)
- [ ] Driver signature saves
- [ ] All trucks can complete
- [ ] Complete Job button appears
- [ ] STH signature pad works
- [ ] Email modal opens
- [ ] PDF generates and downloads
- [ ] Volume calculations correct
- [ ] Works offline (turn off wifi and test)

## 🔧 Troubleshooting

### App doesn't load
- **Check URL is correct**
- Wait 5 minutes for GitHub Pages deployment
- Clear browser cache
- Try incognito/private mode

### Service worker not registering
- **Check path in app.js** includes `/sth-cartage-tracker/`
- Check browser console for errors
- GitHub Pages must be enabled

### Icons not showing
- Verify icon files uploaded
- Check manifest.json syntax
- Wait for cache to update

### Signature pad not working
- **Must use touch-enabled device**
- Try different finger/stylus
- Check if canvas element loaded
- Test in different browser

### PDF not generating
- Check browser console errors
- Verify jsPDF loads from CDN
- Try different browser
- Check device storage space

## 🌐 Custom Domain (Optional)

Want `tracker.sthpiling.com.au` instead of GitHub URL?

1. Buy/own domain
2. GitHub Settings → Pages
3. Add custom domain
4. Update DNS records (A or CNAME)
5. Enable HTTPS
6. Update paths in app.js and manifest.json

## 🔒 Security Notes

- App is public (anyone with URL can access)
- Data stored locally on each device
- No authentication required
- For internal use, consider private repository
- For sensitive data, add login/auth

## 📊 Usage Stats (Optional)

Add Google Analytics:
```html
<!-- Add to index.html before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🚀 Going Live

### Roll Out Plan
1. **Deploy to GitHub**
2. **Test thoroughly** on YOUR device
3. **Install on 1-2 field devices** for testing
4. **Test a full day** with real trucks
5. **Review PDF reports** for accuracy
6. **Train all users** (show USAGE.md)
7. **Roll out to all devices**

### Training Tips
- Show on actual device
- Walk through complete workflow
- Practice signatures
- Do a test run with fake data
- Print quick reference card

## 📝 Support

Create a support doc with:
- App URL
- Installation instructions
- Quick usage guide
- Contact for issues
- Screenshots of each step

## 🎉 You're Live!

Your STH Piling Cartage Tracker is now:
- ✅ Deployed to the web
- ✅ Installable on phones
- ✅ Works offline
- ✅ Ready for field use
- ✅ Branded with your logo

URL to share: `https://YOUR-USERNAME.github.io/sth-cartage-tracker/`

---

**Next Steps**: Test, train users, and start tracking!
