import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  vus: 200, 
  duration: '2m',
  thresholds: { 'ws_msgs': ['count>4000'] },
};

const WS = __ENV?.WS_URL; // e.g. wss://api.../ws/quotes
const msgs = new Counter('ws_msgs');

export default function () {
  const url = `${WS}?symbols=AAPL,MSFT&tf=1m`;
  const res = ws?.connect(url, {}, (socket) => {
    socket?.on('message', (data) => { msgs?.add(1); });
    socket?.on('error', (e) => { /* ignore */ });
    socket?.setTimeout(() => socket?.close(), 60000); // 1 min par VU
  });
  check(res, { 'ws status 101/200': r => r && (r?.status === 101 || r?.status === 200) });
  sleep(1);
}