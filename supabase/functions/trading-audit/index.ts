// ... keep existing imports and cors configuration ...
// Add type declarations for Deno
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = {
  "Content-Type":"application/json; charset=utf-8",
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
};
Deno.serve(async (req)=>{
  if (req.method==="OPTIONS") return new Response("ok",{headers:cors});
  try {
    const s = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await s
      .from("trading_audit_logs")
      .select("created_at,action_type,severity_level,user_id,trading_mode,order_data,trade_data,blocked_reason")
      .order("created_at",{ascending:false})
      .limit(500);
    if (error) throw new Error(error.message);
    
    // Transform data to match frontend expectations
    const transformedData = data?.map(log => ({
      ts: log.created_at,
      actor_role: log.user_id ? 'authenticated' : 'system',
      action: log.action_type || 'UNKNOWN',
      symbol: log.order_data?.symbol || log.trade_data?.symbol || 'N/A',
      notes: log.blocked_reason || `${log.action_type} - ${log.severity_level}`,
      severity: log.severity_level || 'info'
    })) || [];
    
    return new Response(JSON.stringify({ok:true, data: transformedData}),{headers:cors});
  } catch(e) { return new Response(JSON.stringify({ok:false, error:String(e?.message||e)}),{status:500,headers:cors}); }
});