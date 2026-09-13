---
status: accepted
date: 2026-09-13
sources:
  - libs/create-workspace/src/generators/preset/files/styles/tokens.css (lines ~411-540: `@media (prefers-color-scheme: dark)`, `[data-theme='dark']`, `[data-theme='light']`)
  - libs/{angular,react,vue}/.storybook/preview.{ts,tsx} (pre-change: hand-rolled decorator piggybacking on the `backgrounds` global)
  - node_modules/@storybook/addon-themes/dist/index.js, dist/index.d.ts (10.6.0, read directly)
  - node_modules/@storybook/addon-themes/README.md (10.6.0, "Overriding theme" section — per-story `globals` override)
  - tools/eslint-rules/storybook-version-lockstep.js (the family-version pin this addon joins)
  - AGENTS.md, "Every story is a test" (`check:stories` / `storybook-test`, `parameters.a11y.test: 'error'`)
  - npm view @storybook/addon-themes versions (10.6.0 confirmed on the registry, matching the pinned family)
---

# ADR-0142: Toggling a theme is not testing it

## Status

Accepted.

## Context

The library ships dark-mode tokens (`tokens.css`'s `@media (prefers-color-scheme:
dark)` block, plus `[data-theme='dark']` / `[data-theme='light']` attribute
selectors that override the media query when a caller sets the attribute
explicitly — the docs app's own theme toggle uses exactly this pair, setting
`data-theme` on `document.documentElement`) and claims dark mode as a feature.
But every Storybook story, in all three framework libs, rendered in exactly one
theme: each `preview.{ts,tsx}` carried a hand-rolled decorator that derived
"is this dark" from `context.globals['backgrounds']?.value === 'dark'` — the
built-in `backgrounds` toolbar, meant for an arbitrary canvas swatch (its own
options here are `light` / `subtle` / `dark`, three colours, not two themes) —
and used that to flip `data-theme`. `initialGlobals.backgrounds.value` defaults
to `'light'`, so every story, every render, every `storybook-test` run checked
light mode only. Since `parameters.a11y.test: 'error'` runs axe on every story
(`@storybook/addon-a11y` inside `@storybook/addon-vitest`'s browser-mode test),
axe had never once seen the dark state. A contrast regression introduced only
in the dark branch of `tokens.css` would ship silently — nothing in
`check:stories`, `check:contrast`, or the parity gates looks at it.

The create-workspace scaffold's three preview templates
(`libs/create-workspace/.../storybook/{angular,react,vue}/preview.*`) had no
decorator at all: a scaffolded workshop's Storybook only ever followed the OS
`prefers-color-scheme`, with no way to preview or force dark mode short of
changing the OS setting.

`@storybook/addon-themes` is published at exactly `10.6.0` — the version this
repo's `storybook-version-lockstep` ESLint rule already pins the rest of the
Storybook family to, so adding it is a family member, not a new lockstep
exception.

## Decision

Add `@storybook/addon-themes@10.6.0` (exact, matching the family pin) to root
`package.json`, `libs/{angular,react,vue}/.storybook/main.ts`'s `addons`, and
the three `create-workspace` scaffold `main.ts.template`s. Wire
`withThemeByDataAttribute({ themes: { light: 'light', dark: 'dark' },
defaultTheme: 'light' })` as a decorator in all six `preview.{ts,tsx}` /
`.template` files (the three repo libs and the three scaffold templates),
replacing the repo libs' hand-rolled `backgrounds`-piggyback decorator
entirely (the scaffold templates gain a decorator where none existed).

`withThemeByDataAttribute`'s defaults are `parentSelector: 'html'` and
`attributeName: 'data-theme'` — exactly the element and attribute the docs
app's own toggle and `tokens.css` already use, so no non-default
configuration was needed once the mechanism was identified. This is why the
**data-attribute** strategy is the right one and not `withThemeByClassName`:
`tokens.css` keys dark mode off an attribute selector, not a class, and a
class-name decorator would add classes the stylesheet never reads.
`withThemeFromJSXProvider` does not apply either — there is no theme-provider
component in a library whose theming is plain CSS custom properties.

The `backgrounds` toolbar keeps its existing three swatches
(`light`/`subtle`/`dark`) for canvas colour, now fully decoupled from
component theming — a real fix to the conflation described in Context, not
just a relocation of it. `initialGlobals.theme` is set to `'light'`
everywhere, matching every story's pre-existing default render, so this
change is additive: it does not change what any story renders by default (see
Consequences for the gates re-run to confirm this).

### What this does not do: make axe check dark mode

Wiring the toolbar gives a human previewing the running Storybook a manual
`theme` control. It does **not** give `storybook-test` (`nx storybook-test
<fw>`, the axe-checked gate `check:stories` runs) coverage of the dark branch,
and this ADR does not claim otherwise. The mechanism, read directly out of
`@storybook/addon-themes@10.6.0`'s `dist/index.js`: the decorator reads
`context.globals.theme` (falling back to `parameters.themes.themeOverride`,
then `defaultTheme`) once per story render via a `useEffect`-style hook. A
story's globals are fixed for that render — set globally in `preview.ts`'s
`initialGlobals` (which stays `'light'`, per above) or overridden per story or
per meta via the addon's own documented `globals: { theme: 'dark' }` field
(README, "Overriding theme"). Nothing in this change adds such an override to
any existing story, so every story continues to render, and get axed, in
light mode only — identical coverage to before, just reachable via a cleaner,
purpose-built control instead of misusing `backgrounds`.

Closing the coverage gap for real needs one of:

- **A dark-mode story or meta-level `globals: { theme: 'dark' }` override**
  per component (or per a chosen representative set) — the addon's own
  documented mechanism, but a real content change across every `*.stories.*`
  file in all three libraries: mechanical, but large, and it roughly doubles
  the a11y-checked surface `check:stories` walks.
- **Running `storybook-test` twice with a different default** — e.g. reading
  `initialGlobals.theme` from an environment variable and invoking
  `nx storybook-test <fw>` once per value — a change to how the gate itself
  runs, doubling that gate's CI time rather than the story count.
- **A `play` function that flips the global mid-test** — investigated and
  rejected as not materially cheaper: the decorator reads `context.globals`
  once per render; there is no supported API inside addon-vitest's
  browser-mode harness to force a second decorator pass mid-`play`, so this
  would in practice mean re-invoking the story a second time — the same cost
  as the first option, with less precedent behind it.

None of these is implemented here. Deciding which one (and at what coverage —
every story, or a representative sample) is a cost/coverage tradeoff for the
owner, not something "wire the addon" settles on its own; this ADR records
the finding precisely so it cannot be mistaken for done.

## Consequences

- Manual dark-mode preview is now available via the toolbar's theme control,
  in all three repo libs' running Storybook and in a scaffolded workshop's —
  the scaffold previously had no override at all, only the OS-level
  `prefers-color-scheme` fallback.
- Default rendering is unchanged: `initialGlobals.theme` is `'light'`
  everywhere, so `check:stories`, the parity gates, and the paint gate see the
  same renders as before this change (re-run as part of this task's proof,
  not merely asserted).
- Dark-mode axe coverage remains a known, named gap — not silently claimed as
  closed. A follow-up decision (one of the three options above) is needed to
  actually close it.
- One new exact-pinned devDependency, `@storybook/addon-themes@10.6.0`,
  joining the family the `storybook-version-lockstep` rule already governs;
  `nx lint` was re-run to confirm the rule stays green.

## Addendum 2026-09-13: the decorator was verified functionally, and a fourth option measured

The decision above was recorded without anyone having seen the control work. It has since been
checked, not by looking at the toolbar but by driving it: a throwaway portable-stories test
composed `AtlButton`'s `Primary` and asserted the attribute the stylesheet keys on. Both
mechanisms set it —

```
PROBE viaAnnotations=dark viaRun=dark
```

— i.e. `composeStories(stories, { initialGlobals: { theme: 'dark' } })` and
`story.run({ globals: { theme: 'dark' } })` each flip `data-theme` to `dark`. The decorator is
wired correctly. (A first attempt passed `{ globals: … }` as `composeStories`' second argument
and saw no change; that argument is project annotations, not globals. The failure was the
probe's, not the wiring's — recorded because the same mistake would read as a defect.)

That adds a **fourth** option to the three costed above, and its limit: portable stories can
render any story in either theme in jsdom, cheaply, per story. But jsdom computes no layout, so
the axe rules that matter most for a theme — contrast — are exactly the ones it cannot check
there. A dark-mode run that reports green in jsdom would be the vacuous kind of green this
repo has already been bitten by (ADR-0135, and the accordion spike in ADR-0141).

So the conclusion stands: real dark-mode accessibility coverage needs a second **browser** run,
which is option (b). What changed is that the per-story mechanism it would use is now known to
work and is written down.
