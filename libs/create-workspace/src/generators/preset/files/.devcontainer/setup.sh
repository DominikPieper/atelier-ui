#!/usr/bin/env bash
# Post-create setup for Atelier UI Codespaces container.
# Installs Claude Code CLI, workspace deps, and runs the preflight check.
set -euo pipefail

echo ""
echo "┌──────────────────────────────────────────────────┐"
echo "│  Atelier UI — Codespaces setup                   │"
echo "└──────────────────────────────────────────────────┘"
echo ""

# 1. Claude Code CLI (global npm install — no privileged access required)
if ! command -v claude >/dev/null 2>&1; then
  echo "→ Installing Claude Code CLI…"
  npm install -g @anthropic-ai/claude-code
else
  echo "✓ Claude Code CLI already installed"
fi

# 2. Workspace dependencies
if [ -f package-lock.json ]; then
  echo "→ Installing workspace dependencies (npm ci)…"
  npm ci --no-audit --no-fund
else
  echo "→ Installing workspace dependencies (npm install)…"
  npm install --no-audit --no-fund
fi

# 3. Preflight check
echo ""
if [ -f tools/scripts/preflight.mjs ]; then
  echo "→ Running preflight…"
  node tools/scripts/preflight.mjs || true
else
  echo "ℹ preflight script not found (skipped)"
fi

# 4. Next steps
cat <<'EOF'

┌──────────────────────────────────────────────────┐
│  Ready.                                          │
│                                                  │
│  Next steps:                                     │
│    1. Set FIGMA_ACCESS_TOKEN in Codespaces       │
│       Settings → Secrets (if not already set)    │
│    2. Open the Claude Code side panel            │
│    3. Serve docs:    npx nx serve docs           │
│    4. Open a Storybook:                          │
│         npx nx run angular:storybook             │
│                                                  │
│  Troubleshooting:                                │
│    https://atelier.pieper.io/troubleshooting     │
└──────────────────────────────────────────────────┘
EOF
