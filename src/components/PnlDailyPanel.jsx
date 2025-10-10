import { useEffect, useMemo, useState } from 'react';

const API = import.meta.env?.VITE_API_BASE_URL;
const KEY = import.meta.env?.VITE_INTERNAL_ADMIN_KEY;

async function getLast30() {
  const url = `${API}/rest/v1/v_pnl_last30?select=*`;
  const r = await fetch(url, { 
    headers: { 
      apikey: KEY, 
      Authorization: `Bearer ${KEY}` 
    }
  });
  if(!r?.ok) return [];
  return r?.json();
}

async function getAlerts() {
  const url = `${API}/rest/v1/pnl_alerts?select=*&order=created_at.desc&limit=20`;
  const r = await fetch(url, { 
    headers: { 
      apikey: KEY, 
      Authorization: `Bearer ${KEY}` 
    }
  });
  if(!r?.ok) return [];
  return r?.json();
}

async function ingestManual(row){
  const r = await fetch(`${API}/ops/pnl/ingest`, {
    method:'POST',
    headers:{ 
      'content-type':'application/json',
      'x-internal-key':KEY 
    },
    body: JSON.stringify(row)
  });
  return r?.json();
}

export default function PnlDailyPanel() {
  const [rows, setRows] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ 
    total_pnl:'', 
    win_rate:'', 
    trades:'', 
    agents_active:'', 
    max_drawdown:'', 
    notes:'' 
  });

  useEffect(() => {
    (async ()=>{
      setRows(await getLast30());
      setAlerts(await getAlerts());
    })();
  }, []);

  const kpis = useMemo(() => {
    if (rows?.length === 0) return { last:{}, cum:0, ma7:0, ma7wr:0 };
    const last = rows?.[0];
    const cum  = last?.cum_pnl || 0;
    const ma7  = Math.round((last?.ma7_pnl ?? 0)*100)/100;
    const ma7wr= Math.round((last?.ma7_wr ?? 0)*10)/10;
    return { last, cum, ma7, ma7wr };
  }, [rows]);

  const milestones = useMemo(() => {
    const targets = [50000,100000,500000,750000,1000000];
    const cur = kpis?.cum || 0;
    return targets?.map(t => ({
      target: t,
      remaining: Math.max(0, t - cur)
    }));
  }, [kpis]);

  async function submitManual(e){
    e?.preventDefault();
    const payload = {
      total_pnl: Number(form?.total_pnl||0),
      win_rate: Number(form?.win_rate||0),
      trades: Number(form?.trades||0),
      agents_active: Number(form?.agents_active||0),
      max_drawdown: Number(form?.max_drawdown||0),
      notes: form?.notes||null
    };
    
    const out = await ingestManual(payload);
    if(out?.ok){
      setForm({ total_pnl:'', win_rate:'', trades:'', agents_active:'', max_drawdown:'', notes:'' });
      setRows(await getLast30());
      setAlerts(await getAlerts());
    } else {
      alert('Erreur: ' + (out?.error || 'ingestion'));
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl border grid gap-6">
      <h2 className="text-2xl font-bold">PNL Daily Tracker</h2>
      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card title="PnL du jour" value={`${(kpis?.last?.total_pnl ?? 0)?.toLocaleString()} €`} />
        <Card title="PnL cumulé" value={`${(kpis?.cum ?? 0)?.toLocaleString()} €`} />
        <Card title="Win Rate (jour)" value={`${kpis?.last?.win_rate ?? 0}%`} />
        <Card title="DD max (jour)" value={`${kpis?.last?.max_drawdown ?? 0}%`} />
        <Card title="MA7 PnL" value={`${kpis?.ma7?.toLocaleString()} €`} />
        <Card title="MA7 Win Rate" value={`${kpis?.ma7wr}%`} />
        <Card title="Trades (jour)" value={kpis?.last?.trades ?? 0} />
        <Card title="Agents actifs" value={kpis?.last?.agents_active ?? 0} />
      </div>
      {/* Timeline simple */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">PnL</th>
              <th className="py-2 pr-4">Cumulé</th>
              <th className="py-2 pr-4">Win Rate</th>
              <th className="py-2 pr-4">Trades</th>
              <th className="py-2 pr-4">Agents</th>
              <th className="py-2 pr-4">DD max</th>
              <th className="py-2 pr-4">MA7 PnL</th>
              <th className="py-2 pr-4">MA7 WR</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map(r=>(
              <tr key={r?.d} className="border-t">
                <td className="py-2 pr-4">{r?.d}</td>
                <td className="py-2 pr-4">{Number(r?.total_pnl)?.toLocaleString()} €</td>
                <td className="py-2 pr-4">{Number(r?.cum_pnl)?.toLocaleString()} €</td>
                <td className="py-2 pr-4">{Number(r?.win_rate)?.toFixed(1)}%</td>
                <td className="py-2 pr-4">{r?.trades}</td>
                <td className="py-2 pr-4">{r?.agents_active}</td>
                <td className="py-2 pr-4">{Number(r?.max_drawdown)?.toFixed(2)}%</td>
                <td className="py-2 pr-4">{Number(r?.ma7_pnl ?? 0)?.toLocaleString()} €</td>
                <td className="py-2 pr-4">{Number(r?.ma7_wr ?? 0)?.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Jalons */}
      <div>
        <h3 className="font-semibold mb-2">Jalons de capital (basés sur le PnL cumulé)</h3>
        <ul className="text-sm grid md:grid-cols-3 gap-2">
          {milestones?.map(m=>(
            <li key={m?.target} className="p-2 rounded bg-gray-50 border">
              Objectif <b>{m?.target?.toLocaleString()} €</b> → reste <b>{m?.remaining?.toLocaleString()} €</b>
            </li>
          ))}
        </ul>
      </div>
      {/* Alerts */}
      <div>
        <h3 className="font-semibold mb-2">Alertes récentes</h3>
        {alerts?.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune alerte.</p>
        ) : (
          <ul className="text-sm grid gap-2">
            {alerts?.map(a=>(
              <li key={a?.id} className={`p-2 rounded border ${a?.level==='crit'?'bg-red-50 border-red-300':a?.level==='warn'?'bg-yellow-50 border-yellow-300':'bg-blue-50 border-blue-300'}`}>
                <b>[{a?.level}] {a?.code}</b> — {a?.message}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Ingestion manuelle (optionnel) */}
      <div>
        <h3 className="font-semibold mb-2">Enregistrer manuellement le jour courant</h3>
        <form onSubmit={submitManual} className="grid md:grid-cols-6 gap-3">
          <Input label="PnL (jour)" value={form?.total_pnl} onChange={v=>setForm(s=>({...s,total_pnl:v}))}/>
          <Input label="Win rate (%)" value={form?.win_rate} onChange={v=>setForm(s=>({...s,win_rate:v}))}/>
          <Input label="Trades" value={form?.trades} onChange={v=>setForm(s=>({...s,trades:v}))}/>
          <Input label="Agents actifs" value={form?.agents_active} onChange={v=>setForm(s=>({...s,agents_active:v}))}/>
          <Input label="DD max (%)" value={form?.max_drawdown} onChange={v=>setForm(s=>({...s,max_drawdown:v}))}/>
          <Input label="Notes" value={form?.notes} onChange={v=>setForm(s=>({...s,notes:v}))}/>
          <div className="md:col-span-6">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-4 rounded-xl border bg-gray-50">
      <div className="text-xs uppercase text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function Input({label,value,onChange}) {
  return (
    <label className="text-sm grid">
      <span className="text-gray-600 mb-1">{label}</span>
      <input className="border rounded px-2 py-1" value={value} onChange={e=>onChange(e?.target?.value)} />
    </label>
  );
}