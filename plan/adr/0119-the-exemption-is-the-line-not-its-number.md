---
status: accepted
date: 2026-09-09
sources:
  - tasks/todo.md (2026-09-09 grab-bag item: "Gate design: SCAFFOLD_PORT_EXEMPT is keyed by file:line")
  - tools/scripts/lib/allowlists.js (scaffoldPortKey, SCAFFOLD_PORT_EXEMPT)
  - tools/scripts/check-docs-sync.js (checkScaffoldPortCitations, [PORT-6006])
  - plan/adr/0084-two-environments-one-canonical-per-audience.md (the ADR SCAFFOLD_PORT_EXEMPT implements)
---

# ADR-0119: The exemption is the line, not its number

## Status

Accepted.

## Context

`SCAFFOLD_PORT_EXEMPT` (`tools/scripts/lib/allowlists.js`) names the four
places `docs/src/pages/**` legitimately cites Storybook's scaffold-only port
6006 (ADR-0084) — the terminal mockups in `workshop.astro`, one sentence in
`storybook.astro`, one entry title in `troubleshooting.astro`. `check-docs-sync.js`'s
`[PORT-6006]` check (`checkScaffoldPortCitations`) walks every line under
`docs/src/pages/**`, and for any line containing `6006` not named in the
allowlist, fails the build.

The allowlist was keyed `<file>:<line number>`. That key is only valid until
something else in the same file changes the line count above it — and
`docs/src/pages/**` is edited constantly, by design (it is the workshop's own
documentation, actively maintained, often by more than one agent at once).
On 2026-09-09 that cost a real wrong diagnosis: a purely additive edit in one
of the exempt files shifted the line numbers of two of the four exemptions
below their old positions. `check:docs` went red on the shifted lines. An
agent working on unrelated content saw `[PORT-6006]` failures in files it had
not touched, ran `git show HEAD` to check whether the failing lines existed
in the last commit, found they did not (because the local edit that moved
them was itself uncommitted), and concluded the failures were pre-existing —
when the citations themselves had not changed at all, only their line
numbers had. All three exemption entries (the two `workshop.astro` lines
included) then had to be renumbered by hand for an edit that changed nothing
about what was actually exempt.

The underlying defect is structural, not a one-off: a `file:line` key encodes
_where_ a fact currently sits, not _what_ the fact is. Every edit anywhere
above the line is a silent invalidation of every allowlist entry keyed to a
line below it, in the same file, regardless of whether that edit has
anything to do with the exemption's subject. The failure message compounds
this: it names the file holding the (unmoved, still-correct) citation, which
reads as "this file has a problem" when the actual cause is `check:docs`
losing track of a citation that never changed.

## Decision

Re-key `SCAFFOLD_PORT_EXEMPT` on content, not position: `scaffoldPortKey(file,
prevLine, line)` joins the repo-relative file path, the trimmed text of the
non-blank source line immediately before the 6006 citation, and the trimmed
text of the citing line itself. `checkScaffoldPortCitations` computes the
identical key while scanning and looks it up — no line numbers enter the key
on either side.

Two lines of context, not one, because a single citing line is not always
unique within a file: `workshop.astro` renders the literal string `Port 6006
… free` in two different preflight-mockup panels ("the successful run" and
"the failed run"). The two occurrences are indistinguishable by their own
text; the line immediately above each is not (port 4200 reads free in one
panel, in-use with a fix hint in the other), so that line is what
disambiguates without inventing an artificial counter.

Alternatives considered:

- **An occurrence ordinal** (`file:trimmedLine#2`) instead of leading
  context. Rejected: it disambiguates the current duplicate correctly, but
  the ordinal is itself positional in miniature — it silently changes
  meaning if a third identical line is ever inserted between the first two,
  with no textual signal that it happened. One line of real content carries
  more information for the same cost.
- **A marker comment placed next to each citation in the doc page itself**
  (the todo item's other named option). Rejected for two reasons, one
  incidental to this task and one structural. Incidental: this task's own
  constraints put `docs/src/pages/**` off limits, so a marker committed to
  the doc page was not available regardless of merit. Structural, and the
  reason it would not be the pick even without that constraint: two of the
  four citations sit inside `<pre>` blocks that render as literal terminal
  output (`workshop.astro`'s mockups) — a comment line inserted there adds a
  source line inside a block whose exact line breaks are the rendered
  content, so a marker there is not free the way it is in ordinary prose.
  Trailing same-line comments would dodge that, but at that point the
  "marker" is just more text on the citing line, which content-keying
  already captures without asking every future citation site to carry
  gate-specific scaffolding.
- **Keep `file:line`, fix only the failure message.** Rejected: a better
  message would have named the real cause sooner, but the allowlist would
  still desync on every reordering edit and still need hand-renumbering
  afterward. The message was a symptom; the key was the defect.

The failure message was rewritten regardless, for the residual case where a
key genuinely does not match: it states plainly that the key is
content-addressed, that a purely additive edit elsewhere cannot be the cause,
that either the citation is new or the citing/context line was itself
edited, and it prints a ready-to-paste `scaffoldPortKey(...)` call built from
the exact text the gate just read — so fixing a real gap no longer requires
hand-transcribing file/line coordinates.

## Consequences

- The 2026-09-09 failure mode is now structurally impossible for this
  allowlist: verified by copying the three affected doc pages into a
  scratchpad, inserting ten filler lines above both `workshop.astro`
  citations (reproducing "purely additive edit shifts an unrelated exempt
  line" exactly), and re-running the real `checkScaffoldPortCitations`
  logic against the copies — it stayed green. A second run that edited a
  citation's own context line (not just inserted content elsewhere) correctly
  failed, with the rewritten message and a ready-to-paste key.
- Adding a new exemption now costs slightly more than typing a line number:
  a human (or agent) copies two lines of source text instead of one integer.
  The failure message's ready-to-paste `scaffoldPortKey(...)` block is the
  mitigation — the exact key the gate wants is printed on the failing run,
  not something to hand-derive.
- The key breaks, correctly, when the citing line or the line immediately
  above it is itself edited — not only when the citation is genuinely new.
  An edit that reformats or rewords the line just above a citation (for
  reasons unrelated to port numbers) will read as an unmatched exemption
  until the allowlist entry is updated to match. This is the same
  re-verify-on-change discipline the rest of `allowlists.js` already applies
  ("each entry is re-verified when its component changes" — file header);
  it is not a new failure mode, only a different trigger than "someone typed
  a new 6006 by hand."
- This is now the shape other line-anchored allowlists in this repo should
  copy if they hit the same problem — none currently are: every other Map in
  `allowlists.js` is keyed on stable identity (`component:check:detail`,
  `component:property:value`), not on a source position, so this defect
  class is specific to allowlists that guard prose rather than component
  facts. `SCAFFOLD_PORT_EXEMPT` was the only one of that shape.
