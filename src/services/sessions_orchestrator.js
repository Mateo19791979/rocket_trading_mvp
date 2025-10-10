// src/services/sessions_orchestrator.js
// Orchestrateur complet : ASIA → EU (am+pm) → US, avec handoff et limites de risque.
// Dépendances: "luxon" (npm i luxon). Adapté à Europe/Zurich comme TZ maître.

import { DateTime } from "luxon";

// =============== CONFIG GLOBALE =============== //
const MASTER_TZ = "Europe/Zurich";

const SESSIONS = [
  // --- ASIA (soir/nuit CET/CEST) ---
  {
    id: "ASIA_EVENING",
    label: "Asia Cash (Tokyo/HK/SGX)",
    active: true,
    days: "MON-FRI",
    // Plage qui couvre 01:00–08:30 CET (TOK 09-15, HK 09:30-16, SGX 09-17)
    start: "01:00",
    end:   "08:30",
    exchanges: ["TSE", "HKEX", "SGX"],
    universe: "ASIA",
    max_gross_exposure_pct: 0.30,
    max_order_notional_chf: 20000,
    cooldown_sec: 20,
    skip_auctions: true
  },
  
  // --- EUROPE ---
  {
    id: "EU_MORNING",
    label: "Europe Morning",
    active: true,
    days: "MON-FRI",
    start: "08:05",
    end:   "11:30",
    exchanges: ["XETRA", "EURONEXT", "LSE", "SIX"],
    universe: "EU",
    max_gross_exposure_pct: 0.35,
    max_order_notional_chf: 25000,
    cooldown_sec: 20,
    skip_auctions: true
  },
  {
    id: "EU_PM",
    label: "Europe PM (handoff US)",
    active: true,
    days: "MON-FRI",
    start: "13:30",
    end:   "17:25",
    exchanges: ["XETRA", "EURONEXT", "LSE", "SIX"],
    universe: "EU",
    max_gross_exposure_pct: 0.45,
    max_order_notional_chf: 30000,
    cooldown_sec: 15,
    skip_auctions: true
  },
  
  // --- US ---
  {
    id: "US_CASH",
    label: "US Cash",
    active: true,
    days: "MON-FRI",
    start: "15:30",
    end:   "22:00",
    exchanges: ["NYSE", "NASDAQ", "ARCA"],
    universe: "US",
    max_gross_exposure_pct: 0.60,
    max_order_notional_chf: 35000,
    cooldown_sec: 10
  }
];

const GLOBAL_LIMITS = {
  max_total_gross_exposure_pct: 0.85,
  daily_loss_stop_pct: 0.70,            // coupe si PnL_jour <= -70% du risk budget journalier
  per_symbol_max_notional_chf: 50000
};

// =============== UNIVERS (MVP liquides) =============== //
const UNIVERSES = {
  ASIA: {
    indices_futures: ["NK225M", "HSI", "SGXNK"], // placeholders futures/mini
    etf: ["2800.HK", "EWS", "EWY", "EWH"],
    single_names: ["7203.T", "9984.T", "0700.HK", "1299.HK", "D05.SI"]
  },
  EU: {
    indices_futures: ["FDAX", "FESX", "FCE"],
    etf: ["EXS1", "SXR8", "VEUR", "IEUX", "VGK"],
    single_names: ["NESN.SW","ROG.SW","NOVN.SW","SIE.DE","SAP.DE","MC.PA","OR.PA","AIR.PA","ASML.AS"]
  },
  US: {
    indices_futures: ["ES", "NQ", "YM"],
    etf: ["SPY","QQQ","IWM","DIA"],
    single_names: ["AAPL","MSFT","NVDA","AMZN","META","GOOGL","TSLA"]
  }
};

// =============== STUBS A RACCORDER =============== //
// Remplace ces fonctions par tes services concrets (agents, risk, IBKR, bus/event).
async function enableAgentsFor(sessionId) {
  console.log(`[sessions] Enabling agents for ${sessionId}`);
  // TODO: Raccorder aux vrais agents
}

async function disableAgentsFor(sessionId) {
  console.log(`[sessions] Disabling agents for ${sessionId}`);
  // TODO: Raccorder aux vrais agents
}

async function setRiskBudget(params) {
  console.log(`[sessions] Setting risk budget for ${params?.sessionId}:`, params);
  // TODO: Raccorder au service de risk
}

async function targetGrossExposure(scope, targetPct) {
  console.log(`[sessions] Targeting ${targetPct}% exposure for ${scope}`);
  // TODO: Raccorder au service de portfolio
}

async function restrictEntries(scope) {
  console.log(`[sessions] Restricting entries for ${scope}`);
  // TODO: Raccorder au service d'ordres
}

async function flattenIntraday(scope) {
  console.log(`[sessions] Flattening intraday positions for ${scope}`);
  // TODO: Raccorder au service de trading
}

function publishBusEvent(type, payload) {
  console.log(`[sessions] Bus event:`, { type, payload });
  // TODO: Raccorder au bus d'événements (WebSocket/NATS)
  
  // Émet un événement CustomEvent pour le frontend
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sessions:event", {
      detail: { type, payload, timestamp: Date.now() }
    }));
  }
}

async function recentLatency(channel) {
  // Simulation de latence
  return Math.random() * 200 + 50; // 50-250ms
}

