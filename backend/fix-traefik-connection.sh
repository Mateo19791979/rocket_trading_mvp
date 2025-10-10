#!/bin/bash

# 🔧 Enhanced Traefik Connection Fix Script for Trading MVP API
echo "🔧 Fixing Traefik routing for Trading MVP API..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
DOMAIN="api.trading-mvp.com"
LOCAL_PORT="8080"
FRONTEND_DOMAIN="rockettra3991.builtwithrocket.new"
TIMEOUT=10

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_blue() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

log_purple() {
    echo -e "${PURPLE}[FIX]${NC} $1"
}

echo "========================================" echo"🔧 TRAEFIK CONNECTION DIAGNOSTICS & FIX" echo"========================================" echo""

# Enhanced diagnostic functions
check_local_api() {
    log_info "Step 1: Comprehensive local API check..."
    
    # Check if process is running
    if pgrep -f "node.*server.js" > /dev/null || pgrep -f "pm2" > /dev/null; then log_info"Node.js process detected"
        
        # Check specific port
        if netstat -ln 2>/dev/null | grep -q ":$LOCAL_PORT "; then log_info"Port $LOCAL_PORT is in use"
            
            # Test actual connectivity
            if curl -s --connect-timeout $TIMEOUT "http://localhost:$LOCAL_PORT/status" > /dev/null 2>&1; then
                log_info "✅ Local API server is responding on port $LOCAL_PORT"
                
                # Get API info
                API_RESPONSE=$(curl -s --connect-timeout $TIMEOUT "http://localhost:$LOCAL_PORT/status" 2>/dev/null)
                if [ ! -z "$API_RESPONSE" ]; then
                    echo "   Response: $API_RESPONSE"
                fi
                
                return 0
            else
                log_error "❌ Port $LOCAL_PORT in use but not responding to HTTP requests"
                return 1
            fi
        else
            log_error "❌ Process running but not listening on port $LOCAL_PORT"
            return 1
        fi
    else
        log_error "❌ No API server process detected"
        return 1
    fi
}

check_dns_resolution() {
    log_info "Step 2: DNS resolution check..."
    
    if command -v nslookup >/dev/null 2>&1; then
        LOOKUP_RESULT=$(nslookup $DOMAIN 2>/dev/null)
        if [ $? -eq 0 ]; then
            IP=$(echo "$LOOKUP_RESULT" | awk '/^Address: / { print $2 }' | tail -1)
            log_info "✅ DNS resolution working for $DOMAIN" log_blue"Resolved to: $IP"
            
            # Check if it resolves to localhost (development setup)
            if [[ "$IP" == "127.0.0.1" ]] || [[ "$IP" == "::1" ]]; then
                log_blue "Domain points to localhost - development configuration"
                return 2 # Special return code for localhost
            fi
            return 0
        else
            log_error "❌ DNS resolution failed for $DOMAIN"
            return 1
        fi
    else
        log_warn "nslookup not available, trying host command..."
        if command -v host >/dev/null 2>&1; then
            if host $DOMAIN >/dev/null 2>&1; then
                log_info "✅ DNS resolution working (host command)"
                return 0
            fi
        fi
        log_error "❌ DNS resolution tools not available"
        return 1
    fi
}

