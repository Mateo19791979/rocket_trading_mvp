# 🚀 RLS Health Endpoint - Checklist de Déploiement Production

## ✅ Configuration Docker/Traefik COMPLÈTE

### 1) Labels Traefik Backend (docker-compose.yml)
```yaml
backend:
  labels:
    - "traefik.http.routers.backend-rls.rule=Host(`rockettra3991.builtwithrocket.new`) && PathPrefix(`/security`)"
    - "traefik.http.routers.backend-rls.priority=100"  # PRIORITÉ HAUTE
    - "traefik.http.routers.backend-api.rule=Host(`rockettra3991.builtwithrocket.new`) && PathPrefix(`/api`)"
    - "traefik.http.routers.backend-api.priority=90"   # API endpoints
frontend:
  labels:
    - "traefik.http.routers.frontend.priority=10"     # PRIORITÉ BASSE (catch-all)
```

### 2) Express Middleware Order (backend/server.js) 
```javascript
// ✅ AVANT static et catch-all
app.get("/security/rls/health", (req, res) => { 
  res.json({ ok: true, service: "rls-health", time: new Date().toISOString() }) 
});
app.get("/api/diagnostics/ai-keys", (req, res) => { 
  // Diagnostic AI providers 
});
app.post("/api/ibkr/execute", (req, res) => { 
  // IBKR Paper Trading smoke test
});
// ✅ APRÈS routes API
// app.use(express.static("dist"));
```

### 3) Variables d'environnement (.env)
```bash
# ===== AI Providers (tous, pour éviter les erreurs de modules) =====
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
PERPLEXITY_API_KEY=pplx-...

# Sélection par défaut (fallback si un provider manque)
AI_PROVIDER_DEFAULT=openai
AI_TIMEOUT_MS=25000

# ===== Supabase =====
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# ===== IBKR (Paper) =====
IBKR_MODE=paper
IBKR_HOST=127.0.0.1
IBKR_PORT=7497
IBKR_CLIENT_ID=1
IBKR_ACCOUNT=DUN766038
IBKR_READ_ONLY=false

# ===== Sécurité exécution =====
MAX_POS_PER_SYMBOL=1000
MAX_NOTIONAL_PER_SYMBOL=25000
MAX_LEVERAGE=2
DAILY_LOSS_STOP=-500
```

### 4) Dev Proxy Vite (vite.config.js)
```javascript
export default defineConfig({
  server: {
    proxy: {
      "/security": { target: "http://localhost:8080", changeOrigin: true },
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/status": { target: "http://localhost:8080", changeOrigin: true }
    }
  }
})
```

## 🧪 Tests de Validation (Production)

### 1) RLS Health Check - DOIT retourner JSON 200
```bash
curl -i https://rockettra3991.builtwithrocket.new/security/rls/health
# Expected: {"ok":true,"service":"rls-health",...}
```

### 2) AI Keys Diagnostic
```bash
curl -s https://rockettra3991.builtwithrocket.new/api/diagnostics/ai-keys
# Expected: {"openai":true,"anthropic":true,"gemini":true,"perplexity":true,...}
```

### 3) Backend Status Check
```bash
curl -s https://rockettra3991.builtwithrocket.new/status
# Expected: {"ok":true,"service":"trading-mvp-backend",...}
```

### 4) IBKR Paper Trading Smoke Test
```bash
curl -X POST https://rockettra3991.builtwithrocket.new/api/ibkr/execute \
  -H "Content-Type: application/json" \
  -d '{
    "clientOrderId": "smoke-test-001",
    "account": "DUN766038", 
    "symbol": "AAPL",
    "action": "BUY",
    "quantity": 1,
    "orderType": "MKT"
  }'
# Expected: {"status":"submitted",...}
```

## 🎯 Supabase 500 - Script de Réparation

