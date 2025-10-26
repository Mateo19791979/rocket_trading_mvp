/* eslint-disable */
import { useEffect, useState } from 'react';

export function useSafeQuery<T>(fn: ()=>Promise<T>, deps:any[]=[]){
  const [state, setState] = useState<{loading:boolean; data?:T; error?:string}>({loading:true});

  useEffect(()=>{
    let cancel=false;
    (async()=>{
      try{
        const data = await fn();
        if (!cancel) setState({loading:false, data});
      }catch(e:any){
        if (!cancel) setState({loading:false, error:String(e?.message||e)});
      }
    })();
    return ()=>{ cancel=true; };
  }, deps);

  return state;
}