/**
 * Icon geometry — the single source of truth for what every AtlIcon draws.
 *
 * Before this file, the library had four ways to draw the same thing: AtlIcon
 * rendered Unicode glyphs and no component used it; eleven components drew 14
 * inline `<svg>`s of their own; and two stylesheets put a literal `✕` in a CSS
 * `content:`. The result was one concept with several drawings — `close` existed
 * as an identical two-line SVG in five components, as a *differently drawn* X in
 * AtlStepper, as `'×'` in AtlIcon and as `'✕'` in CSS, and `check` existed as
 * three unrelated paths. Nothing gated it. See ADR-0046.
 *
 * Conventions, which every entry follows so a consumer can scale and colour icons
 * without knowing which one they got:
 *
 * - **One viewBox: `0 0 24 24`.** Rendered size comes from the `size` prop, never
 *   from the geometry, so `sm`/`md`/`lg` are the same shape at three scales.
 * - **`stroke` icons** are drawn with `currentColor`, `stroke-width: 2`, round caps
 *   and joins, and no fill. **`fill` icons** are solid `currentColor` silhouettes.
 *   Mixing the two inside one icon is not allowed — it reads wrong at small sizes.
 * - **Paths only** (no `<line>`/`<rect>`/`<polyline>`), so the renderer in each
 *   framework is a single `<path>` loop rather than a per-primitive switch.
 *
 * The seven icons the library itself uses (`close`, `check`, `chevron-down`,
 * `copy`, `person`, `sort-asc`, `sort-desc`) keep the geometry the components
 * already shipped, normalised to the 24 viewBox. The rest are the same idiom.
 */
export type AtlIconKind = 'stroke' | 'fill';

export interface AtlIconGeometry {
  /** How the paths are painted. Never mixed within one icon. */
  kind: AtlIconKind;
  /** Path `d` values, drawn in order, all in the 0 0 24 24 viewBox. */
  paths: string[];
}

/** viewBox shared by every icon. */
export const ATL_ICON_VIEWBOX = '0 0 24 24';

/** Stroke width for `kind: 'stroke'` icons, in viewBox units. */
export const ATL_ICON_STROKE_WIDTH = 2;

export const ATL_ICON_GEOMETRY: Record<string, AtlIconGeometry> = {
  // ── status ────────────────────────────────────────────────────────────────
  // `success` is a status icon and sits beside the circled danger/error/info, so it
  // is a circled check. `check` is the bare mark used inside controls (combobox
  // option, stepper step, copy confirmation) — two names, two shapes, on purpose.
  success: { kind: 'stroke', paths: ['M12 3A9 9 0 1 0 12 21A9 9 0 1 0 12 3', 'M8 12L11 15L16 9'] },
  check: { kind: 'stroke', paths: ['M20 6L9 17L4 12'] },
  warning: { kind: 'stroke', paths: ['M12 3L22 20H2L12 3Z', 'M12 9V14', 'M12 17.5V17.6'] },
  danger: { kind: 'stroke', paths: ['M12 3A9 9 0 1 0 12 21A9 9 0 1 0 12 3', 'M15 9L9 15', 'M9 9L15 15'] },
  error: { kind: 'stroke', paths: ['M12 3A9 9 0 1 0 12 21A9 9 0 1 0 12 3', 'M12 7V13', 'M12 16.5V16.6'] },
  info: { kind: 'stroke', paths: ['M12 3A9 9 0 1 0 12 21A9 9 0 1 0 12 3', 'M12 11V17', 'M12 7.5V7.6'] },

  // ── direction ─────────────────────────────────────────────────────────────
  'chevron-up': { kind: 'stroke', paths: ['M6 15L12 9L18 15'] },
  'chevron-down': { kind: 'stroke', paths: ['M6 9L12 15L18 9'] },
  'chevron-left': { kind: 'stroke', paths: ['M15 6L9 12L15 18'] },
  'chevron-right': { kind: 'stroke', paths: ['M9 6L15 12L9 18'] },
  // Two chevrons, for "jump to the first / last page" as against "one step".
  // AtlPagination drew these as the guillemets « and », which are quotation marks
  // in typography and were arrows only by resemblance (ADR-0055).
  'chevron-double-left': { kind: 'stroke', paths: ['M18 6L12 12L18 18', 'M11 6L5 12L11 18'] },
  'chevron-double-right': { kind: 'stroke', paths: ['M6 6L12 12L6 18', 'M13 6L19 12L13 18'] },
  'arrow-left': { kind: 'stroke', paths: ['M19 12H5', 'M11 6L5 12L11 18'] },
  'arrow-right': { kind: 'stroke', paths: ['M5 12H19', 'M13 6L19 12L13 18'] },

  // ── sorting — two solid triangles, used separately by AtlTable ────────────
  'sort-asc': { kind: 'fill', paths: ['M12 4L19 13H5L12 4Z'] },
  'sort-desc': { kind: 'fill', paths: ['M12 20L5 11H19L12 20Z'] },

  // ── actions ───────────────────────────────────────────────────────────────
  close: { kind: 'stroke', paths: ['M18 6L6 18', 'M6 6L18 18'] },
  add: { kind: 'stroke', paths: ['M12 5V19', 'M5 12H19'] },
  more: { kind: 'fill', paths: ['M6 10A2 2 0 1 0 6 14A2 2 0 1 0 6 10', 'M12 10A2 2 0 1 0 12 14A2 2 0 1 0 12 10', 'M18 10A2 2 0 1 0 18 14A2 2 0 1 0 18 10'] },
  copy: { kind: 'stroke', paths: ['M9 9H20V20H9V9Z', 'M15 5H4V16H5'] },
  paste: { kind: 'stroke', paths: ['M8 4H16V7H8V4Z', 'M6 6H5V20H19V6H18'] },
  edit: { kind: 'stroke', paths: ['M4 20H8L19 9L15 5L4 16V20Z', 'M14 6L18 10'] },
  delete: { kind: 'stroke', paths: ['M4 7H20', 'M6 7V20H18V7', 'M10 4H14', 'M10 11V16', 'M14 11V16'] },

  // ── content ───────────────────────────────────────────────────────────────
  person: {
    kind: 'fill',
    paths: [
      'M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-10 1.343-10 4v2h20v-2c0-2.657-6.686-4-10-4z',
    ],
  },
  'default-toast': {
    kind: 'stroke',
    paths: ['M4 5H20V16H13L8 20V16H4V5Z'],
  },
};
