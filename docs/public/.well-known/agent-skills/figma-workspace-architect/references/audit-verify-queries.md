# Audit verify queries

Per-category queries for **Re-verify mode** — checking whether a finding is still open before estimating effort or applying a fix. Run these when:

- A finding from a prior audit needs current-state confirmation before action.
- An effort estimate seems oversized — verify whether the work has already been done implicitly between the audit and now.
- A user asks "is finding X still relevant?" or "what's actually left?".

Each entry below names a query, what counts as a pass, and the auto-resolve signal that tells you the finding is closed and no fix is needed.

## Output format

For each finding being re-verified, emit one line:

```
{finding-id}: {still-open | auto-resolved | state-shifted} — {one-sentence current state}
```

`still-open` = the finding's bad state still holds. Effort estimate stands.
`auto-resolved` = the bad state is gone. Drop the finding from the priority list.
`state-shifted` = current state differs from the audit's description but isn't fully resolved (e.g. "8 hardcoded fills now, was 1 — broader than the audit said"). Re-write the finding before acting.

## Token Architecture

### TA1 — Tier separation

```
figma_get_variables  (format=summary, verbosity=inventory)
→ count distinct variableCollections
→ inspect each name
```

**Pass:** ≥ 2 collections with names matching the Primitive / Semantic / Component pattern (e.g. `Primitive Tokens`, `UI Tokens`, `Component Tokens`).
**Auto-resolve signal:** the collection separation already matches the audit's recommended tier model.

### TA2 — Mode placement

```
figma_get_variables  (verbosity=standard)
→ for each variableCollection: collection.modes.length
```

**Pass:** modes only on the Semantic-tier collection. Primitive collection has 1 mode (`Default` or single unnamed).
**Auto-resolve signal:** Primitive collection mode-count is 1 AND Semantic collection mode-count > 1.

### TA3 — Aliasing

```
figma_get_variables  (enrich=true, include_dependencies=true)
→ for sample of Semantic vars (10 random): valuesByMode entries are { type: 'VARIABLE_ALIAS', id: ... }, not raw values
```

**Pass:** ≥ 80% of sampled Semantic variables alias Primitives.
**Auto-resolve signal:** alias-rate at or above the threshold.
**Caveat:** this is a sample-based check; a full walk is heavier and only worth running if the sample suggests drift.

### TA4 — Variable Scopes

```
figma_execute:
  const vars = await figma.variables.getLocalVariablesAsync();
  const buckets = {};
  for (const v of vars) {
    if (v.resolvedType === 'BOOLEAN') continue;  // feature flags are exempt
    const key = v.scopes.length === 0 ? '(empty)' : v.scopes.sort().join(',');
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return buckets;
```

**Pass:** `ALL_SCOPES` count among non-BOOLEAN variables is 0.
**Auto-resolve signal:** the bucket map has no `ALL_SCOPES` key.
**Important:** BOOLEAN variables (`feature/*` flags) are never bound into design properties; their `ALL_SCOPES` is a no-op and must not be counted.

### TA5 — Variables vs. Styles coverage

```
figma_get_styles
→ count COLOR + EFFECT + TEXT styles
figma_lint_design  (rules=['no-text-style', 'no-color-style'])
→ count text/color nodes not using styles
```

**Pass:** style count is low relative to Variable count, OR the lint shows < 5 nodes per page bypassing styles.
**Auto-resolve signal:** lint findings under 5 per page.

## Component Design

### CD1 — Variant axis explosion

```
figma_search_components  (limit=25)
→ for each component-set: figma_get_component_details to fetch variant count
```

**Pass:** no component-set has > 24 variants (a typical threshold; raise per-team).
**Auto-resolve signal:** all component-sets at or below the threshold.

### CD2 — Variant Property naming vs. code

```
1. figma_get_component_details on each component-set
   → list variant property names + values
2. Cross-source grep in code repo:
   grep -rEn "variant\s*[:=]\s*['\"]\w+['\"]" libs/ src/  (adjust per repo)
3. Diff: every Figma value should appear in code; every code value should appear in Figma.
```

**Pass:** zero diffs.
**Auto-resolve signal:** intersection of Figma values and code values is identical.

### CD4 — Icons modeled as Variants

```
figma_execute:
  await figma.loadAllPagesAsync();
  const iconsPage = figma.root.children.find(p => p.name === 'Icons' || /icon/i.test(p.name));
  return {
    pageExists: !!iconsPage,
    componentSetCount: iconsPage ? iconsPage.findAll(n => n.type === 'COMPONENT_SET').length : 0,
    componentCount: iconsPage ? iconsPage.findAll(n => n.type === 'COMPONENT').length : 0
  };
```

