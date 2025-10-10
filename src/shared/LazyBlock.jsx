import React, { useRef, useState, useEffect } from 'react';

export default function LazyBlock({children, rootMargin='200px', minDelay=0, once=true}){
  const ref = React.useRef(null);
  const [ready,setReady]=React.useState(false);
  
  React.useEffect(()=>{
    let t;
    const io = new IntersectionObserver(([e])=>{
      if(e?.isIntersecting){
        t = setTimeout(()=>setReady(true), minDelay);
        if(once) io?.disconnect();
      }
    }, {rootMargin});
    
    if(ref?.current) io?.observe(ref?.current);
    
    return ()=>{ 
      io?.disconnect(); 
      t && clearTimeout(t); 
    };
  }, [rootMargin, minDelay, once]);
  
  return <div ref={ref}>{ready ? children : null}</div>;
}