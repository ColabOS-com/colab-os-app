/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — pages-finance.js
   Render functions: Dashboard, Wallet, Invoices,
                     Expenses, Quotes (Proposals)
   Rules: read from window.D / window.LEDGER only.
          call window.* helpers from services.js.
          no global state mutations except via explicit actions.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────── */
window.renderFinanceDashboard = function() {
  var D  = window.D;
  var L  = window.LEDGER;
  var f  = window.fmt;

  var overdue   = D.invoices.filter(function(i) { return i.status === 'overdue'; });
  var unpaid    = D.invoices.filter(function(i) { return i.status !== 'paid' && i.status !== 'draft'; });
  var unpaidAmt = unpaid.reduce(function(s, i) { return s + i.amt; }, 0);
  var pipeVal   = D.pipeline.stages.reduce(function(s, st) {
    return s + st.cards.reduce(function(a, c) { return a + (c.value || 0); }, 0);
  }, 0);
  var activeAutos = D.automations.filter(function(a) { return a.status === 'active'; });
  var newLeads    = D.webhooks.filter(function(w) { return w.status === 'new'; });
  var insights    = window.generateInsights();
  var now         = new Date();
  var hour        = now.getHours();
  var greet       = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  var dateStr     = now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });

  var html = [];

  /* ── Greeting row ── */
  html.push('<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">');
  html.push('  <div>');
  html.push('    <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:3px">' + dateStr + '</div>');
  html.push('    <h2 style="font-size:16px;font-weight:800;letter-spacing:-.4px">' + greet + ', <span style="color:var(--accent)">' + D.user.name + '</span></h2>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:8px;flex-wrap:wrap">');
  if (newLeads.length > 0) {
    html.push('    <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;background:var(--green-d);border:1px solid rgba(34,197,94,.2)">');
    html.push('      <span class="dot-live" style="background:var(--green)"></span>');
    html.push('      <span style="font-size:11px;color:var(--green);font-family:var(--font-mono);font-weight:600">' + newLeads.length + ' new lead' + (newLeads.length > 1 ? 's' : '') + '</span>');
    html.push('      <button onclick="window.navigateTo(\'web-intake\')" style="background:none;border:none;color:var(--green);cursor:pointer;font-size:10px;font-family:var(--font-mono);text-decoration:underline;padding:0">View →</button>');
    html.push('    </div>');
  }
  if (overdue.length > 0) {
    html.push('    <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;background:var(--red-d);border:1px solid rgba(239,68,68,.2)">');
    html.push('      <span class="dot-live" style="background:var(--red)"></span>');
    html.push('      <span style="font-size:11px;color:var(--red);font-family:var(--font-mono);font-weight:600">' + overdue.length + ' overdue</span>');
    html.push('      <button onclick="window.navigateTo(\'invoices\')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:10px;font-family:var(--font-mono);text-decoration:underline;padding:0">View →</button>');
    html.push('    </div>');
  }
  html.push('  </div>');
  html.push('</div>');

  /* ── Smart Insights Banner ── */
  if (insights.length > 0) {
    html.push('<div class="insights-banner">');
    html.push('  <div class="insights-header"><span class="insights-icon">⚡</span><span class="insights-title">Smart Insights</span></div>');
    insights.forEach(function(ins) {
      html.push('  <div class="insight-item"><span class="insight-dot"></span>' + ins + '</div>');
    });
    html.push('</div>');
  }

  /* ── KPI row ── */
  html.push('<div class="grid-4 g-main" style="margin-bottom:9px">');

  /* Wallet hero */
  html.push('<div class="glass kpi-card" style="border-color:rgba(249,115,22,.2)">');
  html.push('  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">');
  html.push('    <span class="label-xs" style="margin-bottom:0">Wallet</span>');
  html.push('    <span style="font-size:9px;color:var(--green);font-family:var(--font-mono);font-weight:700;padding:2px 7px;border-radius:5px;background:var(--green-d);border:1px solid rgba(34,197,94,.18)">' + L.margin + '% margin</span>');
  html.push('  </div>');
  html.push('  <div style="font-size:22px;font-weight:700;color:var(--text);letter-spacing:-.8px;line-height:1;font-family:var(--font-mono)">' + f(L.balance) + '</div>');
  html.push('  <div style="display:flex;gap:8px;margin-top:10px">');
  html.push('    <div style="flex:1;padding:7px 10px;border-radius:8px;background:var(--green-d);border:1px solid rgba(34,197,94,.1)"><div style="font-size:8px;color:rgba(74,222,128,.5);font-family:var(--font-mono);margin-bottom:2px;text-transform:uppercase">Revenue</div><div style="font-size:13px;font-weight:700;color:var(--green);font-family:var(--font-mono)">+' + f(L.revenue) + '</div></div>');
  html.push('    <div style="flex:1;padding:7px 10px;border-radius:8px;background:var(--red-d);border:1px solid rgba(239,68,68,.1)"><div style="font-size:8px;color:rgba(248,113,113,.5);font-family:var(--font-mono);margin-bottom:2px;text-transform:uppercase">Expenses</div><div style="font-size:13px;font-weight:700;color:var(--red);font-family:var(--font-mono)">-' + f(L.expenses) + '</div></div>');
  html.push('  </div>');
  html.push('</div>');

  /* Pipeline */
  html.push('<div class="glass kpi-card" style="cursor:pointer" onclick="window.navigateTo(\'pipeline\')">');
  html.push('  <span class="label-xs">Pipeline</span>');
  html.push('  <div style="font-size:18px;font-weight:700;color:var(--green);letter-spacing:-.6px;font-family:var(--font-mono)">' + f(pipeVal) + '</div>');
  html.push('  <div style="margin-top:8px;display:flex;flex-direction:column;gap:3px">');
  D.pipeline.stages.filter(function(s) { return s.cards.length > 0; }).slice(0, 3).forEach(function(s) {
    html.push('    <div style="display:flex;justify-content:space-between"><span style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">' + s.label + '</span><span style="font-size:9px;color:' + s.color + ';font-family:var(--font-mono);font-weight:700">' + s.cards.length + '</span></div>');
  });
  html.push('  </div>');
  html.push('</div>');

  /* Outstanding */
  html.push('<div class="glass kpi-card" style="cursor:pointer' + (unpaidAmt > 0 ? ';border-color:rgba(249,115,22,.2)' : '') + '" onclick="window.navigateTo(\'invoices\')">');
  html.push('  <span class="label-xs">Outstanding</span>');
  html.push('  <div style="font-size:20px;font-weight:700;color:' + (unpaidAmt > 0 ? '#fb923c' : 'var(--green)') + ';letter-spacing:-.6px;font-family:var(--font-mono)">' + f(unpaidAmt) + '</div>');
  html.push('  <div style="display:flex;align-items:center;gap:4px;margin-top:8px">');
  html.push(overdue.length > 0
    ? '    <span class="dot-live" style="background:var(--red)"></span><span style="font-size:9px;color:var(--red);font-family:var(--font-mono)">' + overdue.length + ' overdue</span>'
    : '    <span class="dot-live" style="background:var(--green)"></span><span style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">All current</span>');
  html.push('  </div>');
  html.push('</div>');

  /* Automations */
  html.push('<div class="glass kpi-card" style="border-color:rgba(249,115,22,.15);cursor:pointer" onclick="window.navigateTo(\'hub\')">');
  html.push('  <span class="label-xs">Automations</span>');
  html.push('  <div style="display:flex;align-items:baseline;gap:6px;margin-top:2px">');
  html.push('    <div style="font-size:30px;font-weight:700;color:var(--accent);letter-spacing:-1px;font-family:var(--font-mono)">' + activeAutos.length + '</div>');
  html.push('    <span style="font-size:10px;color:rgba(249,115,22,.4);font-family:var(--font-mono)">active</span>');
  html.push('    <span class="dot-live" style="background:var(--accent);margin-left:4px"></span>');
  html.push('  </div>');
  html.push('  <div style="margin-top:8px;padding:5px 9px;border-radius:6px;background:var(--accent-d);border:1px solid rgba(249,115,22,.12);display:inline-flex">');
  html.push('    <span style="font-size:9px;color:var(--accent);font-family:var(--font-mono)">' + D.automations.reduce(function(s, a) { return s + a.runs; }, 0) + ' runs total</span>');
  html.push('  </div>');
  html.push('</div>');
  html.push('</div>'); /* end grid-4 */

  /* ── Strip row ── */
  html.push('<div class="grid-3" style="margin-bottom:12px">');
  [
    { label: 'Net Profit', value: f(L.revenue - L.expenses), color: 'var(--text)' },
    { label: 'Contacts',   value: D.contacts.length + ' total', color: 'var(--purple)' },
    { label: 'New Leads',  value: newLeads.length + ' today',   color: newLeads.length > 0 ? 'var(--green)' : 'var(--text-dim)' },
  ].forEach(function(s) {
    html.push('<div class="glass-sm" style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center">');
    html.push('  <div><div style="font-size:8.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:3px">' + s.label + '</div>');
    html.push('  <div style="font-size:13.5px;font-weight:700;color:' + s.color + '">' + s.value + '</div></div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* ── Main 2-col grid ── */
  html.push('<div class="dash-grid" style="display:grid;grid-template-columns:1fr 270px;gap:11px">');

  /* Left column */
  html.push('<div style="display:flex;flex-direction:column;gap:10px">');

  /* Recent transactions */
  html.push('<div class="glass" style="overflow:hidden">');
  html.push('  <div class="section-head"><span class="section-title">Latest Transactions</span><button class="btn-ghost" style="font-size:11px;padding:5px 10px" onclick="window.navigateTo(\'wallet\')">Full ledger →</button></div>');
  L.txns.slice(0, 5).forEach(function(t) {
    html.push('  <div style="display:flex;align-items:center;gap:12px;padding:9px 16px;border-bottom:1px solid var(--border)">');
    html.push('    <div style="width:28px;height:28px;border-radius:8px;background:' + (t.type === 'revenue' ? 'var(--green-d)' : 'var(--red-d)') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0"><span>' + (t.type === 'revenue' ? '↑' : '↓') + '</span></div>');
    html.push('    <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;color:var(--text-sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + t.desc + '</div><div style="font-size:9.5px;color:var(--text-dim);font-family:var(--font-mono);margin-top:1px">' + t.date + ' · ' + t.cat + '</div></div>');
    html.push('    <div style="font-size:13px;font-weight:700;color:' + (t.delta > 0 ? 'var(--green)' : 'var(--red)') + ';font-family:var(--font-mono);flex-shrink:0">' + (t.delta > 0 ? '+' : '') + f(Math.abs(t.delta)) + '</div>');
    html.push('  </div>');
  });
  html.push('</div>');

  /* Web leads */
  html.push('<div class="glass" style="overflow:hidden' + (newLeads.length > 0 ? ';border-color:rgba(34,197,94,.2)' : '') + '">');
  html.push('  <div class="section-head"><span class="section-title">Website Leads</span><button class="btn-ghost" style="font-size:11px;padding:5px 10px" onclick="window.navigateTo(\'web-intake\')">All intake →</button></div>');
  D.webhooks.slice(0, 4).forEach(function(w) {
    html.push('  <div style="display:flex;align-items:center;gap:12px;padding:9px 16px;border-bottom:1px solid var(--border)">');
    html.push('    <div style="width:28px;height:28px;border-radius:8px;background:' + (w.status === 'new' ? 'var(--green-d)' : w.status === 'founding' ? 'var(--accent-d)' : 'var(--panel)') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:11px">' + (w.status === 'new' ? '↑' : w.status === 'founding' ? '◈' : '✓') + '</span></div>');
    html.push('    <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;color:var(--text-sub)">' + w.name + ' <span style="color:var(--text-dim)">· ' + w.biz + '</span></div><div style="font-size:9.5px;color:var(--text-dim);font-family:var(--font-mono);margin-top:1px">' + w.path + ' · ' + w.ts + '</div></div>');
    html.push('    ' + window.pill(w.status));
    html.push('  </div>');
  });
  html.push('</div>');
  html.push('</div>'); /* end left */

  /* Right column */
  html.push('<div style="display:flex;flex-direction:column;gap:9px">');

  /* Overdue panel */
  if (overdue.length > 0) {
    html.push('<div class="glass" style="overflow:hidden;border-color:rgba(239,68,68,.2)">');
    html.push('  <div class="section-head" style="padding:9px 13px"><div style="display:flex;align-items:center;gap:6px"><span class="dot-live" style="background:var(--red)"></span><span class="section-title" style="font-size:11.5px;color:var(--red)">Overdue</span></div><span style="font-size:9.5px;color:var(--red);font-family:var(--font-mono)">' + f(overdue.reduce(function(s, i) { return s + i.amt; }, 0)) + '</span></div>');
    overdue.forEach(function(i) {
      html.push('  <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 13px;border-bottom:1px solid var(--border)">');
      html.push('    <div><div style="font-size:11.5px;font-weight:500;color:var(--text-sub)">' + i.client + '</div><div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">' + i.id + ' · due ' + i.due + '</div></div>');
      html.push('    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px"><div style="font-size:12px;font-weight:700;color:var(--red);font-family:var(--font-mono)">' + f(i.amt) + '</div>');
      html.push('      <button onclick="window.sendReminder(\'' + i.id + '\',this)" style="font-size:9px;padding:2px 8px;border-radius:5px;background:var(--red-d);border:1px solid rgba(239,68,68,.2);color:var(--red);cursor:pointer;font-family:var(--font-mono)">Send reminder</button></div>');
      html.push('  </div>');
    });
    html.push('</div>');
  }

  /* Quick actions */
  html.push('<div class="glass" style="padding:14px">');
  html.push('  <div style="font-size:11px;font-weight:700;color:var(--text-dim);margin-bottom:10px;letter-spacing:.3px;text-transform:uppercase;font-family:var(--font-mono)">Quick Actions</div>');
  html.push('  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">');
  [
    { label: 'New Invoice',  icon: '⊕', fn: "window.navigateTo('invoices')",  bg: 'var(--accent-d)', bc: 'rgba(249,115,22,.2)',  tc: 'var(--accent)' },
    { label: 'New Proposal', icon: '◈', fn: "window.navigateTo('quotes')",    bg: 'var(--purple-d)', bc: 'rgba(167,139,250,.18)', tc: 'var(--purple)' },
    { label: 'Pipeline',     icon: '▸', fn: "window.navigateTo('pipeline')",  bg: 'var(--green-d)',  bc: 'rgba(34,197,94,.18)',  tc: 'var(--green)'  },
    { label: 'Add Expense',  icon: '↓', fn: "window.navigateTo('expenses')",  bg: 'var(--red-d)',    bc: 'rgba(239,68,68,.18)',  tc: 'var(--red)'    },
    { label: 'Workflows',    icon: '⚡', fn: "window.navigateTo('hub')",       bg: 'var(--accent-d)', bc: 'rgba(249,115,22,.18)', tc: 'var(--accent)' },
    { label: 'Ask Eli',      icon: '✦', fn: "window.navigateTo('eli')",        bg: 'var(--purple-d)', bc: 'rgba(167,139,250,.15)', tc: 'var(--purple)'},
  ].forEach(function(a) {
    html.push('<button onclick="' + a.fn + '" style="display:flex;align-items:center;gap:7px;padding:9px 11px;border-radius:9px;border:1px solid ' + a.bc + ';background:' + a.bg + ';cursor:pointer;font-family:var(--font-sans)"><span style="color:' + a.tc + ';font-size:14px">' + a.icon + '</span><span style="font-size:11.5px;font-weight:600;color:var(--text-sub)">' + a.label + '</span></button>');
  });
  html.push('  </div>');
  html.push('</div>');
  html.push('</div>'); /* end right */
  html.push('</div>'); /* end dash-grid */

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   WALLET
───────────────────────────────────────────────────────── */
window.renderWallet = function() {
  var L   = window.LEDGER;
  var f   = window.fmt;
  var exp = L.expenseByCategory();
  var max = Math.max.apply(null, Object.values(exp).concat([1]));
  var html = [];

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div><h2 style="font-size:14px;font-weight:700">Wallet</h2><p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Immutable delta-ledger</p></div>');
  html.push('  <div style="display:flex;gap:7px"><button class="btn-ghost" onclick="window.csvExport(window.LEDGER.txns,\'colab-wallet.csv\')">↓ Export CSV</button><button class="btn-primary" onclick="window.importOpen(\'wallet\')">+ Import Doc</button></div>');
  html.push('</div>');

  html.push('<div class="grid-3" style="margin-bottom:13px">');
  [
    { label: 'Balance',  value: f(L.balance),  color: L.balance >= 0 ? 'var(--green)' : 'var(--red)' },
    { label: 'Revenue',  value: '+' + f(L.revenue),  color: 'var(--green)' },
    { label: 'Expenses', value: '-' + f(L.expenses), color: 'var(--red)'   },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:14px 16px"><span class="label-xs">' + k.label + '</span><div style="font-size:22px;font-weight:700;color:' + k.color + ';letter-spacing:-.6px;font-family:var(--font-mono)">' + k.value + '</div></div>');
  });
  html.push('</div>');

  html.push('<div class="two-col" style="display:grid;grid-template-columns:1fr 240px;gap:12px">');

  /* Ledger table */
  html.push('<div class="glass" style="overflow:hidden">');
  html.push('  <div class="section-head"><span class="section-title">Ledger</span><button class="btn-ghost" style="font-size:11px" onclick="window.csvExport(window.LEDGER.txns,\'colab-ledger.csv\')">↓ CSV</button></div>');
  var headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  var rows = L.txns.map(function(t) {
    return [
      '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">' + t.date + '</span>',
      '<span class="tag" style="background:' + (t.type === 'revenue' ? 'var(--green-d)' : 'var(--red-d)') + ';color:' + (t.type === 'revenue' ? 'var(--green)' : 'var(--red)') + '">' + t.type + '</span>',
      '<span style="color:var(--text-dim)">' + t.cat + '</span>',
      '<span style="color:var(--text-sub)">' + t.desc + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:700;color:' + (t.delta > 0 ? 'var(--green)' : 'var(--red)') + '">' + (t.delta > 0 ? '+' : '') + f(Math.abs(t.delta)) + '</span>',
    ];
  });
  html.push(window.table(headers, rows));
  html.push('</div>');

  /* Right: breakdown + margin */
  html.push('<div style="display:flex;flex-direction:column;gap:10px">');
  html.push('<div class="glass" style="padding:14px">');
  html.push('  <div class="label-xs" style="margin-bottom:10px">Expense Breakdown</div>');
  Object.keys(exp).sort(function(a, b) { return exp[b] - exp[a]; }).forEach(function(cat) {
    var pct = Math.round(exp[cat] / max * 100);
    html.push('  <div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:10px;color:var(--text-sub)">' + cat + '</span><span style="font-size:10px;color:var(--red);font-family:var(--font-mono);font-weight:600">-' + f(exp[cat]) + '</span></div>');
    html.push('  <div class="progress-track"><div class="progress-fill" style="width:' + pct + '%;background:linear-gradient(90deg,var(--red),rgba(248,113,113,.5))"></div></div></div>');
  });
  html.push('</div>');
  html.push('<div class="glass" style="padding:14px"><div class="label-xs" style="margin-bottom:8px">Margin</div>');
  html.push('  <div style="font-size:28px;font-weight:800;color:var(--green);letter-spacing:-1px;font-family:var(--font-mono)">' + L.margin + '%</div>');
  html.push('  <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:4px">Gross profit margin</div>');
  html.push('  <div class="progress-track" style="margin-top:12px"><div class="progress-fill" style="width:' + L.margin + '%;background:linear-gradient(90deg,var(--green),rgba(74,222,128,.6))"></div></div>');
  html.push('</div>');
  html.push('</div>'); /* end right */
  html.push('</div>'); /* end two-col */

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   INVOICES
───────────────────────────────────────────────────────── */
window.renderInvoices = function() {
  var D   = window.D;
  var f   = window.fmt;
  var all = D.invoices;
  var ov  = all.filter(function(i) { return i.status === 'overdue'; });
  var paid = all.filter(function(i) { return i.status === 'paid'; });
  var html = [];

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <h2 style="font-size:13.5px;font-weight:700">Invoices</h2>');
  html.push('  <div style="display:flex;gap:7px"><button class="btn-ghost" onclick="window.csvExport(window.D.invoices,\'colab-invoices.csv\')">↓ Export</button><button class="btn-primary" onclick="window.toast(\'Invoice builder — connect your template in Settings\',\'info\')">+ New Invoice</button></div>');
  html.push('</div>');

  html.push('<div class="grid-3" style="margin-bottom:13px">');
  html.push('<div class="glass" style="padding:13px 15px;border-color:rgba(249,115,22,.12)"><span class="label-xs">Outstanding</span><div style="font-size:20px;font-weight:700;color:var(--accent);font-family:var(--font-mono)">' + f(all.filter(function(i) { return i.status !== 'paid' && i.status !== 'draft'; }).reduce(function(s, i) { return s + i.amt; }, 0)) + '</div></div>');
  html.push('<div class="glass" style="padding:13px 15px;border-color:rgba(239,68,68,.12)"><span class="label-xs">Overdue</span><div style="font-size:20px;font-weight:700;color:' + (ov.length > 0 ? 'var(--red)' : 'var(--green)') + ';font-family:var(--font-mono)">' + ov.length + ' invoice' + (ov.length !== 1 ? 's' : '') + '</div></div>');
  html.push('<div class="glass" style="padding:13px 15px;border-color:rgba(34,197,94,.1)"><span class="label-xs">Paid Total</span><div style="font-size:20px;font-weight:700;color:var(--green);font-family:var(--font-mono)">' + f(paid.reduce(function(s, i) { return s + i.amt; }, 0)) + '</div></div>');
  html.push('</div>');

  html.push('<div class="glass" style="overflow:hidden"><div class="section-head"><span class="section-title">All Invoices</span></div>');
  var headers = ['ID', 'Client', 'Amount', 'Due Date', 'Status', 'Actions'];
  var rows = all.map(function(i) {
    var actions = '';
    if (i.status === 'overdue' || i.status === 'sent') {
      actions += '<button onclick="window.sendReminder(\'' + i.id + '\',this)" class="btn-ghost" style="font-size:10px;padding:3px 8px;color:var(--red);border-color:rgba(239,68,68,.2);margin-right:4px">Send Reminder</button>';
    }
    if (i.status !== 'paid') {
      actions += '<button onclick="window.D.invoices.find(function(x){return x.id===\'' + i.id + '\'}).status=\'paid\';window.toast(\'✓ ' + i.id + ' marked as paid\',\'success\');window.logActivity(\'Invoice marked paid\',{id:\'' + i.id + '\'});window.renderApp()" class="btn-ghost" style="font-size:10px;padding:3px 8px">Mark Paid</button>';
    }
    return [
      '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">' + i.id + '</span>',
      '<span style="font-weight:500;color:var(--text-sub)">' + i.client + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:700;color:' + (i.status === 'paid' ? 'var(--green)' : 'var(--text)') + '">' + f(i.amt) + '</span>',
      '<span style="font-family:var(--font-mono);font-size:10px;color:' + (i.status === 'overdue' ? 'var(--red)' : 'var(--text-dim)') + '">' + i.due + '</span>',
      window.pill(i.status),
      '<div style="display:flex;gap:4px">' + actions + '</div>',
    ];
  });
  html.push(window.table(headers, rows));
  html.push('</div>');

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   EXPENSES
───────────────────────────────────────────────────────── */
window.renderExpenses = function() {
  var D   = window.D;
  var f   = window.fmt;
  var tot = D.expenses.reduce(function(s, e) { return s + e.amt; }, 0);
  var rec = D.expenses.filter(function(e) { return e.recurring; }).reduce(function(s, e) { return s + e.amt; }, 0);
  var html = [];

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div><h2 style="font-size:13.5px;font-weight:700">Expenses</h2><p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">QuickBooks-lite</p></div>');
  html.push('  <div style="display:flex;gap:7px"><button class="btn-ghost" onclick="window.csvExport(window.D.expenses,\'colab-expenses.csv\')">↓ Export</button><button class="btn-primary" onclick="window.importOpen(\'expenses\')">+ Capture Receipt</button></div>');
  html.push('</div>');

  html.push('<div class="grid-2" style="margin-bottom:13px">');
  html.push('<div class="glass" style="padding:13px 15px;border-color:rgba(239,68,68,.1)"><span class="label-xs">Total Expenses</span><div style="font-size:20px;font-weight:700;color:var(--red);font-family:var(--font-mono)">-' + f(tot) + '</div></div>');
  html.push('<div class="glass" style="padding:13px 15px"><span class="label-xs">Recurring / Month</span><div style="font-size:20px;font-weight:700;color:var(--accent);font-family:var(--font-mono)">-' + f(rec) + '</div></div>');
  html.push('</div>');

  html.push('<div class="glass" style="overflow:hidden"><div class="section-head"><span class="section-title">Expense Log</span></div>');
  var headers = ['ID', 'Category', 'Description', 'Amount', 'Recurring'];
  var rows = D.expenses.map(function(e) {
    return [
      '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">' + e.id + '</span>',
      '<span class="tag" style="background:var(--red-d);color:var(--red)">' + e.cat + '</span>',
      '<span style="color:var(--text-sub)">' + e.desc + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:700;color:var(--red)">-' + f(e.amt) + '</span>',
      '<span style="color:' + (e.recurring ? 'var(--green)' : 'var(--text-dim)') + '">' + (e.recurring ? '✓' : '—') + '</span>',
    ];
  });
  html.push(window.table(headers, rows));
  html.push('</div>');

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   QUOTES / PROPOSALS
───────────────────────────────────────────────────────── */
window.renderQuotes = function() {
  var D    = window.D;
  var f    = window.fmt;
  var html = [];

  /* Ensure quote items exist */
  if (!D.quoteItems || !D.quoteItems.length) {
    D.quoteItems = [{ desc: '', qty: 1, price: 0 }, { desc: '', qty: 1, price: 0 }];
  }

  var sub = D.quoteItems.reduce(function(s, r) { return s + (r.qty * r.price); }, 0);
  var tax = sub * 0.15;
  var tot = sub + tax;

  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div><h2 style="font-size:13.5px;font-weight:700">Proposal Builder</h2><p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Build → Send → Invoice</p></div>');
  html.push('  <button class="btn-ghost" onclick="window.D.quoteItems=[{desc:\'\',qty:1,price:0},{desc:\'\',qty:1,price:0}];window.renderApp();window.toast(\'New proposal started\',\'info\')">+ New Proposal</button>');
  html.push('</div>');

  html.push('<div class="two-col" style="display:grid;grid-template-columns:1fr 300px;gap:12px">');
  html.push('<div class="glass" style="padding:16px">');
  html.push('  <div class="label-xs" style="margin-bottom:10px">Details</div>');
  html.push('  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">');
  html.push('    <div><label class="label-xs">Client</label><select class="inp" style="font-size:13px"><option>— Select —</option>' + D.contacts.map(function(c) { return '<option>' + c.name + '</option>'; }).join('') + '</select></div>');
  html.push('    <div><label class="label-xs">Valid Until</label><input type="date" class="inp" style="font-size:13px"/></div>');
  html.push('    <div><label class="label-xs">Reference</label><input class="inp" placeholder="QUO-0001" style="font-size:13px"/></div>');
  html.push('    <div><label class="label-xs">Tax Rate</label><select class="inp" style="font-size:13px"><option>15% VAT</option><option>0% Export</option><option>No Tax</option></select></div>');
  html.push('  </div>');
  html.push('  <div class="label-xs" style="margin-bottom:7px">Line Items</div>');
  html.push('  <div style="background:var(--panel);border:1px solid var(--border);border-radius:9px;overflow:hidden;margin-bottom:10px">');
  html.push('    <table class="tbl"><thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead><tbody>');
  D.quoteItems.forEach(function(r, i) {
    html.push('      <tr>');
    html.push('        <td><input class="inp" placeholder="Item…" value="' + r.desc + '" oninput="window.D.quoteItems[' + i + '].desc=this.value" style="border:none;background:transparent;padding:4px 0;font-size:12px"/></td>');
    html.push('        <td><input class="inp" type="number" value="' + r.qty + '" oninput="window.D.quoteItems[' + i + '].qty=+this.value;window.renderApp()" style="width:52px;padding:4px 7px;font-size:12px"/></td>');
    html.push('        <td><input class="inp" type="number" placeholder="0.00" value="' + (r.price || '') + '" oninput="window.D.quoteItems[' + i + '].price=+this.value;window.renderApp()" style="width:80px;padding:4px 7px;font-size:12px"/></td>');
    html.push('        <td style="font-family:var(--font-mono);color:var(--text-dim)">' + f(r.qty * r.price) + '</td>');
    html.push('        <td><button onclick="window.D.quoteItems.splice(' + i + ',1);window.renderApp()" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:16px;padding:0 4px">×</button></td>');
    html.push('      </tr>');
  });
  html.push('    </tbody></table>');
  html.push('    <div style="padding:6px 14px;border-top:1px solid var(--border)"><button class="btn-ghost" style="font-size:11px;padding:4px 10px" onclick="window.D.quoteItems.push({desc:\'\',qty:1,price:0});window.renderApp()">+ Add Item</button></div>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px;flex-wrap:wrap">');
  html.push('    <button class="btn-ghost" style="font-size:11.5px" onclick="window.toast(\'Draft saved\',\'success\')">Save Draft</button>');
  html.push('    <button class="btn-ghost" style="font-size:11.5px" onclick="window.toast(\'PDF preview: connect PDF generator in Settings\',\'info\')">Preview PDF</button>');
  html.push('    <button class="btn-primary" style="margin-left:auto" onclick="window.toast(\'Proposal sent — connect Twilio/SMTP in Workflows → Integrations\',\'info\')">Send Proposal →</button>');
  html.push('  </div>');
  html.push('</div>');

  /* Totals panel */
  html.push('<div style="display:flex;flex-direction:column;gap:10px">');
  html.push('<div class="glass-sm" style="padding:14px">');
  html.push('  <div class="label-xs" style="margin-bottom:10px">Totals</div>');
  [['Subtotal', f(sub)], ['Tax 15%', f(tax)]].forEach(function(row) {
    html.push('  <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:6px"><span style="color:var(--text-sub)">' + row[0] + '</span><span style="font-family:var(--font-mono);color:var(--text-sub)">' + row[1] + '</span></div>');
  });
  html.push('  <div style="border-top:1px solid var(--border);padding-top:8px;display:flex;justify-content:space-between"><span style="font-weight:700;font-size:12px;color:var(--text)">Total</span><span style="font-family:var(--font-mono);font-weight:700;font-size:14px;color:var(--text)">' + f(tot) + '</span></div>');
  html.push('</div>');

  /* Recent proposals list */
  html.push('<div class="glass" style="padding:14px"><div class="label-xs" style="margin-bottom:10px">Recent</div>');
  D.invoices.forEach(function(i) {
    html.push('<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:11.5px;font-weight:500;color:var(--text-sub)">' + i.client + '</div><div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono)">Sent ' + i.sent + '</div></div><div style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--text)">' + f(i.amt) + '</div></div>');
  });
  html.push('</div>');
  html.push('</div>'); /* end right */
  html.push('</div>'); /* end two-col */

  return html.join('\n');
};