**Pass:** Icons page exists AND has ≥ 1 ComponentSet (or ≥ N standalone Components, per-team).
**Auto-resolve signal:** componentSetCount > 0 OR componentCount above team threshold.

### CD6 — Component description content (intent + use)

```
figma_execute:
  const sets = (await figma.root.findAllAsync(n => n.type === 'COMPONENT_SET'));
  return sets.map(s => {
    const d = s.description || '';
    return {
      name: s.name,
      descLen: d.length,
      hasUseWhen:    /\b(use\s+when|when\s+to\s+use)\b/i.test(d),
      hasDontUse:    /\b(don['’]?t\s+use|when\s+not\s+to\s+use|avoid)\b/i.test(d),
      hasSignals:    /\b(signal|indicates?|conveys?)\b/i.test(d),
      onlyRestatesName: d.replace(/\s+/g, ' ').trim().toLowerCase().includes(s.name.toLowerCase())
                       && d.length < (s.name.length + 20)
    };
  });
```

**Pass:** every component-set has `descLen ≥ 80` AND at least two of `{hasUseWhen, hasDontUse, hasSignals}` true AND `onlyRestatesName === false`.
**Auto-resolve signal:** all four flags satisfied across every component-set.

### CD7 — Complete interactive-state variant coverage

Run only against **interactive** component-sets. Maintain an explicit list per file (e.g. `Button`, `Input`, `Select`, `Combobox`, `Checkbox`, `Radio`, `RadioGroup`, `Toggle`, `TabGroup`, `Stepper`, `Pagination`, `Table`).

```
figma_execute:
  const INTERACTIVE = new Set([/* per-file list */]);
  const REQUIRED = ['default','hover','focus','disabled','error','loading'];
  const sets = await figma.root.findAllAsync(n => n.type === 'COMPONENT_SET');
  return sets.filter(s => INTERACTIVE.has(s.name)).map(s => {
    const stateProp = (s.componentPropertyDefinitions || {}).state
      ?? Object.entries(s.componentPropertyDefinitions || {})
            .find(([k]) => /state/i.test(k))?.[1];
    const values = stateProp ? stateProp.variantOptions || [] : [];
    const present = REQUIRED.filter(r => values.some(v => v.toLowerCase() === r));
    const missing = REQUIRED.filter(r => !present.includes(r));
    return { name: s.name, present, missing, nonStandardValues: values.filter(v => !REQUIRED.includes(v.toLowerCase())) };
  });
```

**Pass:** every interactive component-set returns `missing: []` AND `nonStandardValues: []` (or the non-standard values are documented exceptions tagged in the report).
**Auto-resolve signal:** zero `missing` entries, zero un-tagged `nonStandardValues`.

### CD8 — Token-linked styles

Sample 5–8 representative components across categories (one input-family, one display, one navigation, one overlay, one feedback). For each, check that fills, strokes, text, and Auto-Layout spacing all carry `boundVariables`.

```
figma_execute:
  const SAMPLES = [/* component-set node IDs to spot-check */];
  const out = [];
  for (const id of SAMPLES) {
    const node = await figma.getNodeByIdAsync(id);
    if (!node) continue;
    const findings = [];
    node.findAll(n => true).forEach(child => {
      const bv = child.boundVariables || {};
      if (Array.isArray(child.fills) && child.fills.some(f => f.type === 'SOLID') && !bv.fills) {
        findings.push({ kind: 'unbound-fill', path: child.name });
      }
      if (Array.isArray(child.strokes) && child.strokes.length > 0 && !bv.strokes) {
        findings.push({ kind: 'unbound-stroke', path: child.name });
      }
      if (child.type === 'TEXT' && !bv.fills && !child.textStyleId) {
        findings.push({ kind: 'unbound-text-fill', path: child.name });
      }
      if (child.layoutMode && child.layoutMode !== 'NONE') {
        const SPACING_KEYS = ['paddingLeft','paddingRight','paddingTop','paddingBottom','itemSpacing'];
        SPACING_KEYS.forEach(k => {
          if (typeof child[k] === 'number' && child[k] > 0 && !(bv[k])) {
            findings.push({ kind: 'unbound-spacing', path: child.name, prop: k, value: child[k] });
          }
        });
      }
    });
    out.push({ id, name: node.name, findings: findings.slice(0, 25) });
  }
  return out;
```

**Pass:** zero findings across the sampled components.
**Auto-resolve signal:** every sample returns an empty `findings` array. (When findings are non-empty but expected — e.g. an intentionally decorative demo node — the report should call them out as documented exceptions.)

### CD9 — Auto Layout adoption

