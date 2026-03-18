# CoLAB OS — Business Operating System

> **Stop Renting. Start Owning.**
> Finance · CRM · Projects · Automations · Reports — in one sovereign, offline-first OS.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-orange.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/version-v11.0.0-green.svg)](https://colabos.store)
[![Built for](https://img.shields.io/badge/built%20for-South%20African%20SMBs-orange)](https://colabos.store)

---

## What is CoLAB OS?

CoLAB OS is an offline-first business operating system for solo operators and small businesses.
Built as a single modular HTML/JS application that runs in the browser or as a native desktop app (Tauri).

**Core modules (this repo — free forever):**

| Module | Pages |
|--------|-------|
| Finance | Dashboard, Wallet, Invoices, Expenses, Proposals |
| Sales | Pipeline, Contacts, Outreach |
| Projects | Projects, Orders & Checklists |
| Apps | Marketplace, Downloads, Settings |

**Pro modules (separate — one-time purchase):**

| Module | Pages |
|--------|-------|
| Workflows | Automation Hub, Integrations (n8n, Twilio, AI) |
| Reports | P&L, Revenue Trends, Tax Estimate |
| Eli AI | AI-powered business co-founder |
| Admin | Platform management |

---

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/colab-os-app.git
cd colab-os-app

# Run (no build step required)
open index.html
# or serve with any static file server:
npx serve .
```

Or use it live at: **[app.colabos.store](https://app.colabos.store)**

---

## Desktop App (Windows)

A native Windows .exe is available at [colabos.store/get](https://colabos.store/get).

To build from source:
```bash
# Requires Rust + Tauri CLI
cargo tauri build
```

---

## Plugin Development

CoLAB OS has a public Plugin SDK for building extensions.

```javascript
window.CoLAB.registerPlugin({
  id:    'my-plugin',
  name:  'My Plugin',
  pages: [{
    id:     'my-page',
    label:  'My Page',
    icon:   '🧩',
    navCat: 'apps',
    render: function() {
      return '<div style="padding:14px"><h2>My Plugin</h2></div>';
    }
  }],
  init: function(api) {
    api.log('My Plugin ready');
  }
});
```

Full SDK docs: [docs.colabos.store](https://docs.colabos.store)

---

## Architecture

```
colab-os-app/          ← This repo (AGPL)
├── index.html         Shell + all CSS
├── js/
│   ├── config.js      Config, feature gates, NAV
│   ├── data.js        Runtime state
│   ├── services.js    Shared logic
│   ├── pages-*.js     Page render functions
│   └── app.js         Boot, router, command palette
├── plugins/
│   └── plugin-sdk.js  Public plugin API (MIT)
└── src-tauri/         Desktop build

colabos-pro/           ← Private repo
├── pages-workflows.js Automation Hub, Integrations
├── pages-reports.js   P&L, Revenue, Tax
├── pages-admin.js     Admin panel
└── ...
```

---

## License

CoLAB OS Core is open-source under [AGPL-3.0](./LICENSE).

> CoLAB OS Core is open-source under AGPL.
> Advanced features, templates, and hosted services are part of **CoLAB OS Pro**.

Pro license: [colabos.store](https://colabos.store) | Contact: labindustries@proton.me

---

## Built by CoLAB

[colabos.store](https://colabos.store) · [docs.colabos.store](https://docs.colabos.store) · [labindustries@proton.me](mailto:labindustries@proton.me)
