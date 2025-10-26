/* eslint-disable */
import express from 'express';
import { SwarmManager } from '../services/swarm/SwarmManager.js';

export function makeSwarmRoutes() {
  const r = express?.Router();
  const swarm = new SwarmManager();
  const INTERNAL_AI_KEY = process.env?.INTERNAL_AI_KEY || '';

  // Load policies on startup
  swarm?.loadPolicies()?.catch(() => {});

  // Middleware clé interne
  r?.use((req, res, next) => {
    res?.setHeader('content-type', 'application/json; charset=utf-8');
    
    if (req?.method !== 'GET') {
      if (req?.headers?.['x-internal-ai-key'] !== INTERNAL_AI_KEY) {
        return res?.status(401)?.json({ ok: false, error: 'unauthorized' });
      }
    }
    next();
  });

  // POST /api/swarm/move { agent_name, to_region, motive, confidence, focus }
  r?.post('/move', async (req, res) => {
    try {
      const { agent_name, to_region, motive, confidence, focus } = req?.body || {};
      
      if (!agent_name || !to_region || !motive) {
        return res?.status(400)?.json({ 
          ok: false, 
          error: 'missing_required_fields',
          required: ['agent_name', 'to_region', 'motive']
        });
      }

      const result = await swarm?.move(agent_name, to_region, motive, confidence, focus);
      res?.json(result);
    } catch (error) {
      res?.json({ ok: false, error: 'internal_error', message: error?.message });
    }
  });

  // POST /api/swarm/energy { agent_name, tradesCount }
  r?.post('/energy', async (req, res) => {
    try {
      const { agent_name, tradesCount } = req?.body || {};
      
      if (!agent_name) {
        return res?.status(400)?.json({ ok: false, error: 'agent_name_required' });
      }

      await swarm?.adjustEnergy(agent_name, tradesCount || 0);
      res?.json({ ok: true });
    } catch (error) {
      res?.json({ ok: false, error: 'internal_error', message: error?.message });
    }
  });

  // POST /api/swarm/rest { agent_name }
  r?.post('/rest', async (req, res) => {
    try {
      const { agent_name } = req?.body || {};
      
      if (!agent_name) {
        return res?.status(400)?.json({ ok: false, error: 'agent_name_required' });
      }

      await swarm?.rest(agent_name);
      res?.json({ ok: true });
    } catch (error) {
      res?.json({ ok: false, error: 'internal_error', message: error?.message });
    }
  });

  // POST /api/swarm/fusion { agentA, agentB }
  r?.post('/fusion', async (req, res) => {
    try {
      const { agentA, agentB } = req?.body || {};
      
      if (!agentA || !agentB) {
        return res?.status(400)?.json({ 
          ok: false, 
          error: 'missing_agents',
          required: ['agentA', 'agentB']
        });
      }

      const result = await swarm?.decideFusion(agentA, agentB);
      res?.json(result);
    } catch (error) {
      res?.json({ ok: false, error: 'internal_error', message: error?.message });
    }
  });

  // GET /api/swarm/state
  r?.get('/state', async (req, res) => {
    try {
      const result = await swarm?.getSwarmState();
      res?.json(result);
    } catch (error) {
      res?.json({ ok: false, error: 'internal_error', message: error?.message });
    }
  });

  // GET /api/swarm/policy
  r?.get('/policy', async (req, res) => {
    try {
      const result = await swarm?.getSwarmPolicies();
      res?.json(result);
    } catch (error) {
      res?.json({ ok: false, error: 'internal_error', message: error?.message });
    }
  });

  // GET /api/swarm/performance/:agent?
  r?.get('/performance/:agent?', async (req, res) => {
    try {
      const agent = req?.params?.agent || null;
      const result = await swarm?.getPerformanceSummary(agent);
      res?.json(result);
    } catch (error) {
      res?.json({ ok: false, error: 'internal_error', message: error?.message });
    }
  });

  // GET /api/swarm/statistics
  r?.get('/statistics', async (req, res) => {
    try {
      const result = await swarm?.getSwarmStatistics();
      res?.json(result);
    } catch (error) {
      res?.json({ ok: false, error: 'internal_error', message: error?.message });
    }
  });

  return r;
}