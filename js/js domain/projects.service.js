/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — domain/projects.service.js
   All project + order operations.
═══════════════════════════════════════════════════════════ */

'use strict';

window.ProjectsService = {

  /* ── PROJECTS ─────────────────────────────────────────── */
  addProject: async function(data) {
    var payload = {
      name:     data.name,
      status:   data.status   || 'planning',
      progress: data.progress || 0,
      due:      data.due      || '',
    };
    var result = window.Validate.project(payload);
    if (!result.ok) { window.Validate.showErrors(result.errors); return false; }

    var project = {
      id:       'PRJ-' + String(window.D.projects.length + 1).padStart(3, '0'),
      name:     payload.name.trim(),
      status:   payload.status,
      progress: payload.progress,
      due:      payload.due,
    };

    window.D.projects.unshift(project);

    if (window.DB) {
      try { await window.DB.saveProject(project); }
      catch(e) { console.warn('[Projects] Save failed', e); }
    }

    window.logActivity('Project created', { name: project.name });
    window.toast('✓ Project created', 'success');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    return true;
  },

  updateProgress: async function(projectId, progress) {
    var p = window.D.projects.find(function(x) { return x.id === projectId; });
    if (!p) { return false; }

    progress = Math.min(100, Math.max(0, parseInt(progress) || 0));
    p.progress = progress;
    if (progress === 100) { p.status = 'complete'; }
    else if (p.status === 'complete') { p.status = 'active'; }

    if (window.DB && p.dbId) {
      try { await window.DB.updateProjectProgress(p.dbId, progress, p.status); }
      catch(e) { console.warn('[Projects] Progress update failed', e); }
    }

    window.logActivity('Project progress updated', { id: projectId, progress: progress });
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    return true;
  },

  softDeleteProject: function(projectId) {
    var p = window.D.projects.find(function(x) { return x.id === projectId; });
    if (!p) { return false; }
    p._deleted = true;
    window.logActivity('Project deleted', { id: projectId, name: p.name });
    window.toast('Project removed', 'info');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    return true;
  },

  getActiveProjects: function() {
    return window.D.projects.filter(function(p) { return !p._deleted; });
  },

  /* ── ORDERS ──────────────────────────────────────────── */
  addOrder: async function(data) {
    var payload = {
      name:     data.name,
      priority: data.priority || 'me',
      status:   'pending',
    };
    var result = window.Validate.order(payload);
    if (!result.ok) { window.Validate.showErrors(result.errors); return false; }

    var order = {
      id:       'ORD-' + String(window.D.orders.length + 1).padStart(3, '0'),
      name:     payload.name.trim(),
      client:   (data.client || '').trim(),
      due:      data.due      || '',
      priority: payload.priority,
      status:   payload.status,
      tasks:    data.tasks    || [],
    };

    window.D.orders.unshift(order);

    if (window.DB) {
      try { await window.DB.saveOrder(order); }
      catch(e) { console.warn('[Projects] Order save failed', e); }
    }

    window.logActivity('Order created', { name: order.name });
    window.toast('✓ Order created', 'success');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    return true;
  },

  addTask: async function(orderId, taskText) {
    if (!taskText || !taskText.trim()) {
      window.toast('Task description is required', 'error');
      return false;
    }
    var order = window.D.orders.find(function(o) { return o.id === orderId; });
    if (!order) { return false; }

    order.tasks.push({ text: taskText.trim(), done: false });

    if (window.DB && order.dbId) {
      try { await window.DB.updateOrderTasks(order.dbId, order.tasks, order.status); }
      catch(e) { console.warn('[Projects] Task save failed', e); }
    }

    window.logActivity('Task added', { order: orderId, task: taskText });
    window.toast('✓ Task added', 'success');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    return true;
  },

  toggleTask: async function(orderId, taskIndex, checked) {
    var order = window.D.orders.find(function(o) { return o.id === orderId; });
    if (!order || !order.tasks[taskIndex]) { return false; }

    order.tasks[taskIndex].done = checked;

    var done  = order.tasks.filter(function(t) { return t.done; }).length;
    var total = order.tasks.length;

    if (done === total && order.status === 'in-progress') {
      window.toast('All tasks done — ready to complete!', 'success');
    }

    if (window.DB && order.dbId) {
      try { await window.DB.updateOrderTasks(order.dbId, order.tasks, order.status); }
      catch(e) { console.warn('[Projects] Task toggle save failed', e); }
    }

    window.logActivity(checked ? 'Task completed' : 'Task unchecked', {
      order: orderId, task: order.tasks[taskIndex].text, progress: done + '/' + total
    });
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    return true;
  },

  getActiveOrders: function() {
    return window.D.orders.filter(function(o) { return !o._deleted; });
  },
};
