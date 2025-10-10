// Publie N messages/s sur data.market.{symbol}.1m
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const symbols = (process.env?.SYMS || 'AAPL,MSFT')?.split(',');
const rate = parseInt(process.env?.RATE || '200', 10); // messages/s total

function tick(symbol) {
  const msg = JSON.stringify({
    symbol, price: (100 + Math.random()*50)?.toFixed(2),
    ts: new Date()?.toISOString(), provider: 'perf-pub'
  });
  redis?.publish(`data.market.${symbol}.1m`, msg);
}

setInterval(() => {
  for (let i = 0; i < rate; i++) {
    const s = symbols?.[i % symbols?.length];
    tick(s);
  }
}, 1000);

console.log(`Publishing ~${rate} msg/s on ${symbols?.map(s=>`data.market.${s}.1m`)?.join(', ')}`);