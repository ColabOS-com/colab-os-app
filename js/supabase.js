/* ═══════════════════════════════════════════════════════════
   COLAB-OS v11 — supabase.js
   Supabase client + auth + all database operations.
   Loaded before app.js. Exposes window.DB and window.AUTH.
═══════════════════════════════════════════════════════════ */

'use strict';

const SUPA_URL = 'https://spqnfqbykjihztidppyr.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcW5mcWJ5a2ppaHp0aWRwcHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NzgzMDksImV4cCI6MjA4OTU1NDMwOX0.AhAEo3fu8svbNDRrj0W6WP-n1keDaVOKKvKJFNy4xkM';

/* Init Supabase client */
const _supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);

/* ─────────────────────────────────────────────────────────
   AUTH — window.AUTH
───────────────────────────────────────────────────────── */
window.AUTH = {

  user: null,

  /* Get current session */
  getSession: async function() {
    var result = await _supa.auth.getSession();
    window.AUTH.user = result.data.session ? result.data.session.user : null;
    return result.data.session;
  },

  /* Sign out */
  signOut: async function() {
    await _supa.auth.signOut();
    window.AUTH.user = null;
    window.location.href = 'login.html';
  },

  /* Get user id */
  uid: function() {
    return window.AUTH.user ? window.AUTH.user.id : null;
  },
};

