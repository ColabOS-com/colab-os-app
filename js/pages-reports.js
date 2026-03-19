/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — pages-reports.js
   Render functions: P&L Overview, Revenue Trends, Tax Estimate
   Rules: read from window.LEDGER only.
          call window.* helpers from services.js.
          no global state mutations.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   SHARED CHART HELPER
   Renders a vertical bar chart as inline HTML.
   bars: [{ label, value, color }]
   maxH: pixel height of tallest bar
───────────────────────────────────────────────────────── */
function _barChart(bars, maxH, showValues) {
  maxH = maxH || 130;
  var maxVal = Math.max.apply(null, bars.map(function(b) { return b.value || 0; }).concat([1]));
  var html   = [];

  html.push('<div style="display:flex;align-items:flex-end;gap:5px;height:' + (maxH + 28) + 'px;padding:0 4px">');
  bars.forEach(function(b) {
    var h   = Math.max(Math.round((b.value / maxVal) * maxH), 2);
    var col = b.color || 'linear-gradient(180deg,rgba(74,222,128,.85),rgba(34,197,94,.25))';
    html.push('  <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:0">');
    if (showValues !== false) {
      html.push('    <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:4px;text-align:center">' + window.fmt(b.value) + '</div>');
    }
    html.push('    <div style="width:100%;height:' + h + 'px;background:' + col + ';border-radius:4px 4px 0 0;cursor:pointer;transition:opacity .2s" title="' + b.label + ': ' + window.fmt(b.value) + '" onmouseover="this.style.opacity=\'.75\'" onmouseout="this.style.opacity=\'1\'"></div>');
    html.push('    <div style="font-size:9px;font-family:var(--font-mono);color:var(--text-dim);text-align:center;margin-top:5px;white-space:nowrap">' + b.label + '</div>');
    html.push('  </div>');
  });
  html.push('</div>');
  return html.join('\n');
}

/* Build last-N-months summary from ledger transactions */
function _buildMonthly(months) {
  months = months || 6;
  var byMonth = {};
  window.LEDGER.txns.forEach(function(t) {
    var m = t.date.substring(0, 7);
    if (!byMonth[m]) { byMonth[m] = { rev: 0, exp: 0 }; }
    if (t.type === 'revenue') { byMonth[m].rev += t.delta; }
    else                      { byMonth[m].exp += Math.abs(t.delta); }
  });
  var keys = Object.keys(byMonth).sort().slice(-months);
  return keys.map(function(k) {
    var short = k.substring(5); /* MM */
    var label = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(short, 10) - 1] || short;
    return {
      key:    k,
      label:  label,
      rev:    byMonth[k].rev,
      exp:    byMonth[k].exp,
      net:    byMonth[k].rev - byMonth[k].exp,
    };
  });
}

