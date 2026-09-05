#!/usr/bin/env node
/**
 * check-prop-surface.js
 *
 * Cross-framework prop-surface drift gate. The library implements ~29
 * components three times behind one contract (`libs/spec/src/index.ts`), but
 * only React is held to that contract by the compiler (every `Atl*Props`
 * extends/intersects the matching `Atl*Spec`). Angular and Vue have NO
 * type-level link to the spec at all — zero Angular classes
 * `implements`/`extends` an `Atl*Spec`, and no `.vue` file uses a spec
 * interface as its props type. Drift has shipped twice this way:
 * `AtlInput.label` existed in React and Vue but not in the spec or Angular
 * (ADR-0091), and `AtlSelect.required` was an Angular `input()` that
 * rendered nowhere (fixed in commit 299816d). This gate reads each
 * framework's OWN declared prop surface and compares it to the spec.
 *
 * Three rules:
 *
 *   [MISSING]  A spec prop is absent from an adapter's declared surface.
 *              Change callbacks are MAPPED, not excluded: a spec prop
 *              matching `on<X>Change` is satisfied by an Angular `model('<x>')`
 *              or an `output()` named `<x>Change`, and by a Vue `defineEmits`
 *              entry `update:<x>` or `<x>Change`. React speaks the spec's own
 *              idiom directly (no mapping needed — the whole reason the spec
 *              models change handlers in the React shape). Vue also camelizes
 *              hyphenated spec props (`'aria-label'` -> `ariaLabel`): Vue's
 *              runtime camelizes both the declared prop key and an incoming
 *              raw attribute key before matching them (ADR-0091), so the
 *              component-side name is always camelCase.
 *
 *   [EXTRA]    An adapter declares a prop the spec does not have. Ignored,
 *              framework-wide, regardless of component (documented here, not
 *              per-component in the allowlist):
 *                - React: `className`, `children`, `ref` — and everything an
 *                  untyped `...rest` forwards, which is exactly why EXTRA reads
 *                  only the Props interface's OWN literal members rather than
 *                  the type-checker's flattened type: `AtlXProps` inherits
 *                  `ButtonHTMLAttributes` and friends, so the flattened set is
 *                  hundreds of DOM props, and `...rest` has no single member
 *                  name to allowlist anyway.
 *                - Angular: `touched`, `formField` — Signal Forms plumbing,
 *                  verified absent from React and Vue by design (a completely
 *                  different, imperative form-integration story in those two).
 *                - Vue: emits and slots are not compared at all — `defineEmits`
 *                  is a distinct event surface (mapped only for [MISSING], see
 *                  above) and slots carry no name to key against a spec prop.
 *              Anything else an adapter declares that the spec does not have
 *              is a real, reportable divergence.
 *
 *   [DEAD]     A declared prop whose name appears nowhere else in its OWN
 *              FILE (not component — file). File scope, not component scope,
 *              on purpose: React's `AtlStep`/`AtlTab` are `({children}) =>
 *              children`, with the PARENT component (same file) reading
 *              `element.props.label` etc. — a legitimate compound-component
 *              read that a component-scoped rule would false-positive on (9
 *              props across those two). Checked only for spec props counted
 *              present (not [MISSING]) for that component/framework —
 *              extras are out of scope for DEAD.
 *
 *              Angular is checked differently from React/Vue (ADR-0093):
 *              input()/model() props are Signals, read only by CALLING them
 *              (`this.name()` in the class, `name()` in the template) — so
 *              DEAD requires the call form `member(`, not a bare-word text
 *              match. A bare-word match both missed real dead code
 *              (`AtlSelect.name` was "found" via the unrelated attribute
 *              `<atl-icon name="chevron-down">`) and flagged live code dead
 *              (`AtlRadioGroup.name` has no in-file call at all — it is read
 *              by `AtlRadio`, a sibling class in a DIFFERENT file, through
 *              `AtlRadioGroupContext`, the DI token `AtlRadioGroup` provides
 *              itself into via `useExisting`). So a signal prop also counts
 *              as consumed when the class self-provides via `useExisting`
 *              AND the context interface it hands out (declared inline, like
 *              `AtlTableContext` in `atl-table.ts`, or in a sibling
 *              `atl-<x>.token.ts`, like `AtlRadioGroupContext`/
 *              `AtlSelectContext`) declares that same member — a
 *              `useFactory` provider (AtlDialog, AtlChat, AtlBreadcrumbs,
 *              AtlDrawer) does not qualify, since it builds a plain object
 *              instead of exposing `this`, so there is no context to resolve
 *              against. `output()` props are EventEmitters, not Signals —
 *              consumed via `.emit(...)`, never called with bare parens — so
 *              they keep the original bare-word/occurrence-count check.
 *
 * Out of scope for v1:
 *   - toast: not name-comparable. Angular takes four flat props
 *     (variant/dismissible/message/toastId) where React and Vue take one
 *     `data: ToastData` object, and the real API is imperative
 *     (`AtlToastService.show()` / `useAtlToast()`). A set comparison cannot
 *     express a shape mismatch, and allowlisting it would pretend it was
 *     checked. `AtlToastOptions` is in NON_COMPONENT_SPECS and never keyed
 *     here.
 *   - Seven components have no spec interface at all: AtlCodeBlock,
 *     AtlAccordionHeader, AtlMenuSeparator, AtlMenuTrigger, AtlChatInput,
 *     AtlChatTyping, AtlThead. All three adapters agree with each other;
 *     there is nothing to key on. Reported as UNKEYED in the summary (see
 *     UNKEYED_COMPONENTS below) rather than silently absent from the roster —
 *     a gate that says nothing about what it never looked at is the exact
 *     failure mode check-a11y-parity.js's header warns about.
 *
 * Reuse, not re-derivation:
 *   - Spec flattening mirrors check-docs-sync.js's parseSpec() — the only
 *     other place using the real TypeScript checker
 *     (`checker.getPropertiesOfType`) to resolve multi-level `extends` and
 *     `Omit<AtlFormFieldSpec, 'value' | 'onValueChange'>`.
 *   - Registry: tools/scripts/lib/component-map.js's maps().registry
 *     (COMPONENT_METADATA_REGISTRY) gives SpecName -> component directory for
 *     every keyed component. Two specs are keyed here that the metadata
 *     registry deliberately excludes (AtlChatMessageSpec, AtlChatSuggestionSpec
 *     are shared shapes for the metadata gate, NON_COMPONENT_SPECS) — but
 *     their props ARE rendered by concrete `AtlChatMessage`/`AtlChatSuggestion`
 *     components in the `chat` directory in all three frameworks, so this
 *     gate keys them there (see EXTRA_KEYED_SPECS below); the resulting
 *     MISSING findings (id/content passed as children/slot, never a prop) are
 *     seeded in PROP_SURFACE_EXEMPT.
 *   - Discovery: lib/component-discovery.js's FRAMEWORKS list.
 *
 * Per-adapter extraction:
 *   - React (`atl-*.tsx`): find `export interface Atl<X>Props` / `export type
 *     Atl<X>Props` that extends/intersects `Atl<X>Spec`. Read OWN-declared
 *     members from the declaration body only (never the checker's flattened
 *     type — see the EXTRA rule above). If the type does not literally
 *     extend/intersect the spec, fall back to direct name matching (defensive
 *     path; not expected to trigger).
 *   - Vue (`atl-*.vue`): no existing gate parses an SFC. Extract every
 *     `<script...>` block (both the plain `<script lang="ts">` context block,
 *     used by atl-dialog.vue/atl-radio-group.vue for a shared Props
 *     interface, and `<script setup lang="ts">`), concatenate, and run
 *     `ts.createSourceFile` over the result (no type checker needed — this is
 *     a local, single-file AST read, not a multi-file program). Read the
 *     `defineProps<...>()` type argument (a type literal, or a named
 *     interface resolved within the combined source) and `defineEmits<...>()`
 *     the same way. A spike against atl-input.vue, atl-tr.vue, atl-dialog.vue,
 *     atl-radio-group.vue, atl-chat-message.vue and atl-chat-suggestion.vue
 *     matched manual inspection exactly.
 *   - Angular (`atl-*.ts`): `input()` / `model()` / `output()` property
 *     declarations, read via the real AST (ClassDeclaration ->
 *     PropertyDeclaration whose initializer calls `input`/`input.required`/
 *     `model`/`output`). An `alias:` option takes precedence as the public
 *     name. Graded per class (several files declare more than one
 *     `@Component`/`@Directive` — `atl-table.ts` holds six, `atl-dialog.ts`
 *     four — the same hazard check-host-attr-guards.js's header describes;
 *     this gate walks real class nodes rather than that gate's regex block-split,
 *     which sidesteps the brace-balancing entirely while keeping the same
 *     per-class grading).
 *
 * [DEAD]'s file-scope occurrence count is a plain, comment-stripped text
 * search (stripComments — same need, same shape, as check-host-attr-guards.js's
 * helper of the same name; not reused across files here since that script has
 * no module.exports to import from and is not itself in scope for this gate)
 * rather than an AST identifier count, because spec prop names like
 * `'aria-label'` are not valid JS identifiers (they show up as string
 * literals in one place and JSX attribute names in another) — a literal,
 * word-bounded text search is the one mechanism that counts every shape
 * uniformly. Angular's signal-backed (input()/model()) props narrow this
 * further to the CALL form (`member(`, not a bare `member`) — see the [DEAD]
 * rule's own entry above (ADR-0093) for why a bare identifier match both
 * missed and false-flagged real bugs.
 *
 * Run via:  node tools/scripts/check-prop-surface.js
 *           (or  npm run check:props)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { maps } = require('./lib/component-map');
const { FRAMEWORKS } = require('./lib/component-discovery');
const { PROP_SURFACE_EXEMPT } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');
const SPEC_FILE = path.join(ROOT, 'libs/spec/src/index.ts');
const LIB_DIR = Object.fromEntries(FRAMEWORKS.map((fw) => [fw, path.join(ROOT, `libs/${fw}/src/lib`)]));

// ---------------------------------------------------------------------------
// 1. Keyed specs: SpecName -> component directory.
// ---------------------------------------------------------------------------

/**
 * Two specs the metadata registry deliberately excludes as NON_COMPONENT_SPECS
 * (shared message/suggestion shapes, not a standalone metadata module) but
 * which this gate keys anyway — their props are rendered by concrete
 * `AtlChatMessage`/`AtlChatSuggestion` components in all three frameworks'
 * `chat` directory. See the file header for why.
 */
