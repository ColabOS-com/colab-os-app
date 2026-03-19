/* ═══════════════════════════════════════════════════════════
   COLAB OS — Plugin SDK
   Version: 1.0.0
   License: MIT (this file only — separate from AGPL core)

   This is the public contract between CoLAB OS Core and
   any plugin (first-party Pro or third-party community).

   A plugin is a plain JS object registered via:
     window.CoLAB.registerPlugin(pluginDefinition)

   Plugins run in the same JS context as the app.
   They cannot access colabos-pro internals — only the
   public API exposed on window.CoLAB.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   PUBLIC API — window.CoLAB
   This object is the ONLY interface plugins should use.
   Everything on window.CoLAB is considered stable.
   Direct access to window.D or window.LEDGER from plugins
   is discouraged and may break between versions.
───────────────────────────────────────────────────────── */
window.CoLAB = {

  version: '11.0.0',

  /* ── NAVIGATION ──────────────────────────────────────── */
  navigate: function(pageId) {
    if (typeof window.navigateTo === 'function') {
      window.navigateTo(pageId);
    }
  },

  /* ── UI HELPERS ──────────────────────────────────────── */
  toast:  function(msg, type)   { window.toast(msg, type); },
  modal:  function(title, html) { window.modal(title, html); },
  closeModal: function()        { window.closeModal(); },

  /* ── DATA (READ) ─────────────────────────────────────── */
  getUser:     function() { return Object.assign({}, window.D.user); },
  getInvoices: function() { return window.D.invoices.slice(); },
  getContacts: function() { return window.D.contacts.slice(); },
  getProjects: function() { return window.D.projects.slice(); },
  getLedger:   function() { return window.LEDGER.txns.slice(); },
  getBalance:  function() { return window.LEDGER.balance; },
  getRevenue:  function() { return window.LEDGER.revenue; },

  /* ── DATA (WRITE) — validated mutations only ─────────── */
  addTransaction: function(txn) {
    if (!txn || !txn.type || !txn.desc || typeof txn.delta !== 'number') {
      window.toast('CoLAB Plugin: invalid transaction', 'error');
      return false;
    }
    txn.date = txn.date || new Date().toISOString().substring(0, 10);
    txn.cat  = txn.cat  || 'Plugin';
    window.LEDGER.txns.unshift(txn);
    window.logActivity('Transaction added by plugin', { desc: txn.desc });
    return true;
  },

  addContact: function(contact) {
    if (!contact || !contact.name) {
      window.toast('CoLAB Plugin: contact requires a name', 'error');
      return false;
    }
    contact.id = 'PLG-' + Date.now();
    contact.tags = contact.tags || [];
    contact.value = contact.value || 0;
    contact.lastContact = 'just now';
    window.D.contacts.push(contact);
    window.logActivity('Contact added by plugin', { name: contact.name });
    return true;
  },

  /* ── ACTIVITY ─────────────────────────────────────────── */
  log: function(action, meta) {
    window.logActivity(action, meta || {});
  },

  /* ── FEATURE GATES ───────────────────────────────────── */
  isProUnlocked: function() {
    return window.CoLAB._gates.pro === true;
  },
  isCoreOnly: function() {
    return !window.CoLAB._gates.pro;
  },

  /* ── PLUGIN REGISTRY ─────────────────────────────────── */
  _plugins: {},
  _gates:   { pro: false },

  /* ── NAV EXTENSIONS ──────────────────────────────────── */
  _navExtensions: [],

  /* ── RENDER HOOKS ────────────────────────────────────── */
  _hooks: {
    beforeRender: [],
    afterRender:  [],
  },

  onBeforeRender: function(fn) {
    if (typeof fn === 'function') { window.CoLAB._hooks.beforeRender.push(fn); }
  },
  onAfterRender: function(fn) {
    if (typeof fn === 'function') { window.CoLAB._hooks.afterRender.push(fn); }
  },

  /* ── REGISTER ─────────────────────────────────────────── */
  registerPlugin: function(def) {
    if (!def || !def.id || !def.name) {
      console.warn('[CoLAB Plugin SDK] Plugin must have id and name.');
      return false;
    }
    if (window.CoLAB._plugins[def.id]) {
      console.warn('[CoLAB Plugin SDK] Plugin already registered: ' + def.id);
      return false;
    }

    /* Register nav pages if plugin provides them */
    if (def.pages && Array.isArray(def.pages)) {
      def.pages.forEach(function(page) {
        if (page.id && page.render && typeof page.render === 'function') {
          /* Register the render function on window for the router */
          window['_plugin_page_' + page.id] = page.render;
          /* Extend nav if category provided */
          if (page.navCat) {
            window.CoLAB._navExtensions.push({
              catId:  page.navCat,
              pageId: page.id,
              label:  page.label  || def.name,
              icon:   page.icon   || '🧩',
              min:    page.minTier || 'basic',
            });
          }
        }
      });
    }

    /* Register commands if plugin provides them */
    if (def.commands && Array.isArray(def.commands)) {
      def.commands.forEach(function(cmd) {
        if (cmd.label && typeof cmd.action === 'function') {
          if (typeof window._pluginCommands === 'undefined') {
            window._pluginCommands = [];
          }
          window._pluginCommands.push(cmd);
        }
      });
    }

    /* Call plugin init */
    if (typeof def.init === 'function') {
      try { def.init(window.CoLAB); }
      catch (e) { console.error('[CoLAB Plugin SDK] Init error in ' + def.id + ':', e); }
    }

    window.CoLAB._plugins[def.id] = def;
    console.log('[CoLAB Plugin SDK] Registered: ' + def.name + ' (' + def.id + ')');
    return true;
  },

  getPlugin: function(id) {
    return window.CoLAB._plugins[id] || null;
  },

  listPlugins: function() {
    return Object.values(window.CoLAB._plugins).map(function(p) {
      return { id: p.id, name: p.name, version: p.version || '1.0.0' };
    });
  },
};

/* ─────────────────────────────────────────────────────────
   PLUGIN DEFINITION TEMPLATE
   Copy this to create a new plugin.

   window.CoLAB.registerPlugin({
     id:      'my-plugin',
     name:    'My Plugin',
     version: '1.0.0',
     author:  'Your Name',

     pages: [
       {
         id:      'my-page',
         label:   'My Page',
         icon:    '🧩',
         navCat:  'apps',        // which sidebar category to add to
         minTier: 'basic',       // 'basic' | 'standard' | 'ecommerce'
         render:  function() {
           return '<div style="padding:14px"><h2>My Plugin Page</h2></div>';
         },
       }
     ],

     commands: [
       {
         label:  'My Plugin Action',
         icon:   '🧩',
         meta:   'Plugin',
         action: function() { window.CoLAB.toast('Plugin action fired!', 'success'); }
       }
     ],

     init: function(api) {
       // Called once when the plugin is registered.
       // api === window.CoLAB
       api.log('My Plugin initialised', {});
     }
   });
───────────────────────────────────────────────────────── */
