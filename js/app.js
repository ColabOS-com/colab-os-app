/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — app.js
   The runtime engine. Boots last. Wires everything together.

   Responsibilities:
     1. Boot sequence on DOMContentLoaded
     2. Restore persisted state (theme, currency, ws mode)
     3. Render sidebar, flyout, mobile nav, mission control
     4. Route pages — map id → render function
     5. Command palette (Ctrl+K) with full COMMANDS index
     6. Onboarding flow (first visit)
     7. Theme, workspace mode, currency controls
     8. Statusbar clock
     9. Expose window.renderApp() and window.navigateTo()
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   ROUTER — maps page id to render function
   Every page module must be loaded before app.js runs.
───────────────────────────────────────────────────────── */
var ROUTES = {
  /* Finance */
  'dashboard':    function() { return window.renderFinanceDashboard(); },
  'wallet':       function() { return window.renderWallet();           },
  'invoices':     function() { return window.renderInvoices();         },
  'expenses':     function() { return window.renderExpenses();         },
  'quotes':       function() { return window.renderQuotes();           },
  /* Sales */
  'pipeline':     function() { return window.renderSalesPipeline();    },
  'contacts':     function() { return window.renderContacts();         },
  'campaigns':    function() { return window.renderOutreach();         },
  'eli':          function() { return window.renderEli();              },
  /* Projects */
  'projects':     function() { return window.renderProjects();         },
  'orders':       function() { return window.renderOrders();           },
  /* Workflows */
  'hub':          function() { return window.renderAutomationHub();    },
  'automations':  function() { return window.renderAutomations();      },
  'web-intake':   function() { return window.renderWebIntake();        },
  'integrations': function() { return window.renderIntegrations();     },
  /* Reports */
  'profit-loss':  function() { return window.renderPL();               },
  'revenue':      function() { return window.renderRevenue();          },
  'tax-estimate': function() { return window.renderTaxEstimate();      },
  /* Apps */
  'marketplace':  function() { return window.renderMarketplace();      },
  'products':     function() { return window.renderProducts();         },
  'downloads':    function() { return window.renderDownloads();        },
  'settings':     function() { return window.renderSettings();         },
  /* Admin */
  'admin-overview':    function() { return window.renderAdminOverview();    },
  'admin-users':       function() { return window.renderAdminUsers();       },
  'admin-mkt':         function() { return window.renderAdminMarketplace(); },
  'admin-system':      function() { return window.renderAdminSystem();      },
};

/* ─────────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────── */
var _activeCat  = 'finance';
var _activePage = 'dashboard';
var _flyTimer   = null;
var _cmdIdx     = 0;
var _cmdResults = [];

/* ─────────────────────────────────────────────────────────
   BOOT — runs on DOMContentLoaded
───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {

  /* 0. AUTH CHECK — redirect to login if not signed in */
  if (window.AUTH && window.supabase) {
    window.AUTH.getSession().then(function(session) {
      if (!session) {
        window.location.href = 'login.html';
        return;
      }
      /* Session valid — load user data then boot */
      window.DB.loadAll().then(function() {
        _boot();
      }).catch(function() {
        _boot(); /* fallback to mock data if DB fails */
      });
    });
  } else {
    /* No Supabase (local/desktop) — boot directly */
    _boot();
  }
});

/* Extracted boot sequence — called after auth confirmed */
function _boot() {
  document.removeEventListener('DOMContentLoaded', arguments.callee);

  /* 1. Restore theme */
  var savedTheme = localStorage.getItem('colab_theme') || CONFIG.DEFAULTS.theme;
  _applyTheme(savedTheme, false);

  /* 2. Restore currency */
  var savedCur = localStorage.getItem('colab_currency') || CONFIG.DEFAULTS.currency;
  window.AC = savedCur;
  _renderCurrBtn();

  /* 3. Restore workspace mode */
  var savedMode = localStorage.getItem('colab_ws_mode') || CONFIG.DEFAULTS.wsMode;
  _applyWsMode(savedMode, false);

  /* 4. Restore business profile from localStorage into CONFIG */
  var biz = _loadBiz();
  if (biz.name)    { CONFIG.BUSINESS.name    = biz.name;    }
  if (biz.email)   { CONFIG.BUSINESS.email   = biz.email;   }
  if (biz.phone)   { CONFIG.BUSINESS.phone   = biz.phone;   }
  if (biz.vat)     { CONFIG.BUSINESS.vat     = biz.vat;     }
  if (biz.country) { CONFIG.BUSINESS.country = biz.country; }

  /* 5. Restore user name */
  var savedName = localStorage.getItem('colab_user_name');
  if (savedName) {
    window.D.user.name = savedName;
    _updateAvatars(savedName);
  }

  /* 6. Build sidebar, currency dropdown */
  _renderSidebar();
  _renderCurrencyDropdown();
  _renderCurrBtn();

  /* 7. Navigate to default page */
  var savedPage = localStorage.getItem('colab_last_page') || 'hub';
  var savedCatId = _findCatForPage(savedPage);
  if (savedCatId) {
    _activeCat  = savedCatId;
    _activePage = savedPage;
  }
  window.navigateTo(_activePage);

  /* 8. Start statusbar clock */
  _startClock();

  /* 9. Register global keyboard shortcuts */
  document.addEventListener('keydown', _onKeyDown);

  /* 10. Close dropdowns on outside click */
  document.addEventListener('click', _onDocClick);

  /* 11. Show onboarding on first visit */
  if (!localStorage.getItem('colab_onboarded')) {
    setTimeout(function() { window.showOnboarding(); }, 600);
  }

  /* 12. Log app start */
  window.logActivity('CoLAB OS started', { version: CONFIG.PLATFORM.version });

  /* 13. Add sign out button to topbar */
  var soBtn = document.getElementById('signout-btn');
  if (soBtn) {
    soBtn.onclick = function() {
      if (window.AUTH) { window.AUTH.signOut(); }
      else { window.location.href = 'login.html'; }
    };
  }
}

