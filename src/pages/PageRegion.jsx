import React, { useState } from 'react';
import AppErrorBoundary from '../components/AppErrorBoundary';
import useRegionWS from '../shared/useRegionWS';
import RegionAgentCard from '../components/RegionAgentCard';
import RegionActivity from '../components/RegionActivity';
import DailyReportCard from '../components/DailyReportCard';

export default function PageRegion({region}) {
  const [events,setEvents] = React.useState([]);
  const {down} = useRegionWS(region, {
    onEvent:(ev)=>setEvents(e=>[...e,ev]?.slice(-500))
  });
  
  const agents = Array.from({length:24})?.map((_,i)=>({
    name:`Agent #${i+1}`, 
    status: down?'Idle':'Active'
  }));
  
  return (
    <main style={{padding:16}}>
      <h1>Région {region}</h1>
      <AppErrorBoundary>
        <section style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {agents?.map((a,i)=>(
            <RegionAgentCard key={i} agent={a} stats={{pnl:0,avg:0,wr:0,last:'—'}}/>
          ))}
        </section>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12,marginTop:12}}>
          <RegionActivity items={events} onFallback={()=>{ /* optionnel: déclencher polling forcé */ }}/>
          <DailyReportCard/>
        </div>
      </AppErrorBoundary>
    </main>
  );
}