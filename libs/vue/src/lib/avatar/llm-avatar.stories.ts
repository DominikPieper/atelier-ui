import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmAvatar from './llm-avatar.vue';
import LlmAvatarGroup from './llm-avatar-group.vue';

const SAMPLE_SRC = 'https://i.pravatar.cc/150?img=1';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmAvatar> = {
  title: 'Components/Display/LlmAvatar',
  component: LlmAvatar,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmAvatar },
    setup() { return { args }; },
    template: '<LlmAvatar v-bind="args" />',
  }),
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'square'] },
    status: { control: 'select', options: ['', 'online', 'offline', 'away', 'busy'] },
  },
  args: {
    src: SAMPLE_SRC,
    alt: 'User avatar',
    name: '',
    size: 'md',
    shape: 'circle',
    status: '',
  },
  parameters: {
    design: figmaNode('55-151'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmAvatar>;

export const Default: Story = {
  parameters: { design: figmaNode('55-148') },
};

export const WithInitials: Story = {
  args: {
    src: '',
    name: 'Jane Doe',
  },
  parameters: { design: figmaNode('55-148') },
};

export const WithIcon: Story = {
  args: {
    src: '',
    name: '',
    alt: 'Unknown user',
  },
  parameters: { design: figmaNode('55-148') },
};

export const Sizes: Story = {
  render: () => ({
    components: { LlmAvatar },
    setup() { return { src: SAMPLE_SRC }; },
    template: `
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <LlmAvatar :src="src" size="xs" alt="xs" />
        <LlmAvatar :src="src" size="sm" alt="sm" />
        <LlmAvatar :src="src" size="md" alt="md" />
        <LlmAvatar :src="src" size="lg" alt="lg" />
        <LlmAvatar :src="src" size="xl" alt="xl" />
      </div>
    `,
  }),
};

export const SizesWithInitials: Story = {
  render: () => ({
    components: { LlmAvatar },
    template: `
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <LlmAvatar name="Jane Doe" size="xs" />
        <LlmAvatar name="Jane Doe" size="sm" />
        <LlmAvatar name="Jane Doe" size="md" />
        <LlmAvatar name="Jane Doe" size="lg" />
        <LlmAvatar name="Jane Doe" size="xl" />
      </div>
    `,
  }),
};

export const Shapes: Story = {
  render: () => ({
    components: { LlmAvatar },
    setup() { return { src: SAMPLE_SRC }; },
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar :src="src" shape="circle" size="lg" alt="Circle" />
          <span style="font-size:0.75rem;color:#64748b">circle</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar :src="src" shape="square" size="lg" alt="Square" />
          <span style="font-size:0.75rem;color:#64748b">square</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar name="John Smith" shape="circle" size="lg" />
          <span style="font-size:0.75rem;color:#64748b">circle + initials</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar name="John Smith" shape="square" size="lg" />
          <span style="font-size:0.75rem;color:#64748b">square + initials</span>
        </div>
      </div>
    `,
  }),
};

export const WithStatus: Story = {
  render: () => ({
    components: { LlmAvatar },
    setup() { return { src: SAMPLE_SRC }; },
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar :src="src" status="online" size="lg" alt="Online" />
          <span style="font-size:0.75rem;color:#64748b">online</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar :src="src" status="away" size="lg" alt="Away" />
          <span style="font-size:0.75rem;color:#64748b">away</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar :src="src" status="busy" size="lg" alt="Busy" />
          <span style="font-size:0.75rem;color:#64748b">busy</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar :src="src" status="offline" size="lg" alt="Offline" />
          <span style="font-size:0.75rem;color:#64748b">offline</span>
        </div>
      </div>
    `,
  }),
};

export const FallbackChain: Story = {
  render: () => ({
    components: { LlmAvatar },
    setup() { return { src: SAMPLE_SRC }; },
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar :src="src" name="Jane Doe" size="lg" alt="With image" />
          <span style="font-size:0.75rem;color:#64748b">image</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar name="Jane Doe" size="lg" />
          <span style="font-size:0.75rem;color:#64748b">initials</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <LlmAvatar size="lg" alt="Unknown user" />
          <span style="font-size:0.75rem;color:#64748b">icon</span>
        </div>
      </div>
    `,
  }),
};

export const AvatarGroup: Story = {
  parameters: { design: figmaNode('508-7221') },
  render: () => ({
    components: { LlmAvatar, LlmAvatarGroup },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <p style="font-size:0.75rem;color:#64748b;margin:0 0 0.5rem">4 of 4 visible (max=5)</p>
          <LlmAvatarGroup :max="5">
            <LlmAvatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
            <LlmAvatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
            <LlmAvatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
            <LlmAvatar src="https://i.pravatar.cc/150?img=4" alt="User 4" />
          </LlmAvatarGroup>
        </div>
        <div>
          <p style="font-size:0.75rem;color:#64748b;margin:0 0 0.5rem">3 visible + 3 overflow (max=3)</p>
          <LlmAvatarGroup :max="3">
            <LlmAvatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
            <LlmAvatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
            <LlmAvatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
            <LlmAvatar src="https://i.pravatar.cc/150?img=4" alt="User 4" />
            <LlmAvatar src="https://i.pravatar.cc/150?img=5" alt="User 5" />
            <LlmAvatar src="https://i.pravatar.cc/150?img=6" alt="User 6" />
          </LlmAvatarGroup>
        </div>
        <div>
          <p style="font-size:0.75rem;color:#64748b;margin:0 0 0.5rem">With initials, size sm</p>
          <LlmAvatarGroup :max="4" size="sm">
            <LlmAvatar name="Alice Brown" size="sm" />
            <LlmAvatar name="Bob Smith" size="sm" />
            <LlmAvatar name="Carol White" size="sm" />
            <LlmAvatar name="Dave Jones" size="sm" />
            <LlmAvatar name="Eve Davis" size="sm" />
          </LlmAvatarGroup>
        </div>
      </div>
    `,
  }),
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

export const Playground: Story = {
  args: {
    src: SAMPLE_SRC,
    alt: 'Playground avatar',
    name: 'John Doe',
    size: 'lg',
    shape: 'circle',
    status: 'online',
  },
};
