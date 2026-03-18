# CoLAB OS Pro — Private Module

> This is a private repository. Do not share, fork, or distribute.

## What this repo contains

Pro modules that extend CoLAB OS Core with paid functionality:

| File | Feature |
|------|---------|
| `pages-workflows.js` | Automation Hub, Automations, Web Intake, Integrations |
| `pages-reports.js` | P&L Overview, Revenue Trends, Tax Estimator |
| `pages-admin.js` | Platform Admin, User Management, System |
| `pages-eli.js` | Eli AI Assistant (Claude + OpenAI) |
| `templates/` | Industry-specific OS setups |
| `license-server/` | Lemon Squeezy webhook + key validation |

## How it connects to Core

1. User purchases via Lemon Squeezy → webhook fires
2. `license-server/` validates and returns a signed key
3. Key is stored in `localStorage` on user's device
4. `CONFIG.activatePro(key)` opens `window.CoLAB._gates.pro = true`
5. App re-renders — Pro pages now accessible

## File placement

Pro files are loaded **after** Core files in `index.html`:

```html
<!-- Core -->
<script src="js/config.js"></script>
...
<script src="js/app.js"></script>

<!-- Pro (loaded dynamically after license check, or included in Pro build) -->
<script src="pro/pages-workflows.js"></script>
<script src="pro/pages-reports.js"></script>
<script src="pro/pages-admin.js"></script>
<script src="pro/pro-boot.js"></script>
```

## License

Proprietary. All rights reserved. © 2026 CoLAB.
