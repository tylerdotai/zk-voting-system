#!/usr/bin/env bash
set -euo pipefail

API_URL="${ISSUER_API_URL:-http://localhost:3001}"
USER="${ISSUER_API_USER:-demo-issuer}"
PASS="${ISSUER_API_PASSWORD:-change-me}"
DISPLAY_NAME="${1:-FW DAO Issuer}"

AUTH=$(printf "%s:%s" "$USER" "$PASS" | base64)

curl -sS -X POST "$API_URL/v2/identities" \
  -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  -d "{\"didMetadata\":{\"method\":\"polygonid\",\"blockchain\":\"polygon\",\"network\":\"amoy\",\"type\":\"BJJ\"},\"displayName\":\"$DISPLAY_NAME\"}"

echo