```
figma_execute:
  const sets = await figma.root.findAllAsync(n => n.type === 'COMPONENT_SET');
  return sets.map(s => {
    const variants = s.children.filter(c => c.type === 'COMPONENT');
    const noAutoLayout = variants.filter(v => v.layoutMode === 'NONE').length;
    const totalChildren = variants.reduce((acc, v) => acc + v.findAll(n => n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE').length, 0);
    const innerNoAutoLayout = variants.reduce((acc, v) =>
      acc + v.findAll(n => (n.type === 'FRAME') && n.layoutMode === 'NONE' && (n.children || []).length > 0).length, 0);
    return { name: s.name, variantCount: variants.length, rootMissing: noAutoLayout, innerMissing: innerNoAutoLayout, innerTotal: totalChildren };
  });
```

**Pass:** every entry has `rootMissing === 0`. `innerMissing` should be < ~10% of `innerTotal` (a few small absolute-positioned helpers are tolerable; large numbers indicate the component still needs reflow work).
**Auto-resolve signal:** all `rootMissing === 0` AND each component's `innerMissing / innerTotal < 0.1`.

## Naming

### N1 — Component names match engineering

```
1. figma_search_components  → list all component-set names
2. Cross-source grep:
   ls libs/*/src/lib/  (or framework's component dir)
3. Diff: every Figma component-set should map 1:1 to a code-side component.
```

**Pass:** zero unmatched names on either side (allowing for the workspace's naming-rule, e.g. `Llm<Name>` Figma ↔ `Llm<Name>` code).
**Auto-resolve signal:** intersection size equals both source set sizes.

### N2 — Variable path conventions

```
figma_execute:
  const vars = await figma.variables.getLocalVariablesAsync();
  const offenders = vars.filter(v => !/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*(\/[a-z][a-z0-9-]*)*$/.test(v.name));
  return { count: offenders.length, samples: offenders.slice(0, 5).map(v => v.name) };
```

**Pass:** zero offenders; all variables follow `segment/name` slash-grouped lowercase-kebab.
**Auto-resolve signal:** offender count is 0.

### N3 — Slash naming for Variants

```
figma_execute:
  const sets = await figma.root.findAllAsync(n => n.type === 'COMPONENT_SET');
  const offenders = sets.filter(s => /[A-Z]/.test(s.name.split('/').pop()) || s.name.includes('  '));
  return offenders.map(s => s.name);
```

**Pass:** zero offenders.

## File Structure

### FS2 — Page organization

```
figma_get_file_data  (or figma_execute returning figma.root.children.map(p => p.name))
→ inspect page list
```

**Pass:** Cover page exists as the first page; pages are organized into recognizable categories (Tokens, Icons, Components, Patterns, etc.).
**Auto-resolve signal:** first page name matches `/cover|index|read.?me/i` AND page count is in a sensible range (3–10 typical for a library file).

### FS3 — Sub-components polluting asset panel

```
figma_search_components  (limit=100)
→ count component-sets/components whose name starts with `_` or `.`
```

**Pass:** zero name-leading-underscore or dot components published.

## Engineering-Sync Readiness

### ES1 — Token names match codebase

```
1. figma_get_variables  → list semantic-tier variable names
2. Read consuming repo's tokens.css / tokens.json:
   grep -E "^\s*--ui-" libs/*/styles/tokens.css | sed 's/:.*//' | sort -u
3. Apply transformation rule (e.g. `color/primary` → `--ui-color-primary`) and diff.
```

**Pass:** zero diff after applying the team's transformation rule.
**Auto-resolve signal:** transformation produces 1:1 mapping with no orphans on either side.

### ES2 — Component prop API matches code

See **CD2** — same query, same auto-resolve signal.

### ES3 — Code Connect / mapping setup

```
1. Check repo for `figma.config.json` or `figma-code-connect.json`.
2. Or: confirm that "name parity is the chosen mapping mechanism" is documented on the Cover page.
```

**Pass:** either the config exists, or the Cover page explicitly documents name-parity as the mapping.

### ES4 — Documentation handoff

```
grep -rE "parameters\.design|figmaNode\(" libs/*/src/lib/ | wc -l
```

**Pass:** count > 80% of stories have `design` parameters linking back to Figma frames.

## Cross-source greps — quick reference

When verifying, the most common code-side check is one of these:

```bash
# Find a token's code-side identifier
grep -rEn "ui-color-[a-z-]+" libs/ src/ --include="*.css" --include="*.scss" --include="*.ts"

# Find a Variant Property value referenced in components
grep -rEn "variant[:=]\s*['\"](primary|secondary|outline|danger)['\"]" libs/ src/

# Find any Figma frame reference in stories (parameters.design)
grep -rEn "parameters\.design" libs/ src/ apps/

# Confirm a token has been removed cleanly
grep -rln "ui-color-{old-name}" libs/ src/  # should return zero lines
```

Pin the grep root to the consumer repo (`libs/`, `src/`, `apps/`, etc.) to avoid sifting through `node_modules` or `dist/`.
