#!/usr/bin/env node
/**
 * check-figma.js
 *
 * Figma conformance gate — the drift gate for the AI-readiness layer that
 * previously had none (see plan/ai-readiness.md §4). Closes the loop the
 * manual plan/figma-component-checklist.md used to hold open.
 *
 * Figma is an *external* source, so unlike every other check:* gate this one
 * does NOT read Figma live. It runs fully OFFLINE against a committed snapshot
 * (`tools/figma/snapshot.json`) produced by the connected refresh step
 * (`npm run figma:snapshot`, see tools/scripts/figma-snapshot.mjs). The snapshot
 * carries Figma *facts* (names, variant axes, descriptions, layoutMode, which
 * fills/spacings/radii are token-bound vs. raw); this gate applies the *rules*
 * and severities. That keeps the gate deterministic and CI-safe — the only part
 * that needs the Figma Desktop Bridge is the refresh.
 *
 * For each master COMPONENT_SET captured in the snapshot, compared against
 * libs/spec/src/index.ts (selectors + string-literal unions) and
 * libs/spec/src/metadata/<component>.metadata.ts:
 *
 *   1. Name alignment        — component name == spec selector; variant-property
 *                              names == spec axis unions; values == literals
 *                              exactly (`primary`, not `Primary`).      BLOCKER
 *   2. Variant-matrix         — every metadata.variantMatrix row exists as a
 *      completeness            Figma variant.                            BLOCKER
 *   3. Token-link coverage    — no raw hex fills/strokes, no raw px radii or
 *                              spacing; all bound to UI-Tokens variables. CRITICAL
 *   4. Auto-layout present    — every frame WITH children uses Auto Layout. CRITICAL
 *   5. Description congruence — master description set and references the spec
 *                              interface it maps to.                      WARNING
 *
 * Exit-code (symmetric with the other gates): BLOCKER + CRITICAL go to `errors`
 * → process.exit(1). WARNING is printed but does not block.
 *
 * Run via:  node tools/scripts/check-figma.js   (or  npm run check:figma)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { parseExportedVars, findExportedInterfaces } = require('./lib/ts-eval');
const { FIGMA_CONFORMANCE_EXCEPTIONS } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');
const SNAPSHOT_FILE = path.join(ROOT, 'tools/figma/snapshot.json');
const SPEC_FILE = path.join(ROOT, 'libs/spec/src/index.ts');
const METADATA_INDEX = path.join(ROOT, 'libs/spec/src/metadata/index.ts');
const METADATA_DIR = path.join(ROOT, 'libs/spec/src/metadata');
const TOKENS_FILE = path.join(
  ROOT,
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css'
);

// Severity → bucket. BLOCKER + CRITICAL fail the build; WARNING is advisory.
const errors = []; // { sev, tag, msg }
const warnings = [];
function blocker(tag, msg) { errors.push({ sev: 'BLOCKER', tag, msg }); }
function critical(tag, msg) { errors.push({ sev: 'CRITICAL', tag, msg }); }
function warning(tag, msg) { warnings.push({ sev: 'WARNING', tag, msg }); }

/** Allowlisted? Key is `selector:check:detail` — same exact-string idiom as the
 *  other gates' Sets (see tools/scripts/lib/allowlists.js). */
function allowed(selector, check, detail) {
  return FIGMA_CONFORMANCE_EXCEPTIONS.has(`${selector}:${check}:${detail}`);
}

// ---------------------------------------------------------------------------
// Load the snapshot. Fail loud — never a silent pass — if it is missing or
// unreadable. (The connected refresh step is the only thing that can write it.)
// ---------------------------------------------------------------------------
if (!fs.existsSync(SNAPSHOT_FILE)) {
  console.error(
    `✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} not found.\n` +
      `\nThe Figma gate runs offline against a committed snapshot. Generate it with a\n` +
      `connected Figma Desktop Bridge:  npm run figma:snapshot`
  );
  process.exit(1);
}

