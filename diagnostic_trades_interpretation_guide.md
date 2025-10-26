# 🔍 GUIDE D'INTERPRÉTATION - DIAGNOSTIC TRADES MONITORING

## 📋 MODE D'EMPLOI

### 1. Exécution des Scripts

**Bash (Linux/Mac) :**
```bash
chmod +x diagnostic_trades_manual.sh
./diagnostic_trades_manual.sh
```

**PowerShell (Windows) :**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\diagnostic_trades_manual.ps1
```

### 2. Lecture des Résultats

Chaque test affiche un statut :
- ✅ **OK** : Fonctionnement normal
- ⚠️ **ATTENTION** : Problème non critique
- ❌ **KO** : Erreur critique
- ⏸️ **SKIP** : Test ignoré (dépendance échouée)

---

## 🔧 INTERPRÉTATION PAR ÉTAPE

### ÉTAPE 1 : TEST IBKR

#### Test 1.1 : Handshake IBKR
| Résultat | Signification | Action Requise |
|----------|---------------|----------------|
| ✅ OK | TWS/Gateway connecté et API activée | Continuer |
| ❌ KO (HTTP 404/500) | Serveur backend inaccessible | Vérifier URL, statut serveur |
| ❌ KO (Timeout) | Problème réseau ou serveur surchargé | Vérifier connectivité |
| ❌ KO (status≠"ok") | TWS fermé ou API désactivée | **CORRECTIF #1** |

**CORRECTIF #1 - TWS/Gateway :**
1. Ouvrir TWS ou IB Gateway
2. Aller dans Settings → API → Settings
3. Cocher "Enable ActiveX and Socket Clients"
4. Port : 7497 (Paper) ou 7496 (Live)
5. Trusted IP : 127.0.0.1
6. Redémarrer la connexion

#### Test 1.2 : Récupération Fills
| Résultat | Signification | Action Requise |
|----------|---------------|----------------|
| ✅ OK (fills > 0) | Exécutions détectées par IBKR | Continuer |
| ⚠️ ATTENTION (fills = 0) | Aucune exécution récente | Vérifier `IBKR_READ_ONLY` |
| ❌ KO | API fills non accessible | Vérifier route backend |

**CORRECTIF #2 - IBKR_READ_ONLY :**
```bash
# Dans votre fichier .env
IBKR_READ_ONLY=false
```

### ÉTAPE 2 : TEST BACKEND

#### Logs d'Exécution
| Résultat | Signification | Action Requise |
|----------|---------------|----------------|
| ✅ OK | Backend journalise les ordres | Continuer |
| ⚠️ ATTENTION (logs vides) | Aucun ordre traité récemment | Vérifier activité trading |
| ❌ KO (404) | Route `/execute/logs` manquante | **CORRECTIF #3** |

**CORRECTIF #3 - Backend Logs :**
1. Vérifier que la route existe dans votre API
2. Redémarrer le service backend
3. Vérifier les logs applicatifs pour erreurs

### ÉTAPE 3 : TEST SUPABASE (MANUEL)

#### Requêtes SQL à Exécuter

```sql
-- 1. Compter les ordres
SELECT COUNT(*) as orders_count FROM trading.orders;

-- 2. Compter les fills  
SELECT COUNT(*) as fills_count FROM trading.fills;

-- 3. Vérifier vue
SELECT to_regclass('trading.v_orders_current_status') as vue_exists;

