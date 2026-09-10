/**
 * The micro-contract (ADR-0121, Decision 3): the ONLY hand-authored spec artefact per
 * component. It records what no derived artefact can know — which Figma master this
 * component is, and where Figma and code differ on purpose. Everything else about the
 * component is derived: props, types, defaults and descriptions from the docgen manifest;
 * variant coverage from the stories; geometry and paint from the rendered story and the
 * Figma snapshot.
 *
 * Forbidden here, by design: props, defaults, unions, variant matrices, prose
 * descriptions, token lists. If you want to write one of those, the place is the
 * component's types and JSDoc, a story, or the master. A contract that regrows into a
 * metadata file has failed.
 *
 * Contracts are plain object literals — no imports of values, no computed members — so
 * `tools/scripts/lib/ts-eval.js` can read them statically, the way it reads the metadata
 * registry.
 */
export interface ComponentContract {
  /** Spec selector, e.g. `'AtlButton'`. Must equal the master's `selector` in `tools/figma/snapshot.json`. */
  component: string;
  /** The master's `COMPONENT_SET` (or lone `COMPONENT`) node id in the Atelier file, e.g. `'129:20'`. */
  figmaNodeId: string;
  /**
   * Figma properties — variant axes, Booleans, Texts, instance swaps — that have no code
   * prop on purpose, each with the reason. The `state` axis is NOT listed: interaction
   * states are CSS pseudo-classes by repo-wide convention (ADR-0114) and the check knows it.
   */
  figmaOnly?: ReadonlyArray<{ name: string; reason: string }>;
  /**
   * Code props or events that have no Figma property on purpose, each with the reason
   * (e.g. `open` — "false renders nothing", ADR-0056). Domain: only string-literal enum
   * props — the code's own axes — ever need an entry here, for the same reason
   * `[ENUM-UNDRAWN]` only ever reports enum props. Booleans, strings, numbers, callbacks
   * and events with no Figma counterpart are normal (behaviour and content) and never
   * need one.
   */
  codeOnly?: ReadonlyArray<{ name: string; reason: string }>;
  /**
   * A Figma axis that maps to a code prop under another name or value set, e.g. the
   * `selection` axis (`checked` | `unchecked`) that is `checked: boolean` in code.
   * Verbatim-equal axes need no entry. `codeProp` may be dotted (`Child.prop`, e.g.
   * `AtlStep.completed`) when the prop lives on a CHILD component's own manifest rather
   * than the story's primary component — the check resolves it there. Several entries
   * may target the same `figmaAxis` (e.g. AtlStepper's `state` axis maps to three
   * different `AtlStep` flags, one entry each).
   */
  axisMap?: ReadonlyArray<{
    figmaAxis: string;
    codeProp: string;
    values?: Readonly<Record<string, string | number | boolean | null>>;
    reason: string;
  }>;
  /** Only when the root frame is not the comparable layer: the part a parity probe measures instead. */
  probes?: ReadonlyArray<{ part: string; selector: string; reason: string }>;
}
