export default function RegionAgentCard({agent, stats}){
  const a = agent || {name:'Agent', status:'Active'};
  const s = stats || {pnl:0, avg:0, wr:0, last:'—'};
  
  return (
    <div style={{border:'1px solid #222',borderRadius:12,padding:12}}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <b>{a?.name}</b><span>{a?.status}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginTop:8}}>
        <div>PnL: {s?.pnl}</div>
        <div>Avg: {s?.avg}</div>
        <div>WR: {s?.wr}%</div>
      </div>
      <div style={{opacity:.7,marginTop:6}}>Dernier signal: {s?.last}</div>
    </div>
  );
}