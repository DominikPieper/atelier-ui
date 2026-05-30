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
    intent: 'Default UI typeface stack. Inter first, with system fallbacks for offline / first-paint.',
    constraints: [
      'Apply on :root or the app shell — do not respecify per component.',
      'Do not swap for display fonts inside product surfaces; reserve display faces for marketing.',
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

  // === Colour · Primary (brand anchor) ===
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