check_web_server() {
    log_info "Step 3: Web server and proxy check..."
    
    # Check Nginx
    if command -v nginx >/dev/null 2>&1; then
        if systemctl is-active --quiet nginx 2>/dev/null || pgrep nginx >/dev/null 2>&1; then
            log_info "✅ Nginx is running"
            
            # Check for our domain configuration
            NGINX_CONFIGS=(
                "/etc/nginx/sites-enabled/$DOMAIN" "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/conf.d/$DOMAIN.conf"
            )
            
            CONFIG_FOUND=false
            for config in "${NGINX_CONFIGS[@]}"; do
                if [ -f "$config" ]; then
                    log_info "✅ Nginx configuration found: $config"
                    CONFIG_FOUND=true
                    break
                fi
            done
            
            if [ "$CONFIG_FOUND" = false ]; then
                log_warn "⚠️  No Nginx configuration found for $DOMAIN"
            fi
            
            return 0
        else
            log_warn "⚠️  Nginx is installed but not running"
            return 1
        fi
    fi
    
    # Check Apache
    if command -v apache2 >/dev/null 2>&1 || command -v httpd >/dev/null 2>&1; then
        APACHE_CMD="apache2"
        if command -v httpd >/dev/null 2>&1; then
            APACHE_CMD="httpd"
        fi
        
        if systemctl is-active --quiet $APACHE_CMD 2>/dev/null || pgrep $APACHE_CMD >/dev/null 2>&1; then
            log_info "✅ Apache is running"
            return 0
        else
            log_warn "⚠️  Apache is installed but not running"
            return 1
        fi
    fi
    
    # Check Traefik
    if pgrep -f traefik >/dev/null 2>&1; then
        log_info "✅ Traefik process detected"
        
        # Try to access Traefik dashboard
        if curl -s --connect-timeout $TIMEOUT "http://localhost:8080" >/dev/null 2>&1; then
            log_info "✅ Traefik dashboard accessible"
        else
            log_warn "⚠️  Traefik running but dashboard not accessible"
        fi
        return 0
    fi
    
    log_warn "⚠️  No web server detected (Nginx, Apache, or Traefik)"
    return 1
}

test_cors_configuration() {
    log_info "Step 4: CORS configuration test..."
    
    CORS_TEST=$(curl -s -I --connect-timeout $TIMEOUT \
        -H "Origin: https://$FRONTEND_DOMAIN" \
        -H "Access-Control-Request-Method: GET" -H"Access-Control-Request-Headers: Content-Type" "http://localhost:$LOCAL_PORT/status" 2>/dev/null)
    
    if echo "$CORS_TEST"| grep -i "access-control-allow-origin" >/dev/null; then log_info"✅ CORS headers detected"
        ORIGIN_HEADER=$(echo "$CORS_TEST" | grep -i "access-control-allow-origin" | head -1)
        log_blue "Found: $ORIGIN_HEADER"
        return 0
    else
        log_warn "⚠️  CORS headers may be missing"
        return 1
    fi
}

test_ssl_certificate() {
    log_info "Step 5: SSL certificate check..."
    
    if command -v openssl >/dev/null 2>&1; then
        SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 -verify_return_error 2>/dev/null)
        if [ $? -eq 0 ]; then
            log_info "✅ SSL certificate is valid"
            
            # Extract certificate details
            EXPIRY=$(echo "$SSL_INFO" | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
            if [ ! -z "$EXPIRY" ]; then
                log_blue "Certificate expires: $EXPIRY"
            fi
            return 0
        else
            log_error "❌ SSL certificate validation failed"
            return 1
        fi
    else
        log_warn "openssl not available for certificate check"
        return 1
    fi
}

# Automated fixes
fix_local_api() {
    log_purple "Applying local API fixes..."
    
    # Check if start script exists and run it
    if [ -f "./start-server.sh" ]; then
        log_info "Running start-server.sh..."
        chmod +x ./start-server.sh
        ./start-server.sh
        return $?
    elif [ -f "server.js" ]; then
        log_info "Starting server.js directly..."
        
        # Check if pm2 is available
        if command -v pm2 >/dev/null 2>&1; then
            pm2 delete trading-mvp-api 2>/dev/null || true
            pm2 start server.js --name trading-mvp-api
        else
            nohup node server.js > server.log 2>&1 &
            echo $! > server.pid
        fi
        
        sleep 3
        
        # Test if server started
        if curl -s --connect-timeout 5 "http://localhost:$LOCAL_PORT/status" >/dev/null 2>&1; then
            log_info "✅ API server started successfully"
            return 0
        else
            log_error "❌ Failed to start API server"
            return 1
        fi
    else
        log_error "No server.js or start script found"
        return 1
    fi
}

