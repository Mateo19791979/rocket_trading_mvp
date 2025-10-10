/* Enhanced backend with daily intelligence reporting API */
import express from "express";
import cors from "cors";
import { createClient } from '@supabase/supabase-js';
import { pnlTracker } from './routes/pnlTracker.js';

const app = express();

// Middleware
app?.use(cors());
app?.use(express?.json());

// Supabase client setup
const supabaseUrl = process.env?.SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env?.SUPABASE_SERVICE_KEY || 'your-supabase-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Format helper function
function fmt(x) {
  return x == null ? '—' : x;
}

// Health check endpoint
app?.get("/health", (_req, res) => {
  res?.json({ 
    ok: true, 
    service: "backend-api", 
    ts: new Date()?.toISOString() 
  });
});

// Daily Intelligence Report endpoints
app?.get("/api/daily-report", async (req, res) => {
  try {
    const { date } = req?.query;
    
    let query = supabase?.from('ai_daily_reports')?.select('*')?.order('day', { ascending: false });

    if (date) {
      query = query?.eq('day', date);
    }

    const { data, error } = await query?.limit(1)?.single();

    if (error) {
      if (error?.code === 'PGRST116') {
        // No report found - generate one
        const { error: generateError } = await supabase?.rpc('generate_daily_intelligence_report');
        
        if (generateError) {
          throw generateError;
        }
        
        // Fetch the newly generated report
        const { data: newData, error: fetchError } = await supabase?.from('ai_daily_reports')?.select('*')?.eq('day', date || new Date()?.toISOString()?.split('T')?.[0])?.single();
          
        if (fetchError) {
          throw fetchError;
        }
        
        return res?.json({ ok: true, data: newData });
      }
      throw error;
    }

    res?.json({ ok: true, data });
  } catch (error) {
    res?.status(500)?.json({
      ok: false,
      error: error?.message || 'Failed to fetch daily intelligence report'
    });
  }
});

// Generate new daily report
app?.post("/api/daily-report/generate", async (req, res) => {
  try {
    // Call the stored function to generate today's report
    const { error: functionError } = await supabase?.rpc('generate_daily_intelligence_report');

    if (functionError) {
      throw functionError;
    }

    // Fetch the newly generated report
    const today = new Date()?.toISOString()?.split('T')?.[0];
    const { data, error } = await supabase?.from('ai_daily_reports')?.select('*')?.eq('day', today)?.single();

    if (error) {
      throw error;
    }

    res?.json({ ok: true, data });
  } catch (error) {
    res?.status(500)?.json({
      ok: false,
      error: error?.message || 'Failed to generate daily intelligence report'
    });
  }
});

// Get report history
app?.get("/api/daily-report/history", async (req, res) => {
  try {
    const { limit = 30 } = req?.query;
    
    const { data, error } = await supabase?.from('ai_daily_reports')?.select('day, report, created_at')?.order('day', { ascending: false })?.limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res?.json({ ok: true, data });
  } catch (error) {
    res?.status(500)?.json({
      ok: false,
      error: error?.message || 'Failed to fetch report history'
    });
  }
});

// Get current live metrics
app?.get("/api/daily-report/live-metrics", async (req, res) => {
  try {
    const { data, error } = await supabase?.from('daily_ai_report')?.select('*')?.single();

    if (error) {
      throw error;
    }

    res?.json({ ok: true, data });
  } catch (error) {
    res?.status(500)?.json({
      ok: false,
      error: error?.message || 'Failed to fetch live metrics'
    });
  }
});

// Cron-like endpoint for scheduled report generation (can be called by external schedulers)
app?.post("/api/daily-report/cron", async (req, res) => {
  try {
    const { data: rows, error } = await supabase?.from('daily_ai_report')?.select('*');
    
    if (error) {
      throw error;
    }

    const r = rows?.[0] || {};
    
    // Generate markdown report
    const md = `
# 🚀 AAS Daily Intelligence Report (${r?.day})

| Metric | Value |
|:--|:--|
| 💰 Coût (€) | ${fmt(r?.cost_eur)} |
| 📞 Appels API | ${fmt(r?.calls)} |
| 🧠 IQS moyen | ${fmt(r?.avg_iqs)} |
| 📊 DHI moyen | ${fmt(r?.avg_dhi)} |
| 🤖 Agents actifs | ${fmt(r?.agents_active)} |
| ✅ Tâches réussies | ${fmt(r?.tasks_done)} |
| ❌ Tâches en échec | ${fmt(r?.tasks_failed)} |
| ⚠️ Agents en échec | ${(r?.agents_failed || [])?.join(', ') || 'aucun'} |

## Synthèse
- **Performance** : ${r?.avg_iqs > 0.8 ? 'excellente' : 'à surveiller'}
- **Qualité data** : ${r?.avg_dhi > 0.85 ? 'stable' : 'fragile'}
- **Coût** : ${r?.cost_eur > 5 ? 'élevé' : 'normal'}

## Actions recommandées
${r?.avg_dhi < 0.8 ? '→ Vérifier les sources avec DHI < 0.7\n' : ''}${r?.tasks_failed > 10 ? '→ Analyser les agents ayant échoué\n' : ''}${r?.cost_eur > 5 ? '→ Passer en mode cheap pendant les heures creuses\n' : ''}
    `?.trim();

    // Save the report
    await supabase?.from('ai_daily_reports')?.upsert({ 
      day: r?.day, 
      report: { ...r, md } 
    });

    console.log('[DailyReport] ✅ Rapport du ', r?.day);
    
    res?.json({ 
      ok: true, 
      message: `Daily report generated for ${r?.day}`,
      data: { ...r, md }
    });
  } catch (error) {
    console.error('[DailyReport] ❌ Erreur ', error);
    res?.status(500)?.json({
      ok: false,
      error: error?.message || 'Failed to generate daily report via cron'
    });
  }
});

// Mount PNL Tracker routes
app?.use('/', pnlTracker);

// Start server
const PORT = process.env?.PORT || 3000;
app?.listen(PORT, () => {
  console.log(`🚀 Backend API server running on port ${PORT}`);
  console.log(`📊 Daily Intelligence Report API endpoints available:
  - GET  /api/daily-report
  - POST /api/daily-report/generate  
  - GET  /api/daily-report/history
  - GET  /api/daily-report/live-metrics
  - POST /api/daily-report/cron`);
});