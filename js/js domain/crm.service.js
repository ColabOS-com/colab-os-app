/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — domain/crm.service.js
   All CRM operations — contacts, pipeline, campaigns.
═══════════════════════════════════════════════════════════ */

'use strict';

window.CRMService = {

  /* ── CONTACTS ─────────────────────────────────────────── */
  addContact: async function(data) {
    var result = window.Validate.contact(data);
    if (!result.ok) { window.Validate.showErrors(result.errors); return false; }

    var contact = {
      id:          'C' + String(window.D.contacts.length + 1).padStart(3, '0'),
      name:        data.name.trim(),
      company:     (data.company || '').trim(),
      tags:        data.tags || [],
      value:       parseFloat(data.value) || 0,
      lastContact: 'just now',
      email:       data.email || '',
      phone:       data.phone || '',
    };

    window.D.contacts.unshift(contact);

    if (window.DB) {
      try { await window.DB.saveContact(contact); }
      catch(e) { console.warn('[CRM] Contact save failed', e); }
    }

    window.logActivity('Contact added', { name: contact.name });
    window.toast('✓ ' + contact.name + ' added to contacts', 'success');
    return true;
  },

  updateContactValue: function(contactId, value) {
    var c = window.D.contacts.find(function(x) { return x.id === contactId; });
    if (!c) { return false; }
    c.value = parseFloat(value) || 0;
    return true;
  },

  addTag: function(contactId, tag) {
    var c = window.D.contacts.find(function(x) { return x.id === contactId; });
    if (!c || !tag) { return false; }
    if (!c.tags.includes(tag)) { c.tags.push(tag); }
    return true;
  },

  softDeleteContact: function(contactId) {
    var c = window.D.contacts.find(function(x) { return x.id === contactId; });
    if (!c) { return false; }
    c._deleted = true;
    window.logActivity('Contact removed', { id: contactId, name: c.name });
    window.toast('Contact removed', 'info');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    return true;
  },

  getActiveContacts: function() {
    return window.D.contacts.filter(function(c) { return !c._deleted; });
  },

  /* ── PIPELINE ─────────────────────────────────────────── */
  addDeal: function(stageId, data) {
    if (!data.name || !data.name.trim()) {
      window.toast('Deal name is required', 'error');
      return false;
    }
    var stage = window.D.pipeline.stages.find(function(s) { return s.id === stageId; });
    if (!stage) { window.toast('Stage not found', 'error'); return false; }

    stage.cards.push({
      name:  data.name.trim(),
      value: parseFloat(data.value) || 0,
      owner: data.owner || window.D.user.name,
      days:  0,
    });

    window.logActivity('Deal added to pipeline', { stage: stageId, name: data.name });
    window.toast('✓ Deal added to ' + stage.label, 'success');
    if (typeof window.renderApp === 'function') { window.renderApp(); }
    return true;
  },

  moveDeal: function(cardName, fromStageId, toStageId) {
    var from = window.D.pipeline.stages.find(function(s) { return s.id === fromStageId; });
    var to   = window.D.pipeline.stages.find(function(s) { return s.id === toStageId;   });
    if (!from || !to) { return false; }

    var idx  = from.cards.findIndex(function(c) { return c.name === cardName; });
    if (idx === -1) { return false; }

    var card = from.cards.splice(idx, 1)[0];
    to.cards.push(card);

    window.logActivity('Deal moved', { from: fromStageId, to: toStageId, deal: cardName });
    return true;
  },
};
