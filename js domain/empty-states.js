/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — domain/empty-states.js
   Empty state UI for every section. Called by page modules
   when their data array is empty.
═══════════════════════════════════════════════════════════ */

'use strict';

window.EmptyState = {

  /* Master renderer */
  render: function(opts) {
    return [
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;min-height:280px">',
      '  <div style="font-size:48px;margin-bottom:16px;opacity:.5">' + (opts.icon || '📭') + '</div>',
      '  <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px;letter-spacing:-.3px">' + opts.title + '</div>',
      '  <div style="font-size:12px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:24px;max-width:340px;line-height:1.7">' + opts.desc + '</div>',
      opts.action
        ? '  <button class="btn-primary" style="font-size:13px;padding:10px 20px" onclick="' + opts.action + '">' + opts.actionLabel + '</button>'
        : '',
      opts.secondary
        ? '  <button class="btn-ghost" style="font-size:12px;margin-top:8px" onclick="' + opts.secondary + '">' + opts.secondaryLabel + '</button>'
        : '',
      '</div>',
    ].join('\n');
  },

  /* ── SECTION EMPTIES ──────────────────────────────────── */
  invoices: function() {
    return this.render({
      icon:          '📄',
      title:         'No invoices yet',
      desc:          'Create your first invoice to start tracking what you\'re owed.',
      action:        '_showAddInvoiceModal()',
      actionLabel:   '+ Create Invoice',
    });
  },

  expenses: function() {
    return this.render({
      icon:          '💳',
      title:         'No expenses logged',
      desc:          'Capture receipts and log expenses to track where your money goes.',
      action:        'window.importOpen(\'expenses\')',
      actionLabel:   '+ Capture Receipt',
      secondary:     '_showAddExpenseModal()',
      secondaryLabel:'Add Manually',
    });
  },

  contacts: function() {
    return this.render({
      icon:          '👥',
      title:         'No contacts yet',
      desc:          'Add your first client or lead to start building your CRM.',
      action:        '_showAddContactModal()',
      actionLabel:   '+ Add Contact',
      secondary:     'window.csvExport([],"contacts-template.csv")',
      secondaryLabel:'↓ Download CSV Template',
    });
  },

  pipeline: function() {
    return this.render({
      icon:          '📈',
      title:         'Pipeline is empty',
      desc:          'Add your first deal to start tracking your sales opportunities.',
      action:        '_showAddDealModal()',
      actionLabel:   '+ Add Deal',
    });
  },

  projects: function() {
    return this.render({
      icon:          '🗂️',
      title:         'No projects yet',
      desc:          'Create a project to track work, progress and deadlines.',
      action:        '_showAddProjectModal()',
      actionLabel:   '+ New Project',
    });
  },

  orders: function() {
    return this.render({
      icon:          '✅',
      title:         'No orders yet',
      desc:          'Create an order checklist to track job tasks step by step.',
      action:        '_showAddOrderModal()',
      actionLabel:   '+ New Order',
    });
  },

  ledger: function() {
    return this.render({
      icon:          '💰',
      title:         'No transactions yet',
      desc:          'Import a document or add a transaction to start your ledger.',
      action:        'window.importOpen(\'wallet\')',
      actionLabel:   '+ Import Document',
    });
  },

  activity: function() {
    return this.render({
      icon:          '⚡',
      title:         'No activity yet',
      desc:          'Activity appears here as you use CoLAB OS — invoices, automations, contacts and more.',
      action:        null,
      actionLabel:   '',
    });
  },

  automations: function() {
    return this.render({
      icon:          '🔁',
      title:         'No automations configured',
      desc:          'Connect n8n in Integrations to start building your automation stack.',
      action:        'window.navigateTo(\'integrations\')',
      actionLabel:   '⚡ Configure Integrations',
    });
  },

  webhooks: function() {
    return this.render({
      icon:          '🌐',
      title:         'No leads yet',
      desc:          'Leads appear here automatically when someone fills out your website intake form.',
      action:        'window.open(\'https://colabos.store\',\'_blank\')',
      actionLabel:   '↗ View Your Website',
    });
  },

  downloads: function() {
    return this.render({
      icon:          '📁',
      title:         'No files yet',
      desc:          'Upload templates, workflows, or documents to access them from anywhere.',
      action:        'window._dlUploadOpen()',
      actionLabel:   '+ Add File',
    });
  },

  marketplace: function() {
    return this.render({
      icon:          '🛒',
      title:         'No tools installed',
      desc:          'Browse the marketplace to find automation templates and tools for your business.',
      action:        'window.open(\'https://colabos.store/marketplace\',\'_blank\')',
      actionLabel:   '↗ Browse Marketplace',
    });
  },
};
