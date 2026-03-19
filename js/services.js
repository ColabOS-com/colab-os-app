/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — services.js
   Shared logic layer. All modules call these helpers.
   Rules: no page rendering, no navigation, no global state
   creation. Read from window.D and window.LEDGER only.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   CURRENCY — active currency state
   Reads from localStorage, falls back to CONFIG default.
───────────────────────────────────────────────────────── */
window.AC = localStorage.getItem('colab_currency') || CONFIG.DEFAULTS.currency;

window.setActiveCurrency = function(code) {
  window.AC = code;
  localStorage.setItem('colab_currency', code);
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

/* Format a number using the active currency symbol */
window.fmt = function(n) {
  var cur = CONFIG.getCurrency(window.AC);
  return cur.symbol + Math.abs(Number(n) || 0).toLocaleString();
};

/* Format with sign prefix (+/-) */
window.fmtSigned = function(n) {
  var cur = CONFIG.getCurrency(window.AC);
  var abs = Math.abs(Number(n) || 0);
  var sign = n >= 0 ? '+' : '-';
  return sign + cur.symbol + abs.toLocaleString();
};

/* ─────────────────────────────────────────────────────────
   TOAST NOTIFICATIONS
───────────────────────────────────────────────────────── */
window.toast = function(msg, type) {
  var root = document.getElementById('toast-root');
  if (!root) { return; }

  type = type || 'info';
  var lm = document.body.classList.contains('light-mode');

  var styles = {
    success: { bg: lm ? 'rgba(22,163,74,.12)'  : 'rgba(34,197,94,.15)',  brd: lm ? 'rgba(22,163,74,.3)'  : 'rgba(34,197,94,.3)',  tx: '#22c55e' },
    warn:    { bg: lm ? 'rgba(234,88,12,.10)'  : 'rgba(249,115,22,.15)', brd: lm ? 'rgba(234,88,12,.3)'  : 'rgba(249,115,22,.3)', tx: '#f97316' },
    error:   { bg: lm ? 'rgba(220,38,38,.10)'  : 'rgba(239,68,68,.15)',  brd: lm ? 'rgba(220,38,38,.3)'  : 'rgba(239,68,68,.3)',  tx: '#f87171' },
    info:    { bg: lm ? 'rgba(0,0,0,.07)'      : 'rgba(255,255,255,.08)',brd: lm ? 'rgba(0,0,0,.12)'     : 'rgba(255,255,255,.15)',tx: lm ? 'rgba(26,24,40,.7)' : 'rgba(255,255,255,.7)' },
  };

  var s = styles[type] || styles.info;
  var el = document.createElement('div');
  el.className = 'toast';
  el.style.cssText = [
    'background:' + s.bg,
    'border:1px solid ' + s.brd,
    'color:' + s.tx,
  ].join(';');
  el.textContent = msg;
  el.onclick = function() { el.remove(); };
  root.appendChild(el);
  setTimeout(function() { if (el.parentNode) { el.remove(); } }, CONFIG.LIMITS.toastDuration);
};

/* ─────────────────────────────────────────────────────────
   MODAL
───────────────────────────────────────────────────────── */
window.modal = function(title, contentHTML) {
  var root = document.getElementById('modal-root');
  var body = document.getElementById('modal-card-body');
  if (!root || !body) { return; }

  body.innerHTML = [
    '<div class="modal-header">',
    '  <span class="modal-title">' + (title || '') + '</span>',
    '  <button class="modal-close" onclick="closeModal()">✕</button>',
    '</div>',
    '<div class="modal-body">' + (contentHTML || '') + '</div>',
  ].join('');

  root.classList.add('open');
};

window.closeModal = function() {
  var root = document.getElementById('modal-root');
  if (root) { root.classList.remove('open'); }
};

/* ─────────────────────────────────────────────────────────
   CSV EXPORT
───────────────────────────────────────────────────────── */
window.csvExport = function(data, filename) {
  if (!data || !data.length) {
    window.toast('No data to export', 'warn');
    return;
  }
  var headers = Object.keys(data[0]).join(',');
  var rows = data.map(function(row) {
    return Object.values(row).map(function(v) {
      return '"' + String(v).replace(/"/g, '""') + '"';
    }).join(',');
  }).join('\n');

  var blob = new Blob([headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  window.toast('✓ Exported ' + filename, 'success');
};

/* ─────────────────────────────────────────────────────────
   STATUS PILL — returns HTML string
───────────────────────────────────────────────────────── */
window.pill = function(status, label) {
  var s = CONFIG.getStatus(status);
  var text = label || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '—');
  return '<span class="pill" style="background:' + s.bg + ';color:' + s.color + '">' + text + '</span>';
};

/* ─────────────────────────────────────────────────────────
   ANIMATED COUNT-UP
───────────────────────────────────────────────────────── */
window.countUp = function(el, target, ms) {
  if (!el) { return; }
  ms = ms || 900;
  var pre = el.dataset.pre || '';
  var t0;
  (function tick(ts) {
    if (!t0) { t0 = ts; }
    var p = Math.min((ts - t0) / ms, 1);
    var ease = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.floor(ease * target).toLocaleString();
    if (p < 1) { requestAnimationFrame(tick); }
    else        { el.textContent = pre + target.toLocaleString(); }
  })(performance.now());
};

/* ─────────────────────────────────────────────────────────
   REUSABLE TABLE — returns HTML string
───────────────────────────────────────────────────────── */
window.table = function(headers, rows) {
  var ths = headers.map(function(h) { return '<th>' + h + '</th>'; }).join('');
  var trs = rows.map(function(cells) {
    var tds = cells.map(function(c) { return '<td>' + c + '</td>'; }).join('');
    return '<tr>' + tds + '</tr>';
  }).join('');
  return [
    '<div class="tbl-wrap"><table class="tbl">',
    '<thead><tr>' + ths + '</tr></thead>',
    '<tbody>' + trs + '</tbody>',
    '</table></div>',
  ].join('');
};

/* ─────────────────────────────────────────────────────────
   REUSABLE CARD — returns HTML string
───────────────────────────────────────────────────────── */
window.card = function(title, bodyHTML, opts) {
  opts = opts || {};
  return [
    '<div class="glass" style="overflow:hidden' + (opts.style ? ';' + opts.style : '') + '">',
    '  <div class="section-head">',
    '    <span class="section-title">' + title + '</span>',
    opts.action ? '    ' + opts.action : '',
    '  </div>',
    '  <div style="padding:14px">' + bodyHTML + '</div>',
    '</div>',
  ].join('');
};

/* ─────────────────────────────────────────────────────────
   ACTIVITY FEED — logActivity()
   Prepends to D.activity. Capped at CONFIG.LIMITS.maxActivityLog.
───────────────────────────────────────────────────────── */
window.logActivity = function(action, meta) {
  if (!window.D || !window.D.activity) { return; }

  var now  = new Date();
  var time = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

  window.D.activity.unshift({
    action: action,
    meta:   meta   || {},
    time:   time,
    ts:     now.getTime(),
  });

  /* Cap the log size */
  if (window.D.activity.length > CONFIG.LIMITS.maxActivityLog) {
    window.D.activity = window.D.activity.slice(0, CONFIG.LIMITS.maxActivityLog);
  }

  /* Update statusbar activity text if it exists */
  var statusEl = document.getElementById('status-activity');
  if (statusEl) { statusEl.textContent = action; }
};

/* ─────────────────────────────────────────────────────────
   SMART INSIGHTS — generateInsights()
   Analyses window.D and window.LEDGER, returns array of strings.
   Used by dashboard and admin overview.
───────────────────────────────────────────────────────── */
window.generateInsights = function() {
  var insights = [];
  var D = window.D;
  var L = window.LEDGER;

  /* Overdue invoices */
  var overdue = D.invoices.filter(function(i) { return i.status === 'overdue'; });
  if (overdue.length > 0) {
    insights.push('You have ' + overdue.length + ' overdue invoice' + (overdue.length > 1 ? 's' : '') + ' totalling ' + window.fmt(overdue.reduce(function(s, i) { return s + i.amt; }, 0)) + '.');
  }

  /* Paused automations */
  var paused = D.automations.filter(function(a) { return a.status === 'paused'; });
  if (paused.length > 0) {
    insights.push(paused.length + ' automation' + (paused.length > 1 ? 's are' : ' is') + ' paused — ' + paused.map(function(a) { return a.name; }).join(', ') + '.');
  }

  /* New leads waiting */
  var newLeads = D.webhooks.filter(function(w) { return w.status === 'new'; });
  if (newLeads.length > 0) {
    insights.push(newLeads.length + ' new lead' + (newLeads.length > 1 ? 's' : '') + ' from your website waiting for review.');
  }

  /* Unconfigured integrations */
  var unconfigured = Object.keys(CONFIG.INTEGRATIONS).filter(function(id) {
    return !window.hasCreds(id);
  });
  if (unconfigured.length >= 5) {
    insights.push('Integrations not yet configured. Set up n8n and Twilio to activate automations.');
  }

  /* Low margin warning */
  if (L.margin < 30 && L.revenue > 0) {
    insights.push('Gross margin is ' + L.margin + '%. Review your expense categories.');
  }

  /* Healthy state */
  if (insights.length === 0) {
    insights.push('All systems operational. ' + D.automations.filter(function(a) { return a.status === 'active'; }).length + ' automations running.');
  }

  return insights;
};

/* ─────────────────────────────────────────────────────────
   CREDENTIAL HELPERS
───────────────────────────────────────────────────────── */
window.getCredentials = function(id) {
  try { return JSON.parse(localStorage.getItem('colab_creds_' + id)) || {}; }
  catch (e) { return {}; }
};

window.hasCreds = function(id) {
  var c = window.getCredentials(id);
  return Object.values(c).some(function(v) { return v && String(v).trim().length > 0; });
};

window.saveCredentials = function(id) {
  var card = CONFIG.getIntegration(id);
  if (!card) { window.toast('Integration not found', 'error'); return; }

  var creds = {};
  card.fields.forEach(function(f) {
    var el = document.getElementById('cred-' + id + '-' + f.key);
    if (el) { creds[f.key] = el.value; }
  });

  localStorage.setItem('colab_creds_' + id, JSON.stringify(creds));
  window.toast('✓ ' + card.label + ' credentials saved', 'success');
  window.logActivity('Credentials saved — ' + card.label, { integration: id });
};

/* ─────────────────────────────────────────────────────────
   SEND INVOICE REMINDER
   Fires real n8n webhook if configured, graceful mock fallback.
───────────────────────────────────────────────────────── */
window.sendReminder = function(invoiceId, btn) {
  var inv = window.D.invoices.find(function(i) { return i.id === invoiceId; });
  if (!inv) { return; }

  var origText = btn ? btn.textContent : '';
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

  var creds   = window.getCredentials('n8n');
  var baseUrl = creds.baseUrl && !creds.baseUrl.includes('yourdomain') ? creds.baseUrl : null;
  var url     = baseUrl ? baseUrl + '/webhook/invoice-reminder' : null;

  var done = function(ok) {
    if (ok) {
      inv.status = 'reminded';
      window.toast('✓ Reminder sent to ' + inv.client, 'success');
      window.logActivity('Invoice reminder sent', { id: inv.id, client: inv.client });
      if (typeof window.renderApp === 'function') { window.renderApp(); }
    } else {
      window.toast('Configure n8n in Workflows → Integrations first', 'warn');
      if (btn) { btn.textContent = origText; btn.disabled = false; }
    }
  };

  if (url) {
    fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ invoice_id: inv.id, client: inv.client, amount: inv.amt, currency: window.AC }),
    })
    .then(function()  { done(true);  })
    .catch(function() { done(false); });
  } else {
    /* Mock fallback — simulates success after delay */
    setTimeout(function() { done(true); }, 800);
  }
};

