/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — domain/modals.js
   Add/Edit modals for all record types.
   These are the missing "create" UI that empty states call.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── ADD INVOICE ─────────────────────────────────────────── */
window._showAddInvoiceModal = function() {
  window.modal('New Invoice', [
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px">',
    '  <div style="grid-column:1/-1"><label class="label-xs">Client Name</label>',
    '    <select id="mi-client" class="inp" style="font-size:13px">',
    '      <option value="">— Select or type below —</option>',
    window.D.contacts.map(function(c) { return '<option>' + c.name + '</option>'; }).join(''),
    '    </select></div>',
    '  <div><label class="label-xs">Amount (' + window.AC + ')</label>',
    '    <input id="mi-amt" class="inp" type="number" placeholder="0.00" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Due Date</label>',
    '    <input id="mi-due" class="inp" type="date" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Status</label>',
    '    <select id="mi-status" class="inp" style="font-size:13px">',
    '      <option value="draft">Draft</option>',
    '      <option value="sent">Sent</option>',
    '    </select></div>',
    '</div>',
    '<div style="display:flex;gap:8px;margin-top:14px">',
    '  <button class="btn-ghost" onclick="window.closeModal()" style="flex:1;justify-content:center">Cancel</button>',
    '  <button class="btn-primary" onclick="_submitAddInvoice()" style="flex:1;justify-content:center">Create Invoice</button>',
    '</div>',
  ].join(''));
};

window._submitAddInvoice = async function() {
  var data = {
    client: (document.getElementById('mi-client') || {}).value || '',
    amt:    (document.getElementById('mi-amt')    || {}).value || '',
    due:    (document.getElementById('mi-due')    || {}).value || '',
    status: (document.getElementById('mi-status') || {}).value || 'draft',
  };
  var ok = await window.FinanceService.addInvoice(data);
  if (ok) { window.closeModal(); window.renderApp(); }
};

/* ── ADD EXPENSE ─────────────────────────────────────────── */
window._showAddExpenseModal = function() {
  window.modal('Log Expense', [
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px">',
    '  <div><label class="label-xs">Category</label>',
    '    <select id="me-cat" class="inp" style="font-size:13px">',
    '      ' + ['Software','Marketing','Fuel','Supplies','Salary','Equipment','Travel','Other'].map(function(c){return '<option>'+c+'</option>';}).join(''),
    '    </select></div>',
    '  <div><label class="label-xs">Amount (' + window.AC + ')</label>',
    '    <input id="me-amt" class="inp" type="number" placeholder="0.00" style="font-size:13px"/></div>',
    '  <div style="grid-column:1/-1"><label class="label-xs">Description</label>',
    '    <input id="me-desc" class="inp" placeholder="What was this for?" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Date</label>',
    '    <input id="me-date" class="inp" type="date" value="' + new Date().toISOString().substring(0,10) + '" style="font-size:13px"/></div>',
    '  <div style="display:flex;align-items:center;gap:8px;padding-top:20px">',
    '    <input type="checkbox" id="me-rec"/>',
    '    <label for="me-rec" style="font-size:12px;color:var(--text-sub)">Recurring monthly</label>',
    '  </div>',
    '</div>',
    '<div style="display:flex;gap:8px;margin-top:14px">',
    '  <button class="btn-ghost" onclick="window.closeModal()" style="flex:1;justify-content:center">Cancel</button>',
    '  <button class="btn-primary" onclick="_submitAddExpense()" style="flex:1;justify-content:center">Log Expense</button>',
    '</div>',
  ].join(''));
};

window._submitAddExpense = async function() {
  var recEl = document.getElementById('me-rec');
  var data = {
    cat:       (document.getElementById('me-cat')  || {}).value || '',
    amt:       (document.getElementById('me-amt')  || {}).value || '',
    desc:      (document.getElementById('me-desc') || {}).value || '',
    date:      (document.getElementById('me-date') || {}).value || '',
    recurring: recEl ? recEl.checked : false,
  };
  var ok = await window.FinanceService.addExpense(data);
  if (ok) { window.closeModal(); window.renderApp(); }
};

/* ── ADD CONTACT ─────────────────────────────────────────── */
window._showAddContactModal = function() {
  window.modal('Add Contact', [
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px">',
    '  <div><label class="label-xs">Full Name</label>',
    '    <input id="mc-name" class="inp" placeholder="Jane Smith" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Company</label>',
    '    <input id="mc-co" class="inp" placeholder="Acme Ltd" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Email</label>',
    '    <input id="mc-email" class="inp" type="email" placeholder="jane@acme.com" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Phone</label>',
    '    <input id="mc-phone" class="inp" type="tel" placeholder="+27 82 000 0000" style="font-size:13px"/></div>',
    '  <div style="grid-column:1/-1"><label class="label-xs">Tags (comma separated)</label>',
    '    <input id="mc-tags" class="inp" placeholder="client, founding, lead" style="font-size:13px"/></div>',
    '</div>',
    '<div style="display:flex;gap:8px;margin-top:14px">',
    '  <button class="btn-ghost" onclick="window.closeModal()" style="flex:1;justify-content:center">Cancel</button>',
    '  <button class="btn-primary" onclick="_submitAddContact()" style="flex:1;justify-content:center">Add Contact</button>',
    '</div>',
  ].join(''));
};

window._submitAddContact = async function() {
  var tagsRaw = (document.getElementById('mc-tags') || {}).value || '';
  var tags    = tagsRaw.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
  var data = {
    name:    (document.getElementById('mc-name')  || {}).value || '',
    company: (document.getElementById('mc-co')    || {}).value || '',
    email:   (document.getElementById('mc-email') || {}).value || '',
    phone:   (document.getElementById('mc-phone') || {}).value || '',
    tags:    tags,
  };
  var ok = await window.CRMService.addContact(data);
  if (ok) { window.closeModal(); window.renderApp(); }
};

