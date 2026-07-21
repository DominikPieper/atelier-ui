import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlAvatar from './atl-avatar.vue';
import AtlAvatarGroup from './atl-avatar-group.vue';

import { metadata } from '@atelier-ui/spec/metadata/avatar.metadata';
const SAMPLE_SRC = 'https://i.pravatar.cc/150?img=1';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlAvatar> = {
  title: 'Components/Display/AtlAvatar',
  component: AtlAvatar,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlAvatar },
    setup() { return { args }; },
    template: '<AtlAvatar v-bind="args" />',
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlAvatar>;

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
    components: { AtlAvatar },
    setup() { return { src: SAMPLE_SRC }; },
    template: `
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <AtlAvatar :src="src" size="xs" alt="xs" />
        <AtlAvatar :src="src" size="sm" alt="sm" />
        <AtlAvatar :src="src" size="md" alt="md" />
        <AtlAvatar :src="src" size="lg" alt="lg" />
        <AtlAvatar :src="src" size="xl" alt="xl" />
      </div>
    `,
  }),
};

export const SizesWithInitials: Story = {
  render: () => ({
    components: { AtlAvatar },
    template: `
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <AtlAvatar name="Jane Doe" size="xs" />
        <AtlAvatar name="Jane Doe" size="sm" />
        <AtlAvatar name="Jane Doe" size="md" />
        <AtlAvatar name="Jane Doe" size="lg" />
        <AtlAvatar name="Jane Doe" size="xl" />
      </div>
    `,
  }),
};

export const Shapes: Story = {
  render: () => ({
    components: { AtlAvatar },
    setup() { return { src: SAMPLE_SRC }; },
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar :src="src" shape="circle" size="lg" alt="Circle" />
          <span style="font-size:0.75rem;color:#64748b">circle</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar :src="src" shape="square" size="lg" alt="Square" />
          <span style="font-size:0.75rem;color:#64748b">square</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar name="John Smith" shape="circle" size="lg" />
          <span style="font-size:0.75rem;color:#64748b">circle + initials</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar name="John Smith" shape="square" size="lg" />
          <span style="font-size:0.75rem;color:#64748b">square + initials</span>
        </div>
      </div>
    `,
  }),
};

export const WithStatus: Story = {
  render: () => ({
    components: { AtlAvatar },
    setup() { return { src: SAMPLE_SRC }; },
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar :src="src" status="online" size="lg" alt="Online" />
          <span style="font-size:0.75rem;color:#64748b">online</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar :src="src" status="away" size="lg" alt="Away" />
          <span style="font-size:0.75rem;color:#64748b">away</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar :src="src" status="busy" size="lg" alt="Busy" />
          <span style="font-size:0.75rem;color:#64748b">busy</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar :src="src" status="offline" size="lg" alt="Offline" />
          <span style="font-size:0.75rem;color:#64748b">offline</span>
        </div>
      </div>
    `,
  }),
};

export const FallbackChain: Story = {
  render: () => ({
    components: { AtlAvatar },
    setup() { return { src: SAMPLE_SRC }; },
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar :src="src" name="Jane Doe" size="lg" alt="With image" />
          <span style="font-size:0.75rem;color:#64748b">image</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar name="Jane Doe" size="lg" />
          <span style="font-size:0.75rem;color:#64748b">initials</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <AtlAvatar size="lg" alt="Unknown user" />
          <span style="font-size:0.75rem;color:#64748b">icon</span>
        </div>
      </div>
    `,
  }),
};

export const AvatarGroup: Story = {
  parameters: { design: figmaNode('508-7221') },
  render: () => ({
    components: { AtlAvatar, AtlAvatarGroup },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <p style="font-size:0.75rem;color:#64748b;margin:0 0 0.5rem">4 of 4 visible (max=5)</p>
          <AtlAvatarGroup :max="5">
            <AtlAvatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
            <AtlAvatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
            <AtlAvatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
            <AtlAvatar src="https://i.pravatar.cc/150?img=4" alt="User 4" />
          </AtlAvatarGroup>
        </div>
        <div>
          <p style="font-size:0.75rem;color:#64748b;margin:0 0 0.5rem">3 visible + 3 overflow (max=3)</p>
          <AtlAvatarGroup :max="3">
            <AtlAvatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
            <AtlAvatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
            <AtlAvatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
            <AtlAvatar src="https://i.pravatar.cc/150?img=4" alt="User 4" />
            <AtlAvatar src="https://i.pravatar.cc/150?img=5" alt="User 5" />
            <AtlAvatar src="https://i.pravatar.cc/150?img=6" alt="User 6" />
          </AtlAvatarGroup>
        </div>
        <div>
          <p style="font-size:0.75rem;color:#64748b;margin:0 0 0.5rem">With initials, size sm</p>
          <AtlAvatarGroup :max="4" size="sm">
            <AtlAvatar name="Alice Brown" size="sm" />
            <AtlAvatar name="Bob Smith" size="sm" />
            <AtlAvatar name="Carol White" size="sm" />
            <AtlAvatar name="Dave Jones" size="sm" />
            <AtlAvatar name="Eve Davis" size="sm" />
          </AtlAvatarGroup>
        </div>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlAvatar },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div style="display:flex;gap:1rem;align-items:center">
          <AtlAvatar name="Alice Smith" size="xs" />
          <AtlAvatar name="Bob Jones" size="sm" />
          <AtlAvatar name="Carol Davis" size="md" />
          <AtlAvatar name="Dave Wilson" size="lg" />
          <AtlAvatar name="Eve Brown" size="xl" />
        </div>
        <div style="display:flex;gap:1rem;align-items:center">
          <AtlAvatar name="Circle" shape="circle" size="md" />
          <AtlAvatar name="Square" shape="square" size="md" />
        </div>
        <div style="display:flex;gap:1rem;align-items:center">
          <AtlAvatar name="Online" status="online" />
          <AtlAvatar name="Offline" status="offline" />
          <AtlAvatar name="Away" status="away" />
          <AtlAvatar name="Busy" status="busy" />
        </div>
        <div style="display:flex;gap:1rem;align-items:center">
          <AtlAvatar />
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
