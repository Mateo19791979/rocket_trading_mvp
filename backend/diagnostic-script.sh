#!/bin/bash

# Enhanced Trading MVP API Diagnostic Script
# Usage: ./diagnostic-script.sh [local|production]

set -e

MODE=${1:-"local"}
BASE_URL="http://localhost:8080"
if [ "$MODE" = "production" ]; then
    BASE_URL="https://${PUBLIC_API_HOST:-api.trading-mvp.com}"
fi

echo "🩺 Trading MVP API Diagnostic Script" echo"======================================" echo"Mode: $MODE" echo"Target: $BASE_URL" echo"Timestamp: $(date -Iseconds)" echo""

# Check system status
echo "🖥️  System Status:" echo"   Uptime: $(uptime -p)" echo"   Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "   Memory: $(free -h | awk '/^Mem:/ {printf "Used: %s/%s (%.1f%%)", $3, $2, ($3/$2)*100}')"
echo ""

# Check PM2 status
echo "🔧 PM2 Process Status:"
if command -v pm2 >/dev/null 2>&1; then
    pm2 status | grep -E "(App name|trading-mvp|online|stopped|errored)" || echo "   No trading-mvp processes found"
    echo "" echo"📋 PM2 Logs (last 10 lines):"
    pm2 logs trading-mvp-api --lines 10 --nostream 2>/dev/null || echo "   No logs available"
else
    echo "   ❌ PM2 not installed or not in PATH"
fi
echo ""

# Check network connectivity
echo "🌐 Network Connectivity:"
if [ "$MODE" = "local" ]; then
    echo "   Port 8080 status:" ss -ltnp | grep 8080 || echo"   ❌ Port 8080 not listening"
else
    echo "DNS resolution:" nslookup"${PUBLIC_API_HOST:-api.trading-mvp.com}" || echo "   ❌ DNS resolution failed"
fi
echo ""

# Test API endpoints
echo "🚀 API Endpoint Tests:"
endpoints=("/status" "/scores?window=5" "/select")

for endpoint in "${endpoints[@]}"; do
    echo "   Testing: $BASE_URL$endpoint"
    
    if curl -fsS --max-time 10 "$BASE_URL$endpoint">/dev/null 2>&1; then echo"   ✅ Success"
    else
        echo "   ❌ Failed"
        
        # Try to get more detailed error info
        echo "Debug info:" curl -v --max-time 5"$BASE_URL$endpoint" 2>&1 | head -5 | sed 's/^/      /'
    fi
    echo ""
done

# Configuration check
echo "🔧 Configuration Check:"
if [ -f "config/env.json" ]; then
    echo "   ✅ config/env.json exists" echo"   Keys present:"
    jq -r 'keys[]' config/env.json 2>/dev/null | sed 's/^/      /' || echo "   ❌ Invalid JSON format"
else
    echo "   ⚠️  config/env.json not found, using environment variables"
fi

echo "   Environment variables:"
env | grep -E "(SUPABASE|PORT|NODE_ENV)" | sed 's/^/      /' || echo "   No relevant env vars found"
echo ""

# Recommendations
echo "🎯 Recommendations:"
if ! command -v pm2 >/dev/null 2>&1; then
    echo "   • Install PM2: npm install -g pm2"
fi

if [ "$MODE" = "local" ] && ! ss -ltnp | grep -q 8080; then
    echo "   • Start the backend server:" echo"     cd /var/www/trading-mvp/backend" echo"     pm2 start ecosystem.config.cjs"
fi

if [ ! -f "config/env.json" ]; then
    echo "   • Create config/env.json with Supabase credentials"
fi

echo "• For real-time monitoring: pm2 monit" echo"   • For detailed logs: pm2 logs trading-mvp-api" echo"" echo"✅ Diagnostic complete!"