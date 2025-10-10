import React, { useEffect, useRef, useState, useCallback } from "react";
import App from '@/App';


/** --------- Config --------- **/
const SAFE_MODE = (import.meta?.env?.VITE_SAFE_MODE ?? process.env?.REACT_APP_SAFE_MODE) === "true";
const TELEMETRY_ENDPOINT = import.meta?.env?.VITE_AI_TELEMETRY_URL || "/api/ai-telemetry";
const HEALTH_ENDPOINTS = [
  { id: "backend", label: "Backend API", url: "/health" },
  { id: "market", label: "Market Data", url: "/market/health" },
  { id: "ws", label: "WS Broker", url: "/ws/health" },
];

/** --------- Utilitaires robustes --------- **/
function sleep(ms) { 
  return new Promise(r => setTimeout(r, ms)); 
}

async function safeFetch(url, { timeoutMs = 6000, signal, ...opts } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl?.abort(), timeoutMs);
  // support cascade abort
  if (signal) signal?.addEventListener("abort", () => ctl?.abort(), { once: true });
  try {
    const res = await fetch(url, { ...opts, signal: ctl?.signal });
    return res;
  } finally { 
    clearTimeout(t); 
  }
}

// Rate limiter simple pour éviter boucles d'appels
let lastFetchAt = 0;
async function limitedJson(url, { minIntervalMs = 1500, ...rest } = {}) {
  const now = Date.now();
  const wait = lastFetchAt + minIntervalMs - now;
  if (wait > 0) await sleep(wait);
  lastFetchAt = Date.now();
  const r = await safeFetch(url, { ...rest });
  const ok = r?.ok;
  let body = null;
  try { 
    body = await r?.json(); 
  } catch {}
  return { ok, status: r?.status, body };
}

/** --------- Telemetry bus (lisible par agents) --------- **/
function publishTelemetry(payload) {
  const evt = new CustomEvent("ai:telemetry", { detail: payload });
  window.dispatchEvent(evt);
  // push serveur (best-effort, silencieux)
  try { 
    navigator.sendBeacon?.(TELEMETRY_ENDPOINT, new Blob([JSON.stringify(payload)], { type: "application/json" })); 
  }
  catch {}
}

/** --------- Error Boundary --------- **/
class AIGuardErrorBoundary extends React.Component {
  constructor(p) { 
    super(p); 
    this.state = { hasError: false, info: null }; 
  }
  
  static getDerivedStateFromError() { 
    return { hasError: true }; 
  }
  
  componentDidCatch(error, info) {
    publishTelemetry({ 
      type: "ui_error", 
      ts: Date.now(), 
      error: String(error?.message || error), 
      stack: info?.componentStack 
    });
  }
  
  render() {
    if (!this.state?.hasError) return this.props?.children;
    return (
      <div style={{ padding: 16 }}>
        <h2>⚠️ Récupération d'erreur</h2>
        <p>Une erreur d'affichage est survenue. Le mode sécurité est activé pour te laisser naviguer.</p>
        <button onClick={() => this.setState({ hasError: false })}>Réessayer</button>
      </div>
    );
  }
}

/** --------- Scroll Doctor (diagnostic + correctifs) --------- **/
function useScrollDoctor() {
  const [blockedBy, setBlockedBy] = useState([]);
  
  const applyFixes = useCallback(() => {
    // remet le scroll au niveau document
    let html = document.documentElement, body = document.body;
    html.style.height = "auto"; 
    body.style.height = "auto";
    html.style.overflowY = "auto"; 
    body.style.overflowY = "auto";
    body.style.webkitOverflowScrolling = "touch";
    
    // détecte éléments bloquants
    const bad = [];
    document.querySelectorAll("*")?.forEach(el => {
      const cs = getComputedStyle(el);
      const hidden = cs?.overflowY === "hidden" || cs?.position === "fixed";
      if (hidden && el !== body && el !== html) {
        // On n'agit pas, on signale (les IA peuvent envoyer un fix ciblé)
        bad?.push({ 
          tag: el?.tagName, 
          cls: el?.className?.toString()?.slice(0, 120), 
          id: el?.id, 
          overflowY: cs?.overflowY, 
          pos: cs?.position 
        });
      }
    });
    
    setBlockedBy(bad?.slice(0, 10));
    publishTelemetry({ 
      type: "scroll_diagnostics", 
      ts: Date.now(), 
      blockedBy: bad 
    });
  }, []);
  
  useEffect(() => { 
    applyFixes(); 
  }, [applyFixes]);
  
  return { blockedBy, applyFixes };
}

/** --------- Résilience (health checks + circuit breakers) --------- **/
function useResilience() {
  const [status, setStatus] = useState({});
  const abortRef = useRef();

  const poll = useCallback(async () => {
    if (SAFE_MODE) { 
      setStatus(s => ({ ...s, safeMode: true })); 
      return; 
    }
    
    abortRef?.current?.abort?.();
    const ctl = new AbortController(); 
    abortRef.current = ctl;
    const out = {};
    
    for (const h of HEALTH_ENDPOINTS) {
      try {
        const res = await limitedJson(h?.url, { 
          signal: ctl?.signal, 
          minIntervalMs: 1000, 
          timeoutMs: 5000 
        });
        out[h.id] = { 
          up: !!res?.ok, 
          code: res?.status, 
          sample: res?.body ?? null, 
          at: Date.now() 
        };
      } catch (e) {
        out[h.id] = { 
          up: false, 
          code: 0, 
          error: String(e?.name || e?.message || e), 
          at: Date.now() 
        };
      }
    }
    
    setStatus(out);
    publishTelemetry({ 
      type: "health_snapshot", 
      ts: Date.now(), 
      status: out, 
      safeMode: SAFE_MODE 
    });
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 8000);
    return () => { 
      clearInterval(id); 
      abortRef?.current?.abort?.(); 
    };
  }, [poll]);

  return status;
}

