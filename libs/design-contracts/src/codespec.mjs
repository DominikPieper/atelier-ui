/**
 * The codeSpec fragment `check-contracts --emit` writes for figma-console's
 * `figma_check_design_parity` (`componentAPI`, `metadata`, `tokens.usedTokens`).
 *
 * The parity tool (figma-console-mcp, `compareComponentAPI` in
 * dist/core/design-code-tools.js) pairs the codeSpec's `componentAPI.props` with
 * the master's `componentPropertyDefinitions` by NAME, compared lower-cased with
 * every character outside `[a-z0-9]` removed, and reports:
 *   - a code prop with no Figma property of that name (minor),
 *   - a Figma property with no code prop of that name (info),
 *   - for a matching VARIANT, the values missing on either side (major / info).
 * It has no notion of a deliberate difference. So the code's API is expressed
 * here in FIGMA's terms, using the contract, and a deliberate difference simply
 * does not appear as a mismatch:
 *
 *   - `axisMap`   a code prop is emitted under its Figma name (the axis, or the
 *                 Boolean's key), with the Figma values when the entry maps
 *                 values. The code name is not emitted a second time.
 *   - `codeOnly`  the code prop is left out: Figma was never meant to have it.
 *   - `figmaOnly` a Figma property with no code prop is emitted under its
 *                 Figma name, typed `figma-only` and carrying the reason, so
 *                 the tool finds a partner for it. `state=<value>` entries,
 *                 and a `state` axis made only of interaction states (CSS
 *                 pseudo-classes, see INTERACTION_STATE_VALUES), are covered
 *                 the same way.
 *
 * Figma keys Boolean, Text and Instance-swap properties as `Name#<id>`, and the
 * tool's comparison keeps the id's digits, so a matching code prop is emitted
 * under the master's full key (the snapshot keeps it).
 *
 * Anything the contract does not record stays a real mismatch and is still
 * reported by the parity tool. Without a snapshot master there is nothing to
 * translate to: the code's own names are emitted.
 */

/**
 * Interaction values on a `state` axis: CSS pseudo-classes, not code-modelled
 * state. Every OTHER value on a `state` axis must be covered by an `axisMap`
 * entry or a `figmaOnly` entry named `state=<value>`.
 */
export const INTERACTION_STATE_VALUES = new Set([
  'default',
  'hover',
  'focus',
  'focus-visible',
  'active',
  'pressed',
]);

/** `Name#1:2` -> `Name`: a Figma property key without its id suffix. */
export function stripFigmaId(name) {
  const i = name.indexOf('#');
  return i === -1 ? name : name.slice(0, i);
}

// The parity schema wants `defaultValue` as string | number | boolean.
function schemaDefault(value) {
  if (value === undefined || value === null) return undefined;
  return typeof value === 'object' ? JSON.stringify(value) : value;
}

function apiProp(p, overrides = {}) {
  return {
    name: p.name,
    type: p.typeText || p.kind,
    values: p.kind === 'enum' ? p.members.map(String) : undefined,
    defaultValue: schemaDefault(p.default),
    description: p.description,
    required: p.required,
    ...overrides,
  };
}

function figmaOnlyProp(name, values, reason) {
  return {
    name,
    type: 'figma-only',
    values,
    description: `Figma-only (contract figmaOnly): ${reason}`,
  };
}

/**
 * @param {object} input
 * @param {string} input.name           component selector
 * @param {object} input.docgenResult   `{ props, description, slots }` (the common docgen shape)
 * @param {object|null} input.master    the snapshot master, or null
 * @param {object|null} input.contract  the component's contract, or null
 * @param {string[]} input.usedTokens
 */
export function buildCodeSpec({
  name,
  docgenResult,
  master,
  contract,
  usedTokens,
}) {
  const codeProps = docgenResult.props.filter((p) => !p.isOutput);
  const events = docgenResult.props.filter((p) => p.isOutput);
  const slots = (docgenResult.slots || []).map((s) =>
    typeof s === 'string' ? s : s.name,
  );

  const props = master
    ? propsInFigmaTerms(codeProps, master, contract || {})
    : codeProps.map((p) => apiProp(p));

  return {
    componentAPI: {
      props,
      // The parity schema takes event and slot NAMES (strings), not objects.
      events: events.map((e) => e.name),
      slots: slots.length ? slots : undefined,
    },
    metadata: { name, description: docgenResult.description },
    tokens: { usedTokens },
  };
}

