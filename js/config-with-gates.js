/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — config.js
   Global configuration layer. Loaded first by index.html.
   Rules: no UI, no DOM, no async, no side effects.
═══════════════════════════════════════════════════════════ */

'use strict';

const CONFIG = {};

/* ── 1. PLATFORM INFORMATION ─────────────────────────────── */
CONFIG.PLATFORM = {
  name:    'COLAB-OS',
  version: 'v11',
  build:   'production',
  mode:    'local',          /* local | hybrid | cloud */
};

/* ── 2. WEBSITE URLS ─────────────────────────────────────── */
CONFIG.WEBSITE = {
  home:        'https://colabos.store',
  docs:        'https://docs.colabos.store',
  support:     'https://colabos.store/support',
  marketplace: 'https://colabos.store/marketplace',
  downloads:   'https://colabos.store/downloads',
  portal:      'https://my.colabos.store',
};

/* ── 3. BILLING / PAYMENTS (Lemon Squeezy) ──────────────── */
CONFIG.BILLING = {
  provider:         'lemonsqueezy',
  starterUnlock:    'https://colab.lemonsqueezy.com/checkout/buy/starter-pack',
  growthUnlock:     'https://colab.lemonsqueezy.com/checkout/buy/growth-pack',
  automationUnlock: 'https://colab.lemonsqueezy.com/checkout/buy/automation-hub',
  operatorUnlock:   'https://colab.lemonsqueezy.com/checkout/buy/full-operator',
};

/* ── 4. CURRENCIES ───────────────────────────────────────── */
CONFIG.CURRENCIES = [
  { code: 'ZAR', symbol: 'R',  label: 'South African Rand', flag: '🇿🇦' },
  { code: 'USD', symbol: '$',  label: 'US Dollar',          flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',  label: 'Euro',               flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',  label: 'British Pound',      flag: '🇬🇧' },
  { code: 'MXN', symbol: '$',  label: 'Mexican Peso',       flag: '🇲🇽' },
];

/* ── 5. APPLICATION LIMITS ───────────────────────────────── */
CONFIG.LIMITS = {
  maxContacts:    10000,
  maxInvoices:    50000,
  maxProjects:    10000,
  maxAutomations:   500,
  maxProducts:     1000,
  maxActivityLog:   500,   /* max entries kept in activity feed */
  toastDuration:   3500,   /* ms before toast auto-dismisses */
};

/* ── 6. FEATURE FLAGS ────────────────────────────────────── */
CONFIG.FEATURES = {
  automations:    true,
  aiAssistant:    true,
  integrations:   true,
  marketplace:    true,
  adminPanel:     true,
  lightMode:      true,
  commandPalette: true,
  activityFeed:   true,
  smartInsights:  true,
  documentImport: true,
};

/* ── 7. DEFAULT USER SETTINGS ────────────────────────────── */
CONFIG.DEFAULTS = {
  currency: 'ZAR',
  theme:    'dark',       /* dark | light */
  language: 'en',
  wsMode:   'command',    /* command | focus */
};

/* ── 8. BUSINESS DEFAULTS (editable in onboarding) ─────── */
CONFIG.BUSINESS = {
  name:    'CoLAB',
  email:   'labindustries@proton.me',
  vat:     '',
  phone:   '',
  country: 'ZA',
};

