/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — data.js
   Global runtime state. All application data lives here.
   Rules: no UI, no DOM manipulation, no async calls.
   All other modules read from and write to window.D.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   RUNTIME STATE — window.D
   Single source of truth for all application data.
   Onboarding and settings write directly into this object.
───────────────────────────────────────────────────────── */
window.D = {

  /* ── USER ─────────────────────────────────────────────── */
  user: {
    name:     'Brandon',
    biz:      'CoLAB',
    email:    'labindustries@proton.me',
    role:     'admin',       /* admin | owner | staff | readonly */
    tier:     'ecommerce',   /* basic | standard | ecommerce | enterprise */
    avatar:   'B',
  },

  /* ── INVOICES ─────────────────────────────────────────── */
  invoices: [
    { id: 'INV-0004', client: 'Patel Hardware',      amt: 3500, due: '2026-03-15', status: 'sent',    sent: 'Mar 08' },
    { id: 'INV-0003', client: 'Ndaba Plumbing',       amt: 1200, due: '2026-03-10', status: 'paid',    sent: 'Feb 20' },
    { id: 'INV-0002', client: 'Sunrise Auto Body',    amt: 2500, due: '2026-03-20', status: 'sent',    sent: 'Mar 04' },
    { id: 'INV-0001', client: 'Thabo Constructions',  amt: 4200, due: '2026-02-28', status: 'overdue', sent: 'Feb 01' },
  ],

  /* ── EXPENSES ─────────────────────────────────────────── */
  expenses: [
    { id: 'EXP-011', cat: 'Software',  desc: 'Vercel Pro plan',           amt: 240,  date: '2026-03-05', recurring: true  },
    { id: 'EXP-010', cat: 'Domain',    desc: 'colabos.store renewal',      amt: 320,  date: '2026-03-02', recurring: false },
    { id: 'EXP-009', cat: 'Tools',     desc: 'n8n cloud subscription',     amt: 180,  date: '2026-02-28', recurring: true  },
    { id: 'EXP-008', cat: 'AI',        desc: 'Anthropic API credits',      amt: 350,  date: '2026-02-24', recurring: false },
    { id: 'EXP-007', cat: 'Marketing', desc: 'LinkedIn Premium monthly',   amt: 460,  date: '2026-02-15', recurring: true  },
    { id: 'EXP-006', cat: 'AI',        desc: 'OpenAI API credits',         amt: 280,  date: '2026-02-10', recurring: false },
  ],

  /* ── CONTACTS ─────────────────────────────────────────── */
  contacts: [
    { id: 'C001', name: 'Sipho Ndaba',    company: 'Ndaba Plumbing',       tags: ['client','founding'], value: 1200, lastContact: '2w' },
    { id: 'C002', name: 'Ravi Patel',     company: 'Patel Hardware',       tags: ['client'],            value: 3500, lastContact: '3d' },
    { id: 'C003', name: 'Thabo Khumalo',  company: 'Sunrise Auto Body',    tags: ['client','overdue'],  value: 6700, lastContact: '1w' },
    { id: 'C004', name: 'Zanele Mokoena', company: 'ZM Catering',          tags: ['lead'],              value: 0,    lastContact: '5d' },
    { id: 'C005', name: 'Dean Ferreira',  company: 'Ferreira Electrical',  tags: ['lead'],              value: 0,    lastContact: '2d' },
    { id: 'C006', name: 'Ayanda Dlamini', company: 'AD Panel Beaters',     tags: ['founding','vip'],    value: 0,    lastContact: '1d' },
  ],

  /* ── PIPELINE ─────────────────────────────────────────── */
  pipeline: {
    stages: [
      { id: 'outreach',    label: 'Outreach',      color: '#71717a', cards: [
        { name: 'Ferreira Electrical', value: 2500, owner: 'Dean F.',   days: 2 },
        { name: 'ZM Catering',         value: 2500, owner: 'Zanele M.', days: 4 },
      ]},
      { id: 'contacted',   label: 'Contacted',     color: '#60a5fa', cards: [
        { name: 'MvW Logistics',  value: 3500, owner: 'Marcus vW', days: 3 },
        { name: 'Khumalo Tiles',  value: 2500, owner: 'Sipho K.',  days: 5 },
      ]},
      { id: 'conversation',label: 'Conversation',  color: '#a78bfa', cards: [
        { name: 'AD Panel Beaters', value: 3500, owner: 'Ayanda D.', days: 2 },
      ]},
      { id: 'proposal',    label: 'Proposal Sent', color: '#f97316', cards: [
        { name: 'Sunrise Auto Body', value: 2500, owner: 'Thabo K.', days: 1 },
      ]},
      { id: 'won',         label: 'Won',           color: '#4ade80', cards: [
        { name: 'Patel Hardware SEO',   value: 3500, owner: 'Ravi P.',  days: 0 },
        { name: 'Ndaba Missed Call',    value: 2500, owner: 'Sipho N.', days: 0 },
      ]},
      { id: 'founding',    label: 'Founding 100',  color: '#fb923c', cards: [
        { name: 'Ndaba Plumbing',   value: 0, owner: 'Sipho N.',  days: 14 },
        { name: 'AD Panel Beaters', value: 0, owner: 'Ayanda D.', days: 7  },
      ]},
    ],
  },

  /* ── PROJECTS ─────────────────────────────────────────── */
  projects: [
    { id: 'PRJ-001', name: 'CoLAB OS v11 Launch',          status: 'active',   progress: 90,  due: 'Mar 20' },
    { id: 'PRJ-002', name: 'Hyperlocal SEO Blueprint PDF',  status: 'active',   progress: 60,  due: 'Mar 25' },
    { id: 'PRJ-003', name: 'Founding 100 Outreach',         status: 'active',   progress: 20,  due: 'Apr 01' },
    { id: 'PRJ-004', name: 'Business Basics Course',        status: 'planning', progress: 5,   due: 'Apr 15' },
    { id: 'PRJ-005', name: 'Landing Pages — All 4 Live',    status: 'complete', progress: 100, due: 'Mar 10' },
  ],

  /* ── ORDERS (checklist-style) ─────────────────────────── */
  orders: [
    {
      id: 'ORD-001', name: 'SEO Setup — Patel Hardware',
      client: 'Patel Hardware', due: 'Mar 20', priority: 'hi', status: 'in-progress',
      tasks: [
        { text: 'Keyword research complete',         done: true  },
        { text: 'GMB profile optimised',             done: true  },
        { text: 'Build 200 local landing pages',     done: false },
        { text: 'Submit to Google Search Console',   done: false },
        { text: 'Client sign-off',                   done: false },
      ],
    },
    {
      id: 'ORD-002', name: 'Missed Call Recovery — Ndaba',
      client: 'Ndaba Plumbing', due: 'Mar 18', priority: 'hi', status: 'in-progress',
      tasks: [
        { text: 'n8n workflow deployed',   done: true  },
        { text: 'Twilio number configured',done: true  },
        { text: 'Test call triggers',      done: false },
        { text: 'Handoff documentation',   done: false },
      ],
    },
    {
      id: 'ORD-003', name: 'CRM Setup — AD Panel Beaters',
      client: 'AD Panel Beaters', due: 'Mar 25', priority: 'me', status: 'pending',
      tasks: [
        { text: 'Import existing contacts',      done: false },
        { text: 'Pipeline stages configured',    done: false },
        { text: 'Team walkthrough session',      done: false },
      ],
    },
  ],

  /* ── CAMPAIGNS / OUTREACH ─────────────────────────────── */
  campaigns: [
    { id: 'CMP-001', name: 'LinkedIn — Panel Beater Series', type: 'linkedin', status: 'active', sent: 3,  opened: 847,  clicked: 62 },
    { id: 'CMP-002', name: 'WhatsApp — Plumbers Outreach',   type: 'whatsapp', status: 'active', sent: 28, opened: 19,   clicked: 6  },
    { id: 'CMP-003', name: 'WhatsApp — Electricians',        type: 'whatsapp', status: 'active', sent: 22, opened: 14,   clicked: 4  },
    { id: 'CMP-004', name: 'Email — Founding 100 Invite',    type: 'email',    status: 'draft',  sent: 0,  opened: 0,    clicked: 0  },
  ],

  /* ── AUTOMATIONS ──────────────────────────────────────── */
  automations: [
    {
      id: 'AUTO-001', name: 'Website Lead Intake',
      platform: 'n8n', status: 'active', runs: 47, todayRuns: 4, last: '12m ago',
      trigger: 'webhook', desc: 'Qualify form → pipeline contact auto-create',
      webhookUrl: 'https://n8n.yourdomain.com/webhook/lead-intake',
      flow: ['colabos.store/qualify', '→ n8n webhook', '→ create contact', '→ callback'],
    },
    {
      id: 'AUTO-002', name: 'Missed Call WhatsApp Reply',
      platform: 'n8n', status: 'active', runs: 23, todayRuns: 2, last: '2h ago',
      trigger: 'webhook', desc: 'Missed call → instant WhatsApp reply',
      webhookUrl: 'https://n8n.yourdomain.com/webhook/missed-call',
      flow: ['Twilio missed call', '→ n8n webhook', '→ WhatsApp via Twilio', '→ callback'],
    },
    {
      id: 'AUTO-003', name: 'Proposal Follow-Up Sequence',
      platform: 'n8n', status: 'active', runs: 8, todayRuns: 0, last: '1d ago',
      trigger: 'schedule', desc: 'Day 2 + Day 5 follow-up if no response',
      webhookUrl: 'https://n8n.yourdomain.com/webhook/proposal-followup',
      flow: ['Invoice sent', '→ n8n schedule', '→ WhatsApp/email', '→ callback'],
    },
    {
      id: 'AUTO-004', name: 'Eli Content Generator',
      platform: 'claude', status: 'active', runs: 31, todayRuns: 3, last: '3h ago',
      trigger: 'manual', desc: 'Prompt → LinkedIn post draft via Claude API',
      webhookUrl: null,
      flow: ['Manual trigger', '→ Claude API', '→ insert draft to Campaigns'],
    },
    {
      id: 'AUTO-005', name: 'Invoice Reminder',
      platform: 'n8n', status: 'paused', runs: 12, todayRuns: 0, last: '3d ago',
      trigger: 'schedule', desc: 'Overdue invoice → WhatsApp reminder at day 7',
      webhookUrl: 'https://n8n.yourdomain.com/webhook/invoice-reminder',
      flow: ['Cron daily 08:00', '→ check overdue', '→ WhatsApp via Twilio', '→ callback'],
    },
    {
      id: 'AUTO-006', name: 'Review Request Sequence',
      platform: 'n8n', status: 'draft', runs: 0, todayRuns: 0, last: 'never',
      trigger: 'webhook', desc: 'Job completed → 48h review request via WhatsApp',
      webhookUrl: null,
      flow: ['Project complete', '→ n8n webhook', '→ 48h delay node', '→ WhatsApp'],
    },
  ],

  /* ── WEB INTAKE / WEBHOOKS ────────────────────────────── */
  webhooks: [
    { id: 'WH-001', ts: '10:42',     name: 'Priya Naidoo',   biz: 'Naidoo Beauty Studio', path: 'Services → Solo',   status: 'new'      },
    { id: 'WH-002', ts: '09:17',     name: 'Marcus van Wyk', biz: 'MvW Logistics',         path: 'Services → Small',  status: 'added'    },
    { id: 'WH-003', ts: '08:55',     name: 'Ayanda Dlamini', biz: 'AD Panel Beaters',      path: 'OS Interest',       status: 'founding' },
    { id: 'WH-004', ts: 'Yesterday', name: 'Dean Ferreira',  biz: 'Ferreira Electrical',   path: 'Services → Solo',   status: 'added'    },
    { id: 'WH-005', ts: 'Yesterday', name: 'Anonymous',      biz: '—',                     path: 'Education Free',    status: 'subscribed'},
  ],

  /* ── MARKETPLACE TOOLS ────────────────────────────────── */
  marketplace: [
    { id: 'T001', name: 'Missed Call Recovery',   cat: 'Automation', price: 2500, installed: true,  rating: 5.0, downloads: 2,  desc: 'Auto WhatsApp reply on missed calls',       verified: true,  featured: true  },
    { id: 'T002', name: 'Proposal Follow-Up',     cat: 'Automation', price: 2500, installed: true,  rating: 5.0, downloads: 1,  desc: 'Automated follow-up sequence',              verified: true,  featured: true  },
    { id: 'T003', name: 'SEO Blueprint',          cat: 'Template',   price: 499,  installed: true,  rating: 4.9, downloads: 8,  desc: '1000 hyperlocal pages in 6 hours',          verified: true,  featured: true  },
    { id: 'T004', name: 'SMB Prompt Pack',        cat: 'AI',         price: 299,  installed: true,  rating: 4.8, downloads: 14, desc: 'AI prompts for daily business tasks',       verified: true,  featured: false },
    { id: 'T005', name: 'Reputation Monitor',     cat: 'Automation', price: 2500, installed: false, rating: 4.7, downloads: 0,  desc: 'Review alerts across Google & Facebook',    verified: true,  featured: false },
    { id: 'T006', name: 'Re-Engagement Campaign', cat: 'Automation', price: 2500, installed: false, rating: 0,   downloads: 0,  desc: 'Win back quiet customers automatically',    verified: false, featured: false },
  ],

  /* ── PRODUCTS (Lemon Squeezy storefront) ─────────────── */
  products: [
    { id: 'P001', emoji: '📞', name: 'Missed Call Recovery',     cat: 'Automation', price: 2500,  status: 'live',  lsSlug: 'missed-call-recovery',  desc: 'Done-for-you n8n workflow. Instant WhatsApp reply to every missed call. 48h delivery.' },
    { id: 'P002', emoji: '🗺️', name: 'SEO Blueprint',            cat: 'Template',   price: 499,   status: 'live',  lsSlug: 'seo-blueprint',          desc: 'Build 1000 hyperlocal pages in 6 hours. CSV template + deployment guide.' },
    { id: 'P003', emoji: '📄', name: 'Proposal Follow-Up Engine', cat: 'Automation', price: 2500,  status: 'live',  lsSlug: 'proposal-followup',      desc: '5-step automated follow-up triggered the moment a proposal is sent. Yours forever.' },
    { id: 'P004', emoji: '⭐', name: 'Reputation Monitor',        cat: 'Automation', price: 2500,  status: 'live',  lsSlug: 'reputation-monitor',     desc: 'Real-time review monitoring with automated response templates and owner alerts.' },
    { id: 'P005', emoji: '🔁', name: 'Re-Engagement Campaign',   cat: 'Automation', price: 2500,  status: 'draft', lsSlug: '',                       desc: 'Win back quiet customers with a 3-touch automated campaign.' },
    { id: 'P006', emoji: '⚡', name: 'CoLAB Automation Hub',     cat: 'Bundle',     price: 14700, status: 'live',  lsSlug: 'automation-hub',         desc: 'All 10 systems built, configured, and deployed for your business.' },
  ],

  /* ── DOWNLOADS ────────────────────────────────────────── */
  downloads: [
    { id: 'DL-001', name: 'CoLAB OS Installer',    version: 'v11.0.0', cat: 'OS',       icon: '💿', size: '48 MB',  date: 'Mar 2026', url: '#dl-colab-os',     desc: 'Windows 10/11 desktop app. Offline-first, SQLite powered.' },
    { id: 'DL-002', name: 'SEO Page CSV Template', version: 'v1.2',    cat: 'Template', icon: '📋', size: '24 KB',  date: 'Feb 2026', url: '#dl-seo-csv',      desc: 'Bulk CSV for generating 1000+ hyperlocal landing pages.' },
    { id: 'DL-003', name: 'n8n Workflow Pack',     version: 'v2.0',    cat: 'Workflow', icon: '⚡', size: '156 KB', date: 'Mar 2026', url: '#dl-n8n-pack',     desc: 'Pre-built n8n workflow JSON for all 10 automation systems.' },
    { id: 'DL-004', name: 'Invoice Template Pack', version: 'v1.0',    cat: 'Template', icon: '📄', size: '3.2 MB', date: 'Jan 2026', url: '#dl-invoice-pack', desc: 'Professional invoice & quote templates for PDF export.' },
  ],

  /* ── ELI CHAT HISTORY ─────────────────────────────────── */
  eliHistory: [],

  /* ── ACTIVITY FEED ────────────────────────────────────── */
  /* Populated at runtime by logActivity() in services.js */
  activity: [],

  /* ── QUOTE BUILDER STATE ──────────────────────────────── */
  quoteItems: [
    { desc: '', qty: 1, price: 0 },
    { desc: '', qty: 1, price: 0 },
  ],

};

