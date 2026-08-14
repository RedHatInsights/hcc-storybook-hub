#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PARENT_DIR="$(dirname "$PROJECT_DIR")"

declare -A REPOS=(
  ["access-requests-frontend"]=6010
  ["insights-rbac-ui"]=6011
  ["notifications-frontend"]=6012
  ["service-accounts"]=6013
  ["sources-ui"]=6014
  ["user-preferences-frontend"]=6015
)

PIDS=()

cleanup() {
  echo ""
  echo "Shutting down all servers..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "=== HCC Storybooks — Building and serving all external Storybooks ==="
echo ""

for repo in "${!REPOS[@]}"; do
  port="${REPOS[$repo]}"
  repo_dir="$PARENT_DIR/$repo"

  if [ ! -d "$repo_dir" ]; then
    echo "SKIP: $repo — not found at $repo_dir"
    continue
  fi

  echo "Building: $repo..."
  (cd "$repo_dir" && npm run build-storybook 2>&1 | tail -1)

  static_dir="$repo_dir/storybook-static"
  if [ ! -d "$static_dir" ]; then
    echo "SKIP: $repo — no storybook-static output"
    continue
  fi

  echo "Serving: $repo on port $port"
  npx http-server "$static_dir" -p "$port" -s &
  PIDS+=($!)
done

echo ""
echo "Starting meta Storybook on port 6006..."
echo ""

cd "$PROJECT_DIR"
npx storybook dev -p 6006 &
PIDS+=($!)

echo ""
echo "All servers running. Press Ctrl+C to stop."
wait
