/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — pages-apps.js
   Render functions: Marketplace, Products, Downloads, Settings
   Settings is the OS kernel — all configuration writes here.
   Rules: reads window.D / CONFIG. Settings writes back to both.
          All save actions persist to localStorage.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   MARKETPLACE
───────────────────────────────────────────────────────── */
window.renderMarketplace = function() {
  var D    = window.D;
  var f    = window.fmt;
  var html = [];

  var featured   = D.marketplace.filter(function(t) { return t.featured;   });
  var installed  = D.marketplace.filter(function(t) { return t.installed;  });
  var available  = D.marketplace.filter(function(t) { return !t.installed; });

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">Marketplace</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + D.marketplace.length + ' tools · ' + installed.length + ' installed</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <a href="' + CONFIG.WEBSITE.marketplace + '" target="_blank" class="btn-ghost" style="font-size:11px">↗ Browse All Tools</a>');
  html.push('    <button class="btn-primary" onclick="window.toast(\'Submit a tool: submit@colabos.store\',\'info\')">+ Submit Tool</button>');
  html.push('  </div>');
  html.push('</div>');

  /* Featured tools */
  if (featured.length > 0) {
    html.push('<div class="label-xs" style="margin-bottom:8px">Featured</div>');
    html.push('<div class="product-grid" style="margin-bottom:18px">');
    featured.forEach(function(t) {
      html.push(_marketplaceCard(t, f));
    });
    html.push('</div>');
  }

  /* Installed tools */
  if (installed.length > 0) {
    html.push('<div class="label-xs" style="margin-bottom:8px">Installed (' + installed.length + ')</div>');
    html.push('<div class="glass" style="overflow:hidden;margin-bottom:18px">');
    var headers = ['Tool', 'Category', 'Status', 'Rating', 'Downloads', 'Actions'];
    var rows = installed.map(function(t) {
      return [
        '<div><div style="font-size:12.5px;font-weight:600;color:var(--text)">' + t.name + '</div><div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + t.desc + '</div></div>',
        '<span class="tag" style="background:var(--panel);color:var(--text-dim)">' + t.cat + '</span>',
        '<span class="tag" style="background:var(--green-d);color:var(--green)">✓ installed</span>',
        '<span style="font-family:var(--font-mono);color:var(--accent)">' + (t.rating > 0 ? '★ ' + t.rating : '—') + '</span>',
        '<span style="font-family:var(--font-mono);color:var(--text-dim)">' + t.downloads + '</span>',
        '<div style="display:flex;gap:4px">' +
          '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window.toast(\'Open ' + t.name + '\',\'info\')">Open</button>' +
          '<button class="btn-ghost" style="font-size:10px;padding:3px 8px;color:var(--red);border-color:rgba(239,68,68,.2)" onclick="_mktUninstall(\'' + t.id + '\')">Uninstall</button>' +
        '</div>',
      ];
    });
    html.push(window.table(headers, rows));
    html.push('</div>');
  }

  /* Available tools */
  if (available.length > 0) {
    html.push('<div class="label-xs" style="margin-bottom:8px">Available (' + available.length + ')</div>');
    html.push('<div class="product-grid">');
    available.forEach(function(t) {
      html.push(_marketplaceCard(t, f));
    });
    html.push('</div>');
  }

  return html.join('\n');
};

