#!/bin/bash

# 🚀 Trading MVP API Quick Start Script - Enhanced Version
echo "🚀 Starting Trading MVP API Server..."

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
PORT=${PORT:-8080}
NODE_ENV=${NODE_ENV:-production}
API_DIR="/var/www/api.trading-mvp.com"
MAX_STARTUP_ATTEMPTS=3

# Log functions
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
    echo -e "${PURPLE}[SYSTEM]${NC} $1"
}

echo "========================================" echo"🚀 TRADING MVP API SERVER STARTUP" echo"========================================" echo""

# Check system requirements
log_purple "Checking system requirements..."

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_info "Node.js version: $NODE_VERSION"
    
    # Verify Node.js version is >= 18
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or higher required. Current: $NODE_VERSION" echo"" echo"Installation commands:" echo"  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -" echo"  sudo apt-get install -y nodejs"
        exit 1
    fi
else
    log_error "Node.js not found. Please install Node.js 18 or later" echo"  Installation: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_info "npm version: $NPM_VERSION"
else
    log_error "npm not found. Please install npm"
    exit 1
fi

# Determine working directory
if [ -f "server.js" ]; then
    log_info "Found server.js in current directory"
    SERVER_DIR=$(pwd)
elif [ -f "backend/server.js" ]; then
    log_info "Found server.js in backend/ directory"
    cd backend/
    SERVER_DIR=$(pwd)
elif [ -f "$API_DIR/server.js" ]; then
    log_info "Found server.js in production directory"
    cd $API_DIR
    SERVER_DIR=$(pwd)
else
    log_error "server.js not found in any expected location" echo"" echo"Expected locations:" echo"  ./server.js" echo"  ./backend/server.js" echo"  $API_DIR/server.js" echo"" echo"Please run from project root or ensure server.js exists"
    exit 1
fi

log_blue "Working directory: $SERVER_DIR" echo""

# Enhanced dependency check
log_purple "Checking project dependencies..."

if [ -f "package.json" ]; then
    log_info "Found package.json - analyzing dependencies..."
    
    # Check if node_modules exists and has content
    if [ ! -d "node_modules" ] || [ ! "$(ls -A node_modules 2>/dev/null)" ]; then
        log_warn "Dependencies not installed. Installing..."
        
        # Check if package-lock.json exists for faster install
        if [ -f "package-lock.json" ]; then
            log_blue "Using npm ci for faster, reproducible install..."
            npm ci --production
        else
            log_blue "Using npm install..."
            npm install --production
        fi
        
        if [ $? -ne 0 ]; then
            log_error "Failed to install dependencies" echo"" echo"Troubleshooting:" echo"  1. Check internet connectivity" echo"  2. Clear npm cache: npm cache clean --force" echo"  3. Delete node_modules and try again" echo"  4. Check package.json for invalid entries"
            exit 1
        fi
        
        log_info "Dependencies installed successfully"
    else
        log_info "Dependencies already installed"
        
        # Quick dependency health check
        MISSING_DEPS=$(npm ls --production --parseable --depth=0 2>&1 | grep -c "UNMET DEPENDENCY" || true)
        if [ "$MISSING_DEPS" -gt 0 ]; then
            log_warn "Found $MISSING_DEPS missing dependencies. Fixing..."
            npm install --production
        fi
    fi
    
    # Verify critical dependencies
    CRITICAL_DEPS=("express" "@supabase/supabase-js" "cors")
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ ! -d "node_modules/$dep" ]; then
            log_error "Critical dependency missing: $dep" npm install"$dep"
        fi
    done
    
else
    log_warn "No package.json found - running without dependency check"
fi

# Environment configuration check
log_purple "Checking environment configuration..."

ENV_FILE=""
if [ -f "config/env.json" ]; then
    log_info "Found config/env.json - using file-based configuration"
    ENV_FILE="config/env.json"
elif [ -f "../.env" ]; then
    log_info "Found ../.env - loading environment variables"
    export $(grep -v '^#' ../.env | xargs 2>/dev/null || true)
    ENV_FILE="../.env"
elif [ -f ".env" ]; then
    log_info "Found .env - loading environment variables"
    export $(grep -v '^#' .env | xargs 2>/dev/null || true)
    ENV_FILE=".env"