/* ─────────────────────────────────────────────────────────
   P&L OVERVIEW
───────────────────────────────────────────────────────── */
window.renderPL = function() {
  var L      = window.LEDGER;
  var f      = window.fmt;
  var html   = [];
  var monthly = _buildMonthly(6);
  var maxRev  = Math.max.apply(null, monthly.map(function(m) { return m.rev; }).concat([1]));

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">P&L Overview</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Last 6 months · ' + CONFIG.getCurrency(window.AC).name + '</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <button class="btn-ghost" onclick="window.csvExport(window.LEDGER.txns,\'colab-pl.csv\')">↓ Export CSV</button>');
  html.push('  </div>');
  html.push('</div>');

  /* Top KPI cards */
  html.push('<div class="grid-3" style="margin-bottom:14px">');
  [
    { label: 'Net Revenue',  value: f(L.revenue),         color: 'var(--green)', border: 'rgba(34,197,94,.15)'  },
    { label: 'Total Expenses',value: '-' + f(L.expenses), color: 'var(--red)',   border: 'rgba(239,68,68,.12)'  },
    { label: 'Net Profit',   value: (L.balance >= 0 ? '+' : '') + f(L.balance), color: L.balance >= 0 ? 'var(--green)' : 'var(--red)', border: 'rgba(34,197,94,.1)' },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:14px 16px;border-color:' + k.border + '">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:22px;font-weight:700;color:' + k.color + ';letter-spacing:-.6px;font-family:var(--font-mono)">' + k.value + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* Monthly P&L chart */
  html.push('<div class="glass" style="padding:18px;margin-bottom:12px">');
  html.push('  <div style="font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.4px;font-family:var(--font-mono);margin-bottom:16px">Monthly P&L — Revenue vs Expenses</div>');

  /* Grouped bars */
  html.push('  <div style="display:flex;align-items:flex-end;gap:6px;height:185px;padding:0 4px">');
  monthly.forEach(function(m) {
    var rh = Math.max(Math.round((m.rev / maxRev) * 130), 2);
    var eh = Math.max(Math.round((m.exp / maxRev) * 130), 2);
    html.push('    <div style="flex:1;display:flex;flex-direction:column;align-items:center">');
    html.push('      <div style="display:flex;align-items:flex-end;gap:2px;width:100%;justify-content:center;margin-bottom:0">');
    html.push('        <div style="height:' + rh + 'px;background:linear-gradient(180deg,rgba(74,222,128,.85),rgba(34,197,94,.25));border-radius:4px 4px 0 0;width:calc(50% - 2px);cursor:pointer;transition:opacity .2s" title="Revenue: ' + f(m.rev) + '" onmouseover="this.style.opacity=\'.75\'" onmouseout="this.style.opacity=\'1\'"></div>');
    html.push('        <div style="height:' + eh + 'px;background:linear-gradient(180deg,rgba(248,113,113,.8),rgba(239,68,68,.25));border-radius:4px 4px 0 0;width:calc(50% - 2px);cursor:pointer;transition:opacity .2s" title="Expenses: ' + f(m.exp) + '" onmouseover="this.style.opacity=\'.75\'" onmouseout="this.style.opacity=\'1\'"></div>');
    html.push('      </div>');
    html.push('      <div style="font-size:9px;font-family:var(--font-mono);color:var(--text-dim);text-align:center;margin-top:5px">' + m.label + '</div>');
    html.push('    </div>');
  });
  html.push('  </div>');

  /* Legend */
  html.push('  <div style="display:flex;gap:16px;margin-top:12px">');
  html.push('    <div style="display:flex;align-items:center;gap:6px"><div style="width:10px;height:10px;border-radius:2px;background:var(--green)"></div><span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Revenue</span></div>');
  html.push('    <div style="display:flex;align-items:center;gap:6px"><div style="width:10px;height:10px;border-radius:2px;background:var(--red)"></div><span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Expenses</span></div>');
  html.push('  </div>');
  html.push('</div>');

  /* Monthly summary table */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px">');
  html.push('  <div class="section-head"><span class="section-title">Monthly Summary</span></div>');
  var headers = ['Month', 'Revenue', 'Expenses', 'Net', 'Margin'];
  var rows = monthly.map(function(m) {
    var margin = m.rev > 0 ? Math.round((m.rev - m.exp) / m.rev * 100) : 0;
    return [
      '<span style="font-family:var(--font-mono);color:var(--text-sub)">' + m.label + ' ' + m.key.substring(0, 4) + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:700;color:var(--green)">+' + f(m.rev) + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:700;color:var(--red)">-' + f(m.exp) + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:700;color:' + (m.net >= 0 ? 'var(--green)' : 'var(--red)') + '">' + (m.net >= 0 ? '+' : '') + f(m.net) + '</span>',
      '<span style="font-family:var(--font-mono);color:' + (margin >= 50 ? 'var(--green)' : margin >= 20 ? 'var(--accent)' : 'var(--red)') + '">' + margin + '%</span>',
    ];
  });
  html.push(window.table(headers, rows));
  html.push('</div>');

  /* Expense category breakdown */
  var expByCat = L.expenseByCategory();
  var catKeys  = Object.keys(expByCat).sort(function(a, b) { return expByCat[b] - expByCat[a]; });
  var maxCat   = expByCat[catKeys[0]] || 1;

  html.push('<div class="two-col" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">');

  html.push('<div class="glass" style="padding:14px">');
  html.push('  <div class="label-xs" style="margin-bottom:12px">Expense by Category</div>');
  catKeys.forEach(function(cat) {
    var pct = Math.round(expByCat[cat] / maxCat * 100);
    html.push('  <div style="margin-bottom:10px">');
    html.push('    <div style="display:flex;justify-content:space-between;margin-bottom:4px">');
    html.push('      <span style="font-size:11px;color:var(--text-sub)">' + cat + '</span>');
    html.push('      <span style="font-size:11px;color:var(--red);font-family:var(--font-mono);font-weight:600">-' + f(expByCat[cat]) + '</span>');
    html.push('    </div>');
    html.push('    <div class="progress-track">');
    html.push('      <div class="progress-fill" style="width:' + pct + '%;background:linear-gradient(90deg,var(--red),rgba(248,113,113,.45))"></div>');
    html.push('    </div>');
    html.push('  </div>');
  });
  html.push('</div>');

  /* Gross margin meter */
  html.push('<div class="glass" style="padding:14px">');
  html.push('  <div class="label-xs" style="margin-bottom:12px">Gross Margin</div>');
  html.push('  <div style="font-size:40px;font-weight:800;color:var(--green);letter-spacing:-2px;font-family:var(--font-mono);line-height:1">' + L.margin + '%</div>');
  html.push('  <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:6px;margin-bottom:14px">Gross profit margin · all time</div>');
  html.push('  <div class="progress-track" style="height:8px">');
  html.push('    <div class="progress-fill" style="width:' + L.margin + '%;background:' + (L.margin >= 60 ? 'linear-gradient(90deg,var(--green),rgba(74,222,128,.5))' : L.margin >= 30 ? 'linear-gradient(90deg,var(--accent),rgba(249,115,22,.5))' : 'linear-gradient(90deg,var(--red),rgba(248,113,113,.5))') + '"></div>');
  html.push('  </div>');
  html.push('  <div style="display:flex;justify-content:space-between;margin-top:6px">');
  html.push('    <span style="font-size:9px;color:var(--red);font-family:var(--font-mono)">0%</span>');
  html.push('    <span style="font-size:9px;color:var(--accent);font-family:var(--font-mono)">50%</span>');
  html.push('    <span style="font-size:9px;color:var(--green);font-family:var(--font-mono)">100%</span>');
  html.push('  </div>');
  html.push('  <div style="margin-top:16px;padding:10px;border-radius:8px;background:' + (L.margin >= 60 ? 'var(--green-d)' : 'var(--accent-d)') + ';border:1px solid ' + (L.margin >= 60 ? 'rgba(34,197,94,.15)' : 'rgba(249,115,22,.15)') + '">');
  html.push('    <div style="font-size:10px;color:' + (L.margin >= 60 ? 'var(--green)' : 'var(--accent)') + ';font-family:var(--font-mono)">' + (L.margin >= 60 ? '✓ Healthy margin. Keep expenses lean.' : '⚠ Review expenses to improve margin.') + '</div>');
  html.push('  </div>');
  html.push('</div>');
  html.push('</div>'); /* end two-col */

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   REVENUE TRENDS
───────────────────────────────────────────────────────── */
window.renderRevenue = function() {
  var L       = window.LEDGER;
  var f       = window.fmt;
  var html    = [];
  var monthly = _buildMonthly(6);

  var revOnly = monthly.map(function(m) { return { label: m.label, value: m.rev }; });
  var bestMonth   = monthly.reduce(function(best, m) { return m.rev > best.rev ? m : best; }, monthly[0] || { rev: 0, label: '—' });
  var latestMonth = monthly[monthly.length - 1] || { rev: 0 };
  var prevMonth   = monthly[monthly.length - 2]   || { rev: 1 };
  var momChange   = prevMonth.rev > 0 ? Math.round((latestMonth.rev - prevMonth.rev) / prevMonth.rev * 100) : 0;

  /* Revenue by category */
  var revByCat = {};
  L.txns.filter(function(t) { return t.type === 'revenue'; }).forEach(function(t) {
    revByCat[t.cat] = (revByCat[t.cat] || 0) + t.delta;
  });

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">Revenue Trends</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Monthly revenue · ' + CONFIG.getCurrency(window.AC).name + '</p>');
  html.push('  </div>');
  html.push('  <button class="btn-ghost" onclick="window.csvExport(window.LEDGER.txns.filter(function(t){return t.type===\'revenue\';}),\'colab-revenue.csv\')">↓ Export</button>');
  html.push('</div>');

  /* KPIs */
  html.push('<div class="grid-4" style="margin-bottom:14px">');
  [
    { label: 'Total Revenue',   value: f(L.revenue),          color: 'var(--green)'  },
    { label: 'Best Month',      value: f(bestMonth.rev) + ' (' + bestMonth.label + ')', color: 'var(--text)' },
    { label: 'This Month',      value: f(latestMonth.rev),    color: 'var(--accent)' },
    { label: 'MoM Change',      value: (momChange >= 0 ? '+' : '') + momChange + '%', color: momChange >= 0 ? 'var(--green)' : 'var(--red)' },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:13px 15px">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:16px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.4px;margin-top:3px">' + k.value + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* Revenue bar chart */
  html.push('<div class="glass" style="padding:18px;margin-bottom:12px">');
  html.push('  <div style="font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.4px;font-family:var(--font-mono);margin-bottom:16px">Revenue by Month</div>');
  html.push(_barChart(revOnly, 130, true));
  html.push('</div>');

  /* Two-col: by category + transaction list */
  html.push('<div class="two-col" style="display:grid;grid-template-columns:240px 1fr;gap:12px">');

  /* Revenue by category */
  var catKeys  = Object.keys(revByCat).sort(function(a, b) { return revByCat[b] - revByCat[a]; });
  var maxRevCat = revByCat[catKeys[0]] || 1;

  html.push('<div class="glass" style="padding:14px">');
  html.push('  <div class="label-xs" style="margin-bottom:12px">Revenue by Category</div>');
  catKeys.forEach(function(cat) {
    var pct  = Math.round(revByCat[cat] / L.revenue * 100);
    var bpct = Math.round(revByCat[cat] / maxRevCat * 100);
    html.push('  <div style="margin-bottom:10px">');
    html.push('    <div style="display:flex;justify-content:space-between;margin-bottom:4px">');
    html.push('      <span style="font-size:11px;color:var(--text-sub)">' + cat + '</span>');
    html.push('      <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + pct + '%</span>');
    html.push('    </div>');
    html.push('    <div class="progress-track">');
    html.push('      <div class="progress-fill" style="width:' + bpct + '%;background:linear-gradient(90deg,var(--green),rgba(74,222,128,.45))"></div>');
    html.push('    </div>');
    html.push('  </div>');
  });
  html.push('</div>');

  /* Revenue transactions */
  var revTxns = L.txns.filter(function(t) { return t.type === 'revenue'; });
  html.push('<div class="glass" style="overflow:hidden">');
  html.push('  <div class="section-head"><span class="section-title">Revenue Transactions</span><button class="btn-ghost" style="font-size:11px" onclick="window.csvExport(window.LEDGER.txns.filter(function(t){return t.type===\'revenue\';}),\'colab-revenue.csv\')">↓ CSV</button></div>');
  var headers = ['Date', 'Category', 'Description', 'Amount'];
  var rows = revTxns.map(function(t) {
    return [
      '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">' + t.date + '</span>',
      '<span class="tag" style="background:var(--green-d);color:var(--green)">' + t.cat + '</span>',
      '<span style="color:var(--text-sub)">' + t.desc + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:700;color:var(--green)">+' + f(t.delta) + '</span>',
    ];
  });
  html.push(window.table(headers, rows));
  html.push('</div>');
  html.push('</div>'); /* end two-col */

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   TAX ESTIMATE
───────────────────────────────────────────────────────── */
window.renderTaxEstimate = function() {
  var L    = window.LEDGER;
  var f    = window.fmt;
  var html = [];

  /* South African tax calculation estimates */
  var grossProfit     = L.revenue - L.expenses;
  var vatCollected    = Math.round(L.revenue * 0.15);
  var vatPaid         = Math.round(L.expenses * 0.15);
  var vatPayable      = Math.max(vatCollected - vatPaid, 0);
  var incomeTaxRate   = grossProfit > 550000 ? 0.28 : grossProfit > 250000 ? 0.21 : grossProfit > 95750 ? 0.18 : 0.07;
  var estimatedTax    = Math.round(Math.max(grossProfit, 0) * incomeTaxRate);
  var provisionalTax1 = Math.round(estimatedTax * 0.5);
  var totalTaxLiab    = vatPayable + estimatedTax;

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">Tax Estimate</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">South African estimates · Not a tax return · Consult your accountant</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <button class="btn-ghost" onclick="window.toast(\'Tax report: export to your accountant via CSV\',\'info\')">↓ Export for Accountant</button>');
  html.push('  </div>');
  html.push('</div>');

  /* Disclaimer banner */
  html.push('<div style="padding:11px 16px;border-radius:10px;background:rgba(96,165,250,.07);border:1px solid rgba(96,165,250,.18);border-left:3px solid var(--blue);margin-bottom:16px;font-size:11px;color:var(--text-sub);font-family:var(--font-mono);line-height:1.6">');
  html.push('  <strong style="color:var(--blue);font-size:9px;text-transform:uppercase;letter-spacing:.4px">Disclaimer · </strong>');
  html.push('  These are rough estimates for planning purposes only. All figures are in ' + CONFIG.getCurrency(window.AC).name + '. Always consult a registered South African accountant for your actual tax obligations.');
  html.push('</div>');

  /* KPI cards */
  html.push('<div class="grid-2" style="margin-bottom:14px">');
  [
    { label: 'Gross Profit (pre-tax)', value: f(Math.max(grossProfit, 0)), color: grossProfit >= 0 ? 'var(--green)' : 'var(--red)', border: 'rgba(34,197,94,.12)' },
    { label: 'Est. Total Tax Liability', value: f(totalTaxLiab), color: 'var(--red)', border: 'rgba(239,68,68,.12)' },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:14px 16px;border-color:' + k.border + '">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:24px;font-weight:700;color:' + k.color + ';letter-spacing:-.8px;font-family:var(--font-mono)">' + k.value + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* VAT section */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px">');
  html.push('  <div class="section-head">');
  html.push('    <div>');
  html.push('      <span class="section-title">VAT (15%)</span>');
  html.push('      <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-left:8px">Output less Input</span>');
  html.push('    </div>');
  html.push('  </div>');
  html.push('  <div style="padding:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">');
  [
    { label: 'VAT Collected (Output)', value: f(vatCollected), color: 'var(--green)', note: '15% of revenue' },
    { label: 'VAT Paid (Input)',       value: f(vatPaid),      color: 'var(--red)',   note: '15% of expenses' },
    { label: 'VAT Payable to SARS',    value: f(vatPayable),   color: vatPayable > 0 ? 'var(--red)' : 'var(--green)', note: vatPayable > 0 ? 'Owed to SARS' : 'VAT refund possible' },
  ].forEach(function(k) {
    html.push('<div style="padding:12px;border-radius:9px;background:var(--panel);border:1px solid var(--border)">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:18px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.5px;margin-top:4px">' + k.value + '</div>');
    html.push('  <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);margin-top:4px">' + k.note + '</div>');
    html.push('</div>');
  });
  html.push('  </div>');
  html.push('</div>');

  /* Income tax estimate */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px">');
  html.push('  <div class="section-head">');
  html.push('    <span class="section-title">Income Tax Estimate</span>');
  html.push('    <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Small business rate · ' + Math.round(incomeTaxRate * 100) + '%</span>');
  html.push('  </div>');
  html.push('  <div style="padding:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">');
  [
    { label: 'Taxable Income',       value: f(Math.max(grossProfit, 0)), color: 'var(--text)',   note: 'Revenue − Expenses' },
    { label: 'Estimated Annual Tax', value: f(estimatedTax),             color: 'var(--red)',    note: 'At ' + Math.round(incomeTaxRate * 100) + '% rate' },
    { label: 'Provisional Tax (50%)',value: f(provisionalTax1),          color: 'var(--accent)', note: 'First payment' },
  ].forEach(function(k) {
    html.push('<div style="padding:12px;border-radius:9px;background:var(--panel);border:1px solid var(--border)">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:18px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.5px;margin-top:4px">' + k.value + '</div>');
    html.push('  <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);margin-top:4px">' + k.note + '</div>');
    html.push('</div>');
  });
  html.push('  </div>');
  html.push('</div>');

  /* Tax rate bracket reference */
  html.push('<div class="glass" style="padding:14px">');
  html.push('  <div class="label-xs" style="margin-bottom:12px">Small Business Tax Brackets (ZA · Estimate)</div>');
  html.push('  <div style="display:flex;flex-direction:column;gap:6px">');
  var brackets = [
    { range: 'R0 — R95,750',          rate: '0%',   current: grossProfit <= 95750 },
    { range: 'R95,751 — R365,000',     rate: '7%',   current: grossProfit > 95750 && grossProfit <= 365000 },
    { range: 'R365,001 — R550,000',    rate: '21%',  current: grossProfit > 365000 && grossProfit <= 550000 },
    { range: 'R550,001+',              rate: '28%',  current: grossProfit > 550000 },
  ];
  brackets.forEach(function(b) {
    html.push('  <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:8px;background:' + (b.current ? 'var(--accent-d)' : 'var(--panel)') + ';border:1px solid ' + (b.current ? 'rgba(249,115,22,.2)' : 'var(--border)') + '">');
    html.push('    <span style="font-size:11px;color:' + (b.current ? 'var(--text)' : 'var(--text-sub)') + ';font-family:var(--font-mono)">' + b.range + '</span>');
    html.push('    <div style="display:flex;align-items:center;gap:8px">');
    html.push('      <span style="font-size:12px;font-weight:700;color:' + (b.current ? 'var(--accent)' : 'var(--text-dim)') + ';font-family:var(--font-mono)">' + b.rate + '</span>');
    if (b.current) {
      html.push('      <span style="font-size:9px;padding:2px 8px;border-radius:99px;background:var(--accent-d);border:1px solid rgba(249,115,22,.2);color:var(--accent);font-family:var(--font-mono)">◀ your bracket</span>');
    }
    html.push('    </div>');
    html.push('  </div>');
  });
  html.push('  </div>');
  html.push('</div>');

  return html.join('\n');
};