/* ─────────────────────────────────────────────────────────
   LEDGER ENGINE
   Immutable delta-ledger. All financial data flows through here.
   Revenue and expense totals are computed from transactions.
───────────────────────────────────────────────────────── */
window.LEDGER = {

  txns: [
    { date: '2026-03-08', type: 'revenue', cat: 'Service',   desc: 'Hyperlocal SEO setup — Patel Hardware',   delta: +3500 },
    { date: '2026-03-06', type: 'revenue', cat: 'Product',   desc: 'SEO Blueprint × 2',                       delta: +998  },
    { date: '2026-03-05', type: 'expense', cat: 'Software',  desc: 'Vercel Pro plan',                          delta: -240  },
    { date: '2026-03-04', type: 'revenue', cat: 'Service',   desc: 'Missed Call Recovery setup',               delta: +2500 },
    { date: '2026-03-02', type: 'expense', cat: 'Domain',    desc: 'colabos.store renewal',                    delta: -320  },
    { date: '2026-03-01', type: 'revenue', cat: 'Product',   desc: 'SMB Prompt Pack × 3',                      delta: +897  },
    { date: '2026-02-28', type: 'expense', cat: 'Tools',     desc: 'n8n cloud subscription',                   delta: -180  },
    { date: '2026-02-24', type: 'expense', cat: 'AI',        desc: 'Anthropic API credits',                    delta: -350  },
    { date: '2026-02-20', type: 'revenue', cat: 'Service',   desc: 'Automation audit — Ndaba Plumbing',        delta: +1200 },
    { date: '2026-02-15', type: 'expense', cat: 'Marketing', desc: 'LinkedIn Premium',                         delta: -460  },
    { date: '2026-01-30', type: 'revenue', cat: 'Service',   desc: 'Follow-Up Engine — Sunrise Auto Body',     delta: +2500 },
    { date: '2026-01-22', type: 'expense', cat: 'Software',  desc: 'Cloudflare Pro plan',                      delta: -200  },
    { date: '2026-01-15', type: 'revenue', cat: 'Product',   desc: 'SEO Blueprint × 3',                        delta: +1497 },
    { date: '2025-12-20', type: 'revenue', cat: 'Service',   desc: 'Hyperlocal SEO — AD Panel Beaters',        delta: +3500 },
    { date: '2025-12-10', type: 'expense', cat: 'AI',        desc: 'OpenAI API credits',                       delta: -280  },
    { date: '2025-11-28', type: 'revenue', cat: 'Service',   desc: 'Full automation setup — MvW Logistics',    delta: +4200 },
    { date: '2025-11-15', type: 'expense', cat: 'Marketing', desc: 'Facebook Ads — Nov campaign',              delta: -600  },
    { date: '2025-10-30', type: 'revenue', cat: 'Service',   desc: 'Proposal Follow-Up — Ferreira Electrical', delta: +2500 },
    { date: '2025-10-12', type: 'expense', cat: 'Software',  desc: 'Domain registrations × 3',                 delta: -450  },
  ],

  /* Computed getters — always accurate, no stale state */
  get balance() {
    return this.txns.reduce(function(sum, t) { return sum + t.delta; }, 0);
  },
  get revenue() {
    return this.txns
      .filter(function(t) { return t.type === 'revenue'; })
      .reduce(function(sum, t) { return sum + t.delta; }, 0);
  },
  get expenses() {
    return Math.abs(this.txns
      .filter(function(t) { return t.type === 'expense'; })
      .reduce(function(sum, t) { return sum + t.delta; }, 0));
  },
  get margin() {
    return this.revenue > 0
      ? Math.round((this.revenue - this.expenses) / this.revenue * 100)
      : 0;
  },

  /* Revenue grouped by month — used by Reports charts */
  byMonth: function() {
    var map = {};
    this.txns
      .filter(function(t) { return t.type === 'revenue'; })
      .forEach(function(t) {
        var m = t.date.substring(0, 7);
        map[m] = (map[m] || 0) + t.delta;
      });
    return map;
  },

  /* Expense grouped by category — used by Wallet breakdown */
  expenseByCategory: function() {
    var map = {};
    this.txns
      .filter(function(t) { return t.type === 'expense'; })
      .forEach(function(t) {
        map[t.cat] = (map[t.cat] || 0) + Math.abs(t.delta);
      });
    return map;
  },

};