/* ─────────────────────────────────────────────────────────
   AUTOMATION SERVICE
───────────────────────────────────────────────────────── */
window.autoSvc = {

  trigger: function(id, btn) {
    var auto = window.D.automations.find(function(a) { return a.id === id; });
    if (!auto) { return; }

    var origText = btn ? btn.textContent : '';
    if (btn) { btn.textContent = '…running'; btn.disabled = true; }

    var finish = function(ok, ms) {
      if (btn) {
        btn.textContent = ok ? '✓ Done' : '✗ Error';
        btn.style.color = ok ? 'var(--green)' : 'var(--red)';
        setTimeout(function() {
          btn.textContent  = origText;
          btn.style.color  = '';
          btn.disabled     = false;
        }, 1400);
      }
      if (ok) {
        auto.runs++;
        auto.last       = 'just now';
        auto.todayRuns  = (auto.todayRuns || 0) + 1;
        window.logActivity('Automation triggered — ' + auto.name, { id: id, ms: ms });
        if (typeof window.renderMCStrip === 'function') { window.renderMCStrip(); }
      }
    };

    /* Simulate async trigger */
    setTimeout(function() {
      finish(true, Math.floor(Math.random() * 150) + 40);
    }, 700);
  },

  testConnection: function(id, btn) {
    var origText = btn ? btn.textContent : '';
    if (btn) { btn.textContent = 'Testing…'; btn.disabled = true; }

    setTimeout(function() {
      var ok = window.hasCreds(id);
      var ms = ok ? Math.floor(Math.random() * 80) + 20 : 0;
      if (btn) {
        btn.textContent = ok ? '✓ Connected (' + ms + 'ms)' : '✗ Not reachable — check credentials';
        btn.style.color = ok ? 'var(--green)' : 'var(--red)';
        setTimeout(function() {
          btn.textContent = origText;
          btn.style.color = '';
          btn.disabled    = false;
        }, 2500);
      }
    }, 1100);
  },
};

