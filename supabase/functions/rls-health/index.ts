import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Add Deno type declarations
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
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
    const { data, error } = await s.rpc("rls_health");
    if (error) throw new Error(error.message);
    return new Response(JSON.stringify({ok:true, data}),{headers:cors});
  } catch(e) { return new Response(JSON.stringify({ok:false, error:String(e?.message||e)}),{status:500,headers:cors}); }
});