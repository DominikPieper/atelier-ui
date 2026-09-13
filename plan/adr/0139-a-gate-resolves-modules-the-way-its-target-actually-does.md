---
status: accepted
date: 2026-09-13
sources:
  - tools/scripts/check-exports.js, `resolvedExportNames()` (before and after this change)
  - tools/scripts/check-dead-selectors.js:194-198, `COMPILER_OPTIONS` (the sibling structural
    gate already using `module: ESNext` / `moduleResolution: Bundler` on the same barrels)
  - libs/angular/tsconfig.json, libs/react/tsconfig.json, libs/vue/tsconfig.json — all three
    declare `"module": "preserve"` / `"moduleResolution": "bundler"`, unchanged by this decision
  - libs/react/package.json (`"type": "module"`, added by ADR-0138); libs/angular/package.json
    and libs/vue/package.json (no `"type"` field, unchanged)
  - plan/adr/0138-a-published-package-declares-what-it-actually-ships.md (the fix whose
    consequence this gate absorbed)
  - plan/adr/0124-a-gate-that-measured-nothing.md (the
    convention this decision continues: a gate's claim has to survive being checked)
  - isolated probe, 2026-09-13: `resolvedExportNames()` run against all three frameworks'
    `libs/<fw>/src/index.ts` under the old hardcoded NodeNext options versus
    `module: ESNext, moduleResolution: Bundler` versus `module: Preserve, moduleResolution:
    Bundler` (the last two produced byte-identical export counts)
  - deliberate-break test, 2026-09-13: removed `export * from './lib/button/atl-button';`
    from `libs/react/src/index.ts`, ran `check:exports`, restored the line
---

# ADR-0139: A gate resolves modules the way its target actually does

## Status

Accepted 2026-09-13.

## Context

`check:exports`'s `resolvedExportNames()` built a throwaway TypeScript program with
`module: ts.ModuleKind.NodeNext` and `moduleResolution: ts.ModuleResolutionKind.NodeNext`
hardcoded, for all three frameworks, unconditionally. This never matched reality: every
framework's own `tsconfig.json` (`libs/angular`, `libs/react`, `libs/vue`) declares
`"module": "preserve"` / `"moduleResolution": "bundler"`, and every real consumer of these
packages — Vite, webpack, Vitest's transform pipeline — resolves through a bundler, never
through Node's own NodeNext resolver. Nothing in this repo builds or ships any of the three
libraries as NodeNext.

The gate had been green regardless, for an accidental reason. Under NodeNext, TypeScript
decides whether a file is CJS or ESM (and therefore whether a relative specifier needs an
explicit extension) from the nearest `package.json`'s `"type"` field. None of the three
source `package.json` files declared one, so TypeScript defaulted every barrel to CommonJS
— under which relative specifiers may omit extensions, which happened to make the barrels'
extensionless `export * from './lib/x/atl-x'` lines resolve, coincidentally matching what a
real bundler would also accept. ADR-0138 broke that coincidence for one framework only:
fixing `@atelier-ui/react`'s self-contradictory published package (`"type": "commonjs"`
declared over genuine ESM output) by adding `"type": "module"` to `libs/react/package.json`
made TypeScript's NodeNext detector reclassify `libs/react/src/index.ts` as real ESM, which
_requires_ explicit extensions on relative specifiers — and the barrel has none. Every one
of the 40 spec-keyed React components then resolved to nothing, and `check:exports` reported
40 `[NAMED]` failures against a barrel that had not changed. Angular and Vue, whose source
`package.json` files still declare no `"type"`, kept resolving under the same hardcoded
NodeNext options exactly as before, because nothing about their status quo had changed.

