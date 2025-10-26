#!/usr/bin/env bash
set -euo pipefail

# Usage
if [[ "${1:-}" == "" || "${2:-}" == "" || "${3:-}" == "" || "${4:-}" == "" ]]; then
  echo "Usage:  $0  <BASE_URL>  <DEEP_ROUTE>  <PDF_PATH>  <HEALTH_PATH>"
  echo "Ex:     $0 https://trading-mvp.com /unified-dashboard /docs/whitepaper.pdf /api/health"
  exit 1
fi

BASE="$1"; DEEP="$2"; PDF="$3"; HEALTH="$4"
GREEN='\033[1;32m'; RED='\033[1;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

say_ok(){ echo -e "${GREEN}✅ $*${NC}"; }
say_warn(){ echo -e "${YELLOW}⚠️  $*${NC}"; }
say_bad(){ echo -e "${RED}❌ $*${NC}"; }

curl_h() { curl -sS -D - -o /dev/null "$1"; }
curl_b() { curl -sS -o /dev/null -w "%{http_code}" "$1"; }
get_hdr() { awk -v k="$1:" 'BEGIN{IGNORECASE=1} $0 ~ "^"k{print substr($0,index($0,":")+2)}' ; }

echo "=== Rocket Trading MVP — Diagnostic rapide ==="
echo "Base:   $BASE"
echo "Route:  $DEEP"
echo "PDF:    $PDF"
echo "Health: $HEALTH"
echo

FAIL=0

# 1) SPA / Deep route => 200 + <html
H1=$(curl_h "$BASE$DEEP")
C1=$(echo "$H1" | tail -n1) # body discarded
S1=$(echo "$H1" | head -n1 | awk '{print $2}')
if [[ "$S1" == "200" || "$S1" == "304" ]]; then
  say_ok "SPA routing OK (deep route renvoie $S1)."
else
  FAIL=$((FAIL+1))
  say_bad "SPA routing KO (deep route renvoie $S1). Il faut un fallback vers /index.html."
fi

# 2) API/Health -> 200 + JSON
H2=$(curl_h "$BASE$HEALTH" || true)
S2=$(echo "$H2" | head -n1 | awk '{print $2}')
CT2=$(echo "$H2" | get_hdr "Content-Type")
if [[ "$S2" == "200" ]]; then
  say_ok "API Health OK ($S2, $CT2)."
else
  FAIL=$((FAIL+1))
  say_bad "API Health KO ($S2). Vérifie le reverse proxy / API upstream."
fi

# 3) PDF headers
H3=$(curl_h "$BASE$PDF" || true)
S3=$(echo "$H3" | head -n1 | awk '{print $2}')
CT3=$(echo "$H3" | get_hdr "Content-Type")
AR3=$(echo "$H3" | get_hdr "Accept-Ranges")
if [[ "$S3" == "200" && "$CT3" =~ application/pdf ]]; then
  if [[ "$AR3" =~ bytes ]]; then
    say_ok "PDF OK ($S3, Content-Type=application/pdf, Accept-Ranges=bytes)."
  else
    say_warn "PDF partiel: Accept-Ranges manquant. Ajoute 'Accept-Ranges: bytes' pour un scroll fluide."
  fi
else
  FAIL=$((FAIL+1))
  say_bad "PDF KO (status=$S3, Content-Type=$CT3). Le viewer peut échouer (nosniff/MIME)."
fi

# 4) Service Worker
S4=$(curl_b "$BASE/sw.js" || true)
if [[ "$S4" == "200" ]]; then
  say_ok "Service Worker présent (/sw.js)."
else
  say_warn "Pas de SW (ou non accessible). Ce n'est pas bloquant, mais l'overlay Offline peut venir d'un SW ancien."
fi

# 5) CSP : frame/pdf
H5=$(curl_h "$BASE" || true)
CSP=$(echo "$H5" | get_hdr "Content-Security-Policy")
if [[ "$CSP" == "" ]]; then
  say_warn "Pas de CSP détectée. OK pour debug, mais ajoute une CSP plus tard."
else
  echo "CSP: $CSP" | sed 's/^/    /'
  if echo "$CSP" | grep -qi "frame-src"; then
    say_ok "CSP définit frame-src (OK pour PDF en <iframe>)."
  else
    say_warn "CSP sans frame-src: si tu affiches PDF en <iframe>, ajoute 'frame-src self'."
  fi
  if echo "$CSP" | grep -qi "object-src 'none'"; then
    say_ok "CSP object-src 'none' (bien) — si tu utilises <embed> PDF, il faudra l'assouplir."
  fi
fi

echo
if [[ "$FAIL" -eq 0 ]]; then
  say_ok "DIAGNOSTIC GLOBAL: OK ✅"
else
  say_bad "DIAGNOSTIC GLOBAL: $FAIL problème(s) à corriger ❌"
  echo "Voir les sections correctives ci-dessous."
fi

cat <<'TIPS'

=== PISTES DE CORRECTION EXPRESS ===

[SPA/404]
- Reverse proxy: try_files $uri $uri/ /index.html; et error_page 404 /index.html.

[API/Health]
- Vérifie upstream, DNS, ports, timeouts (proxy_read_timeout >= 30s).

[PDF]
- Toujours 'Content-Type: application/pdf' et 'Accept-Ranges: bytes'
- Évite 'nosniff' si le MIME est incorrect côté serveur.

[Service Worker]
- Déploie sw.js network-first pour l'HTML et no-cache pour *.pdf (voir bloc SW ci-dessous).
- Incrémente CACHE_VER à chaque release.

[CSP]
- Autorise le PDF via <iframe> : ajouter frame-src 'self';
- Si <embed>, object-src doit inclure 'self' (ou préfère <iframe>).

TIPS