import React from 'react';

export default function RegionActivity({items, onFallback}){
  const list = items?.slice(-20)||[];
  
  return (
    <div style={{border:'1px solid #333',borderRadius:12,padding:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{margin:0}}>Activité temps réel</h3>
        <button onClick={onFallback} className="btn">Forcer polling</button>
      </div>
      {list?.length? 
        <ul style={{marginTop:8}}>
          {list?.map((e,i)=><li key={i} style={{opacity:.9}}>{String(e)}</li>)}
        </ul> : 
        <div style={{opacity:.7,marginTop:8}}>Aucune activité (WS OFF?)</div>
      }
    </div>
  );
}