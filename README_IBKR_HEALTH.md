# IBKR Health Check System

Un système complet de monitoring de la connexion Interactive Brokers (IBKR) intégré à votre plateforme de trading MVP.

## 🚀 Vue d'ensemble

Ce système fournit une surveillance en temps réel de votre connexion IBKR avec:
- **Vérification Gateway**: Connexion au serveur TWS/IB Gateway
- **Authentification**: Vérification des comptes gérés
- **Accès Account**: Récupération des données de compte (liquidité, cash)  
- **Market Data**: Test d'accès aux données de marché (EURUSD gratuit)

## 📁 Structure du Système

```
├── ibkr_health.py                     # Serveur FastAPI Python
├── src/services/ibkrHealthService.js  # Service React pour l'API
├── src/components/ui/IBKRHealthBadges.jsx # Composant d'affichage
└── README_IBKR_HEALTH.md             # Cette documentation
```

## ⚙️ Installation & Configuration

### 1. Dépendances Python

```bash
# Installer les dépendances requises
pip install ib-insync fastapi uvicorn
```

### 2. Variables d'Environnement

Configurez les variables pour la connexion IBKR:

```bash
# Configuration IBKR (exemples pour Paper Trading)
export IB_HOST=127.0.0.1          # Host TWS/IB Gateway
export IB_PORT=7497               # 7497=Paper, 7496=Live
export IB_CLIENT_ID=11            # ID client unique
export IB_ACCOUNT=DU1234567       # Optionnel: filtre de compte
export MARKET_TEST_SYMBOL=EURUSD  # Symbole pour test market data

# Configuration serveur
export PORT=8081                  # Port du serveur de health check
```

### 3. Configuration Frontend React

Ajoutez dans votre `.env`:

```bash
VITE_IBKR_HEALTH_URL=http://localhost:8081
```

## 🔧 Lancement du Système

### Étape 1: Démarrer TWS/IB Gateway

1. Lancez TWS ou IB Gateway
2. Activez l'API Socket dans Configuration > API > Settings
3. Vérifiez que le port correspond à votre configuration (7497 pour Paper)

### Étape 2: Démarrer le Service Health Check

```bash
# Méthode 1: Direct
python ibkr_health.py

# Méthode 2: Avec uvicorn
uvicorn ibkr_health:app --host 0.0.0.0 --port 8081 --reload
```

### Étape 3: Vérifier l'Intégration

Le système s'intègre automatiquement dans votre dashboard principal (`/dashboard`) avec:
- **Section principale**: Badges détaillés avec bouton de reconnexion
- **Sidebar**: Version compacte pour monitoring rapide

## 🎯 Endpoints API

### GET /health/ibkr
Retourne le statut complet de la connexion IBKR.

**Réponse Success (200/207):**
```json
{
  "gateway": {
    "ok": true,
    "message": "connected",
    "serverTime": "2025-01-08 14:30:45"
  },
  "auth": {
    "ok": true,
    "message": "ok",
    "accounts": ["DU1234567"]
  },
  "account": {
    "ok": true,
    "message": "ok",
    "summary": {
      "NetLiquidation": {"value": "10000.00", "currency": "USD"},
      "TotalCashValue": {"value": "5000.00", "currency": "USD"}
    },
    "accountFilter": null
  },
  "marketData": {
    "ok": true,
    "message": "ok",
    "data": {
      "symbol": "EURUSD",
      "last": 1.0234,
      "bid": 1.0233,
      "ask": 1.0235
    }
  },
  "meta": {
    "host": "127.0.0.1",
    "port": 7497,
    "clientId": 11,
    "ts": 1736339445,
    "mode": "paper"
  }
}
```

**Réponse Error (503):**
```json
{
  "error": "Connexion IB échouée (check TWS/Gateway, port, API enable)",
  "hint": "Vérifiez TWS/IB Gateway (API enabled, port), pare-feu, abonnements market data."
}
```

### POST /health/ibkr/reconnect
Force une reconnexion au serveur IBKR.

