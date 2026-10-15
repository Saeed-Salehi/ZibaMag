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

echo "==> [1/7] Build magazine-api admin (production)"
(
  cd "$MAGAZINE_API"
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use 10.17.0 || nvm use 14
  export NODE_ENV=production
  yarn build
)

echo "==> [2/7] Rsync magazine-api CODE ONLY (no db, no uploads)"
rsync -avz -e "$RSYNC_SSH" \
  "${RSYNC_API_EXCLUDES[@]}" \
  "$MAGAZINE_API/" \
  "${SSH_HOST}:~/magazine-api/"

echo "==> [3/7] Restart magazine-api on server (new models before Next build)"
$SSH_CMD bash -s <<'REMOTE'
set -euo pipefail
source ~/.bashrc 2>/dev/null || source ~/.profile 2>/dev/null || true
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd ~/magazine-api
nvm use 14 || nvm use 10
node -v
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"
if [[ -f .env ]]; then
  grep -q '^HOST=' .env && sed -i.bak 's/^HOST=.*/HOST=127.0.0.1/' .env || echo 'HOST=127.0.0.1' >> .env
else
  printf 'HOST=127.0.0.1\nPORT=1337\n' > .env
fi
yarn install --production --frozen-lockfile || yarn install --production
pm2 delete magazine-api 2>/dev/null || true
pm2 start ecosystem.config.js --only magazine-api --update-env
# Wait until API answers
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf http://127.0.0.1:1337/articles >/dev/null; then
    echo "magazine-api healthy"
    exit 0
  fi
  sleep 2
done
echo "magazine-api did not become healthy" >&2
pm2 logs magazine-api --lines 40 --nostream || true
exit 1
REMOTE

echo "==> [4/7] SSH tunnel to server Strapi (127.0.0.1:1337) for content build"
cleanup_tunnel
ssh -f -N \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=10 \
  -o ExitOnForwardFailure=yes \
  -L "${TUNNEL_LOCAL_PORT}:127.0.0.1:1337" \
  -p "${SSH_PORT}" \
  "${SSH_HOST}"
sleep 2
TUNNEL_PID="$(lsof -t -iTCP:"${TUNNEL_LOCAL_PORT}" -sTCP:LISTEN 2>/dev/null | head -1 || true)"
if ! curl -sf "http://127.0.0.1:${TUNNEL_LOCAL_PORT}/articles" >/dev/null; then
  echo "Tunnel to Strapi failed. Is magazine-api running on the server?" >&2
  exit 1
fi
echo "Tunnel OK on 127.0.0.1:${TUNNEL_LOCAL_PORT}"

echo "==> [5/7] Build ZibaMag from SERVER content via tunnel"
(
  cd "$ZIBAMAG"
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use 20
  export NODE_ENV=production
  # Must win over .env.production (which points at 127.0.0.1:1337 for on-server runtime)
  export API_URL="http://127.0.0.1:${TUNNEL_LOCAL_PORT}"
  # Keep SSG gentler on the SSH tunnel
  export UV_THREADPOOL_SIZE=4
  yarn build
)
cleanup_tunnel

echo "==> [6/7] Rsync ZibaMag source + .next"
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

echo "==> [7/7] Restart zibamag on server"
$SSH_CMD bash -s <<'REMOTE'
set -euo pipefail
source ~/.bashrc 2>/dev/null || source ~/.profile 2>/dev/null || true
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd ~/ZibaMag
nvm use 20 || nvm use 16
node -v
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"
# Runtime must talk to loopback Strapi on the server
if [[ -f .env.production ]]; then
  grep -q '^API_URL=' .env.production \
    && sed -i.bak 's|^API_URL=.*|API_URL=http://127.0.0.1:1337|' .env.production \
    || echo 'API_URL=http://127.0.0.1:1337' >> .env.production
else
  printf 'API_URL=http://127.0.0.1:1337\nNEXT_PUBLIC_SITE_URL=https://zibamag.ir\n' > .env.production
fi
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