async function getTopOfBook(symbol) {
  // Simulation de données de marché
  const basePrice = 100 + Math.random() * 50;
  const spread = 0.05 + Math.random() * 0.10;
  return {
    bid: basePrice - spread/2,
    ask: basePrice + spread/2,
    bidSize: Math.floor(Math.random() * 2000) + 500,
    askSize: Math.floor(Math.random() * 2000) + 500
  };
}

// Simule "ouvert/fermé" (MVP) en se basant sur la fenêtre; raccorde à tes vrais calendriers ensuite.
async function isExchangeOpen(_exchanges, _tz) {
  return true; // TODO: Implémenter la vraie logique des calendriers d'échanges
}

async function skipIfAuction(_exchanges, _tz) {
  return false; // TODO: Implémenter la détection des périodes d'enchères
}

// =============== GARDE PRE-TRADE (MVP) =============== //
export async function preTradeGuards(symbol) {
  const q = await getTopOfBook(symbol);
  const mid = (q?.bid + q?.ask) / 2;
  const spreadBps = ((q?.ask - q?.bid) / mid) * 10000;
  if (spreadBps > 12) return { ok:false, reason:"SPREAD" };
  const depthOk = (q?.bidSize + q?.askSize) > 500;
  if (!depthOk) return { ok:false, reason:"DEPTH" };
  const lat = await recentLatency("marketdata");
  if (lat > 800) return { ok:false, reason:"LATENCY" };
  return { ok:true };
}

// =============== COEUR ORCHESTRATEUR =============== //
function isWeekdayZurich() {
  const d = DateTime?.now()?.setZone(MASTER_TZ)?.weekday; // 1=Lundi … 7=Dim
  return d >= 1 && d <= 5;
}

function isNowBetween(startHHMM, endHHMM) {
  const now = DateTime?.now()?.setZone(MASTER_TZ);
  const s = DateTime?.fromFormat(startHHMM, "HH:mm", { zone: MASTER_TZ })?.set({ year: now?.year, month: now?.month, day: now?.day });
  const e = DateTime?.fromFormat(endHHMM, "HH:mm", { zone: MASTER_TZ })?.set({ year: now?.year, month: now?.month, day: now?.day });
  return now >= s && now <= e;
}

export async function sessionTick() {
  if (!isWeekdayZurich()) {
    // Weekend : tout off
    for (const sess of SESSIONS) await disableAgentsFor(sess?.id);
    return;
  }
  
  for (const sess of SESSIONS) {
    if (!sess?.active) continue;
    const inWindow = isNowBetween(sess?.start, sess?.end);
    const open = await isExchangeOpen(sess?.exchanges, MASTER_TZ);
    const inAuction = sess?.skip_auctions ? await skipIfAuction(sess?.exchanges, MASTER_TZ) : false;
    
    if (inWindow && open && !inAuction) {
      await setRiskBudget({
        sessionId: sess?.id,
        maxGrossExposurePct: sess?.max_gross_exposure_pct,
        maxOrderNotionalCHF: sess?.max_order_notional_chf
      });
      await enableAgentsFor(sess?.id);
      publishBusEvent("session_status", { id: sess?.id, state: "OPEN", universe: sess?.universe });
    } else {
      await disableAgentsFor(sess?.id);
      publishBusEvent("session_status", {
        id: sess?.id,
        state: inWindow ? (inAuction ? "AUCTION" : "CLOSED_EXCH") : "OUT_OF_WINDOW",
        universe: sess?.universe
      });
    }
  }
  
  // ===== Handoffs & règles cross-sessions =====
  const now = DateTime?.now()?.setZone(MASTER_TZ);
  const HHMM = now?.toFormat("HH:mm");
  
  // Handoff ASIA → EU : réduis le risque Asie à l'approche de l'open EU
  if (HHMM >= "07:45" && HHMM < "08:15") {
    await restrictEntries("ASIA_*");
    await targetGrossExposure("ASIA_*", 0.70); // vise 70% de l'expo courante
  }
  if (HHMM === "08:10") {
    await flattenIntraday("ASIA_*"); // sors des intradays Asie à 08:10 CET
  }
  
  // Handoff EU → US : assainis entre 14:30 et 15:30
  if (HHMM >= "14:30" && HHMM < "15:25") {
    await restrictEntries("EU_*");
    await targetGrossExposure("EU_*", 0.70);
  }
  if (HHMM === "15:25") {
    await flattenIntraday("EU_*");
  }
  
  // (Option) Stop global journalier : géré ailleurs via PnL consolidé et GLOBAL_LIMITS
}

// Lance le tick toutes les 15 s (valeur pratique).
let _timer = null;

export function startSessionsOrchestrator(intervalMs = 15000) {
  if (_timer) return;
  _timer = setInterval(sessionTick, intervalMs);
  console.log(`[sessions] orchestrator started @${intervalMs}ms in ${MASTER_TZ}`);
}

export function stopSessionsOrchestrator() {
  if (_timer) clearInterval(_timer);
  _timer = null;
}

// =============== EXPOSITION DES UNIVERS (si besoin côté API) =============== //
export function getUniverse(name) {
  return UNIVERSES?.[name];
}

export function listSessions() {
  return SESSIONS?.map(s => ({ ...s }));
}

export const GLOBAL_RISK_LIMITS = { ...GLOBAL_LIMITS };