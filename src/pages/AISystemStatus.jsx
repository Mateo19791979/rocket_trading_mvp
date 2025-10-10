import React from 'react';

export default function AISystemStatus() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Statut du Système IA</h1>
      
      <section style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12, marginBottom: 12, background: '#fff' }}>
        <h3>Résumé</h3>
        <div id="ai-summary">Chargement…</div>
      </section>
      
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))', gap: 12 }}>
        <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12, background: '#fff' }}>
          <h4>API</h4>
          <div id="ai-kpi-api">—</div>
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12, background: '#fff' }}>
          <h4>Market</h4>
          <div id="ai-kpi-market">—</div>
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12, background: '#fff' }}>
          <h4>WebSocket</h4>
          <div id="ai-kpi-ws">—</div>
        </div>
      </section>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          (function(){
            function set(id, val){ var el = document.getElementById(id); if(el) el.textContent = val; }
            function ok(b){ return b ? 'UP' : 'DOWN'; }
            Promise.all([
              fetch('/orchestra/status', {cache:'no-store'}).then(r=>r.json()).catch(()=>null),
              fetch('/health', {cache:'no-store'}).then(r=>r.ok).catch(()=>false),
              fetch('/market/health', {cache:'no-store'}).then(r=>r.ok).catch(()=>false),
              fetch('/ws/health', {cache:'no-store'}).then(r=>r.ok).catch(()=>false)
            ]).then(([status, api, mkt, ws])=>{
              set('ai-summary', status ? 'Agents actifs: ' + (status.active_agents ?? '—') + ' / ' + (status.agents?.length ?? '—') :
                'Statut orchestrateur indisponible');
              set('ai-kpi-api', ok(api));
              set('ai-kpi-market', ok(mkt));
              set('ai-kpi-ws', ok(ws));
            });
          })();
        `
      }} />
    </main>
  );
}