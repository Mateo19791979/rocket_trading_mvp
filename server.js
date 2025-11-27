import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import IB from '@stoqey/ib';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8080;

let ib = null;
try {
  const IB_HOST = process.env.IBKR_HOST || '127.0.0.1';
  const IB_PORT = Number(process.env.IBKR_PORT) || 7497;
  const IB_CLIENT_ID = Number(process.env.IBKR_CLIENT_ID) || 1;

  ib = new IB({ host: IB_HOST, port: IB_PORT, clientId: IB_CLIENT_ID });
  ib.on('connected', () => console.log(`IBKR CONNECTÉ → ${IB_HOST}:${IB_PORT}`));
  ib.on('disconnected', () => console.log('IBKR DÉCONNECTÉ'));
  ib.on('error', err => console.error('IBKR ERREUR:', err.message));
  ib.connect();
} catch (err) {
  console.error('IBKR INIT ERREUR:', err.message);
}

// Health check
app.get('/health', (req, res) => {
  const distExists = fs.existsSync(join(__dirname, 'dist'));
  res.json({
    status: "healthy",
    ibkr: ib && ib.connected ? "connected" : "disconnected",
    dist: distExists ? "ok" : "missing",
    version: "3.0-FIXED",
    time: new Date().toISOString()
  });
});

// Prix en temps réel
app.get('/price/:symbol', (req, res) => {
  if (!ib || !ib.connected) return res.status(503).json({ error: "IBKR not connected" });
  const { symbol } = req.params;
  const contract = { symbol, secType: 'STK', exchange: 'SMART', currency: 'USD' };
  ib.reqMktData(4001, contract, '', false, false);
  const timeout = setTimeout(() => res.status(504).json({ error: "timeout" }), 8000);
  ib.once('tickPrice', (id, type, price) => {
    if (id === 4001 && type === 4) {
      clearTimeout(timeout);
      res.json({ symbol, price });
      ib.cancelMktData(4001);
    }
  });
});

// Frontend static
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Rocket Trading MVP → http://localhost:${PORT}`);
});