**Réponse Success:**
```json
{
  "ok": true,
  "message": "reconnected",
  "host": "127.0.0.1",
  "port": 7497
}
```

## 🎨 Interface Utilisateur

### Badges de Statut

L'interface affiche 4 badges colorés:

1. **Gateway** 🟢 - Connexion au serveur
   - ✅ Vert: Connecté
   - ❌ Rouge: Échec de connexion

2. **Auth** 🟢 - Authentification  
   - ✅ Vert: Authentifié avec comptes
   - ❌ Rouge: Échec d'authentification

3. **Account** 🟡 - Accès aux données de compte
   - ✅ Vert: Données disponibles
   - ⚠️ Jaune: Permissions limitées
   - ❌ Rouge: Aucun accès

4. **Market Data** 🟡 - Accès aux données de marché
   - ✅ Vert: Données temps réel
   - ⚠️ Jaune: Données limitées/retardées
   - ❌ Rouge: Aucune donnée

### Bouton de Reconnexion

Un bouton "Reconnect" permet de relancer la connexion IBKR sans redémarrer le service.

## 🔍 Diagnostic & Dépannage

### Problèmes Courants

**1. "Service Unavailable"**
- Le serveur Python n'est pas démarré
- Port incorrect dans la configuration
- Problème de pare-feu

**2. "Connexion IB échouée"**
- TWS/IB Gateway non démarré
- API Socket non activée
- Port incorrect (7497 vs 7496)
- Client ID déjà utilisé

**3. "No managed accounts"**
- Problème d'authentification TWS
- Compte non configuré correctement
- Session TWS expirée

**4. "No data (market-data subscription?)"**
- Abonnement market data requis pour certains symboles
- Utilisation de EURUSD recommandée (gratuit dans la plupart des régions)
- Connexion en mode paper sans abonnements

### Tests de Diagnostic

```bash
# Test de connectivité serveur
curl -I http://localhost:8081/health/ibkr

# Test complet avec réponse
curl http://localhost:8081/health/ibkr

# Test de reconnexion
curl -X POST http://localhost:8081/health/ibkr/reconnect
```

### Logs de Debug

Le serveur Python affiche des logs détaillés pour le diagnostic:

```bash
# Lancer avec logs verbeux
uvicorn ibkr_health:app --host 0.0.0.0 --port 8081 --log-level debug
```

## 🔄 Intégration Continue

### Auto-Refresh

Le système se met à jour automatiquement toutes les 30 secondes. Configurable via:

```jsx
<IBKRHealthBadges 
  refreshInterval={30000}  // millisecondes
/>
```

### Notifications

En cas de perte de connexion, le système:
- Affiche des badges d'erreur rouge
- Propose un bouton de reconnexion
- Maintient l'historique des erreurs

## 🚦 États du Système

| État | Description | Action Recommandée |
|------|-------------|-------------------|
| 🟢 **Healthy** | Tous les services opérationnels | Aucune |
| 🟡 **Degraded** | Connexion partielle | Vérifier les permissions |
| 🔴 **Error** | Panne majeure | Redémarrer TWS/Gateway |
| ⚪ **Unknown** | Service indisponible | Vérifier la configuration |

## 📈 Monitoring Production

Pour un environnement de production:

1. **Supervision Continue**: Intégrez avec votre système de monitoring
2. **Alertes**: Configurez des alertes sur les échecs de connexion
3. **Logs Centralisés**: Redirigez les logs vers votre système central
4. **High Availability**: Considérez un cluster pour la redondance

## 🔐 Sécurité

- **Read-Only**: Connexion en lecture seule par défaut
- **Isolation**: Le service ne peut pas passer d'ordres
- **Timeout**: Timeouts stricts pour éviter les blocages
- **Error Handling**: Gestion sécurisée des erreurs

---

**🎯 Résultat**: Un système de monitoring IBKR intégré, temps réel, et prêt pour la production, sans créer de nouvelles pages dans votre interface utilisateur.