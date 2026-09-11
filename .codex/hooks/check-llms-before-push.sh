#!/usr/bin/env bash
# PreToolUse hook: block `git push` when docs/public/llms*.txt is stale.
#
# Why: `chore(release)` commits do not regenerate llms.txt. Pushing without a
# regen leaves the public LLM index drifting from the shipped library version.
# The hook runs `npm run check:llms` only when the Bash tool call looks like
# a push, then exits 2 to feed the failure reason back to Claude — Claude
# then runs `npm run gen:llms`, commits the result, and retries.

set -u

input="$(cat)"

cmd="$(printf '%s' "$input" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
print(data.get("tool_input", {}).get("command", ""))
')"

case "$cmd" in
  *"git push"*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

if ! npm run --silent check:llms >/dev/null 2>&1; then
  cat >&2 <<'MSG'
llms.txt drift detected — push blocked.

`docs/public/llms.txt` and/or `docs/public/llms-full.txt` are out of sync with
`docs/src/data/components.ts`. Regenerate and commit before pushing:

  npm run gen:llms
  git add docs/public/llms.txt docs/public/llms-full.txt
  git commit -m "chore(docs): regen llms.txt"

Then retry the push.
MSG
  exit 2
fi

exit 0
