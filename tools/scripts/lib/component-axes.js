'use strict';
/**
 * CSS-/default-bearing spec axis unions mapped to their component directory.
 * Consumed by check-variants.js (CSS class parity) and check-defaults.js
 * (cross-framework default parity). Since ADR-0031 the map is DERIVED in
 * lib/component-map.js from the spec's axis unions + the metadata registry
 * (plus UNION_COMPONENT_EXCEPTIONS for the spec-less Toast) — nothing to
 * maintain here when adding a component.
 */
const { maps } = require('./component-map');
const UNION_TO_COMPONENT = maps().unionToComponent;

/** Axis suffix -> CSS class prefix AND the prop name that carries the axis. */
const AXIS_PREFIX = {
  Variant: 'variant',
  Size: 'size',
  Shape: 'shape',
  Position: 'position',
  Orientation: 'orientation',
};

/** The `Atl<Component><Axis>` suffix for a union type name, or null. */
function axisOf(unionName) {
  const m = /(Variant|Size|Shape|Position|Orientation)$/.exec(unionName);
  return m ? m[1] : null;
}

module.exports = { UNION_TO_COMPONENT, AXIS_PREFIX, axisOf };
