import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Res from './ResilienceGuard';

export default function Shell(){
  const safe = (typeof window !== 'undefined') && localStorage.getItem('SAFE_MODE') === '1';
  const loc = useLocation();
  
  return (
    <div className="page-root">
      <div className="hud">
        <strong>Système</strong>
        <Res.Indicators/>
        <div style={{flex:1}}/>
        <div className="nav">
          <Link to="/">Accueil</Link>
          <Link to="/region/eu">Europe</Link>
          <Link to="/region/us">US</Link>
          <Link to="/region/as">Asie</Link>
          <Link to="/us-regional-trading-command-center">US Command</Link>
          <Link to="/asia-regional-trading-command-center">Asia Command</Link>
          <Link to="/resilience">Résilience</Link>
          <Link to="/logs">Logs</Link>
          <Link to="/settings">Paramètres</Link>
        </div>
        <button className="btn" onClick={()=>{
          const v = !(localStorage.getItem('SAFE_MODE')==='1');
          localStorage.setItem('SAFE_MODE', v?'1':'0');
          window.location.assign(loc?.pathname||'/');
        }}>{safe?'Désactiver SAFE_MODE':'Activer SAFE_MODE'}</button>
      </div>
      <div className="hud-spacer"/>
      <Outlet/>
    </div>
  );
}