import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    'http_req_failed{endpoint:health}': ['rate<0.01'],
    'http_req_duration{endpoint:health}': ['p(95)<800'],
    'http_req_failed{endpoint:quotes}': ['rate<0.02'],
    'http_req_duration{endpoint:quotes}': ['p(95)<1000'],
  },
  scenarios: {
    health: { executor: 'constant-vus', vus: 10, duration: '1m' },
    quotes: { executor: 'ramping-arrival-rate',
      startRate: 50, timeUnit: '1s',
      stages: [{target:200,duration:'1m'},{target:600,duration:'2m'},{target:0,duration:'30s'}] }
  },
};

const BASE = process.env?.BASE_URL || '';

export default function () {
  // health ping
  const h = http?.get(`${BASE}/providers/health`, { tags: { endpoint: 'health' }});
  check(h, { 'health 200': r => r?.status === 200 && r?.json('ok') === true });

  // quotes routed
  const q = http?.get(`${BASE}/quotes?symbols=AAPL,MSFT,TSLA,NVDA,AMZN&src=auto`, { tags: { endpoint: 'quotes' }});
  check(q, { 'quotes 200': r => r?.status === 200 && r?.json('ok') === true });

  sleep(0.5);
}