/* ─────────────────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────────────────── */
window.navigateTo = function(pageId) {
  if (!ROUTES[pageId]) {
    window.toast('Page not found: ' + pageId, 'error');
    return;
  }

  /* Find which category this page belongs to */
  var catId = _findCatForPage(pageId);
  if (catId) { _activeCat = catId; }
  _activePage = pageId;

  /* Persist last visited page */
  localStorage.setItem('colab_last_page', pageId);

  /* Close any open mobile drawer */
  if (typeof window.closeDrawer === 'function') { window.closeDrawer(); }

  /* Close command palette */
  if (typeof window.closeCmd === 'function') { window.closeCmd(); }

  /* Render the page */
  window.renderApp();

  /* Scroll view to top */
  var view = document.getElementById('view');
  if (view) { view.scrollTop = 0; }
};

/* Find which NAV category contains a page id */
function _findCatForPage(pageId) {
  for (var i = 0; i < NAV.length; i++) {
    var cat = NAV[i];
    for (var j = 0; j < cat.pages.length; j++) {
      if (cat.pages[j].id === pageId) { return cat.id; }
    }
  }
  return null;
}

/* ─────────────────────────────────────────────────────────
   RENDER APP — master render function
   Called by every page module after a state mutation.
───────────────────────────────────────────────────────── */
window.renderApp = function() {
  _renderSidebar();
  _renderFlyout();
  _renderMobilNav();
  _renderMCStrip();
  _renderTopbar();
  _renderPage();
  _renderStatusbar();
};

/* Render page content into #view-inner */
function _renderPage() {
  var el = document.getElementById('view-inner');
  if (!el) { return; }

  /* ── PLUGIN ROUTES — check for plugin-registered pages ── */
  var pluginRenderFn = window['_plugin_page_' + _activePage];

  /* ── FEATURE GATE CHECK ──────────────────────────────── */
  if (CONFIG.isProPage(_activePage) && !CONFIG.isProUnlocked()) {
    el.innerHTML = _renderProGate(_activePage);
    return;
  }

  var renderFn = ROUTES[_activePage] || pluginRenderFn;
  if (!renderFn) {
    el.innerHTML = '<div style="padding:60px;text-align:center;color:var(--text-dim);font-family:var(--font-mono)">Page not found: ' + _activePage + '</div>';
    return;
  }

  /* ── PLUGIN HOOKS: beforeRender ─────────────────────── */
  if (window.CoLAB && window.CoLAB._hooks && window.CoLAB._hooks.beforeRender) {
    window.CoLAB._hooks.beforeRender.forEach(function(fn) {
      try { fn(_activePage); } catch(e) { /* silent */ }
    });
  }

  try {
    el.innerHTML = renderFn();
  } catch (e) {
    el.innerHTML = '<div style="padding:40px"><div style="font-size:13px;font-weight:700;color:var(--red);margin-bottom:8px">Render error</div><div style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">' + (e.message || e) + '</div></div>';
    console.error('[CoLAB OS] Render error on page "' + _activePage + '":', e);
  }

  /* Trigger count-up animations on any elements with class "cu" */
  setTimeout(function() {
    var cus = document.querySelectorAll('.cu[data-target]');
    cus.forEach(function(el) {
      var target = parseInt(el.dataset.target, 10);
      if (!isNaN(target)) { window.countUp(el, target); }
    });
  }, 60);

  /* ── PLUGIN HOOKS: afterRender ──────────────────────── */
  setTimeout(function() {
    if (window.CoLAB && window.CoLAB._hooks && window.CoLAB._hooks.afterRender) {
      window.CoLAB._hooks.afterRender.forEach(function(fn) {
        try { fn(_activePage); } catch(e) { /* silent */ }
      });
    }
  }, 80);
}

/* ─────────────────────────────────────────────────────────
   TOPBAR
───────────────────────────────────────────────────────── */
function _renderTopbar() {
  /* Page title */
  var titleEl = document.getElementById('page-title');
  var bcCat   = document.getElementById('bc-cat');
  var bcItem  = document.getElementById('bc-item');
  var nameEl  = document.getElementById('topbar-user-name');
  var chipEl  = document.getElementById('chip-dot-initial');

  var cat  = NAV.find(function(c) { return c.id === _activeCat; });
  var page = cat ? cat.pages.find(function(p) { return p.id === _activePage; }) : null;

  if (titleEl) { titleEl.textContent = page ? page.label : _activePage; }
  if (bcCat)   { bcCat.textContent   = cat  ? cat.label  : ''; }
  if (bcItem)  { bcItem.textContent  = page ? page.label : _activePage; }
  if (nameEl)  { nameEl.textContent  = window.D.user.name; }
  if (chipEl)  { chipEl.textContent  = window.D.user.name ? window.D.user.name[0].toUpperCase() : 'B'; }
}

/* ─────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────── */
function _renderSidebar() {
  var el = document.getElementById('sidebar-cats');
  if (!el) { return; }

  var html = [];
  NAV.forEach(function(cat) {
    if (cat.adminOnly && !window.isAdmin()) { return; }

    var isActive  = cat.id === _activeCat;
    var isAdmin   = cat.adminOnly;
    var dataAttr  = 'data-cat="' + cat.id + '"';

    html.push(
      '<button class="cat-btn' + (isActive ? ' active' : '') + (isAdmin ? ' admin-cat' : '') + '"' +
      ' ' + dataAttr +
      ' onclick="window._catClick(\'' + cat.id + '\')"' +
      ' onmouseenter="window._catHover(\'' + cat.id + '\')"' +
      ' onmouseleave="window.startFlyTimer()"' +
      ' title="' + cat.label + '">' +
      cat.icon +
      '<span class="cat-lbl">' + cat.label.substring(0, 3) + '</span>' +
      '</button>'
    );
  });
  el.innerHTML = html.join('');
}

