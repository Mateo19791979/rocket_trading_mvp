import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    burst: { executor: 'ramping-arrival-rate',
      preAllocatedVUs: 50, maxVUs: 500,
      startRate: 100, timeUnit: '1s',
      stages: [{ target: 300, duration: '60s' }, { target: 1200, duration: '3m' }, { target: 0, duration: '30s' }] }
  },
  thresholds: {
    'http_req_failed': ['rate<0.02'],
    'http_req_duration': ['p(95)<700','p(99)<1200'],
  },
};

declare const __ENV: { [key: string]: string };

const BASE = __ENV?.BASE_URL;
const SYMS = 'AAPL,MSFT,TSLA,GOOGL,NVDA,META,AMZN';

export default function () {
  const r = http?.get(`${BASE}/quotes?symbols=${SYMS}&src=auto`);
  check(r, {
    '200': res => res?.status === 200,
    'payload ok': res => res?.json('ok') === true,
    'has provider': res => !!res?.json('provider_used'),
  });
}