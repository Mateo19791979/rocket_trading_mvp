export function softmax(scores, temperature = 1.0) {
  const t = Math.max(0.05, Number(temperature) || 1.0);
  const exps = scores?.map(v => Math.exp(v / t));
  const sum = exps?.reduce((a,b)=>a+b,0) || 1;
  return exps?.map(v => v/sum);
}

export function clamp(val, min, max){ 
  return Math.min(max, Math.max(min, val)); 
}

export function ema(prev, next, decay=0.05){
  const d = clamp(decay, 0.0, 1.0);
  return prev*(1-d) + next*d;
}

export function renormalizeToSum(buckets, targetSum=1.0){
  const sum = Object.values(buckets)?.reduce((a,b)=>a+b,0) || 1;
  const k = (targetSum<=0?0:targetSum)/sum;
  const out = {};
  for(const kRegion of Object.keys(buckets)) out[kRegion] = buckets?.[kRegion] * k;
  return out;
}