function _marketplaceCard(t, f) {
  var catColors = {
    Automation: { bg: 'var(--accent-d)', c: 'var(--accent)' },
    Template:   { bg: 'var(--purple-d)', c: 'var(--purple)' },
    AI:         { bg: 'rgba(96,165,250,.08)', c: 'var(--blue)' },
  };
  var cc = catColors[t.cat] || { bg: 'var(--panel)', c: 'var(--text-dim)' };
  var html = [];
  html.push('<div class="product-card">');
  html.push('  <div class="product-thumb"><span style="font-size:36px">' + (t.icon || '🧩') + '</span></div>');
  html.push('  <div class="product-body">');
  html.push('    <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">');
  html.push('      <span class="product-name" style="margin-bottom:0">' + t.name + '</span>');
  if (t.verified) { html.push('      <span style="font-size:10px;color:var(--green)" title="Verified by CoLAB">✓</span>'); }
  html.push('    </div>');
  html.push('    <span class="tag" style="background:' + cc.bg + ';color:' + cc.c + ';margin-bottom:7px;display:inline-flex">' + t.cat + '</span>');
  html.push('    <p class="product-desc">' + t.desc + '</p>');
  html.push('    <div class="product-foot">');
  html.push('      <span class="product-price">' + (t.price > 0 ? window.fmt(t.price) : 'Free') + '</span>');
  if (t.installed) {
    html.push('      <button class="btn-ghost" style="font-size:11px;padding:5px 11px" onclick="window.toast(\'Open ' + t.name + '\',\'info\')">Open</button>');
  } else {
    html.push('      <button class="btn-primary" style="font-size:11px;padding:5px 11px" onclick="_mktInstall(\'' + t.id + '\')">' + (t.price > 0 ? 'Buy' : 'Install') + '</button>');
  }
  html.push('    </div>');
  if (t.rating > 0) {
    html.push('    <div style="font-size:9.5px;color:var(--text-dim);font-family:var(--font-mono);margin-top:8px">★ ' + t.rating + ' · ' + t.downloads + ' installs</div>');
  }
  html.push('  </div>');
  html.push('</div>');
  return html.join('\n');
}

