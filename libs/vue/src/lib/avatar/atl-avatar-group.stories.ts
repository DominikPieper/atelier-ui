import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlAvatarGroup from './atl-avatar-group.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}
import AtlAvatar from './atl-avatar.vue';

import { metadata } from '@atelier-ui/spec/metadata/avatar.metadata';
const meta: Meta<typeof AtlAvatarGroup> = {
  title: 'Components/Display/AtlAvatarGroup',
  component: AtlAvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    max: { control: { type: 'number', min: 1, max: 10 } },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  args: {
    max: 3,
    size: 'md',
  },
  parameters: {
    design: figmaNode('508-7221'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlAvatarGroup>;

export const Default: Story = {
  render: (args) => ({
    components: { AtlAvatarGroup, AtlAvatar },
    setup() { return { args }; },
    template: `
      <AtlAvatarGroup v-bind="args">
        <AtlAvatar name="Alice Smith" />
        <AtlAvatar name="Bob Jones" />
        <AtlAvatar name="Carol Davis" />
        <AtlAvatar name="Dave Wilson" />
        <AtlAvatar name="Eve Brown" />
      </AtlAvatarGroup>
    `,
  }),
  parameters: { design: figmaNode('507-6305') },
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlAvatarGroup, AtlAvatar },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <p style="margin-bottom:0.5rem">Max 3 (showing overflow)</p>
          <AtlAvatarGroup :max="3">
            <AtlAvatar name="Alice" />
            <AtlAvatar name="Bob" />
            <AtlAvatar name="Carol" />
            <AtlAvatar name="Dave" />
            <AtlAvatar name="Eve" />
          </AtlAvatarGroup>
        </div>
        <div>
          <p style="margin-bottom:0.5rem">Max 5 (no overflow)</p>
          <AtlAvatarGroup :max="5">
            <AtlAvatar name="Alice" />
            <AtlAvatar name="Bob" />
            <AtlAvatar name="Carol" />
          </AtlAvatarGroup>
        </div>
        <div>
          <p style="margin-bottom:0.5rem">Large size</p>
          <AtlAvatarGroup :max="3" size="lg">
            <AtlAvatar name="Alice Smith" size="lg" />
            <AtlAvatar name="Bob Jones" size="lg" />
            <AtlAvatar name="Carol Davis" size="lg" />
            <AtlAvatar name="Dave Wilson" size="lg" />
          </AtlAvatarGroup>
        </div>
      </div>
    `,
  }),
};
