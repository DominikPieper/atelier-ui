---
status: accepted
date: 2026-09-13
sources:
  - libs/create-workspace/src/generators/preset/files/storybook/{angular,react,vue}/atl-button.stories.* (the templates that changed)
  - libs/{angular,react,vue}/src/lib/button/atl-button.css:154 (the `pointer-events: none` that made the first attempt fail)
  - node_modules/storybook/dist/test/index.js (the `pointerEventsCheck: EachApiCall` default, read)
  - measured 2026-09-12: the CLI e2e against a locally published registry, one scaffolded workspace per framework
  - plan/adr/0121-the-stories-are-the-spec.md (the doctrine the example was contradicting)
---

# ADR-0135: The example is the pattern that gets copied

## Status

Accepted 2026-09-13.

## Context

Every generated workspace ships one example story per app, so that Storybook is not empty
and the attendee has something to duplicate. Until now it was a single `Default` export:
no `play` function, no story per variant, no assertion.

ADR-0121's position — the one this workspace's own `CLAUDE.md` states, and the one
`check:contracts` enforces in the monorepo — is that **the stories are the claims**: one
story per variant value and Boolean state, `args`-based where possible, a `play` per
behaviour line. The scaffold was therefore shipping a counter-example to the doctrine it
teaches, in the one file most likely to be copied. That matters more in a workspace built
for agent-assisted development than it would elsewhere: an agent asked to add a component
reads the neighbours first, and the neighbour was a single argument-less story.

## Decision

The example ships one story per `variant` value and per Boolean state, `args`-based, and
exactly one `play` function carrying a real assertion.

The `play` was first written on the `Disabled` story, asserting the more interesting fact —
that a disabled button suppresses its own click handler. Run against a real generated
workspace, it failed:

```
Unable to perform pointer interaction as the element has `pointer-events: none`:
BUTTON(label=Button)
```

`.atl-button.is-disabled` sets `pointer-events: none` in all three frameworks, and
Storybook's `userEvent` defaults to `pointerEventsCheck: PointerEventsCheckLevel.EachApiCall`,
so the click throws before any assertion runs. Both facts were read — in the stylesheets and
in the installed `storybook/dist/test/index.js` — rather than inferred from the failure.

`userEvent.click(button, { pointerEventsCheck: 0 })` would have made the original assertion
work. **Rejected**, and this is the decision worth recording: the escape hatch is the right
tool in a library's own test suite, where the reader already knows why it is there, and the
wrong thing to put in the one file a beginner copies as their template. The `play` moved to
an enabled story and asserts the positive fact instead — the click handler fires.

`Loading` is the same trap (`isDisabled = disabled || loading`, so it also carries
`.is-disabled`). That is now pinned by a test rather than left for the next person to
rediscover.

## Consequences

`check:stories` in a generated workspace now renders six stories instead of one and runs a
real interaction, so it fails for real reasons — a variant that stops rendering, a `play`
that stops holding, a new axe violation.

The disabled-suppresses-click behaviour is no longer claimed anywhere in the scaffold. It is
covered by the component libraries' own tests, which is where a claim about the library
belongs; the scaffold's example claims something about the attendee's own wiring instead.

The failure is also the argument for running the e2e per step rather than only before a
push. Three unit-test suites, a build, and a docs gate were all green while the generated
workspace's own story suite was red — nothing short of scaffolding a workspace and running
its checks could have said so.
