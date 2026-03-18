/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — pages-projects.js
   Render functions: Projects, Orders (checklist)
   Rules: read from window.D only.
          call window.* helpers from services.js.
          no global state mutations except via explicit actions.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   PROJECTS
───────────────────────────────────────────────────────── */
window.renderProjects = function() {
  var D    = window.D;
  var html = [];

  var active   = D.projects.filter(function(p) { return p.status === 'active';   });
  var planning = D.projects.filter(function(p) { return p.status === 'planning'; });
  var complete = D.projects.filter(function(p) { return p.status === 'complete'; });

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:13.5px;font-weight:700">Projects</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + active.length + ' active · ' + planning.length + ' planning · ' + complete.length + ' complete</p>');
  html.push('  </div>');
  html.push('  <button class="btn-primary" onclick="window.toast(\'New project: add to D.projects in data.js\',\'info\')">+ New Project</button>');
  html.push('</div>');

  /* KPI strip */
  html.push('<div class="grid-3" style="margin-bottom:13px">');
  [
    { label: 'Active',   value: active.length,   color: 'var(--accent)' },
    { label: 'Planning', value: planning.length,  color: 'var(--purple)' },
    { label: 'Complete', value: complete.length,  color: 'var(--green)'  },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:13px 15px">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:22px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.6px">' + k.value + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* Project cards */
  if (D.projects.length === 0) {
    html.push('<div class="glass" style="padding:40px;text-align:center">');
    html.push('  <div style="font-size:32px;margin-bottom:12px;opacity:.3">🗂️</div>');
    html.push('  <div style="font-size:13px;color:var(--text-dim);font-family:var(--font-mono)">No projects yet. Click + New Project to get started.</div>');
    html.push('</div>');
  } else {
    html.push('<div style="display:flex;flex-direction:column;gap:8px">');

    D.projects.forEach(function(p) {
      var barColor = p.progress === 100
        ? 'linear-gradient(90deg,var(--green),rgba(74,222,128,.6))'
        : p.status === 'planning'
          ? 'linear-gradient(90deg,var(--purple),rgba(167,139,250,.6))'
          : 'linear-gradient(90deg,var(--accent),rgba(249,115,22,.6))';

      var statusDot = {
        active:   'var(--accent)',
        planning: 'var(--purple)',
        complete: 'var(--green)',
      }[p.status] || 'var(--text-dim)';

      html.push('<div class="glass" style="padding:16px;cursor:default;transition:border-color .2s" onmouseover="this.style.borderColor=\'rgba(249,115,22,.2)\'" onmouseout="this.style.borderColor=\'\'">');

      /* Top row */
      html.push('  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px">');
      html.push('    <div style="flex:1;min-width:0">');
      html.push('      <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">');
      html.push('        <span class="dot-live" style="background:' + statusDot + ';box-shadow:0 0 6px ' + statusDot + '"></span>');
      html.push('        <div style="font-size:13px;font-weight:700;color:var(--text)">' + p.name + '</div>');
      html.push('      </div>');
      html.push('      <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Due ' + p.due + ' · ' + p.id + '</div>');
      html.push('    </div>');
      html.push('    <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">');
      html.push('      <span style="font-size:14px;font-weight:700;color:' + (p.progress === 100 ? 'var(--green)' : 'var(--text)') + ';font-family:var(--font-mono)">' + p.progress + '%</span>');
      html.push('      ' + window.pill(p.status));
      html.push('    </div>');
      html.push('  </div>');

      /* Progress bar */
      html.push('  <div class="progress-track">');
      html.push('    <div class="progress-fill" style="width:' + p.progress + '%;background:' + barColor + '"></div>');
      html.push('  </div>');

      /* Actions */
      html.push('  <div style="display:flex;gap:7px;margin-top:10px">');
      if (p.status !== 'complete') {
        html.push('    <button class="btn-ghost" style="font-size:11px" onclick="window.toast(\'Update progress — edit p.progress in data.js\',\'info\')">Update Progress</button>');
      }
      if (p.status === 'active') {
        html.push('    <button class="btn-ghost" style="font-size:11px" onclick="window.navigateTo(\'orders\')">View Orders</button>');
      }
      if (p.progress === 100 && p.status !== 'complete') {
        html.push('    <button class="btn-primary" style="font-size:11px" onclick="_markProjectComplete(\'' + p.id + '\')">✓ Mark Complete</button>');
      }
      html.push('  </div>');

      html.push('</div>');
    });

    html.push('</div>');
  }

  return html.join('\n');
};

/* Mark project complete handler */
window._markProjectComplete = function(id) {
  var p = window.D.projects.find(function(x) { return x.id === id; });
  if (p) {
    p.status   = 'complete';
    p.progress = 100;
    window.logActivity('Project marked complete', { id: id, name: p.name });
    window.toast('✓ ' + p.name + ' marked complete', 'success');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
  }
};

/* ─────────────────────────────────────────────────────────
   ORDERS (checklist-style job tracker)
───────────────────────────────────────────────────────── */
window.renderOrders = function() {
  var D    = window.D;
  var html = [];

  var inProgress = D.orders.filter(function(o) { return o.status === 'in-progress'; });
  var pending    = D.orders.filter(function(o) { return o.status === 'pending';     });
  var complete   = D.orders.filter(function(o) { return o.status === 'complete';    });

  /* Total tasks across all orders */
  var totalTasks = D.orders.reduce(function(s, o) { return s + o.tasks.length; }, 0);
  var doneTasks  = D.orders.reduce(function(s, o) { return s + o.tasks.filter(function(t) { return t.done; }).length; }, 0);

  /* Header */
  html.push('<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:8px;flex-wrap:wrap">');
  html.push('  <div>');
  html.push('    <h2 style="font-size:13.5px;font-weight:700">Orders & Checklists</h2>');
  html.push('    <p style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono);margin-top:2px">' + inProgress.length + ' in progress · ' + pending.length + ' pending · ' + doneTasks + '/' + totalTasks + ' tasks done</p>');
  html.push('  </div>');
  html.push('  <button class="btn-primary" onclick="window.toast(\'New order: add to D.orders in data.js\',\'info\')">+ New Order</button>');
  html.push('</div>');

  /* KPI strip */
  html.push('<div class="grid-4" style="margin-bottom:13px">');
  [
    { label: 'In Progress', value: inProgress.length, color: 'var(--accent)' },
    { label: 'Pending',     value: pending.length,    color: 'var(--purple)' },
    { label: 'Complete',    value: complete.length,   color: 'var(--green)'  },
    { label: 'Tasks Done',  value: doneTasks + ' / ' + totalTasks, color: 'var(--text)' },
  ].forEach(function(k) {
    html.push('<div class="glass" style="padding:13px 15px">');
    html.push('  <span class="label-xs">' + k.label + '</span>');
    html.push('  <div style="font-size:18px;font-weight:700;color:' + k.color + ';font-family:var(--font-mono);letter-spacing:-.5px">' + k.value + '</div>');
    html.push('</div>');
  });
  html.push('</div>');

  /* Order checklist cards */
  if (D.orders.length === 0) {
    html.push('<div class="glass" style="padding:40px;text-align:center">');
    html.push('  <div style="font-size:32px;margin-bottom:12px;opacity:.3">✅</div>');
    html.push('  <div style="font-size:13px;color:var(--text-dim);font-family:var(--font-mono)">No orders yet. Click + New Order to create a checklist.</div>');
    html.push('</div>');
  } else {
    D.orders.forEach(function(order) {
      var done    = order.tasks.filter(function(t) { return t.done; }).length;
      var total   = order.tasks.length;
      var pct     = total > 0 ? Math.round(done / total * 100) : 0;
      var priClass = order.priority === 'hi' ? 'priority-hi' : order.priority === 'me' ? 'priority-me' : 'priority-lo';
      var priLabel = order.priority === 'hi' ? 'high' : order.priority === 'me' ? 'medium' : 'low';
      var priColor = order.priority === 'hi' ? 'var(--red)' : order.priority === 'me' ? 'var(--accent)' : 'var(--green)';
      var priBg    = order.priority === 'hi' ? 'var(--red-d)'    : order.priority === 'me' ? 'var(--accent-d)' : 'var(--green-d)';
      var barColor = pct === 100 ? 'var(--green)' : 'var(--accent)';

      html.push('<div class="chk-card ' + priClass + '">');

      /* Card header */
      html.push('  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px">');
      html.push('    <div style="flex:1;min-width:0">');
      html.push('      <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px">' + order.name + '</div>');
      html.push('      <div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">' + order.client + ' · Due ' + order.due + '</div>');
      html.push('    </div>');
      html.push('    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">');
      html.push('      <span style="font-size:13px;font-weight:700;color:' + (pct === 100 ? 'var(--green)' : 'var(--text)') + ';font-family:var(--font-mono)">' + pct + '%</span>');
      html.push('      ' + window.pill(order.status));
      html.push('      <span class="tag" style="background:' + priBg + ';color:' + priColor + '">' + priLabel + '</span>');
      html.push('    </div>');
      html.push('  </div>');

      /* Progress bar */
      html.push('  <div class="progress-track" style="margin-bottom:12px">');
      html.push('    <div class="progress-fill" style="width:' + pct + '%;background:' + barColor + '"></div>');
      html.push('  </div>');

      /* Task checklist */
      order.tasks.forEach(function(task, ti) {
        var taskId = 'task-' + order.id + '-' + ti;
        html.push('  <div class="chk-item">');
        html.push('    <input type="checkbox" id="' + taskId + '" ' + (task.done ? 'checked' : '') + ' onchange="_toggleTask(\'' + order.id + '\',' + ti + ',this.checked)"/>');
        html.push('    <label for="' + taskId + '">' + task.text + '</label>');
        if (task.done) {
          html.push('    <span style="font-size:9px;color:var(--green);font-family:var(--font-mono);flex-shrink:0">✓ done</span>');
        }
        html.push('  </div>');
      });

      /* Card footer actions */
      html.push('  <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">');
      html.push('    <button class="btn-ghost" style="font-size:11px" onclick="_addTask(\'' + order.id + '\')">+ Add Task</button>');
      if (pct === 100 && order.status !== 'complete') {
        html.push('    <button class="btn-primary" style="font-size:11px" onclick="_markOrderComplete(\'' + order.id + '\')">✓ Mark Complete</button>');
      }
      if (order.status === 'pending') {
        html.push('    <button class="btn-ghost" style="font-size:11px" onclick="_startOrder(\'' + order.id + '\')">▶ Start Order</button>');
      }
      html.push('    <button class="btn-ghost" style="font-size:11px;margin-left:auto" onclick="window.toast(\'Link to project: v11.1\',\'info\')">Link Project</button>');
      html.push('  </div>');

      html.push('</div>');
    });
  }

  return html.join('\n');
};

/* ─────────────────────────────────────────────────────────
   ORDER INTERACTION HANDLERS
───────────────────────────────────────────────────────── */

/* Toggle individual task done/undone */
window._toggleTask = function(orderId, taskIndex, checked) {
  var order = window.D.orders.find(function(o) { return o.id === orderId; });
  if (!order || !order.tasks[taskIndex]) { return; }
  order.tasks[taskIndex].done = checked;

  var done  = order.tasks.filter(function(t) { return t.done; }).length;
  var total = order.tasks.length;

  window.logActivity(
    checked ? 'Task completed' : 'Task unchecked',
    { order: orderId, task: order.tasks[taskIndex].text, progress: done + '/' + total }
  );

  /* Auto-complete order if all tasks done */
  if (done === total && order.status === 'in-progress') {
    window.toast('All tasks done — ready to mark complete!', 'success');
  }

  /* Re-render to update progress bar and percentage */
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

/* Add a new blank task to an order */
window._addTask = function(orderId) {
  var order = window.D.orders.find(function(o) { return o.id === orderId; });
  if (!order) { return; }

  var text = window.prompt ? window.prompt('Task description:') : 'New task';
  if (!text || !text.trim()) { return; }

  order.tasks.push({ text: text.trim(), done: false });
  window.logActivity('Task added', { order: orderId, task: text.trim() });
  window.toast('Task added', 'success');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

/* Mark order as complete */
window._markOrderComplete = function(orderId) {
  var order = window.D.orders.find(function(o) { return o.id === orderId; });
  if (!order) { return; }
  order.status = 'complete';
  window.logActivity('Order marked complete', { id: orderId, name: order.name });
  window.toast('✓ ' + order.name + ' marked complete', 'success');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};

/* Start a pending order */
window._startOrder = function(orderId) {
  var order = window.D.orders.find(function(o) { return o.id === orderId; });
  if (!order) { return; }
  order.status = 'in-progress';
  window.logActivity('Order started', { id: orderId, name: order.name });
  window.toast('▶ ' + order.name + ' started', 'success');
  if (typeof window.renderApp === 'function') { window.renderApp(); }
};