else
    log_warn "No configuration file found" log_warn"Creating basic .env file for development..."
    
    cat > .env << EOF
# Trading MVP API Configuration
NODE_ENV=development
PORT=8080
HOST=localhost

# Supabase Configuration (required)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://rockettra3991.builtwithrocket.new

# API Configuration
API_VERSION=1.0.0
API_TIMEOUT=30000
EOF
    
    log_warn "Please edit .env file with your actual Supabase credentials"
    ENV_FILE=".env"
fi

# Validate critical environment variables
log_blue "Validating environment variables..."
MISSING_ENV=()

if [ -z "$SUPABASE_URL" ]; then
    MISSING_ENV+=("SUPABASE_URL")
fi

if [ -z "$SUPABASE_ANON_KEY" ] && [ -z "$SUPABASE_KEY" ]; then
    MISSING_ENV+=("SUPABASE_ANON_KEY or SUPABASE_KEY")
fi

if [ ${#MISSING_ENV[@]} -gt 0 ]; then
    log_warn "Missing environment variables:"
    for var in "${MISSING_ENV[@]}"; do
        echo "  - $var"
    done
    echo "" echo"Please update $ENV_FILE with the missing variables" echo"The server will start but may not function properly without them" echo""
fi

# Port availability check with auto-fix
log_purple "Checking port availability..."

if netstat -ln 2>/dev/null | grep -q ":$PORT "; then log_error"Port $PORT is already in use"
    
    # Try to identify what's using the port
    PROCESS_INFO=$(lsof -ti:$PORT 2>/dev/null | head -1)
    if [ ! -z "$PROCESS_INFO" ]; then
        PROCESS_NAME=$(ps -p $PROCESS_INFO -o comm= 2>/dev/null || echo "unknown")
        log_blue "Port $PORT is being used by process: $PROCESS_NAME (PID: $PROCESS_INFO)"
        
        # If it's likely our own process, offer to kill it
        if [[ "$PROCESS_NAME" == *"node"* ]] || [[ "$PROCESS_NAME" == *"pm2"* ]]; then
            echo "" read -p"Kill existing process and continue? [y/N]: " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log_info "Stopping existing process..."
                kill -TERM $PROCESS_INFO 2>/dev/null || true
                sleep 2
                
                # Force kill if still running
                if ps -p $PROCESS_INFO > /dev/null 2>&1; then
                    log_warn "Force killing process..."
                    kill -KILL $PROCESS_INFO 2>/dev/null || true
                fi
                
                # Verify port is now free
                sleep 1
                if netstat -ln 2>/dev/null | grep -q ":$PORT "; then log_error"Port still in use after killing process"
                    exit 1
                else
                    log_info "Port $PORT is now available"
                fi
            else
                echo "" echo"Alternative solutions:" echo"  1. Use different port: PORT=8081 $0" echo"  2. Kill manually: kill $PROCESS_INFO" echo"  3. Kill all node processes: pkill -f node"
                exit 1
            fi
        fi
    fi
else
    log_info "Port $PORT is available"
fi

# Server startup attempts with recovery
log_purple "Starting API server..." log_info"Environment: $NODE_ENV" log_info"Port: $PORT" echo""

attempt=1
while [ $attempt -le $MAX_STARTUP_ATTEMPTS ]; do
    log_blue "Startup attempt $attempt/$MAX_STARTUP_ATTEMPTS"
    
    # Try PM2 first if available
    if command -v pm2 &> /dev/null && [ "$NODE_ENV" = "production" ]; then
        log_info "PM2 detected - using process manager"
        
        # Stop any existing instance
        pm2 delete trading-mvp-api 2>/dev/null || true
        sleep 1
        
        # Create PM2 ecosystem file if not exists
        if [ ! -f "ecosystem.config.js" ]; then
            log_blue "Creating PM2 configuration..."
            cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'trading-mvp-api',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: $PORT
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    // Restart policy
    max_restarts: 5,
    restart_delay: 2000,
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Monitoring
    max_memory_restart: '500M',
    
    // Environment
    source_map_support: true,
    instance_var: 'INSTANCE_ID'
  }]
};
EOF
            mkdir -p logs
        fi
        
        # Start with PM2
        pm2 start ecosystem.config.js --env ${NODE_ENV}
        
        if [ $? -eq 0 ]; then
            sleep 3
            
            # Test if server is responding
            if curl -s --connect-timeout 5 "http://localhost:$PORT/status" > /dev/null 2>&1; then
                log_info "✅ API server started successfully with PM2" echo"" echo"📊 Server Management Commands:" echo"  pm2 status                 # View status" echo"  pm2 logs trading-mvp-api   # View logs" echo"  pm2 restart trading-mvp-api # Restart" echo"  pm2 stop trading-mvp-api   # Stop" echo""
                
                # Show server info
                show_server_info
                exit 0
            else
                log_warn "PM2 started but server not responding. Checking logs..."
                pm2 logs trading-mvp-api --lines 10
            fi
        else
            log_error "Failed to start with PM2"
        fi
    fi
    
    # Fallback to direct Node.js start
    log_info "Starting server directly with Node.js..."
    
    if [ "$NODE_ENV" = "production" ]; then
        # Production: background with nohup
        nohup node server.js > server.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > server.pid
        
        sleep 3
        
        # Test if server is responding
        if curl -s --connect-timeout 5 "http://localhost:$PORT/status" > /dev/null 2>&1; then
            log_info "✅ API server started in background (PID: $SERVER_PID)" echo"" echo"📊 Server Management Commands:" echo"  tail -f server.log         # View logs" echo"  kill $SERVER_PID           # Stop server" echo"  cat server.pid             # Get PID" echo""
            
            show_server_info
            exit 0
        else
            log_warn "Server started but not responding (attempt $attempt)"
            if [ -f server.log ]; then
                echo "Last few log lines:"
                tail -5 server.log
            fi
            
            # Kill the non-responding server
            kill $SERVER_PID 2>/dev/null || true
        fi
    else
        # Development: foreground
        log_info "Development mode - starting in foreground"
        echo "" log_blue"Press Ctrl+C to stop the server" echo""
        
        # Test server.js syntax first
        if node -c server.js 2>/dev/null; then
            exec node server.js
        else
            log_error "Syntax error in server.js"
            node -c server.js
            exit 1
        fi
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -le $MAX_STARTUP_ATTEMPTS ]; then
        log_warn "Retrying in 5 seconds..."
        sleep 5
    fi