let snapshot;
try {
  snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
} catch (err) {
  console.error(`✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} is not valid JSON: ${err.message}`);
  process.exit(1);
}
if (!snapshot || !Array.isArray(snapshot.components) || snapshot.components.length === 0) {
  console.error(
    `✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} has no components. Re-run npm run figma:snapshot.`
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load the spec side: exported Atl*Spec interfaces + the string-literal unions.
// ---------------------------------------------------------------------------
const specInterfaces = new Set(findExportedInterfaces(SPEC_FILE, 'Spec'));
const unionMembers = parseSpecUnions(SPEC_FILE); // { AtlButtonVariant: ['primary', ...], ... }

// Interface name -> { parents, fields, omitted }, so a master's prose claim
// ("Boolean `disabled`: maps to AtlFormFieldSpec.disabled") can be checked rather
// than believed. Two of those claims were false, and both were drift our own change
// caused: ADR-0045 moved `readonly` out of AtlFormFieldSpec into AtlReadonlySpec and
// the descriptions kept pointing at the old home (ADR-0056).
const specShapes = parseSpecShapes(SPEC_FILE);

/** The interfaces `<name>` resolves to, itself included, following `extends`. */
function specChain(name) {
  const chain = new Set();
  (function walk(n) {
    if (!n || chain.has(n) || !specShapes.has(n)) return;
    chain.add(n);
    for (const parent of specShapes.get(n).parents) walk(parent);
  })(name);
  return chain;
}

/** The boolean-typed fields `<name>` exposes, inherited ones included. */
function specBooleans(name, seen = new Set()) {
  if (seen.has(name) || !specShapes.has(name)) return new Set();
  seen.add(name);
  const entry = specShapes.get(name);
  const out = new Set(entry.booleans);
  for (const parent of entry.parents) for (const f of specBooleans(parent, seen)) out.add(f);
  for (const o of entry.omitted) out.delete(o);
  return out;
}

/** The fields `<name>` exposes, inherited ones included and Omit'd ones removed. */
function specFields(name, seen = new Set()) {
  if (seen.has(name) || !specShapes.has(name)) return new Set();
  seen.add(name);
  const entry = specShapes.get(name);
  const out = new Set(entry.fields);
  for (const parent of entry.parents) for (const f of specFields(parent, seen)) out.add(f);
  for (const o of entry.omitted) out.delete(o);
  return out;
}

const registry = parseExportedVars(METADATA_INDEX).COMPONENT_METADATA_REGISTRY || {};
const metadataCache = new Map();
function metadataForSpec(specName) {
  const moduleName = registry[specName];
  if (!moduleName) return null;
  if (!metadataCache.has(moduleName)) {
    const file = path.join(METADATA_DIR, `${moduleName}.metadata.ts`);
    metadataCache.set(moduleName, fs.existsSync(file) ? parseExportedVars(file).metadata : null);
  }
  return metadataCache.get(moduleName);
}

// ---------------------------------------------------------------------------
// Run the five checks per component.
// ---------------------------------------------------------------------------
for (const comp of snapshot.components) {
  // ── Boolean properties, which live only in the master's prose ──────────────
  // The snapshot records variantAxes as data and Booleans as description text, so
  // this reads the text. Until the snapshot carries them structurally that is the
  // only place the claim exists — and an unchecked claim is how AtlRadio came to
  // declare a mapping to an interface its own spec does not extend (ADR-0056).
  {
    const ownSpec = `${comp.selector}Spec`;
    // The snapshot captures the real property definitions now, so the declared set is
    // fact rather than prose. The description is still read for the *mappings*, which
    // exist nowhere else.
    const realBooleans = Object.entries(comp.properties || {})
      .filter(([, t]) => t === 'BOOLEAN')
      .map(([k]) => k.split('#')[0]);
    const declared = new Set(realBooleans);
    for (const m of (comp.description || '').matchAll(/^- Boolean `([^`]+)`:([^\n]*)$/gm)) {
      declared.add(m[1]);
      // `inherited from X.field` is the honest form for a state a component reads from
      // its parent rather than declaring: AtlRadio draws `invalid` because
      // `atl-radio.tsx` computes `ctx.invalid && 'is-invalid'` from the group. Checked
      // the same way as a direct mapping, minus the requirement that this component's
      // own spec resolve to that interface.
      const inherited = /inherited from `?(\w+)\.(\w+)`?/.exec(m[2]);
      if (inherited) {
        const [, iface, field] = inherited;
        if (!specShapes.has(iface)) {
          warning('BOOL-CLAIM', `${comp.name}: Boolean \`${m[1]}\` says it is inherited from ${iface}.${field}, and no such interface is exported from libs/spec.`);
        } else if (!specFields(iface).has(field)) {
          warning('BOOL-CLAIM', `${comp.name}: Boolean \`${m[1]}\` says it is inherited from ${iface}.${field}, and ${iface} has no field \`${field}\`.`);
        }
        continue;
      }
      const mapping = /maps to `?(\w+)\.(\w+)`?/.exec(m[2]);
      if (!mapping) continue; // free prose: a Figma-only toggle, not a spec claim
      const [, iface, field] = mapping;
      if (!specShapes.has(iface)) {
        warning('BOOL-CLAIM', `${comp.name}: Boolean \`${m[1]}\` claims ${iface}.${field}, and no such interface is exported from libs/spec.`);
        continue;
      }
      const chain = specChain(ownSpec);
      if (!chain.has(iface)) {
        warning('BOOL-CLAIM', `${comp.name}: Boolean \`${m[1]}\` claims ${iface}.${field}, but ${ownSpec} does not resolve to ${iface} — it resolves to ${[...chain].join(', ') || 'nothing'}. The mapping names an interface this component does not implement.`);
        continue;
      }
      if (!specFields(iface).has(field)) {
        warning('BOOL-CLAIM', `${comp.name}: Boolean \`${m[1]}\` claims ${iface}.${field}, and ${iface} has no field \`${field}\`. Point it at the interface that owns the field today.`);
      }
    }
    // …and the other direction: a spec flag the master offers no way to set.
    if (specShapes.has(ownSpec)) {
      const fields = specFields(ownSpec);
      // A flag can be expressed three ways, and the gate has to accept all three or
      // it sends the reader to add a property that contradicts what is already there.
      //
      //   1. a Boolean property                    — the obvious one
      //   2. a value of a variant axis             — AtlInput carries `invalid` as a
      //                                              value of `state`
      //   3. a variant axis mapped to it in prose  — AtlToggle's `selection` = off|on
      //                                              maps to AtlToggleSpec.checked, and
      //                                              neither the axis name nor its values
      //                                              are the word "checked"
      const axisValues = new Set(
        Object.values(comp.variantAxes || {}).flat().map((v) => String(v).toLowerCase())
      );
      const mappedByAxis = new Set();
      for (const m of (comp.description || '').matchAll(/^- Variant `([^`]+)`:([^\n]*)$/gm)) {
        const map = /maps to `?(\w+)\.(\w+)`?/.exec(m[2]);
        if (map) mappedByAxis.add(map[2]);
      }
      // A stated, reasoned opt-out. `open` on a dialog is the case: its false value
      // renders nothing, so it is not a variant of anything. The reason lives in the
      // master's description rather than in a list inside this gate — an exemption
      // nobody can read is where a rule goes to die.
      //   - Boolean `open`: not modelled — false renders nothing
      const optedOut = new Set(
        [...(comp.description || '').matchAll(/^- Boolean `([^`]+)`:\s*not modelled\s*[\u2014-]\s*\S/gm)].map((m) => m[1])
      );
      // An axis NAMED for the boolean field expresses it as surely as an axis value
      // does: AtlBreadcrumbItem's `current` = false|true and AtlAccordionItem's
      // `expanded` = false|true are the property, drawn. Both are states that
      // recolour AND add/remove an element, which a visibility Boolean cannot do.
      const axisNames = new Set(Object.keys(comp.variantAxes || {}));
      const gaps = [...specBooleans(ownSpec)].filter(
        (f) => !declared.has(f) && !axisValues.has(f) && !axisNames.has(f) && !mappedByAxis.has(f) && !optedOut.has(f)
      );
      if (gaps.length > 0) {
        warning('BOOL-MISSING', `${comp.name}: ${ownSpec} has ${gaps.join(', ')} and the master offers no way to set ${gaps.length > 1 ? 'them' : 'it'} — no Boolean property, no variant-axis value, and no stated opt-out. A state a component supports and a master cannot express is a state nobody can draw. A Boolean binds only to a layer's visibility, so use one where the state ADDS an element and a variant axis where it changes a colour; if the state has nothing to draw, say so in the description as \`- Boolean \\\`x\\\`: not modelled — <reason>\`.`);
      }
    }
  }

  // ── A declared property the spec does not have ────────────────────────────
  // The third direction, and the one nothing asked. [BOOL-MISSING] goes spec →
  // master; [BOOL-INERT] asks whether a declared Boolean toggles any layer. Both
  // pass a Boolean that toggles a real layer drawing a state the component does not
  // have: AtlTable and AtlTabGroup each declared `loading` bound to a
  // `_loading-spinner`, and neither spec has the field — only AtlButton renders a
  // spinner at all, in any framework (ADR-0061).
  {
    const ownSpec = `${comp.selector}Spec`;
    const fields = specFields(ownSpec);
    const declared = Object.entries(comp.properties || {})
      .filter(([, t]) => t === 'BOOLEAN')
      .map(([k]) => k.split('#')[0]);
    // A mapping stated in prose is checked by [BOOL-CLAIM]; accept it here.
    const claimed = new Set(
      [...(comp.description || '').matchAll(/^- Boolean `([^`]+)`:[^\n]*(?:maps to|inherited from)/gm)].map((m) => m[1])
    );
    const invented = declared.filter(
      (b) => !fields.has(b) && !claimed.has(b) && !allowed(comp.selector, 'bool', `unspeced:${b}`)
    );
    if (invented.length && specInterfaces.has(ownSpec)) {
      blocker(
        'BOOL-UNSPECED',
        `${comp.name}: Boolean ${invented.map((b) => `\`${b}\``).join(', ')} ${invented.length > 1 ? 'are' : 'is'} declared, and ${ownSpec} has no such field. A master can invent API as easily as it can omit it, and an invented property is a state a designer can draw that no component renders. Remove it, or state the mapping as \`- Boolean \\\`x\\\`: maps to <Interface>.<field>\` if the state lives on another interface.`
      );
    }
  }

  // ── A declared property that toggles nothing ──────────────────────────────
  // A Figma Boolean can only bind to a layer's `visible`. So a state that differs by
  // colour cannot be a Boolean at all, and declaring one anyway produces API that
  // does nothing — measured: twenty such properties were shipping, including all five
  // on AtlTable. This is the mirror of [BOOL-MISSING] and the more common defect
  // (ADR-0058).
  {
    const referenced = new Set(comp.referencedProperties || []);
    // A master may state, per property, why a declared Boolean is unbound — the state
    // has no visual the component renders (`required` is a DOM attribute and nothing
    // else), or the property belongs to a child spec whose master does not exist yet
    // (AtlTable's `sortable` is AtlThSpec's). The reason goes in the description, where
    // a designer opening the master reads it (ADR-0058).
    //   - Boolean `required`: declared but unbound — <reason>
    const statedUnbound = new Set(
      [...(comp.description || '').matchAll(/^- Boolean `([^`]+)`:\s*declared but unbound\s*[\u2014-]\s*\S/gm)].map((m) => m[1])
    );
    const dead = Object.entries(comp.properties || {})
      .filter(([k, t]) => t === 'BOOLEAN' && !referenced.has(k))
      .map(([k]) => k.split('#')[0])
      .filter((k) => !statedUnbound.has(k));
    if (dead.length > 0) {
      warning('BOOL-INERT', `${comp.name}: Boolean ${dead.length > 1 ? 'properties' : 'property'} ${dead.map((d) => `\`${d}\``).join(', ')} ${dead.length > 1 ? 'are' : 'is'} declared and nothing references ${dead.length > 1 ? 'them' : 'it'} — the ${dead.length > 1 ? 'properties toggle' : 'property toggles'} no layer, so switching ${dead.length > 1 ? 'them' : 'it'} changes nothing. Bind it to the visibility of the layer that state adds. A colour-only state works too: add an overlay that paints the new colour and bind that, the way AtlSelect's \`_invalid-border\` does.`);
    }
  }

  // ── A pictogram drawn as a text character ─────────────────────────────────
  // The same defect ADR-0046 removed from the CSS, ADR-0050 from the TypeScript,
  // ADR-0055 from the templates and ADR-0057 from the Icons page — and it was inside
  // nineteen masters the whole time. A character cannot be an icon instance, cannot
  // follow the set, and depends on whichever font has it (ADR-0058).
  {
    // A master may state, per layer, why a character is not an icon instance. The
    // reason lives in the description where a designer reading the master sees it —
    // the same rule as the Boolean opt-outs, and for the same reason: an exemption
    // inside this script is one nobody can read from the artefact.
    //   - Glyph `–` on `min-icon`: <reason>
    const statedGlyphs = new Set(
      [...(comp.description || '').matchAll(/^- Glyph `([^`]+)` on `([^`]+)`:\s*\S/gm)].map((m) => `${m[1]}|${m[2]}`)
    );
    const glyphs = (comp.glyphTextNodes || []).filter((g) => !statedGlyphs.has(`${g.chars}|${g.layer}`));
    if (glyphs.length > 0) {
      const shown = glyphs.slice(0, 6).map((g) => `${JSON.stringify(g.chars)} on \`${g.layer}\``);
      warning('MASTER-GLYPH', `${comp.name}: ${glyphs.length} pictogram${glyphs.length > 1 ? 's' : ''} drawn as TEXT characters — ${shown.join(', ')}${glyphs.length > 6 ? `, and ${glyphs.length - 6} more` : ''}. Replace with an instance of the Icon library, which is generated from ATL_ICON_GEOMETRY (ADR-0057).`);
    }
  }

  // ── A variant axis is the master's API surface ─────────────────────────────
  // Four masters carried axes that picture an outcome rather than name a prop —
  // AtlBreadcrumbs items=3|4|5, AtlPagination position=first|middle|last,
  // AtlTabGroup selected=0|1. A designer reading the list sees API where there is
  // none, so those belong on an example page as instances (ADR-0056).
  {
    const INTERACTION_AXES = new Set(['state', 'selection']);
    const ownSpec = `${comp.selector}Spec`;
    // With no spec interface there is nothing to compare an axis against, and the
    // component already gets a [MAP]/[DESC] warning for that. Judging its axes here
    // would report AtlToast's `variant` as fictional when the missing half is the spec.
    const fields = specShapes.has(ownSpec) ? specFields(ownSpec) : null;
    if (fields === null) continue;
    for (const axis of Object.keys(comp.variantAxes || {})) {
      if (INTERACTION_AXES.has(axis)) continue;
      if (fields.has(axis)) continue;
      // The file's convention derives an axis name from the spec UNION, not from the
      // field: `AtlButtonVariant` gives `variant`, `AtlTooltipPosition` gives
      // `position`. Checking only `Atl<Axis>` missed the second shape and reported a
      // correct axis as a naming mismatch — and renaming it to the field name
      // (`atlTooltipPosition`) then tripped this gate's own [NAME] blocker. Any union
      // whose name ends in the capitalised axis counts.
      const axisCap = axis[0].toUpperCase() + axis.slice(1);
      if (Object.keys(unionMembers).some((u) => u.endsWith(axisCap))) continue;
      const values = (comp.variantAxes[axis] || []).join(' | ');
      // An axis whose name is buried inside a real prop's name is a naming mismatch,
      // not a fiction: AtlTooltip's axis is `position` and the prop is
      // `atlTooltipPosition`. Saying "not a property" there sends the reader looking
      // for the wrong repair.
      const near = [...fields].find((f) => f.toLowerCase().includes(axis.toLowerCase()));
      if (near) {
        warning('AXIS-NAME', `${comp.name}: variant axis \`${axis}\` = ${values} names ${ownSpec}.${near} under a different name. Rename the axis to \`${near}\` so the master and the contract read the same${/index$/i.test(near) ? ` — and note that ${near} is a number, so an axis can only ever picture a sample of it` : ''}.`);
        continue;
      }
      warning('AXIS-NOT-A-PROP', `${comp.name}: variant axis \`${axis}\` = ${values} is not a property of ${ownSpec}. An axis is the master's API surface; picture this with instances on an example page instead.`);
    }
  }

  const selector = comp.selector; // e.g. 'AtlButton'
  const specName = `${selector}Spec`;

  checkNameAlignment(comp, selector, specName);
  checkVariantMatrix(comp, selector, specName);
  checkTokenLinks(comp, selector);
  checkAutoLayout(comp, selector);
  checkDescription(comp, selector, specName);
}

