# 🎯 STATS OVERVIEW DEPLOYMENT CHECKLIST

## ORDRE DE PRIORITÉ (exécute dans cet ordre)

### ✅ 1) Secrets IA — bloc .env prêt à coller

**Status**: Configuration ajoutée dans .env  
**Action**: Remplace les REPLACE_ME par tes vraies clés API

```bash
# Backend AI Provider Keys (à remplacer)
OPENAI_API_KEY=REPLACE_ME
ANTHROPIC_API_KEY=REPLACE_ME
GEMINI_API_KEY=REPLACE_ME
PERPLEXITY_API_KEY=REPLACE_ME
AI_PROVIDER_DEFAULT=openai
AI_TIMEOUT_MS=25000

# IBKR Paper Trading
IBKR_MODE=paper
IBKR_HOST=127.0.0.1
IBKR_PORT=7497
IBKR_CLIENT_ID=1
IBKR_ACCOUNT=DUN766038
IBKR_READ_ONLY=false
```

**Smoke test secrets (backend Express)**:
```bash
curl -s "$SUPABASE_URL/rest/v1/api/diagnostics/ai-keys" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### ✅ 2) Supabase 500 → OK (endpoint SQL simple + vues compat)

**Status**: Migration SQL créée  
**File**: `supabase/migrations/20251215183000_fix_stats_overview_one_line_guarantee.sql`

**Ce qui est corrigé**:
- ✅ Vue `trading.stats_overview_one` qui renvoie TOUJOURS 1 ligne
- ✅ Vue compat `public.stats_overview_one` pour l'UI
- ✅ RPC `public.rpc_stats_overview()` pour les appels single-object
- ✅ Utilise COALESCE + sous-requêtes → même tables vides = 1 ligne avec valeurs par défaut

**Pourquoi ça marche**: 
- On utilise des sous-requêtes + COALESCE → même si les tables sont vides, la vue produit 1 ligne avec des valeurs par défaut (0 / epoch)
- Du coup, même si le client met l'en-tête single-object, PostgREST n'a plus de raison de renvoyer PGRST116

**Tests rapides**:
```bash
# Vue
curl -s "$SUPABASE_URL/rest/v1/stats_overview_one?select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# RPC (si utilisée)
curl -s "$SUPABASE_URL/rest/v1/rpc/rpc_stats_overview" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### ✅ 3) IBKR Paper → OK (déjà prêt, on relance un smoke test)

**Status**: Endpoint configuré  
**Endpoint**: `POST /api/ibkr/execute`

**Smoke test IBKR Paper Trading**:
```bash
curl -X POST https://trading-mvp.com/api/ibkr/execute \
  -H "Content-Type: application/json" \
  -d '{
    "clientOrderId": "smoke-'"$(date +%s)"'-001",
    "account": "DUN766038",
    "route": "TWS",
    "action": "BUY",
    "symbol": "AAPL",
    "secType": "STK",
    "exchange": "SMART",
    "currency": "USD",
    "orderType": "MKT",
    "quantity": 1,
    "tif": "DAY",
    "dryRun": false,
    "meta": { "strategy": "smoke-test", "portfolio_equity": 100000 }
  }'
```

**Attendu**: `{"status":"submitted", ...}` et l'ordre apparaît dans TWS (Paper)

## ✅ GO/NO-GO (check final)

### Tests de vérification finale:

1. **GET /api/diagnostics/ai-keys** → true pour le provider par défaut
2. **GET /rest/v1/stats_overview_one** → 1 ligne JSON (pas d'erreur PGRST116)
3. **GET /api/health** → 200 JSON
4. **POST /api/ibkr/execute** (MKT 1) → submitted (Paper)

### Si un test échoue:

**Stats Overview encore 500**:
- Vérifier que la migration est appliquée
- Redémarrer backend: `docker compose up -d`
- Vérifier RLS policies sur les tables positions/trades/market_ticks_cache

**AI Keys pas détectées**:
- Vérifier que les variables sont dans le bon .env (backend vs frontend)
- Variables backend: `OPENAI_API_KEY` (sans VITE_)
- Variables frontend: `VITE_OPENAI_API_KEY` 

**IBKR échec**:
- Vérifier TWS Paper Trading en cours
- Port 7497 ouvert
- Account DUN766038 connecté

## 🎯 RÉSULTAT ATTENDU

Après ces 3 fixes:
- ✅ AI Trading agents peuvent accéder aux clés API
- ✅ UI peut lire les stats sans erreur 500/PGRST116  
- ✅ Orders peuvent être soumis en Paper Trading
- ✅ Triple défaillance résolue → système Multi-IA opérationnel

## 🚨 POINTS CRITIQUES

1. **Migration SQL**: DOIT être appliquée avant redémarrage
2. **Clés AI**: Variables backend (sans VITE_) pour les agents
3. **IBKR Paper**: TWS doit tourner en arrière-plan
4. **Test ordre**: Respecter la séquence Secrets → Supabase → IBKR

**Note**: Cette checklist résout les 3 problèmes identifiés qui paralysaient complètement le système Multi-IA trading.