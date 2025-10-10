#!/usr/bin/env bash

set -euo pipefail

DOMAIN="${DOMAIN:-trading-mvp.com}"

echo "==[DNS CHECK]== $DOMAIN"

dig +short A "$DOMAIN"
dig +short CNAME "$DOMAIN" || true