const EXTRA_KEYED_SPECS = {
  AtlChatMessageSpec: 'chat',
  AtlChatSuggestionSpec: 'chat',
};

/**
 * SpecName -> adapter directory overrides where the registry's metadata
 * MODULE name differs from the adapter SOURCE directory. Only one exists
 * today: `radio.metadata.ts` documents both `AtlRadioSpec` and
 * `AtlRadioGroupSpec` (mirroring how `select.metadata.ts` documents both
 * `AtlSelectSpec` and `AtlOptionSpec`), but unlike select/option — which both
 * live in the `select` adapter directory — radio-group's component lives in
 * its OWN sibling directory, `radio-group` (verified: `ls
 * libs/angular/src/lib` lists both `radio` and `radio-group`).
 * COMPONENT_METADATA_REGISTRY documents metadata modules, not adapter
 * directories, and this is the one place the two names diverge.
 */
const DIR_OVERRIDES = { AtlRadioGroupSpec: 'radio-group' };

const { registry } = maps();
const KEYED_SPECS = { ...registry, ...EXTRA_KEYED_SPECS, ...DIR_OVERRIDES };

const componentNameOf = (specName) => specName.replace(/Spec$/, '');

/**
 * Components that render in all three frameworks but have no `Atl*Spec`
 * interface at all — measured (ADR-pending), not derived: some of these
 * (AtlChatTyping, AtlChatInput) have real per-framework props, others
 * (AtlMenuSeparator, AtlThead) have none in any framework today. What they
 * share is that all three adapters already agree with each other, so there is
 * no spec/adapter divergence to key — only an absent contract. Reported in
 * the summary so this gate is honest about what it never looked at (the
 * failure mode check-a11y-parity.js's header warns about), not silently
 * skipped.
 */
