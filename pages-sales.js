/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — pages-sales.js
   Render functions: Pipeline, Contacts, Outreach, Eli AI
   Rules: read from window.D only.
          call window.* helpers from services.js.
          no global state mutations except via explicit actions.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   PIPELINE (Kanban board)
───────────────────────────────────────────────────────── */
window.renderSalesPipeline = function() {
  var D    = window.D;
  var f    = window.fmt;
  var html = [];

  var total = D.pipeline.stages.reduce(function(s, st) {
    return s + st.cards.reduce(function(a, c) { return a + (c.value || 0); }, 0);
  }, 0);

  var totalDeals = D.pipeline.stages.reduce(function(s, st) {
    return s + st.cards.length;
  }, 0);

  var wonStage  = D.pipeline.stages.find(function(s) { return s.id === 'won'; });
  var wonValue  = wonStage ? wonStage.cards.reduce(function(s, c) { return s + (c.value || 0); }, 0) : 0;

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:13.5px;font-weight:700">Sales Pipeline</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Total value: <strong style="color:var(--green)">' + f(total) + '</strong></p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <button class="btn-ghost" onclick="window.csvExport(window.D.contacts,\'colab-pipeline.csv\')">↓ Export</button>');
  html.push('    <button class="btn-primary" onclick="window.toast(\'Add deal: click + in any stage column\',\'info\')">+ New Deal</button>');
  html.push('  </div>');
  html.push('</div>');

  /* KPI strip */
  html.push('<div class="grid-3" style="margin-bottom:13px">');
  [
    { label: 'Pipeline Value', value: f(total),        color: 'var(--green)'  },
    { label: 'Total Deals',    value: totalDeals + ' active', color: 'var(--text)' },
    { label: 'Won This Period',value: f(wonValue),     color: 'var(--accent)' },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:13px 15px"><span class="label-xs">' + k.label + '</span>');
    html.push('<div style="font-size:18px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.5px">' + k.value + '</div></div>');
  });
  html.push('</div>');

  /* Kanban board */
  html.push('<div class="kanban">');
  D.pipeline.stages.forEach(function(stage) {
    var stageTotal = stage.cards.reduce(function(s, c) { return s + (c.value || 0); }, 0);
    html.push('<div class="k-col">');
    html.push('  <div class="k-col-head">');
    html.push('    <span style="font-size:11px;font-weight:700;color:' + stage.color + '">' + stage.label + '</span>');
    html.push('    <div style="display:flex;align-items:center;gap:6px">');
    html.push('      <span style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">' + f(stageTotal) + '</span>');
    html.push('      <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + stage.cards.length + '</span>');
    html.push('    </div>');
    html.push('  </div>');
    html.push('  <div class="k-col-body">');

    stage.cards.forEach(function(card) {
      html.push('    <div class="k-card">');
      html.push('      <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:5px">' + card.name + '</div>');
      html.push('      <div style="font-size:11px;font-weight:700;color:' + stage.color + ';font-family:var(--font-mono)">' + (card.value > 0 ? f(card.value) : 'Founding 100') + '</div>');
      html.push('      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:7px">');
      html.push('        <span style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">' + (card.owner || '—') + '</span>');
      html.push('        <span style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">' + (card.days || 0) + 'd</span>');
      html.push('      </div>');
      html.push('    </div>');
    });

    html.push('    <button onclick="window.toast(\'Add deal to ' + stage.label + '\',\'info\')" style="width:100%;padding:6px;border-radius:6px;background:transparent;border:1px dashed var(--border);color:var(--text-dim);cursor:pointer;font-size:11px;font-family:var(--font-mono);margin-top:4px">+ Add</button>');
    html.push('  </div>');
    html.push('</div>');
  });
  html.push('</div>');

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   CONTACTS
───────────────────────────────────────────────────────── */
window.renderContacts = function() {
  var D    = window.D;
  var f    = window.fmt;
  var html = [];

  var clients   = D.contacts.filter(function(c) { return c.tags.includes('client'); });
  var leads     = D.contacts.filter(function(c) { return c.tags.includes('lead'); });
  var founding  = D.contacts.filter(function(c) { return c.tags.includes('founding'); });

  /* Tag color map */
  var TC = {
    client:   { bg: 'var(--green-d)',  color: 'var(--green)'  },
    lead:     { bg: 'rgba(96,165,250,.08)', color: 'var(--blue)' },
    founding: { bg: 'var(--accent-d)', color: 'var(--accent)' },
    outreach: { bg: 'var(--purple-d)', color: 'var(--purple)' },
    vip:      { bg: 'var(--accent-d)', color: 'var(--accent)' },
    overdue:  { bg: 'var(--red-d)',    color: 'var(--red)'    },
    prospect: { bg: 'var(--panel)',    color: 'var(--text-dim)'},
  };

  function tagBadge(t) {
    var s = TC[t] || { bg: 'var(--panel)', color: 'var(--text-dim)' };
    return '<span class="tag" style="background:' + s.bg + ';color:' + s.color + ';margin-right:3px">' + t + '</span>';
  }

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:13.5px;font-weight:700">Contacts</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + D.contacts.length + ' total · ' + clients.length + ' clients · ' + leads.length + ' leads</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <button class="btn-ghost" onclick="window.csvExport(window.D.contacts,\'colab-contacts.csv\')">↓ Export</button>');
  html.push('    <button class="btn-primary" onclick="window.toast(\'Contact form builder — coming in v11.1\',\'info\')">+ New Contact</button>');
  html.push('  </div>');
  html.push('</div>');

  /* KPI strip */
  html.push('<div class="grid-3" style="margin-bottom:13px">');
  [
    { label: 'Total Contacts', value: D.contacts.length,    color: 'var(--text)'   },
    { label: 'Clients',        value: clients.length,       color: 'var(--green)'  },
    { label: 'Founding 100',   value: founding.length + ' enrolled', color: 'var(--accent)' },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:13px 15px"><span class="label-xs">' + k.label + '</span>');
    html.push('<div style="font-size:18px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono)">' + k.value + '</div></div>');
  });
  html.push('</div>');

  /* Contacts table */
  html.push('<div class="glass" style="overflow:hidden">');
  html.push('  <div class="section-head"><span class="section-title">All Contacts</span></div>');
  var headers = ['Name', 'Company', 'Tags', 'Lifetime Value', 'Last Contact', 'Actions'];
  var rows = D.contacts.map(function(c) {
    return [
      '<span style="font-weight:600;color:var(--text)">'    + c.name    + '</span>',
      '<span style="color:var(--text-sub)">'                + c.company + '</span>',
      c.tags.map(tagBadge).join(''),
      '<span style="font-family:var(--font-mono);font-weight:600;color:' + (c.value > 0 ? 'var(--green)' : 'var(--text-dim)') + '">' + (c.value > 0 ? f(c.value) : '—') + '</span>',
      '<span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + c.lastContact + ' ago</span>',
      '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window.toast(\'Contact detail — v11.1\',\'info\')">View</button>',
    ];
  });
  html.push(window.table(headers, rows));
  html.push('</div>');

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   OUTREACH / CAMPAIGNS
───────────────────────────────────────────────────────── */
window.renderOutreach = function() {
  var D    = window.D;
  var html = [];

  var active = D.campaigns.filter(function(c) { return c.status === 'active'; });
  var totalSent    = D.campaigns.reduce(function(s, c) { return s + c.sent; }, 0);
  var totalOpened  = D.campaigns.reduce(function(s, c) { return s + c.opened; }, 0);
  var totalClicked = D.campaigns.reduce(function(s, c) { return s + c.clicked; }, 0);
  var avgOpen      = totalSent > 0 ? Math.round(totalOpened / Math.max(totalSent, 1) * 100) : 0;

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:13.5px;font-weight:700">Outreach</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">LinkedIn · WhatsApp · Email</p>');
  html.push('  </div>');
  html.push('  <button class="btn-primary" onclick="window.toast(\'New campaign: connect messaging in Workflows → Integrations first\',\'info\')">+ New Campaign</button>');
  html.push('</div>');

  /* KPI strip */
  html.push('<div class="grid-4" style="margin-bottom:13px">');
  [
    { label: 'Active Campaigns', value: active.length,         color: 'var(--green)'  },
    { label: 'Total Sent',       value: totalSent,             color: 'var(--text)'   },
    { label: 'Total Opened',     value: totalOpened,           color: 'var(--accent)' },
    { label: 'Avg Open Rate',    value: avgOpen + '%',         color: 'var(--purple)' },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:13px 15px"><span class="label-xs">' + k.label + '</span>');
    html.push('<div style="font-size:18px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.5px">' + k.value + '</div></div>');
  });
  html.push('</div>');

  /* Campaigns table */
  html.push('<div class="glass" style="overflow:hidden">');
  html.push('  <div class="section-head"><span class="section-title">Campaigns</span><button class="btn-ghost" style="font-size:11px;padding:5px 10px" onclick="window.csvExport(window.D.campaigns,\'colab-campaigns.csv\')">↓ Export</button></div>');

  var headers = ['Campaign', 'Type', 'Status', 'Sent', 'Opened', 'Clicked', 'Open Rate', 'Actions'];
  var rows = D.campaigns.map(function(c) {
    var rate = c.sent > 0 ? Math.round(c.opened / c.sent * 100) : 0;
    var typeColor = { linkedin: '#60a5fa', whatsapp: '#4ade80', email: '#a78bfa' }[c.type] || 'var(--text-dim)';
    return [
      '<span style="font-weight:500;color:var(--text)">' + c.name + '</span>',
      '<span class="tag" style="background:var(--panel);color:' + typeColor + '">' + c.type + '</span>',
      window.pill(c.status),
      '<span style="font-family:var(--font-mono);color:var(--text-dim)">' + c.sent + '</span>',
      '<span style="font-family:var(--font-mono);color:var(--text-sub)">' + c.opened + '</span>',
      '<span style="font-family:var(--font-mono);color:' + (c.clicked > 0 ? 'var(--green)' : 'var(--text-dim)') + '">' + c.clicked + '</span>',
      '<span style="font-family:var(--font-mono);color:var(--accent)">' + rate + '%</span>',
      '<div style="display:flex;gap:4px">' +
        '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window.toast(\'Campaign editor: connect n8n in Integrations\',\'info\')">Edit</button>' +
        (c.status === 'draft' ? '<button class="btn-primary" style="font-size:10px;padding:3px 8px" onclick="window.toast(\'Campaign launched!\',\'success\');window.logActivity(\'Campaign launched\',{name:\'' + c.name + '\'})">Launch</button>' : '') +
      '</div>',
    ];
  });
  html.push(window.table(headers, rows));
  html.push('</div>');

  /* Integration nudge if no messaging configured */
  var hasTwilio = window.hasCreds('twilio');
  if (!hasTwilio) {
    html.push('<div style="margin-top:12px;padding:12px 16px;border-radius:10px;background:var(--accent-d);border:1px solid rgba(249,115,22,.2);border-left:3px solid var(--accent);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">');
    html.push('  <div style="font-size:11px;color:var(--text-sub);font-family:var(--font-mono)">⚡ Connect Twilio to send WhatsApp campaigns directly from CoLAB OS.</div>');
    html.push('  <button class="btn-primary" style="font-size:11px" onclick="window.navigateTo(\'integrations\')">Configure Twilio →</button>');
    html.push('</div>');
  }

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   ELI AI ASSISTANT
───────────────────────────────────────────────────────── */
window.renderEli = function() {
  var D    = window.D;
  var html = [];

  var hasClaudeKey = window.hasCreds('claude');
  var hasOpenAIKey = window.hasCreds('openai');
  var isLive       = hasClaudeKey || hasOpenAIKey;

  /* Header */
  html.push('<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">');
  html.push('  <div style="width:38px;height:38px;border-radius:10px;background:var(--purple-d);border:1px solid rgba(167,139,250,.25);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">✦</div>');
  html.push('  <div style="flex:1">');
  html.push('    <h2 style="font-size:14px;font-weight:700">Eli AI</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:1px">');
  html.push(isLive ? '✓ Connected · GPT + Claude active' : 'Connect API keys in Workflows → Integrations to activate');
  html.push('    </p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:6px">');
  html.push('    <button class="btn-ghost" style="font-size:11px" onclick="_eliQuickPrompt(\'Write a LinkedIn post about the value of automation for small businesses\')">✦ LinkedIn Post</button>');
  html.push('    <button class="btn-ghost" style="font-size:11px" onclick="_eliQuickPrompt(\'Analyse my current sales pipeline and give me 3 actionable insights\')">✦ Pipeline Analysis</button>');
  html.push('    <button class="btn-ghost" style="font-size:11px" onclick="_eliQuickPrompt(\'What are the top 3 things I should focus on in my business this week?\')">✦ Weekly Focus</button>');
  html.push('  </div>');
  html.push('</div>');

  /* Status banner if not configured */
  if (!isLive) {
    html.push('<div style="padding:12px 16px;border-radius:10px;margin-bottom:14px;background:var(--purple-d);border:1px solid rgba(167,139,250,.2);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">');
    html.push('  <div style="font-size:11px;color:var(--text-sub);font-family:var(--font-mono)">✦ Eli runs on Claude + OpenAI. Connect your API keys to unlock full capability.</div>');
    html.push('  <button class="btn-primary" style="font-size:11px" onclick="window.navigateTo(\'integrations\')">Configure AI →</button>');
    html.push('</div>');
  }

  /* Chat area */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px">');
  html.push('  <div id="eli-chat-window" style="min-height:320px;max-height:420px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px">');

  /* Render history */
  if (!D.eliHistory || D.eliHistory.length === 0) {
    /* Welcome message */
    html.push('    <div style="display:flex;gap:10px">');
    html.push('      <div style="width:28px;height:28px;border-radius:8px;flex-shrink:0;background:var(--purple-d);border:1px solid rgba(167,139,250,.2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--purple)">✦</div>');
    html.push('      <div style="max-width:80%;padding:10px 13px;border-radius:12px 12px 12px 4px;background:var(--panel);border:1px solid var(--border);font-size:12px;color:var(--text-sub);line-height:1.6">');
    html.push("        Hey " + D.user.name + ". I'm Eli — your CoLAB co-founder. Ask me anything about your pipeline, create content, or get a business analysis.");
    html.push('      </div>');
    html.push('    </div>');
  } else {
    D.eliHistory.forEach(function(msg) {
      var isUser = msg.role === 'user';
      html.push('    <div style="display:flex;gap:10px' + (isUser ? ';flex-direction:row-reverse' : '') + '">');
      html.push('      <div style="width:28px;height:28px;border-radius:8px;flex-shrink:0;background:' + (isUser ? 'var(--accent-d)' : 'var(--purple-d)') + ';border:1px solid ' + (isUser ? 'rgba(249,115,22,.2)' : 'rgba(167,139,250,.2)') + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:' + (isUser ? 'var(--accent)' : 'var(--purple)') + '">' + (isUser ? D.user.name[0] : '✦') + '</div>');
      html.push('      <div style="max-width:78%;padding:10px 13px;border-radius:' + (isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px') + ';background:' + (isUser ? 'var(--accent-d)' : 'var(--panel)') + ';border:1px solid ' + (isUser ? 'rgba(249,115,22,.15)' : 'var(--border)') + ';font-size:12px;color:var(--text-sub);line-height:1.6">' + msg.text + '</div>');
      html.push('    </div>');
    });
  }

  html.push('  </div>');
  html.push('</div>');

  /* Input bar */
  html.push('<div style="display:flex;gap:8px">');
  html.push('  <input id="eli-input" class="inp" placeholder="Ask Eli anything about your business…" style="font-size:13px;flex:1" onkeydown="if(event.key===\'Enter\')_eliSend()"/>');
  html.push('  <button class="btn-primary" onclick="_eliSend()">Send ✦</button>');
  html.push('  <button class="btn-ghost" onclick="window.D.eliHistory=[];window.renderApp();window.toast(\'Chat cleared\',\'info\')" title="Clear chat">✕</button>');
  html.push('</div>');

  /* Suggestion chips */
  html.push('<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">');
  [
    'Summarise my overdue invoices',
    'Write a follow-up message for a cold lead',
    'Give me a 3-step plan to win back a quiet client',
    'What automation should I set up first?',
  ].forEach(function(prompt) {
    html.push('<button class="btn-ghost" style="font-size:10.5px;padding:4px 10px" onclick="_eliQuickPrompt(\'' + prompt + '\')">' + prompt + '</button>');
  });
  html.push('</div>');

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   ELI INTERACTION HANDLERS
   Attached to window so inline onclick can call them.
───────────────────────────────────────────────────────── */
window._eliSend = function() {
  var input = document.getElementById('eli-input');
  if (!input) { return; }
  var msg = input.value.trim();
  if (!msg) { return; }
  input.value = '';
  _eliSubmit(msg);
};

window._eliQuickPrompt = function(prompt) {
  _eliSubmit(prompt);
};

function _eliSubmit(msg) {
  if (!window.D.eliHistory) { window.D.eliHistory = []; }

  /* Add user message */
  window.D.eliHistory.push({ role: 'user', text: msg });
  window.logActivity('Eli prompt sent', { prompt: msg.substring(0, 50) });

  /* Re-render to show user message immediately */
  if (typeof window.renderApp === 'function') { window.renderApp(); }

  /* Scroll chat to bottom */
  setTimeout(function() {
    var chatWin = document.getElementById('eli-chat-window');
    if (chatWin) { chatWin.scrollTop = chatWin.scrollHeight; }
  }, 50);

  /* Call AI service */
  window.aiSvc.generate(msg).then(function(response) {
    window.D.eliHistory.push({ role: 'assistant', text: response });
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    /* Scroll to bottom after response */
    setTimeout(function() {
      var chatWin = document.getElementById('eli-chat-window');
      if (chatWin) { chatWin.scrollTop = chatWin.scrollHeight; }
    }, 50);
  }).catch(function() {
    window.D.eliHistory.push({ role: 'assistant', text: 'Sorry — something went wrong. Please try again.' });
    if (typeof window.renderApp === 'function') { window.renderApp(); }
  });
}
