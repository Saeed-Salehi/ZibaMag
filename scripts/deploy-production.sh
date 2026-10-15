#!/usr/bin/env bash
# Deploy latest magazine-api (Strapi) + ZibaMag (Next) to production.
# Usage: ./scripts/deploy-production.sh
#
# - Does NOT upload CMS DB (.tmp) or media (public/uploads)
# - Stops Next before replacing .next (avoids mixed builds)
set -euo pipefail

SSH_HOST="temp@79.141.168.50"
SSH_PORT="56777"
SSH_CMD="ssh -p ${SSH_PORT} ${SSH_HOST}"
RSYNC_SSH="ssh -p ${SSH_PORT}"
TUNNEL_PORT="1338"

API="/Users/saeeds2/Documents/projects/magazine-api"
WEB="/Users/saeeds2/Documents/projects/ZibaMag"

cleanup_tunnel() {
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -t -iTCP:"${TUNNEL_PORT}" -sTCP:LISTEN 2>/dev/null || true)"
    [[ -n "$pids" ]] && kill $pids 2>/dev/null || true
  fi
}
trap cleanup_tunnel EXIT

echo "==> [1/5] Build Strapi admin + rsync API (no db/uploads)"
(
  cd "$API"
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use 10.17.0 || nvm use 14
  export NODE_ENV=production
  yarn build
)
rsync -avz -e "$RSYNC_SSH" \
  --exclude node_modules/ --exclude .cache/ --exclude .tmp/ --exclude .tmp/** \
  --exclude '**/data.db' --exclude '**/data.db-*' --exclude '**/*.db' \
  --exclude '**/*.db-journal' --exclude '**/*.sqlite' --exclude '**/*.sqlite3' \
  --exclude public/uploads/ --exclude public/uploads/** --exclude .git/ \
  "$API/" "${SSH_HOST}:~/magazine-api/"

echo "==> [2/5] Restart magazine-api on server"
$SSH_CMD bash -s <<'REMOTE'
set -euo pipefail
source ~/.bashrc 2>/dev/null || source ~/.profile 2>/dev/null || true
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd ~/magazine-api
nvm use 14 || nvm use 10
export NODE_ENV=production NODE_OPTIONS="--max-old-space-size=1024"
if [[ -f .env ]]; then
  grep -q '^HOST=' .env && sed -i.bak 's/^HOST=.*/HOST=127.0.0.1/' .env || echo 'HOST=127.0.0.1' >> .env
else
  printf 'HOST=127.0.0.1\nPORT=1337\n' > .env
fi
yarn install --production --frozen-lockfile || yarn install --production
pm2 delete magazine-api 2>/dev/null || true
pm2 start ecosystem.config.js --only magazine-api --update-env
for i in $(seq 1 15); do
  curl -sf http://127.0.0.1:1337/articles >/dev/null && echo "magazine-api OK" && exit 0
  sleep 2
done
pm2 logs magazine-api --lines 30 --nostream || true
exit 1
REMOTE

echo "==> [3/5] Tunnel + clean Next production build"
cleanup_tunnel
ssh -f -N -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes \
  -L "${TUNNEL_PORT}:127.0.0.1:1337" -p "${SSH_PORT}" "${SSH_HOST}"
sleep 2
curl -sf "http://127.0.0.1:${TUNNEL_PORT}/articles" >/dev/null
(
  cd "$WEB"
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use 20
  rm -rf .next
  export NODE_ENV=production
  export API_URL="http://127.0.0.1:${TUNNEL_PORT}"
  yarn build
)
BUILD_ID="$(cat "$WEB/.next/BUILD_ID")"
echo "BUILD_ID=${BUILD_ID}"
cleanup_tunnel

echo "==> [4/5] Stop Next, wipe remote .next, upload web + build"
$SSH_CMD bash -s <<'REMOTE'
set -euo pipefail
pm2 delete zibamag 2>/dev/null || true
pkill -f 'next start' 2>/dev/null || true
command -v fuser >/dev/null && fuser -k 3000/tcp 2>/dev/null || true
if command -v lsof >/dev/null; then
  PIDS="$(lsof -t -iTCP:3000 -sTCP:LISTEN 2>/dev/null || true)"
  [[ -n "$PIDS" ]] && kill -9 $PIDS 2>/dev/null || true
fi
rm -rf ~/ZibaMag/.next
REMOTE

rsync -avz -e "$RSYNC_SSH" \
  --exclude node_modules/ --exclude .next/ --exclude .git/ --exclude .tmp/ --exclude '**/*.db' \
  "$WEB/" "${SSH_HOST}:~/ZibaMag/"
rsync -avz --delete -e "$RSYNC_SSH" \
  "$WEB/.next/" "${SSH_HOST}:~/ZibaMag/.next/"

echo "==> [5/5] Start zibamag + verify"
$SSH_CMD bash -s <<REMOTE
set -euo pipefail
source ~/.bashrc 2>/dev/null || source ~/.profile 2>/dev/null || true
export NVM_DIR="\$HOME/.nvm"; [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
cd ~/ZibaMag
EXPECTED='${BUILD_ID}'
[[ "\$(cat .next/BUILD_ID)" == "\$EXPECTED" ]] || { echo "BUILD_ID mismatch on disk"; exit 1; }
grep -q "\$EXPECTED" .next/server/pages/index.html || { echo "index.html missing BUILD_ID"; exit 1; }

nvm use 20 || nvm use 16
export NODE_ENV=production NODE_OPTIONS="--max-old-space-size=1024"
if [[ -f .env.production ]]; then
  grep -q '^API_URL=' .env.production \\
    && sed -i.bak 's|^API_URL=.*|API_URL=http://127.0.0.1:1337|' .env.production \\
    || echo 'API_URL=http://127.0.0.1:1337' >> .env.production
else
  printf 'API_URL=http://127.0.0.1:1337\\nNEXT_PUBLIC_SITE_URL=https://zibamag.ir\\n' > .env.production
fi
yarn install --production --frozen-lockfile || yarn install --production
pm2 start ecosystem.config.js --only zibamag --update-env
pm2 save

for i in \$(seq 1 15); do curl -sf -o /dev/null http://127.0.0.1:3000/ && break; sleep 1; done
SERVED="\$(curl -s http://127.0.0.1:3000/ | grep -oE '_next/static/[A-Za-z0-9_-]+/_buildManifest\\.js' | head -1 | sed -E 's|_next/static/([^/]+)/.*|\\1|')"
echo "served=\$SERVED expected=\$EXPECTED"
[[ "\$SERVED" == "\$EXPECTED" ]] || exit 1
curl -s -o /dev/null -w "api:%{http_code}\\n" http://127.0.0.1:1337/articles
curl -s -o /dev/null -w "web:%{http_code}\\n" http://127.0.0.1:3000/
pm2 list
REMOTE

echo "==> Done. Hard-refresh https://www.zibamag.ir  (BUILD_ID=${BUILD_ID})"
