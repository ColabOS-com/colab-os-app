/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — pages-workflows.js
   Render functions: Automation Hub, Automations,
                     Web Intake, Integrations
   Rules: read from window.D only.
          call window.* helpers from services.js.
          no global state mutations except via explicit actions.
═══════════════════════════════════════════════════════════ */

'use strict';

/* Platform tag colors */
var _PT = {
  n8n:    { bg: 'rgba(249,115,22,.12)',  c: '#f97316' },
  claude: { bg: 'rgba(167,139,250,.12)', c: '#a78bfa' },
  make:   { bg: 'rgba(96,165,250,.12)',  c: '#60a5fa' },
  twilio: { bg: 'rgba(74,222,128,.12)',  c: '#4ade80' },
  stripe: { bg: 'rgba(129,140,248,.12)', c: '#818cf8' },
  manual: { bg: 'rgba(255,255,255,.06)', c: 'rgba(255,255,255,.4)' },
};

/* ─────────────────────────────────────────────────────────
   AUTOMATION HUB
───────────────────────────────────────────────────────── */
window.renderAutomationHub = function() {
  var D       = window.D;
  var active  = D.automations.filter(function(a) { return a.status === 'active'; });
  var todayR  = D.automations.reduce(function(s, a) { return s + (a.todayRuns || 0); }, 0);
  var totalR  = D.automations.reduce(function(s, a) { return s + a.runs; }, 0);
  var newLeads = D.webhooks.filter(function(w) { return w.status === 'new'; }).length;
  var unlocked = window.STARTER10.filter(function(s) { return s.installed; }).length;
  var html = [];

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">');
  html.push('  <div><h2 style="font-size:14px;font-weight:700">Automation Hub</h2>');
  html.push('  <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">n8n · Claude · Make.com · Twilio</p></div>');
  html.push('  <button class="btn-primary" onclick="window.navigateTo(\'integrations\')">⚡ Configure Integrations</button>');
  html.push('</div>');

  /* KPI strip */
  html.push('<div class="grid-4" style="margin-bottom:14px">');
  [
    { l: 'Active Systems', v: active.length,          c: 'var(--green)',  s: 'of ' + D.automations.length + ' total' },
    { l: 'Runs Today',     v: todayR,                  c: 'var(--accent)', s: totalR + ' all-time' },
    { l: 'New Leads',      v: newLeads,                c: 'var(--purple)', s: 'awaiting review' },
    { l: 'Hub Systems',    v: unlocked + '/10',        c: 'var(--text)',   s: 'Starter Pack' },
  ].forEach(function(k, i) {
    html.push('<div class="glass" style="padding:13px 15px;animation:fadeUp .35s ' + (i * 40) + 'ms both">');
    html.push('  <span class="label-xs">' + k.l + '</span>');
    html.push('  <div style="font-size:20px;font-weight:700;color:' + k.c + ';font-family:var(--font-mono);letter-spacing:-.5px;margin-top:3px">' + k.v + '</div>');
    html.push('  <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + k.s + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* Two-col: live systems + starter 10 pack */
  html.push('<div style="display:grid;grid-template-columns:1fr 300px;gap:12px;margin-bottom:14px" class="hub-grid">');

  /* Live systems */
  html.push('<div class="glass" style="overflow:hidden">');
  html.push('  <div class="section-head" style="border-color:rgba(249,115,22,.12)">');
  html.push('    <span class="section-title">Live Systems</span>');
  html.push('    <div style="display:flex;align-items:center;gap:5px"><span class="dot-live" style="background:var(--green);box-shadow:0 0 5px rgba(74,222,128,.5)"></span><span style="font-size:9.5px;color:var(--green);font-family:var(--font-mono)">' + active.length + ' running</span></div>');
  html.push('  </div>');
  html.push('  <div style="padding:10px;display:flex;flex-direction:column;gap:8px">');

  D.automations.forEach(function(a, i) {
    var pt = _PT[a.platform] || _PT.manual;
    var ps = { active: { bg: 'rgba(34,197,94,.12)', c: '#4ade80' }, paused: { bg: 'rgba(255,255,255,.06)', c: '#a1a1aa' }, draft: { bg: 'rgba(249,115,22,.12)', c: '#fb923c' }, error: { bg: 'rgba(239,68,68,.12)', c: '#f87171' } }[a.status] || { bg: 'rgba(255,255,255,.06)', c: '#a1a1aa' };

    html.push('<div class="glass-sm" style="padding:12px 14px;animation:fadeUp .3s ' + (i * 50) + 'ms both;cursor:pointer;transition:border-color .15s" onclick="_autoToggleDetail(\'' + a.id + '\')" onmouseover="this.style.borderColor=\'rgba(249,115,22,.25)\'" onmouseout="this.style.borderColor=\'\'">');
    html.push('  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">');
    html.push('    <div style="flex:1;min-width:0">');
    html.push('      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">');
    html.push('        <span style="font-size:12.5px;font-weight:700;color:var(--text)">' + a.name + '</span>');
    html.push('        <span class="tag" style="background:' + pt.bg + ';color:' + pt.c + '">' + a.platform + '</span>');
    html.push('        <span class="tag" style="background:var(--panel);color:var(--text-dim)">' + a.trigger + '</span>');
    html.push('      </div>');
    html.push('      <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + a.desc + '</div>');
    html.push('    </div>');
    html.push('    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0">');
    html.push('      <span class="tag" style="background:' + ps.bg + ';color:' + ps.c + '">' + a.status + '</span>');
    html.push('      <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">' + a.runs + ' runs · ' + a.last + '</div>');
    html.push('    </div>');
    html.push('  </div>');

    /* Expandable detail */
    html.push('  <div id="auto-detail-' + a.id + '" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">');
    if (a.flow && a.flow.length) {
      html.push('    <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:8px">');
      a.flow.forEach(function(step, si) {
        var col = si === 0 ? 'var(--accent)' : si === a.flow.length - 1 ? 'var(--green)' : 'var(--text-dim)';
        html.push('      <span style="font-size:10px;color:' + col + ';font-family:var(--font-mono)">' + step + '</span>');
        if (si < a.flow.length - 1) { html.push('      <span style="color:var(--text-dim);font-size:10px">›</span>'); }
      });
      html.push('    </div>');
    }
    if (a.webhookUrl) {
      html.push('    <div style="font-size:9.5px;color:rgba(249,115,22,.6);font-family:var(--font-mono);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + a.webhookUrl + '</div>');
    }
    html.push('    <div style="display:flex;gap:6px">');
    html.push('      <button class="btn-ghost" style="font-size:10.5px;padding:5px 11px" onclick="event.stopPropagation();window.autoSvc.trigger(\'' + a.id + '\',this)">▶ Run Now</button>');
    if (a.status === 'paused') {
      html.push('      <button class="btn-primary" style="font-size:10.5px;padding:5px 11px" onclick="event.stopPropagation();_autoSetStatus(\'' + a.id + '\',\'active\')">Resume</button>');
    } else if (a.status === 'active') {
      html.push('      <button class="btn-ghost" style="font-size:10.5px;padding:5px 11px" onclick="event.stopPropagation();_autoSetStatus(\'' + a.id + '\',\'paused\')">Pause</button>');
    }
    html.push('    </div>');
    html.push('  </div>');
    html.push('</div>');
  });

  html.push('  </div>');
  html.push('</div>');

  /* Starter 10 pack */
  html.push('<div class="glass" style="overflow:hidden;border-color:rgba(249,115,22,.14);position:relative">');
  /* Locked overlay */
  html.push('  <div style="position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;background:linear-gradient(to top,rgba(5,4,15,.98) 0%,rgba(5,4,15,.65) 55%,transparent 100%);pointer-events:none;padding-bottom:18px">');
  html.push('    <div style="pointer-events:all;text-align:center;padding:0 16px">');
  html.push('      <div style="font-size:11px;font-weight:700;color:var(--text);margin-bottom:4px">' + (10 - unlocked) + ' systems locked</div>');
  html.push('      <div style="font-size:10px;color:var(--text-dim);margin-bottom:12px;font-family:var(--font-mono)">Unlock the full Automation Hub</div>');
  html.push('      <button class="btn-primary" style="width:100%;justify-content:center;font-size:12px;padding:10px 16px;box-shadow:0 0 32px rgba(249,115,22,.35)" onclick="window.open(\'' + CONFIG.BILLING.automationUnlock + '\',\'_blank\')">⚡ Unlock Starter 10 Pack — R1,470</button>');
  html.push('      <div style="font-size:9px;color:var(--text-dim);margin-top:6px;font-family:var(--font-mono)">One-time · Own forever · No subscription</div>');
  html.push('    </div>');
  html.push('  </div>');
  html.push('  <div class="section-head" style="border-color:rgba(249,115,22,.12)"><span class="section-title">Starter 10 Pack</span><span style="font-size:9px;color:var(--accent);font-family:var(--font-mono)">' + unlocked + '/10 active</span></div>');
  html.push('  <div style="padding:8px;display:flex;flex-direction:column;gap:5px">');
  window.STARTER10.forEach(function(s) {
    html.push('    <div style="display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:9px;background:' + (s.installed ? 'rgba(34,197,94,.06)' : 'var(--panel)') + ';border:1px solid ' + (s.installed ? 'rgba(34,197,94,.15)' : 'var(--border)') + ';opacity:' + (s.installed ? '1' : '.7') + '">');
    html.push('      <span style="font-size:15px">' + s.icon + '</span>');
    html.push('      <span style="font-size:12px;font-weight:600;color:' + (s.installed ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.4)') + ';flex:1">' + s.name + '</span>');
    html.push('      <span style="font-size:9px;color:' + (s.installed ? 'var(--green)' : 'var(--text-dim)') + ';font-family:var(--font-mono)">' + (s.installed ? '✓ active' : 'locked') + '</span>');
    html.push('    </div>');
  });
  html.push('  </div>');
  html.push('</div>');
  html.push('</div>'); /* end hub-grid */

  /* Activity log */
  var recentActivity = (window.D.activity || []).slice(0, 6);
  html.push('<div class="glass" style="overflow:hidden">');
  html.push('  <div class="section-head"><span class="section-title">Recent Activity</span><span style="font-size:9.5px;color:var(--text-dim);font-family:var(--font-mono)">' + (window.D.activity || []).length + ' events</span></div>');
  html.push('  <div style="padding:8px 14px">');
  if (recentActivity.length === 0) {
    html.push('    <div style="padding:16px 0;text-align:center;font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">No activity yet. Run an automation to see events here.</div>');
  } else {
    recentActivity.forEach(function(evt) {
      html.push('    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">');
      html.push('      <div style="width:6px;height:6px;border-radius:50%;flex-shrink:0;background:var(--green);box-shadow:0 0 5px rgba(74,222,128,.5)"></div>');
      html.push('      <span style="font-size:11.5px;font-weight:500;color:var(--text-sub);flex:1">' + evt.action + '</span>');
      html.push('      <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + evt.time + '</span>');
      html.push('    </div>');
    });
  }
  html.push('  </div>');
  html.push('</div>');

  return html.join('\n');
};

/* Hub interaction helpers */
window._autoToggleDetail = function(id) {
  var el = document.getElementById('auto-detail-' + id);
  if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
};
window._autoSetStatus = function(id, status) {
  var a = window.D.automations.find(function(x) { return x.id === id; });
  if (a) {
    a.status = status;
    window.logActivity('Automation ' + status, { id: id, name: a.name });
    window.toast((status === 'active' ? '▶ ' : '⏸ ') + a.name + ' ' + status, 'success');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
  }
};

/* ─────────────────────────────────────────────────────────
   AUTOMATIONS (list view — reuses hub data)
───────────────────────────────────────────────────────── */
window.renderAutomations = function() {
  var D    = window.D;
  var html = [];

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div><h2 style="font-size:13.5px;font-weight:700">Automations</h2>');
  html.push('  <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + D.automations.length + ' workflows configured</p></div>');
  html.push('  <button class="btn-primary" onclick="window.toast(\'Add automation: configure in n8n then register webhook URL here\',\'info\')">+ New Automation</button>');
  html.push('</div>');

  var headers = ['Name', 'Platform', 'Trigger', 'Status', 'Runs', 'Last Run', 'Actions'];
  var rows = D.automations.map(function(a) {
    var pt = _PT[a.platform] || _PT.manual;
    return [
      '<span style="font-weight:600;color:var(--text)">' + a.name + '</span>',
      '<span class="tag" style="background:' + pt.bg + ';color:' + pt.c + '">' + a.platform + '</span>',
      '<span class="tag" style="background:var(--panel);color:var(--text-dim)">' + a.trigger + '</span>',
      window.pill(a.status),
      '<span style="font-family:var(--font-mono);color:var(--text-dim)">' + a.runs + '</span>',
      '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">' + a.last + '</span>',
      '<div style="display:flex;gap:4px">' +
        '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window.autoSvc.trigger(\'' + a.id + '\',this)">▶ Run</button>' +
        (a.status === 'active' ? '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window._autoSetStatus(\'' + a.id + '\',\'paused\')">Pause</button>' : '') +
        (a.status === 'paused' ? '<button class="btn-primary" style="font-size:10px;padding:3px 8px" onclick="window._autoSetStatus(\'' + a.id + '\',\'active\')">Resume</button>' : '') +
      '</div>',
    ];
  });
  html.push('<div class="glass" style="overflow:hidden">');
  html.push(window.table(headers, rows));
  html.push('</div>');

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   WEB INTAKE
───────────────────────────────────────────────────────── */
window.renderWebIntake = function() {
  var D    = window.D;
  var html = [];
  var newL = D.webhooks.filter(function(w) { return w.status === 'new'; }).length;

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div><h2 style="font-size:13.5px;font-weight:700">Web Intake</h2>');
  html.push('  <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">All inbound leads from colabos.store</p></div>');
  html.push('  <div style="display:flex;gap:7px"><button class="btn-ghost" onclick="window.csvExport(window.D.webhooks,\'colab-leads.csv\')">↓ Export</button></div>');
  html.push('</div>');

  if (newL > 0) {
    html.push('<div style="display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;background:var(--green-d);border:1px solid rgba(34,197,94,.2);border-left:3px solid var(--green);margin-bottom:13px">');
    html.push('  <span class="dot-live" style="background:var(--green);box-shadow:0 0 6px rgba(74,222,128,.6)"></span>');
    html.push('  <span style="font-size:12px;color:var(--green);font-family:var(--font-mono);font-weight:600">' + newL + ' new lead' + (newL > 1 ? 's' : '') + ' waiting for review</span>');
    html.push('</div>');
  }

  var headers = ['Time', 'Name', 'Business', 'Path', 'Status', 'Actions'];
  var rows = D.webhooks.map(function(w) {
    var sc = w.status === 'new' ? { bg: 'var(--green-d)', c: 'var(--green)' } : w.status === 'founding' ? { bg: 'var(--accent-d)', c: 'var(--accent)' } : { bg: 'var(--panel)', c: 'var(--text-dim)' };
    return [
      '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">' + w.ts + '</span>',
      '<span style="font-weight:500;color:var(--text)">'  + w.name + '</span>',
      '<span style="color:var(--text-sub)">'              + w.biz  + '</span>',
      '<span style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">' + w.path + '</span>',
      '<span class="tag" style="background:' + sc.bg + ';color:' + sc.c + '">' + w.status + '</span>',
      '<div style="display:flex;gap:4px">' +
        '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window.toast(\'Lead detail: v11.1\',\'info\')">View</button>' +
        (w.status === 'new' ? '<button class="btn-primary" style="font-size:10px;padding:3px 8px" onclick="_intakeAddToPipeline(\'' + w.id + '\')">Add to Pipeline</button>' : '') +
      '</div>',
    ];
  });
  html.push('<div class="glass" style="overflow:hidden">');
  html.push('  <div class="section-head"><span class="section-title">Recent Submissions</span></div>');
  html.push(window.table(headers, rows));
  html.push('</div>');

  return html.join('\n');
};

window._intakeAddToPipeline = function(webhookId) {
  var wh = window.D.webhooks.find(function(w) { return w.id === webhookId; });
  if (!wh) { return; }
  wh.status = 'added';
  var outreach = window.D.pipeline.stages.find(function(s) { return s.id === 'outreach'; });
  if (outreach) { outreach.cards.push({ name: wh.biz, value: 0, owner: wh.name, days: 0 }); }
  window.logActivity('Lead added to pipeline', { name: wh.name, biz: wh.biz });
  window.toast('✓ ' + wh.name + ' added to pipeline', 'success');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

/* ─────────────────────────────────────────────────────────
   INTEGRATIONS
───────────────────────────────────────────────────────── */
window.renderIntegrations = function() {
  var html = [];

  html.push('<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">');
  html.push('  <div><h2 style="font-size:13.5px;font-weight:700;margin-bottom:3px">Integrations</h2>');
  html.push('  <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Credentials stored locally. Never sent to CoLAB servers.</p></div>');
  html.push('  <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:7px;background:var(--panel);border:1px solid var(--border)">');
  html.push('    <span style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">MODE:</span>');
  html.push('    <span style="font-size:9px;font-weight:700;color:var(--accent);font-family:var(--font-mono)">' + CONFIG.PLATFORM.mode.toUpperCase() + '</span>');
  html.push('  </div>');
  html.push('</div>');

  /* Architecture note */
  html.push('<div style="padding:12px 16px;border-radius:11px;background:var(--purple-d);border:1px solid rgba(167,139,250,.12);margin-bottom:16px;font-family:var(--font-mono);font-size:10px;color:var(--text-dim);line-height:1.8">');
  html.push('  <span style="color:var(--purple);font-weight:700;font-size:9px;letter-spacing:.5px">✦ FLOW: </span>');
  html.push('  <span style="color:var(--accent)">CoLAB OS</span> › <span style="color:var(--blue)">n8n Webhook</span> › <span style="color:var(--blue)">n8n Executes</span> › <span style="color:var(--green)">WhatsApp / Email</span> › <span style="color:var(--green)">POST /callback</span> › <span style="color:var(--accent)">OS updates log</span>');
  html.push('</div>');

  /* Integration cards */
  html.push('<div style="display:flex;flex-direction:column;gap:10px">');
  CONFIG.getIntegrationList().forEach(function(card, i) {
    var hasCred  = window.hasCreds(card.id);
    var hexColor = card.color || '#f97316';

    html.push('<div class="glass" style="animation:fadeUp .35s ' + (i * 40) + 'ms both">');

    /* Card header — clickable to expand */
    html.push('  <div style="padding:14px 16px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;cursor:pointer" onclick="_intToggle(\'' + card.id + '\')">');
    html.push('    <div style="display:flex;align-items:flex-start;gap:12px;flex:1;min-width:0">');
    html.push('      <div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;background:rgba(255,255,255,.05);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px">' + card.icon + '</div>');
    html.push('      <div style="flex:1;min-width:0">');
    html.push('        <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:4px">');
    html.push('          <span style="font-size:13px;font-weight:700;color:var(--text)">' + card.label + '</span>');
    html.push('          <span style="font-size:8px;font-weight:700;letter-spacing:.5px;padding:1px 6px;border-radius:3px;font-family:var(--font-mono);background:var(--panel);color:var(--text-dim)">' + card.badge + '</span>');
    if (hasCred) {
      html.push('          <span style="font-size:9px;padding:1px 7px;border-radius:99px;background:var(--green-d);border:1px solid rgba(34,197,94,.2);color:var(--green);font-family:var(--font-mono)">✓ configured</span>');
    } else {
      html.push('          <span style="font-size:9px;padding:1px 7px;border-radius:99px;background:var(--panel);border:1px solid var(--border);color:var(--text-dim);font-family:var(--font-mono)">not configured</span>');
    }
    html.push('        </div>');
    html.push('        <div style="font-size:10.5px;color:var(--text-dim);line-height:1.5">' + card.desc + '</div>');
    html.push('      </div>');
    html.push('    </div>');
    html.push('    <div style="font-size:12px;color:var(--text-dim);flex-shrink:0">›</div>');
    html.push('  </div>');

    /* Expandable form */
    html.push('  <div id="int-form-' + card.id + '" style="display:none;padding:0 16px 16px">');
    html.push('    <div style="border-top:1px solid var(--border);padding-top:14px">');

    /* Arch note */
    html.push('      <div style="padding:9px 12px;border-radius:8px;background:var(--purple-d);border:1px solid rgba(167,139,250,.1);margin-bottom:12px;font-size:9px;color:var(--purple);font-family:var(--font-mono);line-height:1.7">' + card.arch + '</div>');

    /* Credential fields */
    html.push('      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:9px;margin-bottom:12px">');
    card.fields.forEach(function(f) {
      var savedVal = (window.getCredentials(card.id)[f.key] || '');
      html.push('        <div><label class="label-xs">' + f.label + '</label>');
      html.push('        <input id="cred-' + card.id + '-' + f.key + '" class="inp" type="' + f.type + '" placeholder="' + f.placeholder + '" value="' + savedVal + '" style="font-size:12.5px;font-family:var(--font-mono)"/></div>');
    });
    html.push('      </div>');

    /* Listen events (Stripe) */
    if (card.listenEvents && card.listenEvents.length) {
      html.push('      <div style="margin-bottom:12px"><label class="label-xs">Listen for events</label>');
      html.push('      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px">');
      card.listenEvents.forEach(function(e) {
        html.push('        <span style="font-size:9.5px;padding:2px 8px;border-radius:5px;background:var(--purple-d);border:1px solid rgba(129,140,248,.18);color:var(--purple);font-family:var(--font-mono)">' + e + '</span>');
      });
      html.push('      </div></div>');
    }

    /* Env vars reference */
    html.push('      <div style="padding:9px 12px;border-radius:8px;background:var(--panel);border:1px solid var(--border);margin-bottom:12px">');
    html.push('        <div style="font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:5px">ENV VARS</div>');
    card.envKeys.forEach(function(k) {
      html.push('        <code style="font-size:10.5px;color:rgba(249,115,22,.7);font-family:var(--font-mono);display:block">' + k + '=your_value_here</code>');
    });
    html.push('      </div>');

    /* Action buttons */
    html.push('      <div style="display:flex;gap:7px;flex-wrap:wrap">');
    html.push('        <button class="btn-ghost" style="font-size:11px" onclick="window.autoSvc.testConnection(\'' + card.id + '\',this)">Test Connection</button>');
    html.push('        <button class="btn-primary" style="font-size:11px" onclick="window.saveCredentials(\'' + card.id + '\')">Save Credentials</button>');
    html.push('        <a href="' + card.docs + '" target="_blank" class="btn-ghost" style="font-size:11px;text-decoration:none">↗ Docs</a>');
    html.push('      </div>');
    html.push('    </div>');
    html.push('  </div>');
    html.push('</div>');
  });
  html.push('</div>');

  return html.join('\n');
};

window._intToggle = function(id) {
  var el = document.getElementById('int-form-' + id);
  if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
};