/* ── 9. INTEGRATION PROVIDER DEFINITIONS ────────────────── */
CONFIG.INTEGRATIONS = {
  n8n: {
    id: 'n8n', label: 'n8n', badge: 'WORKFLOW ENGINE', icon: '⚡', color: '#f97316',
    docs: 'https://docs.n8n.io/hosting/',
    envKeys: ['N8N_BASE_URL', 'N8N_API_KEY'],
    fields: [
      { key: 'baseUrl', label: 'Instance URL', placeholder: 'https://n8n.yourdomain.com', type: 'text'     },
      { key: 'apiKey',  label: 'n8n API Key',  placeholder: 'n8n_api_...',                type: 'password' },
    ],
  },
  claude: {
    id: 'claude', label: 'Claude API', badge: 'AI ENGINE', icon: '✦', color: '#a78bfa',
    docs: 'https://docs.anthropic.com',
    envKeys: ['ANTHROPIC_API_KEY'],
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'sk-ant-...',                  type: 'password' },
      { key: 'model',  label: 'Model',   placeholder: 'claude-sonnet-4-20250514', type: 'text'     },
    ],
  },
  openai: {
    id: 'openai', label: 'OpenAI', badge: 'AI ENGINE', icon: '🤖', color: '#10a37f',
    docs: 'https://platform.openai.com/docs',
    envKeys: ['OPENAI_API_KEY'],
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'sk-proj-...', type: 'password' },
      { key: 'model',  label: 'Model',   placeholder: 'gpt-4o',      type: 'text'     },
    ],
  },
  lemonsqueezy: {
    id: 'lemonsqueezy', label: 'Lemon Squeezy', badge: 'STOREFRONT', icon: '🍋', color: '#facc15',
    docs: 'https://docs.lemonsqueezy.com',
    envKeys: ['LS_STORE_ID', 'LS_API_KEY', 'LS_WEBHOOK_SECRET'],
    fields: [
      { key: 'storeId',       label: 'Store ID',       placeholder: 'your-store-slug', type: 'text'     },
      { key: 'apiKey',        label: 'API Key',         placeholder: 'eyJ...',          type: 'password' },
      { key: 'webhookSecret', label: 'Webhook Secret',  placeholder: 'lmsh_...',        type: 'password' },
    ],
  },
  make: {
    id: 'make', label: 'Make.com', badge: 'AUTOMATION', icon: '◈', color: '#60a5fa',
    docs: 'https://www.make.com/en/help/scenarios/webhooks',
    envKeys: ['MAKE_WEBHOOK_URL'],
    fields: [
      { key: 'webhookUrl', label: 'Scenario Webhook URL', placeholder: 'https://hook.make.com/...', type: 'text' },
    ],
  },
  twilio: {
    id: 'twilio', label: 'Twilio / WhatsApp', badge: 'MESSAGING', icon: '💬', color: '#4ade80',
    docs: 'https://www.twilio.com/docs/whatsapp',
    envKeys: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM'],
    fields: [
      { key: 'accountSid', label: 'Account SID',    placeholder: 'ACxxxxxxxxxxxxxxxx',    type: 'text'     },
      { key: 'authToken',  label: 'Auth Token',      placeholder: '••••••••••••',          type: 'password' },
      { key: 'fromNumber', label: 'WhatsApp Number', placeholder: 'whatsapp:+1415XXXXXXX', type: 'text'     },
    ],
  },
  stripe: {
    id: 'stripe', label: 'Stripe', badge: 'PAYMENTS', icon: '💳', color: '#818cf8',
    docs: 'https://stripe.com/docs/webhooks',
    envKeys: ['STRIPE_WEBHOOK_SECRET'],
    listenEvents: ['invoice.paid', 'checkout.session.completed', 'payment_intent.failed'],
    fields: [
      { key: 'webhookSecret', label: 'Webhook Signing Secret', placeholder: 'whsec_...', type: 'password' },
    ],
  },
  supabase: {
    id: 'supabase', label: 'Supabase', badge: 'DATABASE', icon: '🗄', color: '#34d399',
    docs: 'https://supabase.com/docs',
    envKeys: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY'],
    fields: [
      { key: 'url',        label: 'Project URL',      placeholder: 'https://xxxx.supabase.co', type: 'text'     },
      { key: 'anonKey',    label: 'Anon Key',         placeholder: 'eyJ...',                   type: 'password' },
      { key: 'serviceKey', label: 'Service Role Key', placeholder: 'eyJ...',                   type: 'password' },
    ],
  },
};

/* ── 10. STATUS PILL STYLES ──────────────────────────────── */
CONFIG.STATUS_STYLES = {
  paid:          { bg: 'rgba(34,197,94,.12)',   color: '#4ade80' },
  active:        { bg: 'rgba(34,197,94,.12)',   color: '#4ade80' },
  complete:      { bg: 'rgba(34,197,94,.12)',   color: '#4ade80' },
  live:          { bg: 'rgba(34,197,94,.12)',   color: '#4ade80' },
  overdue:       { bg: 'rgba(239,68,68,.12)',   color: '#f87171' },
  error:         { bg: 'rgba(239,68,68,.12)',   color: '#f87171' },
  suspended:     { bg: 'rgba(239,68,68,.12)',   color: '#f87171' },
  sent:          { bg: 'rgba(249,115,22,.12)',  color: '#fb923c' },
  reminded:      { bg: 'rgba(96,165,250,.12)',  color: '#60a5fa' },
  'in-progress': { bg: 'rgba(249,115,22,.12)',  color: '#fb923c' },
  draft:         { bg: 'rgba(255,255,255,.07)', color: '#a1a1aa' },
  paused:        { bg: 'rgba(255,255,255,.07)', color: '#a1a1aa' },
  pending:       { bg: 'rgba(255,255,255,.07)', color: '#a1a1aa' },
  planning:      { bg: 'rgba(167,139,250,.12)', color: '#a78bfa' },
};

