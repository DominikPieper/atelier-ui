import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LlmPagination } from './llm-pagination';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmPagination> = {
  title: 'Components/LlmPagination',
  component: LlmPagination,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('3-1048'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmPagination>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return <LlmPagination page={page} pageCount={10} onPageChange={setPage} />;
  },
  parameters: { design: figmaNode('55-142') },
};

export const MiddlePage: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return <LlmPagination page={page} pageCount={10} onPageChange={setPage} />;
  },
  parameters: { design: figmaNode('55-143') },
};

export const LastPage: Story = {
  render: () => {
    const [page, setPage] = useState(10);
    return <LlmPagination page={page} pageCount={10} onPageChange={setPage} />;
  },
};

export const FewPages: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return <LlmPagination page={page} pageCount={3} onPageChange={setPage} />;
  },
};

export const WithoutFirstLast: Story = {
  render: () => {
    const [page, setPage] = useState(3);
    return (
      <LlmPagination page={page} pageCount={10} showFirstLast={false} onPageChange={setPage} />
    );
  },
};

export const WideSiblingCount: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return <LlmPagination page={page} pageCount={20} siblingCount={2} onPageChange={setPage} />;
  },
};