function propsInFigmaTerms(codeProps, master, contract) {
  const codeByName = new Map(codeProps.map((p) => [p.name, p]));
  const axes = master.variantAxes || {};
  const figmaKeys = Object.keys(master.properties || {});
  // Name without id -> the master's full key (what the parity tool sees).
  const keyByName = new Map(figmaKeys.map((k) => [stripFigmaId(k), k]));
  const figmaKey = (n) => keyByName.get(n) ?? n;
  const isOnMaster = (n) =>
    Object.hasOwn(axes, n) || keyByName.has(stripFigmaId(n));

  const figmaOnly = contract.figmaOnly || [];
  const stateExemptions = new Set(
    figmaOnly
      .map((e) => /^state=(.+)$/.exec(e.name))
      .filter(Boolean)
      .map((m) => m[1]),
  );
  const codeOnlyNames = new Set((contract.codeOnly || []).map((e) => e.name));
  const axisMap = contract.axisMap || [];
  const mappedCodeProps = new Set(axisMap.map((e) => e.codeProp));

  const out = [];
  const emitted = new Set();
  const push = (prop) => {
    if (emitted.has(prop.name)) return;
    emitted.add(prop.name);
    out.push(prop);
  };

  // axisMap: one prop per Figma axis / Boolean, under the Figma name.
  const byFigmaAxis = new Map();
  for (const e of axisMap) {
    if (!byFigmaAxis.has(e.figmaAxis)) byFigmaAxis.set(e.figmaAxis, []);
    byFigmaAxis.get(e.figmaAxis).push(e);
  }
  for (const [axis, entries] of byFigmaAxis) {
    const values = new Set();
    let hasValues = false;
    for (const e of entries) {
      const own = codeByName.get(e.codeProp); // undefined for `Child.prop`
      if (e.values) {
        hasValues = true;
        for (const v of Object.keys(e.values)) values.add(v);
      } else if (own?.kind === 'enum') {
        hasValues = true;
        for (const v of own.members) values.add(v);
      } else if (own?.kind === 'boolean') {
        // The tool only compares a VARIANT's values when the code prop has
        // `values`; a boolean on a Figma axis states true/false so an axis
        // with other values is reported (map them with `values` if intended).
        hasValues = true;
        values.add('true');
        values.add('false');
      }
    }
    if (axis === 'state' && hasValues) {
      for (const v of axes.state || [])
        if (INTERACTION_STATE_VALUES.has(v) || stateExemptions.has(v))
          values.add(v);
    }
    const first = codeByName.get(entries[0].codeProp);
    const single = entries.length === 1 ? entries[0] : null;
    let defaultValue;
    if (first && single) {
      if (single.values) {
        const hits = Object.entries(single.values).filter(
          ([, codeVal]) => String(codeVal) === String(first.default),
        );
        if (hits.length === 1) defaultValue = hits[0][0];
      } else defaultValue = schemaDefault(first.default);
    }
    push({
      name: figmaKey(axis),
      type: first ? first.typeText || first.kind : 'string',
      values: hasValues ? [...values] : undefined,
      defaultValue,
      description:
        `Figma "${axis}" is code ${entries.map((e) => `"${e.codeProp}"`).join(', ')} ` +
        `(contract axisMap): ${entries[0].reason}`,
      required: first?.required,
    });
  }

  // figmaOnly: a Figma property with no code prop, on purpose.
  for (const e of figmaOnly) {
    if (/^state=/.test(e.name) || !isOnMaster(e.name)) continue;
    push(figmaOnlyProp(figmaKey(e.name), axes[e.name], e.reason));
  }

  // A `state` axis of interaction states only: CSS pseudo-classes in code.
  const state = axes.state;
  if (
    state &&
    !emitted.has('state') &&
    !codeByName.has('state') &&
    state.every(
      (v) => INTERACTION_STATE_VALUES.has(v) || stateExemptions.has(v),
    )
  ) {
    push(
      figmaOnlyProp(
        'state',
        state,
        'interaction states are CSS pseudo-classes and `state=<value>` entries are figmaOnly, not code props.',
      ),
    );
  }

  // The code's own props, under the Figma key when Figma has a property of that name.
  for (const p of codeProps) {
    if (mappedCodeProps.has(p.name) || codeOnlyNames.has(p.name)) continue;
    push(apiProp(p, { name: figmaKey(p.name) }));
  }
  return out;
}
