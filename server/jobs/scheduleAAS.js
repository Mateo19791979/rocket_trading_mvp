import cron from "node-cron";
import fetch from "node-fetch";

const post = (path, body = {}) => fetch(`${process.env?.SELF_URL}${path}`, { 
  method: "POST", 
  headers: { 
    "x-internal-key": process.env?.INTERNAL_ADMIN_KEY, 
    "content-type": "application/json" 
  }, 
  body: JSON.stringify(body) 
});

export function scheduleAAS() {
  // Breeding job - daily at 3 AM
  cron?.schedule("0 3 * * *", () => 
    post("/aas/breed", { k: 25 })?.then(() => console.log("[AAS] Breeding job run."))
  );

  // Selection job - every 12 hours
  cron?.schedule("0 */12 * * *", () => 
    post("/aas/selection")?.then(() => console.log("[AAS] Selection job run."))
  );

  // Health sentinel toutes les heures (xx:10)
  cron?.schedule("10 * * * *", () => 
    post("/aas/health/compute")?.then(() => console.log("[AAS] Health sentinel computed"))
  );

  console.log("[AAS] Scheduled jobs initialized:");
  console.log("  - Breeding: Daily at 3:00 AM");
  console.log("  - Selection: Every 12 hours at xx:00");
  console.log("  - Health Sentinel: Hourly at xx:10");
}