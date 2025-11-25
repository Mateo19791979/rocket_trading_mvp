import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import IB from 'ib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8080;

// IBKR connexion (live = 7497, paper = 7496)
const ib = new IB({
  host: '127.0.0.1',
  port: process.env.IBKR_PAPER === 'true' ? 7496 : 7497,
  clientId: 1
});

ib.on('connected', () => console.log('IBKR CONNECTÉ'));
ib.on('disconnected', () => console.log('IBKR DÉCONNECTÉ'));
ib.on('error', err => console.error('IBKR ERREUR:', err));
ib.connect();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    ibkr: ib.connected ? "connected" : "disconnected",
    version: "3.0-IBKR",
    time: new Date().toISOString()
  });
});

// Exemple prix AAPL
app.get('/price/:symbol', (req, res) => {
  const { symbol } = req.params;
  ib.reqMktData(1, { symbol, secType: 'STK', exchange: 'SMART', currency: 'USD' }, '', false, false);
  ib.once('tickPrice', (id, type, price) => {
    if (id === 1) res.json({ symbol, price });
  });
});

// Frontend React/Vite
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Rocket Trading MVP + IBKR → http://localhost:${PORT}`);
});
