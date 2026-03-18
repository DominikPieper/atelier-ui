import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmAvatar, LlmAvatarGroup } from './llm-avatar';

const SAMPLE_SRC = 'https://i.pravatar.cc/150?img=1';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmAvatar> = {
  title: 'Components/LlmAvatar',
  component: LlmAvatar,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-avatar ${argsToTemplate(args)} />`,
  }),
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
    },
    status: {
      control: 'select',
      options: ['', 'online', 'offline', 'away', 'busy'],
    },
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
    design: figmaNode('3-930'),
  },
};

export default meta;
type Story = StoryObj<LlmAvatar>;

export const Default: Story = {};

export const WithInitials: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-avatar ${argsToTemplate(args)} />`,
  }),
  args: {
    src: '',
    name: 'Jane Doe',
  },
};

export const WithIcon: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-avatar ${argsToTemplate(args)} />`,
  }),
  args: {
    src: '',
    name: '',
    alt: 'Unknown user',
  },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <llm-avatar src="${SAMPLE_SRC}" size="xs" alt="xs" />
        <llm-avatar src="${SAMPLE_SRC}" size="sm" alt="sm" />
        <llm-avatar src="${SAMPLE_SRC}" size="md" alt="md" />
        <llm-avatar src="${SAMPLE_SRC}" size="lg" alt="lg" />
        <llm-avatar src="${SAMPLE_SRC}" size="xl" alt="xl" />
      </div>
    `,
  }),
};

export const SizesWithInitials: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <llm-avatar name="Jane Doe" size="xs" />
        <llm-avatar name="Jane Doe" size="sm" />
        <llm-avatar name="Jane Doe" size="md" />
        <llm-avatar name="Jane Doe" size="lg" />
        <llm-avatar name="Jane Doe" size="xl" />
      </div>
    `,
  }),
};

export const Shapes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 1.5rem;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar src="${SAMPLE_SRC}" shape="circle" size="lg" alt="Circle" />
          <span style="font-size: 0.75rem; color: #64748b;">circle</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar src="${SAMPLE_SRC}" shape="square" size="lg" alt="Square" />
          <span style="font-size: 0.75rem; color: #64748b;">square</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar name="John Smith" shape="circle" size="lg" />
          <span style="font-size: 0.75rem; color: #64748b;">circle + initials</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar name="John Smith" shape="square" size="lg" />
          <span style="font-size: 0.75rem; color: #64748b;">square + initials</span>
        </div>
      </div>
    `,
  }),
};

export const WithStatus: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 1.5rem;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar src="${SAMPLE_SRC}" status="online" size="lg" alt="Online" />
          <span style="font-size: 0.75rem; color: #64748b;">online</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar src="${SAMPLE_SRC}" status="away" size="lg" alt="Away" />
          <span style="font-size: 0.75rem; color: #64748b;">away</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar src="${SAMPLE_SRC}" status="busy" size="lg" alt="Busy" />
          <span style="font-size: 0.75rem; color: #64748b;">busy</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar src="${SAMPLE_SRC}" status="offline" size="lg" alt="Offline" />
          <span style="font-size: 0.75rem; color: #64748b;">offline</span>
        </div>
      </div>
    `,
  }),
};

export const FallbackChain: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 1.5rem;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar src="${SAMPLE_SRC}" name="Jane Doe" size="lg" alt="With image" />
          <span style="font-size: 0.75rem; color: #64748b;">image</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar name="Jane Doe" size="lg" />
          <span style="font-size: 0.75rem; color: #64748b;">initials</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <llm-avatar size="lg" alt="Unknown user" />
          <span style="font-size: 0.75rem; color: #64748b;">icon</span>
        </div>
      </div>
    `,
  }),
};

export const AvatarGroup: Story = {
  render: () => ({
    imports: [LlmAvatarGroup],
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <p style="font-size: 0.75rem; color: #64748b; margin: 0 0 0.5rem;">4 of 4 visible (max=5)</p>
          <llm-avatar-group [max]="5">
            <llm-avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
            <llm-avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
            <llm-avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
            <llm-avatar src="https://i.pravatar.cc/150?img=4" alt="User 4" />
          </llm-avatar-group>
        </div>
        <div>
          <p style="font-size: 0.75rem; color: #64748b; margin: 0 0 0.5rem;">3 visible + 3 overflow (max=3)</p>
          <llm-avatar-group [max]="3">
            <llm-avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
            <llm-avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
            <llm-avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
            <llm-avatar src="https://i.pravatar.cc/150?img=4" alt="User 4" />
            <llm-avatar src="https://i.pravatar.cc/150?img=5" alt="User 5" />
            <llm-avatar src="https://i.pravatar.cc/150?img=6" alt="User 6" />
          </llm-avatar-group>
        </div>
        <div>
          <p style="font-size: 0.75rem; color: #64748b; margin: 0 0 0.5rem;">With initials, size sm</p>
          <llm-avatar-group [max]="4" size="sm">
            <llm-avatar name="Alice Brown" size="sm" />
            <llm-avatar name="Bob Smith" size="sm" />
            <llm-avatar name="Carol White" size="sm" />
            <llm-avatar name="Dave Jones" size="sm" />
            <llm-avatar name="Eve Davis" size="sm" />
          </llm-avatar-group>
        </div>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-avatar ${argsToTemplate(args)} />`,
  }),
  args: {
    src: SAMPLE_SRC,
    alt: 'Playground avatar',
    name: 'John Doe',
    size: 'lg',
    shape: 'circle',
    status: 'online',
  },
};
