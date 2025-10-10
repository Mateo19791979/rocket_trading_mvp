// ====================================================================== 
// (E) TEMPLATE AGENT — Node.js with retry/backoff + heartbeat/pull flow
// ======================================================================

import fetch from 'node-fetch';

const API = process.env?.AAS_API || 'http://localhost:3000';
const KEY = process.env?.INTERNAL_ADMIN_KEY || 'your-internal-key';
const NAME = process.env?.AGENT_NAME || 'MyInternalAgent';

async function call(path, body, attempt = 1) {
  try {
    const response = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-key': KEY
      },
      body: JSON.stringify(body || {})
    });
    
    if (!response?.ok) throw new Error(`HTTP ${response.status}`);
    return await response?.json();
  } catch (e) {
    if (attempt <= 5) {
      const wait = Math.min(2000 * Math.pow(2, attempt - 1), 15000); // exponential backoff
      await new Promise(r => setTimeout(r, wait));
      return call(path, body, attempt + 1);
    }
    throw e;
  }
}

async function heartbeat(kpi) {
  return call('/internal/agents/heartbeat', { name: NAME, status: 'idle', kpi });
}

async function pull() {
  const res = await call('/internal/agents/pull', { name: NAME });
  return res?.task || null;
}

async function report(task_id, status, result, error) {
  return call('/internal/agents/report', { task_id, status, result, error });
}

async function executeTask(type, payload) {
  console.log(`[${NAME}] Executing task: ${type}`, payload);
  
  // Simulate task processing based on type
  if (type === 'backtest') {
    // Simulate backtesting
    await new Promise(r => setTimeout(r, Math.random() * 3000 + 1000));
    return { 
      sharpe: (1 + Math.random() * 0.5)?.toFixed(2), 
      trades: Math.floor(Math.random() * 500 + 100), 
      meta: payload || {} 
    };
  }
  
  if (type === 'screen') {
    // Simulate screening
    await new Promise(r => setTimeout(r, Math.random() * 2000 + 500));
    const symbols = ['NVDA', 'MSFT', 'AAPL', 'GOOGL', 'TSLA', 'AMZN'];
    return { 
      list: symbols?.slice(0, Math.floor(Math.random() * 4) + 1) 
    };
  }
  
  if (type === 'signal') {
    // Simulate signal generation
    await new Promise(r => setTimeout(r, Math.random() * 1000 + 300));
    const sides = ['long', 'short'];
    const symbols = ['NVDA', 'MSFT', 'AAPL'];
    return { 
      side: sides?.[Math.floor(Math.random() * sides?.length)], 
      symbol: symbols?.[Math.floor(Math.random() * symbols?.length)], 
      size: (Math.random() * 0.1)?.toFixed(3),
      confidence: (Math.random() * 0.4 + 0.6)?.toFixed(2)
    };
  }
  
  return { info: 'noop', type };
}

async function main() {
  console.log(`[${NAME}] Starting internal agent...`);
  
  // Register agent with retry
  await call('/internal/agents/register', {
    name: NAME, 
    kind: 'custom', 
    version: '2.0.0', 
    capabilities: ['screen', 'backtest', 'signal']
  });
  
  console.log(`[${NAME}] Registered successfully`);
  
  // Main loop: heartbeat -> pull -> exec -> report
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // Send heartbeat with basic KPI
      await heartbeat({ 
        ts: Date.now(),
        uptime: process.uptime(),
        memory: Math.round(process.memoryUsage()?.rss / 1024 / 1024) // MB
      });
      
      // Try to pull a task
      const task = await pull();
      
      if (task) {
        console.log(`[${NAME}] Got task:`, task?.task_type, task?.id);
        
        try {
          const result = await executeTask(task?.task_type, task?.payload);
          await report(task?.id, 'ok', result);
          console.log(`[${NAME}] Task completed:`, task?.id);
        } catch (err) {
          console.error(`[${NAME}] Task failed:`, err?.message);
          await report(task?.id, 'fail', null, String(err));
        }
      }
      
      // Gentle rhythm - 2.5 seconds between cycles
      await new Promise(r => setTimeout(r, 2500));
      
    } catch (error) {
      console.error(`[${NAME}] Main loop error:`, error?.message);
      await new Promise(r => setTimeout(r, 5000)); // Wait longer on errors
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`[${NAME}] Shutting down gracefully...`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`[${NAME}] Terminated gracefully...`);
  process.exit(0);
});

main()?.catch(e => {
  console.error(`[${NAME}] Fatal error:`, e);
  process.exit(1);
});