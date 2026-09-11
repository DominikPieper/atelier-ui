import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlRadioGroup',
  figmaNodeId: '55:137',
  figmaOnly: [
    {
      name: 'selection',
      reason:
        'Group-level selection state "for the gallery" per the master\'s own API-surface notes — an illustrative sample, not a settable prop. AtlRadioGroupSpec has no selected/checked field of its own, and unlike every property that does map, this axis\'s line carries no "-> maps to" arrow.',
    },
  ],
  codeOnly: [
    {
      name: 'orientation',
      reason:
        "React declares 'orientation' ('horizontal'|'vertical') in its own AtlRadioGroupProps with no entry in AtlRadioGroupSpec and no matching Figma axis — the same open spec decision tools/scripts/lib/allowlists.js's DEAD_SELECTOR_EXEMPT and PROP_SURFACE_EXEMPT already record (promote to AtlRadioGroupSpec, or drop it from React). Unresolved: see tasks/todo.md.",
    },
    {
      name: 'required',
      reason:
        'Not modelled (ADR-0058): required renders nothing in any Atelier form field. It is passed to the DOM as the HTML attribute and stops there: no class, no CSS rule, no mark.',
    },
    {
      name: 'readonly',
      reason:
        'Not modelled (ADR-0058): the component emits an is-readonly class and no stylesheet in any of the three frameworks has a rule for it, so nothing renders differently — the same dead-class shape ADR-0045 removed from AtlSelect.',
    },
  ],
} satisfies ComponentContract;
