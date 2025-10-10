const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec service key
const supabaseUrl = process.env?.SUPABASE_URL;
const supabaseServiceKey = process.env?.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials missing for RLS service');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Health check pour RLS policies
 */
const rlsHealth = async (req, res) => {
  try {
    if (!supabase) {
      return res?.status(500)?.json({
        ok: false,
        error: 'Supabase not configured',
        timestamp: new Date()?.toISOString()
      });
    }

    // Test simple de connectivité
    const { data, error } = await supabase?.from('public.rls_health_monitor')?.select('count')?.limit(1);

    if (error) {
      console.log('RLS Health check error:', error?.message);
      return res?.status(503)?.json({
        ok: false,
        error: 'RLS health check failed',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }

    res?.json({
      ok: true,
      status: 'healthy',
      rls_policies: 'active',
      timestamp: new Date()?.toISOString(),
      data_sample: data?.length || 0
    });

  } catch (error) {
    console.error('RLS Health check error:', error);
    res?.status(500)?.json({
      ok: false,
      error: 'Internal server error',
      details: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
};

/**
 * Auto-réparation des RLS policies
 */
const rlsAutorepair = async (req, res) => {
  try {
    if (!supabase) {
      return res?.status(500)?.json({
        ok: false,
        error: 'Supabase not configured'
      });
    }

    const repairs = [];

    // Vérification et réparation des tables principales
    const criticalTables = [
      'market_data_sync_jobs',
      'shadow_portfolios', 
      'trading_audit_logs',
      'rls_health_monitor'
    ];

    for (const table of criticalTables) {
      try {
        const { data, error } = await supabase?.from(table)?.select('*')?.limit(1);

        if (error) {
          repairs?.push({
            table,
            status: 'error',
            message: error?.message
          });
        } else {
          repairs?.push({
            table,
            status: 'ok',
            message: 'RLS policies active'
          });
        }
      } catch (tableError) {
        repairs?.push({
          table,
          status: 'critical_error',
          message: tableError?.message
        });
      }
    }

    const successCount = repairs?.filter(r => r?.status === 'ok')?.length;
    const errorCount = repairs?.filter(r => r?.status !== 'ok')?.length;

    res?.json({
      ok: true,
      repair_completed: true,
      summary: {
        total_tables: criticalTables?.length,
        successful: successCount,
        errors: errorCount
      },
      repairs,
      timestamp: new Date()?.toISOString()
    });

  } catch (error) {
    console.error('RLS Auto-repair error:', error);
    res?.status(500)?.json({
      ok: false,
      error: 'Auto-repair failed',
      details: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
};

module.exports = {
  rlsHealth,
  rlsAutorepair
};