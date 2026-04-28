import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LlmPagination } from './llm-pagination';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmPagination> = {
  title: 'Components/Navigation/LlmPagination',
  component: LlmPagination,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-145'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmPagination>;

export const Default: Story = {
  render: function Render() {
    const [page, setPage] = useState(1);
    return <LlmPagination page={page} pageCount={10} onPageChange={setPage} />;
  },
  parameters: { design: figmaNode('55-142') },
};

export const MiddlePage: Story = {
  render: function Render() {
    const [page, setPage] = useState(5);
    return <LlmPagination page={page} pageCount={10} onPageChange={setPage} />;
  },
  parameters: { design: figmaNode('55-143') },
};

export const LastPage: Story = {
  render: function Render() {
    const [page, setPage] = useState(10);
    return <LlmPagination page={page} pageCount={10} onPageChange={setPage} />;
  },
  parameters: { design: figmaNode('55-144') },
};

export const FewPages: Story = {
  render: function Render() {
    const [page, setPage] = useState(1);
    return <LlmPagination page={page} pageCount={3} onPageChange={setPage} />;
  },
};

export const WithoutFirstLast: Story = {
  render: function Render() {
    const [page, setPage] = useState(3);
    return (
      <LlmPagination page={page} pageCount={10} showFirstLast={false} onPageChange={setPage} />
    );
  },
};

export const WideSiblingCount: Story = {
  render: function Render() {
    const [page, setPage] = useState(5);
    return <LlmPagination page={page} pageCount={20} siblingCount={2} onPageChange={setPage} />;
  },
};
