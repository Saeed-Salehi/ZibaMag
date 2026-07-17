#!/usr/bin/env bash
# Deploy ZibaMag + magazine-api to production (79.141.168.50)
# Usage (from Mac): ./scripts/deploy-production.sh
#
# SAFETY: Never uploads CMS data (.tmp/data.db) or media (public/uploads).
# Strapi binds to 127.0.0.1 — Mac build uses an SSH tunnel to fetch content.
set -euo pipefail

SSH_HOST="temp@79.141.168.50"
SSH_PORT="56777"
SSH_CMD="ssh -p ${SSH_PORT} ${SSH_HOST}"
RSYNC_SSH="ssh -p ${SSH_PORT}"
TUNNEL_LOCAL_PORT="1338"

MAGAZINE_API="/Users/saeeds2/Documents/projects/magazine-api"
ZIBAMAG="/Users/saeeds2/Documents/projects/ZibaMag"

RSYNC_API_EXCLUDES=(
  --exclude node_modules/
  --exclude .cache/
  --exclude .tmp/
  --exclude .tmp/**
  --exclude '**/data.db'
  --exclude '**/data.db-*'
  --exclude '**/*.db'
  --exclude '**/*.db-journal'
  --exclude '**/*.sqlite'
  --exclude '**/*.sqlite3'
  --exclude public/uploads/
  --exclude public/uploads/**
  --exclude .git/
)

cleanup_tunnel() {
  if [[ -n "${TUNNEL_PID:-}" ]] && kill -0 "$TUNNEL_PID" 2>/dev/null; then
    kill "$TUNNEL_PID" 2>/dev/null || true
  fi
  # Also clear any leftover listener on the tunnel port
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -t -iTCP:"${TUNNEL_LOCAL_PORT}" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
      kill $pids 2>/dev/null || true
    fi
  fi
}
trap cleanup_tunnel EXIT

echo "==> SAFETY: CMS database (.tmp) and public/uploads will NOT be uploaded"

echo "==> [1/6] Build magazine-api admin (production)"
(
  cd "$MAGAZINE_API"
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use 10.17.0 || nvm use 14
  export NODE_ENV=production
  yarn build
)

echo "==> [2/6] Rsync magazine-api CODE ONLY (no db, no uploads)"
rsync -avz -e "$RSYNC_SSH" \
  "${RSYNC_API_EXCLUDES[@]}" \
  "$MAGAZINE_API/" \
  "${SSH_HOST}:~/magazine-api/"

echo "==> [3/6] SSH tunnel to server Strapi (127.0.0.1:1337) for content build"
cleanup_tunnel
ssh -f -N -L "${TUNNEL_LOCAL_PORT}:127.0.0.1:1337" -p "${SSH_PORT}" "${SSH_HOST}"
sleep 1
TUNNEL_PID="$(lsof -t -iTCP:"${TUNNEL_LOCAL_PORT}" -sTCP:LISTEN 2>/dev/null | head -1 || true)"
if ! curl -sf "http://127.0.0.1:${TUNNEL_LOCAL_PORT}/articles" >/dev/null; then
  echo "Tunnel to Strapi failed. Is magazine-api running on the server?" >&2
  exit 1
fi

echo "==> [4/6] Build ZibaMag from SERVER content via tunnel"
(
  cd "$ZIBAMAG"
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use 20
  export NODE_ENV=production
  export API_URL="http://127.0.0.1:${TUNNEL_LOCAL_PORT}"
  yarn build
)
cleanup_tunnel

echo "==> [5/6] Rsync ZibaMag source + .next"
rsync -avz -e "$RSYNC_SSH" \
  --exclude node_modules/ \
  --exclude .next/ \
  --exclude .git/ \
  --exclude .tmp/ \
  --exclude '**/*.db' \
  "$ZIBAMAG/" \
  "${SSH_HOST}:~/ZibaMag/"

rsync -avz -e "$RSYNC_SSH" \
  "$ZIBAMAG/.next/" \
  "${SSH_HOST}:~/ZibaMag/.next/"

echo "==> [6/6] Restart pm2 in production mode on server"
$SSH_CMD bash -s <<'REMOTE'
set -euo pipefail
source ~/.bashrc 2>/dev/null || source ~/.profile 2>/dev/null || true
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "--- magazine-api ---"
cd ~/magazine-api
nvm use 14 || nvm use 10
node -v
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"
# Ensure Strapi stays on loopback
if [[ -f .env ]]; then
  grep -q '^HOST=' .env && sed -i.bak 's/^HOST=.*/HOST=127.0.0.1/' .env || echo 'HOST=127.0.0.1' >> .env
else
  printf 'HOST=127.0.0.1\nPORT=1337\n' > .env
fi
yarn install --production --frozen-lockfile || yarn install --production
pm2 delete magazine-api 2>/dev/null || true
pm2 start ecosystem.config.js --only magazine-api --update-env

echo "--- zibamag ---"
cd ~/ZibaMag
nvm use 20 || nvm use 16
node -v
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"
yarn install --production --frozen-lockfile || yarn install --production
pm2 delete zibamag 2>/dev/null || true
pm2 start ecosystem.config.js --only zibamag --update-env

pm2 save
pm2 list

echo "Health:"
curl -s -o /dev/null -w "api:%{http_code}\n" http://127.0.0.1:1337/articles
curl -s -o /dev/null -w "web:%{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "uploads_proxy:%{http_code}\n" http://127.0.0.1:3000/uploads/ || true
REMOTE

echo "==> Deploy finished (CMS data was not uploaded)"