create_nginx_config() {
    log_purple "Creating Nginx proxy configuration..."
    
    NGINX_CONFIG="/tmp/trading-mvp-proxy.conf"
    
    cat > "$NGINX_CONFIG" << EOF
# Trading MVP API Proxy Configuration
server {
    listen 80;
    server_name $DOMAIN localhost;
    
    # Redirect HTTP to HTTPS in production
    # return 301 https://\$server_name\$request_uri;
    
    # For development, proxy directly
    location / {
        proxy_pass http://127.0.0.1:$LOCAL_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        
        # CORS headers for development
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# HTTPS configuration (for production)
# server {
#     listen 443 ssl http2;
#     server_name $DOMAIN;
#     
#     ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
#     
#     location / {
#         proxy_pass http://127.0.0.1:$LOCAL_PORT;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#     }
# }
EOF
    
    log_blue "Nginx configuration created at $NGINX_CONFIG"
    
    # Offer to install the configuration
    echo "" log_info"To apply this configuration:" echo"  sudo cp $NGINX_CONFIG /etc/nginx/sites-available/trading-mvp" echo"  sudo ln -sf /etc/nginx/sites-available/trading-mvp /etc/nginx/sites-enabled/" echo"  sudo nginx -t && sudo systemctl reload nginx" echo""
}

create_traefik_config() {
    log_purple "Creating Traefik configuration..."
    
    TRAEFIK_CONFIG="/tmp/docker-compose.traefik.yml"
    
    cat > "$TRAEFIK_CONFIG" << EOF
version: '3.8'

networks:
  web:
    external: true

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    command:
      - --api.dashboard=true
      - --api.debug=true
      - --log.level=INFO
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.docker.network=web
      - --entrypoints.websecure.address=:443
      - --entrypoints.web.address=:80
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
      - --certificatesresolvers.letsencrypt.acme.email=admin@trading-mvp.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
    ports:
      - "80:80" -"443:443" -"8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - web
    labels:
      - "traefik.enable=true" -"traefik.http.routers.traefik.rule=Host(\`traefik.$DOMAIN\`)" -"traefik.http.routers.traefik.entrypoints=websecure" -"traefik.http.routers.traefik.tls.certresolver=letsencrypt" -"traefik.http.services.traefik.loadbalancer.server.port=8080"

  trading-api:
    image: node:18-alpine
    container_name: trading-mvp-api
    restart: unless-stopped
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    command: node server.js
    environment:
      - NODE_ENV=production
      - PORT=8080
    networks:
      - web
    labels:
      - "traefik.enable=true" -"traefik.http.routers.api.rule=Host(\`$DOMAIN\`)" -"traefik.http.routers.api.entrypoints=websecure" -"traefik.http.routers.api.tls.certresolver=letsencrypt" -"traefik.http.services.api.loadbalancer.server.port=8080"
      
      # Middleware for security headers
      - "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000" -"traefik.http.middlewares.security-headers.headers.stsIncludeSubdomains=true" -"traefik.http.middlewares.security-headers.headers.stsPreload=true" -"traefik.http.middlewares.security-headers.headers.forceSTSHeader=true" -"traefik.http.middlewares.security-headers.headers.contentTypeNosniff=true" -"traefik.http.middlewares.security-headers.headers.referrerPolicy=strict-origin-when-cross-origin"
      
      # Apply middleware
      - "traefik.http.routers.api.middlewares=security-headers@docker"
EOF
    
    log_blue "Traefik configuration created at $TRAEFIK_CONFIG" echo"" log_info"To deploy with Traefik:" echo"  docker network create web" echo"  docker-compose -f $TRAEFIK_CONFIG up -d" echo""
}

# Test all systems
run_diagnostics() {
    echo "" log_info"Running comprehensive diagnostics..." echo""
    
    # Test results
    RESULTS=()
    
    # Local API check
    if check_local_api; then
        RESULTS+=("local_api:success")
    else
        RESULTS+=("local_api:failed")
    fi
    
    # DNS check
    dns_result=$(check_dns_resolution)
    dns_code=$?
    if [ $dns_code -eq 0 ]; then
        RESULTS+=("dns:success")
    elif [ $dns_code -eq 2 ]; then
        RESULTS+=("dns:localhost")
    else
        RESULTS+=("dns:failed")
    fi
    
    # Web server check
    if check_web_server; then
        RESULTS+=("webserver:success")
    else
        RESULTS+=("webserver:failed")
    fi
    
    # CORS check
    if test_cors_configuration; then
        RESULTS+=("cors:success")
    else
        RESULTS+=("cors:failed")
    fi
    
    # SSL check (only if DNS works and not localhost)
    if [[ "$dns_code" -eq 0 ]]; then
        if test_ssl_certificate; then
            RESULTS+=("ssl:success")
        else
            RESULTS+=("ssl:failed")
        fi
    fi
    
    echo "" echo"========================================" echo"🔧 DIAGNOSTIC RESULTS & RECOMMENDATIONS" echo"========================================" echo""
    
    # Analyze results and provide recommendations
    local_api_ok=false
    dns_ok=false
    webserver_ok=false
    cors_ok=false
    ssl_ok=false
    
    for result in "${RESULTS[@]}"; do
        case $result in
            "local_api:success") local_api_ok=true ;;
            "dns:success"|"dns:localhost") dns_ok=true ;;
            "webserver:success") webserver_ok=true ;;
            "cors:success") cors_ok=true ;;
            "ssl:success") ssl_ok=true ;;
        esac
    done
    
    # Provide specific recommendations
    if [ "$local_api_ok" = false ]; then
        log_error "❌ Local API server is not responding" echo"   SOLUTION: Start the API server" echo"   COMMANDS:" echo"     cd backend && ./start-server.sh" echo"     # OR" echo"     cd backend && node server.js" echo""
        
        # Offer automated fix
        read -p "   🔧 Auto-fix: Start API server now? [y/N]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            fix_local_api
        fi
        echo ""
    fi
    
    if [ "$webserver_ok" = false ]; then
        log_error "❌ No web server/proxy detected" echo"   SOLUTION: Configure reverse proxy" echo""
        
        # Offer configuration creation
        read -p "   🔧 Auto-fix: Create Nginx configuration? [y/N]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_nginx_config
        fi
        echo "" read -p"   🔧 Auto-fix: Create Traefik configuration? [y/N]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_traefik_config
        fi
        echo ""
    fi
    
    if [ "$cors_ok" = false ]; then
        log_error "❌ CORS configuration missing or incorrect" echo"   SOLUTION: Update server CORS settings" echo"   EXAMPLE:"
        echo '     app.use(cors({'
        echo '       origin: ["https://trading-mvp.com", "https://rockettra3991.builtwithrocket.new"],'
        echo '       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],'
        echo '       allowedHeaders: ["Content-Type", "Authorization"],' echo'       credentials: true' echo'     }));'
        echo ""
    fi
    
    # Overall assessment
    echo "========================================" echo"📊 OVERALL ASSESSMENT" echo"========================================"
    
    success_count=0
    total_count=${#RESULTS[@]}
    
    for result in "${RESULTS[@]}"; do
        if [[ $result == *":success" ]]; then
            ((success_count++))
        fi
    done
    
    success_rate=$((success_count * 100 / total_count))
    
    if [ $success_rate -ge 80 ]; then
        echo "🟢 Status: HEALTHY ($success_rate% tests passed)"
        echo "   Your API should be accessible via: https://$DOMAIN"
    elif [ $success_rate -ge 60 ]; then
        echo "🟡 Status: PARTIALLY WORKING ($success_rate% tests passed)"
        echo "   Some issues detected but API may still function"
    else
        echo "🔴 Status: CRITICAL ($success_rate% tests passed)"
        echo "   Multiple issues detected - immediate attention required"
    fi
    
    echo "" echo"🚀 NEXT STEPS:"
    if [ "$local_api_ok" = true ]; then
        echo "  ✅ Local API is working" echo"  🌐 Test: curl http://localhost:$LOCAL_PORT/status"
        if [ "$webserver_ok" = true ]; then
            echo "  🌐 Test: curl https://$DOMAIN/status"
        fi
    else
        echo "1. 🔧 Start the API server first" echo"  2. 🔧 Configure reverse proxy (Nginx/Traefik)" echo"  3. 🔧 Set up SSL certificate" echo"  4. 🔧 Configure DNS properly"
    fi
    
    echo "" echo"📋 MANUAL TESTING COMMANDS:" echo"  curl -v http://localhost:$LOCAL_PORT/status" echo"  curl -v https://$DOMAIN/status" echo"  curl -H 'Origin: https://$FRONTEND_DOMAIN' -X OPTIONS http://localhost:$LOCAL_PORT/status -v" echo""
    
    return $success_count
}

# Main execution
run_diagnostics

echo "🎯 Traefik connection diagnostic complete!"