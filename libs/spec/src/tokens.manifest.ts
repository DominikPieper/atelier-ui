/**
 * Token manifest — agent-readable annotations for every `--ui-*` CSS
 * token declared in `libs/{angular,react,vue}/src/styles/tokens.css`.
 *
 * Why this exists: a CSS token alone (`--ui-color-primary: #3b82f6`)
 * tells a downstream agent the value but not the intent. An agent
 * picking a colour for a new component sees a hex code and a name, and
 * has to guess whether the token is appropriate for the surface it is
 * building. The annotation makes the intent explicit and lists the
 * constraints an agent must respect.
 *
 * The token names themselves are NOT renamed — the existing `--ui-*`
 * vocabulary already encodes intent. This file is purely additive.
 *
 * `tools/scripts/check-css-tokens.js` verifies that every token declared
 * in `tokens.css` has an entry here, and that every entry references a
 * declared token. `tools/scripts/gen-llms-txt.mjs` merges these
 * annotations into `docs/public/llms-full.txt` so downstream LLMs see
 * the intent alongside the value.
 */

export interface TokenAnnotation {
  /** Agent-readable purpose. What the token is for, not what it looks
   *  like. "Primary call-to-action surfaces and links" is good;
   *  "blue" is not. */
  intent: string;

  /** Constraints an agent must respect when reaching for this token.
   *  Examples: `'high contrast required against surface'`, `'do not
   *  use for decorative elements'`, `'only on raised surfaces'`. */
  constraints: string[];

  /** Optional companion token name for the dark theme, when the value
   *  inverts. Useful for agents asked to produce a dark-mode variant. */
  darkMode?: string;
}

/**
 * Authoritative annotation map. Populated in Phase 3 of the AI-readiness
 * rollout — see `plan/ai-readiness.md`. The empty object today is
 * intentional: the gate that consumes this manifest is opt-in until the
 * map is filled.
 */
