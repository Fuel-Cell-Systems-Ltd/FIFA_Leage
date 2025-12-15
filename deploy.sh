#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/ec2-user/FIFA_Leage"
BACKUP_DIR="/home/ec2-user/fifa-backups"
SERVICE_NAME="fifa-league"

cd "$APP_DIR"

echo "==> [0/6] Preflight"
mkdir -p "$BACKUP_DIR"

ts="$(date +%s)"

echo "==> [1/6] Backup live data (if present)"
if [ -f data.json ]; then
  cp -p data.json "$BACKUP_DIR/data.json.$ts"
  echo "  - backed up data.json -> $BACKUP_DIR/data.json.$ts"
else
  echo "  - data.json not found (skipping)"
fi

if [ -f matches.json ]; then
  cp -p matches.json "$BACKUP_DIR/matches.json.$ts"
  echo "  - backed up matches.json -> $BACKUP_DIR/matches.json.$ts"
else
  echo "  - matches.json not found (skipping)"
fi

echo "==> [2/6] Pull latest code"
git pull --ff-only

echo "==> [3/6] Install deps + build"
npm install
npm run build

echo "==> [4/6] Ensure live data exists (restore latest backup if missing)"
if [ ! -f data.json ]; then
  latest_data="$(ls -t "$BACKUP_DIR"/data.json.* 2>/dev/null | head -1 || true)"
  if [ -n "${latest_data:-}" ]; then
    cp -p "$latest_data" data.json
    echo "  - restored data.json from $latest_data"
  else
    echo "  - no data.json backups exist; app may create it on first run"
  fi
fi

if [ ! -f matches.json ]; then
  latest_matches="$(ls -t "$BACKUP_DIR"/matches.json.* 2>/dev/null | head -1 || true)"
  if [ -n "${latest_matches:-}" ]; then
    cp -p "$latest_matches" matches.json
    echo "  - restored matches.json from $latest_matches"
  else
    echo "  - no matches.json backups exist; app may create it on first run"
  fi
fi

echo "==> [5/6] Restart service"
sudo systemctl restart "$SERVICE_NAME"

echo "==> [6/6] Sanity check (nginx -> app)"
curl -I http://localhost | head -n 1

echo "✅ Deploy complete."