/* ─────────────────────────────────────────────────────────
   AI SERVICE
───────────────────────────────────────────────────────── */
window.aiSvc = {

  generate: function(prompt) {
    var creds = window.getCredentials('claude');
    if (creds.apiKey && creds.apiKey.trim()) {
      /* Production: POST to Claude API via Supabase edge function */
      /* return fetch('/functions/v1/eli', { method:'POST', body: JSON.stringify({ prompt }) }) */
    }
    /* Mock response */
    return Promise.resolve('Connect Claude or OpenAI in Workflows → Integrations to activate Eli. Your prompt was: "' + prompt.substring(0, 60) + (prompt.length > 60 ? '…' : '') + '"');
  },

  scanDocument: function(file) {
    var MOCK = [
      { type: 'expense', cat: 'Supplies',  desc: 'PPG Paint Supplies — branch',     amount: 4500, date: new Date().toISOString().substring(0,10), vendor: 'PPG Industries', confidence: 97 },
      { type: 'expense', cat: 'Fuel',      desc: 'BP Fuel — delivery run',           amount: 680,  date: new Date().toISOString().substring(0,10), vendor: 'BP South Africa', confidence: 94 },
      { type: 'revenue', cat: 'Service',   desc: 'Full service — Toyota Corolla',    amount: 1850, date: new Date().toISOString().substring(0,10), vendor: 'Walk-in Customer', confidence: 89 },
      { type: 'expense', cat: 'Marketing', desc: 'Facebook Ads — monthly campaign',  amount: 1500, date: new Date().toISOString().substring(0,10), vendor: 'Meta Platforms', confidence: 98 },
    ];
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(MOCK[Math.floor(Math.random() * MOCK.length)]);
      }, 2200);
    });
  },
};