/* ─────────────────────────────────────────────────────────
   DATABASE — window.DB
   All CRUD operations for every table.
───────────────────────────────────────────────────────── */
window.DB = {

  /* ── PROFILE ─────────────────────────────────────────── */
  getProfile: async function() {
    var uid = window.AUTH.uid();
    if (!uid) { return null; }
    var result = await _supa.from('profiles').select('*').eq('id', uid).single();
    return result.data;
  },

  saveProfile: async function(data) {
    var uid = window.AUTH.uid();
    if (!uid) { return; }
    await _supa.from('profiles').upsert({ id: uid, ...data });
  },

  /* ── INVOICES ─────────────────────────────────────────── */
  getInvoices: async function() {
    var uid = window.AUTH.uid();
    if (!uid) { return []; }
    var result = await _supa.from('invoices').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    return result.data || [];
  },

  saveInvoice: async function(invoice) {
    var uid = window.AUTH.uid();
    if (!uid) { return; }
    var row = {
      user_id:  uid,
      client:   invoice.client,
      amount:   invoice.amt,
      due_date: invoice.due,
      status:   invoice.status,
      sent_date: invoice.sent || null,
    };
    if (invoice.dbId) {
      await _supa.from('invoices').update(row).eq('id', invoice.dbId);
    } else {
      await _supa.from('invoices').insert(row);
    }
  },

  updateInvoiceStatus: async function(dbId, status) {
    await _supa.from('invoices').update({ status: status }).eq('id', dbId);
  },

  /* ── EXPENSES ─────────────────────────────────────────── */
  getExpenses: async function() {
    var uid = window.AUTH.uid();
    if (!uid) { return []; }
    var result = await _supa.from('expenses').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    return result.data || [];
  },

  saveExpense: async function(expense) {
    var uid = window.AUTH.uid();
    if (!uid) { return; }
    await _supa.from('expenses').insert({
      user_id:     uid,
      category:    expense.cat,
      description: expense.desc,
      amount:      expense.amt,
      date:        expense.date,
      recurring:   expense.recurring || false,
    });
  },

  /* ── CONTACTS ─────────────────────────────────────────── */
  getContacts: async function() {
    var uid = window.AUTH.uid();
    if (!uid) { return []; }
    var result = await _supa.from('contacts').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    return result.data || [];
  },

  saveContact: async function(contact) {
    var uid = window.AUTH.uid();
    if (!uid) { return; }
    var row = {
      user_id:      uid,
      name:         contact.name,
      company:      contact.company || '',
      tags:         contact.tags || [],
      value:        contact.value || 0,
      last_contact: new Date().toISOString().substring(0, 10),
    };
    if (contact.dbId) {
      await _supa.from('contacts').update(row).eq('id', contact.dbId);
    } else {
      await _supa.from('contacts').insert(row);
    }
  },

  /* ── PROJECTS ─────────────────────────────────────────── */
  getProjects: async function() {
    var uid = window.AUTH.uid();
    if (!uid) { return []; }
    var result = await _supa.from('projects').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    return result.data || [];
  },

  saveProject: async function(project) {
    var uid = window.AUTH.uid();
    if (!uid) { return; }
    var row = {
      user_id:  uid,
      name:     project.name,
      status:   project.status || 'planning',
      progress: project.progress || 0,
      due_date: project.due || null,
    };
    if (project.dbId) {
      await _supa.from('projects').update(row).eq('id', project.dbId);
    } else {
      await _supa.from('projects').insert(row);
    }
  },

  updateProjectProgress: async function(dbId, progress, status) {
    await _supa.from('projects').update({ progress: progress, status: status }).eq('id', dbId);
  },

  /* ── ORDERS ──────────────────────────────────────────── */
  getOrders: async function() {
    var uid = window.AUTH.uid();
    if (!uid) { return []; }
    var result = await _supa.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    return result.data || [];
  },

  saveOrder: async function(order) {
    var uid = window.AUTH.uid();
    if (!uid) { return; }
    var row = {
      user_id:  uid,
      name:     order.name,
      client:   order.client || '',
      due_date: order.due || null,
      priority: order.priority || 'me',
      status:   order.status || 'pending',
      tasks:    order.tasks || [],
    };
    if (order.dbId) {
      await _supa.from('orders').update(row).eq('id', order.dbId);
    } else {
      await _supa.from('orders').insert(row);
    }
  },

  updateOrderTasks: async function(dbId, tasks, status) {
    await _supa.from('orders').update({ tasks: tasks, status: status }).eq('id', dbId);
  },

  /* ── LEDGER ──────────────────────────────────────────── */
  getLedger: async function() {
    var uid = window.AUTH.uid();
    if (!uid) { return []; }
    var result = await _supa.from('ledger').select('*').eq('user_id', uid).order('date', { ascending: false });
    return result.data || [];
  },

  saveLedgerEntry: async function(txn) {
    var uid = window.AUTH.uid();
    if (!uid) { return; }
    await _supa.from('ledger').insert({
      user_id:     uid,
      type:        txn.type,
      category:    txn.cat || 'General',
      description: txn.desc,
      delta:       txn.delta,
      date:        txn.date || new Date().toISOString().substring(0, 10),
    });
  },

  /* ── ACTIVITY ────────────────────────────────────────── */
  logActivity: async function(action, meta) {
    var uid = window.AUTH.uid();
    if (!uid) { return; }
    await _supa.from('activity').insert({
      user_id: uid,
      action:  action,
      meta:    meta || {},
    });
  },

  getActivity: async function(limit) {
    var uid = window.AUTH.uid();
    if (!uid) { return []; }
    var result = await _supa
      .from('activity')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(limit || 50);
    return result.data || [];
  },

  /* ── LOAD ALL — called on app boot ──────────────────── */
  loadAll: async function() {
    var results = await Promise.all([
      window.DB.getProfile(),
      window.DB.getInvoices(),
      window.DB.getExpenses(),
      window.DB.getContacts(),
      window.DB.getProjects(),
      window.DB.getOrders(),
      window.DB.getLedger(),
      window.DB.getActivity(50),
    ]);

    var profile   = results[0];
    var invoices  = results[1];
    var expenses  = results[2];
    var contacts  = results[3];
    var projects  = results[4];
    var orders    = results[5];
    var ledger    = results[6];
    var activity  = results[7];

    /* Write into window.D — app reads from here */
    if (profile) {
      window.D.user.name    = profile.name    || window.D.user.name;
      window.D.user.tier    = profile.tier    || 'basic';
      window.D.user.role    = profile.role    || 'owner';
      if (profile.biz_name) { window.CONFIG.BUSINESS.name = profile.biz_name; }
    }

    /* Map Supabase rows back to D format */
    if (invoices.length) {
      window.D.invoices = invoices.map(function(r) {
        return {
          id:     r.id.substring(0, 8).toUpperCase(),
          dbId:   r.id,
          client: r.client,
          amt:    r.amount,
          due:    r.due_date || '',
          status: r.status,
          sent:   r.sent_date || '',
        };
      });
    }

    if (expenses.length) {
      window.D.expenses = expenses.map(function(r) {
        return {
          id:        r.id.substring(0, 8).toUpperCase(),
          dbId:      r.id,
          cat:       r.category,
          desc:      r.description,
          amt:       r.amount,
          date:      r.date || '',
          recurring: r.recurring,
        };
      });
    }

    if (contacts.length) {
      window.D.contacts = contacts.map(function(r) {
        return {
          id:          r.id.substring(0, 8).toUpperCase(),
          dbId:        r.id,
          name:        r.name,
          company:     r.company || '',
          tags:        r.tags || [],
          value:       r.value || 0,
          lastContact: r.last_contact || '',
        };
      });
    }

    if (projects.length) {
      window.D.projects = projects.map(function(r) {
        return {
          id:       r.id.substring(0, 8).toUpperCase(),
          dbId:     r.id,
          name:     r.name,
          status:   r.status,
          progress: r.progress || 0,
          due:      r.due_date || '',
        };
      });
    }

    if (orders.length) {
      window.D.orders = orders.map(function(r) {
        return {
          id:       r.id.substring(0, 8).toUpperCase(),
          dbId:     r.id,
          name:     r.name,
          client:   r.client || '',
          due:      r.due_date || '',
          priority: r.priority,
          status:   r.status,
          tasks:    r.tasks || [],
        };
      });
    }

    if (ledger.length) {
      window.LEDGER.txns = ledger.map(function(r) {
        return {
          dbId:  r.id,
          date:  r.date,
          type:  r.type,
          cat:   r.category,
          desc:  r.description,
          delta: r.delta,
        };
      });
    }

    if (activity.length) {
      window.D.activity = activity.map(function(r) {
        return {
          action: r.action,
          meta:   r.meta || {},
          time:   new Date(r.created_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
          ts:     new Date(r.created_at).getTime(),
        };
      });
    }

    console.log('[CoLAB OS] Data loaded from Supabase');
  },
};