// ---------------------------------------------------------------------------
// Which CSS rule's paint each master's ROOT carries, and the cascade that
// resolves it for the variant the snapshot samples. `{axis}` is substituted from
// the sampled variant name, so AtlButton's fill resolves through
// `.atl-button.variant-primary` when `variant=primary` is what was measured.
//
// Only masters whose Figma ROOT and CSS root paint the same box are listed. For
// AtlCombobox, AtlCheckbox, AtlRadio(Group), AtlToggle, AtlProgress, AtlTable,
// AtlBreadcrumbs, AtlPagination, AtlStepper, AtlAvatarGroup and AtlChat the paint
// sits on an inner box (the field, the track, a cell, a link, a page button, or —
// for Chat — an illustrative app mockup) while the Figma root is a transparent
// container. Checking those needs a per-LAYER map, which is recorded as open in
// tasks/todo.md rather than guessed at here.
// ---------------------------------------------------------------------------
const ROOT_PAINT = [
  { label: 'AtlButton', file: 'button/atl-button.css', cascade: ['.atl-button', '.atl-button.variant-{variant}'] },
  { label: 'AtlInput', file: 'input/atl-input.css', cascade: ['.atl-input input'] },
  { label: 'AtlTextarea', file: 'textarea/atl-textarea.css', cascade: ['.atl-textarea textarea'] },
  { label: 'AtlSelect', file: 'select/atl-select.css', cascade: ['.atl-select select'] },
  { label: 'AtlBadge', file: 'badge/atl-badge.css', cascade: ['.atl-badge', '.atl-badge.variant-{variant}'] },
  { label: 'AtlAvatar', file: 'avatar/atl-avatar.css', cascade: ['.atl-avatar', '.atl-avatar.shape-{shape}'] },
  { label: 'AtlCard', file: 'card/atl-card.css', cascade: ['.atl-card', '.atl-card.variant-{variant}'] },
  { label: 'AtlSkeleton', file: 'skeleton/atl-skeleton.css', cascade: ['.atl-skeleton', '.atl-skeleton.variant-{variant}'] },
  { label: 'AtlCodeBlock', file: 'code-block/atl-code-block.css', cascade: ['.atl-code-block'] },
  { label: 'AtlMenu', file: 'menu/atl-menu.css', cascade: ['.atl-menu'] },
  { label: 'AtlTabGroup', file: 'tabs/atl-tabs.css', cascade: ['.atl-tab-group', '.atl-tab-group.variant-{variant}'] },
  { label: 'AtlTooltip', file: 'tooltip/atl-tooltip.css', cascade: ['.atl-tooltip'] },
  { label: 'AtlDialog', file: 'dialog/atl-dialog.css', cascade: ['.atl-dialog'] },
  { label: 'AtlDrawer', file: 'drawer/atl-drawer.css', cascade: ['.atl-drawer-host dialog'] },
  { label: 'AtlToast', file: 'toast/atl-toast.css', cascade: ['.atl-toast', '.atl-toast.variant-{variant}'] },
  { label: 'AtlAlert', file: 'alert/atl-alert.css', cascade: ['.atl-alert', '.atl-alert.variant-{variant}'] },
  { label: 'AtlAccordionGroup', file: 'accordion/atl-accordion.css', cascade: ['.atl-accordion-group', '.atl-accordion-group.variant-{variant}'] },
  // Child masters (ADR-0062). Each one turns a layer nobody could check into a root.
  { label: 'AtlMenuItem', file: 'menu/atl-menu.css', cascade: ['.atl-menu-item'] },
  { label: 'AtlBreadcrumbItem', file: 'breadcrumbs/atl-breadcrumbs.css', cascade: ['.atl-breadcrumb-item'] },
  { label: 'AtlTab', file: 'tabs/atl-tabs.css', cascade: ['.atl-tab-group .tablist button'] },
  { label: 'AtlStep', file: 'stepper/atl-stepper.css', cascade: ['.step-item'] },
  // Only Angular renders an option row at all: React and Vue emit a native
  // <select> the operating system draws (ADR-0028).
  { label: 'AtlOption', file: 'select/atl-option.css', lib: 'angular', cascade: ["[role='option']"] },
  { label: 'AtlAccordionItem', file: 'accordion/atl-accordion.css', cascade: ['.atl-accordion-item'] },
  { label: 'AtlChatMessage', file: 'chat/atl-chat.css', cascade: ['.atl-chat-message', '.atl-chat-message.role-{role}'] },
  { label: 'AtlChatSuggestion', file: 'chat/atl-chat.css', cascade: ['.atl-chat-suggestion .chip'] },
  { label: 'AtlChatTyping', file: 'chat/atl-chat.css', cascade: ['.atl-chat-typing'] },
  // AtlMenuSeparator is deliberately absent: the CSS root IS the 1px rule, while the
  // master's root is the margin box that carries var(--ui-spacing-2) above and below
  // so it stacks correctly. The rule is a child layer, which this table cannot address.
];

const LAYER_ALIASES = {
  AtlTabGroup: { tab: '.atl-tab-group .tablist button', tabpanel: '.atl-tab-group [role="tabpanel"]' },
  AtlTable: { th: '.atl-table thead th', td: '.atl-table tbody td', thead: '.atl-table thead', tbody: '.atl-table tbody' },
  AtlInput: { field: '.atl-input input' },
  AtlTextarea: { field: '.atl-textarea textarea' },
  AtlSelect: { field: '.atl-select select' },
};

// ---------------------------------------------------------------------------
// File-level typography. Not per-component: a typeface is a property of the
// whole file, and the two defects it hides are file-shaped. The masters were
// drawn in Inter while --ui-font-family had said Instrument Sans since ADR-0035,
// and the 19 ty/* text styles documented a Montserrat scale the library never
// had — each style used exactly once, by its own specimen row (ADR-0059).
// ---------------------------------------------------------------------------
checkTypography();
checkRootPaint();
checkOverlays();
checkLayerPaint();

// ---------------------------------------------------------------------------
// Report — prioritized (Blocker → Critical → Warning), styled like the other
// gates. Each finding is one actionable line.
// ---------------------------------------------------------------------------
report();

// ===========================================================================
// Checks
// ===========================================================================

/** 1. Name alignment — selector exists in the spec; every spec axis union is a
 *  Figma variant property whose values match the literals exactly. Figma axes
 *  with no matching spec union (e.g. interaction `state`) are ignored. */
function checkNameAlignment(comp, selector, specName) {
  if (!specInterfaces.has(specName)) {
    // Some masters are deliberately spec-less (Toast is options-based per
    // ADR-0008, CodeBlock has no spec contract) — allowlist as
    // `selector:name:spec-interface` instead of inventing an interface.
    if (allowed(selector, 'name', 'spec-interface')) return;
    blocker('NAME', `${selector}: Figma component "${comp.name}" has no matching spec interface ${specName} in libs/spec/src/index.ts. Rename the Figma component or fix the spec.`);
    return;
  }
  const axes = comp.variantAxes || {};
  // For every spec union that belongs to this selector, the Figma axis must
  // exist and its values must match the literals exactly.
  for (const [unionName, members] of Object.entries(unionMembers)) {
    if (!unionName.startsWith(selector)) continue;
    const remainder = unionName.slice(selector.length);
    // The remainder has to be an axis word, not merely whatever is left over.
    // `AtlTab` is a prefix of BOTH `AtlTabGroupVariant` and `AtlTableVariant`, which
    // a plain prefix test turned into axes named `groupVariant` and `leVariant`.
    if (!/^(Variant|Size|Shape|Position|Orientation|Align|Role)$/.test(remainder)) continue;
    const axisProp = lowerFirst(remainder); // AtlButtonVariant -> 'variant'
    if (!axisProp) continue;
    const figmaValues = axes[axisProp];
    if (!figmaValues) {
      // Some spec unions are realised as code-only props (e.g. a landmark role),
      // never as a Figma variant axis — allowlist them as `selector:name:<axis>`.
      if (allowed(selector, 'name', axisProp)) continue;
      blocker('NAME', `${selector}: spec axis "${axisProp}" (${unionName}) has no matching Figma variant property. Add a "${axisProp}" variant axis, or allowlist it if it is a code-only prop.`);
      continue;
    }
    const figmaSet = new Set(figmaValues);
    const specSet = new Set(members);
    const missing = members.filter((m) => !figmaSet.has(m) && !allowed(selector, 'name', `${axisProp}=${m}`));
    const extra = figmaValues.filter((v) => !specSet.has(v) && !allowed(selector, 'name', `${axisProp}=${v}`));
    if (missing.length) {
      blocker('NAME', `${selector}.${axisProp}: Figma is missing value(s) [${missing.map(q).join(', ')}] present in spec ${unionName}. Add the variant value(s) (exact casing).`);
    }
    if (extra.length) {
      blocker('NAME', `${selector}.${axisProp}: Figma has value(s) [${extra.map(q).join(', ')}] not in spec ${unionName}. Rename to the spec literal or remove (casing must match exactly, e.g. "primary" not "Primary").`);
    }
  }
}

