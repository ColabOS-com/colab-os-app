/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — domain/finance.service.js
   All finance operations. Pages never touch D.invoices,
   D.expenses, or LEDGER.txns directly — they call this.
═══════════════════════════════════════════════════════════ */

'use strict';

window.FinanceService = {

  /* ── INVOICES ─────────────────────────────────────────── */
  addInvoice: async function(data) {
    var result = window.Validate.invoice(data);
    if (!result.ok) { window.Validate.showErrors(result.errors); return false; }

    var invoice = {
      id:     'INV-' + String(window.D.invoices.length + 1).padStart(4, '0'),
      client: data.client.trim(),
      amt:    parseFloat(data.amt),
      due:    data.due || '',
      status: data.status || 'draft',
      sent:   new Date().toLocaleDateString('en-ZA', { day:'2-digit', month:'short' }),
    };

    window.D.invoices.unshift(invoice);

    /* Persist to Supabase if available */
    if (window.DB) {
      try { await window.DB.saveInvoice(invoice); }
      catch(e) { console.warn('[Finance] Supabase save failed, kept in memory', e); }
    }

    window.logActivity('Invoice created', { id: invoice.id, client: invoice.client });
    window.toast('✓ Invoice ' + invoice.id + ' created', 'success');
    return true;
  },

  markPaid: async function(invoiceId) {
    var inv = window.D.invoices.find(function(i) { return i.id === invoiceId; });
    if (!inv) { window.toast('Invoice not found', 'error'); return false; }

    inv.status = 'paid';

    /* Also add to ledger */
    window.FinanceService.addTransaction({
      type:  'revenue',
      cat:   'Invoice',
      desc:  'Invoice paid — ' + inv.client,
      delta: inv.amt,
    });

    if (window.DB && inv.dbId) {
      try { await window.DB.updateInvoiceStatus(inv.dbId, 'paid'); }
      catch(e) { console.warn('[Finance] Status update failed', e); }
    }

    window.logActivity('Invoice marked paid', { id: invoiceId, client: inv.client });
    window.toast('✓ ' + invoiceId + ' marked as paid', 'success');
    return true;
  },

  softDeleteInvoice: function(invoiceId) {
    var inv = window.D.invoices.find(function(i) { return i.id === invoiceId; });
    if (!inv) { return false; }
    inv.status = 'deleted';
    inv._deleted = true;
    window.logActivity('Invoice deleted', { id: invoiceId });
    window.toast('Invoice removed', 'info');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    return true;
  },

  getActiveInvoices: function() {
    return window.D.invoices.filter(function(i) { return !i._deleted; });
  },

  /* ── EXPENSES ─────────────────────────────────────────── */
  addExpense: async function(data) {
    var result = window.Validate.expense(data);
    if (!result.ok) { window.Validate.showErrors(result.errors); return false; }

    var expense = {
      id:        'EXP-' + String(window.D.expenses.length + 1).padStart(3, '0'),
      cat:       data.cat.trim(),
      desc:      data.desc.trim(),
      amt:       parseFloat(data.amt),
      date:      data.date || new Date().toISOString().substring(0, 10),
      recurring: data.recurring || false,
    };

    window.D.expenses.unshift(expense);

    /* Also add to ledger */
    window.FinanceService.addTransaction({
      type:  'expense',
      cat:   expense.cat,
      desc:  expense.desc,
      delta: -Math.abs(expense.amt),
      date:  expense.date,
    });

    if (window.DB) {
      try { await window.DB.saveExpense(expense); }
      catch(e) { console.warn('[Finance] Expense save failed', e); }
    }

    window.logActivity('Expense added', { cat: expense.cat, amt: expense.amt });
    window.toast('✓ Expense logged', 'success');
    return true;
  },

  /* ── LEDGER ───────────────────────────────────────────── */
  addTransaction: async function(data) {
    var result = window.Validate.transaction(data);
    if (!result.ok) { console.warn('[Finance] Invalid txn:', result.errors); return false; }

    var txn = {
      date:  data.date || new Date().toISOString().substring(0, 10),
      type:  data.type,
      cat:   data.cat  || 'General',
      desc:  data.desc,
      delta: data.type === 'expense' ? -Math.abs(data.delta) : Math.abs(data.delta),
    };

    window.LEDGER.txns.unshift(txn);

    if (window.DB) {
      try { await window.DB.saveLedgerEntry(txn); }
      catch(e) { console.warn('[Finance] Ledger save failed', e); }
    }

    return true;
  },
};
