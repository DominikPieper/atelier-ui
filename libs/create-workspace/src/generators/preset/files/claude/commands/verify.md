---
description: Run every check listed under "Definition of Done" in CLAUDE.md and report each one's exit code.
---

Read the "Definition of Done" section of `CLAUDE.md` and run every command it lists, in
the order listed, including any line the team added. `CLAUDE.md` is the source: if it
differs from the list below, follow `CLAUDE.md`. As shipped, the list has six checks.
Report each one's exit code — never a single pass/fail summary. A gate's result is its
exit code: run it as

```
<command> > /tmp/verify-<name>.log 2>&1; echo $?
```

and read the log file afterwards. Never pipe a gate into `head` or `grep` to
read it — the pipe's own exit status is always `0`, which silently turns a
failing gate into a passing one.

The six as shipped:

1. `npm run check:format` — Prettier
2. `npm run check:stylelint` — the ported CSS-discipline rules
3. `npm run lint` — ESLint (strict, type-aware)
4. `npm run build` — the compiler
5. `npm run check:unit` — jsdom unit tests (components, composables, helpers)
6. `npm run check:stories` — every story, rendered in Chromium, axe-checked

Report a short table: check name → exit code → pass/fail. For any non-zero
exit code, show only the relevant lines from that check's log (not the whole
log) and stop there — do not attempt a fix unless asked to.
