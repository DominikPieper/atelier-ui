---
status: accepted
date: 2026-10-01
sources:
  - tasks/todo.md ("Structure lessons from the DB UX Design System", P1)
  - tasks/p1-css-inventory-2026-10-01.md (P1.0, where the three copies differ)
  - tasks/p1-1-spike-2026-10-01.md (P1.1, a generator from Angular `:host` CSS)
  - tasks/spikes/p1-css/ (the spike scripts, kept verbatim)
  - db-ux-design-system/core-web (one SCSS file per component, `@db-ux/core-components`)
  - Gemini 3.1 Pro adversarial review, 2026-10-01 (Codex quota out until 2026-10-06)
---

# ADR-0148: One CSS file per component, in a published `@atelier-ui/styles`

## Status

Accepted 2026-10-01 by the owner. This revises ADR-0028's selector convention for every
component that moves into `libs/styles`. So far that is `button`, `badge` and `dialog`;
the rest follow one component at a time.

## Context

Each component had three hand-kept stylesheets, `libs/{angular,react,vue}/src/lib/<dir>/atl-<name>.css`.
Angular wrote `:host` selectors under Emulated encapsulation, which ADR-0028 established.
React and Vue wrote a real root class, `.atl-<name>`. No gate compared the three:
`check:sync` reads directory names and story presence only. `check:variants`,
`check:dead-selectors` and `check:box-sizing` run once per framework _because_ the CSS
was triplicated.

The P1.0 inventory, run on 2026-10-01, measured the cost:

- **React and Vue were byte-identical in 27 of 29 files.** The question was only
  Angular against the rest.
- **The drift had produced two real bugs.**
  - Angular `AtlStepper` read `--step-circle` and `--step-connector-width` and never
    defined them, so the circle rendered at ~10px instead of 36px (`c8273cbe`).
  - Vue `AtlDrawer` put its host classes on the `<dialog>`, so no drawer rule matched
    (`b21a0e0b`).
- **React and Vue carried about 80 rules with no `.atl-*` root**, such as `.spinner`,
  `.track` and `.page-btn`. Those are global selectors in a consumer's app. Angular's
  Emulated encapsulation had been hiding the same rules.

The trigger was a comparison with the DB UX Design System. A Gemini Deep Research
report described it as "native per framework, in parallel, in Nx", which is wrong: DB
UX compiles one Mitosis source per component and is a pnpm workspace. What it does
have is one SCSS file per component in `@db-ux/core-components`, with class-rooted
`db-*` selectors, which every framework output and plain-HTML users consume. That
package cut is what this ADR takes over; Mitosis is not.

## Decision

1. **One class-rooted stylesheet per component, in `libs/styles/src/<dir>/atl-<name>.css`,
   used verbatim by all three frameworks.**
   - Every rule is rooted in the component's own `.atl-*` class.
   - A rule for an internal part uses the child combinator wherever the part's class
     name is generic, e.g. `.atl-dialog > .panel`, not `.atl-dialog .panel`.
   - `@keyframes` names carry the component prefix.