/* ─────────────────────────────────────────────────────────
   FLYOUT
───────────────────────────────────────────────────────── */
function _renderFlyout() {
  var flyNav  = document.getElementById('flyout-nav');
  var flyLbl  = document.getElementById('flyout-cat-label');
  var flyDesc = document.getElementById('flyout-cat-desc');
  var flyTier = document.getElementById('flyout-tier-label');
  if (!flyNav) { return; }

  var cat = NAV.find(function(c) { return c.id === _activeCat; });
  if (!cat) { return; }

  if (flyLbl)  { flyLbl.textContent  = cat.label; flyLbl.className = 'flyout-cat' + (cat.adminOnly ? ' admin-flyout' : ''); }
  if (flyDesc) { flyDesc.textContent = cat.desc || ''; }
  if (flyTier) { flyTier.textContent = window.D.user.tier.charAt(0).toUpperCase() + window.D.user.tier.slice(1); }

  var html = [];
  cat.pages.forEach(function(page) {
    var isActive  = page.id === _activePage;
    var isLocked  = !window.canAccess(page.min);
    var isAdmin   = page.adminOnly;

    html.push(
      '<button class="sub-btn' +
      (isActive ? ' active' : '') +
      (isLocked ? ' locked' : '') +
      (isAdmin  ? ' admin-item' : '') +
      '" onclick="' + (isLocked ? 'window.toast(\'Upgrade to unlock ' + page.label + '\',\'warn\')' : 'window.navigateTo(\'' + page.id + '\')') + '">' +
      '<span class="sub-icon">' + page.icon + '</span>' +
      '<span class="sub-label">' + page.label + '</span>' +
      (isLocked ? '<span class="tier-tag">' + page.min + '</span>' : '') +
      '</button>'
    );
  });
  flyNav.innerHTML = html.join('');
}

/* Cat button click — navigate to first accessible page */
window._catClick = function(catId) {
  var cat = NAV.find(function(c) { return c.id === catId; });
  if (!cat) { return; }
  _activeCat = catId;
  var firstPage = cat.pages.find(function(p) { return window.canAccess(p.min); });
  if (firstPage) { window.navigateTo(firstPage.id); }
  _renderFlyout();
};

/* Cat button hover — show flyout */
window._catHover = function(catId) {
  clearFlyTimer();
  _activeCat = catId;
  _renderFlyout();
  var flyout = document.getElementById('flyout');
  if (flyout) { flyout.classList.add('open'); }
};

/* Flyout timer helpers */
window.startFlyTimer = function() {
  _flyTimer = setTimeout(function() {
    var flyout = document.getElementById('flyout');
    if (flyout) { flyout.classList.remove('open'); }
  }, 200);
};
window.clearFlyTimer = function() {
  if (_flyTimer) { clearTimeout(_flyTimer); _flyTimer = null; }
};

/* ─────────────────────────────────────────────────────────
   MOBILE NAV
───────────────────────────────────────────────────────── */
function _renderMobilNav() {
  var inner  = document.getElementById('mob-nav-inner');
  var drawer = document.getElementById('mob-drawer');
  if (!inner) { return; }

  /* Primary nav buttons — one per category */
  var visibleCats = NAV.filter(function(c) { return !c.adminOnly || window.isAdmin(); });
  var primary = visibleCats.slice(0, 5);

  inner.innerHTML = primary.map(function(cat) {
    var isActive = cat.id === _activeCat;
    return (
      '<button class="mob-btn' + (isActive ? ' active' : '') + '"' +
      ' onclick="window._mobCatTap(\'' + cat.id + '\')">' +
      cat.icon +
      '<span class="mob-lbl">' + cat.label.substring(0, 3) + '</span>' +
      '</button>'
    );
  }).join('');

  /* Drawer — sub-pages for active category */
  if (!drawer) { return; }
  var cat = NAV.find(function(c) { return c.id === _activeCat; });
  if (!cat) { drawer.innerHTML = ''; return; }

  var html = [];
  html.push('<div class="mob-drawer-cat">' + cat.label + '</div>');
  html.push('<div class="mob-sub-grid">');
  cat.pages.forEach(function(page) {
    var isActive = page.id === _activePage;
    var isLocked = !window.canAccess(page.min);
    html.push(
      '<div class="mob-sub-item' + (isActive ? ' active' : '') + (isLocked ? ' locked' : '') + '"' +
      ' onclick="' + (isLocked ? 'window.toast(\'Upgrade to unlock ' + page.label + '\',\'warn\')' : 'window.navigateTo(\'' + page.id + '\');closeDrawer()') + '">' +
      '<span class="mob-ic">' + page.icon + '</span>' +
      '<span class="mob-lbl">' + page.label + '</span>' +
      '</div>'
    );
  });
  html.push('</div>');
  drawer.innerHTML = html.join('');
}

window._mobCatTap = function(catId) {
  var wasSameCat = catId === _activeCat;
  _activeCat = catId;
  _renderMobilNav();

  /* If same cat tapped again, toggle drawer */
  var drawer = document.getElementById('mob-drawer');
  var dbg    = document.getElementById('drawer-bg');
  if (drawer && dbg) {
    if (wasSameCat && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      dbg.classList.remove('open');
    } else {
      drawer.classList.add('open');
      dbg.classList.add('open');
    }
  }
};

window.closeDrawer = function() {
  var drawer = document.getElementById('mob-drawer');
  var dbg    = document.getElementById('drawer-bg');
  if (drawer) { drawer.classList.remove('open'); }
  if (dbg)    { dbg.classList.remove('open');    }
};

/* ─────────────────────────────────────────────────────────
   MISSION CONTROL STRIP
───────────────────────────────────────────────────────── */
window.renderMCStrip = _renderMCStrip;