/* ── ADD DEAL ─────────────────────────────────────────────── */
window._showAddDealModal = function(stageId) {
  var stages = window.D.pipeline.stages;
  window.modal('Add Deal', [
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px">',
    '  <div style="grid-column:1/-1"><label class="label-xs">Deal / Company Name</label>',
    '    <input id="md-name" class="inp" placeholder="Patel Hardware SEO" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Value (' + window.AC + ')</label>',
    '    <input id="md-value" class="inp" type="number" placeholder="0.00" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Stage</label>',
    '    <select id="md-stage" class="inp" style="font-size:13px">',
    stages.map(function(s) { return '<option value="' + s.id + '"' + (s.id === stageId ? ' selected' : '') + '>' + s.label + '</option>'; }).join(''),
    '    </select></div>',
    '  <div style="grid-column:1/-1"><label class="label-xs">Owner</label>',
    '    <input id="md-owner" class="inp" placeholder="' + window.D.user.name + '" value="' + window.D.user.name + '" style="font-size:13px"/></div>',
    '</div>',
    '<div style="display:flex;gap:8px;margin-top:14px">',
    '  <button class="btn-ghost" onclick="window.closeModal()" style="flex:1;justify-content:center">Cancel</button>',
    '  <button class="btn-primary" onclick="_submitAddDeal()" style="flex:1;justify-content:center">Add Deal</button>',
    '</div>',
  ].join(''));
};

window._submitAddDeal = function() {
  var stageId = (document.getElementById('md-stage') || {}).value || 'outreach';
  var data = {
    name:  (document.getElementById('md-name')  || {}).value || '',
    value: (document.getElementById('md-value') || {}).value || '0',
    owner: (document.getElementById('md-owner') || {}).value || '',
  };
  var ok = window.CRMService.addDeal(stageId, data);
  if (ok) { window.closeModal(); }
};

/* ── ADD PROJECT ─────────────────────────────────────────── */
window._showAddProjectModal = function() {
  window.modal('New Project', [
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px">',
    '  <div style="grid-column:1/-1"><label class="label-xs">Project Name</label>',
    '    <input id="mp-name" class="inp" placeholder="CoLAB OS v12" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Status</label>',
    '    <select id="mp-status" class="inp" style="font-size:13px">',
    '      <option value="planning">Planning</option>',
    '      <option value="active">Active</option>',
    '    </select></div>',
    '  <div><label class="label-xs">Due Date</label>',
    '    <input id="mp-due" class="inp" type="date" style="font-size:13px"/></div>',
    '</div>',
    '<div style="display:flex;gap:8px;margin-top:14px">',
    '  <button class="btn-ghost" onclick="window.closeModal()" style="flex:1;justify-content:center">Cancel</button>',
    '  <button class="btn-primary" onclick="_submitAddProject()" style="flex:1;justify-content:center">Create Project</button>',
    '</div>',
  ].join(''));
};

window._submitAddProject = async function() {
  var due = (document.getElementById('mp-due') || {}).value || '';
  var data = {
    name:     (document.getElementById('mp-name')   || {}).value || '',
    status:   (document.getElementById('mp-status') || {}).value || 'planning',
    progress: 0,
    due:      due ? new Date(due).toLocaleDateString('en-ZA', {day:'numeric',month:'short'}) : '',
  };
  var ok = await window.ProjectsService.addProject(data);
  if (ok) { window.closeModal(); }
};

/* ── ADD ORDER ───────────────────────────────────────────── */
window._showAddOrderModal = function() {
  window.modal('New Order', [
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px">',
    '  <div style="grid-column:1/-1"><label class="label-xs">Order / Job Name</label>',
    '    <input id="mo-name" class="inp" placeholder="SEO Setup — Patel Hardware" style="font-size:13px"/></div>',
    '  <div><label class="label-xs">Client</label>',
    '    <select id="mo-client" class="inp" style="font-size:13px">',
    '      <option value="">— Select —</option>',
    window.D.contacts.map(function(c) { return '<option>' + c.name + '</option>'; }).join(''),
    '    </select></div>',
    '  <div><label class="label-xs">Priority</label>',
    '    <select id="mo-priority" class="inp" style="font-size:13px">',
    '      <option value="hi">High</option>',
    '      <option value="me" selected>Medium</option>',
    '      <option value="lo">Low</option>',
    '    </select></div>',
    '  <div><label class="label-xs">Due Date</label>',
    '    <input id="mo-due" class="inp" type="date" style="font-size:13px"/></div>',
    '</div>',
    '<div style="display:flex;gap:8px;margin-top:14px">',
    '  <button class="btn-ghost" onclick="window.closeModal()" style="flex:1;justify-content:center">Cancel</button>',
    '  <button class="btn-primary" onclick="_submitAddOrder()" style="flex:1;justify-content:center">Create Order</button>',
    '</div>',
  ].join(''));
};

window._submitAddOrder = async function() {
  var due = (document.getElementById('mo-due') || {}).value || '';
  var data = {
    name:     (document.getElementById('mo-name')     || {}).value || '',
    client:   (document.getElementById('mo-client')   || {}).value || '',
    priority: (document.getElementById('mo-priority') || {}).value || 'me',
    due:      due ? new Date(due).toLocaleDateString('en-ZA', {day:'numeric',month:'short'}) : '',
    tasks:    [],
  };
  var ok = await window.ProjectsService.addOrder(data);
  if (ok) { window.closeModal(); }
};
