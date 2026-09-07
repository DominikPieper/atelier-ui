# The handoff document

A checklist, not a schema (ADR-0096). Its value is that the author decides what is in scope
and writes the behaviour down in their own words; a form would let them fill fields
without making the decisions. Write it as `tasks/handoff-<component>.md` (or wherever the
user keeps it) and show it before generating anything.

## Template

```markdown
# Handoff — <AtlName> · <framework>

**Source.** Figma file <key or "duplicate of Atelier in <name>'s drafts">, node `<id>`,
page Components, section <category>. Snapshot: Figma lastModified <stamp>, repo <sha>.

**Canonical record.** uianatomy `<id>` (lastReviewed <date>) — or "composition of
<a> + <b>; no canonical record".

**Reuse or new.** <new component | extends Atl<X> | composes Atl<Y> + Atl<Z>>. Why.

**In scope.** variants: <axis=values>; states: <list>. Interaction states (hover, focus,
active, disabled) are CSS, not variants.

**Explicitly out.** <variants/states/props deferred>, and where they are documented.

**Token bindings.** fill → `--ui-…`, border → `--ui-…`, radius → `--ui-radius-…`,
padding/gap → `--ui-spacing-…`, type → `--ui-font-size-…` / `--ui-type-…`.
Elevation: <none | CSS-only `--ui-shadow-…`, no Figma variable exists>.

**Behaviour (from the brief, not visible in the master).** <keyboard, timers, live
region politeness, focus management, dismissal>.

**Accessibility obligations.** <from the brief's a11y section; the blocker-severity
mistakes it names>.

**Target files.** libs/<fw>/src/lib/<name>/… ; spec block in libs/spec/src/index.ts.

**Acceptance.** nx test, nx lint exit 0; story has `tags: ['autodocs']`; parity run with
sections <visual, spacing, typography, accessibility>; discrepancies listed and decided;
parity:record written.
```

## Worked example (abridged) — Toast, Angular

Source: duplicate of Atelier, node `901:12`, Components/Feedback. Canonical: uianatomy
`toast` (2026-05-04, past the 90-day threshold — strong prior). Reuse: new component;
composes AtlIcon for the status glyph. In scope: `variant=success|danger`, states
default + dismissing. Out: `info`, `warning`, stacking, action slot — documented in the
brief. Tokens: fill `--ui-color-success-bg`, text `--ui-color-success-text`, radius
`--ui-radius-md`, padding `--ui-spacing-3`/`--ui-spacing-4`; elevation CSS-only
`--ui-shadow-md`. Behaviour: auto-dismiss 5 s, timer pauses on hover and focus, resumes on
leave; Escape dismisses; `role="status"` + `aria-live="polite"` for success, `assertive`
for danger. A11y: colour never the only signal (glyph + text). Acceptance: as template.
