#!/usr/bin/env bash
set -euo pipefail

ISSUER_DIR="${ISSUER_DIR:-$HOME/issuer-node}"
MODE="${1:-registry}"

if [[ ! -d "$ISSUER_DIR" ]]; then
  echo "Issuer repo not found at: $ISSUER_DIR"
  echo "Clone it first: git clone https://github.com/0xPolygonID/issuer-node.git $ISSUER_DIR"
  exit 1
fi

cd "$ISSUER_DIR"

if [[ "$MODE" == "source" ]]; then
  echo "Starting issuer from source build..."
  make run-all
else
  echo "Starting issuer from registry images..."
  make run-all-registry
fi

echo "Done. Check containers with: docker ps"
