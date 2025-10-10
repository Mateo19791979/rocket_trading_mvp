import { WebSocket } from 'ws';

const WS_URL = process.env?.WS_URL || "wss://trading-mvp.com/ws";

console.log("==[WS CHECK]==", WS_URL);

const ws = new WebSocket(WS_URL, { handshakeTimeout: 5000 });

const timer = setTimeout(()=>{ console.error("❌ WS timeout"); process.exit(4); }, 7000);

ws?.on('open', ()=>{ clearTimeout(timer); console.log("✅ WS OK"); process.exit(0); });
ws?.on('error', (e)=>{ clearTimeout(timer); console.error("❌ WS error:", e?.message); process.exit(4); });