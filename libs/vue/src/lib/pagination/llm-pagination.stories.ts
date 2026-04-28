import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmPagination from './llm-pagination.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmPagination> = {
  title: 'Components/Navigation/LlmPagination',
  component: LlmPagination,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmPagination },
    setup() {
      const page = ref(args.page ?? 1);
      return { args, page };
    },
    template: `
      <LlmPagination v-bind="args" :page="page" @pageChange="page = $event" />
      <p style="margin-top:1rem;font-size:0.875rem;color:var(--ui-color-text-muted)">
        Current page: {{ page }}
      </p>
    `,
  }),
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    pageCount: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
    showFirstLast: { control: 'boolean' },
  },
  args: {
    page: 1,
    pageCount: 10,
    siblingCount: 1,
    showFirstLast: true,
  },
  parameters: {
    design: figmaNode('55-145'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmPagination>;

export const Default: Story = {
  parameters: { design: figmaNode('55-142') },
};

export const MiddlePage: Story = {
  args: { page: 5, pageCount: 10 },
  parameters: { design: figmaNode('55-143') },
};

export const FewPages: Story = {
  args: { page: 2, pageCount: 3 },
};

export const ManyPages: Story = {
  args: { page: 50, pageCount: 100, siblingCount: 2 },
};

export const NoFirstLast: Story = {
  args: { page: 5, pageCount: 10, showFirstLast: false },
};

export const SinglePage: Story = {
  args: { page: 1, pageCount: 1 },
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmPagination },
    setup() {
      const page1 = ref(1);
      const page2 = ref(5);
      const page3 = ref(3);
      return { page1, page2, page3 };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <p style="margin-bottom:0.5rem">First page</p>
          <LlmPagination :page="page1" :pageCount="10" @pageChange="page1 = $event" />
        </div>
        <div>
          <p style="margin-bottom:0.5rem">Middle page</p>
          <LlmPagination :page="page2" :pageCount="10" @pageChange="page2 = $event" />
        </div>
        <div>
          <p style="margin-bottom:0.5rem">No first/last buttons</p>
          <LlmPagination :page="page3" :pageCount="10" :showFirstLast="false" @pageChange="page3 = $event" />
        </div>
      </div>
    `,
  }),
};