const UNKEYED_COMPONENTS = [
  { name: 'AtlCodeBlock', dir: 'code-block' },
  { name: 'AtlAccordionHeader', dir: 'accordion' },
  { name: 'AtlMenuSeparator', dir: 'menu' },
  { name: 'AtlMenuTrigger', dir: 'menu' },
  { name: 'AtlChatInput', dir: 'chat' },
  { name: 'AtlChatTyping', dir: 'chat' },
  { name: 'AtlThead', dir: 'table' },
];

// ---------------------------------------------------------------------------
// 2. Framework-wide EXTRA ignore lists (not per-component — see header).
// ---------------------------------------------------------------------------

const GENERIC_EXTRA_IGNORE = {
  react: new Set(['className', 'children', 'ref']),
  angular: new Set(['touched', 'formField']),
  // vue: emits and slots are never compared for EXTRA at all (see header).
};

/**
 * Prop names that are native passthrough attributes, EXTRA direction only.
 * React never has to declare these explicitly: its Props interface extends
 * `InputHTMLAttributes`/`ButtonHTMLAttributes`/etc, and the component spreads
 * `{...rest}` onto the native element, so the attribute reaches the DOM
 * without a named prop. Angular and Vue have no equivalent passthrough — the
 * only way for them to offer the SAME public surface a caller gets from React
 * is to declare the prop explicitly. Declaring it is conformance with React's
 * behaviour, not drift from the spec, so it is never an EXTRA finding
 * regardless of component.
 *
 * MISSING is unaffected — this set only silences the "adapter has it, spec
 * doesn't" direction. Where the spec DOES declare one of these names (e.g.
 * `AtlButtonSpec['aria-label']`), an adapter lacking it is still an error.
 *
 * Checked via `camelize()` so an Angular alias's kebab-case public name
 * (`aria-label`) and Vue's camelCase declared name (`ariaLabel`) both hit the
 * one canonical entry — see `camelize()` below (rule: an aria-* prop name in
 * camelCase and its kebab-case spelling are one public name).
 *
 * `readOnly` is deliberately NOT in this set. Checked against all four
 * sources: the spec (`AtlReadonlySpec.readonly`), Angular
 * (`readonly readonly = input(false)`), and Vue (`readonly?: boolean`) all
 * agree on `readonly`; only React's own redeclared interface member spells it
 * `readOnly` (it explicitly `Omit`s the inherited HTML attribute and
 * redeclares its own — this one is NOT received through `{...rest}`, so the
 * passthrough justification does not apply). `readOnly`/`readonly` are two
 * spellings of one concept, but the gate REPORTS that divergence rather than
 * normalizing it away: normalizing a public prop name here would make the
 * gate silently agree that `<AtlInput readonly>` — written against the
 * documented, three-source contract — doing nothing in React is fine. It
 * isn't; it's the same class of defect as `AtlInput.label` (ADR-0091). See
 * PROP_SURFACE_EXEMPT's readOnly entries for the (unresolved) finding.
 */
const NATIVE_PASSTHROUGH = new Set(
  ['id', 'aria-label', 'aria-labelledby', 'aria-describedby', 'type'].map(camelize)
);

// ---------------------------------------------------------------------------
// 3. Spec flattening — copies check-docs-sync.js's parseSpec() mechanism.
// ---------------------------------------------------------------------------

const CHANGE_PROP_RE = /^on([A-Z]\w*)Change$/;

/** @returns {{[specName: string]: Set<string>}} */
function flattenSpecProps(specNames) {
  const program = ts.createProgram([SPEC_FILE], {
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(SPEC_FILE);
  if (!sourceFile) throw new Error(`Could not load spec file: ${SPEC_FILE}`);

  const wanted = new Set(specNames);
  /** @type {{[specName: string]: Set<string>}} */
  const result = {};

  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isInterfaceDeclaration(node)) return;
    const name = node.name.text;
    if (!wanted.has(name)) return;
    const type = checker.getTypeAtLocation(node.name);
    const props = checker.getPropertiesOfType(type);
    result[name] = new Set(props.map((p) => p.name));
  });

  for (const name of wanted) {
    if (!result[name]) {
      throw new Error(`[SETUP] ${name} is keyed but has no interface declaration in ${SPEC_FILE}`);
    }
  }
  return result;
}

/** camelCase a spec prop name for Vue comparison ('aria-label' -> 'ariaLabel'). ADR-0091. */
function camelize(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// 4. Shared file utilities.
// ---------------------------------------------------------------------------

/** List `atl-*.<ext>` files in `dir`, excluding `.spec.`/`.stories.` variants. */
function componentSourceFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => new RegExp(`^atl-.*\\.${ext}$`).test(f) && !/\.(spec|stories)\./.test(f))
    .map((f) => path.join(dir, f))
    .sort();
}

