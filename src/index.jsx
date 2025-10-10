// --- PREBOOT GUARD (ne laisse jamais l'écran planter) ---
(function(){
  if (typeof window==='undefined' || window.__prebootInstalled) return;
  window.__prebootInstalled = true;
  
  function unlock(){
    const H=document.documentElement, B=document.body||document.createElement('body');
    [H,B]?.forEach(n=>{ n.style.overflow='auto'; n.style.height='auto'; n.style.position=''; });
  }
  
  function showGuard(msg, extra){
    if(document.getElementById('preboot-guard')) return;
    unlock();
    const el = document.createElement('div');
    el.id = 'preboot-guard';
    el.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0b0e12;color:#eaf4ff;display:grid;place-items:center;padding:24px;font-family:system-ui,Segoe UI,Roboto';
    const now = new Date()?.toISOString();
    const url = location.href;
    el.innerHTML = `
      <div style="max-width:860px">
        <h2 style="margin:0 0 12px;display:flex;align-items:center;gap:8px">
          <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#4aa3ff"></span>
          Mode sécurité – Front
        </h2>
        <p style="opacity:.9;margin:0 0 12px">Erreur interceptée : ${String(msg||'Unknown')}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">
          <button id="btn-safe" style="padding:8px 12px;border:1px solid #2e7d32;border-radius:10px;background:#0f1a12;color:#cfe;cursor:pointer">Activer SAFE_MODE</button>
          <button id="btn-reload" style="padding:8px 12px;border:1px solid #446; border-radius:10px;background:#0b0f16;color:#cfe;cursor:pointer">Recharger</button>
        </div>
        <div style="background:#0f141b;border:1px solid #223042;border-radius:12px;padding:12px">
          <div style="font-weight:600;margin-bottom:6px">Détails de l'erreur:</div>
          <div style="opacity:.9;white-space:pre-wrap">${String(msg||'Unknown')}</div>
          <div style="opacity:.7;margin-top:6px">Timestamp: ${now}</div>
          <div style="opacity:.7">URL: ${url}</div>
          ${extra ? `<div style="opacity:.7;margin-top:6px">${extra}</div>` : ''}
        </div>
      </div>`;
    (document.body || document.documentElement)?.appendChild(el);
    document.getElementById('btn-safe').onclick = ()=>{ localStorage.setItem('SAFE_MODE','1'); location.reload(); };
    document.getElementById('btn-reload').onclick = ()=> location.reload();
  }
  
  window.__showFrontGuard = showGuard;
  window.addEventListener('error', e=> showGuard(e?.error?.message||e?.message||'Error'));
  window.addEventListener('unhandledrejection', e=> showGuard(e?.reason?.message||e?.reason||'Promise rejection'));
  unlock();
})();

// --- MONTAGE REACT À TOUTE ÉPREUVE ---
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './Routes';
import './styles/globals.css';

// 1) Trouver (ou créer) un élément racine fiable
function ensureMountNode() {
  // Essais standards
  let node = document.getElementById('root')
          || document.getElementById('app')
          || document.querySelector('[data-react-root]')
          || document.querySelector('#__next'); // au cas où
  
  // Si rien : on crée #root proprement
  if (!node) {
    node = document.createElement('div');
    node.id = 'root';
    // fallback: insérer au tout début du body
    (document.body || document.documentElement)?.appendChild(node);
  }
  
  // Si l'élément existe mais est "empty root" (ex: seulement des espaces/commentaires) ou SSR sale
  // → on nettoie pour éviter "React application failed to mount - Empty root element detected"
  const onlyWhitespaceOrComment = !node?.hasChildNodes() || Array.from(node?.childNodes)?.every(n =>
    (n?.nodeType === 8) || // commentaire
    (n?.nodeType === 3 && !/\S/?.test(n?.nodeValue||'')) // texte vide
  );
  if (!onlyWhitespaceOrComment) {
    // Si c'est du SSR incompatible, on repart sur un mount propre
    node.innerHTML = '';
  }
  
  // Sécurité style
  node.style.minHeight = '100vh';
  node.style.position = 'relative';
  return node;
}

// 2) Attendre le DOM si nécessaire
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

// 3) Monter React avec journalisation et message clair si ça échoue
onReady(() => {
  try {
    const mountNode = ensureMountNode();
    if (!mountNode) {
      window.__showFrontGuard?.('Root introuvable après initialisation');
      return;
    }
    // trace diagnostique utile
    window.__frontDiag = { mountedAt: new Date()?.toISOString(), mountId: mountNode?.id, url: location.href };
    
    const root = createRoot(mountNode);
    root.render(<AppRouter />);
  } catch (e) {
    const msg = (e && (e?.message || e?.toString())) || 'React mount error';
    window.__showFrontGuard?.('React application failed to mount – '+ msg, 'Correction appliquée : création automatique de #root et nettoyage SSR');
  }
});