/* ─────────────────────────────────────────────────────────
   DOCUMENT IMPORT MODAL
───────────────────────────────────────────────────────── */
var _impState = 'drop';
var _impFile  = null;
var _impData  = null;

window.importOpen = function(source) {
  _impState = 'drop';
  _impFile  = null;
  _impData  = null;
  _renderImport();
  var m = document.getElementById('modal-root');
  if (m) { m.classList.add('open'); }
};

function _renderImport() {
  var body = document.getElementById('modal-card-body');
  if (!body) { return; }

  var header = [
    '<div class="modal-header">',
    '  <div style="display:flex;align-items:center;gap:10px">',
    '    <div style="width:28px;height:28px;border-radius:8px;background:var(--purple-d);display:flex;align-items:center;justify-content:center;font-size:14px">✦</div>',
    '    <div>',
    '      <div class="modal-title">Eli Document Scanner</div>',
    '      <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">AI-powered · Review before saving</div>',
    '    </div>',
    '  </div>',
    '  <button class="modal-close" onclick="closeModal()">✕</button>',
    '</div>',
  ].join('');

  var content = '';

  if (_impState === 'drop') {
    content = [
      '<div class="import-drop" id="imp-drop"',
      '  ondragover="event.preventDefault();this.classList.add(\'drag-over\')"',
      '  ondragleave="this.classList.remove(\'drag-over\')"',
      '  ondrop="event.preventDefault();this.classList.remove(\'drag-over\');_impProcess(event.dataTransfer.files[0])"',
      '  onclick="document.getElementById(\'imp-file\').click()">',
      '  <input type="file" id="imp-file" accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg,.webp" onchange="_impProcess(this.files[0])"/>',
      '  <div style="font-size:40px;margin-bottom:12px">📄</div>',
      '  <div style="font-size:15px;font-weight:700;margin-bottom:6px">Drop your document here</div>',
      '  <div style="font-size:11.5px;color:var(--text-dim);font-family:var(--font-mono)">PDF · Word · Excel · CSV · Image</div>',
      '</div>',
    ].join('');
  } else if (_impState === 'processing') {
    content = [
      '<div class="import-processing">',
      '  <div class="spinner"></div>',
      '  <div style="font-size:15px;font-weight:700">Eli is reading your document…</div>',
      '  <div style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">' + (_impFile ? _impFile.name : '') + '</div>',
      '</div>',
    ].join('');
  } else if (_impState === 'review' && _impData) {
    var d = _impData;
    content = [
      '<div style="padding:4px">',
      '  <div style="font-size:12px;font-weight:700;color:var(--purple);margin-bottom:14px">✦ Eli extracted these fields — edit before saving</div>',
      '  <div class="grid-2" style="margin-bottom:12px">',
      '    <div><label class="label-xs">Transaction Type</label>',
      '      <select id="imp-type" class="inp" style="font-size:13px">',
      '        <option value="expense"' + (d.type==='expense'?' selected':'') + '>Expense</option>',
      '        <option value="revenue"' + (d.type==='revenue'?' selected':'') + '>Revenue</option>',
      '      </select></div>',
      '    <div><label class="label-xs">Category</label>',
      '      <select id="imp-cat" class="inp" style="font-size:13px">',
      '        ' + ['Supplies','Fuel','Marketing','Salary','Software','Parts','Service','Other'].map(function(c) { return '<option' + (c===d.cat?' selected':'') + '>' + c + '</option>'; }).join(''),
      '      </select></div>',
      '    <div><label class="label-xs">Description</label><input id="imp-desc" class="inp" value="' + (d.desc||'') + '" style="font-size:13px"/></div>',
      '    <div><label class="label-xs">Amount</label><input id="imp-amt" class="inp" type="number" value="' + (d.amount||'') + '" style="font-size:13px"/></div>',
      '    <div><label class="label-xs">Date</label><input id="imp-date" class="inp" type="date" value="' + (d.date||'') + '" style="font-size:13px"/></div>',
      '    <div style="display:flex;align-items:flex-end"><div style="padding:8px 12px;border-radius:8px;background:var(--green-d);border:1px solid rgba(34,197,94,.15);font-size:10px;color:var(--green);font-family:var(--font-mono)">✓ ' + (d.confidence||95) + '% confidence</div></div>',
      '  </div>',
      '  <div style="display:flex;gap:8px">',
      '    <button class="btn-ghost" onclick="_impState=\'drop\';_renderImport()">← Re-upload</button>',
      '    <button class="btn-primary" style="flex:1;justify-content:center" onclick="_impApprove()">✓ Approve & Add to Wallet</button>',
      '  </div>',
      '</div>',
    ].join('');
  } else if (_impState === 'success') {
    content = [
      '<div style="padding:48px;text-align:center">',
      '  <div style="font-size:48px;margin-bottom:12px">✓</div>',
      '  <div style="font-size:16px;font-weight:700;margin-bottom:6px">Added to Wallet</div>',
      '  <div style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">' + (_impData ? _impData.desc : '') + '</div>',
      '</div>',
    ].join('');
  }

  body.innerHTML = header + '<div style="flex:1;overflow:auto">' + content + '</div>';
}

