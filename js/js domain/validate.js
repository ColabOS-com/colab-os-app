/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — domain/validate.js
   Input validation layer. All writes go through here first.
   Returns { ok: true } or { ok: false, errors: [...] }
═══════════════════════════════════════════════════════════ */

'use strict';

window.Validate = {

  /* ── CORE HELPER ───────────────────────────────────────── */
  _check: function(rules) {
    var errors = [];
    rules.forEach(function(r) {
      if (!r.test) { errors.push(r.msg); }
    });
    return errors.length ? { ok: false, errors: errors } : { ok: true };
  },

  /* ── INVOICE ────────────────────────────────────────────── */
  invoice: function(data) {
    return this._check([
      { test: data.client && data.client.trim().length > 0,
        msg:  'Client name is required' },
      { test: !isNaN(parseFloat(data.amt)) && parseFloat(data.amt) > 0,
        msg:  'Amount must be a positive number' },
      { test: !data.due || /^\d{4}-\d{2}-\d{2}$/.test(data.due),
        msg:  'Due date must be in YYYY-MM-DD format' },
      { test: ['draft','sent','paid','overdue','reminded'].includes(data.status),
        msg:  'Invalid invoice status' },
    ]);
  },

  /* ── EXPENSE ────────────────────────────────────────────── */
  expense: function(data) {
    return this._check([
      { test: data.desc && data.desc.trim().length > 0,
        msg:  'Description is required' },
      { test: !isNaN(parseFloat(data.amt)) && parseFloat(data.amt) > 0,
        msg:  'Amount must be a positive number' },
      { test: data.cat && data.cat.trim().length > 0,
        msg:  'Category is required' },
    ]);
  },

  /* ── CONTACT ────────────────────────────────────────────── */
  contact: function(data) {
    return this._check([
      { test: data.name && data.name.trim().length > 0,
        msg:  'Contact name is required' },
      { test: !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email),
        msg:  'Email address is not valid' },
    ]);
  },

  /* ── PROJECT ────────────────────────────────────────────── */
  project: function(data) {
    return this._check([
      { test: data.name && data.name.trim().length > 0,
        msg:  'Project name is required' },
      { test: !isNaN(parseInt(data.progress)) &&
              parseInt(data.progress) >= 0 &&
              parseInt(data.progress) <= 100,
        msg:  'Progress must be between 0 and 100' },
      { test: ['active','planning','complete','paused'].includes(data.status),
        msg:  'Invalid project status' },
    ]);
  },

  /* ── ORDER ──────────────────────────────────────────────── */
  order: function(data) {
    return this._check([
      { test: data.name && data.name.trim().length > 0,
        msg:  'Order name is required' },
      { test: ['hi','me','lo'].includes(data.priority),
        msg:  'Priority must be hi, me, or lo' },
    ]);
  },

  /* ── LEDGER TRANSACTION ─────────────────────────────────── */
  transaction: function(data) {
    return this._check([
      { test: ['revenue','expense'].includes(data.type),
        msg:  'Type must be revenue or expense' },
      { test: data.desc && data.desc.trim().length > 0,
        msg:  'Description is required' },
      { test: !isNaN(parseFloat(data.delta)) && data.delta !== 0,
        msg:  'Amount must be a non-zero number' },
    ]);
  },

  /* ── UI HELPER — show validation errors in a form ───────── */
  showErrors: function(errors) {
    if (!errors || !errors.length) { return; }
    window.toast(errors[0], 'error');
    if (errors.length > 1) {
      setTimeout(function() { window.toast(errors[1], 'error'); }, 600);
    }
  },
};
