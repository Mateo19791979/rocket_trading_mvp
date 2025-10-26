#!/usr/bin/env bash

# Enhanced diagnostic script for IBKR system health
set -e

echo "=============================================" echo"🚀 IBKR Trading System Diagnostic Report" echo"=============================================" echo"Timestamp: $(date)"
echo

# Check PM2 processes
echo "== PM2 STATUS =="
pm2 ls 2>/dev/null || echo "PM2 not running or not installed"
echo

# Check if API is listening on port 3000
echo "== API PORT STATUS =="
if ss -ltnp | grep :3000 >/dev/null 2>&1; then
    echo "✅ Port 3000 is listening"
    ss -ltnp | grep :3000
else
    echo "❌ Port 3000 is not listening"
fi
echo

# Test local health endpoint
echo "== HEALTH CHECK (LOCAL) =="
if curl -s -f --connect-timeout 5 http://127.0.0.1:3000/health >/dev/null 2>&1; then
    echo "✅ Local health endpoint responding"
    curl -s http://127.0.0.1:3000/health | head -c 200
    echo
else
    echo "❌ Local health endpoint not responding" echo"Trying to get response anyway:"
    curl -i http://127.0.0.1:3000/health 2>&1 | head -10 || true
fi
echo

# Test real-time endpoints
echo "== REAL-TIME API CHECK =="
if curl -s -f --connect-timeout 5 http://127.0.0.1:3000/api/realtime/health >/dev/null 2>&1; then
    echo "✅ Real-time API responding"
    curl -s http://127.0.0.1:3000/api/realtime/health
else
    echo "❌ Real-time API not responding" echo"Response:"
    curl -i http://127.0.0.1:3000/api/realtime/health 2>&1 | head -10 || true
fi
echo

# Test sample quote endpoint
echo "== SAMPLE QUOTE CHECK ==" echo"Testing quote endpoint for AAPL..."
if curl -s -f --connect-timeout 5 "http://127.0.0.1:3000/api/realtime/quote?symbol=AAPL">/dev/null 2>&1; then echo"✅ Quote endpoint responding" curl -s"http://127.0.0.1:3000/api/realtime/quote?symbol=AAPL"
else
    echo "ℹ️ Quote endpoint response (may be 202 for stale cache):"
    curl -i "http://127.0.0.1:3000/api/realtime/quote?symbol=AAPL" 2>&1 | head -15 || true
fi
echo

# Check Nginx status if running
echo "== NGINX STATUS =="
if command -v nginx >/dev/null 2>&1; then
    if systemctl is-active nginx >/dev/null 2>&1; then
        echo "✅ Nginx is running"
        nginx -t 2>&1 || echo "❌ Nginx configuration test failed"
    else
        echo "❌ Nginx is not running"
    fi
else
    echo "ℹ️ Nginx not installed or not in PATH"
fi
echo

# Check recent Nginx errors if available
echo "== NGINX ERRORS (LAST 20 LINES) =="
if [ -f /var/log/nginx/error.log ]; then
    echo "Recent Nginx errors:"
    sudo tail -n 20 /var/log/nginx/error.log 2>/dev/null || echo "Cannot read nginx error log"
elif [ -f /var/log/nginx/api_error.log ]; then
    echo "Recent API errors:"
    sudo tail -n 20 /var/log/nginx/api_error.log 2>/dev/null || echo "Cannot read api error log"
else
    echo "ℹ️ No nginx error logs found"
fi
echo

# Check environment variables
echo "== ENVIRONMENT CHECK ==" echo"NODE_ENV: ${NODE_ENV:-not set}" echo"PORT: ${PORT:-not set (default 3000)}" echo"SUPABASE_URL: ${SUPABASE_URL:+set (hidden)}" echo"CACHE_MAX_AGE_MS: ${CACHE_MAX_AGE_MS:-not set (default 5000)}" echo"FEED_HEARTBEAT_MS: ${FEED_HEARTBEAT_MS:-not set (default 2000)}" echo"FEED_STALL_MS: ${FEED_STALL_MS:-not set (default 10000)}"
echo

# Check disk space
echo "== DISK SPACE ==" df -h / | grep -v"Filesystem"
echo

# Check memory usage
echo "== MEMORY USAGE =="
free -m | head -2
echo

echo "=============================================" echo"🏁 Diagnostic Complete" echo"============================================="

# Exit with appropriate code
if curl -s -f --connect-timeout 5 http://127.0.0.1:3000/health >/dev/null 2>&1; then
    echo "✅ System appears healthy"
    exit 0
else
    echo "❌ System has issues - check health endpoint"
    exit 1
fi