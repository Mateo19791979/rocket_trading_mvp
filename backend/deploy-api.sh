#!/bin/bash

# 🚀 Trading MVP API Deployment Script
echo "🚀 Déploiement Trading MVP API sur api.trading-mvp.com"

# Couleurs pour logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
API_DIR="/var/www/api.trading-mvp.com"
DOMAIN="api.trading-mvp.com"
NODE_VERSION="18"

# Fonction de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifications préalables
log_info "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js non trouvé. Installation..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Vérifier PM2
if ! command -v pm2 &> /dev/null; then
    log_warn "PM2 non trouvé. Installation..."
    sudo npm install -g pm2
fi

# Vérifier Nginx
if ! command -v nginx &> /dev/null; then
    log_warn "Nginx non trouvé. Installation..."
    sudo apt update
    sudo apt install -y nginx
fi

# Création du répertoire API
log_info "Création du répertoire API..."
sudo mkdir -p $API_DIR
sudo chown $USER:$USER $API_DIR

# Déploiement des fichiers
log_info "Copie des fichiers backend..."
cp -r ./backend/* $API_DIR/
cd $API_DIR

# Installation des dépendances
log_info "Installation des dépendances Node.js..."
npm ci --only=production

# Configuration PM2
log_info "Configuration PM2..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'trading-mvp-api',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Création du répertoire logs
mkdir -p logs

# Configuration Nginx
log_info "Configuration Nginx pour $DOMAIN..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://trading-mvp.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,apikey' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    }

    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://trading-mvp.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,apikey';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
EOF

# Activation du site Nginx
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t

if [ $? -eq 0 ]; then
    log_info "Configuration Nginx valide"
    sudo systemctl reload nginx
else
    log_error "Erreur configuration Nginx"
    exit 1
fi

# Démarrage de l'application log_info "Démarrage de l'application Trading MVP API..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# Configuration SSL avec Certbot
log_info "Configuration SSL avec Certbot..."
if command -v certbot &> /dev/null; then
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@trading-mvp.com --redirect
else
    log_warn "Certbot non trouvé. Installation..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@trading-mvp.com --redirect
fi

# Test de l'API log_info "Test de l'API déployée..."
sleep 5

# Test local
if curl -f http://localhost:8080/status > /dev/null 2>&1; then
    log_info "✅ API locale accessible sur :8080"
else
    log_error "❌ API locale non accessible"
fi

# Test public
if curl -f https://$DOMAIN/status > /dev/null 2>&1; then
    log_info "✅ API publique accessible sur https://$DOMAIN"
else
    log_warn "⚠️ API publique pas encore accessible (DNS propagation en cours)"
fi

# Statut final
echo "" echo"🎉 DÉPLOIEMENT TERMINÉ !" echo"==================================" log_info"API Backend: https://$DOMAIN" log_info"Status: https://$DOMAIN/status" log_info"Scores: https://$DOMAIN/scores?window=5" log_info"Selected: https://$DOMAIN/select" echo"" log_info"Commandes utiles:" echo"  pm2 status                 # Statut de l'app" echo"  pm2 logs trading-mvp-api   # Voir les logs" echo"  pm2 restart trading-mvp-api # Redémarrer" echo"  sudo nginx -t              # Test config Nginx" echo"" log_info"Frontend connecté à: $(grep VITE_MVP_API_BASE ../.env 2>/dev/null || echo 'https://api.trading-mvp.com')"