/**
 * Strip `//` and `/* *\/` comments, passing quoted string literals through
 * untouched. Copied from check-host-attr-guards.js (same need: don't let a
 * comment or a JSDoc mention masquerade as real usage).
 */
function stripComments(src) {
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      let j = i + 1;
      out += ch;
      while (j < src.length) {
        out += src[j];
        if (src[j] === '\\') {
          j++;
          if (j < src.length) out += src[j];
        } else if (src[j] === quote) {
          j++;
          break;
        }
        j++;
      }
      i = j - 1;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i++;
      continue;
    }
    out += ch;
  }
  return out;
}

function escapeForRegex(name) {
  return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Count literal, word-bounded occurrences of `name` in comment-stripped `src`. */
function occurrenceCount(src, name) {
  const re = new RegExp(`\\b${escapeForRegex(name)}\\b`, 'g');
  const stripped = stripComments(src);
  const m = stripped.match(re);
  return m ? m.length : 0;
}

/**
 * Is Angular signal-backed prop `member` (an `input()`/`model()`) actually READ anywhere
 * in comment-stripped `strippedSrc`? Matches the CALL — `member(` — not the bare
 * identifier, so a template/JSX ATTRIBUTE of the same name (`<atl-icon
 * name="chevron-down">`) no longer counts as a use (ADR-0093's false-negative fix:
 * `AtlSelect.name` is declared and never called, but the bare-word match saw the
 * `name="…"` attributes on `<atl-icon>` and stopped looking).
 */
function signalIsCalled(strippedSrc, member) {
  return new RegExp(`\\b${escapeForRegex(member)}\\s*\\(`).test(strippedSrc);
}

/**
 * Is Angular's `member` (declared on `angular`, resolved kind `signal`|`output`) actually
 * consumed? Three ways, in order:
 *   1. Declared on a context interface `angular` hands to its children via a
 *      self-`useExisting` DI provider (`angular.contextMembers`, resolved once in
 *      `extractAngular` — ADR-0093's false-positive fix: `AtlRadioGroupContext` declares
 *      `name`, so `AtlRadio` reading `this.group?.name()` in ITS OWN file is real
 *      consumption `atl-radio-group.ts` cannot see by reading only itself).
 *   2. `signal` kind (input()/model(), always a Signal) — called as `member(` anywhere in
 *      the class's own file (see `signalIsCalled`).
 *   3. `output` kind (output(), an EventEmitter, not a Signal — consumed via `.emit(...)`,
 *      never called with bare parens) — the ORIGINAL bare-word/occurrence-count check,
 *      unchanged: this fix is scoped to signal inputs only (file header, bullet 1).
 */
function angularMemberConsumed(angular, member, kind) {
  if (angular.contextMembers.has(member)) return true;
  if (kind === 'signal') return signalIsCalled(stripComments(angular.src), member);
  return occurrenceCount(angular.src, member) > 1;
}

function propertyNameText(name) {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isStringLiteralLike(name)) return name.text;
  return name.getText();
}

// ---------------------------------------------------------------------------
// 5. React extraction.
// ---------------------------------------------------------------------------

/**
 * Does this file destructure a rest element (`...rest`) from a props
 * parameter AND later spread that same identifier onto a JSX element
 * (`{...rest}`)? If so, any spec prop reachable only through `extends`/`&`
 * and never individually destructured is NOT dead — it is silently forwarded
 * to the DOM through the rest spread (this is exactly the mechanism AtlInput
 * and AtlTextarea use for `name`/`placeholder`; contrast AtlTr, which has NO
 * rest parameter at all, so its un-destructured `rowId` really is inert).
 * DEAD is skipped, for that ONE component's function, when this is true:
 * once a rest spread exists we cannot tell, without deep data-flow analysis,
 * which un-destructured props it does or doesn't carry — so we stop claiming
 * to know, rather than guessing either direction. Scoped to the component's
 * own function (not the whole file): `atl-table.tsx` holds both `AtlTr` (no
 * rest — its un-destructured `rowId` really is inert) and `AtlTh` (has one),
 * in the same file, so file-wide detection would hide AtlTr's real DEAD hit
 * behind AtlTh's unrelated rest spread.
 */
function reactHasForwardingRest(root) {
  const restNames = new Set();
  const spreadNames = new Set();
  function walk(node) {
    if (
      ts.isBindingElement(node) &&
      node.dotDotDotToken &&
      ts.isIdentifier(node.name)
    ) {
      restNames.add(node.name.text);
    }
    if (ts.isJsxSpreadAttribute(node) && ts.isIdentifier(node.expression)) {
      spreadNames.add(node.expression.text);
    }
    ts.forEachChild(node, walk);
  }
  walk(root);
  for (const name of restNames) if (spreadNames.has(name)) return true;
  return false;
}

/** Find the function implementing `componentName` (plain function decl, or a `const X = forwardRef(fn)`). */
function findComponentFunctionNode(sf, componentName) {
  let result = null;
  ts.forEachChild(sf, (node) => {
    if (result) return;
    if (ts.isFunctionDeclaration(node) && node.name && node.name.text === componentName) {
      result = node;
      return;
    }
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || decl.name.text !== componentName || !decl.initializer) continue;
        let found = null;
        (function inner(n) {
          if (found) return;
          if (ts.isFunctionExpression(n) || ts.isArrowFunction(n)) {
            found = n;
            return;
          }
          ts.forEachChild(n, inner);
        })(decl.initializer);
        if (found) result = found;
      }
    }
  });
  return result;
}