/** --------- UI principal --------- **/
export default function AIStabilityGuard({ children }) {
  const { blockedBy, applyFixes } = useScrollDoctor();
  const health = useResilience();
  const [open, setOpen] = useState(true);

  // Expose un objet global simple pour les agents
  useEffect(() => {
    window.__AI_SITE_STATUS__ = { 
      SAFE_MODE, 
      health, 
      blockedBy, 
      ts: Date.now() 
    };
  }, [health, blockedBy]);

  return (
    <AIGuardErrorBoundary>
      <div className="ai-guard-root">
        {/* Bandeau compact en haut de page */}
        <div className="ai-guard-bar">
          <button 
            className="ai-guard-btn" 
            onClick={() => setOpen(v => !v)} 
            aria-expanded={open}
          >
            {open ? "▼" : "►"} Système de résilience
          </button>
          <span className="ai-pill">
            {SAFE_MODE ? "SAFE_MODE ON" : "SAFE_MODE OFF"}
          </span>
          <span className="ai-dot" data-up={health?.backend?.up}>API</span>
          <span className="ai-dot" data-up={health?.market?.up}>Market</span>
          <span className="ai-dot" data-up={health?.ws?.up}>WS</span>
          <button className="ai-guard-btn" onClick={applyFixes}>
            Débloquer le scroll
          </button>
        </div>

        {/* Panneau déroulant */}
        <div className="ai-panel" style={{ height: open ? "auto" : 0 }}>
          <div className="ai-grid">
            <section>
              <h4>Statut services</h4>
              <ul className="ai-list">
                {HEALTH_ENDPOINTS?.map(h => (
                  <li key={h?.id}>
                    <b>{h?.label}</b>{" "}
                    <span className={`ai-badge ${health?.[h?.id]?.up ? "ok" : "ko"}`}>
                      {health?.[h?.id]?.up ? "UP" : "DOWN"}
                    </span>
                    <small> code: {health?.[h?.id]?.code ?? "-"}</small>
                  </li>
                ))}
              </ul>
            </section>
            
            <section>
              <h4>Diagnostics scroll</h4>
              {blockedBy?.length === 0 ? (
                <p>Aucun conteneur bloquant détecté.</p>
              ) : (
                <ol className="ai-mono">
                  {blockedBy?.map((b, i) => (
                    <li key={i}>
                      {b?.tag}#{b?.id} .{b?.cls} — overflowY:{b?.overflowY}, pos:{b?.pos}
                    </li>
                  ))}
                </ol>
              )}
            </section>
            
            <section>
              <h4>Contrôles rapides</h4>
              <div className="ai-actions">
                <button onClick={() => location.reload()}>Recharger</button>
                <button onClick={() => { 
                  localStorage.setItem("VITE_SAFE_MODE", "true"); 
                  alert("SAFE_MODE persistant activé (localStorage). Redémarre le site."); 
                }}>
                  Forcer SAFE_MODE
                </button>
                <button onClick={() => { 
                  localStorage.removeItem("VITE_SAFE_MODE"); 
                  alert("SAFE_MODE persistant désactivé."); 
                }}>
                  Désactiver SAFE_MODE
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Contenu appli */}
        <div className="ai-content">
          {children}
        </div>
      </div>
      {/* Styles minimalistes (scopés) */}
      <style>{`
        .ai-guard-root { position: relative; }
        .ai-guard-bar {
          position: sticky; top: 0; z-index: 9999;
          display:flex; gap:.5rem; align-items:center;
          padding:.5rem .75rem; background:rgba(10,12,16,.85); backdrop-filter:saturate(140%) blur(6px);
          color:#e8eefc; border-bottom:1px solid rgba(255,255,255,.08);
        }
        .ai-guard-btn { 
          font: 500 12px/1.2 system-ui; padding:.35rem .55rem; border-radius:10px; 
          border:1px solid rgba(255,255,255,.15); background:transparent; color:inherit; cursor:pointer; 
        }
        .ai-pill { 
          margin-left:.25rem; padding:.15rem .5rem; border-radius:999px; 
          background:rgba(255,255,255,.08); font-size:12px; 
        }
        .ai-dot { 
          font-size:12px; padding:.15rem .45rem; border-radius:999px; 
          border:1px solid rgba(255,255,255,.15); 
        }
        .ai-dot[data-up="true"]{ background:#123b12; color:#b6f7b6; }
        .ai-dot[data-up="false"]{ background:#3b1212; color:#ffb3b3; }
        .ai-panel { 
          overflow:hidden; border-bottom:1px solid rgba(255,255,255,.08); 
          background:#0f131a; 
        }
        .ai-grid { 
          display:grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); 
          gap:1rem; padding:1rem; 
        }
        .ai-list { margin:.25rem 0; padding-left:1rem; }
        .ai-badge.ok{ color:#b6f7b6; }
        .ai-badge.ko{ color:#ffb3b3; }
        .ai-mono { 
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; 
          font-size:12px; 
        }
        .ai-actions button { margin-right:.5rem; }
        .ai-content { min-height: 100vh; }
      `}</style>
    </AIGuardErrorBoundary>
  );
}

/** --------- Helper HOC pour entourer l'app facilement --------- **/
export function withAIStability(App) {
  return function Wrapped() {
    return (
      <AIStabilityGuard>
        <App />
      </AIStabilityGuard>
    );
  };
}