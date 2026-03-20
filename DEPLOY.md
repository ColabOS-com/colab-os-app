# CoLAB OS v11 — Deployment Guide

## FOLDER STRUCTURE

```
colab-os-v11/
├── index.html          ← The app (entry point)
├── get.html            ← Interstitial: "Run in Browser / Download"
├── js/
│   ├── config.js
│   ├── data.js
│   ├── services.js
│   ├── pages-finance.js
│   ├── pages-sales.js
│   ├── pages-projects.js
│   ├── pages-workflows.js
│   ├── pages-reports.js
│   ├── pages-apps.js
│   ├── pages-admin.js
│   └── app.js
├── src-tauri/          ← Desktop build (Tauri)
│   ├── tauri.conf.json
│   ├── Cargo.toml
│   ├── build.rs
│   ├── src/
│   │   └── main.rs
│   └── icons/          ← Add your icons here (see step 7)
├── .gitignore
└── DEPLOY.md           ← This file
```

---

## PHASE 1 — WEB APP (app.colabos.store)

### Step 1 — Push to GitHub

Open terminal in the colab-os-v11 folder, then run:

```bash
git init
git add .
git commit -m "CoLAB OS v11 — initial release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/colab-os-app.git
git push -u origin main
```

Replace YOUR_USERNAME with your GitHub username.
Create the repo at github.com/new first — name it: colab-os-app
Keep it Public. No README (we already have files).

---

### Step 2 — Deploy to Vercel

1. Go to vercel.com → Add New Project
2. Import the colab-os-app repo
3. Settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
4. Click Deploy

Vercel will give you a URL like: colab-os-app.vercel.app

---

### Step 3 — Add custom domain in Vercel

1. In Vercel project → Settings → Domains
2. Add domain: app.colabos.store
3. Vercel will show you a CNAME record to add

---

### Step 4 — Add DNS record in Cloudflare

1. Log into Cloudflare → colabos.store → DNS
2. Add record:
   - Type: CNAME
   - Name: app
   - Target: cname.vercel-dns.com
   - Proxy: OFF (grey cloud) ← important
3. Save

Wait 1-2 minutes. https://app.colabos.store will be live.

---

### Step 5 — Add get.html to marketing site

Copy get.html into your colabos.store repo (same repo as your landing page).
Commit and push. It will be live at:
  https://colabos.store/get

Then update every CTA button on colabos.store to point to:
  href="https://colabos.store/get"

---

## PHASE 2 — DESKTOP APP (Windows .exe)

### Step 6 — Install Rust

Open PowerShell as Administrator and run:

```powershell
winget install --id Rustlang.Rustup
```

If winget is not available, go to: https://rustup.rs
Click the download link, run the installer, choose option 1 (default install).

After install, close and reopen PowerShell, then verify:

```powershell
rustc --version
cargo --version
```

Both should print version numbers.

---

### Step 7 — Install Tauri CLI dependencies

Still in PowerShell, run:

```powershell
cargo install tauri-cli
```

This takes 3-5 minutes. It downloads and compiles the Tauri CLI.

Also install the Visual C++ build tools if not already installed:
```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

Verify Tauri:
```powershell
cargo tauri --version
```

---

### Step 8 — Add app icons

Tauri needs icons in src-tauri/icons/.
The easiest way:

Option A — Use Tauri's icon generator:
```powershell
cargo tauri icon path\to\your-logo.png
```
This generates all required sizes from a single 1024x1024 PNG.
Place your CoLAB logo PNG in the folder first.

Option B — Use placeholder icons for now:
Download the sample icons from:
  https://github.com/tauri-apps/tauri/tree/dev/examples/api/src-tauri/icons
Copy them into src-tauri/icons/

---

### Step 9 — Build the .exe

Navigate to the colab-os-v11 folder in PowerShell:

```powershell
cd C:\path\to\colab-os-v11
cargo tauri build
```

This takes 5-10 minutes on first build (compiles Rust dependencies).
Subsequent builds are much faster.

Output location:
```
src-tauri/target/release/bundle/msi/CoLAB OS_11.0.0_x64_en-US.msi
src-tauri/target/release/bundle/nsis/CoLAB OS_11.0.0_x64-setup.exe
```

The .exe is standalone — users double-click it to install CoLAB OS.

---

### Step 10 — Upload .exe to Cloudflare / hosting

Once built, upload the .exe to:
  Your Cloudflare R2 bucket, or
  GitHub Releases, or
  Any static file host

Then update get.html line:
```javascript
var DOWNLOAD_URL = 'https://your-host.com/CoLAB-OS-v11-Setup.exe';
```

Commit and push. The download button on colabos.store/get will now serve the file.

---

## QUICK REFERENCE — URLs after deployment

| URL | What it is |
|-----|-----------|
| https://colabos.store | Marketing landing page (existing) |
| https://colabos.store/get | "Run in Browser / Download" interstitial |
| https://app.colabos.store | CoLAB OS v11 web app |
| https://docs.colabos.store | Docs (set up separately) |

---

## UPDATING THE APP

After any code change:

```bash
git add .
git commit -m "describe your change"
git push
```

Vercel auto-deploys within 30 seconds.
For desktop, re-run `cargo tauri build` and upload the new .exe.

