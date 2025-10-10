import React, { useRef, useState, useEffect } from 'react';

export default function useRegionWS(region, {onEvent}={}){
  const ref = React.useRef({ws:null, queue:[], polling:false, tries:0});
  const [down,setDown] = React.useState(false);
  
  React.useEffect(()=>{
    let h;
    const state = ref?.current;
    
    const flush = ()=>{ 
      const q = state?.queue?.splice(0, Math.min(50, state?.queue?.length || 0)); 
      q?.forEach(ev => onEvent && onEvent(ev)); 
    };
    
    const poll = async()=>{ 
      try{ 
        const r = await fetch(`/dashboard/events?region=${region}&limit=50`, {cache:'no-store'}); 
        const arr = await r?.json(); 
        arr?.forEach(ev => state?.queue?.push(ev)); 
        flush(); 
      }catch{} 
    };
    
    const connect = ()=>{
      try{
        state.ws = new WebSocket((location?.protocol==='https:'?'wss':'ws')+'://'+location?.host+`/ws?region=${region}`);
        
        state?.ws && (state.ws.onopen = ()=>{ 
          setDown(false); 
          state.polling = false; 
          state.tries = 0; 
        });
        
        state?.ws && (state.ws.onmessage = (e)=>{ 
          try{ 
            const ev = JSON.parse(e?.data); 
            state?.queue?.push(ev); 
            if((state?.queue?.length || 0) > 500) state?.queue?.splice(0, (state?.queue?.length || 0) - 500); 
          }catch{} 
        });
        
        state?.ws && (state.ws.onerror = ()=>{ 
          setDown(true); 
        });
        
        state?.ws && (state.ws.onclose = ()=>{ 
          setDown(true); 
          if(!state?.polling){ 
            state.polling = true; 
            h = setInterval(poll, 5000); 
          } 
          if((state?.tries || 0) < 5){ 
            state.tries = (state?.tries || 0) + 1; 
            setTimeout(connect, Math.min(30000, 1000 * 2**(state?.tries || 0))); 
          } 
        });
      }catch{ 
        setDown(true); 
        if(!state?.polling){ 
          state.polling = true; 
          h = setInterval(poll, 5000); 
        } 
      }
    };
    
    connect();
    const tick = setInterval(flush, 250);
    
    return ()=>{ 
      clearInterval(tick); 
      h && clearInterval(h); 
      try{state?.ws && state?.ws?.close()}catch{} 
    };
  }, [region, onEvent]);
  
  return { down };
}