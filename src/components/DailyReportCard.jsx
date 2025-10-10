export default function DailyReportCard({data}){
  const d = data || {iqs: '—', dhi:'—', cost:'—', winRate:'—'};
  
  return (
    <div style={{border:'1px solid #333',borderRadius:12,padding:12}}>
      <h3 style={{marginTop:0}}>Rapport Intelligence (Quotidien)</h3>
      <div>IQS: {d?.iqs} | DHI: {d?.dhi} | Coût: {d?.cost} | WinRate: {d?.winRate}</div>
    </div>
  );
}