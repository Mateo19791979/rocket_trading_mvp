# IBKR Bridge Backend

Backend microservice Node.js pour Interactive Brokers Gateway/TWS API intégration.

## 🎯 Objectif

Microservice qui se connecte à **IB Gateway/TWS** pour exposer des endpoints REST et WebSocket:
- Passer des **ordres** (paper ou live selon la passerelle)
- Lire **positions** et **PnL** en temps réel
- Gérer un **mode dégradé** si la connexion IB est indisponible
- Appliquer des **garde-fous de risque** basiques (taille max, marché ouvert)

## 📋 Prérequis

### Interactive Brokers Setup

1. **Compte Interactive Brokers**
   - Compte actif avec permissions API
   - TWS ou IB Gateway installé

2. **IB Gateway/TWS Configuration**
   - Port **7497** pour Paper Trading (recommandé pour tests)
   - Port **7496** pour Live Trading
   - API activée dans les paramètres
   - Client ID unique configuré (défaut: 42)

3. **Ports et Configuration**
   ```
   Paper Trading: localhost:7497
   Live Trading:  localhost:7496
   ```

### Installation Node.js

- Node.js >= 18.0.0
- npm ou yarn

## 🚀 Installation

1. **Cloner et installer**
   ```bash
   cd backend
   npm install
   ```

2. **Configuration environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos paramètres
   ```

3. **Démarrer IB Gateway/TWS**
   - Lancer IB Gateway ou TWS
   - S'assurer que l'API est activée
   - Vérifier le port (7497 pour paper, 7496 pour live)

4. **Démarrer le service**
   ```bash
   npm start
   # ou pour développement
   npm run dev
   ```

## ⚙️ Configuration (.env)

```bash
# Serveur
PORT=8080
NODE_ENV=development

# CORS
CORS_ORIGIN=https://trading.mvp.com

# Interactive Brokers
IB_HOST=127.0.0.1
IB_PORT=7497                # 7497=paper, 7496=live
IB_CLIENT_ID=42

# Gestion de risque
MAX_ORDER_VALUE_CHF=50000
ALLOW_MARKET_ORDERS=false

# Logging
LOG_LEVEL=info
```

## 📡 API Endpoints

### Health & Status
- `GET /health` - État du service et connexion IB
- `GET /ib/handshake` - Test de connectivité IB
- `GET /market/status?ex=NYSE|SIX` - Statut marché (ouvert/fermé)

### Trading
- `POST /orders` - Placer un ordre
- `GET /orders/:id` - Statut d'un ordre
- `GET /positions` - Liste des positions
- `GET /pnl` - PnL en temps réel

### WebSocket
- `ws://localhost:8080/ws/ib` - Connexion temps réel
  - Events: `orderStatus`, `execDetails`, `pnlUpdate`, `connectionChanged`

## 🧪 Tests rapides (curl)

### 1. Test de connectivité
```bash
curl http://localhost:8080/health
curl http://localhost:8080/ib/handshake
```

### 2. Statut marché
```bash
curl "http://localhost:8080/market/status?ex=NYSE"
curl "http://localhost:8080/market/status?ex=SIX"
```

### 3. Passer un ordre (LIMIT)
```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "side": "BUY",
    "qty": 100,
    "type": "LIMIT",
    "limit": 150.50,
    "tif": "DAY"
  }'
```

### 4. Consulter positions et PnL
```bash
curl http://localhost:8080/positions
curl http://localhost:8080/pnl
```

## 🔌 WebSocket Usage

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/ib');

ws.on('open', () => {
  console.log('Connected to IBKR Bridge');
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Event:', message.event, 'Data:', message.data);
});

// Keep-alive ping
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
```

## 🛡️ Sécurité & Qualité

### Garde-fous de risque
- **Taille maximale d'ordre**: `MAX_ORDER_VALUE_CHF` (défaut: 50,000 CHF)
- **Ordres au marché**: Désactivés par défaut (`ALLOW_MARKET_ORDERS=false`)
- **Heures de marché**: Vérification basique ouvert/fermé

### Sécurité
- **CORS** restreint aux origines autorisées
- **Rate limiting** : 60 req/min/IP
- **Validation stricte** des données avec Zod
- **Headers sécurisés** avec Helmet

### Mode dégradé
- **Positions/PnL**: Retour cache ou données vides si IB offline
- **Ordres**: Erreur 503 avec message explicite
- **WebSocket**: Notification de déconnexion

## 📁 Structure du projet

```
backend/
├── lib/
│   ├── ibClient.js          # Client IB principal
│   └── marketStatus.js      # Calcul statut marché
├── middleware/
│   ├── errorHandler.js      # Gestion d'erreurs
│   └── validation.js        # Validation Zod
├── routes/
│   ├── health.js           # Health check
│   ├── ib.js              # Endpoints IB
│   ├── market.js          # Statut marché
│   ├── orders.js          # Gestion ordres
│   ├── positions.js       # Positions
│   └── pnl.js            # PnL
├── websocket/
│   └── websocketServer.js  # Serveur WebSocket
├── server.js              # Point d'entrée principal
├── package.json
├── .env.example
└── README.md
```

## 🚨 Troubleshooting

### Erreurs communes

1. **"Not connected to IB Gateway/TWS"**
   - Vérifier que IB Gateway/TWS est lancé
   - Contrôler les ports (7497/7496)
   - Tester avec `/ib/handshake`

2. **"Market orders are disabled"**
   - Configurer `ALLOW_MARKET_ORDERS=true` dans .env
   - Ou utiliser des ordres LIMIT

3. **"Rate limit exceeded"**
   - Attendre 1 minute ou redémarrer le service
   - Ajuster `windowMs` dans server.js

4. **CORS Errors**
   - Vérifier `CORS_ORIGIN` dans .env
   - Ajouter votre domaine frontend

### Logs utiles

```bash
# Surveiller les logs en temps réel
npm start | grep -E "(Connected|Error|Order)"

# Logs de connexion IB
npm start | grep "IB"

# Logs WebSocket
npm start | grep "WebSocket"
```

## 🔄 Mode Development vs Production

### Development
```bash
NODE_ENV=development
IB_PORT=7497  # Paper trading
LOG_LEVEL=debug
```

### Production
```bash
NODE_ENV=production
IB_PORT=7496  # Live trading (attention!)
LOG_LEVEL=info
# + certificats SSL
# + reverse proxy (nginx)
# + monitoring
```

## 📈 Monitoring & Performance

- **Health endpoint**: `/health` pour monitoring
- **Logs JSON**: Format structuré pour parsing
- **WebSocket clients**: Compteur de connexions
- **Order cache**: Suivi des ordres en mémoire

## ⚡ Performance Tips

1. **Connection persistante**: IB client reste connecté
2. **WebSocket pooling**: Gestion multi-clients
3. **Cache positions**: Mise à jour événementielle
4. **Rate limiting**: Protection contre spam

---

**🎯 Ready to Trade!** 

Le service est maintenant prêt pour l'intégration avec votre frontend React et la connexion à Interactive Brokers Gateway.