/* eslint-disable */

const buckets = new Map();

export function rateLimitLight(key='global', maxPerWindow=30, windowMs=10000){
  return (req,res,next)=>{
    const id = key + ':' + (req?.ip || 'ip');
    const now = Date.now();

    let b = buckets?.get(id);
    if (!b || (now - b?.ts) > windowMs) b = { ts: now, n: 0 };

    b.n += 1;
    buckets?.set(id, b);

    if (b?.n > maxPerWindow) return res?.status(429)?.json({ ok:false, error:'rate_limited' });

    next();
  };
}