done

log_error "Failed to start server after $MAX_STARTUP_ATTEMPTS attempts" echo"" echo"🔍 Troubleshooting:" echo"  1. Check server logs:"
if [ -f "server.log" ]; then
    echo "     tail -f server.log"
elif command -v pm2 &> /dev/null; then
    echo "     pm2 logs trading-mvp-api"
fi
echo "  2. Verify syntax: node -c server.js"
echo "  3. Test dependencies: npm audit" echo"  4. Check port: netstat -ln | grep :$PORT" echo"  5. Verify environment: node -e 'console.log(process.env)'" echo""

exit 1

# Function to show server information
show_server_info() {
    echo "🎉 API Server is running successfully!" echo"" echo"📋 API Endpoints:" echo"  🏠 Status:     http://localhost:$PORT/status" echo"  📊 Health:     http://localhost:$PORT/health" echo"  📈 Scores:     http://localhost:$PORT/scores?window=5" echo"  🎯 Selected:   http://localhost:$PORT/select" echo"  🔌 Providers:  http://localhost:$PORT/providers/health" echo""
    
    # Test a sample endpoint
    log_info "🧪 Sample API Test:" echo"" curl -s"http://localhost:$PORT/status"2>/dev/null | head -10 || echo "Connection test failed" echo"" echo""
    
    # Show next steps
    echo "🚀 Next Steps:" echo"  1. ✅ API Server is running" echo"  2. 🌐 Test from browser: http://localhost:$PORT" echo"  3. 🔧 Configure Traefik/Nginx for production" echo"  4. 🔍 Check frontend connection in browser console" echo""
    
    if [ "$NODE_ENV" = "production" ]; then
        echo "💡 Production Mode Active" echo"   Server running in background - use PM2 or log files to monitor"
    fi
    
    echo "" log_info"🎯 Trading MVP API startup complete!"
}

# Handle interruption gracefully
trap 'echo -e "\n${YELLOW}[WARN]${NC} Server startup interrupted by user"; exit 0' INT TERM