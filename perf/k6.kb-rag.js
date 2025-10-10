import http from 'k6/http';
import { check } from 'k6';

declare const __ENV: Record<string, string | undefined>;

export const options = {
  scenarios: {
    rag: { executor: 'ramping-arrival-rate',
      startRate: 20, timeUnit: '1s',
      stages: [{target:100,duration:'1m'},{target:400,duration:'3m'},{target:0,duration:'30s'}] }
  },
  thresholds: {
    'http_req_failed': ['rate<0.02'],
    'http_req_duration': ['p(95)<900'],
  },
};

const KB_RPC = __ENV?.KB_RPC_URL;  // ex: https://api.../rpc/kb_search
const EMB = __ENV?.EMB_URL;        // endpoint embeddings (POST {input:[text]})

const queries = [
  "walk-forward validation for financial ML",
  "triple-barrier method meta-labeling",
  "SRE SLO vs error budget dashboard",
  "clean architecture boundaries entities use-cases",
  "robust backtesting microstructure slippage"
];

function embed(q){
  const r = http?.post(EMB, JSON.stringify({ input:[q] }), { headers:{'content-type':'application/json'} });
  return r?.json('data[0].embedding');
}

export default function () {
  const q = queries?.[Math.floor(Math.random()*queries?.length)];
  const emb = embed(q);
  const body = JSON.stringify({ q_embedding: emb, domains_filter: ['QuantOracle','StrategyWeaver'], match_k: 8 });

  const r = http?.post(KB_RPC, body, { headers:{ 'content-type': 'application/json' }});
  check(r, {
    '200': x => x?.status === 200,
    'has results': x => (x?.json() || [])?.length >= 3
  });
}