/** @returns {Map<string, {referencesSpec: boolean, ownMembers: Set<string>, file: string, src: string, skipDead: boolean}>} */
function extractReact(dir) {
  const out = new Map();
  for (const file of componentSourceFiles(dir, 'tsx')) {
    const src = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    ts.forEachChild(sf, (node) => {
      let componentName = null;
      let referencesSpec = false;
      let ownMembers = new Set();

      if (ts.isInterfaceDeclaration(node) && /^Atl\w+Props$/.test(node.name.text)) {
        componentName = node.name.text.replace(/Props$/, '');
        const specName = `${componentName}Spec`;
        for (const clause of node.heritageClauses ?? []) {
          for (const t of clause.types) {
            if (ts.isIdentifier(t.expression) && t.expression.text === specName) referencesSpec = true;
          }
        }
        for (const member of node.members) {
          if (ts.isPropertySignature(member) && member.name) {
            ownMembers.add(propertyNameText(member.name));
          }
        }
      } else if (ts.isTypeAliasDeclaration(node) && /^Atl\w+Props$/.test(node.name.text)) {
        componentName = node.name.text.replace(/Props$/, '');
        const specName = `${componentName}Spec`;
        const type = node.type;
        if (ts.isIntersectionTypeNode(type)) {
          for (const t of type.types) {
            if (ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName) && t.typeName.text === specName) {
              referencesSpec = true;
            }
            if (ts.isTypeLiteralNode(t)) {
              for (const member of t.members) {
                if (ts.isPropertySignature(member) && member.name) {
                  ownMembers.add(propertyNameText(member.name));
                }
              }
            }
          }
        } else if (ts.isTypeLiteralNode(type)) {
          for (const member of type.members) {
            if (ts.isPropertySignature(member) && member.name) {
              ownMembers.add(propertyNameText(member.name));
            }
          }
        }
      }

      if (componentName) {
        const fnNode = findComponentFunctionNode(sf, componentName);
        const skipDead = fnNode ? reactHasForwardingRest(fnNode) : false;
        out.set(componentName, { referencesSpec, ownMembers, file, src, skipDead });
      }
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// 6. Angular extraction.
// ---------------------------------------------------------------------------

function angularCalleeRoot(expr) {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression)) return expr.expression.text;
  return null;
}

/** The `@Component(...)`/`@Directive(...)` CallExpression itself (not just its name), or null. */
function componentDecoratorCallExpr(node) {
  if (!ts.canHaveDecorators(node)) return null;
  for (const dec of ts.getDecorators(node) ?? []) {
    if (
      ts.isCallExpression(dec.expression) &&
      ts.isIdentifier(dec.expression.expression) &&
      (dec.expression.expression.text === 'Component' || dec.expression.expression.text === 'Directive')
    ) {
      return dec.expression;
    }
  }
  return null;
}

/** Bare interface names (ignoring type arguments) from a class's OWN `implements` clause. */
function implementsInterfaceNames(classNode) {
  const names = [];
  for (const clause of classNode.heritageClauses ?? []) {
    if (clause.token !== ts.SyntaxKind.ImplementsKeyword) continue;
    for (const t of clause.types) {
      if (ts.isIdentifier(t.expression)) names.push(t.expression.text);
    }
  }
  return names;
}

/**
 * Does `decoratorCall`'s `providers: [...]` array self-provide `className` into an
 * injection token via `useExisting` (`{ provide: TOKEN, useExisting: <className> }`)?
 * `useFactory`-based providers (AtlDialog, AtlChat, AtlBreadcrumbs, AtlDrawer — none of
 * which `implements` their context interface, since the factory builds a plain object
 * instead of exposing `this`) deliberately do NOT match: there is no `this`-shaped
 * context to resolve props against.
 */
function isSelfProvidedViaUseExisting(decoratorCall, className) {
  if (!decoratorCall) return false;
  const arg = decoratorCall.arguments[0];
  if (!arg || !ts.isObjectLiteralExpression(arg)) return false;
  for (const prop of arg.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name) || prop.name.text !== 'providers') continue;
    if (!ts.isArrayLiteralExpression(prop.initializer)) continue;
    for (const el of prop.initializer.elements) {
      if (!ts.isObjectLiteralExpression(el)) continue;
      for (const p of el.properties) {
        if (
          ts.isPropertyAssignment(p) &&
          ts.isIdentifier(p.name) &&
          p.name.text === 'useExisting' &&
          ts.isIdentifier(p.initializer) &&
          p.initializer.text === className
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

/** Property-signature member names of interfaces named one of `names`, declared in source file `sf`. */
function interfaceMembersIn(sf, names) {
  const wanted = new Set(names);
  const result = new Set();
  ts.forEachChild(sf, (node) => {
    if (!ts.isInterfaceDeclaration(node) || !wanted.has(node.name.text)) return;
    for (const member of node.members) {
      if (ts.isPropertySignature(member) && member.name) result.add(propertyNameText(member.name));
    }
  });
  return result;
}

/** Parsed-source cache for sibling `.token.ts` files, keyed by that file's own path. */
const tokenFileCache = new Map();

/**
 * Property members of interfaces named one of `implementsNames`, declared in the sibling
 * `atl-<x>.token.ts` next to `classFile` (same convention as `atl-radio-group.ts` /
 * `atl-radio-group.token.ts`, `atl-select.ts` / `atl-select.token.ts`). Returns an empty
 * set if no such sibling file exists (e.g. `atl-table.ts` declares its `AtlTableContext`
 * inline — that case is covered by `interfaceMembersIn(sf, …)` on the class's own file
 * instead, see `extractAngular`).
 */
function siblingTokenInterfaceMembers(classFile, implementsNames) {
  const tokenFile = classFile.replace(/\.ts$/, '.token.ts');
  if (!tokenFileCache.has(tokenFile)) {
    tokenFileCache.set(
      tokenFile,
      fs.existsSync(tokenFile)
        ? ts.createSourceFile(tokenFile, fs.readFileSync(tokenFile, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
        : null
    );
  }
  const sf = tokenFileCache.get(tokenFile);
  return sf ? interfaceMembersIn(sf, implementsNames) : new Set();
}

/** @returns {Map<string, {inputs: Map, models: Map, outputs: Map, file: string, src: string, contextMembers: Set<string>}>} */
function extractAngular(dir) {
  const out = new Map();
  for (const file of componentSourceFiles(dir, 'ts')) {
    const src = fs.readFileSync(file, 'utf8');
    if (!src.includes('@Component(') && !src.includes('@Directive(')) continue;
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    ts.forEachChild(sf, (node) => {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const decoratorCall = componentDecoratorCallExpr(node);
      if (!decoratorCall) return;

      const inputs = new Map();
      const models = new Map();
      const outputs = new Map();

      for (const member of node.members) {
        if (!ts.isPropertyDeclaration(member) || !member.initializer) continue;
        const init = member.initializer;
        if (!ts.isCallExpression(init)) continue;
        const root = angularCalleeRoot(init.expression);
        if (root !== 'input' && root !== 'model' && root !== 'output') continue;

        const propName = propertyNameText(member.name);
        let declaredName = propName;
        for (const arg of init.arguments) {
          if (!ts.isObjectLiteralExpression(arg)) continue;
          for (const p of arg.properties) {
            if (
              ts.isPropertyAssignment(p) &&
              ts.isIdentifier(p.name) &&
              p.name.text === 'alias' &&
              ts.isStringLiteralLike(p.initializer)
            ) {
              declaredName = p.initializer.text;
            }
          }
        }

        if (root === 'input') inputs.set(declaredName, propName);
        else if (root === 'model') models.set(declaredName, propName);
        else outputs.set(declaredName, propName);
      }

      // Resolve the "provided into a token via useExisting" case (bullet 3, ADR-0093
      // fix): a prop this class never itself calls can still be genuinely consumed —
      // through the context interface it hands out to its children via DI. Only
      // useExisting counts (a useFactory provider, like AtlDialog/AtlChat/AtlBreadcrumbs/
      // AtlDrawer, builds a plain object instead of exposing `this`, so there is no
      // `this`-shaped context to resolve against). Checked in BOTH the class's own file
      // (AtlTable declares AtlTableContext inline) and its sibling `.token.ts` (AtlSelect/
      // AtlRadioGroup declare theirs there) — same interface, two possible locations.
      let contextMembers = new Set();
      const implementsNames = implementsInterfaceNames(node);
      if (implementsNames.length > 0 && isSelfProvidedViaUseExisting(decoratorCall, node.name.text)) {
        contextMembers = new Set([
          ...interfaceMembersIn(sf, implementsNames),
          ...siblingTokenInterfaceMembers(file, implementsNames),
        ]);
      }

      out.set(node.name.text, { inputs, models, outputs, file, src, contextMembers });
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// 7. Vue extraction (SFC — new machinery, spiked separately; see header).
// ---------------------------------------------------------------------------

function extractScriptBlocks(src) {
  const out = [];
  const re = /<script[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(src)) !== null) out.push(m[1]);
  return out.join('\n\n');
}

function findCalls(node, name, found) {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === name) {
    found.push(node);
  }
  ts.forEachChild(node, (c) => findCalls(c, name, found));
}

/** Resolve a defineProps/defineEmits type argument to its member list. */
function membersOfTypeNode(typeNode, sf) {
  if (!typeNode) return [];
  if (ts.isTypeLiteralNode(typeNode)) return typeNode.members;
  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    const name = typeNode.typeName.text;
    let found = [];
    ts.forEachChild(sf, function walk(n) {
      if (ts.isInterfaceDeclaration(n) && n.name.text === name) found = [...n.members];
      ts.forEachChild(n, walk);
    });
    return found;
  }
  return [];
}

function findComponentName(sf) {
  const calls = [];
  findCalls(sf, 'defineOptions', calls);
  for (const call of calls) {
    const arg = call.arguments[0];
    if (!arg || !ts.isObjectLiteralExpression(arg)) continue;
    for (const p of arg.properties) {
      if (
        ts.isPropertyAssignment(p) &&
        ts.isIdentifier(p.name) &&
        p.name.text === 'name' &&
        ts.isStringLiteralLike(p.initializer)
      ) {
        return p.initializer.text;
      }
    }
  }
  return null;
}

/** @returns {Map<string, {propNames: Set<string>, emitKeys: Set<string>, file: string, src: string}>} */
function extractVue(dir) {
  const out = new Map();
  for (const file of componentSourceFiles(dir, 'vue')) {
    const src = fs.readFileSync(file, 'utf8');
    const scriptSrc = extractScriptBlocks(src);
    if (!scriptSrc.trim()) continue;
    const sf = ts.createSourceFile(`${file}.virtual.ts`, scriptSrc, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    const componentName = findComponentName(sf);
    if (!componentName) continue;

    const propNames = new Set();
    const definePropsCalls = [];
    findCalls(sf, 'defineProps', definePropsCalls);
    for (const call of definePropsCalls) {
      const members = membersOfTypeNode(call.typeArguments?.[0], sf);
      for (const member of members) {
        if (ts.isPropertySignature(member) && member.name) propNames.add(propertyNameText(member.name));
      }
    }

    const emitKeys = new Set();
    const defineEmitsCalls = [];
    findCalls(sf, 'defineEmits', defineEmitsCalls);
    for (const call of defineEmitsCalls) {
      const members = membersOfTypeNode(call.typeArguments?.[0], sf);
      for (const member of members) {
        if (
          (ts.isPropertySignature(member) || ts.isMethodSignature(member) || ts.isCallSignatureDeclaration(member)) &&
          member.name
        ) {
          emitKeys.add(propertyNameText(member.name));
        }
      }
    }

    out.set(componentName, { propNames, emitKeys, file, src });
  }
  return out;
}

// ---------------------------------------------------------------------------
// 8. Main comparison.
// ---------------------------------------------------------------------------

const specNames = Object.keys(KEYED_SPECS);
const specProps = flattenSpecProps(specNames);

const angularByDir = new Map();
const reactByDir = new Map();
const vueByDir = new Map();
const dirs = new Set(Object.values(KEYED_SPECS));
for (const dir of dirs) {
  angularByDir.set(dir, extractAngular(path.join(LIB_DIR.angular, dir)));
  reactByDir.set(dir, extractReact(path.join(LIB_DIR.react, dir)));
  vueByDir.set(dir, extractVue(path.join(LIB_DIR.vue, dir)));
}

const errors = [];
const warnings = [];
const triggeredKeys = new Set();
let comparisons = 0;

/** @param {string} key @returns {{kind:string,reason:string}|undefined} */
function exemption(key) {
  const e = PROP_SURFACE_EXEMPT.get(key);
  if (e) triggeredKeys.add(key);
  return e;
}

function report(rule, key, message) {
  const e = exemption(key);
  if (e) {
    if (e.kind === 'gap') warnings.push({ key, reason: e.reason });
    return;
  }
  errors.push(`[${rule}] ${message}`);
}

for (const specName of specNames) {
  const dir = KEYED_SPECS[specName];
  const componentName = componentNameOf(specName);
  const props = specProps[specName];
  // Canonical (camelized) form of every spec prop this component has, for
  // EXTRA matching: an aria-* prop name in camelCase and its kebab-case
  // spelling are one public name (rule gap fix — Angular's alias produces the
  // kebab form, Vue's own convention produces the camel form; both must land
  // on the same identity when checked against the spec or NATIVE_PASSTHROUGH).
  const propsCanon = new Set([...props].map(camelize));
  comparisons++;

  const angularClasses = angularByDir.get(dir);
  const reactInterfaces = reactByDir.get(dir);
  const vueComponents = vueByDir.get(dir);

  const angular = angularClasses.get(componentName);
  const react = reactInterfaces.get(componentName);
  const vue = vueComponents.get(componentName);

  // -- Angular --------------------------------------------------------------
  if (!angular) {
    errors.push(
      `[MISSING] ${specName}: no Angular class '${componentName}' found under libs/angular/src/lib/${dir}`
    );
  } else {
    const anglePresent = new Map(); // token -> { member, kind } — see angularMemberConsumed
    for (const prop of props) {
      const change = CHANGE_PROP_RE.exec(prop);
      let present;
      let token;
      let member;
      let kind;
      if (change) {
        const x = change[1][0].toLowerCase() + change[1].slice(1);
        if (angular.models.has(x)) {
          present = true;
          token = x;
          member = angular.models.get(x);
          kind = 'signal';
        } else if (angular.outputs.has(`${x}Change`)) {
          present = true;
          token = `${x}Change`;
          member = angular.outputs.get(`${x}Change`);
          kind = 'output';
        } else {
          present = false;
        }
      } else if (angular.inputs.has(prop)) {
        present = true;
        token = prop;
        member = angular.inputs.get(prop);
        kind = 'signal';
      } else if (angular.models.has(prop)) {
        present = true;
        token = prop;
        member = angular.models.get(prop);
        kind = 'signal';
      } else {
        present = false;
      }
      if (present) {
        anglePresent.set(token, { member, kind });
      } else {
        report(
          'MISSING',
          `${specName}:${prop}:angular`,
          `${specName}:${prop} — Angular's ${componentName} (${path.relative(ROOT, angular.file)}) declares no ` +
            `input()/model()${change ? `/output('${change[1][0].toLowerCase()}${change[1].slice(1)}Change')` : ''} for it.`
        );
      }
    }
    const ownNames = [...angular.inputs.keys(), ...angular.models.keys(), ...angular.outputs.keys()];
    for (const name of ownNames) {
      if (GENERIC_EXTRA_IGNORE.angular.has(name)) continue;
      if (NATIVE_PASSTHROUGH.has(camelize(name))) continue;
      if (propsCanon.has(camelize(name))) continue;
      const m = /^(.+)Change$/.exec(name);
      if (m) {
        const specChangeName = `on${m[1][0].toUpperCase()}${m[1].slice(1)}Change`;
        if (props.has(specChangeName)) continue;
      }
      report(
        'EXTRA',
        `${specName}:${name}:angular`,
        `${specName}:${name} — Angular's ${componentName} (${path.relative(ROOT, angular.file)}) declares '${name}', which ${specName} does not have.`
      );
    }
    for (const [token, { member, kind }] of anglePresent) {
      if (angularMemberConsumed(angular, member, kind)) continue;
      const detail =
        kind === 'signal'
          ? `but nothing in that file — or in the context interface it hands out via useExisting — calls '${member}()'`
          : `but it appears nowhere else in that file (${occurrenceCount(angular.src, member)} occurrence(s))`;
      report(
        'DEAD',
        `${specName}:${token}:angular`,
        `${specName}:${token} — Angular's ${componentName} declares '${token}' in ${path.relative(ROOT, angular.file)} ${detail}.`
      );
    }
  }

  // -- React ------------------------------------------------------------------
  if (!react) {
    errors.push(`[MISSING] ${specName}: no React '${componentName}Props' found under libs/react/src/lib/${dir}`);
  } else {
    const reactPresent = new Set();
    if (react.referencesSpec) {
      for (const prop of props) reactPresent.add(prop);
    } else {
      for (const prop of props) {
        if (react.ownMembers.has(prop)) {
          reactPresent.add(prop);
        } else {
          report(
            'MISSING',
            `${specName}:${prop}:react`,
            `${specName}:${prop} — React's ${componentName}Props (${path.relative(ROOT, react.file)}) does not extend/intersect ${specName} and does not declare '${prop}' itself.`
          );
        }
      }
    }
    for (const name of react.ownMembers) {
      if (GENERIC_EXTRA_IGNORE.react.has(name)) continue;
      if (NATIVE_PASSTHROUGH.has(camelize(name))) continue;
      if (propsCanon.has(camelize(name))) continue;
      report(
        'EXTRA',
        `${specName}:${name}:react`,
        `${specName}:${name} — React's ${componentName}Props (${path.relative(ROOT, react.file)}) declares '${name}', which ${specName} does not have.`
      );
    }
    for (const token of react.skipDead ? [] : reactPresent) {
      const count = occurrenceCount(react.src, token);
      if (count <= 1) {
        report(
          'DEAD',
          `${specName}:${token}:react`,
          `${specName}:${token} — React's ${componentName} declares '${token}' (via ${componentName}Props) in ${path.relative(ROOT, react.file)} but it appears nowhere else in that file (${count} occurrence(s)).`
        );
      }
    }
  }

  // -- Vue ----------------------------------------------------------------
  if (!vue) {
    errors.push(`[MISSING] ${specName}: no Vue component '${componentName}' found under libs/vue/src/lib/${dir}`);
  } else {
    const vuePresent = new Set();
    for (const prop of props) {
      const change = CHANGE_PROP_RE.exec(prop);
      let present;
      let token;
      if (change) {
        const x = change[1][0].toLowerCase() + change[1].slice(1);
        if (vue.emitKeys.has(`update:${x}`)) {
          present = true;
          token = `update:${x}`;
        } else if (vue.emitKeys.has(`${x}Change`)) {
          present = true;
          token = `${x}Change`;
        } else {
          present = false;
        }
      } else {
        const camelProp = camelize(prop);
        present = vue.propNames.has(camelProp);
        token = camelProp;
      }
      if (present) {
        vuePresent.add(token);
      } else {
        report(
          'MISSING',
          `${specName}:${prop}:vue`,
          `${specName}:${prop} — Vue's ${componentName} (${path.relative(ROOT, vue.file)}) declares no matching prop/emit for it.`
        );
      }
    }
    for (const name of vue.propNames) {
      // `name` is already camelCase (Vue's own declared form), so
      // camelize(name) is a no-op here — kept for symmetry with the
      // Angular/React checks above, all three going through the same
      // canonical (camelized) comparison.
      if (NATIVE_PASSTHROUGH.has(camelize(name))) continue;
      if (propsCanon.has(camelize(name))) continue;
      report(
        'EXTRA',
        `${specName}:${name}:vue`,
        `${specName}:${name} — Vue's ${componentName} (${path.relative(ROOT, vue.file)}) declares '${name}', which ${specName} does not have.`
      );
    }
    for (const token of vuePresent) {
      const count = occurrenceCount(vue.src, token);
      if (count <= 1) {
        report(
          'DEAD',
          `${specName}:${token}:vue`,
          `${specName}:${token} — Vue's ${componentName} declares '${token}' in ${path.relative(ROOT, vue.file)} but it appears nowhere else in that file (${count} occurrence(s)).`
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 9. Allowlist hygiene: an entry naming something that no longer diverges.
// ---------------------------------------------------------------------------

for (const key of PROP_SURFACE_EXEMPT.keys()) {
  if (!triggeredKeys.has(key)) {
    errors.push(`[STALE] PROP_SURFACE_EXEMPT carries '${key}' but this run found no such divergence. Remove the entry.`);
  }
}

// ---------------------------------------------------------------------------
// 10. Report. Warnings are grouped by their shared reason string — one
// `gap` allowlist entry can cover many components (the 7 form controls'
// `errors` prop, the 13 "one event modeled" callbacks, …), and 52+ warnings
// printed one per line is exactly the kind of noise nobody reads past the
// first week. The reason prints once, followed by every key it covers.
// Errors stay one per line — there is no shared-reason grouping to do for a
// blocking, unresolved finding.
// ---------------------------------------------------------------------------

const warningsByReason = new Map();
for (const { key, reason } of warnings) {
  if (!warningsByReason.has(reason)) warningsByReason.set(reason, []);
  warningsByReason.get(reason).push(key);
}
for (const [reason, keys] of [...warningsByReason].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
  keys.sort();
  console.warn(`⚠ [GAP] (${keys.length}) ${reason}`);
  for (const key of keys) console.warn(`    - ${key}`);
}
for (const e of errors.sort()) console.error(`✗ ${e}`);

const summary =
  `${comparisons} keyed component(s) compared across angular/react/vue, ` +
  `${UNKEYED_COMPONENTS.length} component(s) unkeyed (${UNKEYED_COMPONENTS.map((c) => c.name).join(', ')}), ` +
  `${triggeredKeys.size} live exemption(s) in PROP_SURFACE_EXEMPT.`;

if (errors.length > 0) {
  console.error(`\n${errors.length} prop-surface issue(s). ${summary}`);
  process.exit(1);
}
console.log(`✓ every keyed spec's prop surface is accounted for in angular/react/vue (or exempted). ${summary}`);
process.exit(0);