```sql
-- Hotfix idempotent (SQL à coller dans Supabase SQL Editor)
CREATE SCHEMA IF NOT EXISTS trading;
SET search_path TO trading, public;

-- A) POSITIONS + vue compat public
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='trading' AND table_name='positions') THEN
    CREATE TABLE trading.positions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id uuid,
      symbol text NOT NULL,
      qty numeric NOT NULL DEFAULT 0,
      avg_price numeric,
      is_active boolean NOT NULL DEFAULT true,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
  
  -- Ajouter colonne is_active si manquante
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='trading' AND table_name='positions' AND column_name='is_active'
  ) THEN
    ALTER TABLE trading.positions ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
  
  -- Vue de compatibilité public
  CREATE OR REPLACE VIEW public.positions AS 
    SELECT id, account_id, symbol, qty, avg_price, is_active, updated_at 
    FROM trading.positions;
END $$;

-- B) TRADES + vue compat public  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='trading' AND table_name='trades') THEN
    CREATE TABLE trading.trades (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id uuid,
      account_id uuid,
      symbol text NOT NULL,
      side text NOT NULL,
      qty numeric NOT NULL,
      price numeric NOT NULL,
      fees numeric DEFAULT 0,
      realized_pnl numeric DEFAULT 0,
      unrealized_pnl numeric,
      ts timestamptz NOT NULL DEFAULT now()
    );
  END IF;
  
  -- Ajouter colonne unrealized_pnl si manquante
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='trading' AND table_name='trades' AND column_name='unrealized_pnl'
  ) THEN
    ALTER TABLE trading.trades ADD COLUMN unrealized_pnl numeric;
  END IF;
  
  -- Vue de compatibilité public
  CREATE OR REPLACE VIEW public.trades AS 
    SELECT id, order_id, account_id, symbol, side, qty, price, fees, realized_pnl, unrealized_pnl, ts 
    FROM trading.trades;
END $$;

-- C) market_ticks_cache + vue compat
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='trading' AND table_name='market_ticks_cache') THEN
    CREATE TABLE trading.market_ticks_cache (
      symbol text PRIMARY KEY,
      last numeric, 
      bid numeric, 
      ask numeric,
      ts timestamptz NOT NULL DEFAULT now()
    );
  END IF;
  
  CREATE OR REPLACE VIEW public.market_ticks_cache AS 
    SELECT symbol, last, bid, ask, ts FROM trading.market_ticks_cache;
END $$;
```

## 📊 GO/NO-GO Final Check

| Critère | Test | Status |
|---------|------|--------|
| **AI Keys** | `GET /api/diagnostics/ai-keys` → `{"all_configured": true}` | ⏳ |
| **RLS Health** | `GET /security/rls/health` → JSON 200 (pas HTML) | ⏳ |
| **Backend Status** | `GET /status` → JSON 200 | ⏳ |
| **IBKR Paper** | `POST /api/ibkr/execute` → `{"status":"submitted"}` | ⏳ |
| **Supabase 500** | SQL script exécuté sans erreur | ⏳ |
| **Traefik Priority** | Backend /security priorité 100 > Frontend priorité 10 | ⏳ |

## 🚨 Dépannage Rapide

### Si /security/rls/health renvoie HTML au lieu de JSON:
1. Vérifier l'ordre des middlewares Express (routes API AVANT static)
2. Vérifier les priorités Traefik (backend: 100, frontend: 10)  
3. Redémarrer: `docker-compose up -d --force-recreate`

### Si AI keys diagnostic échoue:
1. Vérifier que toutes les variables d'environnement sont définies
2. Éviter `REPLACE_ME` - utiliser vraies clés ou laisser vide `""`
3. Vérifier dans container: `docker exec mvp-backend env | grep API_KEY`

### Si IBKR smoke test échoue:
1. Vérifier IBKR_MODE=paper et IBKR_ACCOUNT=DUN766038
2. Le test est un mock - pas besoin de vraie connexion TWS
3. Devrait retourner `{"status":"submitted"}` même sans TWS

## 📈 Ordre d'Exécution CRITIQUE

1. **✅ Configuration Docker** → Variables d'environnement + labels Traefik
2. **✅ Réparation Supabase** → Script SQL pour éviter erreurs 500  
3. **✅ Test IBKR Paper** → Smoke test pour vérifier chaîne complète
4. **🚀 Déploiement** → `docker-compose up -d` et validation finale

---
**🎯 Objectif**: Système Multi-IA Trading fonctionnel avec tous les agents IA opérationnels, Supabase stable, et IBKR Paper prêt pour le trading.