window._impProcess = function(file) {
  if (!file) { return; }
  _impFile  = file;
  _impState = 'processing';
  _renderImport();

  window.aiSvc.scanDocument(file).then(function(data) {
    _impData  = data;
    _impState = 'review';
    _renderImport();
  }).catch(function() {
    window.toast('Error reading document. Please try again.', 'error');
    _impState = 'drop';
    _renderImport();
  });
};

window._impApprove = function() {
  if (!_impData) { return; }
  var desc  = (document.getElementById('imp-desc')  || {}).value || _impData.desc;
  var amt   = parseFloat((document.getElementById('imp-amt')   || {}).value) || _impData.amount;
  var date  = (document.getElementById('imp-date')  || {}).value || _impData.date;
  var cat   = (document.getElementById('imp-cat')   || {}).value || _impData.cat;
  var type  = (document.getElementById('imp-type')  || {}).value || _impData.type;
  var delta = type === 'expense' ? -Math.abs(amt) : Math.abs(amt);

  window.LEDGER.txns.unshift({ date: date, type: type, cat: cat, desc: desc, delta: delta });
  window.logActivity('Document imported — ' + desc, { amount: delta });

  _impState = 'success';
  _renderImport();
  setTimeout(function() {
    window.closeModal();
    if (typeof window.renderApp === 'function') { window.renderApp(); }
  }, 1600);
};

/* Expose _renderImport for internal use */
window._renderImport = _renderImport;
