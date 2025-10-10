import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Add this block - Declare Deno interface for type safety
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

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
      .from("shadow_portfolios")
      .select("id,user_id,portfolio_id,shadow_total_value,shadow_cash_balance,shadow_realized_pnl,shadow_unrealized_pnl,shadow_positions,last_updated")
      .order("last_updated",{ascending:false})
      .limit(200);
    if (error) throw new Error(error.message);
    return new Response(JSON.stringify({ok:true, data}),{headers:cors});
  } catch(e) { return new Response(JSON.stringify({ok:false, error:String(e?.message||e)}),{status:500,headers:cors}); }
});