2. **Angular consumes that file with `ViewEncapsulation.None` and a static root class
   on the host.**
   - The static class sits next to the existing `'[class]': 'hostClasses()'` binding.
     The spike verified in the rendered DOM that it survives that binding and input
     changes.
   - The exception is `AtlDialog`, whose `.atl-dialog` class stays on the inner native
     `<dialog>`, as in React and Vue: `::backdrop` and `[open]` exist only there
     (ADR-0028's own dialog finding).
3. **`@atelier-ui/styles` is a published package, in the same lockstep release group
   as the framework libraries.**
   - `@atelier-ui/react` depends on it at runtime: each component keeps
     `import '@atelier-ui/styles/<dir>/atl-<name>.css'`, and the consumer's bundler
     resolves it.
   - Angular inlines the file through ng-packagr, and Vue extracts it into `index.css`.
     Both need the package at build time only.
   - Publish order needs no configuration. Nx sorts release _groups_ topologically, and
     inside a group it gives every publishable package an implicit
     `nx-release-publish` that `dependsOn: ["^nx-release-publish", "build"]`
     (`node_modules/nx/dist/src/utils/package-json.js`, around line 142). Confirmed with
     `nx show project react` and the task graph: styles publishes first, then
     angular/react/vue, then create-workspace. The project-level
     `nx-release-publish` entries set only `packageRoot` and merge with it. A
     project-level `dependsOn` there would replace the implicit one, so do not add one.
4. **`select` and `tooltip` keep a per-framework stylesheet for the parts whose DOM
   legitimately differs.** React has a native `<select>` and a positioned span; Angular
   has CDK listbox and overlay. Those differences are recorded in the contract
   (`codeOnly` / probes), not hidden in CSS.

   **Corrected 2026-10-02.** The roster is four, not two, and the shape is settled.
   `select`, `tooltip`, `table` and `menu` keep a per-framework file next to the
   component, `libs/<fw>/src/lib/<dir>/atl-<name>.<fw>.css`, loaded after the shared
   sheet; its header comment says why the DOM differs. The shared sheet holds
   everything the frameworks render the same way. `table` has one override, Angular's
   (`<atl-tr>` wrappers, so the striped rule counts them); `menu` has React's and Vue's
   (the positioned `.atl-menu-panel` that Angular's CDK overlay replaces); `tooltip` has
   all three; `select` has all three, with Angular's the largest. Where React and Vue
   render the same DOM their two files are identical, because the layout has no place for
   "React and Vue, not Angular". `componentCssFiles(fw, dir)` returns the shared sheet
   first and then the framework's own override, `gen-box-sizing` gives an override a
   contract block only for the roots it adds, and `check:figma` indexes shared plus
   override. A generic part inside an override is still reached through the child
   combinator. (Decision 5 also needs a note: `check:paint` reads the built
   `dist/storybook/<fw>`, not the source, so it checks nothing about a component until
   `check:storybook-manifests` has rebuilt it.)

   **Corrected 2026-10-03.** The sentence "the layout has no place for 'React and Vue,
   not Angular'" is withdrawn: it now has one. Where React and Vue render the same DOM,
   the shared override is a single published file, `libs/styles/src/<dir>/atl-<name>.native.css`
   (menu, tooltip, select), which both import right after the shared sheet; the identical
   `.react.css`/`.vue.css` pairs are gone. Angular keeps `atl-<name>.angular.css` next to
   its component. `componentCssFiles(fw, dir)` returns shared + `native` for React and Vue,
   shared + `angular` for Angular; `native` is never returned for Angular. An override that
   differs between React and Vue would still be a `.react.css`/`.vue.css` file in its own lib.

5. **The gates read component CSS from `libs/styles` first**, through one helper
   (`componentCssFiles(fw, dir)` in `tools/scripts/lib/component-discovery.js`). A new
   offline gate, `check:pack-styles`, proves the published shape: it packs
   `@atelier-ui/react` and `@atelier-ui/styles`, installs only react into a temp
   consumer, bundles `AtlButton` and asserts the CSS arrives.

## Why — the options

- **(A) Angular `:host` CSS canonical, React/Vue generated from it.** This was my first
  lean, and the second model's pick too. The P1.1 generator reproduced today's React CSS
  for 23 of 29 components. But it needed 32 per-component config entries (roots, renames,
  `:host-context` rewrites). It turned three copies into one copy plus a transform a
  reader has to trust. Its `:host-context` rewrite also raised specificity for consumer
  overrides. **Rejected:** the file you read would not be the file that ships.
- **(B) Angular's CSS rewritten class-rooted in place, React/Vue importing from
  `libs/angular`.** This is the same mechanics as C, but the shared source lives inside
  one framework's library. That would make React and Vue depend on the Angular
  package's layout. **Rejected** in favour of a neutral home.
- **(C) a shared styles lib**, which is the decision above.
- **(D) three hand copies plus a drift gate.** This is the cheapest today, but it keeps
  the copies that produced two bugs, and every fix still has to be made three times.
  **Rejected.**
- **Inside C, how React gets the file:**
  - a build step that copies the CSS next to each component and rewrites the import;
  - Vite library mode with an extracted `index.css`;
  - a published package.
    The owner chose the package. It is the honest shape: the CSS is a dependency, so it
    is declared as one. It also gives the CSS a home that later work can grow into (the
    tokens, see Consequences).

Why `None` is acceptable in Angular, which I first argued it was not: it is the pattern
Angular Material uses for its own components (`.mat-mdc-*`). The leak risk lies in rules
without a root, not in `None` itself. Decision 1 removes those rules, and the spike's
leak script found 0 of 58 selectors unrooted in the three migrated files.

## Consequences

- **What is read is what ships.** One file per component, with no generator in the
  build. The spike scripts in `tasks/spikes/p1-css/` are a one-time migration aid for
  rewriting each Angular file, not a build step.
- **Angular consumers see two changes**, measured over 151 elements in the spike; every
  other computed style was identical:
  - content projected into `button` and `dialog` now gets `box-sizing: border-box`, as
    it already did in React and Vue;
  - Angular's styles are no longer attribute-scoped, so a consumer override needs less
    specificity than before.
- **Prefixing alone is not enough.** The spike's prefix-everywhere output styled a
  `<select>`'s own `.panel` inside a dialog through `.atl-dialog .panel`. Child
  combinators (Decision 1) fixed four such selectors. Every further migration has to
  check generic class names (`.panel`, `.track`, `.close-btn`) for this.
- **A new published package.**
  - `check:release-drift` reports `@atelier-ui/styles` as unpublished, and exits 1,
    until the first release.
  - The first publish needs the npm token to be allowed to create a package under the
    scope.
  - Publish order is already dependency-first (Decision 3).
- **Two gates had been passing on fewer files than exist:** `check:box-sizing` (78 of 87
  stylesheets) and `check:dead-selectors` (80 of 89). Moving the CSS made this visible;
  ADR-0080 is the same lesson. Both should fail when they find fewer stylesheets than
  components. That fix is tracked separately in `tasks/todo.md`.
- **Plan P2 moves.** It had planned a private `libs/foundations` for `tokens.css`. With
  a published `@atelier-ui/styles`, the tokens' natural home is that package. That
  decision stays with P2.
- **The migration is incremental.** Until every component has moved, the gates read
  both locations. A component is done when its three per-framework stylesheets are
  gone, its Angular component is on `None` with a root class, and `check:all`, the
  three `storybook-test` runs and `check:pack-styles` are green.