/** 2. Variant-matrix completeness — every metadata.variantMatrix row must be
 *  satisfied by at least one captured Figma variant (superset match on the axis
 *  keys the row and the component share). */
function checkVariantMatrix(comp, selector, specName) {
  const meta = metadataForSpec(specName);
  if (!meta || !Array.isArray(meta.variantMatrix)) return; // metadata gate owns this
  const axisKeys = new Set(Object.keys(comp.variantAxes || {}));
  const variants = comp.variants || [];
  for (const row of meta.variantMatrix) {
    if (!row || typeof row !== 'object') continue;
    // Only the row's keys that are real Figma variant axes are matchable
    // (rows may carry boolean/code-only keys like closeOnBackdrop).
    const keys = Object.keys(row).filter((k) => axisKeys.has(k));
    if (keys.length === 0) continue;
    const detail = keys.map((k) => `${k}=${row[k]}`).join(',');
    if (allowed(selector, 'variant', detail)) continue;
    const hit = variants.some((v) => keys.every((k) => String(v[k]) === String(row[k])));
    if (!hit) {
      blocker('VARIANT', `${selector}: metadata.variantMatrix entry {${detail}} has no matching Figma variant. Add it to the COMPONENT_SET.`);
    }
  }
}

/** 3. Token-link coverage — raw colors, raw radii, raw spacing, and bindings to
 *  a non-semantic collection. Aggregated per component so the report stays
 *  readable. */
function checkTokenLinks(comp, selector) {
  const rawColorNodes = [];
  const rawRadiusNodes = [];
  const rawSpacingNodes = [];
  const nonSemantic = [];
  for (const n of comp.nodes || []) {
    if ((n.rawColors || []).length && !allowed(selector, 'token', `color:${n.name}`)) {
      rawColorNodes.push(`${n.name}${n.hidden ? ' [hidden]' : ''} (${n.rawColors.join(', ')})`);
    }
    if (n.unboundRadius && !allowed(selector, 'token', `radius:${n.name}`)) {
      rawRadiusNodes.push(`${n.name} (${n.unboundRadius})`);
    }
    if ((n.unboundSpacing || []).length && !allowed(selector, 'token', `spacing:${n.name}`)) {
      rawSpacingNodes.push(n.name);
    }
    for (const t of n.nonSemanticTokens || []) {
      if (!allowed(selector, 'token', `nonsemantic:${t}`)) nonSemantic.push(`${t} on ${n.name}`);
    }
  }
  if (rawColorNodes.length) {
    critical('TOKEN', `${selector}: raw color fill/stroke (no bound variable) on ${rawColorNodes.join('; ')}. Bind to a UI-Tokens color variable (--ui-color-*).`);
  }
  if (rawRadiusNodes.length) {
    critical('TOKEN', `${selector}: raw corner radius (not bound) on ${rawRadiusNodes.join('; ')}. Bind to a radius variable (--ui-radius-*).`);
  }
  if (rawSpacingNodes.length) {
    critical('TOKEN', `${selector}: raw padding/gap (not bound) on ${rawSpacingNodes.length} node(s) [${rawSpacingNodes.join(', ')}]. Bind to a spacing variable (--ui-spacing-*).`);
  }
  if (nonSemantic.length) {
    warning('TOKEN', `${selector}: bound to non-semantic collection — ${nonSemantic.join('; ')}. Components should bind to the Library Tokens (semantic) layer, not primitives.`);
  }
}

/** 4. Auto-layout present — any node with children that is a frame-like
 *  container must use Auto Layout (layoutMode != NONE). Childless frames
 *  (dividers, spacers) are exempt. */
function checkAutoLayout(comp, selector) {
  const FRAME_LIKE = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'GROUP']);
  const offenders = [];
  for (const n of comp.nodes || []) {
    if (!n.hasChildren) continue;
    if (!FRAME_LIKE.has(n.type)) continue;
    if (n.layoutMode && n.layoutMode !== 'NONE') continue;
    // An icon instance is a fixed-ratio drawing, not a layout: it has no responsive
    // intent for a generator to infer, and every icon in the library would otherwise
    // be reported the moment a glyph is replaced by the instance that should have been
    // there all along (ADR-0058).
    if ((comp.iconInstanceNames || []).includes(n.name)) continue;
    if (allowed(selector, 'autolayout', n.name)) continue;
    offenders.push(n.name);
  }
  if (offenders.length) {
    critical('AUTOLAYOUT', `${selector}: frame(s) without Auto Layout — [${offenders.join(', ')}]. Enable Auto Layout so generators can infer responsive intent.`);
  }
}

/** 5. Description congruence — the master description must be set and must
 *  reference the spec interface it maps to (the contract link). Figma
 *  descriptions are intentionally richer than the one-line metadata.purpose, so
 *  byte-equality is not enforced; presence + spec linkage is the meaningful
 *  signal. Advisory (Warning). */
function checkDescription(comp, selector, specName) {
  const desc = (comp.description || '').trim();
  if (!desc) {
    warning('DESC', `${selector}: master component has no Figma description. Add one that maps it to ${specName}.`);
    return;
  }
  if (!desc.includes(specName) && !allowed(selector, 'desc', 'spec-ref')) {
    warning('DESC', `${selector}: description does not reference its spec interface ${specName}. State the spec mapping so the description stays congruent with the contract.`);
  }
}

/** 6. Typography — the file's typefaces and text styles against tokens.css.
 *
 *  Two rules, both file-wide:
 *   - [FONT-FAMILY] every TEXT node sits in one of the three families tokens.css
 *     declares (--ui-font-family / --ui-font-display / --ui-font-mono). A fourth
 *     family is a master drawn in a typeface the library does not ship.
 *   - [TEXT-STYLE] the local text styles are exactly one per --ui-type-* role,
 *     named ty/<role>, with that role's family, weight, size and leading. A style
 *     that documents a scale the library does not have is worse than no style:
 *     designers reach for it.
 */
function checkTypography() {
  const t = snapshot.typography;
  if (!t) {
    warning(
      'TYPEFACE',
      'snapshot carries no typography facts. Re-run npm run figma:snapshot to capture them.'
    );
    return;
  }
  const { families, roles } = parseTypeTokens();

  // ── Families ──────────────────────────────────────────────────────────────
  const declared = new Set(Object.values(families));
  for (const [family, count] of Object.entries(t.fontFamilies || {})) {
    if (family === 'MIXED') {
      warning(
        'FONT-FAMILY',
        `${count} text node(s) mix fonts within one string, so their family cannot be verified. Split them or set one family.`
      );
      continue;
    }
    if (declared.has(family)) continue;
    const where = (t.fontSamples || {})[family];
    blocker(
      'FONT-FAMILY',
      `${count} text node(s) are set in ${family}, which tokens.css does not declare` +
        `${where ? ` (e.g. ${where})` : ''}. The file ships ${[...declared].join(', ')} — ` +
        `re-set them, or add the family to tokens.css if it is genuinely part of the library.`
    );
  }

  // ── Text styles ───────────────────────────────────────────────────────────
  const byName = new Map((t.textStyles || []).map((s) => [s.name, s]));
  for (const [role, want] of Object.entries(roles)) {
    const name = `ty/${role}`;
    const got = byName.get(name);
    if (!got) {
      blocker(
        'TEXT-STYLE',
        `${name} is missing. --ui-type-${role} exists in tokens.css, so the file needs the matching style ` +
          `(${want.family} ${want.style} ${want.size}px / ${want.lineHeightPct}%).`
      );
      continue;
    }
    const diffs = [];
    if (got.family !== want.family) diffs.push(`family ${got.family} ≠ ${want.family}`);
    if (got.style !== want.style) diffs.push(`weight ${got.style} ≠ ${want.style}`);
    if (Math.abs(got.size - want.size) > 0.01) diffs.push(`size ${got.size} ≠ ${want.size}`);
    if (got.lineHeightUnit !== 'PERCENT') {
      diffs.push(`leading is ${got.lineHeightUnit.toLowerCase()}, not a stated percentage`);
    } else if (Math.abs(got.lineHeightValue - want.lineHeightPct) > 0.5) {
      // 0.5 not 0.01: Figma stores 165% as 164.9999976158142.
      diffs.push(`leading ${Math.round(got.lineHeightValue * 100) / 100}% ≠ ${want.lineHeightPct}%`);
    }
    if (diffs.length) {
      blocker('TEXT-STYLE', `${name} diverges from --ui-type-${role}: ${diffs.join('; ')}.`);
    }
  }
  for (const s of t.textStyles || []) {
    if (!s.name.startsWith('ty/')) continue;
    const role = s.name.slice(3);
    if (roles[role]) continue;
    blocker(
      'TEXT-STYLE',
      `${s.name} has no --ui-type-${role} in tokens.css. Delete it or add the role — a text style ` +
        `for a scale the library does not have is one a designer will reach for.`
    );
  }
}

/** tokens.css → { families, roles }. The role shorthand is
 *  `[italic ]var(--ui-font-weight-W) var(--ui-font-size-S) / var(--ui-line-height-L) var(--ui-font-F)`,
 *  resolved through the primitive tokens in the same file. */
