import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlToast',
  figmaNodeId: '55:47',
  figmaOnly: [
    {
      name: 'message',
      reason:
        'Not a property of any spec interface — AtlToast has no spec interface at all. The message is the first argument of the toast service call; AtlToastOptions covers only the options object.',
    },
  ],
  axisMap: [
    {
      figmaAxis: 'position',
      codeProp: 'AtlToastContainer.position',
      reason:
        "The 'position' axis lives on the sibling AtlToastContainer, not on AtlToast (the individual toast card the master otherwise draws) — atl-toast.ts declares AtlToast and AtlToastContainer as separate classes in the same file, and only the container takes a position input.",
    },
  ],
} satisfies ComponentContract;
