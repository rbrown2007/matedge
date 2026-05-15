# MatEdge ⚡
### Elite Wrestling Weight & Nutrition Management

---

## Running Locally (PWA)

PWA features (install prompt, offline mode) require the app to be served over HTTP — not opened as a plain file. This takes 30 seconds to set up.

### Option A — Node.js (recommended)

1. Install Node.js from https://nodejs.org if you don't have it
2. Open a terminal in this folder
3. Run: `node server.js`
4. Open: http://localhost:3000

The terminal will also print a **Network URL** (e.g. `http://192.168.1.x:3000`). Open that on your phone (on the same Wi-Fi) to test mobile.

### Option B — Python (no install needed on Mac/Linux)

```bash
python3 -m http.server 3000
```
Then open: http://localhost:3000

### Option C — VS Code Live Server

Install the "Live Server" extension, right-click `index.html` → "Open with Live Server".

---

## Installing as a PWA

### Android (Chrome)
1. Open the Network URL on your phone
2. Tap the **"Install"** banner that appears, or tap the 3-dot menu → "Add to Home Screen"

### iPhone (Safari)
iOS doesn't support the automatic install prompt — users must add manually:
1. Open the URL in **Safari** (not Chrome)
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**

### Windows / macOS (Chrome or Edge)
1. Open http://localhost:3000
2. Click the install icon (⊕) in the browser address bar, or
3. Chrome menu → "Save and Share" → "Install MatEdge"

---

## Next Step: Capacitor (True Native App)

Capacitor wraps this web app into a real native app for App Store / Google Play.

### Prerequisites
- Node.js: https://nodejs.org
- Android: Android Studio — https://developer.android.com/studio
- iOS (Mac only): Xcode from the Mac App Store

### Setup

```bash
# 1. Install Capacitor in this folder
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# 2. Initialize Capacitor
npx cap init MatEdge com.matedge.app --web-dir .

# 3. Add platforms
npx cap add android
npx cap add ios        # Mac only

# 4. Sync web files into the native project
npx cap sync

# 5a. Open in Android Studio
npx cap open android

# 5b. Open in Xcode (Mac only)
npx cap open ios
```

From Android Studio / Xcode you can run on a simulator or real device, and eventually submit to the app stores.

### Updating the app after changes
```bash
npx cap sync
```
That's it — re-run this any time you edit `index.html`, `sw.js`, or `manifest.json`.

---

## Project Structure

```
matedge/
├── index.html        ← Main app (all UI + logic)
├── manifest.json     ← PWA manifest (name, icons, theme)
├── sw.js             ← Service worker (offline caching)
├── server.js         ← Local dev server (Node.js)
├── icons/            ← App icons (all sizes)
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── README.md         ← This file
```

---

## Data & Privacy

All data is stored locally on the device using `localStorage`. Nothing is sent to any server. Data persists between sessions automatically.

---

*Always work with a certified sports dietitian before following any nutrition or supplement protocol.*