function parseTypeTokens() {
  const css = fs.readFileSync(TOKENS_FILE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const decl = (name) => {
    const m = new RegExp(`--ui-${name}\\s*:\\s*([^;]+);`).exec(css);
    return m ? m[1].replace(/\s+/g, ' ').trim() : null;
  };
  const firstFamily = (v) => {
    if (!v) return null;
    const first = v.split(',')[0].trim();
    return first.replace(/^['"]|['"]$/g, '');
  };
  const families = {
    'font-family': firstFamily(decl('font-family')),
    'font-display': firstFamily(decl('font-display')),
    'font-mono': firstFamily(decl('font-mono')),
  };
  // CSS numeric weight → the Figma style name for the families this file ships.
  const WEIGHT_STYLE = { normal: 'Regular', medium: 'Medium', semibold: 'SemiBold', bold: 'Bold' };
  const roles = {};
  for (const m of css.matchAll(/--ui-type-([a-z-]+)\s*:\s*([^;]+);/g)) {
    const role = m[1];
    let body = m[2].replace(/\s+/g, ' ').trim();
    const italic = body.startsWith('italic ');
    if (italic) body = body.slice('italic '.length);
    const weight = /font-weight-(\w+)\)/.exec(body);
    const size = /font-size-([\w]+)\)/.exec(body);
    const lh = /line-height-(\w+)\)/.exec(body);
    const fam = /--ui-(font-family|font-display|font-mono)\)/.exec(body);
    if (!weight || !size || !lh || !fam) {
      warning('TEXT-STYLE', `--ui-type-${role} is not the expected font shorthand; skipped.`);
      continue;
    }
    const sizeRem = parseFloat(String(decl(`font-size-${size[1]}`)).replace('rem', ''));
    const lhNum = parseFloat(decl(`line-height-${lh[1]}`));
    let style = WEIGHT_STYLE[weight[1]] || weight[1];
    if (italic) style = style === 'Regular' ? 'Italic' : `${style} Italic`;
    roles[role] = {
      family: families[fam[1]],
      style,
      size: Math.round(sizeRem * 16 * 100) / 100,
      lineHeightPct: Math.round(lhNum * 100 * 100) / 100,
    };
  }
  return { families, roles };
}

/** 7. Root paint identity — WHICH variable a master's root binds, not merely
 *  whether it binds one.
 *
 *  `[TOKEN]` answers "is this bound?". Three of AtlMenu's root facts were bound
 *  and wrong — `radius/sm` for `--ui-radius-lg`, `color/surface` for
 *  `surface-raised`, `color/info-bg` for `surface-sunken` — and it passed. This
 *  check compares the bound variable's NAME to the token the CSS names, in both
 *  directions: a master must not paint what the CSS does not, either. Not one
 *  master carried an effect while eight CSS roots ask for a shadow, so shadow
 *  presence is checked too.
 */
