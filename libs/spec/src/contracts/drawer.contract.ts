import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlDrawer',
  figmaNodeId: '421:398',
  codeOnly: [
    {
      name: 'open',
      reason:
        'Not modelled as a Boolean (ADR-0056): false renders nothing — the same native <dialog> mechanism as AtlDialog.',
    },
    {
      name: 'closeOnBackdrop',
      reason:
        'Not modelled as a Boolean (ADR-0056): behaviour only, as on AtlDialog.',
    },
  ],
  probes: [
    {
      part: 'panel',
      selector: 'dialog',
      reason:
        'the component-name class sits on a host wrapper, not on the sized panel — the ' +
        'inner native <dialog>, `position: fixed` and therefore contributing zero size to ' +
        'that wrapper. AtlDialog avoids this by putting its own class directly on the ' +
        '<dialog> element in all three frameworks, so the same root-class heuristic happens ' +
        "to land on the right element there. Verified 2026-09-11, per framework: Angular's " +
        "root ('.atl-drawer', the host custom element) still resolves — its class is exactly " +
        "'atl-drawer' — so this relative 'dialog' selector finds the real panel underneath " +
        "it. React (the 'atl-drawer-host' class sits on an outer <div>, and the <dialog> " +
        "itself carries no class at all) and Vue (likewise: 'atl-drawer-host' on an outer " +
        '<div>, no class on the <dialog>; it used to sit on the <dialog> itself) ' +
        "have no element carrying the exact 'atl-drawer' token anywhere, so their root " +
        'resolution fails before this selector is ever applied — [NO-PROBE], not fixed by ' +
        'this entry. A fix for them needs a component change (aligning the host class with ' +
        "AtlDialog's convention), which this contract-only entry deliberately does not make. " +
        'Corrected 2026-10-01: commit b21a0e0b moved the Vue host classes from the <dialog> ' +
        'onto a wrapper <div>, so Vue now matches React; the [NO-PROBE] conclusion is unchanged.',
    },
  ],
} satisfies ComponentContract;
