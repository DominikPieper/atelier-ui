#!/usr/bin/env bash
# Regenerate package-lock.json in a Linux environment matching CI.
#
# Why: npm writes `devOptional` vs `dev` markers differently depending on
# which optional platform deps are installed. macOS and Linux therefore
# produce non-identical lockfiles. CI (publish.yml + checks) runs on Linux,
# so the lockfile CI commits back is "Linux-flavored". If you run
# `npm install` on macOS you'll flip those markers and re-introduce drift.
#
# Run this ONLY when you've actually changed package.json (added/removed/
# upgraded a dep). For day-to-day installs use `npm ci`.

set -euo pipefail

cd "$(dirname "$0")/../.."

node_version=$(cat .node-version)

docker run --rm \
  -v "$PWD":/app \
  -w /app \
  "node:${node_version}" \
  sh -c "corepack enable && npm install --package-lock-only --ignore-scripts"

echo
echo "Lockfile regenerated in Linux/Node ${node_version} environment."
echo "Review the diff and commit alongside your package.json change."
