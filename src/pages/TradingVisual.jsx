import React from 'react';
import AppErrorBoundary from '../components/AppErrorBoundary';

function HeavyDashboard(){
  // Exemple minimal : remplace par tes widgets lourds (charts, orderbook, WS)
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr', gap:12}}>
      <div style={{height:320,border:'1px solid #333',borderRadius:12,padding:12}}>Graphique prix (WS)</div>
      <div style={{height:320,border:'1px solid #333',borderRadius:12,padding:12}}>Carnet de commandes / Transactions</div>
      <div style={{height:240,border:'1px solid #333',borderRadius:12,padding:12}}>Positions</div>
      <div style={{height:240,border:'1px solid #333',borderRadius:12,padding:12}}>PnL détaillé</div>
    </div>
  );
}

export default function TradingVisual(){
  return (
    <main style={{padding:16}}>
      <h1>Trading Visual</h1>
      <AppErrorBoundary>
        <HeavyDashboard/>
      </AppErrorBoundary>
    </main>
  );
}