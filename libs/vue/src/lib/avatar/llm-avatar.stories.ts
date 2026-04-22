import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmAvatar from './llm-avatar.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmAvatar> = {
  title: 'Components/LlmAvatar',
  component: LlmAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'square'] },
    status: { control: 'select', options: ['', 'online', 'offline', 'away', 'busy'] },
  },
  args: {
    size: 'md',
    shape: 'circle',
    status: '',
    name: '',
    src: '',
    alt: '',
  },
  parameters: {
    design: figmaNode('55-151'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmAvatar>;

export const Default: Story = {
  args: { name: 'Jane Doe', status: 'online' },
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmAvatar },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div style="display:flex;gap:1rem;align-items:center">
          <LlmAvatar name="Alice Smith" size="xs" />
          <LlmAvatar name="Bob Jones" size="sm" />
          <LlmAvatar name="Carol Davis" size="md" />
          <LlmAvatar name="Dave Wilson" size="lg" />
          <LlmAvatar name="Eve Brown" size="xl" />
        </div>
        <div style="display:flex;gap:1rem;align-items:center">
          <LlmAvatar name="Circle" shape="circle" size="md" />
          <LlmAvatar name="Square" shape="square" size="md" />
        </div>
        <div style="display:flex;gap:1rem;align-items:center">
          <LlmAvatar name="Online" status="online" />
          <LlmAvatar name="Offline" status="offline" />
          <LlmAvatar name="Away" status="away" />
          <LlmAvatar name="Busy" status="busy" />
        </div>
        <div style="display:flex;gap:1rem;align-items:center">
          <LlmAvatar />
        </div>
      </div>
    `,
  }),
};
