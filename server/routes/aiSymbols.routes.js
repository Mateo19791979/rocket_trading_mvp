/* eslint-disable */
import express from 'express';
import { createClient } from '@supabase/supabase-js';

/**
 * AI Symbol Management Routes
 * Allows AI agents to choose which symbols to watch/trade with guardrails
 */
export function makeAISymbolRoutes({ feedMux }) {
  const router = express?.Router();
  const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
  const AI_KEY = process.env?.INTERNAL_AI_KEY || '';

  // Middleware: Internal AI key required for non-GET requests
  router?.use((req, res, next) => {
    if (req?.method !== 'GET') {
      const key = req?.headers?.['x-internal-ai-key'];
      if (!key || key !== AI_KEY) {
        return res?.status(401)?.json({ ok: false, error: 'unauthorized' });
      }
    }
    next();
  });

  /**
   * Check if symbol is blacklisted
   */
  async function isBlacklisted(symbol) {
    const { data } = await supa?.from('symbol_blacklist')?.select('symbol')?.eq('symbol', symbol)?.maybeSingle();
    return !!data;
  }

  /**
   * Check if symbol is whitelisted (empty whitelist = everything allowed except blacklist)
   */
  async function isWhitelisted(symbol) {
    // If whitelist is empty → everything is allowed except blacklist
    const { count: wlCount, error: e1 } = await supa?.from('symbol_whitelist')?.select('*', { count: 'exact', head: true });
    if (e1) return true; // fail-open gracefully
    if (!wlCount || wlCount === 0) return true;

    const { data } = await supa?.from('symbol_whitelist')?.select('symbol')?.eq('symbol', symbol)?.maybeSingle();
    return !!data;
  }

  /**
   * Get current symbol count for agent (based on feed cache + recent intents)
   */
  async function currentAgentSymbolCount(agent) {
    // Base on feed cache symbols
    const symbols = new Set(feedMux?.symbols || []);
    // Could filter by agent metadata in the future
    return symbols?.size;
  }

  /**
   * Get agent quota (fallback to default '*' quota)
   */
  async function agentQuota(agent) {
    const { data } = await supa?.from('agent_symbol_quotas')?.select('max_symbols')?.eq('agent_name', agent)?.maybeSingle();
    if (data?.max_symbols) return data?.max_symbols;

    const star = await supa?.from('agent_symbol_quotas')?.select('max_symbols')?.eq('agent_name', '*')?.maybeSingle();
    return star?.data?.max_symbols ?? 50;
  }

  /**
   * POST /api/ai/symbol-intent
   * AI agent requests to watch/trade/unwatch a symbol
   */
  router?.post('/symbol-intent', async (req, res) => {
    try {
      res?.set('content-type', 'application/json; charset=utf-8');
      
      const { agent_name, intent, symbol, confidence, metadata } = req?.body || {};

      if (!agent_name || !intent || !symbol) {
        return res?.status(400)?.json({ 
          ok: false, 
          error: 'agent_name, intent, symbol required' 
        });
      }

      const sym = String(symbol)?.trim()?.toUpperCase();

      // Guardrail: Check blacklist
      if (await isBlacklisted(sym)) {
        await supa?.from('ai_trade_intents')?.insert([{ 
          agent_name, intent, symbol: sym, confidence, metadata, 
          status: 'rejected', reason: 'blacklisted' 
        }]);
        return res?.json({ 
          ok: false, 
          rejected: true, 
          reason: 'blacklisted' 
        });
      }

      // Guardrail: Check whitelist
      if (!(await isWhitelisted(sym))) {
        await supa?.from('ai_trade_intents')?.insert([{ 
          agent_name, intent, symbol: sym, confidence, metadata, 
          status: 'rejected', reason: 'not whitelisted' 
        }]);
        return res?.json({ 
          ok: false, 
          rejected: true, 
          reason: 'not_whitelisted' 
        });
      }

      // Handle watch/trade intents
      if (intent === 'watch' || intent === 'trade') {
        const used = await currentAgentSymbolCount(agent_name);
        const maxSymbols = await agentQuota(agent_name);

        if (used >= maxSymbols) {
          await supa?.from('ai_trade_intents')?.insert([{ 
            agent_name, intent, symbol: sym, confidence, metadata, 
            status: 'rejected', reason: `quota_exceeded (${used}/${maxSymbols})` 
          }]);
          return res?.json({ 
            ok: false, 
            rejected: true, 
            reason: 'quota_exceeded', 
            used, 
            max: maxSymbols 
          });
        }

        // Subscribe to the feed
        feedMux?.subscribe([sym]);

        await supa?.from('ai_trade_intents')?.insert([{ 
          agent_name, intent, symbol: sym, confidence, metadata, 
          status: 'accepted' 
        }]);

        return res?.json({ 
          ok: true, 
          subscribed: sym, 
          feed: feedMux?.getHealth() 
        });
      }

      // Handle unwatch intent
      if (intent === 'unwatch') {
        // Soft unsubscription (remove from local set)
        feedMux?.symbols?.delete(sym);

        await supa?.from('ai_trade_intents')?.insert([{ 
          agent_name, intent, symbol: sym, confidence, metadata, 
          status: 'accepted' 
        }]);

        return res?.json({ 
          ok: true, 
          unsubscribed: sym, 
          feed: feedMux?.getHealth() 
        });
      }

      return res?.status(400)?.json({ 
        ok: false, 
        error: 'invalid intent' 
      });

    } catch (e) {
      console.error('[AI SYMBOLS] Symbol intent error:', e?.message || e);
      return res?.status(500)?.json({ 
        ok: false, 
        error: String(e?.message || e) 
      });
    }
  });

  /**
   * GET /api/ai/symbols
   * Get list of active symbols in the feed
   */
  router?.get('/symbols', (req, res) => {
    try {
      res?.set('content-type', 'application/json; charset=utf-8');
      res?.json({ 
        ok: true, 
        symbols: Array.from(feedMux?.symbols || []) 
      });
    } catch (e) {
      return res?.status(500)?.json({ 
        ok: false, 
        error: String(e?.message || e) 
      });
    }
  });

  /**
   * GET /api/ai/policy
   * Get whitelist/blacklist policy information for UI
   */
  router?.get('/policy', async (req, res) => {
    try {
      res?.set('content-type', 'application/json; charset=utf-8');
      
      const { count: wl } = await supa?.from('symbol_whitelist')?.select('*', { count: 'exact', head: true });
      const { count: bl } = await supa?.from('symbol_blacklist')?.select('*', { count: 'exact', head: true });

      res?.json({ 
        ok: true, 
        whitelist_count: wl || 0, 
        blacklist_count: bl || 0 
      });
    } catch (e) {
      return res?.status(500)?.json({ 
        ok: false, 
        error: String(e?.message || e) 
      });
    }
  });

  /**
   * GET /api/ai/agent-status/:agentName
   * Get status for specific AI agent
   */
  router?.get('/agent-status/:agentName', async (req, res) => {
    try {
      res?.set('content-type', 'application/json; charset=utf-8');
      
      const agentName = req?.params?.agentName;
      const used = await currentAgentSymbolCount(agentName);
      const quota = await agentQuota(agentName);

      // Get recent intents for this agent
      const { data: recentIntents } = await supa?.from('ai_trade_intents')
        ?.select('*')
        ?.eq('agent_name', agentName)
        ?.order('created_at', { ascending: false })
        ?.limit(10);

      res?.json({
        ok: true,
        agent_name: agentName,
        symbols_used: used,
        max_symbols: quota,
        quota_remaining: quota - used,
        recent_intents: recentIntents || []
      });
    } catch (e) {
      return res?.status(500)?.json({ 
        ok: false, 
        error: String(e?.message || e) 
      });
    }
  });

  return router;
}