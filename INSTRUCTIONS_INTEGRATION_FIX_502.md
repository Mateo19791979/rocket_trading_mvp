# FIX-502 TOOLKIT — trading-mvp.com
## Instructions d'intégration complètes pour Rocketnew

### Objectif
Éliminer définitivement les erreurs 502 sur trading-mvp.com sans créer de nouvelles pages, en sécurisant la SPA React.

---

## 📋 ÉTAPE A — Déploiement des fichiers

### 1. Scripts de diagnostic et test
```bash
# Placer et rendre exécutables les scripts
chmod +x scripts/diagnose_502.sh
chmod +x scripts/reload_and_test.sh
```

### 2. Configuration mise à jour
- `docker-compose.yml` : Formatage YAML corrigé (ports, labels)
- `traefik/dynamic.yml` : Middleware SPA fallback anti-502 renforcé
- `nginx/conf.d/trading-mvp.conf` : Configuration Nginx de référence (si migration depuis Traefik)

---

## 📋 ÉTAPE B — Variables d'environnement et exécution

### Variables à définir
```bash
export PROXY_URL="https://trading-mvp.com"
export APP_HOST="mvp-frontend"        # nom du service Docker
export APP_PORT="80" 
export FALLBACK_DIR="/usr/share/nginx/html"
export LETSENCRYPT_EMAIL="admin@trading-mvp.com"
```

### Diagnostic initial
```bash
./scripts/diagnose_502.sh
```

### Correction et test
```bash
# Après correction des problèmes détectés
./scripts/reload_and_test.sh
```

---

## ⚙️ ÉTAPE C — Points de vérification obligatoires

### ✅ Check-list pré-déploiement
- [ ] Upstream répond en 200 sur `http://mvp-frontend:80`
- [ ] Traefik labels correctement configurés dans docker-compose.yml
- [ ] Middleware `spa-fallback@file` actif dans dynamic.yml
- [ ] Redirection unique 301 vers `https://trading-mvp.com`
- [ ] Container `mvp-frontend` contient `/usr/share/nginx/html/index.html`

### 🔧 Vérifications techniques
```bash
# 1. Test containers actifs
docker ps | grep -E "(mvp-traefik|mvp-frontend|mvp-api)"

# 2. Test upstream direct
curl -I http://mvp-frontend:80  # Depuis le réseau Docker

# 3. Test fallback SPA
docker exec mvp-frontend ls -la /usr/share/nginx/html/index.html

# 4. Test proxy public
curl -I https://trading-mvp.com
```

---

## 🎯 ÉTAPE D — Critères d'acceptation Go/No-Go

### ✅ GO si TOUS les critères sont respectés

#### 1. Test principal
```bash
curl -I https://trading-mvp.com
# DOIT retourner : HTTP/2 200
```

#### 2. Test SPA routing
```bash
curl -I https://trading-mvp.com/unified?module=trading&view=positions
# DOIT retourner : HTTP/2 200 (pas de 404/502)
```

#### 3. Test redirection canonique
```bash
curl -I http://trading-mvp.com
# DOIT retourner : HTTP/1.1 301 → Location: https://trading-mvp.com
```

#### 4. Logs propres
```bash
docker logs mvp-traefik --tail 20
# NE DOIT PAS contenir : "upstream prematurely closed connection"
# NE DOIT PAS contenir : "connect() failed"
```

#### 5. Stabilité après restart
```bash
docker-compose restart traefik frontend
sleep 10
curl -I https://trading-mvp.com
# DOIT ENCORE retourner : HTTP/2 200
```

### ❌ NO-GO si UN seul critère échoue
- Relancer le diagnostic : `./scripts/diagnose_502.sh`
- Corriger le problème identifié
- Relancer les tests : `./scripts/reload_and_test.sh`

---

## 🚨 Remarques importantes

### Architecture actuelle
- **Reverse Proxy** : Traefik v3.0 (recommandé)
- **Frontend** : React SPA dans container Nginx
- **Fallback Strategy** : Middleware Traefik + error_page Nginx
- **Certificats** : Let's Encrypt automatique

### Gestion des erreurs 502
1. **Prévention** : Health checks + timeouts appropriés
2. **Détection** : Middleware `spa-fallback` intercepte 502/503/504
3. **Récupération** : Redirection automatique vers `/index.html`
4. **Monitoring** : Logs centralisés via Traefik

### Points critiques à ne PAS modifier
- ❌ Ne pas ajouter de nouvelles pages/routes
- ❌ Ne pas changer la logique de routage React existante  
- ❌ Ne pas désactiver les redirections automatiques React Navigate
- ✅ Garder UNE SEULE redirection côté proxy (pas de doublons)

---

## 🔄 Procédure de rollback d'urgence

En cas de problème critique :

```bash
# 1. Restaurer la configuration précédente
git checkout HEAD~1 -- docker-compose.yml traefik/dynamic.yml

# 2. Redémarrer les services
docker-compose up -d --force-recreate

# 3. Vérifier le retour à la normale
curl -I https://trading-mvp.com
```

---

**✅ SUCCÈS ATTENDU** : `curl -I https://trading-mvp.com` retourne `HTTP/2 200` de manière consistante, et l'accès direct à `/unified?module=trading&view=positions` charge l'application sans erreur 502.