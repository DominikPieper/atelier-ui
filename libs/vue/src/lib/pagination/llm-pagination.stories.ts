import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import LlmPagination from './llm-pagination.vue';

const meta: Meta<typeof LlmPagination> = {
  title: 'Components/LlmPagination',
  component: LlmPagination,
  tags: ['autodocs'],
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
};

export default meta;
type Story = StoryObj<typeof LlmPagination>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmPagination },
    setup() {
      const page = ref(args.page ?? 1);
      return { args, page };
    },
    template: '<LlmPagination v-bind="args" :page="page" @pageChange="page = $event" />',
  }),
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