/* ─────────────────────────────────────────────────────────
   ADMIN PLATFORM DATA
   Separate from D to avoid contaminating operator data.
───────────────────────────────────────────────────────── */
window.ADMIN = {
  platform: {
    totalUsers:    847,
    activeMonth:   312,
    mrr:           42800,
    gmv:           184200,
    commission:    27630,
    newUsersWeek:  28,
    pendingTools:  2,
  },
  users: [
    { id: 'U001', name: 'Dean Mitchell', biz: 'RMA Auto Body',    tier: 'ecommerce', status: 'active',    joined: 'Dec 2025', spend: 799  },
    { id: 'U002', name: 'Sipho Dlamini', biz: 'Dlamini Plumbing', tier: 'standard',  status: 'active',    joined: 'Jan 2026', spend: 299  },
    { id: 'U003', name: 'Fatima Osman',  biz: 'Fatima Fashion',   tier: 'basic',     status: 'active',    joined: 'Feb 2026', spend: 0    },
    { id: 'U004', name: 'Chris van Wyk', biz: 'CvW Electrical',   tier: 'ecommerce', status: 'suspended', joined: 'Nov 2025', spend: 1299 },
    { id: 'U005', name: 'Nomsa Khumalo', biz: 'NK Catering',      tier: 'standard',  status: 'active',    joined: 'Feb 2026', spend: 499  },
  ],
  tools: [
    { id: 'AT001', name: 'PDF Invoice Pro',   dev: 'Internal',     sales: 218, rev: 43382, status: 'live',    rating: 4.7 },
    { id: 'AT002', name: 'WhatsApp Receipts', dev: 'Internal',     sales: 184, rev: 0,     status: 'live',    rating: 4.8 },
    { id: 'AT003', name: 'Stock Predictor',   dev: 'DataForge SA', sales: 31,  rev: 12369, status: 'live',    rating: 4.5 },
    { id: 'AT004', name: 'Xero Sync',         dev: 'FinTech SA',   sales: 0,   rev: 0,     status: 'pending', rating: 0   },
    { id: 'AT005', name: 'SMS Campaigns',     dev: 'BulkSMS Dev',  sales: 0,   rev: 0,     status: 'pending', rating: 0   },
  ],
};

