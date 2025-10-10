export default function Resilience(){
  return (
    <main style={{padding:16}}>
      <h1>Résilience</h1>
      <p>Tests de santé API/Market/WS, redémarrage agents par région, reset des canaux.</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button className="btn" onClick={()=>fetch('/orchestra/restart',{method:'POST'})}>Restart Orchestra</button>
        <button className="btn" onClick={()=>fetch('/agent/restart/region/EU',{method:'POST'})}>Restart EU</button>
        <button className="btn" onClick={()=>fetch('/agent/restart/region/US',{method:'POST'})}>Restart US</button>
        <button className="btn" onClick={()=>fetch('/agent/restart/region/AS',{method:'POST'})}>Restart AS</button>
        <button className="btn" onClick={()=>fetch('/reset-live-channel?region=EU',{method:'POST'})}>Reset WS EU</button>
      </div>
    </main>
  );
}