/* ── HELPERS ─────────────────────────────────────────────── */

/* Get currency object by code */
CONFIG.getCurrency = function(code) {
  return CONFIG.CURRENCIES.find(function(c) { return c.code === code; }) || CONFIG.CURRENCIES[0];
};

/* Get status pill style by status string */
CONFIG.getStatus = function(status) {
  return CONFIG.STATUS_STYLES[status] || CONFIG.STATUS_STYLES['draft'];
};

/* Get integration definition by id */
CONFIG.getIntegration = function(id) {
  return CONFIG.INTEGRATIONS[id] || null;
};

/* Get all integration definitions as an array */
CONFIG.getIntegrationList = function() {
  return Object.values(CONFIG.INTEGRATIONS);
};

/* ═══════════════════════════════════════════════════════════
   NAVIGATION STRUCTURE
   Defines sidebar categories and page routing.
   Each entry maps to a page render function in page modules.
═══════════════════════════════════════════════════════════ */
const NAV = [
  {
    id:    'finance',
    label: 'Finance',
    desc:  'Wallet, invoices & expenses',
    icon:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', min: 'basic'  },
      { id: 'wallet',    label: 'Wallet',    icon: '💰', min: 'basic'  },
      { id: 'invoices',  label: 'Invoices',  icon: '📄', min: 'basic'  },
      { id: 'expenses',  label: 'Expenses',  icon: '↓',  min: 'basic'  },
      { id: 'quotes',    label: 'Proposals', icon: '💬', min: 'basic'  },
    ],
  },
  {
    id:    'sales',
    label: 'Sales',
    desc:  'Pipeline, contacts & outreach',
    icon:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>',
    pages: [
      { id: 'pipeline',  label: 'Pipeline', icon: '📈', min: 'ecommerce' },
      { id: 'contacts',  label: 'Contacts', icon: '👥', min: 'ecommerce' },
      { id: 'campaigns', label: 'Outreach', icon: '📣', min: 'ecommerce' },
      { id: 'eli',       label: 'Eli AI',   icon: '✦',  min: 'ecommerce' },
    ],
  },
  {
    id:    'projects',
    label: 'Projects',
    desc:  'Projects & order checklists',
    icon:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    pages: [
      { id: 'projects', label: 'Projects', icon: '🗂️', min: 'standard' },
      { id: 'orders',   label: 'Orders',   icon: '✅',  min: 'standard' },
    ],
  },
  {
    id:    'workflows',
    label: 'Workflows',
    desc:  'Automation hub & integrations',
    icon:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    pages: [
      { id: 'hub',          label: 'Hub',          icon: '⚡', min: 'ecommerce' },
      { id: 'automations',  label: 'Automations',  icon: '🔁', min: 'ecommerce' },
      { id: 'web-intake',   label: 'Web Intake',   icon: '🌐', min: 'ecommerce' },
      { id: 'integrations', label: 'Integrations', icon: '🔌', min: 'ecommerce' },
    ],
  },
  {
    id:    'reports',
    label: 'Reports',
    desc:  'P&L, revenue trends & tax',
    icon:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
    pages: [
      { id: 'profit-loss',  label: 'P&L',     icon: '📉', min: 'basic' },
      { id: 'revenue',      label: 'Revenue',  icon: '📈', min: 'basic' },
      { id: 'tax-estimate', label: 'Tax Est.', icon: '🧾', min: 'basic' },
    ],
  },
  {
    id:    'apps',
    label: 'Apps',
    desc:  'Products, downloads & settings',
    icon:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    pages: [
      { id: 'marketplace', label: 'Marketplace', icon: '🛒', min: 'basic' },
      { id: 'products',    label: 'Products',    icon: '🍋', min: 'basic' },
      { id: 'downloads',   label: 'Downloads',   icon: '⬇️', min: 'basic' },
      { id: 'settings',    label: 'Settings',    icon: '⚙️', min: 'basic' },
    ],
  },
  {
    id:        'platform',
    label:     'Admin',
    desc:      'Platform controls',
    adminOnly: true,
    icon:      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    pages: [
      { id: 'admin-overview',    label: 'Overview',    icon: '🔭', min: 'basic', adminOnly: true },
      { id: 'admin-users',       label: 'Users',       icon: '👤', min: 'basic', adminOnly: true },
      { id: 'admin-marketplace', label: 'Marketplace', icon: '🏪', min: 'basic', adminOnly: true },
      { id: 'admin-system',      label: 'System',      icon: '🖥️', min: 'basic', adminOnly: true },
    ],
  },
];