function _renderMCStrip() {
  var el = document.getElementById('mc-strip');
  if (!el) { return; }

  var L  = window.LEDGER;
  var D  = window.D;
  var f  = window.fmt;

  var activeAutos = D.automations.filter(function(a) { return a.status === 'active'; }).length;
  var newLeads    = D.webhooks.filter(function(w)    { return w.status === 'new';    }).length;
  var overdue     = D.invoices.filter(function(i)    { return i.status === 'overdue';}).length;

  var items = [
    { label: 'Balance',     value: f(L.balance),    color: L.balance >= 0 ? 'var(--green)' : 'var(--red)'   },
    { label: 'Revenue',     value: '+' + f(L.revenue), color: 'var(--green)' },
    { label: 'Automations', value: activeAutos + ' active', color: 'var(--accent)'                           },
  ];
  if (newLeads  > 0) { items.push({ label: 'Leads',   value: newLeads + ' new',  color: 'var(--green)'   }); }
  if (overdue   > 0) { items.push({ label: 'Overdue', value: overdue + ' inv',   color: 'var(--red)'     }); }

  var html = items.map(function(it) {
    return (
      '<div class="mc-item">' +
      '<span class="mc-label">' + it.label + '</span>' +
      '<span class="mc-value" style="color:' + it.color + '">' + it.value + '</span>' +
      '</div>'
    );
  }).join('');

  html += '<div class="mc-spacer"></div>';
  html += (
    '<div class="mc-cmd-hint" onclick="window.openCmd()" title="Command Palette">' +
    '<kbd>Ctrl</kbd><span>+</span><kbd>K</kbd>' +
    '</div>'
  );

  el.innerHTML = html;
}

/* ─────────────────────────────────────────────────────────
   STATUSBAR
───────────────────────────────────────────────────────── */
function _renderStatusbar() {
  var modeEl    = document.getElementById('status-mode');
  var versionEl = document.getElementById('status-version');
  if (modeEl)    { modeEl.textContent    = CONFIG.PLATFORM.mode.toUpperCase() + ' MODE'; }
  if (versionEl) { versionEl.textContent = CONFIG.PLATFORM.name + ' ' + CONFIG.PLATFORM.version; }
}

