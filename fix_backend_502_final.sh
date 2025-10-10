#!/bin/bash
set -euo pipefail

# ==============================================================================
# 🚀 TRADING MVP - 502 BACKEND FIX FINAL
# ==============================================================================
# Diagnose et corrige tous les problèmes 502 du backend API
# Compatible Docker, Traefik, et production ready

echo "🔧 [TRADING MVP] Diagnostic complet backend 502..."

# Variables configuration
DOMAIN="${DOMAIN:-trading-mvp.com}"
API_CONTAINER="mvp-api"
FRONTEND_CONTAINER="mvp-frontend"
TRAEFIK_CONTAINER="mvp-traefik"
REDIS_CONTAINER="mvp-redis"

# ==============================================================================
# 1. DIAGNOSTIC CONTAINERS ET SERVICES
# ==============================================================================
echo "📊 [1/7] Diagnostic état containers..."

# Vérification containers Docker
for container in $API_CONTAINER $FRONTEND_CONTAINER $TRAEFIK_CONTAINER $REDIS_CONTAINER; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*Up"; then
        echo "✅ Container $container: RUNNING"
    else
        echo "❌ Container $container: DOWN"
        if docker ps -a --format "table {{.Names}}\t{{.Status}}"| grep -q "$container"; then echo"   🔄 Redémarrage du container $container..."
            docker restart "$container" || true
        else
            echo "   ⚠️  Container $container n'existe pas - rebuild nécessaire"
        fi
    fi
done

# ==============================================================================
# 2. VÉRIFICATION LOGS ET ERREURS
# ==============================================================================
echo "📋 [2/7] Analyse logs containers..."

# Logs API container (dernières erreurs)
if docker ps --format "{{.Names}}" | grep -q "$API_CONTAINER"; then
    echo "=== LOGS API (dernières 20 lignes) ==="
    docker logs --tail=20 "$API_CONTAINER"2>&1 || echo "⚠️ Pas de logs API disponibles" echo""
fi

# Logs Traefik (erreurs proxy)
if docker ps --format "{{.Names}}" | grep -q "$TRAEFIK_CONTAINER"; then
    echo "=== LOGS TRAEFIK (erreurs backend) ==="
    docker logs --tail=10 "$TRAEFIK_CONTAINER"2>&1 | grep -i "error\|502\|backend" || echo "✅ Pas d'erreurs proxy détectées" echo""
fi

# ==============================================================================
# 3. TESTS CONNECTIVITY INTERNE
# ==============================================================================
echo "🔌 [3/7] Test connectivité interne Docker..."