/* ── EXPORTS ─────────────────────────────────────────────── */
window.CONFIG = CONFIG;
window.NAV    = NAV;

/* ═══════════════════════════════════════════════════════════
   FEATURE GATES
   Controls which pages/features require Pro unlock.
   Core pages are always accessible.
   Pro pages show an upgrade screen until gate is open.

   Gates are opened by:
     window.CoLAB._gates.pro = true
   This is called by colabos-pro after verifying a
   valid license key or Lemon Squeezy purchase webhook.
═══════════════════════════════════════════════════════════ */
CONFIG.GATES = {

  /* Pages that are ALWAYS free — no gate check */
  CORE_PAGES: [
    'dashboard', 'wallet', 'invoices', 'expenses', 'quotes',
    'pipeline', 'contacts', 'campaigns',
    'projects', 'orders',
    'marketplace', 'downloads', 'settings',
    'web-intake',
  ],

  /* Pages that require Pro unlock */
  PRO_PAGES: [
    'hub', 'automations', 'integrations',
    'eli',
    'profit-loss', 'revenue', 'tax-estimate',
    'products',
    'admin-overview', 'admin-users', 'admin-mkt', 'admin-system',
  ],

  /* Feature flags for fine-grained control */
  FEATURES: {
    automationHub:   { pro: true,  label: 'Automation Hub'    },
    integrations:    { pro: true,  label: 'Integrations'      },
    eliAI:           { pro: true,  label: 'Eli AI Assistant'  },
    revenueReports:  { pro: true,  label: 'Revenue Reports'   },
    taxEstimate:     { pro: true,  label: 'Tax Estimator'     },
    plOverview:      { pro: true,  label: 'P&L Overview'      },
    productSelling:  { pro: true,  label: 'Products (sell)'   },
    adminPanel:      { pro: true,  label: 'Admin Panel'       },
    commandPalette:  { pro: false, label: 'Command Palette'   },
    importDocs:      { pro: false, label: 'Document Import'   },
    csvExport:       { pro: false, label: 'CSV Export'        },
  },

};

/* ─────────────────────────────────────────────────────────
   GATE HELPERS
───────────────────────────────────────────────────────── */

/* Is a page gated behind Pro? */
CONFIG.isProPage = function(pageId) {
  return CONFIG.GATES.PRO_PAGES.indexOf(pageId) !== -1;
};

/* Is a feature gated behind Pro? */
CONFIG.isProFeature = function(featureKey) {
  var f = CONFIG.GATES.FEATURES[featureKey];
  return f ? f.pro : false;
};

/* Is Pro currently unlocked? (reads from CoLAB SDK gate) */
CONFIG.isProUnlocked = function() {
  return !!(window.CoLAB && window.CoLAB._gates && window.CoLAB._gates.pro === true);
};

/* Can the current user access this page? */
CONFIG.canAccessPage = function(pageId) {
  if (!CONFIG.isProPage(pageId)) { return true; }   /* core page — always yes */
  return CONFIG.isProUnlocked();                      /* pro page — check gate */
};

/* ─────────────────────────────────────────────────────────
   LICENSE KEY VALIDATOR
   Called by colabos-pro after a Lemon Squeezy purchase.
   Can also be called manually with a stored key.
───────────────────────────────────────────────────────── */
CONFIG.activatePro = function(licenseKey) {
  if (!licenseKey || typeof licenseKey !== 'string') { return false; }

  /* In production: POST to your Lemon Squeezy activation endpoint.
     Here we do a basic format check and store the key. */
  var isValidFormat = licenseKey.length >= 16;
  if (!isValidFormat) {
    if (typeof window.toast === 'function') {
      window.toast('Invalid license key format', 'error');
    }
    return false;
  }

  /* Store and open the gate */
  localStorage.setItem('colab_pro_key', licenseKey);
  if (window.CoLAB) { window.CoLAB._gates.pro = true; }
  if (typeof window.logActivity === 'function') {
    window.logActivity('Pro unlocked', { key: licenseKey.substring(0, 8) + '...' });
  }
  if (typeof window.renderApp === 'function') { window.renderApp(); }
  return true;
};

/* ─────────────────────────────────────────────────────────
   RESTORE PRO STATE on boot
   Called from app.js DOMContentLoaded.
───────────────────────────────────────────────────────── */
CONFIG.restoreProState = function() {
  var stored = localStorage.getItem('colab_pro_key');
  if (stored && stored.length >= 16) {
    if (window.CoLAB) { window.CoLAB._gates.pro = true; }
    return true;
  }
  return false;
};

/* Re-export — window.CONFIG already set above */
window.CONFIG = CONFIG;
