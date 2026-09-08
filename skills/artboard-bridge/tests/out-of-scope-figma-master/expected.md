---
mode: Out-of-scope
references: []
first-tool: (none)
out-of-scope: true
---

# Out-of-scope — Figma master → code is design-to-code

No artboard, no Claude Design project in the request.

## Required surface

1. Says in one sentence that this is `design-to-code` Build and hands over.
2. Loads none of this skill's references; calls no `claude-design` tool.
3. Optionally offers Publish afterwards ("once it is verified I can publish the sheet").

## Regressions to flag

- Opens a Claude Design project looking for an AtlToast sheet → **Critical**.
- Starts the Intake checklist → **Critical** — scope creep.