/* ─────────────────────────────────────────────────────────
   STARTER 10 PACK — automation system definitions
───────────────────────────────────────────────────────── */
window.STARTER10 = [
  { id: 's01', name: 'Missed Call Recovery',    icon: '📞', installed: true  },
  { id: 's02', name: 'Lead Qualification',       icon: '🎯', installed: true  },
  { id: 's03', name: 'Proposal Follow-Up',       icon: '📄', installed: true  },
  { id: 's04', name: 'Invoice Reminder',         icon: '💸', installed: false },
  { id: 's05', name: 'Re-Engagement Campaign',   icon: '🔁', installed: false },
  { id: 's06', name: 'Reputation Monitor',       icon: '⭐', installed: false },
  { id: 's07', name: 'Review Request Sequence',  icon: '🌟', installed: false },
  { id: 's08', name: 'Local SEO Pinger',         icon: '🗺️', installed: false },
  { id: 's09', name: 'Task Auto-Generator',      icon: '✅', installed: false },
  { id: 's10', name: 'Inventory Reorder Alert',  icon: '📦', installed: false },
];

/* ─────────────────────────────────────────────────────────
   TIER ACCESS CONTROL
   Used by app.js to lock/unlock nav items.
───────────────────────────────────────────────────────── */
window.TIER_RANK = {
  basic:      1,
  standard:   2,
  ecommerce:  3,
  enterprise: 4,
};

/* Returns true if the current user can access a feature at minTier */
window.canAccess = function(minTier) {
  if (!minTier || minTier === 'basic') { return true; }
  var userRank = window.TIER_RANK[window.D.user.tier] || 1;
  var minRank  = window.TIER_RANK[minTier] || 1;
  return userRank >= minRank;
};

/* Returns true if the current user has admin role */
window.isAdmin = function() {
  return window.D.user.role === 'admin';
};
