/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — pages-admin.js
   Render functions: Admin Overview, Admin Users,
                     Admin Marketplace, Admin System
   Rules: reads window.ADMIN + window.D + CONFIG.
          Admin pages only visible to role === 'admin'.
          All writes go through explicit handlers.
          Guard every render with isAdmin() check.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   ADMIN GUARD — shared across all admin renders
───────────────────────────────────────────────────────── */
function _adminGuard() {
  if (!window.isAdmin()) {
    return '<div style="padding:60px;text-align:center">' +
      '<div style="font-size:32px;margin-bottom:14px">🔒</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px">Admin Access Required</div>' +
      '<div style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">Your account does not have admin privileges.</div>' +
      '</div>';
  }
  return null;
}

/* Admin accent colors — indigo theme distinct from operator orange */
var _ADM = {
  accent:  '#818cf8',
  accentD: 'rgba(99,102,241,.10)',
  accentG: 'rgba(99,102,241,.25)',
  border:  'rgba(99,102,241,.22)',
  green:   '#4ade80',
  red:     '#f87171',
};

/* ─────────────────────────────────────────────────────────
   ADMIN OVERVIEW
───────────────────────────────────────────────────────── */
window.renderAdminOverview = function() {
  var guard = _adminGuard();
  if (guard) { return guard; }

  var A    = window.ADMIN;
  var D    = window.D;
  var f    = window.fmt;
  var html = [];

  var recentActivity = (D.activity || []).slice(0, 8);
  var insights       = window.generateInsights();

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">');
  html.push('      <h2 style="font-size:14px;font-weight:700">Platform Overview</h2>');
  html.push('      <span class="env-badge">' + CONFIG.PLATFORM.mode.toUpperCase() + ' MODE</span>');
  html.push('    </div>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">CoLAB OS ' + CONFIG.PLATFORM.version + ' · ' + new Date().toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + '</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <button class="btn-ghost" style="font-size:11px" onclick="window._adminExportPlatform()">↓ Platform Report</button>');
  html.push('    <button class="btn-primary" style="font-size:11px;background:linear-gradient(135deg,' + _ADM.accent + ',#6366f1)" onclick="window.navigateTo(\'admin-system\')">⚙ System</button>');
  html.push('  </div>');
  html.push('</div>');

  /* Platform KPIs */
  html.push('<div class="grid-4" style="margin-bottom:13px">');
  [
    { label: 'Total Users',    value: A.platform.totalUsers,   color: _ADM.accent, sub: '+' + A.platform.newUsersWeek + ' this week' },
    { label: 'Active / Month', value: A.platform.activeMonth,  color: _ADM.green,  sub: Math.round(A.platform.activeMonth / A.platform.totalUsers * 100) + '% of total' },
    { label: 'Platform MRR',   value: f(A.platform.mrr),       color: _ADM.green,  sub: 'Monthly recurring' },
    { label: 'Marketplace GMV',value: f(A.platform.gmv),       color: _ADM.accent, sub: f(A.platform.commission) + ' commission' },
  ].forEach(function(k, i) {
    html.push('<div class="glass" style="padding:13px 15px;animation:fadeUp .35s ' + (i * 40) + 'ms both;border-color:' + _ADM.border + '">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:20px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.5px;margin-top:3px">' + k.value + '</div>');
    html.push('  <div style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);margin-top:3px">' + k.sub + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* Smart Insights */
  if (insights.length > 0) {
    html.push('<div style="padding:12px 16px;border-radius:10px;margin-bottom:13px;background:' + _ADM.accentD + ';border:1px solid ' + _ADM.border + ';border-left:3px solid ' + _ADM.accent + '">');
    html.push('  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">');
    html.push('    <span style="font-size:13px">⚡</span>');
    html.push('    <span style="font-size:11px;font-weight:700;color:' + _ADM.accent + ';font-family:var(--font-mono);letter-spacing:.3px;text-transform:uppercase">Smart Insights</span>');
    html.push('  </div>');
    insights.forEach(function(ins) {
      html.push('  <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-sub);font-family:var(--font-mono);margin-bottom:5px">');
      html.push('    <span style="width:5px;height:5px;border-radius:50%;background:' + _ADM.accent + ';flex-shrink:0;display:inline-block"></span>' + ins);
      html.push('  </div>');
    });
    html.push('</div>');
  }

  /* Two-col layout */
  html.push('<div class="dash-grid" style="display:grid;grid-template-columns:1fr 280px;gap:12px">');

  /* Left: Recent users + tools */
  html.push('<div style="display:flex;flex-direction:column;gap:10px">');

  /* Recent users */
  html.push('<div class="glass" style="overflow:hidden;border-color:' + _ADM.border + '">');
  html.push('  <div class="section-head">');
  html.push('    <span class="section-title">Recent Users</span>');
  html.push('    <button class="btn-ghost" style="font-size:11px" onclick="window.navigateTo(\'admin-users\')">All users →</button>');
  html.push('  </div>');
  var uHeaders = ['Name', 'Business', 'Tier', 'Status', 'Joined'];
  var uRows = A.users.slice(0, 4).map(function(u) {
    var tierColor = { enterprise: _ADM.accent, ecommerce: 'var(--accent)', standard: 'var(--purple)', basic: 'var(--text-dim)' }[u.tier] || 'var(--text-dim)';
    return [
      '<span style="font-weight:600;color:var(--text)">'  + u.name + '</span>',
      '<span style="color:var(--text-sub)">'              + u.biz  + '</span>',
      '<span class="tag" style="background:' + _ADM.accentD + ';color:' + tierColor + '">' + u.tier + '</span>',
      window.pill(u.status),
      '<span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + u.joined + '</span>',
    ];
  });
  html.push(window.table(uHeaders, uRows));
  html.push('</div>');

  /* Marketplace tools */
  html.push('<div class="glass" style="overflow:hidden;border-color:' + _ADM.border + '">');
  html.push('  <div class="section-head">');
  html.push('    <span class="section-title">Top Tools</span>');
  html.push('    <button class="btn-ghost" style="font-size:11px" onclick="window.navigateTo(\'admin-mkt\')">All tools →</button>');
  html.push('  </div>');
  var tHeaders = ['Tool', 'Developer', 'Sales', 'Revenue', 'Status'];
  var tRows = A.tools.slice(0, 4).map(function(t) {
    return [
      '<span style="font-weight:500;color:var(--text)">' + t.name + '</span>',
      '<span style="font-size:10px;color:var(--text-dim)">'   + t.dev  + '</span>',
      '<span style="font-family:var(--font-mono);color:var(--text-sub)">' + t.sales + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:600;color:var(--green)">' + (t.rev > 0 ? window.fmt(t.rev) : '—') + '</span>',
      window.pill(t.status),
    ];
  });
  html.push(window.table(tHeaders, tRows));
  html.push('</div>');
  html.push('</div>'); /* end left */

  /* Right: Activity feed + pending */
  html.push('<div style="display:flex;flex-direction:column;gap:10px">');

  /* Pending approvals badge */
  if (A.platform.pendingTools > 0) {
    html.push('<div style="padding:12px 14px;border-radius:10px;background:' + _ADM.accentD + ';border:1px solid ' + _ADM.border + ';display:flex;align-items:center;justify-content:space-between;gap:8px">');
    html.push('  <div><div style="font-size:12px;font-weight:700;color:' + _ADM.accent + ';margin-bottom:3px">' + A.platform.pendingTools + ' tools pending approval</div>');
    html.push('  <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Review in Marketplace</div></div>');
    html.push('  <button class="btn-ghost" style="font-size:11px;border-color:' + _ADM.border + ';color:' + _ADM.accent + '" onclick="window.navigateTo(\'admin-mkt\')">Review →</button>');
    html.push('</div>');
  }

  /* Activity feed */
  html.push('<div class="glass" style="overflow:hidden;border-color:' + _ADM.border + '">');
  html.push('  <div class="section-head"><span class="section-title">Activity Feed</span><span style="font-size:9.5px;color:var(--text-dim);font-family:var(--font-mono)">' + (D.activity || []).length + ' events</span></div>');
  html.push('  <div style="padding:8px 14px">');
  if (recentActivity.length === 0) {
    html.push('    <div style="padding:20px 0;text-align:center;font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">No activity yet.</div>');
  } else {
    recentActivity.forEach(function(evt) {
      html.push('    <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">');
      html.push('      <div style="width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:5px;background:' + _ADM.accent + ';box-shadow:0 0 5px ' + _ADM.accentG + '"></div>');
      html.push('      <div style="flex:1;min-width:0">');
      html.push('        <div style="font-size:11.5px;font-weight:500;color:var(--text-sub)">' + evt.action + '</div>');
      if (evt.meta && Object.keys(evt.meta).length > 0) {
        var metaStr = Object.entries(evt.meta).map(function(e) { return e[0] + ': ' + e[1]; }).join(' · ');
        html.push('        <div style="font-size:9.5px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + metaStr + '</div>');
      }
      html.push('      </div>');
      html.push('      <span style="font-size:9px;color:var(--text-dim);font-family:var(--font-mono);flex-shrink:0;margin-top:2px">' + evt.time + '</span>');
      html.push('    </div>');
    });
  }
  html.push('  </div>');
  html.push('</div>');

  /* Quick admin actions */
  html.push('<div class="glass" style="padding:14px;border-color:' + _ADM.border + '">');
  html.push('  <div class="label-xs" style="margin-bottom:10px">Admin Actions</div>');
  html.push('  <div style="display:flex;flex-direction:column;gap:6px">');
  [
    { label: 'Invite User',       fn: "window.toast('Invite user: v11.1','info')" },
    { label: 'Review Pending Tools', fn: "window.navigateTo('admin-mkt')"        },
    { label: 'Export User List',  fn: "window.csvExport(window.ADMIN.users,'colab-users.csv')" },
    { label: 'System Health',     fn: "window.navigateTo('admin-system')"         },
  ].forEach(function(a) {
    html.push('    <button class="btn-ghost" style="justify-content:flex-start;font-size:11.5px" onclick="' + a.fn + '">' + a.label + '</button>');
  });
  html.push('  </div>');
  html.push('</div>');
  html.push('</div>'); /* end right */
  html.push('</div>'); /* end dash-grid */

  return html.join('\n');
};

window._adminExportPlatform = function() {
  var payload = {
    exportedAt: new Date().toISOString(),
    platform:   window.ADMIN.platform,
    users:      window.ADMIN.users,
    tools:      window.ADMIN.tools,
    activity:   (window.D.activity || []).slice(0, 50),
  };
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href   = url;
  a.download = 'colab-platform-report-' + new Date().toISOString().substring(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  window.logActivity('Platform report exported', {});
  window.toast('✓ Platform report exported', 'success');
};

/* ─────────────────────────────────────────────────────────
   ADMIN USERS
───────────────────────────────────────────────────────── */
window.renderAdminUsers = function() {
  var guard = _adminGuard();
  if (guard) { return guard; }

  var A    = window.ADMIN;
  var f    = window.fmt;
  var html = [];

  var activeUsers    = A.users.filter(function(u) { return u.status === 'active';    });
  var suspendedUsers = A.users.filter(function(u) { return u.status === 'suspended'; });
  var totalSpend     = A.users.reduce(function(s, u) { return s + u.spend; }, 0);

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">Users</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + A.users.length + ' total · ' + activeUsers.length + ' active · ' + suspendedUsers.length + ' suspended</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <button class="btn-ghost" onclick="window.csvExport(window.ADMIN.users,\'colab-users.csv\')">↓ Export CSV</button>');
  html.push('    <button class="btn-primary" style="font-size:12px;background:linear-gradient(135deg,' + _ADM.accent + ',#6366f1)" onclick="window.toast(\'Invite user: connect email service in Integrations\',\'info\')">+ Invite User</button>');
  html.push('  </div>');
  html.push('</div>');

  /* KPI strip */
  html.push('<div class="grid-4" style="margin-bottom:13px">');
  [
    { label: 'Total Users',     value: A.platform.totalUsers,  color: _ADM.accent },
    { label: 'Active / Month',  value: A.platform.activeMonth, color: _ADM.green  },
    { label: 'New This Week',   value: A.platform.newUsersWeek,color: _ADM.accent },
    { label: 'Total Revenue',   value: f(totalSpend),          color: _ADM.green  },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:12px 14px;border-color:' + _ADM.border + '">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:18px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.5px">' + k.value + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* Users table */
  html.push('<div class="glass" style="overflow:hidden;border-color:' + _ADM.border + '">');
  html.push('  <div class="section-head"><span class="section-title">All Users</span></div>');
  var headers = ['ID', 'Name', 'Business', 'Tier', 'Status', 'Joined', 'Spend', 'Actions'];
  var rows = A.users.map(function(u) {
    var tierColor = { enterprise: _ADM.accent, ecommerce: 'var(--accent)', standard: 'var(--purple)', basic: 'var(--text-dim)' }[u.tier] || 'var(--text-dim)';
    var isSuspended = u.status === 'suspended';
    return [
      '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">' + u.id + '</span>',
      '<span style="font-weight:600;color:var(--text)">' + u.name + '</span>',
      '<span style="color:var(--text-sub)">'             + u.biz  + '</span>',
      '<span class="tag" style="background:' + _ADM.accentD + ';color:' + tierColor + '">' + u.tier + '</span>',
      window.pill(u.status),
      '<span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + u.joined + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:600;color:var(--green)">' + (u.spend > 0 ? f(u.spend) : '—') + '</span>',
      '<div style="display:flex;gap:4px">' +
        '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window.toast(\'User detail: ' + u.name + '\',\'info\')">View</button>' +
        (isSuspended
          ? '<button class="btn-ghost" style="font-size:10px;padding:3px 8px;color:var(--green);border-color:rgba(34,197,94,.2)" onclick="_adminRestoreUser(\'' + u.id + '\')">Restore</button>'
          : '<button class="btn-ghost" style="font-size:10px;padding:3px 8px;color:var(--red);border-color:rgba(239,68,68,.2)" onclick="_adminSuspendUser(\'' + u.id + '\')">Suspend</button>'
        ) +
      '</div>',
    ];
  });
  html.push(window.table(headers, rows));
  html.push('</div>');

  return html.join('\n');
};

window._adminSuspendUser = function(id) {
  var u = window.ADMIN.users.find(function(x) { return x.id === id; });
  if (!u) { return; }
  u.status = 'suspended';
  window.logActivity('User suspended', { id: id, name: u.name });
  window.toast('User ' + u.name + ' suspended', 'warn');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

window._adminRestoreUser = function(id) {
  var u = window.ADMIN.users.find(function(x) { return x.id === id; });
  if (!u) { return; }
  u.status = 'active';
  window.logActivity('User restored', { id: id, name: u.name });
  window.toast('✓ ' + u.name + ' restored', 'success');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

/* ─────────────────────────────────────────────────────────
   ADMIN MARKETPLACE
───────────────────────────────────────────────────────── */
window.renderAdminMarketplace = function() {
  var guard = _adminGuard();
  if (guard) { return guard; }

  var A    = window.ADMIN;
  var f    = window.fmt;
  var html = [];

  var live    = A.tools.filter(function(t) { return t.status === 'live';    });
  var pending = A.tools.filter(function(t) { return t.status === 'pending'; });
  var totalRev = A.tools.reduce(function(s, t) { return s + t.rev; }, 0);

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">Marketplace Admin</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + A.tools.length + ' tools · ' + live.length + ' live · ' + pending.length + ' pending review</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <button class="btn-ghost" onclick="window.csvExport(window.ADMIN.tools,\'colab-mkt-tools.csv\')">↓ Export</button>');
  html.push('    <button class="btn-primary" style="font-size:12px;background:linear-gradient(135deg,' + _ADM.accent + ',#6366f1)" onclick="window.toast(\'Add tool: submit via colabos.store/submit\',\'info\')">+ Add Tool</button>');
  html.push('  </div>');
  html.push('</div>');

  /* KPI strip */
  html.push('<div class="grid-3" style="margin-bottom:13px">');
  [
    { label: 'Total GMV',        value: f(A.platform.gmv),        color: _ADM.green  },
    { label: 'Commission (15%)', value: f(A.platform.commission), color: _ADM.accent },
    { label: 'Pending Review',   value: pending.length,           color: pending.length > 0 ? 'var(--red)' : _ADM.green },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:12px 14px;border-color:' + _ADM.border + '">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:20px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.5px">' + k.value + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* Pending review section */
  if (pending.length > 0) {
    html.push('<div class="glass" style="overflow:hidden;margin-bottom:13px;border-color:rgba(239,68,68,.2)">');
    html.push('  <div class="section-head"><div style="display:flex;align-items:center;gap:7px"><span class="dot-live" style="background:var(--red)"></span><span class="section-title" style="color:var(--red)">Awaiting Approval (' + pending.length + ')</span></div></div>');
    pending.forEach(function(t) {
      html.push('  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border)">');
      html.push('    <div style="flex:1;min-width:0">');
      html.push('      <div style="font-size:12.5px;font-weight:600;color:var(--text)">' + t.name + '</div>');
      html.push('      <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">By ' + t.dev + ' · Submitted for review</div>');
      html.push('    </div>');
      html.push('    <div style="display:flex;gap:6px;flex-shrink:0">');
      html.push('      <button class="btn-ghost" style="font-size:11px;padding:5px 11px" onclick="window.toast(\'Review ' + t.name + ' details: v11.1\',\'info\')">Review</button>');
      html.push('      <button class="btn-ghost" style="font-size:11px;padding:5px 11px;color:var(--red);border-color:rgba(239,68,68,.2)" onclick="_adminRejectTool(\'' + t.id + '\')">Reject</button>');
      html.push('      <button class="btn-primary" style="font-size:11px;padding:5px 11px;background:linear-gradient(135deg,' + _ADM.accent + ',#6366f1)" onclick="_adminApproveTool(\'' + t.id + '\')">Approve</button>');
      html.push('    </div>');
      html.push('  </div>');
    });
    html.push('</div>');
  }

  /* All tools table */
  html.push('<div class="glass" style="overflow:hidden;border-color:' + _ADM.border + '">');
  html.push('  <div class="section-head"><span class="section-title">All Tools</span></div>');
  var headers = ['ID', 'Tool', 'Developer', 'Sales', 'Revenue', 'Rating', 'Status', 'Actions'];
  var rows = A.tools.map(function(t) {
    return [
      '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim)">' + t.id + '</span>',
      '<span style="font-weight:500;color:var(--text)">'   + t.name + '</span>',
      '<span style="font-size:11px;color:var(--text-dim)">' + t.dev  + '</span>',
      '<span style="font-family:var(--font-mono);color:var(--text-sub)">' + t.sales + '</span>',
      '<span style="font-family:var(--font-mono);font-weight:600;color:var(--green)">' + (t.rev > 0 ? f(t.rev) : '—') + '</span>',
      '<span style="font-family:var(--font-mono);color:var(--accent)">' + (t.rating > 0 ? '★ ' + t.rating : '—') + '</span>',
      window.pill(t.status),
      '<div style="display:flex;gap:4px">' +
        (t.status === 'live'
          ? '<button class="btn-ghost" style="font-size:10px;padding:3px 8px" onclick="window.toast(\'Edit ' + t.name + ': v11.1\',\'info\')">Edit</button>' +
            '<button class="btn-ghost" style="font-size:10px;padding:3px 8px;color:var(--red);border-color:rgba(239,68,68,.2)" onclick="_adminDelistTool(\'' + t.id + '\')">Delist</button>'
          : t.status === 'pending'
          ? '<button class="btn-primary" style="font-size:10px;padding:3px 8px;background:linear-gradient(135deg,' + _ADM.accent + ',#6366f1)" onclick="_adminApproveTool(\'' + t.id + '\')">Approve</button>'
          : ''
        ) +
      '</div>',
    ];
  });
  html.push(window.table(headers, rows));
  html.push('</div>');

  return html.join('\n');
};

window._adminApproveTool = function(id) {
  var t = window.ADMIN.tools.find(function(x) { return x.id === id; });
  if (!t) { return; }
  t.status = 'live';
  window.logActivity('Tool approved', { id: id, name: t.name });
  window.toast('✓ ' + t.name + ' approved and live', 'success');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

window._adminRejectTool = function(id) {
  var t = window.ADMIN.tools.find(function(x) { return x.id === id; });
  if (!t) { return; }
  t.status = 'rejected';
  window.logActivity('Tool rejected', { id: id, name: t.name });
  window.toast(t.name + ' rejected', 'warn');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

window._adminDelistTool = function(id) {
  var t = window.ADMIN.tools.find(function(x) { return x.id === id; });
  if (!t) { return; }
  t.status = 'delisted';
  window.logActivity('Tool delisted', { id: id, name: t.name });
  window.toast(t.name + ' delisted', 'warn');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

/* ─────────────────────────────────────────────────────────
   ADMIN SYSTEM
───────────────────────────────────────────────────────── */
window.renderAdminSystem = function() {
  var guard = _adminGuard();
  if (guard) { return guard; }

  var D    = window.D;
  var html = [];

  var configuredInts = Object.keys(CONFIG.INTEGRATIONS).filter(function(id) {
    return window.hasCreds(id);
  });
  var unconfiguredInts = Object.keys(CONFIG.INTEGRATIONS).filter(function(id) {
    return !window.hasCreds(id);
  });

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:14px;font-weight:700">System</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">Runtime config · Integration health · Build info</p>');
  html.push('  </div>');
  html.push('  <div style="display:flex;gap:7px">');
  html.push('    <button class="btn-ghost" onclick="window._adminExportConfig()">↓ Export Config</button>');
  html.push('    <button class="btn-primary" style="font-size:12px;background:linear-gradient(135deg,' + _ADM.accent + ',#6366f1)" onclick="window.navigateTo(\'integrations\')">Configure Integrations</button>');
  html.push('  </div>');
  html.push('</div>');

  /* System health grid */
  html.push('<div class="grid-4" style="margin-bottom:13px">');
  [
    { label: 'App Version',   value: CONFIG.PLATFORM.version, color: _ADM.accent },
    { label: 'Runtime Mode',  value: CONFIG.PLATFORM.mode.toUpperCase(), color: CONFIG.PLATFORM.mode === 'local' ? _ADM.green : 'var(--accent)' },
    { label: 'Integrations',  value: configuredInts.length + '/' + Object.keys(CONFIG.INTEGRATIONS).length + ' active', color: configuredInts.length > 0 ? _ADM.green : 'var(--red)' },
    { label: 'Activity Log',  value: (D.activity || []).length + ' events', color: _ADM.accent },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:12px 14px;border-color:' + _ADM.border + '">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:15px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.3px;margin-top:3px">' + k.value + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* Integration health */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px;border-color:' + _ADM.border + '">');
  html.push('  <div class="section-head"><span class="section-title">Integration Health</span><span style="font-size:9.5px;color:var(--text-dim);font-family:var(--font-mono)">' + configuredInts.length + ' of ' + Object.keys(CONFIG.INTEGRATIONS).length + ' configured</span></div>');
  html.push('  <div style="padding:10px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:7px">');
  CONFIG.getIntegrationList().forEach(function(card) {
    var isConfigured = window.hasCreds(card.id);
    html.push('  <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;background:' + (isConfigured ? 'rgba(34,197,94,.06)' : 'var(--panel)') + ';border:1px solid ' + (isConfigured ? 'rgba(34,197,94,.18)' : 'var(--border)') + '">');
    html.push('    <span style="font-size:16px">' + card.icon + '</span>');
    html.push('    <div style="flex:1;min-width:0">');
    html.push('      <div style="font-size:11.5px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + card.label + '</div>');
    html.push('      <div style="font-size:9px;color:' + (isConfigured ? 'var(--green)' : 'var(--text-dim)') + ';font-family:var(--font-mono)">' + (isConfigured ? '✓ configured' : 'not configured') + '</div>');
    html.push('    </div>');
    html.push('    <button class="btn-ghost" style="font-size:9.5px;padding:2px 7px;flex-shrink:0" onclick="window.navigateTo(\'integrations\')">' + (isConfigured ? 'Edit' : 'Set up') + '</button>');
    html.push('  </div>');
  });
  html.push('  </div>');
  html.push('</div>');

  /* Live CONFIG dump */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px;border-color:' + _ADM.border + '">');
  html.push('  <div class="section-head"><span class="section-title">Runtime Configuration</span><span class="env-badge ' + CONFIG.PLATFORM.mode + '">' + CONFIG.PLATFORM.mode.toUpperCase() + '</span></div>');
  html.push('  <div style="padding:14px">');
  html.push('  <div class="cfg-block">');
  html.push('<span class="cfg-cmt">// COLAB-OS v11 — Runtime Config</span><br/>');
  [
    ['PLATFORM.name',    CONFIG.PLATFORM.name   ],
    ['PLATFORM.version', CONFIG.PLATFORM.version],
    ['PLATFORM.build',   CONFIG.PLATFORM.build  ],
    ['PLATFORM.mode',    CONFIG.PLATFORM.mode   ],
    ['WEBSITE.home',     CONFIG.WEBSITE.home    ],
    ['WEBSITE.docs',     CONFIG.WEBSITE.docs    ],
    ['BUSINESS.name',    CONFIG.BUSINESS.name   ],
    ['BUSINESS.email',   CONFIG.BUSINESS.email  ],
    ['BUSINESS.country', CONFIG.BUSINESS.country],
    ['USER.name',        D.user.name            ],
    ['USER.role',        D.user.role            ],
    ['USER.tier',        D.user.tier            ],
    ['CURRENCY',         window.AC              ],
  ].forEach(function(row) {
    html.push('<span class="cfg-key">' + row[0] + '</span> = <span class="cfg-val">"' + (row[1] || '') + '"</span><br/>');
  });
  html.push('  </div>');
  html.push('  </div>');
  html.push('</div>');

  /* Website links */
  html.push('<div class="glass" style="overflow:hidden;margin-bottom:12px;border-color:' + _ADM.border + '">');
  html.push('  <div class="section-head"><span class="section-title">Website Links</span></div>');
  html.push('  <div style="padding:10px;display:flex;flex-direction:column;gap:6px">');
  [
    { label: 'Main Site',    url: CONFIG.WEBSITE.home        },
    { label: 'Docs',         url: CONFIG.WEBSITE.docs        },
    { label: 'Support',      url: CONFIG.WEBSITE.support     },
    { label: 'Marketplace',  url: CONFIG.WEBSITE.marketplace },
    { label: 'Downloads',    url: CONFIG.WEBSITE.downloads   },
  ].forEach(function(link) {
    html.push('  <a href="' + link.url + '" target="_blank" style="display:flex;align-items:center;justify-content:space-between;padding:9px 13px;border-radius:9px;background:var(--panel);border:1px solid var(--border);text-decoration:none;transition:all .15s" onmouseover="this.style.borderColor=\'' + _ADM.border + '\'" onmouseout="this.style.borderColor=\'var(--border)\'">');
    html.push('    <span style="font-size:12px;font-weight:500;color:var(--text)">' + link.label + '</span>');
    html.push('    <span style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + link.url + ' ↗</span>');
    html.push('  </a>');
  });
  html.push('  </div>');
  html.push('</div>');

  /* Danger zone */
  html.push('<div class="glass" style="overflow:hidden;border-color:rgba(239,68,68,.2)">');
  html.push('  <div class="section-head"><span class="section-title" style="color:var(--red)">Danger Zone</span></div>');
  html.push('  <div style="padding:14px;display:flex;flex-direction:column;gap:8px">');
  [
    { label: 'Clear Activity Log',   desc: 'Remove all ' + (D.activity||[]).length + ' activity entries',                 fn: "window._settingsClearActivity()", danger: false },
    { label: 'Reset Integrations',   desc: 'Clear all saved API credentials from localStorage',                           fn: "window._adminClearIntegrations()", danger: true  },
  ].forEach(function(a) {
    html.push('  <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;background:' + (a.danger ? 'var(--red-d)' : 'var(--panel)') + ';border:1px solid ' + (a.danger ? 'rgba(239,68,68,.2)' : 'var(--border)') + '">');
    html.push('    <div><div style="font-size:12px;font-weight:600;color:' + (a.danger ? 'var(--red)' : 'var(--text)') + '">' + a.label + '</div>');
    html.push('    <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + a.desc + '</div></div>');
    html.push('    <button class="btn-ghost" style="font-size:11px;' + (a.danger ? 'color:var(--red);border-color:rgba(239,68,68,.2)' : '') + '" onclick="' + a.fn + '">' + a.label + '</button>');
    html.push('  </div>');
  });
  html.push('  </div>');
  html.push('</div>');

  return html.join('\n');
};

window._adminExportConfig = function() {
  var payload = {
    exportedAt: new Date().toISOString(),
    platform:   CONFIG.PLATFORM,
    website:    CONFIG.WEBSITE,
    business:   CONFIG.BUSINESS,
    features:   CONFIG.FEATURES,
    defaults:   CONFIG.DEFAULTS,
    user: {
      name:  window.D.user.name,
      role:  window.D.user.role,
      tier:  window.D.user.tier,
    },
    currency:   window.AC,
  };
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href   = url;
  a.download = 'colab-config-' + new Date().toISOString().substring(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  window.logActivity('Config exported', {});
  window.toast('✓ Config exported as JSON', 'success');
};

window._adminClearIntegrations = function() {
  Object.keys(CONFIG.INTEGRATIONS).forEach(function(id) {
    localStorage.removeItem('colab_creds_' + id);
  });
  window.logActivity('All integration credentials cleared', {});
  window.toast('All integration credentials cleared', 'warn');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};
