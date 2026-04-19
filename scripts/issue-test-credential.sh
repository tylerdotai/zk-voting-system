#!/usr/bin/env bash
set -euo pipefail

API_URL="${ISSUER_API_URL:-http://localhost:3001}"
USER="${ISSUER_API_USER:-demo-issuer}"
PASS="${ISSUER_API_PASSWORD:-change-me}"
IDENTIFIER="${1:-}"
SCHEMA_URL="${2:-}"
TYPE="${3:-FortWorthDAOMembershipCredential}"
SUBJECT_DID="${4:-}"

if [[ -z "$IDENTIFIER" || -z "$SCHEMA_URL" || -z "$SUBJECT_DID" ]]; then
  echo "Usage: $0 <issuer-identifier-did> <credential-schema-url> <type> <subject-did>"
  echo "Example: $0 did:polygonid:... https://.../schema.json FortWorthDAOMembershipCredential did:polygonid:..."
  exit 1
fi

AUTH=$(printf "%s:%s" "$USER" "$PASS" | base64)

curl -sS -X POST "$API_URL/v2/identities/$IDENTIFIER/credentials" \
  -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  -d "{\"credentialSchema\":\"$SCHEMA_URL\",\"type\":\"$TYPE\",\"credentialSubject\":{\"id\":\"$SUBJECT_DID\",\"membershipId\":\"fwdao-0001\",\"membershipStatus\":\"active\",\"jurisdiction\":\"Fort Worth, TX\",\"memberSince\":20250115,\"votingEligible\":true}}"

echo
