import 'dotenv/config';
import fetch from 'node-fetch';

const SELF = process.env?.SELF_URL || 'http://localhost:3000';
const KEY  = process.env?.INTERNAL_ADMIN_KEY;

function msUntil(h, m) {
  const now = new Date();
  const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, 0, 0));
  let diff = t?.getTime() - now?.getTime();
  if (diff < 0) diff += 24*60*60*1000;
  return diff;
}

async function runSnapshot() {
  try {
    const response = await fetch(`${SELF}/ops/pnl/snapshot-today`, {
      method: 'POST',
      headers: { 
        'content-type': 'application/json', 
        'x-internal-key': KEY 
      },
      body: JSON.stringify({})
    });
    
    const result = await response?.json();
    console.log('[PNL-Worker] snapshot-today done:', result);
  } catch (e) {
    console.error('[PNL-Worker] error:', e);
  }
}

(async function loop(){
  console.log('[PNL-Worker] started. Will run ~23:59 UTC daily.');
  
  // premier délai
  await new Promise(r => setTimeout(r, msUntil(23, 59)));
  
  while(true) {
    await runSnapshot();
    await new Promise(r => setTimeout(r, 24*60*60*1000)); // toutes les 24h
  }
})();