This is the identical shape ADR-0138 itself fixed: something that passed because of an
_absence_ (no `"type"` field to trigger NodeNext's ESM branch), not because the gate was
actually checking the resolution mode that governs the real package.

A working precedent already existed one file over. `check-dead-selectors.js`'s
`COMPILER_OPTIONS` (a gate that also parses all three frameworks' component source under a
single `ts.createProgram`) already uses `module: ts.ModuleKind.ESNext`,
`moduleResolution: ts.ModuleResolutionKind.Bundler` — matching what the tsconfigs declare —
and was unaffected by ADR-0138 for exactly that reason.

Verified directly, not assumed. A probe script resolving all three frameworks'
`libs/<fw>/src/index.ts`:

| options                                | react | angular | vue |
| -------------------------------------- | ----- | ------- | --- |
| `NodeNext` / `NodeNext` (the old gate) | **0** | 87      | 66  |
| `ESNext` / `Bundler`                   | 116   | 87      | 66  |
| `Preserve` / `Bundler`                 | 116   | 87      | 66  |

`Preserve` (the tsconfigs' literal value) and `ESNext` produce identical counts here because
neither program ever emits (`noEmit: true`); the module _kind_ only changes emitted syntax,
which this checker never generates. `ESNext` was chosen over the literal `Preserve` to match
`check-dead-selectors.js`'s existing convention on the same input files, not because it
differs in outcome.

## Decision

1. **`tools/scripts/check-exports.js`'s `resolvedExportNames()` now uses
   `module: ts.ModuleKind.ESNext`, `moduleResolution: ts.ModuleResolutionKind.Bundler`**,
   replacing the hardcoded `NodeNext`/`NodeNext` pair. This mirrors what every framework's
   own `tsconfig.json` declares and what every real consumer does, and matches the sibling
   gate's already-established convention for parsing the same barrels.
2. **Nothing else about the gate changes.** The `[NAMED]` and `[NO-EXPORT]` rules, the
   `KEYED_SPECS` roster (`keyedSpecs()` from `lib/component-map.js`), and the
   directory-substring fallback are untouched — this is a compiler-options fix, not a
   rule change.
3. **Proven, not asserted, that the gate still catches a real miss.** Removed
   `export * from './lib/button/atl-button';` from `libs/react/src/index.ts` and ran
   `check:exports`: it reported exactly two findings, both scoped to `react/button`
   (`[NAMED]` — `AtlButton` unreachable — and `[NO-EXPORT]` — the directory has no barrel
   reference at all, since that was its only line) and nothing else. The line was restored
   and the gate returned to green with a clean `git diff`.

## Consequences

- `check:exports` is green for all three frameworks again, for the right reason: it asserts
  reachability under the resolution mode the libraries actually use, not one none of them
  declare. It no longer depends on whether some framework's source `package.json` happens to
  carry a `"type"` field — the NodeNext CJS-vs-ESM branch that made the old gate fragile does
  not exist in the new options at all.
- **The gate's assertion power is unchanged, not weakened.** Same roster size (40 keyed
  components), same two rule tags, same directory-substring baseline. The deliberate-break
  test above is the proof: a real missing export still fails the gate, scoped to exactly the
  component that lost its export.
- **Does not correct or qualify ADR-0138.** That ADR named its own verified gates (`nx test
react`, `nx build react`, `nx lint react`, `nx storybook-test react`, `nx test`/`nx build
create-workspace`, `check-adr-refs`, `prettier --check`) and made no claim about
  `check:exports`; nothing recorded there was wrong. `libs/react/package.json`'s
  `"type": "module"` stays exactly as ADR-0138 left it — this ADR is a downstream consequence
  discovered later, in a different file, not a revision of that decision.
- Angular and Vue were checked and are unaffected in both directions: identical export counts
  before and after this change (87 and 66 respectively), because their source `package.json`
  files carry no `"type"` field either way.
- **Named, not fixed here:** `check-exports.js` and `check-dead-selectors.js` now each carry
  their own literal `module`/`moduleResolution` pair rather than sharing one constant. Not
  deduplicated — the two gates differ in everything else they configure around it (a virtual
  file host, a JSX macro shim for Vue SFCs, multi-language `rootFiles` handling), and this
  fix scopes to the one gate that broke. A shared constant is a smaller, separate follow-up.

**Rejected alternatives:**

- _Move `"type": "module"` off the source `libs/react/package.json` onto only the built
  `dist/libs/react/package.json`._ Rejected: ADR-0138 established that `@nx/js:tsc`'s
  package-json writer reads the **source** package.json's `"type"` field first, before
  falling back to its own tsconfig-derived guess (the one with no case for `"preserve"`,
  which defaults to `cjs`). Removing the field from source does not relocate it to dist — it
  reintroduces the exact self-contradictory published package (`"type": "commonjs"` declared
  over real ESM output) that ADR-0138 exists to fix, purely to preserve an internal gate's
  accidental pass. Fixing the gate's blind spot is strictly better than reintroducing the
  defect it exposed.
- _Make `@atelier-ui/react`'s build genuinely NodeNext-correct_ — emit explicit `.js`
  extensions on relative specifiers, or bundle the barrel into one file the way Vue's Vite
  library build and Angular's ng-packagr FESM bundle already do. Rejected as out of scope:
  ADR-0138 already named this as a deliberate non-goal ("named but not fixed" — every real
  consumption path goes through a bundler, so nothing forces resolvable extensions today),
  and reworking the library's build is a materially larger change than a gate's compiler
  options warrant.
- _Read each framework's own `tsconfig.json` at gate time_ (`ts.readConfigFile` +
  `ts.parseJsonConfigFileContent`) instead of a literal `COMPILER_OPTIONS` object, so a future
  framework that diverges from `module: preserve` / `moduleResolution: bundler` is picked up
  automatically. Set aside for now, not rejected outright: all three frameworks' options are,
  today, identical (verified above); `check-dead-selectors.js` already establishes the
  literal-constant convention for these same input files; and resolving a real tsconfig's
  `extends` chain reintroduces its own NodeNext-vs-bundler-shaped decisions one level up, for
  a divergence that does not exist yet. Worth revisiting the day a framework's tsconfig
  actually diverges from the other two.
