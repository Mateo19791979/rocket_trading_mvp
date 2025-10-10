const fetch = require("node-fetch");

async function preflightOrDie() {
  const base = process.env?.API_INTERNAL_URL || "http://api:3000";
  
  console.log("🔍 Running preflight RLS health check...");
  
  try {
    const health = await fetch(`${base}/security/rls/health`)?.then(r => r?.json())?.catch(() => null);
    
    if (!health?.success) {
      throw new Error("RLS health endpoint failed");
    }
    
    const issues = (health?.data?.tables || [])?.filter(t => t?.status !== "OK");
    
    if (issues?.length > 0) {
      console.error("❌ RLS issues found:", issues?.map(x => `${x?.table}:${x?.status}`)?.join(", "));
      
      if (process.env?.AUTO_REPAIR_ON_BOOT === "1") {
        console.warn("🔧 Attempting auto-repair...");
        
        const repairResult = await fetch(`${base}/security/rls/repair`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-internal-key": process.env?.INTERNAL_ADMIN_KEY || "" 
          }
        })?.then(r => r?.json())?.catch(() => null);
        
        if (repairResult?.success) {
          console.log("✅ Auto-repair completed:", repairResult?.data);
          return preflightOrDie(); // Re-check after repair
        } else {
          console.error("❌ Auto-repair failed:", repairResult?.error);
        }
      }
      
      throw new Error("RLS policies not OK — aborting boot");
    }
    
    console.log("✅ RLS health check passed - all policies OK");
    
  } catch (error) {
    console.error("💥 Preflight RLS check failed:", error?.message);
    throw error;
  }
}

module.exports = { preflightOrDie };