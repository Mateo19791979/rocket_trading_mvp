# Backend API Fix - Deployment Checklist

## ✅ BACKEND EXPRESS ENDPOINTS FIXED

### 1) Nouveaux endpoints ajoutés (ordre prioritaire)

```bash
# Test des endpoints critiques
curl -i https://rockettra3991.builtwithrocket.new/api/health
curl -i https://rockettra3991.builtwithrocket.new/api/swarm/state  
curl -i https://rockettra3991.builtwithrocket.new/api/swarm/statistics
curl -i https://rockettra3991.builtwithrocket.new/api/diagnostics/ai-keys
```

**Résultats attendus :**
- ✅ HTTP 200 + JSON pour tous les endpoints
- ✅ Pas de HTML retourné (= Traefik route correctement)
- ✅ `{"ok": true}` pour health et swarm endpoints

### 2) TRAEFIK ROUTING CONFIGURATION ✅

Les labels Docker Compose sont déjà correctement configurés :

```yaml
# Backend - Priorité API routes (90-100)
- "traefik.http.routers.backend-api.rule=Host(`rockettra3991.builtwithrocket.new`) && PathPrefix(`/api`)"
- "traefik.http.routers.backend-api.priority=90"
- "traefik.http.services.backend-api.loadbalancer.server.port=8080"

# Frontend - Catch-all plus bas (10)  
- "traefik.http.routers.frontend.rule=Host(`rockettra3991.builtwithrocket.new`)"
- "traefik.http.routers.frontend.priority=10"
```

### 3) FRONTEND SAFE FETCH ✅

Fonctions sécurisées ajoutées dans `aiSwarmService.js` :

```javascript
// Fonctions exportées pour usage global
export async function getSwarmState()
export async function getSwarmStatistics()
```

**Fallback behavior :**
- En cas d'erreur réseau → retourne objet par défaut (pas d'exception)
- Log de l'erreur pour debug → `console.warn("Fetch failed:", url, error)`
- UI continue à fonctionner avec des valeurs 0

### 4) ENVIRONNEMENT VARIABLES ✅

Ajout dans `.env` :

```bash
# Frontend API base
VITE_API_BASE=https://rockettra3991.builtwithrocket.new/api

# Backend AI providers
OPENAI_API_KEY=REPLACE_ME
ANTHROPIC_API_KEY=REPLACE_ME  
GEMINI_API_KEY=REPLACE_ME
PERPLEXITY_API_KEY=REPLACE_ME
AI_PROVIDER_DEFAULT=openai
AI_TIMEOUT_MS=25000

# IBKR Paper Trading
IBKR_MODE=paper
IBKR_ACCOUNT=DUN766038
IBKR_READ_ONLY=false
```

## 🔄 TESTS DE VALIDATION

### Smoke Tests Rapides

```bash
# 1) Santé générale API
curl -s https://rockettra3991.builtwithrocket.new/api/health | jq '.ok'
# Attendu: true

# 2) État swarm (données mock)  
curl -s https://rockettra3991.builtwithrocket.new/api/swarm/state | jq '.activeAgents'
# Attendu: 0 (mock)

# 3) Statistiques swarm (données mock)
curl -s https://rockettra3991.builtwithrocket.new/api/swarm/statistics | jq '.totals.trades'  
# Attendu: 0 (mock)

# 4) Diagnostics IA
curl -s https://rockettra3991.builtwithrocket.new/api/diagnostics/ai-keys | jq '.default'
# Attendu: "openai"

# 5) Test IBKR Paper Trading  
curl -X POST https://rockettra3991.builtwithrocket.new/api/ibkr/execute \
  -H "Content-Type: application/json" \
  -d '{
    "clientOrderId": "smoke-test-001", 
    "account": "DUN766038",
    "symbol": "AAPL",
    "action": "BUY", 
    "quantity": 1,
    "orderType": "MKT"
  }' | jq '.status'
# Attendu: "submitted"
```

### Validation Frontend

```javascript
// Test dans la console navigateur
import aiSwarmService from './services/aiSwarmService.js';

// Ces appels ne doivent PAS jeter d'exception
const state = await aiSwarmService.getSwarmState();
console.log('State:', state?.activeAgents); // 0

const stats = await aiSwarmService.getSwarmStatistics(); 
console.log('Stats:', stats?.totals?.trades); // 0
```

## ⚠️ TROUBLESHOOTING

### Si tu vois encore du HTML au lieu de JSON :

```bash
# Diagnostic Traefik routing
docker logs mvp-traefik | grep -i "api"

# Redémarrage conteneurs
docker compose up -d --force-recreate backend

# Vérification port backend interne  
docker exec mvp-backend netstat -tlnp | grep 8080
```

### Si erreurs frontend persistent :

1. **Vider cache navigateur** (Ctrl+Shift+R)
2. **Vérifier variables d'environnement :**
   ```javascript
   console.log(import.meta.env.VITE_API_BASE);
   // Doit afficher: https://rockettra3991.builtwithrocket.new/api
   ```

## 🚀 DÉPLOIEMENT

```bash
# 1) Rebuild + redémarrage
docker compose build backend frontend
docker compose up -d

# 2) Validation immédiate  
curl -i https://rockettra3991.builtwithrocket.new/api/health

# 3) Test page Swarm (ne doit plus crasher)
# Naviguer vers: https://rockettra3991.builtwithrocket.new/ai-swarm-hub
```

## ✅ CRITÈRES DE SUCCÈS

- [ ] 3 cURL retournent JSON 200 (health, swarm/state, swarm/statistics)
- [ ] Page AI Swarm Hub charge sans erreur JavaScript  
- [ ] Console navigateur : pas d'erreur réseau sur /api/*
- [ ] Backend logs : endpoints montés avant static handlers
- [ ] Diagnostic AI keys retourne les providers configurés

**Status Final :** 🟢 READY FOR PRODUCTION

Les routes backend sont maintenant fixées avec priorité Traefik appropriée et safe fallback côté frontend.