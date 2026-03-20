/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — pages-workflows.js
   Automation Hub (command center), Automations list,
   Web Intake, Integrations
═══════════════════════════════════════════════════════════ */

'use strict';

/* Platform tag palette */
var _PT = {
  n8n:    { bg: 'rgba(249,115,22,.12)',  c: '#f97316' },
  claude: { bg: 'rgba(167,139,250,.12)', c: '#a78bfa' },
  make:   { bg: 'rgba(96,165,250,.12)',  c: '#60a5fa' },
  twilio: { bg: 'rgba(74,222,128,.12)',  c: '#4ade80' },
  stripe: { bg: 'rgba(129,140,248,.12)', c: '#818cf8' },
  manual: { bg: 'rgba(255,255,255,.06)', c: 'rgba(255,255,255,.4)' },
};

/* ─────────────────────────────────────────────────────────
   AUTOMATION HUB — Command Center
───────────────────────────────────────────────────────── */
window.renderAutomationHub = function() {
  var D        = window.D;
  var f        = window.fmt;
  var active   = D.automations.filter(function(a) { return a.status === 'active'; });
  var failed   = D.automations.filter(function(a) { return a.status === 'error';  });
  var paused   = D.automations.filter(function(a) { return a.status === 'paused'; });
  var todayR   = D.automations.reduce(function(s,a){ return s+(a.todayRuns||0); }, 0);
  var totalR   = D.automations.reduce(function(s,a){ return s+a.runs; }, 0);
  var newLeads = D.webhooks.filter(function(w){ return w.status==='new'; }).length;
  var unlocked = window.STARTER10.filter(function(s){ return s.installed; }).length;
  var hasActive = active.length > 0;

  /* Revenue impact — sum of ledger revenue from automation-tagged entries */
  var autoRev = window.LEDGER.txns
    .filter(function(t){ return t.type==='revenue' && t.cat==='Service'; })
    .reduce(function(s,t){ return s+t.delta; }, 0);

  var html = [];

  /* ── Outcome labels for locked systems ── */
  var SYSTEM_OUTCOMES = {
    's01': { outcome: '+3–5 leads/week',          detail: 'Auto-reply in under 30 seconds' },
    's02': { outcome: '2× lead conversion',        detail: 'Qualify leads before you call back' },
    's03': { outcome: 'Close 40% more proposals',  detail: 'Follow-up within 2 min of send' },
    's04': { outcome: 'Zero missed payments',      detail: 'Day 7 reminder via WhatsApp' },
    's05': { outcome: 'Win back quiet clients',    detail: '3-touch re-engagement sequence' },
    's06': { outcome: 'Catch bad reviews first',   detail: 'Alert before it goes public' },
    's07': { outcome: '+1 star average rating',    detail: 'Auto-request after job done' },
    's08': { outcome: 'Page 1 for local searches', detail: '1000 pages, 6 hours' },
    's09': { outcome: 'Save 2h/day on admin',      detail: 'Tasks auto-created from triggers' },
    's10': { outcome: 'Never run out of stock',    detail: 'Reorder before you hit zero' },
  };

  /* ══════════════════════════════════════════════════════
     ZONE 1 — STATUS STRIP
  ══════════════════════════════════════════════════════ */
  html.push('<div class="hub-status-strip">');

  var stripItems = [
    {
      dot:   hasActive ? 'var(--green)' : 'var(--text-dim)',
      label: 'Active Systems',
      value: active.length + ' of ' + D.automations.length,
      color: hasActive ? 'var(--green)' : 'var(--text-dim)',
      pulse: hasActive,
    },
    {
      dot:   'var(--accent)',
      label: 'Revenue Impact',
      value: f(autoRev),
      color: 'var(--accent)',
      pulse: false,
    },
    {
      dot:   'var(--purple)',
      label: 'Events Today',
      value: todayR + ' triggers',
      color: 'var(--purple)',
      pulse: todayR > 0,
    },
  ];

  if (failed.length > 0) {
    stripItems.push({
      dot:   'var(--red)',
      label: 'Needs Attention',
      value: failed.length + ' failure' + (failed.length>1?'s':''),
      color: 'var(--red)',
      pulse: true,
    });
  }

  if (newLeads > 0) {
    stripItems.push({
      dot:   'var(--green)',
      label: 'New Leads',
      value: newLeads + ' waiting',
      color: 'var(--green)',
      pulse: true,
    });
  }

  stripItems.forEach(function(item) {
    html.push('  <div class="hub-strip-item">');
    html.push('    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">');
    html.push('      <span class="dot-live' + (item.pulse ? '' : '-static') + '" style="background:' + item.dot + ';' + (item.pulse ? 'box-shadow:0 0 6px '+item.dot : '') + '"></span>');
    html.push('      <span style="font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text-dim);font-family:var(--font-mono)">' + item.label + '</span>');
    html.push('    </div>');
    html.push('    <div style="font-size:16px;font-weight:700;color:' + item.color + ';font-family:var(--font-mono);letter-spacing:-.4px">' + item.value + '</div>');
    html.push('  </div>');
  });

  html.push('  <div style="margin-left:auto;display:flex;gap:8px;align-items:center">');
  html.push('    <button class="btn-primary" style="font-size:12px;padding:8px 16px" onclick="window.navigateTo(\'integrations\')">⚡ Configure</button>');
  html.push('  </div>');
  html.push('</div>');

  /* ══════════════════════════════════════════════════════
     FIRST-TIME EMPTY STATE
  ══════════════════════════════════════════════════════ */
  if (!hasActive && D.automations.filter(function(a){return a.status!=='draft';}).length === 0) {
    html.push('<div class="hub-onboard">');
    html.push('  <div style="font-size:48px;margin-bottom:16px">⚡</div>');
    html.push('  <div style="font-size:20px;font-weight:800;letter-spacing:-.4px;margin-bottom:8px">Install your first system</div>');
    html.push('  <div style="font-size:12px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:24px;max-width:400px;line-height:1.7">');
    html.push('    Connect n8n and Twilio, then install Missed Call Recovery to start capturing leads automatically.');
    html.push('  </div>');
    html.push('  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">');
    html.push('    <button class="btn-primary" style="font-size:13px;padding:11px 22px" onclick="window.navigateTo(\'integrations\')">⚡ Set Up Integrations First</button>');
    html.push('    <button class="btn-ghost" style="font-size:13px;padding:11px 22px" onclick="window.open(\'' + CONFIG.BILLING.automationUnlock + '\',\'_blank\')">Browse Systems →</button>');
    html.push('  </div>');
    html.push('</div>');
    return html.join('\n');
  }

  /* ══════════════════════════════════════════════════════
     ZONE 2 — SYSTEMS ENGINE
  ══════════════════════════════════════════════════════ */
  html.push('<div class="hub-engine-label">');
  html.push('  <div style="display:flex;align-items:center;gap:10px">');
  html.push('    <span style="font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.5px;font-family:var(--font-mono)">Systems Engine</span>');
  html.push('    <span style="font-size:10px;color:var(--accent);font-family:var(--font-mono);padding:2px 8px;border-radius:99px;background:var(--accent-d);border:1px solid rgba(249,115,22,.2)">' + unlocked + '/10 active</span>');
  html.push('  </div>');
  html.push('  <button class="btn-ghost" style="font-size:11px;padding:5px 12px" onclick="window.navigateTo('automations')">All automations →</button>');
  html.push('</div>');

  html.push('<div class="hub-systems-grid">');

  D.automations.forEach(function(a, idx) {
    var isActive  = a.status === 'active';
    var isPaused  = a.status === 'paused';
    var isError   = a.status === 'error';
    var isDraft   = a.status === 'draft';
    var pt        = _PT[a.platform] || _PT.manual;

    var borderCol = isActive ? 'rgba(34,197,94,.25)'
                  : isError  ? 'rgba(239,68,68,.25)'
                  : isPaused ? 'rgba(255,255,255,.06)'
                  : 'var(--border)';
    var bgGlow    = isActive ? 'rgba(34,197,94,.03)'
                  : isError  ? 'rgba(239,68,68,.04)'
                  : 'transparent';
    var dotColor  = isActive ? 'var(--green)'
                  : isError  ? 'var(--red)'
                  : isPaused ? '#52525b'
                  : '#3f3f46';

    html.push('<div class="hub-system-card" style="border-color:' + borderCol + ';background:var(--panel);" id="sys-card-' + a.id + '">');

    /* Subtle glow overlay for active */
    if (isActive) {
      html.push('  <div style="position:absolute;inset:0;border-radius:14px;background:' + bgGlow + ';pointer-events:none"></div>');
    }

    /* Card header */
    html.push('  <div style="position:relative;z-index:1">');
    html.push('    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">');
    html.push('      <div style="display:flex;align-items:center;gap:8px">');
    html.push('        <span class="dot-live" style="background:' + dotColor + ';box-shadow:' + (isActive?'0 0 7px '+dotColor:'none') + ';flex-shrink:0"></span>');
    html.push('        <div>');
    html.push('          <div style="font-size:13px;font-weight:700;color:var(--text);line-height:1.2">' + a.name + '</div>');
    html.push('          <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + a.desc + '</div>');
    html.push('        </div>');
    html.push('      </div>');
    html.push('      <span class="tag" style="background:' + pt.bg + ';color:' + pt.c + ';flex-shrink:0">' + a.platform + '</span>');
    html.push('    </div>');

    /* Stats row */
    html.push('    <div style="display:flex;gap:12px;margin-bottom:12px">');
    [
      { l: 'Total runs', v: a.runs },
      { l: 'Today',      v: a.todayRuns || 0 },
      { l: 'Last run',   v: a.last },
    ].forEach(function(s) {
      html.push('      <div><div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:2px">' + s.l + '</div>');
      html.push('      <div style="font-size:13px;font-weight:700;color:var(--text-sub);font-family:var(--font-mono)">' + s.v + '</div></div>');
    });
    html.push('    </div>');

    /* Flow path */
    if (a.flow && a.flow.length) {
      html.push('    <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:12px;padding:7px 10px;border-radius:7px;background:var(--panel-2);border:1px solid var(--border)">');
      a.flow.forEach(function(step, si) {
        var col = si===0 ? 'var(--accent)' : si===a.flow.length-1 ? 'var(--green)' : 'var(--text-dim)';
        html.push('      <span style="font-size:9.5px;color:' + col + ';font-family:var(--font-mono)">' + step + '</span>');
        if (si < a.flow.length-1) {
          html.push('      <span style="color:var(--text-dim);font-size:9px">›</span>');
        }
      });
      html.push('    </div>');
    }

    /* Action buttons */
    html.push('    <div style="display:flex;gap:6px;flex-wrap:wrap">');
    html.push('      <button class="btn-ghost" style="font-size:11px;padding:5px 12px" onclick="window.autoSvc.trigger(\'' + a.id + '\',this)">▶ Run</button>');
    if (isActive) {
      html.push('      <button class="btn-ghost" style="font-size:11px;padding:5px 12px" onclick="window._autoSetStatus(\'' + a.id + '\',\'paused\')">⏸ Pause</button>');
    } else if (isPaused) {
      html.push('      <button class="btn-primary" style="font-size:11px;padding:5px 12px" onclick="window._autoSetStatus(\'' + a.id + '\',\'active\')">▶ Resume</button>');
    } else if (isDraft) {
      html.push('      <button class="btn-primary" style="font-size:11px;padding:5px 12px" onclick="window._autoSetStatus(\'' + a.id + '\',\'active\')">Activate</button>');
    }
    html.push('      <button class="btn-ghost" style="font-size:11px;padding:5px 12px;margin-left:auto" onclick="_hubOpenContext(\'' + a.id + '\')">Details ›</button>');
    html.push('    </div>');
    html.push('  </div>');
    html.push('</div>');
  });

  /* Install new system card */
  html.push('<div class="hub-system-card hub-install-card" onclick="window.open(\'' + CONFIG.BILLING.automationUnlock + '\',\'_blank\')">');
  html.push('  <div style="text-align:center;padding:20px 0">');
  html.push('    <div style="font-size:32px;margin-bottom:10px;opacity:.5">＋</div>');
  html.push('    <div style="font-size:13px;font-weight:700;color:var(--text-dim);margin-bottom:6px">Install New System</div>');
  html.push('    <div style="font-size:10px;color:rgba(255,255,255,.25);font-family:var(--font-mono)">Browse Automation Packs</div>');
  html.push('  </div>');
  html.push('</div>');

  html.push('</div>'); /* end hub-systems-grid */

  /* ══════════════════════════════════════════════════════
     STARTER 10 PACK — locked overlay
  ══════════════════════════════════════════════════════ */
  html.push('<div style="position:relative;border-radius:14px;overflow:hidden;margin-bottom:16px;border:1px solid rgba(249,115,22,.15)">');
  /* Lock gradient */
  html.push('  <div style="position:absolute;inset:0;z-index:2;background:linear-gradient(to top,rgba(5,4,15,.97) 0%,rgba(5,4,15,.6) 50%,transparent 100%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:18px">');
  html.push('    <div style="text-align:center;padding:0 20px">');
  html.push('      <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px">' + (10-unlocked) + ' systems locked in Starter Pack</div>');
  html.push('      <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:12px">One-time · Own forever · No subscription</div>');
  html.push('      <button class="btn-primary" style="font-size:12px;padding:10px 20px;box-shadow:0 0 32px rgba(249,115,22,.3)" onclick="window.open(\'' + CONFIG.BILLING.automationUnlock + '\',\'_blank\')">⚡ Unlock Starter 10 Pack — R1,470</button>');
  html.push('    </div>');
  html.push('  </div>');
  html.push('  <div class="section-head" style="border-color:rgba(249,115,22,.1)"><span class="section-title">Starter 10 Pack</span><span style="font-size:9px;color:var(--accent);font-family:var(--font-mono)">' + unlocked + '/10 active</span></div>');
  html.push('  <div style="padding:8px;display:flex;flex-wrap:wrap;gap:6px">');
  window.STARTER10.forEach(function(s) {
    html.push('    <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:9px;background:' + (s.installed?'rgba(34,197,94,.06)':'var(--panel)') + ';border:1px solid ' + (s.installed?'rgba(34,197,94,.15)':'var(--border)') + ';opacity:' + (s.installed?'1':'.6') + ';min-width:180px;flex:1">');
    html.push('      <span style="font-size:15px">' + s.icon + '</span>');
    html.push('      <span style="font-size:11.5px;font-weight:600;color:' + (s.installed?'rgba(255,255,255,.85)':'rgba(255,255,255,.4)') + ';flex:1">' + s.name + '</span>');
    html.push('      <span style="font-size:9px;color:' + (s.installed?'var(--green)':'var(--text-dim)') + ';font-family:var(--font-mono)">' + (s.installed?'✓':'locked') + '</span>');
    html.push('    </div>');
  });
  html.push('  </div>');
  html.push('</div>');

  /* ══════════════════════════════════════════════════════
     ZONE 3 — LIVE ACTIVITY STREAM
  ══════════════════════════════════════════════════════ */
  html.push('<div class="hub-activity-panel">');
  html.push('  <div class="section-head" style="background:var(--panel);border-radius:12px 12px 0 0">');
  html.push('    <div style="display:flex;align-items:center;gap:7px">');
  html.push('      <span class="dot-live" style="background:var(--green);box-shadow:0 0 6px rgba(74,222,122,.5)"></span>');
  html.push('      <span class="section-title">Live Activity</span>');
  html.push('    </div>');
  html.push('    <span style="font-size:9.5px;color:var(--text-dim);font-family:var(--font-mono)">' + (D.activity||[]).length + ' events</span>');
  html.push('  </div>');
  html.push('  <div id="hub-activity-stream" style="max-height:320px;overflow-y:auto;padding:8px 14px">');

  var recentActivity = (D.activity || []).slice(0, 20);

  /* Sample events if no real activity yet */
  var streamItems = recentActivity.length > 0 ? recentActivity : [
    { action: 'Missed Call Recovery — Ready to activate', time: 'Set up n8n to enable', meta: {}, _sample: true },
    { action: 'Lead Intake Form — Waiting for connection', time: 'Connect webhook in Integrations', meta: {}, _sample: true },
    { action: 'Invoice Reminder — Paused', time: 'Activate to send WhatsApp reminders', meta: {}, _sample: true },
  ];

  if (streamItems.length === 0) {
    html.push('    <div style="padding:24px 0;text-align:center;font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">Activity appears here as automations run.</div>');
  } else {
    streamItems.forEach(function(evt) {
      var isSample = evt._sample;
      /* Determine module link from action text */
      var link = null;
      var act  = (evt.action || '').toLowerCase();
      if (act.includes('invoice'))   { link = 'invoices';  }
      if (act.includes('lead'))      { link = 'web-intake';}
      if (act.includes('contact'))   { link = 'contacts';  }
      if (act.includes('project'))   { link = 'projects';  }
      if (act.includes('automation')){ link = 'automations';}

      html.push('    <div class="hub-activity-row' + (isSample?' hub-activity-sample':'') + '"' + (link?' onclick="window.navigateTo(\''+link+'\')" style="cursor:pointer"':'') + '>');
      html.push('      <div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px;background:' + (isSample?'#3f3f46':evt._sample?'var(--text-dim)':'var(--green)') + ';' + (!isSample?'box-shadow:0 0 5px rgba(74,222,128,.4)':'') + '"></div>');
      html.push('      <div style="flex:1;min-width:0">');
      html.push('        <div style="font-size:12px;font-weight:500;color:' + (isSample?'var(--text-dim)':'var(--text-sub)') + '">' + evt.action + '</div>');
      if (evt.meta && Object.keys(evt.meta).length > 0) {
        var metaStr = Object.entries(evt.meta).map(function(e){ return e[0]+': '+e[1]; }).join(' · ');
        html.push('        <div style="font-size:9.5px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + metaStr + '</div>');
      }
      html.push('      </div>');
      html.push('      <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);flex-shrink:0;white-space:nowrap">' + (evt.time||'') + '</span>');
      html.push('    </div>');
    });

    if (recentActivity.length === 0) {
      html.push('    <div style="padding:12px 0 4px;text-align:center">');
      html.push('      <button class="btn-primary" style="font-size:12px;padding:9px 18px" onclick="window.navigateTo(\'integrations\')">⚡ Connect integrations to activate</button>');
      html.push('    </div>');
    }
  }

  html.push('  </div>');
  html.push('</div>'); /* end activity panel */

  /* ══════════════════════════════════════════════════════
     ZONE 4 — CONTEXT PANEL (slide-in)
  ══════════════════════════════════════════════════════ */
  html.push('<div id="hub-context" style="display:none;position:fixed;top:0;right:0;bottom:0;width:340px;background:var(--panel);border-left:1px solid var(--border);z-index:300;overflow-y:auto;box-shadow:-10px 0 40px rgba(0,0,0,.4)">');
  html.push('  <div id="hub-context-inner" style="padding:20px"></div>');
  html.push('</div>');
  /* Backdrop */
  html.push('<div id="hub-context-bg" style="display:none;position:fixed;inset:0;z-index:299;background:rgba(0,0,0,.4)" onclick="_hubCloseContext()"></div>');

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   CONTEXT PANEL — slide in with system details
───────────────────────────────────────────────────────── */
window._hubOpenContext = function(id) {
  var a = window.D.automations.find(function(x){ return x.id===id; });
  if (!a) { return; }
  var pt = _PT[a.platform] || _PT.manual;
  var f  = window.fmt;

  var html = [];
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">');
  html.push('  <div style="font-size:14px;font-weight:700;color:var(--text)">' + a.name + '</div>');
  html.push('  <button onclick="_hubCloseContext()" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:18px;padding:0">×</button>');
  html.push('</div>');

  html.push('<div style="padding:12px;border-radius:10px;background:var(--panel-2);border:1px solid var(--border);margin-bottom:14px">');
  html.push('  <div style="font-size:11.5px;color:var(--text-sub);line-height:1.7">' + a.desc + '</div>');
  html.push('</div>');

  html.push('<div class="label-xs" style="margin-bottom:8px">Status</div>');
  html.push('<div style="margin-bottom:14px">' + window.pill(a.status) + '</div>');

  html.push('<div class="label-xs" style="margin-bottom:8px">Platform</div>');
  html.push('<div style="margin-bottom:14px"><span class="tag" style="background:' + pt.bg + ';color:' + pt.c + '">' + a.platform + '</span></div>');

  html.push('<div class="label-xs" style="margin-bottom:8px">Performance</div>');
  html.push('<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">');
  [
    { l:'Total Runs', v: a.runs },
    { l:'Today',      v: a.todayRuns||0 },
    { l:'Trigger',    v: a.trigger },
    { l:'Last Run',   v: a.last },
  ].forEach(function(s){
    html.push('  <div style="padding:8px 10px;border-radius:8px;background:var(--panel);border:1px solid var(--border)">');
    html.push('    <div class="label-xs" style="margin-bottom:3px">' + s.l + '</div>');
    html.push('    <div style="font-size:13px;font-weight:600;color:var(--text-sub);font-family:var(--font-mono)">' + s.v + '</div>');
    html.push('  </div>');
  });
  html.push('</div>');

  if (a.flow && a.flow.length) {
    html.push('<div class="label-xs" style="margin-bottom:8px">Flow</div>');
    html.push('<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px">');
    a.flow.forEach(function(step, si){
      var col = si===0?'var(--accent)':si===a.flow.length-1?'var(--green)':'var(--text-dim)';
      html.push('  <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;background:var(--panel);border:1px solid var(--border)">');
      html.push('    <span style="width:18px;height:18px;border-radius:50%;background:' + col + ';display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#000;flex-shrink:0">' + (si+1) + '</span>');
      html.push('    <span style="font-size:11px;color:' + col + ';font-family:var(--font-mono)">' + step + '</span>');
      html.push('  </div>');
    });
    html.push('</div>');
  }

  if (a.webhookUrl) {
    html.push('<div class="label-xs" style="margin-bottom:6px">Webhook URL</div>');
    html.push('<div style="padding:8px 10px;border-radius:8px;background:var(--panel);border:1px solid var(--border);margin-bottom:14px;font-size:10px;color:rgba(249,115,22,.7);font-family:var(--font-mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + a.webhookUrl + '</div>');
  }

  html.push('<div style="display:flex;flex-direction:column;gap:7px;margin-top:8px">');
  html.push('  <button class="btn-primary" style="justify-content:center;font-size:12px" onclick="window.autoSvc.trigger(\'' + a.id + '\',this)">▶ Run Now</button>');
  if (a.status==='active') {
    html.push('  <button class="btn-ghost" style="justify-content:center;font-size:12px" onclick="window._autoSetStatus(\'' + a.id + '\',\'paused\')">⏸ Pause System</button>');
  } else if (a.status==='paused') {
    html.push('  <button class="btn-ghost" style="justify-content:center;font-size:12px" onclick="window._autoSetStatus(\'' + a.id + '\',\'active\')">▶ Resume System</button>');
  }
  html.push('  <button class="btn-ghost" style="justify-content:center;font-size:12px" onclick="window.navigateTo(\'integrations\');_hubCloseContext()">⚙ Configure Integration</button>');
  html.push('</div>');

  var inner = document.getElementById('hub-context-inner');
  var panel = document.getElementById('hub-context');
  var bg    = document.getElementById('hub-context-bg');
  if (inner) { inner.innerHTML = html.join('\n'); }
  if (panel) { panel.style.display = 'block'; }
  if (bg)    { bg.style.display    = 'block'; }
};

window._hubCloseContext = function() {
  var panel = document.getElementById('hub-context');
  var bg    = document.getElementById('hub-context-bg');
  if (panel) { panel.style.display = 'none'; }
  if (bg)    { bg.style.display    = 'none'; }
};

/* Hub state helpers */
window._autoSetStatus = function(id, status) {
  var a = window.D.automations.find(function(x){ return x.id===id; });
  if (!a) { return; }
  a.status = status;
  window.logActivity('Automation ' + status, { id:id, name:a.name });
  window.toast((status==='active'?'▶ ':'⏸ ') + a.name + ' ' + status, 'success');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

window._autoToggleDetail = function(id) {
  var el = document.getElementById('auto-detail-' + id);
  if (el) { el.style.display = el.style.display==='none'?'block':'none'; }
};

/* ─────────────────────────────────────────────────────────
   AUTOMATIONS (list view)
───────────────────────────────────────────────────────── */
window.renderAutomations = function() {
  var D    = window.D;
  var html = [];

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div><h2 style="font-size:13.5px;font-weight:700">Automations</h2>');
  html.push('  <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + D.automations.length + ' workflows</p></div>');
  html.push('  <button class="btn-primary" onclick="window.toast(\'Add automation: configure in n8n then register webhook URL in Integrations\',\'info\')">+ New Automation</button>');
  html.push('</div>');

  if (D.automations.length === 0) {
    html.push(window.EmptyState.automations());
    return html.join('\n');
  }

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
        (a.status==='active'  ? '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window._autoSetStatus(\'' + a.id + '\',\'paused\')">Pause</button>'  : '') +
        (a.status==='paused'  ? '<button class="btn-primary" style="font-size:10px;padding:3px 8px" onclick="window._autoSetStatus(\'' + a.id + '\',\'active\')">Resume</button>' : '') +
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
  var newL = D.webhooks.filter(function(w){ return w.status==='new'; }).length;

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div><h2 style="font-size:13.5px;font-weight:700">Web Intake</h2>');
  html.push('  <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Inbound leads from colabos.store</p></div>');
  html.push('  <button class="btn-ghost" onclick="window.csvExport(window.D.webhooks,\'colab-leads.csv\')">↓ Export</button>');
  html.push('</div>');

  if (newL > 0) {
    html.push('<div style="display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;background:var(--green-d);border:1px solid rgba(34,197,94,.2);border-left:3px solid var(--green);margin-bottom:13px">');
    html.push('  <span class="dot-live" style="background:var(--green)"></span>');
    html.push('  <span style="font-size:12px;color:var(--green);font-family:var(--font-mono);font-weight:600">' + newL + ' new lead' + (newL>1?'s':'') + ' waiting</span>');
    html.push('</div>');
  }

  if (D.webhooks.length === 0) {
    html.push(window.EmptyState.webhooks());
    return html.join('\n');
  }

  var headers = ['Time', 'Name', 'Business', 'Path', 'Status', 'Actions'];
  var rows = D.webhooks.map(function(w) {
    var sc = w.status==='new' ? {bg:'var(--green-d)',c:'var(--green)'}
           : w.status==='founding' ? {bg:'var(--accent-d)',c:'var(--accent)'}
           : {bg:'var(--panel)',c:'var(--text-dim)'};
    return [
      '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">' + w.ts + '</span>',
      '<span style="font-weight:500;color:var(--text)">' + w.name + '</span>',
      '<span style="color:var(--text-sub)">' + w.biz + '</span>',
      '<span style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">' + w.path + '</span>',
      '<span class="tag" style="background:' + sc.bg + ';color:' + sc.c + '">' + w.status + '</span>',
      '<div style="display:flex;gap:4px">' +
        '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window.toast(\'Lead detail: v11.1\',\'info\')">View</button>' +
        (w.status==='new' ? '<button class="btn-primary" style="font-size:10px;padding:3px 8px" onclick="window._intakeAddToPipeline(\'' + w.id + '\')">Add to Pipeline</button>' : '') +
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
  var wh = window.D.webhooks.find(function(w){ return w.id===webhookId; });
  if (!wh) { return; }
  wh.status = 'added';
  var outreach = window.D.pipeline.stages.find(function(s){ return s.id==='outreach'; });
  if (outreach) { outreach.cards.push({ name:wh.biz, value:0, owner:wh.name, days:0 }); }
  window.logActivity('Lead added to pipeline', { name:wh.name, biz:wh.biz });
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

  html.push('<div style="padding:12px 16px;border-radius:11px;background:var(--purple-d);border:1px solid rgba(167,139,250,.12);margin-bottom:16px;font-family:var(--font-mono);font-size:10px;color:var(--text-dim);line-height:1.8">');
  html.push('  <span style="color:var(--purple);font-weight:700;font-size:9px;letter-spacing:.5px">✦ FLOW: </span>');
  html.push('  <span style="color:var(--accent)">CoLAB OS</span> › <span style="color:var(--blue)">n8n Webhook</span> › <span style="color:var(--blue)">n8n Executes</span> › <span style="color:var(--green)">WhatsApp / Email</span> › <span style="color:var(--green)">POST /callback</span> › <span style="color:var(--accent)">OS updates log</span>');
  html.push('</div>');

  html.push('<div style="display:flex;flex-direction:column;gap:10px">');
  CONFIG.getIntegrationList().forEach(function(card, i) {
    var hasCred  = window.hasCreds(card.id);

    html.push('<div class="glass" style="animation:fadeUp .35s ' + (i*40) + 'ms both">');
    html.push('  <div style="padding:14px 16px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;cursor:pointer" onclick="window._intToggle(\'' + card.id + '\')">');
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

    html.push('  <div id="int-form-' + card.id + '" style="display:none;padding:0 16px 16px">');
    html.push('    <div style="border-top:1px solid var(--border);padding-top:14px">');
    html.push('      <div style="padding:9px 12px;border-radius:8px;background:var(--purple-d);border:1px solid rgba(167,139,250,.1);margin-bottom:12px;font-size:9px;color:var(--purple);font-family:var(--font-mono);line-height:1.7">' + card.arch + '</div>');
    html.push('      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:9px;margin-bottom:12px">');
    card.fields.forEach(function(f) {
      var savedVal = (window.getCredentials(card.id)[f.key] || '');
      html.push('        <div><label class="label-xs">' + f.label + '</label>');
      html.push('        <input id="cred-' + card.id + '-' + f.key + '" class="inp" type="' + f.type + '" placeholder="' + f.placeholder + '" value="' + savedVal + '" style="font-size:12.5px;font-family:var(--font-mono)"/></div>');
    });
    html.push('      </div>');
    if (card.envKeys && card.envKeys.length) {
      html.push('      <div style="padding:9px 12px;border-radius:8px;background:var(--panel);border:1px solid var(--border);margin-bottom:12px">');
      html.push('        <div style="font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:5px">ENV VARS</div>');
      card.envKeys.forEach(function(k) {
        html.push('        <code style="font-size:10.5px;color:rgba(249,115,22,.7);font-family:var(--font-mono);display:block">' + k + '=your_value_here</code>');
      });
      html.push('      </div>');
    }
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
  if (el) { el.style.display = el.style.display==='none'?'block':'none'; }
};
