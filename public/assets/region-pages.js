(function(){
  if (window.__regionPagesInstalled) return; window.__regionPagesInstalled = true;
  
  // --- Utils ---
  const $ = sel => document.querySelector(sel);
  const on = (el,ev,fn) => el && el.addEventListener(ev,fn);
  const R = (html) => { const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; };
  
  // --- Container root (ne pas toucher l'app existante) ---
  let root = $('#region-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'region-root';
    root.className = 'rg-hidden';
    (document.body || document.documentElement).appendChild(root);
  }
  
  // --- Floating menu (n'empiète pas sur la navbar existante) ---
  const fab = R(`
    <div class="rg-fab">
      <span class="rg-breadcrumb">Régions :</span>
      <button data-goto="#/region/eu">Europe</button>
      <button data-goto="#/region/us">US</button>
      <button data-goto="#/region/as">Asie</button>
      <span class="rg-heartbeat" id="rg-heart">·</span>
    </div>
  `);
  document.body.appendChild(fab);
  fab.querySelectorAll('button').forEach(btn => on(btn, 'click', () => location.hash = btn.getAttribute('data-goto')));
  
  // --- Mini "datas" démo (placeholder : ton backend remplira ces champs quand prêt) ---
  function makeAgent(i){ return { name:`Agent #${i}`, status:'Active', pnl:0, avg:0, wr:0, last:'—' }; }
  function tplToolbar(region){
    return `
      <div class="rg-toolbar">
        <div>
          <div class="rg-title">Centre régional – ${region}</div>
          <div class="rg-sub">Même orchestration (24 rôles), contexte : <b>${region}</b></div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="rg-chip">WS: <b id="rg-ws-${region}">—</b></span>
          <span class="rg-chip">Market: <b id="rg-mkt-${region}">—</b></span>
          <span class="rg-chip">Heartbeat: <b id="rg-hb-${region}">—</b></span>
        </div>
      </div>
    `;
  }
  function tplCard(a){
    return `
      <div class="rg-card">
        <h4>${a.name} <span class="rg-dim">– ${a.status}</span></h4>
        <div class="rg-kpis">
          <div>PnL <b>${a.pnl}</b></div>
          <div>Avg <b>${a.avg}</b></div>
          <div>WR <b>${a.wr}%</b></div>
        </div>
        <div class="rg-dim" style="margin-top:6px">Dernier signal: ${a.last}</div>
      </div>
    `;
  }
  
  function renderRegion(region){
    const agents = Array.from({length:24}).map((_,i)=>makeAgent(i+1));
    const cards = agents.map(tplCard).join('');
    root.innerHTML = `
      ${tplToolbar(region)}
      <div class="rg-grid">${cards}</div>
    `;
    // ping minimal (placeholder) :
    try { fetch(`/health`, {cache:'no-store'}).then(r=>$('#rg-ws-'+region).textContent = r.ok?'UP':'DOWN'); } catch{}
    try { fetch(`/market/health`, {cache:'no-store'}).then(r=>$('#rg-mkt-'+region).textContent = r.ok?'UP':'DOWN'); } catch{}
    $('#rg-hb-'+region).textContent = new Date().toLocaleTimeString();
  }
  
  // --- Router hash ---
  function isRegionPath(hash){
    return /^#\/region\/(eu|us|as)$/i.test(hash||'');
  }
  function toRegion(hash){
    const m = (hash||'').match(/^#\/region\/(eu|us|as)$/i);
    if (!m) return null;
    const code = m[1].toUpperCase();
    return code === 'EU' ? 'Europe' : code === 'US' ? 'États-Unis' : 'Asie';
  }
  function syncRoute(){
    const h = location.hash;
    if (isRegionPath(h)) {
      root.classList.remove('rg-hidden');
      const region = toRegion(h);
      renderRegion(region);
      // petit heart-beat visuel
      const heart = document.getElementById('rg-heart'); if (heart){ heart.textContent = '●'; setTimeout(()=>heart.textContent='·', 600); }
      // masquer le contenu natif derrière si nécessaire : on ne touche pas, on superpose simplement
      window.scrollTo({top:0, behavior:'instant'});
    } else {
      root.classList.add('rg-hidden');
    }
  }
  window.addEventListener('hashchange', syncRoute);
  document.addEventListener('DOMContentLoaded', syncRoute);
  syncRoute();
  
})();