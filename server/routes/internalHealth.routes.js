import express from 'express';
import { createClient } from '@supabase/supabase-js';

export const internalHealth = express?.Router();

// Configuration Supabase sécurisée
const supabaseUrl = process.env?.SUPABASE_URL;
const supabaseServiceKey = process.env?.SUPABASE_SERVICE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn('[InternalHealth] Supabase configuration incomplete - endpoints will return fallback responses');
}

// Middleware pour forcer les réponses JSON
const forceJsonResponse = (req, res, next) => {
  res?.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
};

// Application du middleware à tous les endpoints
internalHealth?.use(forceJsonResponse);

/**
 * Endpoint de santé basique - toujours JSON
 */
internalHealth?.get('/health', (req, res) => {
  const healthData = {
    ok: true,
    app: 'rocket-trading-mvp',
    ts: new Date()?.toISOString(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version
    },
    environment: {
      node_env: process.env?.NODE_ENV,
      supabase_configured: !!(supabaseUrl && supabaseServiceKey)
    }
  };

  res?.status(200)?.json(healthData);
});

/**
 * Check RLS et connectivité Supabase - toujours JSON
 */
internalHealth?.get('/rls-check', async (req, res) => {
  if (!supabase) {
    return res?.status(200)?.json({
      ok: false,
      kind: 'configuration_error',
      error: 'Supabase client not configured - check SUPABASE_URL and SUPABASE_SERVICE_KEY',
      ts: new Date()?.toISOString()
    });
  }

  try {
    // Test 1: Connexion basique avec une fonction simple
    const { data: basicTest, error: basicError } = await supabase?.rpc('health_json_ok');

    if (basicError) {
      return res?.status(200)?.json({
        ok: false,
        kind: 'rpc_error',
        test: 'health_json_ok',
        error: basicError?.message,
        ts: new Date()?.toISOString()
      });
    }

    // Test 2: Lecture sécurisée sur la vue d'audit (ne touche pas aux tables sensibles)
    const { data: auditData, error: auditError } = await supabase?.from('schema_audit_status')?.select('*')?.limit(5);

    if (auditError) {
      return res?.status(200)?.json({
        ok: false,
        kind: 'query_error',
        test: 'schema_audit_status',
        error: auditError?.message,
        basic_connection: basicTest || null,
        ts: new Date()?.toISOString()
      });
    }

    // Test 3: Diagnostic rapide des colonnes critiques
    let diagnosticResult = null;
    try {
      const { data: diagData, error: diagError } = await supabase?.rpc('health_diagnostic_simple');
      diagnosticResult = diagError ? { error: diagError?.message } : diagData;
    } catch (diagException) {
      diagnosticResult = { error: diagException?.message };
    }

    // Tout va bien - réponse de succès
    return res?.status(200)?.json({
      ok: true,
      tests_passed: ['health_json_ok', 'schema_audit_status'],
      basic_connection: basicTest,
      audit_sample: auditData || [],
      diagnostic: diagnosticResult,
      ts: new Date()?.toISOString()
    });

  } catch (exception) {
    return res?.status(200)?.json({
      ok: false,
      kind: 'exception',
      error: exception?.message,
      ts: new Date()?.toISOString()
    });
  }
});

/**
 * Diagnostic complet avec réparation optionnelle
 */
internalHealth?.post('/repair', async (req, res) => {
  if (!supabase) {
    return res?.status(200)?.json({
      ok: false,
      error: 'Supabase not configured',
      ts: new Date()?.toISOString()
    });
  }

  const { do_repair = false, target_columns = [] } = req?.body || {};

  try {
    // Lancer le diagnostic avec réparation optionnelle
    const { data: diagnosticResults, error } = await supabase?.rpc('diagnostic_colonnes_critiques', {
      do_repair: do_repair
    });

    if (error) {
      return res?.status(200)?.json({
        ok: false,
        kind: 'diagnostic_error',
        error: error?.message,
        ts: new Date()?.toISOString()
      });
    }

    // Analyser les résultats
    const results = diagnosticResults || [];
    const criticalIssues = results?.filter(r => r?.status === 'error' || r?.status === 'missing');
    const repaired = results?.filter(r => r?.status === 'repaired');
    const healthy = results?.filter(r => r?.status === 'ok');

    return res?.status(200)?.json({
      ok: true,
      repair_executed: do_repair,
      summary: {
        total_checked: results?.length,
        critical_issues: criticalIssues?.length,
        repaired_items: repaired?.length,
        healthy_items: healthy?.length
      },
      details: results,
      recommendations: criticalIssues?.length > 0 ? [
        'Consider running repair with do_repair=true',
        'Check Supabase project status if functions fail',
        'Verify database schema consistency'
      ] : [],
      ts: new Date()?.toISOString()
    });

  } catch (exception) {
    return res?.status(200)?.json({
      ok: false,
      kind: 'exception',
      error: exception?.message,
      ts: new Date()?.toISOString()
    });
  }
});

/**
 * Endpoint pour tester une colonne spécifique
 */
internalHealth?.get('/test-column/:table/:column', async (req, res) => {
  if (!supabase) {
    return res?.status(200)?.json({
      ok: false,
      error: 'Supabase not configured',
      ts: new Date()?.toISOString()
    });
  }

  const { table, column } = req?.params;

  try {
    // Test si la colonne existe en tentant une query simple
    const { data, error } = await supabase?.from(table)?.select(column)?.limit(1);

    if (error) {
      return res?.status(200)?.json({
        ok: false,
        table,
        column,
        exists: false,
        error: error?.message,
        ts: new Date()?.toISOString()
      });
    }

    return res?.status(200)?.json({
      ok: true,
      table,
      column,
      exists: true,
      sample_data: data,
      ts: new Date()?.toISOString()
    });

  } catch (exception) {
    return res?.status(200)?.json({
      ok: false,
      table,
      column,
      exists: 'unknown',
      error: exception?.message,
      ts: new Date()?.toISOString()
    });
  }
});

export default internalHealth;