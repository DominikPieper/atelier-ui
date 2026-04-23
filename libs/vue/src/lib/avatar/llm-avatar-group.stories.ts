import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmAvatarGroup from './llm-avatar-group.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}
import LlmAvatar from './llm-avatar.vue';

const meta: Meta<typeof LlmAvatarGroup> = {
  title: 'Components/Display/LlmAvatarGroup',
  component: LlmAvatarGroup,
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
    design: figmaNode('55-151'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmAvatarGroup>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmAvatarGroup, LlmAvatar },
    setup() { return { args }; },
    template: `
      <LlmAvatarGroup v-bind="args">
        <LlmAvatar name="Alice Smith" />
        <LlmAvatar name="Bob Jones" />
        <LlmAvatar name="Carol Davis" />
        <LlmAvatar name="Dave Wilson" />
        <LlmAvatar name="Eve Brown" />
      </LlmAvatarGroup>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmAvatarGroup, LlmAvatar },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <p style="margin-bottom:0.5rem">Max 3 (showing overflow)</p>
          <LlmAvatarGroup :max="3">
            <LlmAvatar name="Alice" />
            <LlmAvatar name="Bob" />
            <LlmAvatar name="Carol" />
            <LlmAvatar name="Dave" />
            <LlmAvatar name="Eve" />
          </LlmAvatarGroup>
        </div>
        <div>
          <p style="margin-bottom:0.5rem">Max 5 (no overflow)</p>
          <LlmAvatarGroup :max="5">
            <LlmAvatar name="Alice" />
            <LlmAvatar name="Bob" />
            <LlmAvatar name="Carol" />
          </LlmAvatarGroup>
        </div>
        <div>
          <p style="margin-bottom:0.5rem">Large size</p>
          <LlmAvatarGroup :max="3" size="lg">
            <LlmAvatar name="Alice Smith" size="lg" />
            <LlmAvatar name="Bob Jones" size="lg" />
            <LlmAvatar name="Carol Davis" size="lg" />
            <LlmAvatar name="Dave Wilson" size="lg" />
          </LlmAvatarGroup>
        </div>
      </div>
    `,
  }),
};