function checkRootPaint() {
  const bySelector = new Map(snapshot.components.map((c) => [c.selector, c]));
  for (const entry of ROOT_PAINT) {
    const comp = bySelector.get(entry.label);
    if (!comp) {
      warning('ROOT-PAINT', `${entry.label}: listed in ROOT_PAINT but absent from the snapshot.`);
      continue;
    }
    const variants = Object.keys(comp.rootPaint || {});
    if (!variants.length) {
      warning(
        'ROOT-PAINT',
        `${entry.label}: snapshot carries no root paint facts. Re-run npm run figma:snapshot.`
      );
      continue;
    }
    // Every variant, not only the sampled one. AtlCard's fill comes from the base
    // rule but `.variant-flat` overrides it, so a per-master verdict would be
    // wrong for one variant in three.
    const grouped = new Map(); // message -> variants
    const note = (prop, msg, variant) => {
      if (allowed(entry.label, 'root-paint', prop)) return;
      const key = `${prop}\u0000${msg}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(variant);
    };
    // A `state` axis other than `default` is painted by rules a static selector
    // table cannot resolve — `:hover`, `:focus-visible`, `:active`, `.is-invalid`,
    // `.is-open` — and comparing those variants against the base rule reported the
    // master as wrong where it was right (AtlButton's hover fill IS
    // `color/primary-hover`). Those variants are skipped, loudly.
    const skipped = variants.filter((v) => {
      const st = parseAxisName(v).state;
      return st !== undefined && st !== 'default';
    });
    const checkable = variants.filter((v) => !skipped.includes(v));
    if (skipped.length) {
      warning(
        'ROOT-PAINT',
        `${entry.label}: ${skipped.length} of ${variants.length} variant(s) not checked — their paint comes from a pseudo-class or state class (${[...new Set(skipped.map((v) => parseAxisName(v).state))].join(', ')}), which this table cannot resolve.`
      );
    }
    for (const variant of checkable) {
      const got = comp.rootPaint[variant];
      const want = resolveRootPaint(entry, parseAxisName(variant));
      if (!want) break; // resolveRootPaint has already reported why.
      for (const prop of ['fill', 'stroke', 'radius']) {
        const w = want[prop];
        const g = got[prop];
        if (w === undefined) continue; // not expressible as one token — skipped
        if (w === null && g === null) continue;
        if (prop === 'stroke' && w === null && want.strokeSides && Object.values(want.strokeSides).some((x) => x > 0)) continue;
        if (w === null) {
          note(prop, `root ${prop} is ${g}, but ${want.from[prop] || 'the CSS root'} paints no ${prop}. Remove it, or state why the master needs it.`, variant);
        } else if (g === null) {
          note(prop, `root ${prop} is unset; ${want.from[prop]} says ${w}. Bind it.`, variant);
        } else if (g === 'RAW') {
          note(prop, `root ${prop} is a raw value; ${want.from[prop]} says ${w}. Bind the variable, not the resolved number.`, variant);
        } else if (g !== w) {
          note(prop, `root ${prop} is bound to ${g}, but ${want.from[prop]} says ${w}. Bound is not the same as bound correctly.`, variant);
        }
      }
      const paintsStroke = got.stroke !== null || (want.stroke !== null && want.stroke !== undefined);
      if (want.strokeSides && got.strokeSides && paintsStroke) {
        const g = { top: got.strokeSides[0], right: got.strokeSides[1], bottom: got.strokeSides[2], left: got.strokeSides[3] };
        const off = ['top', 'right', 'bottom', 'left'].filter((sd) => (want.strokeSides[sd] || 0) !== (g[sd] || 0));
        if (off.length) {
          note('strokeWeight', `root stroke is ${off.map((sd) => `${sd} ${g[sd] || 0}px`).join(', ')}, but ${want.from.stroke} says ${off.map((sd) => `${sd} ${want.strokeSides[sd] || 0}px`).join(', ')}.`, variant);
        }
      } else if (want.strokeWeight != null && got.stroke != null && got.strokeWeight !== want.strokeWeight) {
        note('strokeWeight', `root stroke is ${got.strokeWeight}px, but ${want.from.stroke} says ${want.strokeWeight}px.`, variant);
      }
      if (want.shadow !== undefined) {
        const hasFx = (got.effects || []).length > 0;
        if (want.shadow && !hasFx) {
          note('shadow', `root has no effect; ${want.from.shadow} sets box-shadow ${want.shadow}. Bind the shadow/${want.shadow} effect style.`, variant);
        } else if (!want.shadow && hasFx) {
          note('shadow', `root carries ${got.effects.join(', ')}, but ${want.from.shadow} sets no box-shadow.`, variant);
        }
      }
    }
    for (const [key, vs] of grouped) {
      const msg = key.split('\u0000')[1];
      const scope = vs.length === checkable.length ? 'every checked variant' : vs.length > 3 ? `${vs.length} variants (${vs.slice(0, 2).join('; ')}; …)` : vs.join('; ');
      critical('ROOT-PAINT', `${entry.label} [${scope}]: ${msg}`);
    }
  }
}

/** "variant=primary, size=sm, state=default" -> { variant:'primary', size:'sm', ... } */
function parseAxisName(name) {
  const out = {};
  for (const part of String(name).split(',')) {
    const [k, v] = part.split('=').map((x) => (x || '').trim());
    if (k && v) out[k] = v;
  }
  return out;
}

/** Resolve a ROOT_PAINT entry's cascade against the CSS, for one variant.
 *
 *  Rules are indexed by INDIVIDUAL selector, so a comma-separated list
 *  (`.atl-chat-message.role-assistant, .atl-chat-message.role-system`) is found
 *  under either of its members — a regex on the whole selector text was not. */
function cssRules(file) {
  // Cached on the function: the checks run before a module-level `const` below
  // them is initialised.
  if (!cssRules.cache) cssRules.cache = new Map();
  const cssRuleCache = cssRules.cache;
  if (cssRuleCache.has(file)) return cssRuleCache.get(file);
  const index = new Map();
  if (fs.existsSync(file)) {
    const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const body = m[2];
      for (const sel of m[1].split(',')) {
        const key = sel.replace(/\s+/g, ' ').trim();
        if (!key || key.startsWith('@')) continue;
        // Later rules win, the way the cascade does at equal specificity.
        index.set(key, (index.get(key) || '') + ';' + body);
      }
    }
  }
  cssRuleCache.set(file, index);
  return index;
}

function resolveRootPaint(entry, axes) {
  const file = path.join(ROOT, 'libs', entry.lib || 'react', 'src/lib', entry.file);
  if (!fs.existsSync(file)) {
    warning('ROOT-PAINT', `${entry.label}: ${entry.file} not found under libs/${entry.lib || 'react'}; cannot resolve the expected paint.`);
    return null;
  }
  const rules = cssRules(file);
  const want = { from: {} };
  for (const template of entry.cascade) {
    const selector = template.replace(/\{(\w+)\}/g, (_, axis) => axes[axis] ?? '\u0000');
    if (selector.includes('\u0000')) continue; // the sampled variant has no such axis
    const body = rules.get(selector);
    if (body === undefined) continue;
    const decl = (prop) => {
      const m = new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([^;]+)').exec(body);
      return m ? m[1].replace(/\s+/g, ' ').trim() : null;
    };
    const set = (prop, raw, expr) => {
      if (raw === null) return;
      want[prop] = expr;
      want.from[prop] = selector;
    };
    const bg = decl('background') || decl('background-color');
    if (bg !== null) set('fill', bg, /transparent|none/.test(bg) ? null : cssToVariable(bg, 'color'));
    // Borders, four-side and per-side. `border-left: 4px solid transparent` plus a
    // per-variant `border-left-color` is one edge, not a box — reading only the
    // shorthand reported AtlToast's accent as an invented stroke.
    const SIDES = ['top', 'right', 'bottom', 'left'];
    const weightOf = (v) => (/border-width-thick/.test(v) ? 2 : /border-width\)/.test(v) ? 1 : parseFloat(v) || null);
    const border = decl('border');
    if (border !== null) {
      const parts = border.split(' ');
      set('stroke', border, /transparent|none/.test(border) ? undefined : cssToVariable(parts[parts.length - 1], 'color'));
      const w = /^(0|none)$/.test(border) ? 0 : weightOf(border);
      want.strokeWeight = w;
      want.strokeSides = { top: w, right: w, bottom: w, left: w };
    }
    for (const side of SIDES) {
      const d = decl('border-' + side);
      if (d === null) continue;
      const parts = d.split(' ');
      want.strokeSides = want.strokeSides || { top: 0, right: 0, bottom: 0, left: 0 };
      want.strokeSides[side] = /^(0|none)$/.test(d) ? 0 : weightOf(d);
      const c = /transparent|none/.test(d) ? undefined : cssToVariable(parts[parts.length - 1], 'color');
      if (c !== undefined) set('stroke', d, c);
      else if (!('stroke' in want)) { want.stroke = undefined; want.from.stroke = selector; }
    }
    const borderColor = decl('border-color');
    if (borderColor !== null) set('stroke', borderColor, cssToVariable(borderColor, 'color'));
    for (const side of SIDES) {
      const d = decl('border-' + side + '-color');
      if (d !== null) set('stroke', d, cssToVariable(d, 'color'));
    }
    const radius = decl('border-radius');
    if (radius !== null) {
      // A four-value radius is not one token; only single-value roots are checked.
      set('radius', radius, radius.split(' ').length > 1 ? undefined : cssToVariable(radius, 'radius'));
    }
    const shadow = decl('box-shadow');
    if (shadow !== null) {
      want.shadow = /var\(--ui-shadow-([a-z0-9-]+)/.exec(shadow)?.[1] ?? 'raw';
      want.from.shadow = selector;
    }
  }
  // Nothing in the cascade paints -> the root must paint nothing.
  for (const prop of ['fill', 'stroke', 'radius']) if (!(prop in want)) want[prop] = null;
  if (want.shadow === undefined) { want.shadow = false; want.from.shadow = entry.cascade[0]; }
  for (const prop of ['fill', 'stroke', 'radius']) if (!want.from[prop]) want.from[prop] = entry.cascade[0];
  return want;
}

/** `var(--ui-color-surface-raised)` -> `color/surface-raised`. `undefined` when the
 *  value is not a single token — `color-mix()`, a literal, a keyword — which no
 *  Figma Variable can express; those are skipped rather than reported. */
function cssToVariable(value, group) {
  const v = value || '';
  // A color-mix() names a token INSIDE a computation. Pulling that token out and
  // demanding Figma bind it is wrong twice over: the rendered colour is not the
  // token's value, and no Figma Variable can express the mix at all. Four
  // components paint this way (Avatar, Badge, Toast and Alert variants) — recorded
  // as a Figma-side gap rather than reported as drift.
  if (/color-mix\s*\(|linear-gradient\s*\(/.test(v)) return undefined;
  const m = new RegExp('var\\(--ui-' + group + '-([a-z0-9-]+)').exec(v);
  if (m) return `${group}/${m[1]}`;
  return undefined;
}

/** 8. Overlay layers — the nodes a Boolean switches on.
 *
 *  A Figma Boolean can bind to exactly one thing: a layer's visibility. So every
 *  state a master expresses through a Boolean is drawn by a layer that is HIDDEN by
 *  default — and hidden is precisely what the per-component deep read filters out.
 *  Those layers were therefore the one place no check could reach: 34 carried a raw
 *  stroke colour, 78 sat outside the box they were meant to cover, and 90 dimmed a
 *  control by painting an OPAQUE rectangle over it. None of it was ever reported,
 *  because the default state is off and nobody had switched one on.
 *
 *  What a property turns on has to be checked while it is off.
 */
function checkOverlays() {
  for (const comp of snapshot.components) {
    const overlays = comp.overlays || [];
    if (!overlays.length) continue;
    const grouped = new Map();
    const note = (kind, msg, where) => {
      if (allowed(comp.selector, 'overlay', kind)) return;
      const key = kind + '\u0000' + msg;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(where);
    };
    for (const o of overlays) {
      const [x, y, w, h] = o.box;
      const [pw, ph] = o.parentBox;
      for (const [paint, value] of [['fill', o.fill], ['stroke', o.stroke]]) {
        if (value === 'RAW') {
          note(`raw:${o.layer}:${paint}`, `${o.layer} paints a raw ${paint}. Bind it to a colour variable — an overlay is chrome like any other.`, o.variant);
        }
      }
      // An overlay sized to the box it covers has to sit ON it.
      const covers = Math.abs(w - pw) < 1 && Math.abs(h - ph) < 1;
      if (covers && (Math.abs(x) > 1 || Math.abs(y) > 1)) {
        note(`offset:${o.layer}`, `${o.layer} is the size of ${o.parentName} but sits at ${x},${y}. A cover overlay belongs at 0,0.`, o.variant);
      }
      // Entirely outside its parent is never right, whatever the size.
      const outside = x >= pw - 0.5 || y >= ph - 0.5 || x + w <= 0.5 || y + h <= 0.5;
      if (outside) {
        note(`outside:${o.layer}`, `${o.layer} (${w}x${h} at ${x},${y}) lies outside ${o.parentName} (${pw}x${ph}) entirely. It draws nothing where it is.`, o.variant);
      }
      if (!o.boundTo && o.visible === false) {
        note(`orphan:${o.layer}`, `${o.layer} is hidden and bound to no property, so nothing can ever show it.`, o.variant);
      }
    }
    for (const [key, where] of grouped) {
      const msg = key.split('\u0000')[1];
      const scope = where.length > 2 ? `${where.length} variants` : where.join('; ');
      critical('OVERLAY', `${comp.selector} [${scope}]: ${msg}`);
    }
  }
}

/** 9. Inner layers — the level [ROOT-PAINT] cannot reach.
 *
 *  The convention is that a layer NAMED for a CSS class draws that rule, so the
 *  layer name IS the selector and there is no table to maintain. A layer with a
 *  generic name (Frame, Group, Rectangle) or a leading underscore is a wrapper or an
 *  overlay — checked elsewhere, or not a CSS part at all.
 *
 *  Where the CSS addresses a part by element or attribute rather than by class —
 *  `.tablist button`, `[role='option']`, `thead th` — the layer carries a short name
 *  and LAYER_ALIASES maps it. That list is small by construction: every other part is
 *  a class.
 */

function checkLayerPaint() {
  for (const comp of snapshot.components) {
    const layers = comp.layers || [];
    if (!layers.length) continue;
    const file = cssFileFor(comp.selector);
    if (!file) continue;
    const rules = cssRules(file);
    const aliases = LAYER_ALIASES[comp.selector] || {};
    const grouped = new Map();
    const note = (kind, msg, where) => {
      if (allowed(comp.selector, 'layer', kind)) return;
      const key = kind + '\u0000' + msg;
      if (!grouped.has(key)) grouped.set(key, new Set());
      grouped.get(key).add(where);
    };
    for (const L of layers) {
      const st = parseAxisName(L.variant).state;
      if (st !== undefined && st !== 'default') continue; // pseudo-class paint, as in [ROOT-PAINT]
      const base = aliases[L.layer] || '.' + L.layer;
      // A variant can override a layer's rule: `.atl-progress.variant-success .fill`
      // repaints the bar. Resolve base first, then the variant-scoped form, the way
      // the cascade does.
      const axes = parseAxisName(L.variant);
      const rootSel = rootSelectorFor(comp.selector);
      const cascade = [base];
      if (axes.variant && rootSel) {
        cascade.push(
          base.startsWith(rootSel + ' ')
            ? `${rootSel}.variant-${axes.variant} ${base.slice(rootSel.length + 1)}`
            : `${rootSel}.variant-${axes.variant} ${base}`
        );
      }
      let body;
      for (const sel of cascade) {
        const b = rules.get(sel);
        if (b !== undefined) body = (body === undefined ? '' : body) + ';' + b;
      }
      if (body === undefined) continue; // not a CSS part — a wrapper, and that is fine
      const selector = base;
      // Every colour this component's CSS gives this layer, in ANY state. A layer
      // inside a parent master is often drawn in a state — the current page button,
      // one hovered menu item — and that state lives in a `:hover` or `.is-current`
      // rule the variant name cannot reach. So a fill is wrong only when the CSS
      // never gives the layer that colour.
      const statefulFills = new Set();
      const foreignVariant = (sel) => {
        const m = /\.variant-([a-z0-9-]+)/.exec(sel);
        return m ? m[1] !== axes.variant : false;
      };
      for (const [sel, b] of rules) {
        if (!selectorMentions(sel, base)) continue;
        if (/::?(before|after)\b/.test(sel)) continue; // a pseudo-element is a different box
        if (foreignVariant(sel)) continue; // another variant's rule says nothing about this one
        for (const prop of ['background', 'background-color']) {
          const m = new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([^;]+)').exec(b);
          if (!m) continue;
          const v = cssToVariable(m[1].trim(), 'color');
          if (v) statefulFills.add(v);
        }
      }
      const decl = (prop) => {
        // Last wins: the bodies are concatenated in cascade order.
        const all = [...body.matchAll(new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([^;]+)', 'g'))];
        return all.length ? all[all.length - 1][1].replace(/\s+/g, ' ').trim() : null;
      };
      const where = L.variant + (L.count > 1 ? ' x' + L.count : '');

      // ── Paint ────────────────────────────────────────────────────────────
      const bg = decl('background') || decl('background-color');
      if (bg !== null) {
        const wantFill = /transparent|none/.test(bg) ? null : cssToVariable(bg, 'color');
        if (wantFill !== undefined) {
          if (L.fill !== null && L.fill !== 'RAW' && statefulFills.has(L.fill)) {
            // A colour the CSS gives this layer in some state.
          } else if (wantFill === null && L.fill !== null) {
            note('fill:' + L.layer, `${L.layer} paints ${L.fill}, but ${selector} sets background ${bg} and no rule gives it that colour.`, where);
          } else if (wantFill !== null && L.fill === null) {
            note('fill:' + L.layer, `${L.layer} has no fill; ${selector} says ${wantFill}.`, where);
          } else if (wantFill !== null && L.fill !== null && L.fill !== wantFill) {
            note('fill:' + L.layer, `${L.layer} fill is ${L.fill}, but ${selector} says ${wantFill}.`, where);
          }
        }
      }
      if (bg === null && L.fill !== null && !statefulFills.has(L.fill)) {
        note('invented-fill:' + L.layer, `${L.layer} paints ${L.fill}, and no rule for ${selector} sets a background at all.`, where);
      }
      const radius = decl('border-radius');
      if (radius !== null && splitValues(radius).length === 1) {
        const wantRadius = cssToVariable(radius, 'radius');
        if (wantRadius !== undefined && L.radius !== wantRadius) {
          note('radius:' + L.layer, `${L.layer} radius is ${L.radius ?? 'unset'}, but ${selector} says ${wantRadius}.`, where);
        }
      }
      const shadow = decl('box-shadow');
      if (shadow !== null && /var\(--ui-shadow-/.test(shadow) && (L.effects || []).length === 0) {
        note('shadow:' + L.layer, `${L.layer} has no effect; ${selector} sets box-shadow ${shadow}.`, where);
      }

      // Borders, four-side and per-side.
      const SIDES = ['top', 'right', 'bottom', 'left'];
      const wantSides = { top: 0, right: 0, bottom: 0, left: 0 };
      let sidesDeclared = false;
      let wantStroke;
      const border = decl('border');
      if (border !== null) {
        sidesDeclared = true;
        const w = /^(0|none)$/.test(border) ? 0 : lengthOf(splitValues(border)[0]);
        for (const sd of SIDES) wantSides[sd] = w ?? 0;
        if (!/transparent|none/.test(border)) wantStroke = cssToVariable(splitValues(border).pop(), 'color');
      }
      for (const sd of SIDES) {
        const d = decl('border-' + sd);
        if (d === null) continue;
        sidesDeclared = true;
        wantSides[sd] = /^(0|none)$/.test(d) ? 0 : (lengthOf(splitValues(d)[0]) ?? 0);
        if (!/transparent|none/.test(d)) {
          const c = cssToVariable(splitValues(d).pop(), 'color');
          if (c !== undefined) wantStroke = c;
        }
      }
      const bc = decl('border-color');
      if (bc !== null) wantStroke = cssToVariable(bc, 'color');
      if (sidesDeclared && L.strokeSides && (L.stroke !== null || wantStroke !== undefined)) {
        const got = { top: L.strokeSides[0], right: L.strokeSides[1], bottom: L.strokeSides[2], left: L.strokeSides[3] };
        const off = SIDES.filter((sd) => Math.abs((got[sd] || 0) - (wantSides[sd] || 0)) > 0.5);
        if (off.length) {
          note(
            'border:' + L.layer,
            `${L.layer} border is ${off.map((sd) => `${sd} ${got[sd] || 0}px`).join(', ')}, but ${selector} says ${off.map((sd) => `${sd} ${wantSides[sd] || 0}px`).join(', ')}.`,
            where
          );
        }
      }
      if (wantStroke !== undefined && wantStroke !== null && L.stroke !== wantStroke) {
        note('stroke:' + L.layer, `${L.layer} border colour is ${L.stroke ?? 'unset'}, but ${selector} says ${wantStroke}.`, where);
      }
      if (!sidesDeclared && L.stroke !== null) {
        const anyBorder = [...rules].some(
          ([sel, b]) =>
            selectorMentions(sel, base) &&
            !/::?(before|after)\b/.test(sel) &&
            !foreignVariant(sel) &&
            /(?:^|;)\s*border(?!-radius)(-[a-z]+)*\s*:/.test(b)
        );
        if (!anyBorder) {
          note('invented-border:' + L.layer, `${L.layer} paints a ${L.stroke} border, and no rule for ${selector} declares one at all.`, where);
        }
      }
      if (radius !== null || L.radius === null) {
        // handled above
      } else if (L.radius !== null) {
        const anyRadius = [...rules].some(
          ([sel, b]) => selectorMentions(sel, base) && !/::?(before|after)\b/.test(sel) && !foreignVariant(sel) && /(?:^|;)\s*border-radius\s*:/.test(b)
        );
        if (!anyRadius) {
          note('invented-radius:' + L.layer, `${L.layer} has radius ${L.radius}, and no rule for ${selector} declares one at all.`, where);
        }
      }

      // ── Box ──────────────────────────────────────────────────────────────
      const box = boxFromDeclarations(body);
      const cmp = (label, got, want) => {
        if (want === null || want === undefined || got === null || got === undefined) return;
        if (Math.abs(got - want) > 0.5) {
          note(
            label + ':' + L.layer,
            `${L.layer} ${label} is ${Math.round(got * 100) / 100}px, but ${selector} says ${Math.round(want * 100) / 100}px.`,
            where
          );
        }
      };
      if (box.minHeight !== null) {
        // A stated min-height Figma does not carry is the row-ladder defect: the box
        // then grows with its content instead of holding the token (ADR-0048).
        if (L.minHeight === null) {
          note('min-height:' + L.layer, `${L.layer} has no min-height; ${selector} states ${box.minHeight}px. Without it the box grows with its content.`, where);
        } else {
          cmp('min-height', L.minHeight, box.minHeight);
        }
      }
      if (box.height !== null) cmp('height', L.height, box.height);
      // ADR-0041 derives block padding from the control height; ADR-0048 states the
      // height instead. A min-height box that centres its line is the same
      // measurement without a raw 11.25px, which no token can bind — accept either.
      const derivedBlock = /calc\(/.test(String(decl('padding') || '')) && box.minHeight !== null;
      const centred = L.padding && L.padding[0] === 0 && L.padding[2] === 0 && L.minHeight !== null && Math.abs(L.minHeight - box.minHeight) <= 0.5;
      if (derivedBlock && centred) { box.padding.top = null; box.padding.bottom = null; }
      if (L.padding) {
        cmp('padding-top', L.padding[0], box.padding.top);
        cmp('padding-right', L.padding[1], box.padding.right);
        cmp('padding-bottom', L.padding[2], box.padding.bottom);
        cmp('padding-left', L.padding[3], box.padding.left);
      }
      if (box.gap !== null && L.gap !== null) cmp('gap', L.gap, box.gap);
      if (box.fontSize !== null && L.fontSize !== null) cmp('font-size', L.fontSize, box.fontSize);
      if (box.lineHeight !== null && L.lineHeight !== null) cmp('line-height %', L.lineHeight, box.lineHeight * 100);
    }
    for (const [key, whereSet] of grouped) {
      const msg = key.split('\u0000')[1];
      const where = [...whereSet];
      const scope = where.length > 2 ? where.length + ' variants' : where.join('; ');
      critical('LAYER-PAINT', `${comp.selector} [${scope}]: ${msg}`);
    }
  }
}

/** Does `candidate` address the same part as `base`?
 *  `.atl-tab-group .tablist button` is mentioned by
 *  `.atl-tab-group.variant-pills .tablist button.is-active`, which a substring test
 *  misses because the variant class sits between the two parts. Compare the simple
 *  selectors instead: every part of `base` must appear, in order. */
function selectorMentions(candidate, base) {
  const parts = base.split(/\s+/).filter(Boolean);
  let rest = candidate;
  for (const part of parts) {
    const i = rest.indexOf(part);
    if (i < 0) return false;
    rest = rest.slice(i + part.length);
  }
  return true;
}

/** The component's own root selector, used to build variant-scoped layer rules. */
function rootSelectorFor(selector) {
  const entry = ROOT_PAINT.find((e) => e.label === selector);
  if (entry) {
    const first = entry.cascade[0];
    // `.atl-input input` -> `.atl-input`; `[role='option']` has no root form.
    const m = /^(\.[a-z0-9-]+)/.exec(first);
    if (m) return m[1];
  }
  return '.' + selector.replace(/^Atl/, 'atl').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** The box properties a body states, resolved to px.
 *
 *  Declarations are applied in the order they appear, because that is what the
 *  cascade does: a later `padding` shorthand resets the sides an earlier
 *  `padding-inline` set. Applying them in a fixed property order instead had
 *  `.atl-menu-item`'s inline padding beating `.variant-compact`'s shorthand.
 */
function boxFromDeclarations(body) {
  const out = {
    minHeight: null,
    height: null,
    gap: null,
    fontSize: null,
    lineHeight: null,
    padding: { top: null, right: null, bottom: null, left: null },
  };
  for (const raw of String(body).split(';')) {
    const m = /^\s*([a-z-]+)\s*:\s*(.+)$/.exec(raw.replace(/\s+/g, ' '));
    if (!m) continue;
    const prop = m[1];
    const value = m[2].trim();
    switch (prop) {
      case 'min-height': out.minHeight = lengthOf(value); break;
      case 'height': out.height = lengthOf(value); break;
      case 'gap': out.gap = lengthOf(value); break;
      case 'font-size': out.fontSize = lengthOf(value); break;
      case 'line-height':
        out.lineHeight = /^[\d.]+$/.test(value) ? parseFloat(value) : resolveUnitless(value);
        break;
      case 'padding': {
        const p = splitValues(value).map(lengthOf);
        if (p.length === 1) out.padding = { top: p[0], right: p[0], bottom: p[0], left: p[0] };
        else if (p.length === 2) out.padding = { top: p[0], bottom: p[0], right: p[1], left: p[1] };
        else if (p.length === 3) out.padding = { top: p[0], right: p[1], left: p[1], bottom: p[2] };
        else if (p.length >= 4) out.padding = { top: p[0], right: p[1], bottom: p[2], left: p[3] };
        break;
      }
      case 'padding-block': {
        const v = splitValues(value).map(lengthOf);
        out.padding.top = v[0];
        out.padding.bottom = v.length > 1 ? v[1] : v[0];
        break;
      }
      case 'padding-inline': {
        const v = splitValues(value).map(lengthOf);
        out.padding.left = v[0];
        out.padding.right = v.length > 1 ? v[1] : v[0];
        break;
      }
      case 'padding-top': out.padding.top = lengthOf(value); break;
      case 'padding-right': out.padding.right = lengthOf(value); break;
      case 'padding-bottom': out.padding.bottom = lengthOf(value); break;
      case 'padding-left': out.padding.left = lengthOf(value); break;
      default: break;
    }
  }
  return out;
}

/** Split a CSS value list on whitespace that is not inside parentheses. */
function splitValues(value) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of String(value)) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (cur) {
        parts.push(cur);
        cur = '';
      }
      continue;
    }
    cur += ch;
  }
  if (cur) parts.push(cur);
  return parts;
}

/** A single CSS length -> px, or null when it is not a length this can resolve. */
function lengthOf(expr) {
  if (expr === null || expr === undefined) return null;
  const e = String(expr).trim();
  if (!e) return null;
  if (e === 'none' || e === '0') return 0;
  if (/^(auto|inherit|initial|unset)$/.test(e)) return null;
  if (/%\s*$/.test(e)) return null;
  return resolveLength(e);
}

/** tokens.css declaration for a custom property, unresolved. */
function tokenDeclaration(name) {
  if (!tokenDeclaration.cache) {
    tokenDeclaration.cache = new Map();
    // Comments first: a comment in tokens.css mentions `--ui-row-inset: 0` in prose,
    // and "first definition wins" then handed the resolver a paragraph instead of a
    // length. It silently returned null, so every min-height behind a calc() went
    // unchecked.
    const css = fs.readFileSync(TOKENS_FILE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/(--ui-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      // First definition wins: the later ones are the dark-mode overrides.
      if (!tokenDeclaration.cache.has(m[1])) tokenDeclaration.cache.set(m[1], m[2].replace(/\s+/g, ' ').trim());
    }
  }
  return tokenDeclaration.cache.get(name) ?? null;
}

/** Substitute every var() with its tokens.css declaration. */
function substituteVars(expr) {
  let e = String(expr).trim();
  for (let pass = 0; pass < 10 && /var\(/.test(e); pass++) {
    e = e.replace(/var\(\s*(--ui-[a-z0-9-]+)\s*(?:,[^()]*)?\)/g, (_, name) => {
      const d = tokenDeclaration(name);
      return d === null ? 'NaN' : '(' + d + ')';
    });
  }
  return e;
}

/** Evaluate an arithmetic CSS expression, only digits and operators surviving. */
function evalArithmetic(e) {
  if (!/^[\d\s().+*/-]+$/.test(e)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const n = Function('"use strict";return (' + e + ');')();
    return typeof n === 'number' && isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Resolve `calc(var(--ui-control-height-lg) + 2 * var(--ui-row-inset))` to px. */
function resolveLength(expr) {
  let e = substituteVars(expr);
  if (/var\(|NaN/.test(e)) return null;
  e = e.replace(/calc\(/g, '(');
  e = e.replace(/([\d.]+)rem\b/g, (_, n) => String(parseFloat(n) * 16));
  e = e.replace(/([\d.]+)px\b/g, '$1');
  return evalArithmetic(e);
}

/** A unitless number behind var()/calc() — line-height's shape. */
function resolveUnitless(expr) {
  let e = substituteVars(expr);
  if (/var\(|NaN/.test(e)) return null;
  e = e.replace(/calc\(/g, '(');
  return evalArithmetic(e);
}

/** The CSS file a component's rules live in. */
function cssFileFor(selector) {
  if (!cssFileFor.cache) cssFileFor.cache = new Map();
  if (cssFileFor.cache.has(selector)) return cssFileFor.cache.get(selector);
  let out = null;
  const entry = ROOT_PAINT.find((e) => e.label === selector);
  if (entry) {
    const f = path.join(ROOT, 'libs', entry.lib || 'react', 'src/lib', entry.file);
    if (fs.existsSync(f)) out = f;
  }
  if (!out) {
    const moduleName = registry[`${selector}Spec`];
    if (moduleName) {
      const dir = path.join(ROOT, 'libs/react/src/lib', moduleName);
      if (fs.existsSync(dir)) {
        const kebab = selector.replace(/^Atl/, 'atl').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        const exact = path.join(dir, `${kebab}.css`);
        if (fs.existsSync(exact)) out = exact;
        else {
          const any = fs.readdirSync(dir).filter((f) => f.endsWith('.css'));
          if (any.length === 1) out = path.join(dir, any[0]);
        }
      }
    }
  }
  cssFileFor.cache.set(selector, out);
  return out;
}

// ===========================================================================
// Helpers
// ===========================================================================

function report() {
  const order = { BLOCKER: 0, CRITICAL: 1, WARNING: 2 };
  const all = [...errors, ...warnings].sort((a, b) => order[a.sev] - order[b.sev]);
  const icon = (sev) => (sev === 'WARNING' ? '⚠' : '✗');
  const stamp = snapshot.meta || {};
  const head = `Snapshot: ${stamp.generatedAt || '?'}${stamp.figmaLastModified ? ` · Figma edited ${stamp.figmaLastModified}` : ''} · ${snapshot.components.length} master(s)`;

  if (all.length === 0) {
    console.log(`✓ figma conformance in sync (${snapshot.components.length} masters checked). ${head}`);
    return;
  }

  for (const f of all) {
    const line = `${icon(f.sev)} [${f.sev}] [${f.tag}] ${f.msg}`;
    if (f.sev === 'WARNING') console.warn(line);
    else console.error(line);
  }

  const blockers = errors.filter((e) => e.sev === 'BLOCKER').length;
  const criticals = errors.filter((e) => e.sev === 'CRITICAL').length;
  if (errors.length > 0) {
    console.error(
      `\n${errors.length} figma conformance issue(s): ${blockers} blocker, ${criticals} critical, ${warnings.length} warning. ${head}\n` +
        `Fix in Figma (file ${stamp.fileKey || ''}) and re-run npm run figma:snapshot, or allowlist a known false-positive in tools/scripts/lib/allowlists.js.`
    );
    process.exit(1);
  }
  console.warn(`\n${warnings.length} figma warning(s) (non-blocking). ${head}`);
}

function lowerFirst(s) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}
function q(s) {
  return `'${s}'`;
}

/** Parse libs/spec/src/index.ts for `type Atl... = 'a' | 'b'` string-literal
 *  unions. Syntactic parse (createSourceFile) — fast, no type resolution. */
function parseSpecShapes(file) {
  const src = fs.readFileSync(file, 'utf8');
  const out = new Map();
  for (const m of src.matchAll(/export interface (\w+)(?:\s+extends\s+([^{]+))?\s*\{([\s\S]*?)\n\}/g)) {
    const [, name, ext, body] = m;
    const fields = new Set();
    const booleans = new Set();
    for (const f of body.matchAll(/^\s{2}(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*:\s*([^;\n]+)/gm)) {
      fields.add(f[1]);
      // A flag is a flag because of its type, not its name. The first version of this
      // gate checked a hardcoded list — disabled, invalid, required, readonly, loading —
      // and so never asked about AtlPaginationSpec.showFirstLast, a Boolean the master
      // has no way to set (ADR-0056).
      if (/^boolean\s*$/.test(f[2].trim())) booleans.add(f[1]);
    }
    const parents = (ext || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => {
        const omit = x.match(/^Omit<\s*(\w+)/);
        return omit ? omit[1] : x.replace(/<.*$/, '');
      });
    const omitted = [...(ext || '').matchAll(/Omit<\s*\w+\s*,\s*([^>]+)>/g)].flatMap((o) =>
      [...o[1].matchAll(/'([^']+)'/g)].map((x) => x[1])
    );
    out.set(name, { parents, fields, booleans, omitted });
  }
  return out;
}

function parseSpecUnions(file) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const out = {};
  ts.forEachChild(sf, (node) => {
    if (!ts.isTypeAliasDeclaration(node)) return;
    const members = literalMembers(node.type);
    if (members) out[node.name.text] = members;
  });
  return out;
}
function literalMembers(typeNode) {
  if (!typeNode || !ts.isUnionTypeNode(typeNode)) return null;
  const out = [];
  for (const t of typeNode.types) {
    if (ts.isLiteralTypeNode(t) && ts.isStringLiteralLike(t.literal)) {
      out.push(t.literal.text);
    } else {
      return null; // not a pure string-literal union — skip
    }
  }
  return out.length ? out : null;
}