window._mktInstall = function(id) {
  var t = window.D.marketplace.find(function(x) { return x.id === id; });
  if (!t) { return; }
  if (t.price > 0) {
    window.open(CONFIG.WEBSITE.marketplace, '_blank');
    return;
  }
  t.installed = true;
  window.logActivity('Tool installed', { id: id, name: t.name });
  window.toast('✓ ' + t.name + ' installed', 'success');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

window._mktUninstall = function(id) {
  var t = window.D.marketplace.find(function(x) { return x.id === id; });
  if (!t) { return; }
  t.installed = false;
  window.logActivity('Tool uninstalled', { id: id, name: t.name });
  window.toast(t.name + ' uninstalled', 'info');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

/* ─────────────────────────────────────────────────────────
   PRODUCTS (Lemon Squeezy seller page)
───────────────────────────────────────────────────────── */
window.renderProducts = function() {
  var D    = window.D;
  var f    = window.fmt;
  var html = [];

  var live  = D.products.filter(function(p) { return p.status === 'live';  });
  var draft = D.products.filter(function(p) { return p.status === 'draft'; });

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">Products</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + live.length + ' live · ' + draft.length + ' draft · Powered by Lemon Squeezy</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <a href="' + CONFIG.BILLING.starterUnlock + '" target="_blank" class="btn-ghost" style="font-size:11px">🍋 Lemon Squeezy Dashboard</a>');
  html.push('    <button class="btn-primary" onclick="window.toast(\'Add product: create in Lemon Squeezy then add lsSlug to D.products\',\'info\')">+ Add Product</button>');
  html.push('  </div>');
  html.push('</div>');

  /* Lemon Squeezy integration nudge */
  if (!window.hasCreds('lemonsqueezy')) {
    html.push('<div style="padding:12px 16px;border-radius:10px;background:rgba(250,204,21,.06);border:1px solid rgba(250,204,21,.2);border-left:3px solid #facc15;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">');
    html.push('  <div><div style="font-size:11.5px;font-weight:600;color:#facc15;margin-bottom:2px">🍋 Connect Lemon Squeezy</div>');
    html.push('  <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Add your Store ID and API Key to sync products and receive purchase webhooks.</div></div>');
    html.push('  <button class="btn-primary" style="font-size:11px" onclick="window.navigateTo(\'integrations\')">Configure →</button>');
    html.push('</div>');
  }

  /* Product grid */
  html.push('<div class="product-grid" style="margin-bottom:18px">');
  D.products.forEach(function(p) {
    var isLive  = p.status === 'live';
    var buyUrl  = p.lsSlug ? CONFIG.BILLING.starterUnlock.replace('starter-pack', p.lsSlug) : '';

    html.push('<div class="product-card" style="' + (!isLive ? 'opacity:.65' : '') + '">');
    html.push('  <div class="product-thumb"><span>' + (p.emoji || '📦') + '</span></div>');
    html.push('  <div class="product-body">');
    html.push('    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">');
    html.push('      <span class="product-name" style="margin-bottom:0">' + p.name + '</span>');
    html.push('      ' + window.pill(p.status));
    html.push('    </div>');
    html.push('    <span class="tag" style="background:var(--panel);color:var(--text-dim);margin-bottom:7px;display:inline-flex">' + p.cat + '</span>');
    html.push('    <p class="product-desc">' + p.desc + '</p>');
    html.push('    <div class="product-foot">');
    html.push('      <span class="product-price">' + f(p.price) + '</span>');
    html.push('      <div style="display:flex;gap:5px">');
    if (isLive && buyUrl) {
      html.push('        <a href="' + buyUrl + '" target="_blank" class="btn-primary" style="font-size:11px;padding:5px 12px;text-decoration:none">Buy 🍋</a>');
    } else if (isLive) {
      html.push('        <button class="btn-primary" style="font-size:11px;padding:5px 12px" onclick="window.toast(\'Add lsSlug to this product in data.js\',\'info\')">Buy 🍋</button>');
    } else {
      html.push('        <button class="btn-ghost" style="font-size:11px;padding:5px 12px" onclick="window.toast(\'Publish in Lemon Squeezy first, then update status in data.js\',\'info\')">Draft</button>');
    }
    html.push('      </div>');
    html.push('    </div>');
    html.push('  </div>');
    html.push('</div>');
  });
  html.push('</div>');

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   DOWNLOADS
───────────────────────────────────────────────────────── */
window.renderDownloads = function() {
  var D    = window.D;
  var html = [];

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">Downloads</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + D.downloads.length + ' files available</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <button class="btn-primary" onclick="_dlUploadOpen()">+ Add File</button>');
  html.push('  </div>');
  html.push('</div>');

  /* Category filter tabs */
  var cats    = ['All'].concat([...new Set(D.downloads.map(function(d) { return d.cat; }))]);
  html.push('<div style="display:flex;gap:5px;margin-bottom:14px;flex-wrap:wrap" id="dl-cat-tabs">');
  cats.forEach(function(cat) {
    html.push('<button class="btn-ghost" style="font-size:11px;padding:4px 11px" onclick="_dlFilterCat(\'' + cat + '\')" data-cat="' + cat + '">' + cat + '</button>');
  });
  html.push('</div>');

  /* Download rows */
  html.push('<div class="glass" style="overflow:hidden" id="dl-list">');
  D.downloads.forEach(function(dl) {
    html.push(_dlRow(dl));
  });
  html.push('</div>');

  /* Upload drop zone (hidden by default) */
  html.push('<div id="dl-upload-zone" style="display:none;margin-top:14px">');
  html.push('  <div class="glass" style="padding:20px">');
  html.push('    <div class="label-xs" style="margin-bottom:12px">Add New File</div>');
  html.push('    <div class="import-drop" style="min-height:140px" onclick="document.getElementById(\'dl-file-input\').click()" ondragover="event.preventDefault();this.classList.add(\'drag-over\')" ondragleave="this.classList.remove(\'drag-over\')" ondrop="event.preventDefault();this.classList.remove(\'drag-over\');_dlHandleFile(event.dataTransfer.files[0])">');
  html.push('      <input type="file" id="dl-file-input" style="display:none" onchange="_dlHandleFile(this.files[0])"/>');
  html.push('      <div style="font-size:32px;margin-bottom:10px">📁</div>');
  html.push('      <div style="font-size:13px;font-weight:600;margin-bottom:4px">Drop file here or click to browse</div>');
  html.push('      <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Any file type · Max 100 MB · Stored locally</div>');
  html.push('    </div>');
  html.push('    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">');
  html.push('      <div><label class="label-xs">File Name</label><input id="dl-name-input" class="inp" placeholder="My Template v1.0" style="font-size:13px"/></div>');
  html.push('      <div><label class="label-xs">Category</label><select id="dl-cat-input" class="inp" style="font-size:13px"><option>Template</option><option>OS</option><option>Workflow</option><option>Document</option><option>Other</option></select></div>');
  html.push('      <div style="grid-column:1/-1"><label class="label-xs">Description</label><input id="dl-desc-input" class="inp" placeholder="Brief description of this file" style="font-size:13px"/></div>');
  html.push('    </div>');
  html.push('    <div style="display:flex;gap:8px;margin-top:12px">');
  html.push('      <button class="btn-ghost" onclick="_dlUploadClose()">Cancel</button>');
  html.push('      <button class="btn-primary" onclick="_dlSaveFile()">Save to Downloads</button>');
  html.push('    </div>');
  html.push('  </div>');
  html.push('</div>');

  return html.join('\n');
};

function _dlRow(dl) {
  var html = [];
  html.push('<div class="dlrow" data-cat="' + dl.cat + '" onclick="_dlDownload(\'' + dl.id + '\')">');
  html.push('  <div style="width:38px;height:38px;border-radius:10px;background:var(--panel-2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">' + (dl.icon || '📄') + '</div>');
  html.push('  <div style="flex:1;min-width:0">');
  html.push('    <div style="font-size:12.5px;font-weight:600;color:var(--text)">' + dl.name + ' <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + dl.version + '</span></div>');
  html.push('    <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + dl.desc + '</div>');
  html.push('    <div style="display:flex;align-items:center;gap:10px;margin-top:4px">');
  html.push('      <span class="tag" style="background:var(--panel);color:var(--text-dim)">' + dl.cat + '</span>');
  html.push('      <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + dl.size + '</span>');
  html.push('      <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + dl.date + '</span>');
  html.push('    </div>');
  html.push('  </div>');
  html.push('  <button class="btn-primary" style="font-size:11px;padding:6px 14px;flex-shrink:0" onclick="event.stopPropagation();_dlDownload(\'' + dl.id + '\')">↓ Download</button>');
  html.push('</div>');
  return html.join('\n');
}

window._dlDownload = function(id) {
  var dl = window.D.downloads.find(function(x) { return x.id === id; });
  if (!dl) { return; }
  if (dl.url && dl.url !== '#' + 'dl-' + id.toLowerCase().replace('dl-','')) {
    window.open(dl.url, '_blank');
  }
  window.logActivity('File downloaded', { id: id, name: dl.name });
  window.toast('↓ Downloading ' + dl.name, 'success');
};

window._dlUploadOpen  = function() {
  var z = document.getElementById('dl-upload-zone');
  if (z) { z.style.display = 'block'; }
};
window._dlUploadClose = function() {
  var z = document.getElementById('dl-upload-zone');
  if (z) { z.style.display = 'none'; }
};

var _dlPendingFile = null;
window._dlHandleFile = function(file) {
  if (!file) { return; }
  _dlPendingFile = file;
  var nameInput = document.getElementById('dl-name-input');
  if (nameInput && !nameInput.value) { nameInput.value = file.name; }
  window.toast('File selected: ' + file.name, 'info');
};

window._dlSaveFile = function() {
  var nameEl = document.getElementById('dl-name-input');
  var catEl  = document.getElementById('dl-cat-input');
  var descEl = document.getElementById('dl-desc-input');
  var name   = nameEl ? nameEl.value.trim() : '';
  var cat    = catEl  ? catEl.value         : 'Other';
  var desc   = descEl ? descEl.value.trim() : '';

  if (!name) { window.toast('Please enter a file name', 'warn'); return; }

  var icons = { OS: '💿', Template: '📋', Workflow: '⚡', Document: '📄', Other: '📁' };
  var newDl = {
    id:      'DL-' + String(window.D.downloads.length + 1).padStart(3, '0'),
    name:    name,
    version: 'v1.0',
    cat:     cat,
    icon:    icons[cat] || '📁',
    size:    _dlPendingFile ? _dlFormatSize(_dlPendingFile.size) : '—',
    date:    new Date().toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
    desc:    desc || 'User uploaded file',
    url:     _dlPendingFile ? URL.createObjectURL(_dlPendingFile) : '#',
  };

  window.D.downloads.unshift(newDl);
  _dlPendingFile = null;
  window.logActivity('File added to Downloads', { name: name, cat: cat });
  window.toast('✓ ' + name + ' added to Downloads', 'success');
  window._dlUploadClose();
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

function _dlFormatSize(bytes) {
  if (!bytes) { return '—'; }
  if (bytes < 1024)       { return bytes + ' B'; }
  if (bytes < 1048576)    { return Math.round(bytes / 1024)    + ' KB'; }
  if (bytes < 1073741824) { return (bytes / 1048576).toFixed(1)  + ' MB'; }
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

window._dlFilterCat = function(cat) {
  var rows = document.querySelectorAll('#dl-list [data-cat]');
  rows.forEach(function(row) {
    row.style.display = (cat === 'All' || row.dataset.cat === cat) ? 'flex' : 'none';
  });
};

/* ─────────────────────────────────────────────────────────
   SETTINGS — OS KERNEL
   Single source of truth for all runtime configuration.
   All writes go to: window.D.user, CONFIG.BUSINESS,
                     window.AC, localStorage, body classes.
───────────────────────────────────────────────────────── */
window.renderSettings = function() {
  var D    = window.D;
  var html = [];

  /* Load persisted business settings into CONFIG */
  var storedBiz = _settingsLoadBiz();
  var curTheme  = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  var curMode   = document.body.classList.contains('focus-mode') ? 'focus' : 'command';

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">Settings</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">CoLAB OS v' + CONFIG.PLATFORM.version + ' · ' + CONFIG.PLATFORM.mode.toUpperCase() + ' MODE</p>');
  html.push('  </div>');
  html.push('  <div id="settings-save-indicator" style="display:none;font-size:10px;color:var(--green);font-family:var(--font-mono)">✓ Saved</div>');
  html.push('</div>');

  /* ── SECTION: PROFILE & BUSINESS ── */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px">');
  html.push('  <div class="section-head"><span class="section-title">Profile & Business</span></div>');
  html.push('  <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px">');
  [
    { id: 'set-user-name',    label: 'Your Name',        val: D.user.name,          ph: 'Brandon'                    },
    { id: 'set-biz-name',     label: 'Business Name',    val: storedBiz.name,       ph: 'CoLAB'                      },
    { id: 'set-biz-email',    label: 'Business Email',   val: storedBiz.email,      ph: 'you@example.com'            },
    { id: 'set-biz-phone',    label: 'Phone Number',     val: storedBiz.phone,      ph: '+27 82 000 0000'            },
    { id: 'set-biz-vat',      label: 'VAT Number',       val: storedBiz.vat,        ph: '4123456789'                 },
    { id: 'set-biz-country',  label: 'Country Code',     val: storedBiz.country,    ph: 'ZA'                         },
  ].forEach(function(f) {
    html.push('<div><label class="label-xs">' + f.label + '</label><input id="' + f.id + '" class="inp" value="' + (f.val || '') + '" placeholder="' + f.ph + '" style="font-size:13px" onchange="_settingsSaveBiz()"/></div>');
  });
  html.push('  </div>');
  html.push('  <div style="padding:0 16px 14px">');
  html.push('    <button class="btn-primary" style="font-size:12px" onclick="_settingsSaveBiz()">Save Profile</button>');
  html.push('  </div>');
  html.push('</div>');

  /* ── SECTION: APPEARANCE ── */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px">');
  html.push('  <div class="section-head"><span class="section-title">Appearance</span></div>');
  html.push('  <div style="padding:16px;display:flex;flex-direction:column;gap:14px">');

  /* Theme */
  html.push('  <div>');
  html.push('    <div class="label-xs" style="margin-bottom:8px">Theme</div>');
  html.push('    <div style="display:flex;gap:8px">');
  ['dark','light'].forEach(function(t) {
    var active = curTheme === t;
    html.push('      <button onclick="_settingsSetTheme(\'' + t + '\')" style="flex:1;padding:10px;border-radius:9px;border:1px solid ' + (active ? 'rgba(249,115,22,.4)' : 'var(--border)') + ';background:' + (active ? 'var(--accent-d)' : 'var(--panel)') + ';cursor:pointer;transition:all .15s;font-family:var(--font-sans)">');
    html.push('        <div style="font-size:18px;margin-bottom:5px">' + (t === 'dark' ? '🌙' : '☀️') + '</div>');
    html.push('        <div style="font-size:12px;font-weight:600;color:' + (active ? 'var(--accent)' : 'var(--text-sub)') + '">' + (t === 'dark' ? 'Dark' : 'Light') + '</div>');
    html.push('      </button>');
  });
  html.push('    </div>');
  html.push('  </div>');

  /* Currency */
  html.push('  <div>');
  html.push('    <div class="label-xs" style="margin-bottom:8px">Currency</div>');
  html.push('    <div style="display:flex;gap:7px;flex-wrap:wrap">');
  CONFIG.CURRENCIES.forEach(function(c) {
    var active = window.AC === c.code;
    html.push('    <button onclick="_settingsSetCurrency(\'' + c.code + '\')" style="display:flex;align-items:center;gap:7px;padding:8px 12px;border-radius:9px;border:1px solid ' + (active ? 'rgba(249,115,22,.4)' : 'var(--border)') + ';background:' + (active ? 'var(--accent-d)' : 'var(--panel)') + ';cursor:pointer;transition:all .15s;font-family:var(--font-sans)">');
    html.push('      <span>' + c.flag + '</span>');
    html.push('      <div style="text-align:left"><div style="font-size:11.5px;font-weight:600;color:' + (active ? 'var(--accent)' : 'var(--text-sub)') + '">' + c.code + '</div><div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">' + c.symbol + '</div></div>');
    html.push('    </button>');
  });
  html.push('    </div>');
  html.push('  </div>');
  html.push('  </div>');
  html.push('</div>');

  /* ── SECTION: WORKSPACE MODE ── */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px">');
  html.push('  <div class="section-head"><span class="section-title">Workspace Mode</span></div>');
  html.push('  <div style="padding:16px;display:flex;gap:8px">');
  [
    { id: 'command', label: 'Command Mode', desc: 'All modules visible. Full access to Finance, Sales, Workflows, Reports and Apps.',   icon: '⚡' },
    { id: 'focus',   label: 'Focus Mode',   desc: 'Simplified view: Finance, Projects, Apps only. Reduces distraction during deep work.', icon: '🎯' },
  ].forEach(function(m) {
    var active = curMode === m.id;
    html.push('<div onclick="_settingsSetMode(\'' + m.id + '\')" style="flex:1;padding:14px;border-radius:11px;border:1px solid ' + (active ? 'rgba(249,115,22,.35)' : 'var(--border)') + ';background:' + (active ? 'var(--accent-d)' : 'var(--panel)') + ';cursor:pointer;transition:all .15s">');
    html.push('  <div style="font-size:20px;margin-bottom:7px">' + m.icon + '</div>');
    html.push('  <div style="font-size:12.5px;font-weight:700;color:' + (active ? 'var(--accent)' : 'var(--text)') + ';margin-bottom:5px">' + m.label + '</div>');
    html.push('  <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);line-height:1.5">' + m.desc + '</div>');
    html.push('</div>');
  });
  html.push('  </div>');
  html.push('</div>');

  /* ── SECTION: FEATURE FLAGS ── */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px">');
  html.push('  <div class="section-head"><span class="section-title">Feature Flags</span><span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Read-only · Edit in config.js</span></div>');
  html.push('  <div style="padding:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">');
  Object.keys(CONFIG.FEATURES).forEach(function(key) {
    var on = CONFIG.FEATURES[key];
    html.push('<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 11px;border-radius:8px;background:var(--panel);border:1px solid var(--border)">');
    html.push('  <span style="font-size:11px;color:var(--text-sub);font-family:var(--font-mono)">' + key + '</span>');
    html.push('  <span style="font-size:10px;font-weight:700;color:' + (on ? 'var(--green)' : 'var(--red)') + ';font-family:var(--font-mono)">' + (on ? 'ON' : 'OFF') + '</span>');
    html.push('</div>');
  });
  html.push('  </div>');
  html.push('</div>');

  /* ── SECTION: DATA MANAGEMENT ── */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px">');
  html.push('  <div class="section-head"><span class="section-title">Data Management</span></div>');
  html.push('  <div style="padding:14px;display:flex;flex-direction:column;gap:10px">');
  html.push('    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;background:var(--panel);border:1px solid var(--border)">');
  html.push('      <div><div style="font-size:12px;font-weight:600;color:var(--text)">Export All Data</div><div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Ledger, contacts, invoices, projects as JSON</div></div>');
  html.push('      <button class="btn-ghost" style="font-size:11px" onclick="_settingsExportAll()">↓ Export JSON</button>');
  html.push('    </div>');
  html.push('    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;background:var(--panel);border:1px solid var(--border)">');
  html.push('      <div><div style="font-size:12px;font-weight:600;color:var(--text)">Export Wallet CSV</div><div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Full ledger for your accountant</div></div>');
  html.push('      <button class="btn-ghost" style="font-size:11px" onclick="window.csvExport(window.LEDGER.txns,\'colab-wallet-export.csv\')">↓ Export CSV</button>');
  html.push('    </div>');
  html.push('    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;background:var(--panel);border:1px solid var(--border)">');
  html.push('      <div><div style="font-size:12px;font-weight:600;color:var(--text)">Re-run Onboarding</div><div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Update your profile and business settings</div></div>');
  html.push('      <button class="btn-ghost" style="font-size:11px" onclick="_settingsRunOnboarding()">Run Onboarding</button>');
  html.push('    </div>');
  html.push('    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;background:var(--red-d);border:1px solid rgba(239,68,68,.2)">');
  html.push('      <div><div style="font-size:12px;font-weight:600;color:var(--red)">Clear Activity Log</div><div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Removes all activity feed entries (' + (window.D.activity || []).length + ' events)</div></div>');
  html.push('      <button class="btn-ghost" style="font-size:11px;color:var(--red);border-color:rgba(239,68,68,.2)" onclick="_settingsClearActivity()">Clear Log</button>');
  html.push('    </div>');
  html.push('  </div>');
  html.push('</div>');

  /* ── SECTION: APP INFO ── */
  html.push('<div class="glass" style="padding:16px">');
  html.push('  <div class="label-xs" style="margin-bottom:12px">Application Info</div>');
  html.push('  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">');
  [
    { l: 'App Name',   v: CONFIG.PLATFORM.name    },
    { l: 'Version',    v: CONFIG.PLATFORM.version },
    { l: 'Build',      v: CONFIG.PLATFORM.build   },
    { l: 'Mode',       v: CONFIG.PLATFORM.mode.toUpperCase() },
    { l: 'User',       v: D.user.name             },
    { l: 'Role',       v: D.user.role             },
    { l: 'Tier',       v: D.user.tier             },
    { l: 'Currency',   v: window.AC               },
    { l: 'Website',    v: CONFIG.WEBSITE.home      },
    { l: 'Email',      v: CONFIG.BUSINESS.email    },
  ].forEach(function(row) {
    html.push('<div style="padding:8px 11px;border-radius:8px;background:var(--panel);border:1px solid var(--border)">');
    html.push('  <div class="label-xs" style="margin-bottom:2px">' + row.l + '</div>');
    html.push('  <div style="font-size:11.5px;font-weight:500;color:var(--text-sub);font-family:var(--font-mono)">' + (row.v || '—') + '</div>');
    html.push('</div>');
  });
  html.push('  </div>');
  html.push('</div>');

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   SETTINGS ACTION HANDLERS
───────────────────────────────────────────────────────── */

function _settingsLoadBiz() {
  try { return JSON.parse(localStorage.getItem('colab_biz') || '{}'); }
  catch (e) { return {}; }
}

function _settingsSaveBizToStorage(obj) {
  localStorage.setItem('colab_biz', JSON.stringify(obj));
}

window._settingsSaveBiz = function() {
  var get = function(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  var biz = {
    name:    get('set-biz-name'),
    email:   get('set-biz-email'),
    phone:   get('set-biz-phone'),
    vat:     get('set-biz-vat'),
    country: get('set-biz-country'),
  };

  /* Write to CONFIG.BUSINESS */
  Object.keys(biz).forEach(function(k) {
    if (biz[k]) { CONFIG.BUSINESS[k] = biz[k]; }
  });

  /* Write user name to D.user */
  var nameVal = get('set-user-name');
  if (nameVal) { window.D.user.name = nameVal; }

  /* Update topbar avatar initials */
  var initEl = document.getElementById('user-initial');
  if (initEl && nameVal) { initEl.textContent = nameVal[0].toUpperCase(); }
  var chipEl = document.getElementById('chip-dot-initial');
  if (chipEl && nameVal) { chipEl.textContent = nameVal[0].toUpperCase(); }
  var topEl  = document.getElementById('topbar-user-name');
  if (topEl  && nameVal) { topEl.textContent  = nameVal; }

  /* Persist */
  _settingsSaveBizToStorage(biz);
  window.logActivity('Business profile saved', { name: biz.name });
  window.toast('✓ Profile saved', 'success');

  /* Flash saved indicator */
  var ind = document.getElementById('settings-save-indicator');
  if (ind) {
    ind.style.display = 'block';
    setTimeout(function() { if (ind) { ind.style.display = 'none'; } }, 2000);
  }
};

window._settingsSetTheme = function(theme) {
  if (typeof window.setTheme === 'function') {
    window.setTheme(theme);
  } else {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('colab_theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) { btn.textContent = theme === 'light' ? '🌙' : '☀️'; }
  }
  window.logActivity('Theme changed', { theme: theme });
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

window._settingsSetCurrency = function(code) {
  window.setActiveCurrency(code);
  window.logActivity('Currency changed', { currency: code });
};

window._settingsSetMode = function(mode) {
  if (typeof window.setWorkspaceMode === 'function') {
    window.setWorkspaceMode(mode);
  } else {
    document.body.classList.toggle('focus-mode', mode === 'focus');
    localStorage.setItem('colab_ws_mode', mode);
  }
  window.logActivity('Workspace mode changed', { mode: mode });
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

window._settingsExportAll = function() {
  var payload = {
    exportedAt:  new Date().toISOString(),
    version:     CONFIG.PLATFORM.version,
    user:        window.D.user,
    ledger:      window.LEDGER.txns,
    invoices:    window.D.invoices,
    expenses:    window.D.expenses,
    contacts:    window.D.contacts,
    projects:    window.D.projects,
    orders:      window.D.orders,
    automations: window.D.automations,
    products:    window.D.products,
  };
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = 'colab-export-' + new Date().toISOString().substring(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  window.logActivity('Full data export', { date: new Date().toISOString() });
  window.toast('✓ Data exported as JSON', 'success');
};

window._settingsRunOnboarding = function() {
  if (typeof window.showOnboarding === 'function') {
    window.showOnboarding();
  } else {
    var ob = document.getElementById('onboard-overlay');
    if (ob) { ob.classList.add('open'); }
  }
};

window._settingsClearActivity = function() {
  window.D.activity = [];
  window.toast('Activity log cleared', 'info');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};
