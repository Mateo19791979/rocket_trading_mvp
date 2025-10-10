#!/bin/bash

# 🧪 Script de Test API Trading MVP
echo "🧪 Tests de validation API Trading MVP"

DOMAIN="api.trading-mvp.com"
BASE_URL="https://$DOMAIN"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_passed=0
test_total=0

# Fonction de test
run_test() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    
    ((test_total++))
    echo -n "Testing $test_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($response)"
        ((test_passed++))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $response)"
    fi
}

# Test détaillé avec contenu
run_detailed_test() {
    local test_name="$1" 
    local url="$2"
    
    ((test_total++))
    echo -n "Testing $test_name... "
    
    response=$(curl -s "$url" --max-time 10)
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
    
    if [ "$status_code" = "200" ] && echo "$response" | grep -q "success\|status\|service"; then
        echo -e "${GREEN}✅ PASS${NC}" echo"   Response preview: $(echo "$response" | jq -r '.status // .service // "OK"' 2>/dev/null || echo "$response" | head -c 50)..."
        ((test_passed++))
    else
        echo -e "${RED}❌ FAIL${NC} (Status: $status_code)"
        echo "   Response: $(echo "$response" | head -c 100)..."
    fi
}

echo "🔄 Démarrage des tests API..." echo"📍 Base URL: $BASE_URL" echo"=================================="

# Tests de base
run_test "Health Check" "$BASE_URL/status" "200" run_test"Root Endpoint""$BASE_URL/" "200" run_test"Scores Endpoint""$BASE_URL/scores" "200" run_test"Selected Strategy""$BASE_URL/select" "200" run_test"Strategies API""$BASE_URL/api/strategies" "200" echo"" echo"🔍 Tests détaillés avec contenu..." echo"=================================="

# Tests détaillés
run_detailed_test "Status with Content" "$BASE_URL/status" run_detailed_test"Scores with Window" "$BASE_URL/scores?window=5"
run_detailed_test "Selected Strategy Data""$BASE_URL/select" echo"" echo"🌐 Tests CORS et Sécurité..." echo"=================================="

# Test CORS
((test_total++))
echo -n "Testing CORS Headers... "
cors_test=$(curl -s -H "Origin: https://trading-mvp.com" -H "Access-Control-Request-Method: GET" -X OPTIONS "$BASE_URL/status" -I)
if echo "$cors_test"| grep -q "Access-Control-Allow-Origin"; then echo -e"${GREEN}✅ PASS${NC}"
    ((test_passed++))
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test sécurité headers  
((test_total++))
echo -n "Testing Security Headers... "
security_test=$(curl -s -I "$BASE_URL/status")
if echo "$security_test"| grep -q "X-Frame-Options\|X-Content-Type-Options"; then echo -e"${GREEN}✅ PASS${NC}"
    ((test_passed++))
else
    echo -e "${YELLOW}⚠️ PARTIAL${NC}"
fi

echo "" echo"📊 RÉSULTATS DES TESTS" echo"==================================" echo"Tests passés: $test_passed/$test_total"

if [ $test_passed -eq $test_total ]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS RÉUSSIS !${NC}"
    echo "✅ Votre API Trading MVP est opérationnelle"
    exit 0
elif [ $test_passed -gt $((test_total / 2)) ]; then
    echo -e "${YELLOW}⚠️ TESTS PARTIELLEMENT RÉUSSIS${NC}"
    echo "🔧 Quelques ajustements peuvent être nécessaires"
    exit 0
else
    echo -e "${RED}❌ ÉCHEC CRITIQUE${NC}"
    echo "🚨 L'API nécessite une attention immédiate"
    exit 1
fi