/* IRU Chat – /chat skeleton JS (expanded)
   - Active sidebar highlighting
   - Mobile sidebar toggle + overlay
   - Theme toggle (light/dark)
   - Tabs + toast helpers
*/
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function pathLeaf(){
    const p = location.pathname.split('/').filter(Boolean).pop() || '';
    return p.toLowerCase();
  }

  function setActiveNav(){
    const leaf = pathLeaf() || 'index.html';
    const links = $$('.nav a');
    links.forEach(a => a.removeAttribute('aria-current'));

    let match = links.find(a => (a.getAttribute('href')||'').toLowerCase() === leaf);
    if(!match && (leaf === 'index.html' || leaf === '')) {
      match = links.find(a => (a.getAttribute('href')||'').toLowerCase() === 'status.html');
    }
    if(!match){
      match = links.find(a => (a.href||'').toLowerCase().endsWith('/' + leaf));
    }
    if(match) match.setAttribute('aria-current','page');
  }

  function initMobileNav(){
    const toggle = $('#navToggle');
    const overlay = $('#navOverlay');
    function close(){ document.body.classList.remove('nav-open'); }
    function open(){ document.body.classList.add('nav-open'); }

    if(toggle) toggle.addEventListener('click', () => {
      document.body.classList.contains('nav-open') ? close() : open();
    });
    if(overlay) overlay.addEventListener('click', close);

    // Close on nav click (mobile)
    $$('.nav a').forEach(a => a.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 860px)').matches) close();
    }));

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') close();
    });
  }

  function initTheme(){
    const btns = $$('[data-action="toggle-theme"]');
    const stored = localStorage.getItem('iru_theme');
    if(stored === 'light' || stored === 'dark'){
      document.documentElement.setAttribute('data-theme', stored);
    }else{
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    btns.forEach(btn => btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('iru_theme', next);
      toast('Theme updated', `Switched to ${next} mode.`);
    }));
  }

  function initTabs(){
    $$('[data-tabs]').forEach(group => {
      const tabs = $$('[role="tab"]', group);
      const panels = $$('[role="tabpanel"]', group);
      function activate(id){
        tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === id)));
        panels.forEach(p => p.hidden = p.dataset.panel !== id);
      }
      tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));
      if(tabs[0]) activate(tabs[0].dataset.tab);
    });
  }

  function toast(title, msg){
    const el = document.getElementById('toast');
    if(!el) return;
    el.querySelector('strong').textContent = title || 'Notice';
    el.querySelector('span').textContent = msg || '';
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 3200);
  }

  // Expose a tiny app namespace for demo actions
  window.IRUChat = { toast };

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initMobileNav();
    initTheme();
    initTabs();
  });
})();