# Test direct API container
if docker ps --format "{{.Names}}" | grep -q "$API_CONTAINER"; then
    echo "⚡ Test direct API container (port 3000)..."
    API_HEALTH=$(docker exec "$API_CONTAINER" curl -sf http://localhost:3000/api/health 2>/dev/null || echo "FAIL")
    if [ "$API_HEALTH" != "FAIL" ]; then
        echo "✅ API interne répond: $API_HEALTH"
    else
        echo "❌ API interne ne répond pas" echo"🔄 Tentative redémarrage API..."
        docker restart "$API_CONTAINER"
        sleep 5
    fi
fi

# Test Redis connectivity
if docker ps --format "{{.Names}}" | grep -q "$REDIS_CONTAINER"; then
    echo "⚡ Test Redis connectivity..."
    REDIS_PING=$(docker exec "$REDIS_CONTAINER" redis-cli ping 2>/dev/null || echo "FAIL")
    if [ "$REDIS_PING" = "PONG" ]; then
        echo "✅ Redis opérationnel"
    else
        echo "❌ Redis problème - redémarrage..."
        docker restart "$REDIS_CONTAINER"
        sleep 3
    fi
fi

# ==============================================================================
# 4. CORRECTION DOCKER-COMPOSE ET LABELS
# ==============================================================================
echo "⚙️ [4/7] Correction configuration Docker Compose..."

# Sauvegarde docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup.$(date +%s)

# Correction Docker Compose avec labels Traefik fixes
cat > docker-compose.yml << 'COMPOSE_EOF'
version: "3.9"

networks:
  web:
    external: false

services:
  traefik:
    image: traefik:v3.0
    container_name: mvp-traefik
    command:
      - --api.dashboard=true
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.file.filename=/etc/traefik/dynamic.yml
      - --providers.file.watch=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=${LETSENCRYPT_EMAIL:-admin@trading-mvp.com}
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge=true
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
      - --accesslog=true
      - --log.level=INFO
    ports:
      - "80:80" -"443:443"
    volumes:
      - traefik_letsencrypt:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/dynamic.yml:/etc/traefik/dynamic.yml:ro
    networks: [web]
    labels:
      - "traefik.enable=true" -"traefik.http.routers.http-catchall.rule=HostRegexp(`{any:.+}`)" -"traefik.http.routers.http-catchall.entrypoints=web" -"traefik.http.routers.http-catchall.middlewares=redirect-to-https@docker" -"traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https" -"traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_BASE_URL=https://${DOMAIN:-trading-mvp.com}/api
    container_name: mvp-frontend
    restart: unless-stopped
    networks: [web]
    labels:
      - "traefik.enable=true" -"traefik.http.routers.frontend.rule=Host(`${DOMAIN:-trading-mvp.com}`)" -"traefik.http.routers.frontend.entrypoints=websecure" -"traefik.http.routers.frontend.tls.certresolver=letsencrypt" -"traefik.http.services.frontend.loadbalancer.server.port=80"

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mvp-api
    restart: unless-stopped
    environment:
      - PORT=3000
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - INTERNAL_ADMIN_KEY=${INTERNAL_ADMIN_KEY}
      - REDIS_URL=redis://redis:6379
      - CORS_ORIGIN=https://${DOMAIN:-trading-mvp.com}
    networks: [web]
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "traefik.enable=true" -"traefik.http.routers.api.rule=Host(`${DOMAIN:-trading-mvp.com}`) && PathPrefix(`/api`)" -"traefik.http.routers.api.entrypoints=websecure" -"traefik.http.routers.api.tls.certresolver=letsencrypt" -"traefik.http.services.api.loadbalancer.server.port=3000" -"traefik.http.middlewares.api-strip.stripprefix.prefixes=/api" -"traefik.http.routers.api.middlewares=api-strip"

  redis:
    image: redis:7-alpine
    container_name: mvp-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
    volumes:
      - redis_data:/data
    networks: [web]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  traefik_letsencrypt:
  redis_data:
COMPOSE_EOF

echo "✅ Docker Compose corrigé"

# ==============================================================================
# 5. MISE À JOUR BACKEND SERVER.JS
# ==============================================================================
echo "🔧 [5/7] Mise à jour backend server.js..."

# Sauvegarde backend
cp backend/server.js backend/server.js.backup.$(date +%s)

# Server.js robuste avec health check
cat > backend/server.js << 'SERVER_EOF'
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS robuste
const allowedOrigins = [
  "https://trading-mvp.com",
  "https://api.trading-mvp.com",
  /\.builtwithrocket\.new$/,
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Vérifier contre les origines autorisées
    const isAllowed = allowedOrigins.some(allowed => 
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    );
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    console.log(`CORS blocked origin: ${origin}`);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path} from ${req.get('origin') || 'unknown'}`);
  next();
});

// Health check endpoint - CRITIQUE pour Traefik
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint simple
app.get('/api/test', (req, res) => {
  res.json({ message: 'API backend operational', timestamp: new Date().toISOString() });
});

// Montage des services existants
try {
  const { rlsHealth, rlsAutorepair } = require("./services/rlsRepairService");
  app.get("/api/security/rls/health", rlsHealth);
  app.post("/api/security/rls/repair", rlsAutorepair);
  console.log("✅ RLS services loaded");
} catch (error) {
  console.log("⚠️ RLS services not available:", error.message);
}

try {
  const { mountOpsRead } = require("./services/opsRead");
  mountOpsRead(app);
  console.log("✅ OpsRead services loaded");
} catch (error) {
  console.log("⚠️ OpsRead services not available:", error.message);
}

// Fallback 404 pour routes non trouvées
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    ok: false, 
    error: "route_not_found", 
    path: req.path,
    method: req.method
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(`Error on ${req.method} ${req.path}:`, err);
  res.status(err.status || 500).json({ 
    ok: false, 
    error: err.message || 'Internal server error',
    path: req.path
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Trading MVP API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
SERVER_EOF

echo "✅ Backend server.js mis à jour"

# ==============================================================================
# 6. DOCKERFILE BACKEND OPTIMISÉ
# ==============================================================================
echo "🐳 [6/7] Optimisation Dockerfile backend..."

mkdir -p backend
cat > backend/Dockerfile << 'DOCKERFILE_EOF'
FROM node:18-alpine

WORKDIR /app

# Installation curl pour healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
DOCKERFILE_EOF

echo "✅ Dockerfile backend optimisé"

# ==============================================================================
# 7. REDÉMARRAGE ET TESTS
# ==============================================================================
echo "🔄 [7/7] Redémarrage services et validation..."

# Stop tous les services
echo "⏹️ Arrêt des services..."
docker-compose down --remove-orphans 2>/dev/null || true

# Rebuild et restart
echo "🏗️ Rebuild et démarrage..."
docker-compose up -d --build

# Attendre démarrage
echo "⏳ Attente démarrage services (30s)..."
sleep 30

# Tests de validation
echo "🧪 Tests de validation..."

# Test 1: Health check direct API
echo "Test 1: API health check direct..."
HEALTH_DIRECT=$(curl -sf http://localhost:3000/api/health 2>/dev/null || echo "FAIL")
if [ "$HEALTH_DIRECT" != "FAIL" ]; then
    echo "✅ API direct: OK"
else
    echo "❌ API direct: FAIL"
fi

# Test 2: Health check via Traefik
echo "Test 2: API via Traefik..."
HEALTH_TRAEFIK=$(curl -sf "https://$DOMAIN/api/health" 2>/dev/null || echo "FAIL")
if [ "$HEALTH_TRAEFIK" != "FAIL" ]; then
    echo "✅ API via Traefik: OK"
else
    echo "❌ API via Traefik: FAIL - Vérifier certificats SSL"
fi

# Test 3: Frontend access
echo "Test 3: Frontend access..."
FRONTEND_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "https://$DOMAIN" 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: OK ($FRONTEND_STATUS)"
else
    echo "⚠️ Frontend: Status $FRONTEND_STATUS"
fi

# ==============================================================================
# RÉSUMÉ FINAL
# ==============================================================================
echo "" echo"🎯 RÉSUMÉ FINAL - Trading MVP Backend Fix" echo"==============================================" echo"✅ Docker Compose corrigé avec labels Traefik fixes" echo"✅ Backend server.js robuste avec health checks" echo"✅ Dockerfile optimisé avec curl et healthcheck" echo"✅ CORS configuré pour domaines production" echo"✅ Middleware de logging et error handling" echo"✅ Graceful shutdown et signaux système" echo"" echo"🌐 URLs à tester:" echo"   - Frontend: https://$DOMAIN" echo"   - API Health: https://$DOMAIN/api/health" echo"   - API Test: https://$DOMAIN/api/test" echo"" echo"📊 Commandes monitoring:" echo"   - docker-compose logs -f api" echo"   - docker-compose logs -f traefik" echo"   - docker ps" echo""

# Affichage status containers final
echo "📋 Status final containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" echo"" echo"🚀 Fix 502 backend terminé!" echo"Si problèmes persistent, vérifier:" echo"   1. Variables .env (SUPABASE_URL, DOMAIN, etc.)" echo"   2. Certificats SSL Let's Encrypt" echo"   3. Firewall ports 80/443" echo"   4. Logs: docker-compose logs api traefik"