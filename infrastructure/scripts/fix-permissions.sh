#!/usr/bin/env bash
# Run as root once to fix ownership after pnpm/docker was run with su/root:
#   su -
#   bash /home/digeeshs/Work/paralava/Projects/sarangi/Code/infrastructure/scripts/fix-permissions.sh

set -euo pipefail

PROJECT_DIR="/home/digeeshs/Work/paralava/Projects/sarangi/Code"
OWNER="digeeshs:digeeshs"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: su - then bash $0"
  exit 1
fi

if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "Project not found: $PROJECT_DIR"
  exit 1
fi

echo "Fixing ownership of $PROJECT_DIR -> $OWNER"
chown -R "$OWNER" "$PROJECT_DIR"

echo "Done. Verify:"
ls -la "$PROJECT_DIR/apps/api/.env"
