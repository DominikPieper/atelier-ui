---
mode: Audit
references:
  - audit-verify-queries.md
  - audit-checklist.md
first-tool: figma_execute
out-of-scope: false
---

# Audit mode — Re-verify sub-mode against an existing report

The user has an existing audit and is explicitly asking whether findings are still relevant before acting. This is the Re-verify sub-mode, not a fresh deep-audit.

## Required surface

1. **Open the existing audit `.md`** and extract the priority list of open findings (anything not already marked `auto-resolved` from a previous re-verify pass).
2. **Run only the verify queries** from `references/audit-verify-queries.md` — one query per finding, in the category the finding belongs to (TA / CD / N / FS / ES). Do not redo the full deep-audit; the user explicitly said "re-check", not "re-audit".
3. **Emit one line per finding** in the canonical format:
   ```
   {finding-id}: {still-open | auto-resolved | state-shifted} — {one-sentence current state}
   ```
4. **Update the report's Re-verify table** (the optional section at the bottom of `assets/audit-report-template.md`) with the result and an ISO timestamp per finding.
5. **Apply triage to the priority list**:
   - Drop `auto-resolved` rows.
   - Rewrite `state-shifted` rows so the description matches current reality before any fix is attempted.
   - Leave `still-open` rows in place; their effort estimate stands.
6. **Honour the BOOLEAN exemption** for TA4 — feature flags (`feature/reduce-motion`, `feature/high-contrast`) are never bound into design properties, so an `ALL_SCOPES` count on them is a no-op, not a finding. The verify query in `audit-verify-queries.md` already filters them out.

## Regressions to flag

- Agent re-runs the full deep-audit from `audit-checklist.md` end-to-end → **Critical** — defeats the point of Re-verify and produces noise the user has to re-triage.
- Agent acts on a finding without running its verify query → **Critical** — this is the original failure mode that Re-verify exists to prevent.
- Agent counts BOOLEAN feature-flag variables in TA4 ALL_SCOPES → **Warning** — the verify query excludes them; doing so re-introduces stale findings.
- Agent emits `still-open` for every finding without actually running the queries → **Blocker** — false confirmation that everything is current.
- Agent does not write the result back to the audit `.md` Re-verify table → **Suggestion** — the next reader (including future-self) loses the pin point.
