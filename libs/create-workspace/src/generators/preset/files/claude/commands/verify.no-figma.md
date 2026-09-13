---
description: Run this workspace's four verification gates and report each one's exit code.
---

Run these four checks, in order, and report each one's exit code — never a
single pass/fail summary. A gate's result is its exit code: run it as

```
<command> > /tmp/verify-<name>.log 2>&1; echo $?
```

and read the log file afterwards. Never pipe a gate into `head` or `grep` to
read it — the pipe's own exit status is always `0`, which silently turns a
failing gate into a passing one.

1. `npm run check:format` — Prettier
2. `npm run check:stylelint` — the ported CSS-discipline rules
3. `npm run check:unit` — jsdom unit tests (components, composables, helpers)
4. `npm run check:stories` — every story, rendered in Chromium, axe-checked

This workspace was scaffolded without Figma (`--no-figma`) — there is no
`check:contracts` here (ADR-0144: a contract is the set of deliberate Figma ↔
code mismatches, and with no Figma there is nothing for one to disagree with).

Report a short table: check name → exit code → pass/fail. For any non-zero
exit code, show only the relevant lines from that check's log (not the whole
log) and stop there — do not attempt a fix unless asked to.