-- 4. Diagnostic récent (optionnel)
SELECT COUNT(*) as recent_orders 
FROM trading.orders 
WHERE created_at >= now() - interval '1 hour';
```

#### Interprétation des Compteurs

| orders_count | fills_count | vue_exists | Diagnostic | Action |
|--------------|-------------|------------|------------|--------|
| > 0 | > 0 | trading.v_orders_current_status | ✅ DB OK | Continuer |
| 0 | 0 | Non NULL | ❌ Backend n'écrit pas | **CORRECTIF #4** |
| > 0 | 0 | Non NULL | ⚠️ Fills manquants | **CORRECTIF #5** |
| > 0 | > 0 | NULL | ⚠️ Vue manquante | **CORRECTIF #6** |

**CORRECTIF #4 - Backend DB :**
- Vérifier les triggers d'insertion
- Contrôler les permissions Supabase
- Examiner les logs de l'API backend

**CORRECTIF #5 - Ingestion Fills :**
- Vérifier les callbacks `execDetails` IBKR
- Contrôler les triggers `trading.fills`
- Examiner la synchronisation orders → fills

**CORRECTIF #6 - Vue Manquante :**
```sql
-- Recréer la vue si nécessaire
CREATE OR REPLACE VIEW trading.v_orders_current_status AS
SELECT o.*, f.fill_price, f.fill_qty
FROM trading.orders o
LEFT JOIN trading.fills f ON o.order_id = f.order_id;
```

### ÉTAPE 4 : TEST FRONTEND

#### API Metrics
| Résultat | Signification | Action Requise |
|----------|---------------|----------------|
| ✅ OK (count > 0) | Monitoring affiche les trades | Vérifier UI |
| ⚠️ ATTENTION (count = 0) | API ne trouve pas les trades | **CORRECTIF #7** |
| ❌ KO (404/500) | Endpoint metrics défaillant | **CORRECTIF #8** |

**CORRECTIF #7 - API Query :**
Vérifier que `/api/metrics/trades/count` lit bien :
- `trading.fills` (recommandé)
- Ou `trading.v_orders_current_status`
- Et non `public.positions` (incorrect)

**CORRECTIF #8 - Endpoint Metrics :**
1. Vérifier la route dans votre API
2. Contrôler les permissions Supabase RLS
3. Tester la requête SQL directement

---

## 🚨 TABLEAU DE DIAGNOSTIC RAPIDE

### Scénarios Fréquents

| Symptômes | Cause Probable | Correctif Prioritaire |
|-----------|----------------|----------------------|
| IBKR KO, tout le reste SKIP | TWS fermé | Ouvrir TWS + Enable API |
| IBKR OK, Backend KO, DB vide | Route backend manquante | Vérifier `/execute/logs` |
| IBKR OK, Backend OK, DB vide | Triggers DB défaillants | Contrôler permissions RLS |
| IBKR OK, DB pleine, Frontend 0 | Mauvaise requête API | Corriger `/metrics/trades/count` |
| Tout OK, UI n'affiche rien | Cache ou refresh UI | Vider cache navigateur |

### Actions d'Urgence

**Si IBKR KO :**
1. Redémarrer TWS/Gateway
2. Vérifier port 7497 ouvert
3. Contrôler `IBKR_READ_ONLY=false`

**Si DB vide :**
1. Contrôler RLS policies Supabase
2. Vérifier logs backend pour erreurs
3. Tester insertion manuelle

**Si Frontend 0 :**
1. Tester `/api/metrics/trades/count` directement
2. Vérifier requête SQL sous-jacente
3. Contrôler permissions API

---

## 📊 FORMAT JSON FINAL

Après avoir complété les tests manuels Supabase, vous devriez obtenir :

```json
{
  "ibkr_connection": "OK",
  "fills_detected": 15,
  "orders_in_db": 42,
  "fills_in_db": 15,
  "frontend_trades_count": 12,
  "backend_logs_found": true,
  "probable_cause": "Synchronisation normale",
  "recommended_fix": "Aucun - système opérationnel"
}
```

### Validation Finale

**Système Sain :**
- `ibkr_connection = "OK"`
- `fills_detected > 0`
- `orders_in_db ≥ fills_in_db`
- `frontend_trades_count ≈ fills_detected` (±délai cache)

**Alertes :**
- Écart > 30% entre `fills_detected` et `frontend_trades_count`
- `orders_in_db = 0` avec `ibkr_connection = "OK"`
- Tous les compteurs à 0 (système inactif)

---

## 🔄 SURVEILLANCE CONTINUE

### Tests Périodiques
```bash
# Crontab - Test toutes les 30 minutes
*/30 * * * * /path/to/diagnostic_trades_manual.sh >> /var/log/trades_health.log
```

### Seuils d'Alerte
- **Critique** : `ibkr_connection = "KO"` > 5 minutes
- **Warning** : `frontend_trades_count = 0` > 10 minutes
- **Info** : Écart fills/frontend > 20%

### Escalade
1. **Niveau 1** : Redémarrage TWS
2. **Niveau 2** : Redémarrage backend API  
3. **Niveau 3** : Vérification manuelle Supabase
4. **Niveau 4** : Intervention développeur

---

**📌 Point Important :** Ce diagnostic teste la chaîne complète mais ne corrige pas automatiquement. Utilisez les correctifs proposés selon votre environnement spécifique.