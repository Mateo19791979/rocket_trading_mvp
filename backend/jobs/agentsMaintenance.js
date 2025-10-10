// ====================================================================== 
// (C) CRON DE MAINTENANCE — mark timeout/stale automatically
// ======================================================================

import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

export function scheduleAgentsMaintenance() {
  // Every 5 minutes: timeouts (> 15 min) + stale queued (> 24h)
  cron?.schedule('*/5 * * * *', async () => {
    try {
      const { data, error } = await supabase?.rpc('mark_stale_and_timeouts', {
        p_timeout_sec: 900,        // 15 min
        p_queued_stale_sec: 86400  // 24h
      });
      
      if (error) throw error;
      
      console.log('[AgentsMaintenance] timeouts/stale =>', data);
    } catch (e) {
      console.error('[AgentsMaintenance] error', e);
    }
  });
  
  console.log('✅ Agent maintenance CRON scheduled (every 5 minutes)');
}