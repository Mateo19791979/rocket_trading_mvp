import React, { useEffect, useRef } from 'react';
import { ExternalLink, Code, Globe } from 'lucide-react';

const ChatWidget = ({ isPreview = false, onClose }) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const widgetHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Chat — Chefs d'IA</title>
<style>
  :root{
    --bg:#0f1320;--card:#151a2b;--txt:#eaf2ff;--muted:#a8b3cf;
    --ok:#00c8a0;--warn:#ffb84d;--err:#ff6b6b;--acc:#6366ff;--bd:#263059
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--txt);font:14px/1.5 system-ui,Segoe UI,Roboto,Ubuntu}
  .wrap{max-width:900px;margin:18px auto;padding:0 14px}
  .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  input,select,button{background:#0f1a32;border:1px solid var(--bd);color:var(--txt);border-radius:10px;padding:10px}
  button{cursor:pointer}
  .card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:14px}
  #log{height:360px;overflow:auto;background:#0f1320;border:1px solid var(--bd);border-radius:12px;padding:10px}
  .msg{margin:8px 0}
  .sys{color:var(--muted);font-size:12px}
  .user b{color:#cfe1ff}
  .bot{color:#9ee}
  .err{color:var(--err)}
  .pill{display:inline-block;padding:4px 8px;border-radius:999px;background:#0f1a32;border:1px solid var(--bd);color:var(--muted);font-size:12px;margin-right:6px}
  .hint{font-size:12px;color:var(--muted)}
</style>
</head>
<body>
<div class="wrap">
  <div class="card" style="margin-bottom:12px">
    <div class="row" style="justify-content:space-between">
      <div class="row">
        <select id="role" aria-label="Choisir le Chef IA">
          <option value="orchestrateur">Chef Orchestrateur</option>
          <option value="risque">Chef Risque</option>
          <option value="recherche">Chef Recherche</option>
          <option value="execution">Chef Exécution</option>
          <option value="data">Chef Données</option>
        </select>
        <input id="api" style="width:340px" placeholder="https://api.trading-mvp.com" />
        <button id="save">Enregistrer API</button>
        <button id="test">Tester</button>
      </div>
      <div class="hint">Lecture seule • Outils: /status /registry /scores /select /allocate</div>
    </div>
  </div>

  <div id="log" class="card" aria-live="polite"></div>

  <div class="card" style="margin-top:12px">
    <div class="row">
      <input id="msg" style="flex:1" placeholder="Pose ta question au Chef sélectionné…" />
      <button id="send">Envoyer</button>
    </div>
    <div style="margin-top:8px" class="hint" id="stamp">Prêt.</div>
  </div>

  <div style="margin-top:10px">
    <span class="pill">Fallback auto si /chat indisponible</span>
    <span class="pill">Timeout 8s</span>
    <span class="pill">Erreurs affichées proprement</span>
  </div>
</div>

<script>
(function(){
  // ---------- Utils ----------
  const $ = s => document.querySelector(s);
  const log = $("#log"), roleEl=$("#role"), apiEl=$("#api"), saveEl=$("#save"),
        testEl=$("#test"), sendEl=$("#send"), msgEl=$("#msg"), stamp=$("#stamp");
  const LS_KEY="trading_mvp_api_base";
  const TIMEOUT_MS = 8000;

  function scrollLog(){ log.scrollTop = log.scrollHeight; }
  function sys(txt){ add(\`<div class="msg sys">\${txt}</div>\`); }
  function user(txt){ add(\`<div class="msg user"><b>To \${roleEl.value}</b>: \${escapeHtml(txt)}</div>\`); }
  function bot(txt){ add(\`<div class="msg bot">\${txt}</div>\`); }
  function err(txt){ add(\`<div class="msg err">⚠️ \${txt}</div>\`); }
  function add(html){ const d=document.createElement("div"); d.innerHTML=html; log.append(d); scrollLog(); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }
  function ts(){ return new Date().toLocaleString(); }

  function setStamp(t, ok=true){ stamp.textContent = (ok? "✔️ ":"") + t + " • " + ts(); }

  function withTimeout(promise, ms=TIMEOUT_MS){
    return Promise.race([
      promise,
      new Promise((_,rej)=>setTimeout(()=>rej(new Error("Timeout "+ms+"ms")), ms))
    ]);
  }

  async function getJSON(base, path){
    const url = base.replace(/\\/+$/,'') + path;
    try{
      const res = await withTimeout(fetch(url, {mode:"cors"}));
      if(!res.ok) throw new Error("HTTP "+res.status);
      return await res.json();
    }catch(e){
      return { error:true, message:e.message, url };
    }
  }

  function saveAPI(){ localStorage.setItem(LS_KEY, apiEl.value.trim()); setStamp("API enregistrée"); }
  function loadAPI(){ const v=localStorage.getItem(LS_KEY); apiEl.value = v || "https://api.trading-mvp.com"; }

  // ---------- Local fallback "chefs" ----------
  function safeNum(x){ return (typeof x==='number' && isFinite(x)) ? x.toFixed(2) : x; }
  async function localChef(role, base, question){
    const [status, scores, select] = await Promise.all([
      getJSON(base,'/status'), getJSON(base,'/scores?window=252'), getJSON(base,'/select')
    ]);

    if(role==='orchestrateur'){
      const top = Array.isArray(scores?.scores) ? scores.scores[0] : null;
      const name = select?.selection?.[0]?.name || top?.name || "inconnu";
      return \`👉 <b>Choix actuel</b>: \${escapeHtml(name)}\${
        top? \`<br>score=\${safeNum(top.score)} • sharpe=\${safeNum(top.sharpe)} • mdd=\${safeNum(top.mdd)}\`:""
      }<br><span class="sys">Sources: /scores, /select</span>\`;
    }
    if(role==='risque'){
      const lat = status?.backend?.latency_ms ?? "n/a";
      return \`🛡️ <b>Risque</b>: surveiller VaR/CVaR (à brancher). Latence backend ~ \${escapeHtml(lat)}ms.
      Reco: si maxDD &gt; 15% → réduire 20% l'expo & hedger delta.\`;
    }
    if(role==='recherche'){
      return \`🔬 <b>Idées (3)</b>:
      1) RSI(21)+Volume spike (contrarian) • 2) Momentum MA(10/30) filtré vol • 3) Carry FX avec seuil macro PMI.
      Test: 252j WFA • Succès: Sharpe&gt;1, MDD&lt;15%.\`;
    }
    if(role==='execution'){
      return \`⚙️ <b>Exécution</b>: valider routes, estimer slippage (bps), viser latence &lt; 100ms.
      Action: /orders/simulate (mock) avant prod.\`;
    }
    // data
    return \`🧪 <b>Données</b>: rechercher trous de cotations, aligner timezones, recalculer features manquantes.\`;
  }

  // ---------- Backend /chat (si présent) ----------
  async function callBackendChat(base, role, message){
    const url = base.replace(/\\/+$/,'') + "/chat";
    const body = {
      role, message,
      tools_allowed:["/status","/registry","/scores","/select","/allocate"],
      mode:"read_only"
    };
    try{
      const res = await withTimeout(fetch(url,{
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body)
      }));
      if(!res.ok) throw new Error("HTTP "+res.status);
      const j = await res.json();
      if(j && typeof j.reply === "string"){
        return { reply: j.reply, used_tools:j.used_tools||[], citations:j.citations||[], next_actions:j.next_actions||[] };
      }
      // format inattendu
      return { reply: null, raw:j };
    }catch(e){
      return { error:true, message:e.message, url };
    }
  }

  // ---------- Event handlers ----------
  loadAPI();
  saveEl.onclick = saveAPI;

  testEl.onclick = async ()=>{
    setStamp("Test en cours…", false);
    const base = apiEl.value.trim();
    const res = await Promise.all([
      getJSON(base,"/status"),
      getJSON(base,"/scores?window=252"),
      getJSON(base,"/select")
    ]);
    const ok = res.every(r=>!r.error);
    sys(\`Test API: \${ok? "OK ✅" : "Problèmes ⚠️"} — status:\${res[0]?.error?"NOK":"OK"} scores:\${res[1]?.error?"NOK":"OK"} select:\${res[2]?.error?"NOK":"OK"}\`);
    setStamp(ok? "API joignable" : "API partiellement joignable", ok);
  };

  sendEl.onclick = async ()=>{
    const base = apiEl.value.trim();
    const r = roleEl.value;
    const q = msgEl.value.trim();
    if(!q){ sys("👉 Écris une question avant d'envoyer."); return; }
    user(q);
    setStamp("Réflexion…", false);

    // 1) essayer /chat si dispo
    const chat = await callBackendChat(base, r, q);
    if(!chat.error){
      if(chat.reply){
        bot(chat.reply);
        if(chat.used_tools?.length){ sys("Outils: "+chat.used_tools.join(", ")); }
      }else{
        // format inattendu
        bot("Réponse non standard (fallback local).");
        const fb = await localChef(r, base, q); bot(fb);
        if(chat.raw){ sys("Raw /chat: "+escapeHtml(JSON.stringify(chat.raw))); }
      }
      setStamp("Réponse du Chef");
      msgEl.value = "";
      return;
    }

    // 2) sinon fallback local
    sys("Pas de /chat (fallback local).");
    try{
      const fb = await localChef(r, base, q);
      bot(fb);
      setStamp("Réponse locale");
      msgEl.value = "";
    }catch(e){
      err("Échec du fallback local : "+e.message);
      setStamp("Erreur");
    }
  };

  // Enter pour envoyer
  msgEl.addEventListener("keydown", (e)=>{ if(e.key==="Enter"){ sendEl.click(); } });

  // Info initiale
  sys("Prêt. Choisis un Chef, vérifie l'API et pose ta question.");
})();
</script>
</body>
</html>`;

  useEffect(() => {
    if (!isPreview && iframeRef?.current) {
      const iframe = iframeRef?.current;
      iframe.srcdoc = widgetHtml;
    }
  }, [isPreview, widgetHtml]);

  const openInNewWindow = () => {
    const newWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    if (newWindow) {
      newWindow?.document?.write(widgetHtml);
      newWindow?.document?.close();
      newWindow.document.title = 'Chat — Chefs d\'IA';
    }
  };

  const downloadWidget = () => {
    const blob = new Blob([widgetHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chat-chefs-ia.html';
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isPreview) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Code className="w-5 h-5 mr-2 text-blue-400" />
          Widget HTML Chat
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-700">
            <p className="text-sm text-blue-200 mb-3">
              Interface de chat complète avec les 5 chefs d'IA (Orchestrateur, Risque, Recherche, Exécution, Données).
              Fallback automatique, gestion d'erreurs intégrée et UI responsive.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openInNewWindow}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ouvrir le widget</span>
              </button>
              
              <button
                onClick={downloadWidget}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-2 text-sm transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Télécharger HTML</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-green-900 bg-opacity-20 rounded border border-green-700">
              <div className="text-green-400 font-medium mb-1">✓ Fonctionnalités</div>
              <div className="text-green-200">5 Chefs IA, API configurable, Fallback auto</div>
            </div>
            <div className="p-3 bg-orange-900 bg-opacity-20 rounded border border-orange-700">
              <div className="text-orange-400 font-medium mb-1">⚡ Performance</div>
              <div className="text-orange-200">Timeout 8s, UI responsive, Logs détaillés</div>
            </div>
            <div className="p-3 bg-purple-900 bg-opacity-20 rounded border border-purple-700">
              <div className="text-purple-400 font-medium mb-1">🛡️ Sécurité</div>
              <div className="text-purple-200">Mode lecture seule, CORS configuré</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Code className="w-6 h-6 mr-2 text-blue-400" />
            Chat Widget — Chefs d'IA
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 p-4">
          <iframe
            ref={iframeRef}
            className="w-full h-full rounded-lg border border-gray-600"
            title="Chat Chefs IA Widget"
          />
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Widget HTML intégré • Prêt pour production
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadWidget}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-2 text-sm transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Télécharger HTML</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;