#!/bin/bash

# Enhanced Trading MVP Backend Startup & Diagnostic Script
# Comprehensive solution for resolving ECONNREFUSED errors

echo "🔧 Trading MVP Backend Diagnostic & Startup Tool" echo"=================================================" echo""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Environment Check
echo "🔍 Step 1: Environment Diagnostic" echo"--------------------------------"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 20.x or higher" echo"   Download from: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm"
    exit 1
else
    NPM_VERSION=$(npm --version)
    print_status "npm found: $NPM_VERSION"
fi

# Step 2: Directory & File Structure Check
echo "" echo"📂 Step 2: Project Structure Validation" echo"--------------------------------------"

# Determine correct directory
if [ ! -f "server.js" ]; then
    if [ -d "backend" ] && [ -f "backend/server.js" ]; then
        print_info "Switching to backend directory..."
        cd backend
        print_status "Now in backend directory"
    else
        print_error "Backend server.js not found in current directory or backend/ subdirectory" print_info"Please run this script from:" echo"   - Project root directory (with backend/ folder), OR" echo"   - Backend directory (with server.js file)"
        exit 1
    fi
else
    print_status "Backend files found in current directory"
fi

# Check essential files
REQUIRED_FILES=("server.js" "check_api.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file found"
    else
        print_warning "$file missing (will continue anyway)"
    fi
done

# Step 3: Dependencies Check
echo "" echo"📦 Step 3: Dependencies Validation" echo"---------------------------------"

# Check if we need to install dependencies
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    
    # Go up one level if we're in backend directory
    if [[ $PWD == *"/backend" ]]; then
        cd ..
        print_info "Installing from project root..."
    fi
    
    npm ci --silent
    if [ $? -eq 0 ]; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies" echo"Try running manually: npm ci"
        exit 1
    fi
    
    # Return to backend directory if needed
    if [ -d "backend" ] && [ ! -f "server.js" ]; then
        cd backend
    fi
else
    print_status "Dependencies already installed"
fi

# Step 4: Port Check
echo "" echo"🌐 Step 4: Port Availability Check" echo"---------------------------------"

PORT=${PORT:-8080}

if command -v lsof &> /dev/null; then
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $PORT is already in use" echo"Attempting to kill existing process..."
        
        # Kill processes on port 8080
        lsof -ti:$PORT | xargs kill -9 2>/dev/null
        sleep 2
        
        # Check again
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_error "Failed to free port $PORT. Please manually stop the process using port $PORT" echo"   Run: lsof -ti:$PORT | xargs kill -9"
            exit 1
        else
            print_status "Port $PORT is now available"
        fi
    else
        print_status "Port $PORT is available"
    fi
else
    print_warning "lsof not available. Cannot check port status"
fi

# Step 5: Configuration Check
echo "" echo"⚙️  Step 5: Configuration Validation" echo"-----------------------------------"

# Create config directory
mkdir -p config

# Check for environment configuration
if [ -f "config/env.json" ]; then
    print_status "config/env.json found"
    
    # Validate JSON structure
    if node -e "JSON.parse(require('fs').readFileSync('config/env.json'));" 2>/dev/null; then
        print_status "config/env.json is valid JSON"
    else
        print_error "config/env.json contains invalid JSON"
        exit 1
    fi
else
    print_warning "config/env.json not found" print_info"Server will use environment variables instead"
    
    # Check for required environment variables
    REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_KEY")
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        else
            print_status "$var is set"
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        print_error "Missing required environment variables: ${MISSING_VARS[*]}"
        echo "" print_info"To fix this, either:" echo"   1. Set environment variables:"
        for var in "${MISSING_VARS[@]}"; do
            echo "      export $var=your_value_here"
        done
        echo "2. Create config/env.json with your Supabase credentials" echo"" echo"   Example config/env.json:" echo"   {" echo"     \"SUPABASE_URL\": \"https://your-project.supabase.co\","
        echo "     \"SUPABASE_KEY\": \"your-anon-key\"," echo"     \"CORS_ORIGIN\": \"*\"" echo"   }"
        exit 1
    fi
fi

# Step 6: Network Connectivity Test
echo "" echo"🌍 Step 6: Network Connectivity Test" echo"-----------------------------------"

# Test if we can bind to the port
if command -v netstat &> /dev/null; then
    print_status "Network tools available"
else
    print_warning "Limited network diagnostic tools available"
fi

# Step 7: Start Server
echo "" echo"🚀 Step 7: Starting Server" echo"------------------------" print_info"Starting Trading MVP Backend on port $PORT..." print_info"Health check will be available at: http://localhost:$PORT/status" print_info"API endpoints:" echo"   - GET  /status           (System health)" echo"   - GET  /scores?window=252 (Trading scores)" echo"   - GET  /select           (Selected strategy)" echo"   - GET  /api/strategies   (All strategies)" echo"" print_info"Press Ctrl+C to stop the server" echo"" print_status"Backend starting..."

# Export environment variables for development
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-8080}
export CORS_ORIGIN=${CORS_ORIGIN:-"*"}

# Start the server with enhanced error handling
node server.js 2>&1 | while IFS= read -r line; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $line"
done

# If server exits, provide diagnostic information
echo "" print_warning"Server has stopped" echo"" print_info"Diagnostic Summary:" echo"  - Check server logs above for any error messages" echo"  - Verify Supabase credentials are correct" echo"  - Ensure port $PORT is not blocked by firewall" echo"  - Try running: npm run check:api (after server is running)" echo"" print_info"Common solutions:" echo"  1. Update Supabase credentials in config/env.json" echo"  2. Run: npm ci (to reinstall dependencies)" echo"  3. Check if port $PORT is available: lsof -ti:$PORT" echo"  4. Restart terminal and try again" echo"" print_info"For more help, check the README.md file"