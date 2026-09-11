import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlCodeBlock',
  figmaNodeId: '420:286',
  figmaOnly: [
    {
      name: 'variant',
      reason:
        'Master description: "Variant `variant`: default | with-filename | with-line-numbers | no-copy" documents PROP COMBINATIONS (filename set, showLineNumbers true, copyable false), not a single code enum — AtlCodeBlockProps has no variant field; the underlying flags are independent booleans (filename presence, showLineNumbers, copyable).',
    },
  ],
} satisfies ComponentContract;