function _startClock() {
  function tick() {
    var el = document.getElementById('status-time');
    if (el) {
      el.textContent = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  tick();
  setInterval(tick, 1000);
}

/* ─────────────────────────────────────────────────────────
   COMMAND PALETTE
───────────────────────────────────────────────────────── */

/* Full command index */
var COMMANDS = [
  /* Navigate — Finance */
  { label: 'Dashboard',         icon: '📊', meta: 'Finance',   action: function() { window.navigateTo('dashboard');    } },
  { label: 'Wallet',             icon: '💰', meta: 'Finance',   action: function() { window.navigateTo('wallet');       } },
  { label: 'Invoices',           icon: '📄', meta: 'Finance',   action: function() { window.navigateTo('invoices');     } },
  { label: 'Expenses',           icon: '↓',  meta: 'Finance',   action: function() { window.navigateTo('expenses');     } },
  { label: 'Proposals',          icon: '💬', meta: 'Finance',   action: function() { window.navigateTo('quotes');       } },
  /* Navigate — Sales */
  { label: 'Pipeline',           icon: '📈', meta: 'Sales',     action: function() { window.navigateTo('pipeline');     } },
  { label: 'Contacts',           icon: '👥', meta: 'Sales',     action: function() { window.navigateTo('contacts');     } },
  { label: 'Outreach',           icon: '📣', meta: 'Sales',     action: function() { window.navigateTo('campaigns');    } },
  { label: 'Eli AI',             icon: '✦',  meta: 'Sales',     action: function() { window.navigateTo('eli');          } },
  /* Navigate — Projects */
  { label: 'Projects',           icon: '🗂️', meta: 'Projects',  action: function() { window.navigateTo('projects');     } },
  { label: 'Orders',             icon: '✅', meta: 'Projects',  action: function() { window.navigateTo('orders');       } },
  /* Navigate — Workflows */
  { label: 'Automation Hub',     icon: '⚡', meta: 'Workflows', action: function() { window.navigateTo('hub');          } },
  { label: 'Automations',        icon: '🔁', meta: 'Workflows', action: function() { window.navigateTo('automations');  } },
  { label: 'Web Intake',         icon: '🌐', meta: 'Workflows', action: function() { window.navigateTo('web-intake');   } },
  { label: 'Integrations',       icon: '🔌', meta: 'Workflows', action: function() { window.navigateTo('integrations'); } },
  /* Navigate — Reports */
  { label: 'P&L Overview',       icon: '📉', meta: 'Reports',   action: function() { window.navigateTo('profit-loss');  } },
  { label: 'Revenue Trends',     icon: '📈', meta: 'Reports',   action: function() { window.navigateTo('revenue');      } },
  { label: 'Tax Estimate',       icon: '🧾', meta: 'Reports',   action: function() { window.navigateTo('tax-estimate'); } },
  /* Navigate — Apps */
  { label: 'Marketplace',        icon: '🛒', meta: 'Apps',      action: function() { window.navigateTo('marketplace');  } },
  { label: 'Products',           icon: '🍋', meta: 'Apps',      action: function() { window.navigateTo('products');     } },
  { label: 'Downloads',          icon: '⬇️', meta: 'Apps',      action: function() { window.navigateTo('downloads');    } },
  { label: 'Settings',           icon: '⚙️', meta: 'Apps',      action: function() { window.navigateTo('settings');     } },
  /* Create actions */
  { label: 'New Invoice',        icon: '⊕',  meta: 'Create',    action: function() { window.navigateTo('invoices');     window.toast('New invoice — add to D.invoices in data.js', 'info'); } },
  { label: 'Capture Expense',    icon: '↓',  meta: 'Create',    action: function() { window.navigateTo('expenses');     window.importOpen('expenses'); } },
  { label: 'New Proposal',       icon: '◈',  meta: 'Create',    action: function() { window.navigateTo('quotes');       } },
  { label: 'New Project',        icon: '🗂️', meta: 'Create',    action: function() { window.navigateTo('projects');     window.toast('New project: add to D.projects in data.js', 'info'); } },
  { label: 'New Order',          icon: '✅', meta: 'Create',    action: function() { window.navigateTo('orders');       window.toast('New order: add to D.orders in data.js', 'info'); } },
  { label: 'Add Contact',        icon: '👤', meta: 'Create',    action: function() { window.navigateTo('contacts');     window.toast('Contact form — v11.1', 'info'); } },
  /* Quick actions */
  { label: 'Export Wallet CSV',  icon: '↓',  meta: 'Action',    action: function() { window.csvExport(window.LEDGER.txns, 'colab-wallet.csv'); } },
  { label: 'Export All Data',    icon: '↓',  meta: 'Action',    action: function() { window._settingsExportAll(); } },
  { label: 'Import Document',    icon: '📄', meta: 'Action',    action: function() { window.importOpen('wallet'); } },
  { label: 'Toggle Theme',       icon: '🌙', meta: 'Action',    action: function() { window.toggleTheme(); } },
  { label: 'Toggle Workspace',   icon: '⚡', meta: 'Action',    action: function() { window.toggleWorkspaceMode(); } },
  { label: 'Ask Eli',            icon: '✦',  meta: 'Action',    action: function() { window.navigateTo('eli'); } },
  { label: 'Configure Integrations', icon: '🔌', meta: 'Action', action: function() { window.navigateTo('integrations'); } },
  /* Admin */
  { label: 'Admin Overview',     icon: '🔭', meta: 'Admin',     action: function() { if (window.isAdmin()) { window.navigateTo('admin-overview'); } else { window.toast('Admin access required', 'warn'); } } },
  { label: 'Admin Users',        icon: '👤', meta: 'Admin',     action: function() { if (window.isAdmin()) { window.navigateTo('admin-users'); }    else { window.toast('Admin access required', 'warn'); } } },
  { label: 'Admin System',       icon: '🖥️', meta: 'Admin',     action: function() { if (window.isAdmin()) { window.navigateTo('admin-system'); }   else { window.toast('Admin access required', 'warn'); } } },
];

window.openCmd = function() {
  var palette = document.getElementById('command-palette');
  var input   = document.getElementById('cmd-input');
  if (!palette) { return; }
  palette.classList.add('open');
  _cmdIdx = 0;
  _cmdResults = COMMANDS;
  _renderCmdResults('');
  if (input) { input.value = ''; if (input.focus) { input.focus(); } }
};

window.closeCmd = function() {
  var palette = document.getElementById('command-palette');
  if (palette) { palette.classList.remove('open'); }
};

window.cmdSearch = function(query) {
  query = (query || '').toLowerCase().trim();
  _cmdIdx = 0;
  if (!query) {
    _cmdResults = COMMANDS;
  } else {
    _cmdResults = COMMANDS.filter(function(c) {
      return c.label.toLowerCase().includes(query) ||
             c.meta.toLowerCase().includes(query);
    });
  }
  _renderCmdResults(query);
};

window.cmdKeyNav = function(e) {
  if (e.key === 'Escape') { window.closeCmd(); return; }
  if (e.key === 'ArrowDown')  { _cmdIdx = Math.min(_cmdIdx + 1, _cmdResults.length - 1); _renderCmdResults(); return; }
  if (e.key === 'ArrowUp')    { _cmdIdx = Math.max(_cmdIdx - 1, 0);                      _renderCmdResults(); return; }
  if (e.key === 'Enter') {
    if (_cmdResults[_cmdIdx]) { _cmdExecute(_cmdIdx); }
    return;
  }
};

function _cmdExecute(idx) {
  var cmd = _cmdResults[idx];
  if (!cmd) { return; }
  window.closeCmd();
  cmd.action();
}

function _renderCmdResults(query) {
  var el = document.getElementById('cmd-results');
  if (!el) { return; }

  if (_cmdResults.length === 0) {
    el.innerHTML = '<div class="cmd-empty">No results for "' + (query || '') + '"</div>';
    return;
  }

  /* Group by meta */
  var groups = {};
  _cmdResults.forEach(function(cmd) {
    if (!groups[cmd.meta]) { groups[cmd.meta] = []; }
    groups[cmd.meta].push(cmd);
  });

  var html  = [];
  var globalIdx = 0;

  Object.keys(groups).forEach(function(groupName) {
    html.push('<span class="cmd-section-label">' + groupName + '</span>');
    groups[groupName].forEach(function(cmd) {
      var myIdx   = _cmdResults.indexOf(cmd);
      var isSelected = myIdx === _cmdIdx;
      html.push(
        '<div class="cmd-item' + (isSelected ? ' selected' : '') + '"' +
        ' onclick="window._cmdExec(' + myIdx + ')"' +
        ' onmouseenter="window._cmdHover(' + myIdx + ')">' +
        '<div class="cmd-item-icon">' + cmd.icon + '</div>' +
        '<span class="cmd-item-name">' + cmd.label + '</span>' +
        '<span class="cmd-item-meta">' + cmd.meta + '</span>' +
        '</div>'
      );
      globalIdx++;
    });
  });

  el.innerHTML = html.join('');

  /* Scroll selected item into view */
  setTimeout(function() {
    var selEl = el.querySelector('.cmd-item.selected');
    if (selEl) { selEl.scrollIntoView({ block: 'nearest' }); }
  }, 0);
}

window._cmdExec   = function(idx) { _cmdExecute(idx); };
window._cmdHover  = function(idx) { _cmdIdx = idx; _renderCmdResults(); };

/* ─────────────────────────────────────────────────────────
   THEME
───────────────────────────────────────────────────────── */
window.toggleTheme = function() {
  var isLight = document.body.classList.contains('light-mode');
  window.setTheme(isLight ? 'dark' : 'light');
};

window.setTheme = function(theme) {
  _applyTheme(theme, true);
};

function _applyTheme(theme, save) {
  document.body.classList.toggle('light-mode', theme === 'light');
  var btn = document.getElementById('theme-toggle');
  if (btn) { btn.textContent = theme === 'light' ? '🌙' : '☀️'; }
  if (save) { localStorage.setItem('colab_theme', theme); }
}

/* ─────────────────────────────────────────────────────────
   WORKSPACE MODE
───────────────────────────────────────────────────────── */
window.setWorkspaceMode = function(mode) {
  _applyWsMode(mode, true);
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

window.toggleWorkspaceMode = function() {
  var isFocus = document.body.classList.contains('focus-mode');
  window.setWorkspaceMode(isFocus ? 'command' : 'focus');
};

function _applyWsMode(mode, save) {
  document.body.classList.toggle('focus-mode', mode === 'focus');
  var chip = document.getElementById('ws-mode-chip');
  var chipSpan = chip ? chip.querySelector('span') : null;
  if (chipSpan) { chipSpan.textContent = mode === 'focus' ? 'FOCUS' : 'CMD'; }
  if (save) { localStorage.setItem('colab_ws_mode', mode); }
}

/* ─────────────────────────────────────────────────────────
   CURRENCY DROPDOWN
───────────────────────────────────────────────────────── */
window.toggleCurrencyDropdown = function() {
  var dd = document.getElementById('curr-dropdown');
  if (!dd) { return; }
  var isOpen = dd.style.display === 'block';
  dd.style.display = isOpen ? 'none' : 'block';
};

function _renderCurrencyDropdown() {
  var dd = document.getElementById('curr-dropdown');
  if (!dd) { return; }
  dd.innerHTML = CONFIG.CURRENCIES.map(function(c) {
    return (
      '<div class="curr-option' + (window.AC === c.code ? ' active' : '') + '"' +
      ' onclick="window._setCurr(\'' + c.code + '\')">' +
      c.flag + ' ' + c.code + ' <span style="color:var(--text-dim);font-size:10px">' + c.symbol + '</span>' +
      '</div>'
    );
  }).join('');
}

window._setCurr = function(code) {
  window.setActiveCurrency(code);
  var dd = document.getElementById('curr-dropdown');
  if (dd) { dd.style.display = 'none'; }
  _renderCurrBtn();
  _renderCurrencyDropdown();
};

function _renderCurrBtn() {
  var cur   = CONFIG.getCurrency(window.AC);
  var flag  = document.getElementById('curr-flag');
  var name  = document.getElementById('curr-name');
  if (flag) { flag.textContent = cur.flag; }
  if (name) { name.textContent = cur.code; }
}

/* ─────────────────────────────────────────────────────────
   ONBOARDING
───────────────────────────────────────────────────────── */
window.showOnboarding = function() {
  var ob = document.getElementById('onboard-overlay');
  var content = document.getElementById('ob-content');
  if (!ob || !content) { return; }
  content.innerHTML = _buildOnboarding(1);
  ob.classList.add('open');
};

var _obStep  = 1;
var _obTotal = 3;
var _obBiz   = '';
var _obName  = '';

function _buildOnboarding(step) {
  _obStep = step;
  var stepsHtml = Array.from({ length: _obTotal }, function(_, i) {
    return '<div class="ob-step' + (i + 1 < step ? ' done' : i + 1 === step ? ' active' : '') + '"></div>';
  }).join('');

  var html = [];
  html.push('<div class="ob-logo">');
  html.push('  <div class="ob-logo-mark"><span style="color:#fff;font-size:18px;font-weight:800">C</span></div>');
  html.push('  <div><div style="font-size:18px;font-weight:800;color:var(--text)">CoLAB OS</div><div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + CONFIG.PLATFORM.version + ' · Stop Renting. Start Owning.</div></div>');
  html.push('</div>');
  html.push('<div class="ob-steps">' + stepsHtml + '</div>');
  html.push('<div class="ob-card">');

  if (step === 1) {
    html.push('  <div style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:var(--text);margin-bottom:6px">Welcome to CoLAB OS</div>');
    html.push('  <div style="font-size:12px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:24px">Let\'s set up your workspace. Takes 60 seconds.</div>');
    html.push('  <div style="margin-bottom:12px"><label class="label-xs">Your Name</label><input id="ob-name" class="inp" placeholder="Brandon" value="' + window.D.user.name + '" style="font-size:14px"/></div>');
    html.push('  <div style="margin-bottom:20px"><label class="label-xs">Business Name</label><input id="ob-biz" class="inp" placeholder="My Business" value="' + CONFIG.BUSINESS.name + '" style="font-size:14px"/></div>');
    html.push('  <button class="btn-primary" style="width:100%;justify-content:center;font-size:13px;padding:11px" onclick="_obNext(1)">Continue →</button>');
  }

  if (step === 2) {
    html.push('  <div style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:var(--text);margin-bottom:6px">Your Industry</div>');
    html.push('  <div style="font-size:12px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:24px">Pick the closest match. This shapes your default templates.</div>');
    html.push('  <div class="ob-bundles">');
    [
      { icon: '🔧', name: 'Trades & Services',      desc: 'Plumbing, electrical, construction'  },
      { icon: '🚗', name: 'Automotive',              desc: 'Panel beating, mechanics, detailing' },
      { icon: '💼', name: 'Professional Services',   desc: 'Consulting, legal, accounting'       },
      { icon: '🛒', name: 'Retail & E-Commerce',     desc: 'Products, online store, wholesale'   },
    ].forEach(function(b, i) {
      html.push('<div class="ob-bundle" id="ob-ind-' + i + '" onclick="_obSelectIndustry(' + i + ',\'' + b.name + '\')">');
      html.push('  <div class="ob-bundle-icon">' + b.icon + '</div>');
      html.push('  <div class="ob-bundle-name">' + b.name + '</div>');
      html.push('  <div class="ob-bundle-desc">' + b.desc + '</div>');
      html.push('</div>');
    });
    html.push('  </div>');
    html.push('  <div style="display:flex;gap:8px">');
    html.push('    <button class="btn-ghost" onclick="_obBack()">← Back</button>');
    html.push('    <button class="btn-primary" style="flex:1;justify-content:center" onclick="_obNext(2)">Continue →</button>');
    html.push('  </div>');
  }

  if (step === 3) {
    html.push('  <div style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:var(--text);margin-bottom:6px">You\'re all set</div>');
    html.push('  <div style="font-size:12px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:24px">CoLAB OS is ready. Your data stays on your device.</div>');
    html.push('  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">');
    [
      { icon: '💰', title: 'Wallet is live',         desc: 'Your ledger is ready for transactions' },
      { icon: '⚡', title: 'Automations ready',      desc: 'Connect n8n in Integrations to activate' },
      { icon: '✦',  title: 'Eli is standing by',     desc: 'Connect Claude or OpenAI to unlock AI' },
    ].forEach(function(item) {
      html.push('<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;background:var(--panel);border:1px solid var(--border)">');
      html.push('  <span style="font-size:20px">' + item.icon + '</span>');
      html.push('  <div><div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:2px">' + item.title + '</div>');
      html.push('  <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + item.desc + '</div></div>');
      html.push('</div>');
    });
    html.push('  </div>');
    html.push('  <button class="btn-primary" style="width:100%;justify-content:center;font-size:13px;padding:11px" onclick="_obFinish()">Enter CoLAB OS →</button>');
  }

  html.push('</div>');
  return html.join('\n');
}

window._obNext = function(step) {
  if (step === 1) {
    var nameEl = document.getElementById('ob-name');
    var bizEl  = document.getElementById('ob-biz');
    var name   = nameEl ? nameEl.value.trim() : '';
    var biz    = bizEl  ? bizEl.value.trim()  : '';
    if (!name) { window.toast('Please enter your name', 'warn'); return; }
    _obName = name;
    _obBiz  = biz || 'CoLAB';
    /* Write immediately to D.user and CONFIG */
    window.D.user.name  = _obName;
    CONFIG.BUSINESS.name = _obBiz;
    localStorage.setItem('colab_user_name', _obName);
    _updateAvatars(_obName);
  }
  var content = document.getElementById('ob-content');
  if (content) { content.innerHTML = _buildOnboarding(step + 1); }
};

window._obBack = function() {
  var content = document.getElementById('ob-content');
  if (content) { content.innerHTML = _buildOnboarding(_obStep - 1); }
};

window._obSelectIndustry = function(idx, name) {
  document.querySelectorAll('.ob-bundle').forEach(function(el) { el.classList.remove('selected'); });
  var el = document.getElementById('ob-ind-' + idx);
  if (el) { el.classList.add('selected'); }
  window.D.user.industry = name;
};

window._obFinish = function() {
  localStorage.setItem('colab_onboarded', '1');
  localStorage.setItem('colab_user_name', _obName || window.D.user.name);
  window.logActivity('Onboarding completed', { name: window.D.user.name, biz: CONFIG.BUSINESS.name });
  var ob = document.getElementById('onboard-overlay');
  if (ob) { ob.classList.remove('open'); }
  window.renderApp();
  window.toast('Welcome to CoLAB OS, ' + window.D.user.name + '! 🚀', 'success');
};

/* ─────────────────────────────────────────────────────────
   KEYBOARD SHORTCUTS
───────────────────────────────────────────────────────── */
function _onKeyDown(e) {
  /* Ctrl+K or Cmd+K — open command palette */
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    var palette = document.getElementById('command-palette');
    if (palette && palette.classList.contains('open')) {
      window.closeCmd();
    } else {
      window.openCmd();
    }
    return;
  }
  /* Escape — close overlays in priority order */
  if (e.key === 'Escape') {
    var palette = document.getElementById('command-palette');
    if (palette && palette.classList.contains('open')) { window.closeCmd(); return; }
    var modal   = document.getElementById('modal-root');
    if (modal   && modal.classList.contains('open'))   { window.closeModal(); return; }
    var ob      = document.getElementById('onboard-overlay');
    if (ob      && ob.classList.contains('open'))      { return; /* don't close onboarding on escape */ }
    return;
  }
}

/* ─────────────────────────────────────────────────────────
   GLOBAL CLICK HANDLER — close dropdowns / flyout
───────────────────────────────────────────────────────── */
function _onDocClick(e) {
  /* Close currency dropdown if clicking outside */
  var dd  = document.getElementById('curr-dropdown');
  var btn = document.getElementById('curr-btn');
  if (dd && dd.style.display === 'block') {
    if (btn && !btn.contains(e.target) && !dd.contains(e.target)) {
      dd.style.display = 'none';
    }
  }
  /* Close flyout if clicking outside sidebar/flyout */
  var flyout  = document.getElementById('flyout');
  var sidebar = document.getElementById('sidebar');
  if (flyout && flyout.classList.contains('open')) {
    if (!flyout.contains(e.target) && !sidebar.contains(e.target)) {
      flyout.classList.remove('open');
    }
  }
}

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function _updateAvatars(name) {
  var initial = name ? name[0].toUpperCase() : 'B';
  var els = ['user-initial', 'chip-dot-initial'];
  els.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.textContent = initial; }
  });
  var nameEl = document.getElementById('topbar-user-name');
  if (nameEl) { nameEl.textContent = name; }
}

function _loadBiz() {
  try { return JSON.parse(localStorage.getItem('colab_biz') || '{}'); }
  catch (e) { return {}; }
}

/* Brand click — go to dashboard */
window.brandClick = function() {
  window.navigateTo('dashboard');
};

/* ═══════════════════════════════════════════════════════════
   PRO GATE SCREEN
   Shown when a Pro page is accessed without a license.
   Replaces the page content entirely.
═══════════════════════════════════════════════════════════ */
function _renderProGate(pageId) {
  /* Find what feature this page maps to */
  var featureMap = {
    'hub':            { key: 'automationHub',  icon: '⚡', label: 'Automation Hub'   },
    'automations':    { key: 'automationHub',  icon: '🔁', label: 'Automations'      },
    'integrations':   { key: 'integrations',   icon: '🔌', label: 'Integrations'     },
    'eli':            { key: 'eliAI',          icon: '✦',  label: 'Eli AI Assistant' },
    'profit-loss':    { key: 'plOverview',     icon: '📉', label: 'P&L Overview'     },
    'revenue':        { key: 'revenueReports', icon: '📈', label: 'Revenue Reports'  },
    'tax-estimate':   { key: 'taxEstimate',    icon: '🧾', label: 'Tax Estimator'    },
    'products':       { key: 'productSelling', icon: '🍋', label: 'Products'         },
    'admin-overview': { key: 'adminPanel',     icon: '🔭', label: 'Admin Panel'      },
    'admin-users':    { key: 'adminPanel',     icon: '👤', label: 'Admin Panel'      },
    'admin-mkt':      { key: 'adminPanel',     icon: '🏪', label: 'Admin Panel'      },
    'admin-system':   { key: 'adminPanel',     icon: '🖥️', label: 'Admin Panel'      },
  };
  var feat = featureMap[pageId] || { key: pageId, icon: '🔒', label: pageId };

  return [
    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;padding:60px 20px;text-align:center">',

    /* Lock icon */
    '  <div style="width:64px;height:64px;border-radius:16px;background:var(--accent-d);border:1px solid rgba(249,115,22,.25);display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:20px;box-shadow:0 0 40px rgba(249,115,22,.15)">' + feat.icon + '</div>',

    /* Headline */
    '  <h2 style="font-size:20px;font-weight:800;letter-spacing:-.4px;margin-bottom:8px">' + feat.label + ' is a <span style="color:var(--accent)">Pro</span> feature</h2>',
    '  <p style="font-size:12px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:32px;max-width:400px;line-height:1.7">Unlock ' + feat.label + ' and all Pro features with a one-time purchase.<br/>Own it forever. No subscription.</p>',

    /* Unlock CTA */
    '  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:32px">',
    '    <button class="btn-primary" style="font-size:13px;padding:11px 22px" onclick="_proUnlockFlow()">',
    '      ⚡ Unlock CoLAB OS Pro',
    '    </button>',
    '    <button class="btn-ghost" style="font-size:13px;padding:11px 22px" onclick="_proEnterKey()">',
    '      Enter License Key',
    '    </button>',
    '  </div>',

    /* What's included */
    '  <div style="background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:20px 24px;max-width:480px;text-align:left">',
    '    <div style="font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:14px">Pro includes</div>',
    '    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">',
    Object.keys(CONFIG.GATES.FEATURES).filter(function(k) { return CONFIG.GATES.FEATURES[k].pro; }).map(function(k) {
      return '      <div style="display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--text-sub)"><span style="color:var(--accent);font-size:12px">✓</span>' + CONFIG.GATES.FEATURES[k].label + '</div>';
    }).join('\n'),
    '    </div>',
    '  </div>',

    '</div>',
  ].join('\n');
}

/* ─────────────────────────────────────────────────────────
   PRO UNLOCK FLOW HANDLERS
───────────────────────────────────────────────────────── */

/* Opens Lemon Squeezy checkout */
window._proUnlockFlow = function() {
  window.open(CONFIG.BILLING.automationUnlock, '_blank');
};

/* Shows a key entry modal */
window._proEnterKey = function() {
  window.modal(
    'Enter License Key',
    '<div style="padding:4px">' +
    '  <p style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:16px;line-height:1.6">Enter your CoLAB OS Pro license key.<br/>You received this after your Lemon Squeezy purchase.</p>' +
    '  <label class="label-xs">License Key</label>' +
    '  <input id="pro-key-input" class="inp" placeholder="COLAB-XXXX-XXXX-XXXX-XXXX" style="font-size:14px;font-family:var(--font-mono);letter-spacing:.5px;margin-bottom:14px"/>' +
    '  <div style="display:flex;gap:8px">' +
    '    <button class="btn-ghost" onclick="window.closeModal()" style="flex:1;justify-content:center">Cancel</button>' +
    '    <button class="btn-primary" onclick="window._proActivateFromModal()" style="flex:1;justify-content:center">Activate Pro →</button>' +
    '  </div>' +
    '  <div id="pro-key-error" style="display:none;margin-top:10px;font-size:11px;color:var(--red);font-family:var(--font-mono)"></div>' +
    '</div>'
  );
  setTimeout(function() {
    var inp = document.getElementById('pro-key-input');
    if (inp && inp.focus) { inp.focus(); }
  }, 100);
};

window._proActivateFromModal = function() {
  var inp = document.getElementById('pro-key-input');
  var key = inp ? inp.value.trim() : '';
  var err = document.getElementById('pro-key-error');

  if (!key) {
    if (err) { err.textContent = 'Please enter your license key.'; err.style.display = 'block'; }
    return;
  }

  var ok = CONFIG.activatePro(key);
  if (ok) {
    window.closeModal();
    window.toast('✓ CoLAB OS Pro activated — welcome!', 'success');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
  } else {
    if (err) { err.textContent = 'Invalid key. Check your purchase email.'; err.style.display = 'block'; }
  }
};

/* ═══════════════════════════════════════════════════════════
   PLUGIN COMMAND INTEGRATION
   Merges plugin commands into the command palette COMMANDS array.
   Called once on boot after plugins are registered.
═══════════════════════════════════════════════════════════ */
function _mergePluginCommands() {
  if (!window._pluginCommands || !window._pluginCommands.length) { return; }
  window._pluginCommands.forEach(function(cmd) {
    if (cmd.label && typeof cmd.action === 'function') {
      COMMANDS.push(cmd);
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   BOOT ADDITIONS
   These run at the end of the DOMContentLoaded handler.
   Appended here so they execute after the main boot sequence.
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  /* Restore Pro state from localStorage */
  CONFIG.restoreProState();

  /* Merge any plugin commands that were registered before DOMContentLoaded */
  _mergePluginCommands();
});
