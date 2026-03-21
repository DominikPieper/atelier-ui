import type { Meta, StoryObj } from '@storybook/vue3';
import LlmBreadcrumbs from './llm-breadcrumbs.vue';
import LlmBreadcrumbItem from './llm-breadcrumb-item.vue';

const meta: Meta<typeof LlmBreadcrumbs> = {
  title: 'Components/LlmBreadcrumbs',
  component: LlmBreadcrumbs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LlmBreadcrumbs>;

export const Default: Story = {
  render: () => ({
    components: { LlmBreadcrumbs, LlmBreadcrumbItem },
    template: `
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/products">Products</LlmBreadcrumbItem>
        <LlmBreadcrumbItem :current="true">Widget Pro</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    `,
  }),
};

export const SingleItem: Story = {
  render: () => ({
    components: { LlmBreadcrumbs, LlmBreadcrumbItem },
    template: `
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem :current="true">Home</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    `,
  }),
};

export const DeepNavigation: Story = {
  render: () => ({
    components: { LlmBreadcrumbs, LlmBreadcrumbItem },
    template: `
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/admin">Admin</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/admin/users">Users</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/admin/users/42">John Doe</LlmBreadcrumbItem>
        <LlmBreadcrumbItem :current="true">Edit</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    `,
  }),
};