export const tokens: Record<string, TokenAnnotation> = {
  // === Typography ===
  '--ui-font-family': {
    intent:
      'Default UI typeface stack. Instrument Sans first, with system fallbacks for offline / first-paint (ADR-0035).',
    constraints: [
      'Declare it once on each component root — not per rule, and not left to the app shell: a component that depends on the consumer applying it renders in the app\'s font while its neighbours render this one (measured; ADR-0049).',
      'Use --ui-font-display for the one display line per surface; everything interactive stays on this stack.',
    ],
  },
  '--ui-font-display': {
    intent:
      'Display typeface stack (Instrument Serif). For the single largest line on a surface — a wordmark, a hero, a section opener.',
    constraints: [
      'One display line per surface at most; it stops reading as emphasis when repeated.',
      'Instrument Serif ships a single weight (400) — express emphasis through size and case, never font-weight.',
      'Never for interactive labels, form fields, or dense UI text.',
    ],
  },
  '--ui-font-mono': {
    intent:
      'Monospace stack (JetBrains Mono). For code, tokens, prop names, keyboard chips, and terminal output.',
    constraints: [
      'Consumed by the code-block components; declaring it here is what stops them falling back to Menlo.',
      'Do not use for prose — monospace at body length costs reading speed.',
    ],
  },
  '--ui-font-size-xs': {
    intent: 'Smallest readable size (0.75rem). Use for badges, captions, table meta, and dense labels.',
    constraints: [
      'Do not use for body copy or interactive labels users must read at a glance.',
      'Pair with --ui-color-text-muted for secondary information.',
    ],
  },
  '--ui-font-size-sm': {
    intent: 'Compact size (0.875rem). Use for secondary text, helper messages, and dense form labels.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
      'Avoid combining with --ui-line-height-tight for multi-line copy — readability suffers.',
    ],
  },
  '--ui-font-size-md': {
    intent: 'Body copy size (1rem). The default for paragraphs and form inputs.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
      'Treat this as the baseline — only step up/down when a hierarchy demands it.',
    ],
  },
  '--ui-font-size-lg': {
    intent: 'Emphasised body / small headings (1.125rem). Use for card titles and dialog headings.',
    constraints: [
      'Pair with --ui-font-weight-semibold or --ui-font-weight-medium for hierarchy.',
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-font-size-xl': {
    intent: 'Section heading size (1.25rem). Use for page sub-headings and modal titles.',
    constraints: [
      'Pair with --ui-line-height-tight for compact headings.',
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-font-size-2xl': {
    intent: 'Largest in-app heading (1.5rem). Use for page titles inside product surfaces.',
    constraints: [
      'Reserve for one top-level title per view — do not stack two side-by-side.',
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-letter-spacing-tight': {
    intent: 'Negative tracking (-0.01em) for large headings to prevent loose appearance.',
    constraints: [
      'Use only at --ui-font-size-xl and above; tightening small text hurts legibility.',
    ],
  },
  '--ui-letter-spacing-normal': {
    intent: 'Default tracking (0). Use for body copy and most UI text.',
    constraints: [
      'This is the implicit baseline — only set explicitly when overriding a parent.',
    ],
  },
  '--ui-letter-spacing-wide': {
    intent: 'Positive tracking (0.01em) for all-caps labels, badges, and eyebrows.',
    constraints: [
      'Pair with --ui-font-size-xs or --ui-font-size-sm and uppercase casing.',
      'Do not apply to lowercase running text.',
    ],
  },
  '--ui-letter-spacing-uppercase': {
    intent: 'Tracking for uppercased text (0.08em). Caps need far more space between letters than mixed case.',
    constraints: [
      'Only with text-transform: uppercase or genuinely all-caps content — it looks broken on mixed case.',
      'Pairs with --ui-type-label, which is the role uppercase text usually belongs to.',
    ],
  },
  // === Control heights (ADR-0041) ===
  '--ui-control-height-sm': {
    intent: 'Height of a small interactive control (2rem). Buttons, inputs, selects, chips that sit in dense rows.',
    constraints: [
      'Derive block padding from this, do not state it: calc((height - line-height * font-size) / 2 - border).',
      'Two controls of the same size step must resolve to the same height — that is the entire point of the token.',
    ],
  },
  '--ui-control-height-md': {
    intent: 'Height of the default interactive control (2.5rem). The size a form row is built from.',
    constraints: [
      'Derive block padding from this, do not state it.',
      'Use the control line-height (--ui-line-height-tight) in the derivation; the prose line-height makes the box taller than the token claims.',
    ],
  },
  '--ui-control-height-lg': {
    intent: 'Height of a large interactive control (3rem). Primary actions and touch-first surfaces.',
    constraints: [
      'Derive block padding from this, do not state it.',
      'The derived padding is fractional (11.75px at the current type scale). That is correct: the height is the round number, not the padding.',
    ],
  },
  '--ui-font-size-3xl': {
    intent:
      'Display size (2.25rem). The one line per surface that is meant to be looked at rather than read — a wordmark or hero.',
    constraints: [
      'Reach for --ui-type-display instead; this axis exists so that role has a size to name.',
      'Not for headings inside dense product UI — --ui-font-size-xl or -2xl carry those.',
    ],
  },
  '--ui-font-weight-normal': {
    intent: 'Default body weight (400). Use for paragraphs and regular UI text.',
    constraints: [
      'Avoid stacking with --ui-color-text-muted on small sizes — contrast drops fast.',
    ],
  },
  '--ui-font-weight-medium': {
    intent: 'Subtle emphasis weight (500). Use for form labels, button text, and table headers.',
    constraints: [
      'Prefer this over bold for inline emphasis inside body copy.',
    ],
  },
  '--ui-font-weight-semibold': {
    intent: 'Strong emphasis weight (600). Use for headings and primary calls-to-action.',
    constraints: [
      'Do not use weights above 600 — the type stack is not loaded with heavier cuts.',
    ],
  },
  '--ui-font-weight-bold': {
    intent: 'Bold (700). The heaviest weight in the system; carries headline-level emphasis.',
    constraints: [
      'Instrument Sans only — the display face ships a single weight, so this must never be applied to --ui-font-display.',
      'One bold element per view; a second one cancels the first.',
    ],
  },
  '--ui-line-height-tight': {
    intent: 'Compact leading (1.25) for headings and single-line UI text.',
    constraints: [
      'Do not use for multi-line body copy — readability suffers.',
    ],
  },
  '--ui-line-height-normal': {
    intent: 'Default leading (1.5) for body copy and multi-line UI text.',
    constraints: [
      'This is the implicit baseline — only set explicitly when overriding a parent.',
    ],
  },
  '--ui-line-height-code': {
    intent:
      'Leading for code. Looser than prose because a reader scans columns and indentation rather than following sentences across lines.',
    constraints: [
      'Code surfaces only (AtlCodeBlock). Using it for prose makes paragraphs read as loose; using prose leading for code makes indentation hard to follow.',
    ],
  },

  // === Type roles (ADR-0036) — compose the axes above ===
  '--ui-type-display': {
    intent:
      'Display role: Instrument Serif italic at 2.25rem. The single largest line on a surface — wordmark, hero, section opener.',
    constraints: [
      'At most one per surface; it stops reading as emphasis when repeated.',
      'Never override its weight — the face has only 400. Scale it with --ui-font-size-* or change the case instead.',
      'Pair with --ui-letter-spacing-tight; `font:` does not carry letter-spacing.',
    ],
  },
  '--ui-type-headline': {
    intent:
      'Headline role: Instrument Sans bold at 1.5rem. Where a surface should feel heavy — this is the weight a UI actually registers.',
    constraints: [
      'This is the role that carries emphasis, not the display role above it.',
      'Declare before any font-* override on the same rule: `font:` is a shorthand and resets style, variant, stretch and line-height.',
    ],
  },
  '--ui-type-title': {
    intent: 'Title role: semibold 1.125rem. Card headers, dialog titles, section labels inside a component.',
    constraints: ['Do not use for body copy — the weight fights sustained reading.'],
  },
  '--ui-type-body-lg': {
    intent: 'Body role, large (1.125rem). Lead paragraphs and the first screen of a reading surface.',
    constraints: ['One lead per surface; the rest of the copy is body-md.'],
  },
  '--ui-type-body-md': {
    intent: 'Body role, default (1rem). The workhorse — every paragraph and every interactive label unless a role says otherwise.',
    constraints: ['If unsure which role a piece of text is, it is this one.'],
  },
  '--ui-type-body-sm': {
    intent: 'Body role, small (0.875rem). Helper text, table meta, secondary descriptions.',
    constraints: ['Pair with --ui-color-text-muted so the size and the colour agree about importance.'],
  },
  '--ui-type-label': {
    intent: 'Label role: medium 0.75rem. Eyebrows, overlines, badge text, form labels in dense layouts.',
    constraints: [
      'Pair with --ui-letter-spacing-uppercase when uppercased — --ui-letter-spacing-wide (0.01em) is far too tight to open up caps.',
      'Not a substitute for body-sm in running text — labels are named, not read.',
    ],
  },
  '--ui-type-control': {
    intent:
      'Control role: medium 0.875rem, tight. The label ON a control — a tab, a page button, a step, a chip, a select label, a chat action.',
    constraints: [
      'Named for the --ui-control-height-* ladder these sit on. It is text on a control, not prose.',
      "Not a control's own VALUE text — an input's content keeps the longhands, because its padding formula names the leading as an operand (ADR-0073).",
      'Added because 6 CSS rules and 75 Figma text nodes had written medium/sm/tight by hand with no role to reference (ADR-0074).',
    ],
  },
  '--ui-type-action': {
    intent:
      'Action role: semibold 1rem, tight. The text of a control that acts — a button, an accordion trigger, a panel header that opens something.',
    constraints: [
      'Heavier and larger than --ui-type-control on purpose: this is the primary affordance, that is a secondary label.',
      'Not for static headings — use --ui-type-title, which is the same weight one size up and carries no affordance.',
      'Added because 3 CSS rules and 15 Figma text nodes had written semibold/md/tight by hand (ADR-0074).',
    ],
  },
  '--ui-type-code': {
    intent: 'Code role: JetBrains Mono at 0.875rem. Inline code, tokens, prop names, keyboard chips, terminal output.',
    constraints: [
      'Monospace at paragraph length costs reading speed — keep it to fragments.',
      'This is the role that makes --ui-font-mono reachable; do not name the family directly.',
    ],
  },
  // === Colour · Primary (brand anchor) ===
  // === Teal ramp . primitive tier (ADR-0038) ===
  '--ui-color-teal-50': {
    intent: 'Lightest teal. Tints and washes only, 1.26:1 on white.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Never for text on the light canvas; these steps are for fills and dark-theme surfaces.',
    ],
  },
  '--ui-color-teal-100': {
    intent: 'Very light teal. The pressed state of a primary control in the dark theme.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Never for text on the light canvas; these steps are for fills and dark-theme surfaces.',
    ],
  },
  '--ui-color-teal-200': {
    intent: 'Light teal. Primary hover in the dark theme.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Never for text on the light canvas; these steps are for fills and dark-theme surfaces.',
    ],
  },
  '--ui-color-teal-300': {
    intent: 'Light-mid teal. The primary of the dark theme; carries text on the dark canvas at 10.83:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-teal-400': {
    intent: 'Mid teal. Fills and illustration on dark; on the light canvas it clears 3:1 for UI but not 4.5:1 for text.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Not for normal text on light: 2.37:1. Large text and UI borders only.',
    ],
  },
  '--ui-color-teal-500': {
    intent: 'Mid teal, the lightest step that still carries normal text on the DARK canvas (5.73:1).',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-teal-600': {
    intent: 'Deep teal, the lightest step that still carries normal text on the LIGHT canvas (4.76:1).',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-teal-700': {
    intent: 'The brand anchor. The primary of the light theme; carries text on the light canvas at 6.87:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-teal-800': {
    intent: 'Darker teal. Primary hover in the light theme.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-teal-900': {
    intent: 'Darkest teal. The pressed state in the light theme, and the deepest text-safe step.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-red-100': {
    intent: 'Step 100 of the red ramp; the light theme’s --ui-color-danger-bg. Carries normal text on the dark canvas at 15.56:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-red-200': {
    intent: 'Step 200 of the red ramp; the dark theme’s --ui-color-danger-active. Carries normal text on the dark canvas at 13.14:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-red-300': {
    intent: 'Step 300 of the red ramp; the dark theme’s --ui-color-danger-hover and --ui-color-danger-text. Carries normal text on the dark canvas at 10.02:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-red-400': {
    intent: 'Step 400 of the red ramp; the dark theme’s --ui-color-danger. Carries normal text on the dark canvas at 6.87:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-red-500': {
    intent: 'Step 500 of the red ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 5.25:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the danger family keeps one vocabulary.',
    ],
  },
  '--ui-color-red-600': {
    intent: 'Step 600 of the red ramp, generated to complete the scale — no token aliases it today. Carries normal text on the light canvas at 4.82:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the danger family keeps one vocabulary.',
    ],
  },
  '--ui-color-red-700': {
    intent: 'The anchor of the red ramp and the light theme’s --ui-color-danger. Carries normal text on the light canvas at 6.47:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-red-800': {
    intent: 'Step 800 of the red ramp; the light theme’s --ui-color-danger-hover and --ui-color-danger-text. Carries normal text on the light canvas at 8.31:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-red-900': {
    intent: 'Step 900 of the red ramp; the light theme’s --ui-color-danger-active. Carries normal text on the light canvas at 10.02:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-red-950': {
    intent: 'Step 950 of the red ramp; the dark theme’s --ui-color-danger-bg. Carries normal text on the light canvas at 16.28:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'A surface tint, not a text colour — its chroma is deliberately below the 900.',
    ],
  },
  '--ui-color-green-100': {
    intent: 'Step 100 of the green ramp; the light theme’s --ui-color-success-bg. Carries normal text on the dark canvas at 17.31:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-green-200': {
    intent: 'Step 200 of the green ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 15.37:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the success family keeps one vocabulary.',
    ],
  },
  '--ui-color-green-300': {
    intent: 'Step 300 of the green ramp; the dark theme’s --ui-color-success-text. Carries normal text on the dark canvas at 13.54:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-green-400': {
    intent: 'Step 400 of the green ramp; the dark theme’s --ui-color-success. Carries normal text on the dark canvas at 10.91:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-green-500': {
    intent: 'Step 500 of the green ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 7.91:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the success family keeps one vocabulary.',
    ],
  },
  '--ui-color-green-600': {
    intent: 'Step 600 of the green ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 5.52:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the success family keeps one vocabulary.',
    ],
  },
  '--ui-color-green-700': {
    intent: 'The anchor of the green ramp and the light theme’s --ui-color-success. Carries normal text on the light canvas at 5.02:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-green-800': {
    intent: 'Step 800 of the green ramp; the light theme’s --ui-color-success-text. Carries normal text on the light canvas at 7.13:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-green-900': {
    intent: 'Step 900 of the green ramp, generated to complete the scale — no token aliases it today. Carries normal text on the light canvas at 8.51:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the success family keeps one vocabulary.',
    ],
  },
  '--ui-color-green-950': {
    intent: 'Step 950 of the green ramp; the dark theme’s --ui-color-success-bg. Carries normal text on the light canvas at 13.86:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'A surface tint, not a text colour — its chroma is deliberately below the 900.',
    ],
  },
  '--ui-color-amber-100': {
    intent: 'Step 100 of the amber ramp; the light theme’s --ui-color-warning-bg. Carries normal text on the dark canvas at 17.07:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-amber-200': {
    intent: 'Step 200 of the amber ramp; the dark theme’s --ui-color-warning-text. Carries normal text on the dark canvas at 15.26:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-amber-300': {
    intent: 'Step 300 of the amber ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 13.24:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the warning family keeps one vocabulary.',
    ],
  },
  '--ui-color-amber-400': {
    intent: 'Step 400 of the amber ramp; the dark theme’s --ui-color-warning. Carries normal text on the dark canvas at 11.39:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-amber-500': {
    intent: 'Step 500 of the amber ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 8.15:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the warning family keeps one vocabulary.',
    ],
  },
  '--ui-color-amber-600': {
    intent: 'Step 600 of the amber ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 5.63:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the warning family keeps one vocabulary.',
    ],
  },
  '--ui-color-amber-700': {
    intent: 'The anchor of the amber ramp and the light theme’s --ui-color-warning. Carries normal text on the light canvas at 5.02:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-amber-800': {
    intent: 'Step 800 of the amber ramp; the light theme’s --ui-color-warning-text. Carries normal text on the light canvas at 6.85:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-amber-900': {
    intent: 'Step 900 of the amber ramp, generated to complete the scale — no token aliases it today. Carries normal text on the light canvas at 8.36:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the warning family keeps one vocabulary.',
    ],
  },
  '--ui-color-amber-950': {
    intent: 'Step 950 of the amber ramp; the dark theme’s --ui-color-warning-bg. Carries normal text on the light canvas at 14.46:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'A surface tint, not a text colour — its chroma is deliberately below the 900.',
    ],
  },
  '--ui-color-sky-100': {
    intent: 'Step 100 of the sky ramp; the light theme’s --ui-color-info-bg. Carries normal text on the dark canvas at 16.57:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-sky-200': {
    intent: 'Step 200 of the sky ramp; the dark theme’s --ui-color-info-text. Carries normal text on the dark canvas at 14.33:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-sky-300': {
    intent: 'Step 300 of the sky ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 11.37:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the info family keeps one vocabulary.',
    ],
  },
  '--ui-color-sky-400': {
    intent: 'Step 400 of the sky ramp; the dark theme’s --ui-color-info. Carries normal text on the dark canvas at 8.87:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-sky-500': {
    intent: 'Step 500 of the sky ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 6.46:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the info family keeps one vocabulary.',
    ],
  },
  '--ui-color-sky-600': {
    intent: 'Step 600 of the sky ramp, generated to complete the scale — no token aliases it today. Carries normal text on the dark canvas at 4.59:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the info family keeps one vocabulary.',
    ],
  },
  '--ui-color-sky-700': {
    intent: 'The anchor of the sky ramp and the light theme’s --ui-color-info. Carries normal text on the light canvas at 5.93:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-sky-800': {
    intent: 'Step 800 of the sky ramp, generated to complete the scale — no token aliases it today. Carries normal text on the light canvas at 7.75:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'Unused by any semantic token. Alias it before use so the info family keeps one vocabulary.',
    ],
  },
  '--ui-color-sky-900': {
    intent: 'Step 900 of the sky ramp; the light theme’s --ui-color-info-text. Carries normal text on the light canvas at 9.46:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
    ],
  },
  '--ui-color-sky-950': {
    intent: 'Step 950 of the sky ramp; the dark theme’s --ui-color-info-bg. Carries normal text on the light canvas at 15.91:1.',
    constraints: [
      'Primitive: do not reference from component CSS, use the semantic token that aliases this step.',
      'A surface tint, not a text colour — its chroma is deliberately below the 900.',
    ],
  },
  '--ui-font-size-2xs': {
    intent: 'Smaller than the smallest readable size (0.625rem). For text inside a box too small to hold --ui-font-size-xs: the initials in a 24px avatar and the count in its overflow badge.',
    constraints: [
      'Only for text a user identifies rather than reads. Never for a label, a caption or body copy.',
      'Do not introduce further steps below this one; the two literals it replaced were the library\'s entire off-scale type population.',
    ],
  },
  '--ui-color-primary': {
    intent: 'Primary call-to-action colour and link text. Brand anchor on light backgrounds.',
    constraints: [
      'Must meet >=4.5:1 contrast against the surface it renders on.',
      'Reserve for one primary action per view — do not stack two side-by-side.',
      'Pair foreground text with --ui-color-text-on-primary when used as a fill.',
    ],
  },
  '--ui-color-primary-hover': {
    intent: 'Hover state for primary surfaces and links — one shade deeper than --ui-color-primary.',
    constraints: [
      'Only use as :hover / :focus-visible state — never as a resting fill.',
      'Must preserve >=4.5:1 contrast against text-on-primary.',
    ],
  },
  '--ui-color-primary-active': {
    intent: 'Pressed / active state for primary surfaces — deepest step of the primary ramp.',
    constraints: [
      'Only use as :active state — never as a resting fill.',
    ],
  },
  '--ui-color-primary-light': {
    intent: 'Soft tinted background for selected / hovered ghost states and subtle primary surfaces.',
    constraints: [
      'Decorative only — does not meet text-contrast requirements as a fill.',
      'Pair with --ui-color-primary or --ui-color-text for foreground content.',
    ],
  },

  // === Colour · Secondary (legacy opt-in) ===
  '--ui-color-secondary': {
    intent: 'Neutral secondary action colour (slate). Use for opt-in secondary buttons and chrome.',
    constraints: [
      'Reserve for components that explicitly opt in — primary actions should use --ui-color-primary.',
      'Pair foreground text with --ui-color-text-on-secondary when used as a fill.',
    ],
  },
  '--ui-color-secondary-hover': {
    intent: 'Hover state for secondary surfaces — one shade deeper than --ui-color-secondary.',
    constraints: [
      'Only use as :hover / :focus-visible state — never as a resting fill.',
    ],
  },
  '--ui-color-secondary-active': {
    intent: 'Pressed / active state for secondary surfaces — deepest step of the secondary ramp.',
    constraints: [
      'Only use as :active state — never as a resting fill.',
    ],
  },

  // === Colour · Semantic (signal) ===
  '--ui-color-danger': {
    intent: 'Destructive action and error signal colour. Use for delete buttons and form errors.',
    constraints: [
      'Pair with text + icon — never rely on colour alone for state.',
      'Do not use for decorative emphasis.',
      'Pair foreground text with --ui-color-text-on-danger when used as a fill.',
    ],
  },
  '--ui-color-danger-hover': {
    intent: 'Hover state for danger surfaces — one shade deeper than --ui-color-danger.',
    constraints: [
      'Only use as :hover / :focus-visible state — never as a resting fill.',
    ],
  },
  '--ui-color-danger-active': {
    intent: 'Pressed / active state for danger surfaces — deepest step of the danger ramp.',
    constraints: [
      'Only use as :active state — never as a resting fill.',
    ],
  },
  '--ui-color-success': {
    intent: 'Positive confirmation signal colour. Use for success buttons and confirmation icons.',
    constraints: [
      'Pair with text + icon — never rely on colour alone for state.',
      'Do not use for decorative emphasis.',
      'Pair foreground text with --ui-color-text-on-success when used as a fill.',
    ],
  },
  '--ui-color-warning': {
    intent: 'Caution signal colour. Use for warning alerts and pending states.',
    constraints: [
      'Pair with text + icon — never rely on colour alone for state.',
      'Do not use for decorative emphasis.',
    ],
  },
  '--ui-color-info': {
    intent: 'Informational signal colour. Use for info alerts and neutral notifications.',
    constraints: [
      'Pair with text + icon — never rely on colour alone for state.',
      'Do not use for decorative emphasis.',
    ],
  },

  // === Colour · Semantic tinted-bg pairs (Badge / Alert / Toast) ===
  '--ui-color-success-bg': {
    intent: 'Tinted background for success badges, alerts, and toasts. AA-safe pair with --ui-color-success-text.',
    constraints: [
      'Only use as a fill — pair foreground with --ui-color-success-text for guaranteed contrast.',
      'Do not place arbitrary text colours on this surface — the AA pairing is specific.',
    ],
  },
  '--ui-color-success-text': {
    intent: 'AA-safe foreground for use on --ui-color-success-bg in success badges, alerts, and toasts.',
    constraints: [
      'Only use as foreground on --ui-color-success-bg; contrast is guaranteed against that surface and no other.',
    ],
  },
  '--ui-color-warning-bg': {
    intent: 'Tinted background for warning badges, alerts, and toasts. AA-safe pair with --ui-color-warning-text.',
    constraints: [
      'Only use as a fill — pair foreground with --ui-color-warning-text for guaranteed contrast.',
      'Do not place arbitrary text colours on this surface — the AA pairing is specific.',
    ],
  },
  '--ui-color-warning-text': {
    intent: 'AA-safe foreground for use on --ui-color-warning-bg in warning badges, alerts, and toasts.',
    constraints: [
      'Only use as foreground on --ui-color-warning-bg; contrast is guaranteed against that surface and no other.',
    ],
  },
  '--ui-color-danger-bg': {
    intent: 'Tinted background for danger badges, alerts, and toasts. AA-safe pair with --ui-color-danger-text.',
    constraints: [
      'Only use as a fill — pair foreground with --ui-color-danger-text for guaranteed contrast.',
      'Do not place arbitrary text colours on this surface — the AA pairing is specific.',
    ],
  },
  '--ui-color-danger-text': {
    intent: 'AA-safe foreground for use on --ui-color-danger-bg in danger badges, alerts, and toasts.',
    constraints: [
      'Only use as foreground on --ui-color-danger-bg; contrast is guaranteed against that surface and no other.',
    ],
  },
  '--ui-color-info-bg': {
    intent: 'Tinted background for info badges, alerts, and toasts. AA-safe pair with --ui-color-info-text.',
    constraints: [
      'Only use as a fill — pair foreground with --ui-color-info-text for guaranteed contrast.',
      'Do not place arbitrary text colours on this surface — the AA pairing is specific.',
    ],
  },
  '--ui-color-info-text': {
    intent: 'AA-safe foreground for use on --ui-color-info-bg in info badges, alerts, and toasts.',
    constraints: [
      'Only use as foreground on --ui-color-info-bg; contrast is guaranteed against that surface and no other.',
    ],
  },

  // === Colour · Surfaces ===
  '--ui-color-surface': {
    intent: 'Base page background. The canvas every other surface elevates from.',
    constraints: [
      'Pair with --ui-color-text or --ui-color-text-muted only — never raw black/white.',
      'Do not stack two surfaces of the same level on top of each other — use -raised or -sunken.',
    ],
  },
  '--ui-color-surface-raised': {
    intent: 'Slightly elevated surface for cards, popovers, and panels resting above the page.',
    constraints: [
      'Pair with --ui-color-text or --ui-color-text-muted only — never raw black/white.',
      'Combine with --ui-shadow-sm or --ui-shadow-md for perceived elevation.',
    ],
  },
  '--ui-color-surface-sunken': {
    intent: 'Recessed surface for input fields, code blocks, and inset containers.',
    constraints: [
      'Pair with --ui-color-text or --ui-color-text-muted only — never raw black/white.',
      'Do not combine with elevation shadows — sunken surfaces should read as inset.',
    ],
  },
  '--ui-color-overlay': {
    intent: 'Scrim behind modals, drawers, and full-screen overlays.',
    constraints: [
      'Only use as a backdrop layer — never as a fill for interactive surfaces.',
      'Pair with --ui-z-overlay or higher; do not place at base z-index.',
    ],
  },

  // === Colour · Borders ===
  '--ui-color-border': {
    intent: 'Decorative border for cards, dividers, and resting input outlines. Below 3:1 contrast — informational only.',
    constraints: [
      'Decorative only — do not use as the sole indicator of a functional boundary (WCAG 1.4.11).',
      'For functional borders (interactive controls), use --ui-color-border-strong.',
    ],
  },
  '--ui-color-border-hover': {
    intent: 'Hover state for decorative borders — slightly deeper than --ui-color-border.',
    constraints: [
      'Only use as :hover state — never as a resting border.',
    ],
  },
  '--ui-color-border-strong': {
    intent: 'Functional border meeting >=3:1 contrast (WCAG 1.4.11). Use for input outlines, focus rings, and meaningful dividers.',
    constraints: [
      'Use whenever the border carries meaning (control boundaries, separators users must perceive).',
      'Do not use for purely decorative chrome — use --ui-color-border instead.',
    ],
  },

  // === Colour · Text ===
  '--ui-color-text': {
    intent: 'Primary body and heading text colour. Use on --ui-color-surface and its raised/sunken variants.',
    constraints: [
      'Must meet >=4.5:1 contrast against the surface it renders on (verified for all --ui-color-surface* pairs).',
      'Do not use as a fill colour — this is a foreground token.',
    ],
  },
  '--ui-color-text-muted': {
    intent: 'Secondary text colour for helper copy, captions, and de-emphasised content.',
    constraints: [
      'Must meet >=4.5:1 contrast — verified against --ui-color-surface* but not against tinted surfaces.',
      'Do not use for primary actions, form labels, or anything users must scan quickly.',
    ],
  },
  '--ui-color-text-on-primary': {
    intent: 'Foreground colour for text and icons rendered on --ui-color-primary fills.',
    constraints: [
      'Only use as foreground on the matching brand surface; contrast is guaranteed against that surface and no other.',
    ],
  },
  '--ui-color-text-on-secondary': {
    intent: 'Foreground colour for text and icons rendered on --ui-color-secondary fills.',
    constraints: [
      'Only use as foreground on the matching brand surface; contrast is guaranteed against that surface and no other.',
    ],
  },
  '--ui-color-text-on-danger': {
    intent: 'Foreground colour for text and icons rendered on --ui-color-danger fills.',
    constraints: [
      'Only use as foreground on the matching brand surface; contrast is guaranteed against that surface and no other.',
    ],
  },
  '--ui-color-text-on-success': {
    intent: 'Foreground colour for text and icons rendered on --ui-color-success fills.',
    constraints: [
      'Only use as foreground on the matching brand surface; contrast is guaranteed against that surface and no other.',
    ],
  },

  // === Colour · Brand palette (opt-in) ===
  '--ui-color-brand-corporate': {
    intent: 'Conciso corporate teal. Reference brand colour — opt-in for components that need it.',
    constraints: [
      'Reserve for explicit brand surfaces (logos, marketing accents) — do not use as a generic UI fill.',
      'Contrast not guaranteed against arbitrary text colours; verify per use.',
    ],
  },
  '--ui-color-brand-agile': {
    intent: 'Conciso Agile sub-brand colour (mint). Opt-in for Agile-themed surfaces.',
    constraints: [
      'Reserve for explicit Agile-branded surfaces — do not use as a generic success colour (use --ui-color-success).',
      'Contrast not guaranteed against arbitrary text colours; verify per use.',
    ],
  },
  '--ui-color-brand-architecture': {
    intent: 'Conciso Architecture sub-brand colour (deep teal). Opt-in for Architecture-themed surfaces.',
    constraints: [
      'Reserve for explicit Architecture-branded surfaces — do not use as a generic UI fill.',
      'Contrast not guaranteed against arbitrary text colours; verify per use.',
    ],
  },
  '--ui-color-brand-development': {
    intent: 'Conciso Development sub-brand colour (bright blue). Opt-in for Development-themed surfaces.',
    constraints: [
      'Reserve for explicit Development-branded surfaces — do not use as a generic info colour (use --ui-color-info).',
      'Contrast not guaranteed against arbitrary text colours; verify per use.',
    ],
  },
  '--ui-color-brand-petrol': {
    intent: 'Conciso deep petrol accent. Opt-in for dark brand surfaces and accents.',
    constraints: [
      'Reserve for explicit brand surfaces — do not use as a generic dark fill (use --ui-color-surface variants).',
      'Contrast not guaranteed against arbitrary text colours; verify per use.',
    ],
  },
  '--ui-color-brand-ai': {
    intent: 'Conciso AI sub-brand colour (lime). Opt-in for AI-themed surfaces and accents.',
    constraints: [
      'Reserve for explicit AI-branded surfaces — do not use as a generic warning or highlight.',
      'Contrast not guaranteed against arbitrary text colours; verify per use.',
    ],
  },
  '--ui-color-brand-light-blue': {
    intent: 'Conciso light-blue accent. Opt-in for bright brand highlights and gradients.',
    constraints: [
      'Reserve for explicit brand accents — do not use as a generic UI fill.',
      'Contrast not guaranteed against arbitrary text colours; verify per use.',
    ],
  },
  '--ui-color-brand-light-green': {
    intent: 'Conciso light-green accent. Opt-in for bright brand highlights and gradients.',
    constraints: [
      'Reserve for explicit brand accents — do not use as a generic success indicator.',
      'Contrast not guaranteed against arbitrary text colours; verify per use.',
    ],
  },

  // === Opacity ===
  '--ui-opacity-disabled': {
    intent: 'Opacity applied to disabled interactive controls so their colour reads as inert.',
    constraints: [
      'Apply via opacity on the disabled element — do not bake into colour tokens.',
      'Do not use for de-emphasis of non-disabled content; use --ui-color-text-muted instead.',
    ],
  },

  // === Radius ===
  '--ui-radius-sm': {
    intent: 'Small rounding (0.5rem) for compact controls — badges, tags, inline chips.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-radius-md': {
    intent: 'Default rounding for interactive surfaces — buttons, inputs, cards. Modern, mildly soft.',
    constraints: [
      'Treat as the baseline radius — only step up/down for hierarchy or emphasis.',
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-radius-lg': {
    intent: 'Large rounding for prominent panels — modals, popovers, hero cards.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-radius-xl': {
    intent: 'Extra-large rounding for marketing surfaces and oversized panels.',
    constraints: [
      'Reserve for large surfaces — applied to small controls it reads as a misuse.',
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-radius-full': {
    intent: 'Fully rounded (pill) shape. Use for avatar masks, status dots, and pill buttons.',
    constraints: [
      'Use on equal-sided elements (circles) or fixed-height pills — applied to rectangles it produces inconsistent corners.',
    ],
  },

  // === Row heights ===
  '--ui-row-inset': {
    intent:
      'How much taller a row is than the control it holds, per edge. The one number that expresses the relation between the two vertical ladders — set it to 0 and rows collapse onto control heights in a single edit.',
    constraints: [
      'Never referenced directly by a component: read a --ui-row-height-* token, which composes it.',
      'Measured basis: a table cell at the control height of 40 renders 41.0px holding a 40px control, because two collapsed cell borders fall outside the box; at the row height it renders exactly 48.00px holding text, a badge, an sm button, an md button or an md avatar.',
    ],
  },
  '--ui-row-height-sm': {
    intent:
      'The height of a repeating row that holds sm-step content: a menu item, a dropdown option, a checkbox / radio / toggle row, a compact table row.',
    constraints: [
      'A row CENTRES its content: `min-height: var(--ui-row-height-sm); padding-block: 0; line-height: var(--ui-line-height-tight)`. ADR-0041\'s derived-padding formula is for controls and produces the wrong box here — a size-md cell with derived padding renders 62.5px holding an md button.',
      'min-height, not height: a row whose content wraps has to grow rather than clip (ADR-0041\'s own reasoning).',
      'Not for breadcrumbs or for card / dialog / drawer / chat headers — see ADR-0052.',
    ],
  },
  '--ui-row-height-md': {
    intent: 'The default repeating row: a table row, a list row that holds md-step controls.',
    constraints: [
      'Same recipe as --ui-row-height-sm: state the height, zero the block padding, state the line-height.',
      'Any control of the md step fits without a convention; that is the whole reason this ladder exists.',
    ],
  },
  '--ui-row-height-lg': {
    intent: 'A roomy repeating row — a comfortable table, a touch-first list.',
    constraints: [
      'Same recipe. Reach for it when the content is a lg-step control or when density is deliberately low, not to create emphasis.',
    ],
  },

  // === Border widths ===
  '--ui-border-width': {
    intent:
      'The hairline that separates one surface from another: card and panel outlines, input borders, table rules, the transparent border a button reserves so its box does not move between variants.',
    constraints: [
      'Every border in the library uses this or --ui-border-width-thick; a literal width fails check:token-bypass.',
      'Keep it a whole pixel — a half-pixel border renders blurry at 1x device-pixel-ratio.',
    ],
  },
  '--ui-border-width-thick': {
    intent:
      'The heavier weight that marks a control rather than separating surfaces: the avatar status ring, the stepper circle, the checkbox mark, the rule under a table header.',
    constraints: [
      'Reserve it for marks and rings. Using it for surface separation flattens the distinction it exists to make.',
      'Not for graphic devices drawn with border-width (AtlToast\'s accent bar, AtlRadio\'s dot) — those are dimensions, and are exempted by name in check:token-bypass.',
    ],
  },

  // === Spacing ===
  '--ui-spacing-1': {
    intent: 'Hairline spacing (0.25rem). Use for icon-to-label gaps and tightest groupings.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-spacing-2': {
    intent: 'Tight spacing (0.5rem). Use for compact button padding and dense list rows.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-spacing-3': {
    intent: 'Snug spacing (0.75rem). Use for default form-control padding and chip insets.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-spacing-4': {
    intent: 'Default inter-element spacing (1rem). Use for gaps inside cards, between form fields, between list items.',
    constraints: [
      'Treat as the baseline spacing — only step up/down for hierarchy or density.',
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-spacing-5': {
    intent: 'Comfortable spacing (1.25rem). Use for card padding and form section gaps.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-spacing-6': {
    intent: 'Loose spacing (1.5rem). Use for dialog padding and prominent component insets.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-spacing-8': {
    intent: 'Section spacing (2rem). Use between distinct content blocks on a page.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-spacing-10': {
    intent: 'Wide section spacing (2.5rem). Use for separation between major page sections.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-spacing-12': {
    intent: 'Generous section spacing (3rem). Use for page-level layout gutters.',
    constraints: [
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-spacing-16': {
    intent: 'Largest scale step (4rem). Use for hero/landing-page rhythm and top-level layout offsets.',
    constraints: [
      'Reserve for marketing / hero surfaces — inside product UI it usually signals a missing structural component.',
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },

  // === Shadows ===
  '--ui-shadow-xs': {
    intent: 'Minimal elevation — a faint shadow used for inputs and resting interactive controls.',
    constraints: [
      'Combine with a 1px subtle border for clarity on busy backgrounds.',
      'Avoid stacking with --ui-shadow-md or above on the same surface.',
    ],
  },
  '--ui-shadow-sm': {
    intent: 'Low elevation for resting cards and panels that lift slightly off the page.',
    constraints: [
      'Combine with a 1px subtle border for clarity on busy backgrounds.',
      'Avoid stacking with --ui-shadow-lg on the same surface.',
    ],
  },
  '--ui-shadow-md': {
    intent: 'Default elevation for raised surfaces (cards, dropdowns at rest).',
    constraints: [
      'Combine with a 1px subtle border for clarity on busy backgrounds.',
      'Avoid stacking with --ui-shadow-lg on the same surface.',
    ],
  },
  '--ui-shadow-lg': {
    intent: 'High elevation for popovers, menus, and floating panels detached from the page.',
    constraints: [
      'Reserve for transient floating UI — overusing flattens the elevation hierarchy.',
      'Avoid stacking with --ui-shadow-xl on the same surface.',
    ],
  },
  '--ui-shadow-xl': {
    intent: 'Maximum elevation for modals and command palettes that own the screen.',
    constraints: [
      'Reserve for top-level dialogs — there is no higher step.',
      'Pair with --ui-color-overlay to anchor the elevation.',
    ],
  },

  // === Motion · Easing ===
  '--ui-ease-out': {
    intent: 'Decelerating easing curve. Use for entrances and elements arriving on screen.',
    constraints: [
      'Use --ui-ease-out for entrances, --ui-ease-in-out for movement, --ui-ease-spring for emphasised transitions.',
    ],
  },
  '--ui-ease-in-out': {
    intent: 'Symmetrical easing curve. Use for elements moving across the screen.',
    constraints: [
      'Use --ui-ease-out for entrances, --ui-ease-in-out for movement, --ui-ease-spring for emphasised transitions.',
    ],
  },
  '--ui-ease-spring': {
    intent: 'Overshoot easing curve. Use sparingly for emphasised transitions (e.g. toasts, success confirmations).',
    constraints: [
      'Use --ui-ease-out for entrances, --ui-ease-in-out for movement, --ui-ease-spring for emphasised transitions.',
      'Collapses to "ease" under prefers-reduced-motion — do not rely on the overshoot for meaning.',
    ],
  },

  // === Motion · Duration ===
  '--ui-duration-fast': {
    intent: 'Short transition (150ms). Use for hover/focus state changes and micro-interactions.',
    constraints: [
      'Respects prefers-reduced-motion via the @media block — do not override durations elsewhere.',
      'Do not interpolate between scale steps; pick the nearest defined value.',
    ],
  },
  '--ui-duration-normal': {
    intent: 'Default transition (200ms). Use for property changes on interactive components.',
    constraints: [
      'Respects prefers-reduced-motion via the @media block — do not override durations elsewhere.',
      'Treat as the baseline — only step up/down for emphasis.',
    ],
  },
  '--ui-duration-slow': {
    intent: 'Long transition (300ms). Use for enter/exit animations on overlays and panels.',
    constraints: [
      'Respects prefers-reduced-motion via the @media block — do not override durations elsewhere.',
      'Avoid for state changes users repeat often — it feels sluggish.',
    ],
  },

  // === Motion · Transition shorthands ===
  '--ui-transition-fast': {
    intent: 'Composed transition shorthand: fast duration + ease-out. Use for hover/focus micro-interactions.',
    constraints: [
      'Apply to the `transition` property with the property name (e.g. `color var(--ui-transition-fast)`).',
      'Respects prefers-reduced-motion through its constituent --ui-duration-fast token.',
    ],
  },
  '--ui-transition-normal': {
    intent: 'Composed transition shorthand: normal duration + ease-out. Default for interactive state changes.',
    constraints: [
      'Apply to the `transition` property with the property name (e.g. `background var(--ui-transition-normal)`).',
      'Respects prefers-reduced-motion through its constituent --ui-duration-normal token.',
    ],
  },
  '--ui-transition-slow': {
    intent: 'Composed transition shorthand: slow duration + ease-out. Use for enter/exit animations.',
    constraints: [
      'Apply to the `transition` property with the property name.',
      'Respects prefers-reduced-motion through its constituent --ui-duration-slow token.',
    ],
  },

  // === Focus ring ===
  '--ui-focus-ring': {
    intent: 'Double-ring box-shadow for :focus-visible — surface-coloured inner + primary outer for light/dark compatibility.',
    constraints: [
      'Apply via box-shadow on :focus-visible — never on :focus alone (mouse focus would flash the ring).',
      'Do not override per component; consistency is the entire point of a global focus ring.',
    ],
  },
  '--ui-focus-ring-danger': {
    intent:
      'The focus ring for a control that is currently invalid. Same double-ring geometry as --ui-focus-ring, with the accent replaced by the danger colour.',
    constraints: [
      'Only on a control in an invalid state — a danger ring on a valid field reads as an error that is not there.',
      'Do not restate the geometry in component CSS; that is what this token exists to prevent.',
    ],
  },

  // === Form controls ===
  '--ui-color-input-bg': {
    intent: 'Resting background for text inputs, selects, and textareas. Sunken to read as fillable.',
    constraints: [
      'Pair with --ui-color-text for foreground; do not place tinted text on input surfaces.',
      'Switch to --ui-color-input-bg-focus on :focus to signal interaction.',
    ],
  },
  '--ui-color-input-bg-focus': {
    intent: 'Focused background for text inputs — lifts to surface level to signal active editing.',
    constraints: [
      'Only use as :focus / :focus-within state — never as a resting fill.',
    ],
  },
  '--ui-color-input-border': {
    intent: 'Resting border for text inputs, selects, and textareas. Functional (>=3:1 contrast).',
    constraints: [
      'Functional border — do not swap for --ui-color-border (decorative, sub-3:1).',
      'Switch to --ui-color-input-border-focus on :focus, --ui-color-input-border-invalid on error.',
    ],
  },
  '--ui-color-input-border-hover': {
    intent: 'Hover state for input borders — one shade deeper than --ui-color-input-border.',
    constraints: [
      'Only use as :hover state — never as a resting border.',
    ],
  },
  '--ui-color-input-border-focus': {
    intent: 'Focused border for inputs — primary-coloured to match the focus ring.',
    constraints: [
      'Only use as :focus / :focus-within state — never as a resting border.',
      'Pair with --ui-focus-ring on the same element for the full focus treatment.',
    ],
  },
  '--ui-color-input-border-invalid': {
    intent: 'Border for inputs in an error / aria-invalid state.',
    constraints: [
      'Pair with a visible error message (via --ui-color-error-text) — never rely on colour alone for state.',
      'Apply when aria-invalid="true" or the equivalent framework signal is present.',
    ],
  },
  '--ui-color-placeholder': {
    intent: 'Placeholder text colour for inputs. Sub-AA contrast — informational only.',
    constraints: [
      'Reserve for true placeholders (input::placeholder) — never use as a substitute for a real label.',
      'Do not use as a foreground for content users need to read; use --ui-color-text-muted instead.',
    ],
  },
  '--ui-color-error-text': {
    intent: 'Foreground colour for inline form error messages. Aliased to --ui-color-danger-text.',
    constraints: [
      'Pair with --ui-color-input-border-invalid on the associated input — colour alone is not a sufficient error signal.',
      'Do not use as a generic body-text colour — its meaning is "error".',
    ],
  },

  // === Z-index scale ===
  '--ui-z-base': {
    intent: 'Base layer (0). The implicit stacking context for page content.',
    constraints: [
      'Layer ordering: base < dropdown < overlay < modal < toast. Do not exceed the scale; if you need more, restructure.',
    ],
  },
  '--ui-z-dropdown': {
    intent: 'Stacking level for popovers, dropdowns, and menus that float above page content.',
    constraints: [
      'Layer ordering: base < dropdown < overlay < modal < toast. Do not exceed the scale; if you need more, restructure.',
    ],
  },
  '--ui-z-overlay': {
    intent: 'Stacking level for the modal scrim / backdrop layer.',
    constraints: [
      'Layer ordering: base < dropdown < overlay < modal < toast. Do not exceed the scale; if you need more, restructure.',
      'Pair with --ui-color-overlay for the visual scrim.',
    ],
  },
  '--ui-z-modal': {
    intent: 'Stacking level for modal dialogs and drawers that own the foreground.',
    constraints: [
      'Layer ordering: base < dropdown < overlay < modal < toast. Do not exceed the scale; if you need more, restructure.',
      'Always paired with --ui-z-overlay underneath for the backdrop.',
    ],
  },
  '--ui-z-toast': {
    intent: 'Top stacking level for transient toasts and notifications — above modals so they remain visible.',
    constraints: [
      'Layer ordering: base < dropdown < overlay < modal < toast. Do not exceed the scale; if you need more, restructure.',
      'Reserve for transient, dismissible notifications — anything persistent should sit lower.',
    ],
  },
};
