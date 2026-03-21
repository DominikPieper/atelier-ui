import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { expect, userEvent } from 'storybook/test';
import { LlmPagination } from './llm-pagination';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmPagination> = {
  title: 'Components/LlmPagination',
  component: LlmPagination,
  tags: ['autodocs'],
  argTypes: {
    page: { control: 'number' },
    pageCount: { control: 'number' },
    siblingCount: { control: 'number' },
    showFirstLast: { control: 'boolean' },
  },
  args: {
    page: 1,
    pageCount: 10,
    siblingCount: 1,
    showFirstLast: true,
  },
  parameters: {
    design: figmaNode('3-1048'),
  },
};

export default meta;
type Story = StoryObj<LlmPagination>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, page: signal(args.page ?? 1) },
    imports: [LlmPagination],
    template: `
      <llm-pagination
        [(page)]="page"
        [pageCount]="pageCount"
        [siblingCount]="siblingCount"
        [showFirstLast]="showFirstLast"
      />
      <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">
        Current page: {{ page() }}
      </p>
    `,
  }),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
  parameters: { design: figmaNode('55-142') },
};

export const MiddlePage: Story = {
  render: (args) => ({
    props: { ...args, page: signal(5) },
    imports: [LlmPagination],
    template: `
      <llm-pagination [(page)]="page" [pageCount]="pageCount" [siblingCount]="siblingCount" [showFirstLast]="showFirstLast" />
    `,
  }),
  args: { page: 5, pageCount: 10 },
  parameters: { design: figmaNode('55-143') },
};

export const FewPages: Story = {
  render: (args) => ({
    props: { ...args, page: signal(2) },
    imports: [LlmPagination],
    template: `
      <llm-pagination [(page)]="page" [pageCount]="pageCount" [siblingCount]="siblingCount" [showFirstLast]="showFirstLast" />
    `,
  }),
  args: { page: 2, pageCount: 3 },
};

export const ManyPages: Story = {
  render: (args) => ({
    props: { ...args, page: signal(50) },
    imports: [LlmPagination],
    template: `
      <llm-pagination [(page)]="page" [pageCount]="pageCount" [siblingCount]="siblingCount" [showFirstLast]="showFirstLast" />
    `,
  }),
  args: { page: 50, pageCount: 100, siblingCount: 2 },
};

export const NoFirstLast: Story = {
  render: (args) => ({
    props: { ...args, page: signal(5) },
    imports: [LlmPagination],
    template: `
      <llm-pagination [(page)]="page" [pageCount]="pageCount" [siblingCount]="siblingCount" [showFirstLast]="false" />
    `,
  }),
  args: { page: 5, pageCount: 10, showFirstLast: false },
};

export const SinglePage: Story = {
  render: () => ({
    props: { page: signal(1) },
    imports: [LlmPagination],
    template: `<llm-pagination [(page)]="page" [pageCount]="1" />`,
  }),
};
