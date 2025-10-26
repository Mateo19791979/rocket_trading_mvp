import express from 'express';
import cors from 'cors';

import { marketRealtime } from './routes/market.realtime.js';
import { makeAISymbolRoutes } from './routes/aiSymbols.routes.js';
import { IbkrFeedMux } from './services/market/ibkrFeedMux.js';
import diag from './routes/diag.internal.routes.js';
import { makeSwarmRoutes } from './routes/swarm.routes.js';
import { makeEvolutionRoutes } from './routes/evolution.routes.js';
import { makeCanaryRoutes } from './routes/evo.canary.routes.js';
import ops from './routes/ops.internal.routes.js';
import { startEvolutionEngine } from './workers/evolution.engine.js';
import { startCanaryPromoter } from './workers/evo.canary.js';
import { startOpsSupervisor } from './workers/opsSupervisor.js';
import { makeAnalyticsTradesRoutes } from './routes/analytics.trades.routes.js';

const app = express();

app?.use(cors());
app?.use(express?.json());

// 🔧 SURGICAL: Guaranteed JSON health endpoint (Team Pro Pack v1)
app?.get('/health', (req, res) => {
  res?.set('content-type', 'application/json');
  res?.status(200)?.json({
    ok: true,
    service: 'api',
    time: new Date()?.toISOString(),
    environment: process.env?.NODE_ENV || 'development',
    surgical_fixes_active: true
  });
});

// 🔧 SURGICAL: Health publique (front) - GUARANTEED JSON
app?.get('/api/health', (_req, res)=> {
  res?.set('content-type', 'application/json');
  res?.json({ 
    ok: true, 
    ts: new Date()?.toISOString(), 
    app: 'rocket',
    surgical_fixes_active: true
  });
});

// 🔧 SURGICAL: Health JSON pour market - GUARANTEED JSON
app?.get('/api/market/health', (_req, res) => {
  res?.set('content-type', 'application/json');
  res?.json({ 
    ok: true, 
    service: 'market-data', 
    ts: new Date()?.toISOString(),
    surgical_fixes_active: true
  });
});

// Santé & audit (toujours JSON)
app?.use('/internal', diag);

// Ops internal routes
app?.use('/internal/ops', ops);

// Real-time market data routes
app?.use('/api/realtime', marketRealtime);

// AI Swarm Management Routes
app?.use('/api/swarm', makeSwarmRoutes());

// AI Evolution Engine Routes
app?.use('/api/evo', makeEvolutionRoutes());

// Canary IBKR Paper Routes (NEW)
app?.use('/api/evo/canary', makeCanaryRoutes());

// Analytics routes (NEW) - Fixed 42703 compatible endpoints
app?.use('/analytics', makeAnalyticsTradesRoutes());

// Initialize IBKR Feed Mux with starter symbols
const mux = new IbkrFeedMux({
  connectFn: async () => {
    console.log('[IBKR MUX] Mock connect - ready for integration');
    // TODO: Replace with actual IBKR connection when available
  },
  disconnectFn: async () => {
    console.log('[IBKR MUX] Mock disconnect');
    // TODO: Replace with actual IBKR disconnection when available
  },
  subscribeFn: async (symbols, onTick) => {
    console.log('[IBKR MUX] Mock subscribe to symbols:', symbols);
    // TODO: Replace with actual IBKR subscription when available
    // For now, create mock symbols set for AI management
    if (!mux.symbols) mux.symbols = new Set();
    symbols?.forEach(s => mux?.symbols?.add(s));
  }
});

// Initialize symbols set for AI management
mux.symbols = new Set();

// Initial symbols from environment or default set
const START_SYMBOLS = (process.env?.START_SYMBOLS || 'AAPL,MSFT,TSLA,SPY')
  ?.split(',')
  ?.map(s => s?.trim()?.toUpperCase());

// AI Symbol Management routes (Existing)
app?.use('/api/ai', makeAISymbolRoutes({ feedMux: mux }));

// Listen for ticks and log (when IBKR integration is active)
mux?.on('tick', (tick) => {
  console.log('[IBKR TICK]', tick?.symbol, tick?.last);
  // Additional processing can be added here
});

// Start the mux with initial symbols
mux?.start(START_SYMBOLS)?.catch(console.error);

// Start background workers
startEvolutionEngine()?.catch(console.error);
startCanaryPromoter()?.catch(console.error);  // NEW: Start Canary Promoter
startOpsSupervisor()?.catch(console.error);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] Graceful shutdown...');
  mux?.stop()?.then(() => process.exit(0));
});

const PORT = Number(process.env?.PORT||3000);

app?.listen(PORT, ()=> {
  console.log(`[API] up :${PORT}`);
  console.log('[SERVER] Real-time endpoints: /api/realtime/quote, /api/realtime/health');
  console.log('[SERVER] Health endpoints: /health, /api/health, /internal/health');
  console.log('[SERVER] Analytics endpoints: /analytics/trades, /analytics/today');  // UPDATED
  console.log('[SERVER] AI Symbol Management: /api/ai/symbol-intent, /api/ai/symbols, /api/ai/policy');
  console.log('[SERVER] AI Swarm Management: /api/swarm/* (move, energy, rest, fusion, state, policy, performance, statistics)');
  console.log('[SERVER] Evolution Engine: /api/evo/* (candidates, fitness, policies, strategies, events)');
  console.log('[SERVER] Canary IBKR Paper: /api/evo/canary/* (policy, logs, promote)');  // NEW
  console.log('[SERVER] Internal Ops: /internal/ops/* (audit-run, audit-status, repair)');
  console.log('[SERVER] IBKR Feed Mux initialized with symbols:', START_SYMBOLS);
  console.log('🔧 [SURGICAL] Stabilization Pack v2 + JSON Health Endpoints + 42703 Fixes + Vite Import Stability - All systems operational');
});