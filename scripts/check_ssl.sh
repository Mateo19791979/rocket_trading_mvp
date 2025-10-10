#!/usr/bin/env bash

set -euo pipefail

DOMAIN="${DOMAIN:-trading-mvp.com}"

echo "==[SSL CHECK]== $DOMAIN"

set +e
SSL_INFO=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -issuer -subject -dates)
RC=$?
set -e

if [ $RC -ne 0 ]; then
  echo "❌ SSL: échec de récupération du certificat (port 443)."
  exit 2
fi

EXP=$(echo "$SSL_INFO" | grep 'notAfter=' | cut -d= -f2-)
SUB=$(echo "$SSL_INFO" | grep 'subject=' | sed 's/subject= //')
ISS=$(echo "$SSL_INFO" | grep 'issuer='  | sed 's/issuer= //')

echo "✅ SSL OK — Subject: $SUB"
echo "   Issuer : $ISS"
echo "   Expire : $EXP"