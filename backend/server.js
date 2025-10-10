import express from 'express';
import cors from 'cors';
import { internalAgents } from './routes/internalAgents.js';
import bridge from './routes/orchestratorBridge.js';
import { scheduleAgentsMaintenance } from './jobs/agentsMaintenance.js';

const app = express();
app?.use(cors());
app?.use(express?.json({limit:'2mb'}));

// Mount internal agents routes
app?.use('/internal/agents', internalAgents);

// Mount orchestrator bridge routes
app?.use('/bridge', bridge);

const { rlsHealth, rlsAutorepair } = require("./services/rlsRepairService");
const { mountOpsRead } = require("./services/opsRead");

app?.get("/security/rls/health", rlsHealth);
app?.post("/security/rls/repair", rlsAutorepair);
mountOpsRead(app);

app?.get('/api/health', (_req, res) => res?.json({ ok: true, ts: new Date()?.toISOString() }));

// Default 404 handler
app?.use((req, res) => res?.status(404)?.json({ ok: false, error: 'not_found', path: req?.path }));

// Start maintenance scheduling
scheduleAgentsMaintenance();

app?.listen(process.env?.PORT||3000, ()=> console.log("API up with Orchestrator Bridge"));