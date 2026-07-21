import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtlPagination } from './atl-pagination';

import { metadata } from '@atelier-ui/spec/metadata/pagination.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlPagination> = {
  title: 'Components/Navigation/AtlPagination',
  component: AtlPagination,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-145'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlPagination>;

export const Default: Story = {
  render: function Render() {
    const [page, setPage] = useState(1);
    return <AtlPagination page={page} pageCount={10} onPageChange={setPage} />;
  },
  parameters: { design: figmaNode('55-142') },
};

export const MiddlePage: Story = {
  render: function Render() {
    const [page, setPage] = useState(5);
    return <AtlPagination page={page} pageCount={10} onPageChange={setPage} />;
  },
  parameters: { design: figmaNode('55-143') },
};

export const LastPage: Story = {
  render: function Render() {
    const [page, setPage] = useState(10);
    return <AtlPagination page={page} pageCount={10} onPageChange={setPage} />;
  },
  parameters: { design: figmaNode('55-144') },
};

export const FewPages: Story = {
  render: function Render() {
    const [page, setPage] = useState(1);
    return <AtlPagination page={page} pageCount={3} onPageChange={setPage} />;
  },
};

export const WithoutFirstLast: Story = {
  render: function Render() {
    const [page, setPage] = useState(3);
    return (
      <AtlPagination page={page} pageCount={10} showFirstLast={false} onPageChange={setPage} />
    );
  },
};

export const WideSiblingCount: Story = {
  render: function Render() {
    const [page, setPage] = useState(5);
    return <AtlPagination page={page} pageCount={20} siblingCount={2} onPageChange={setPage} />;
  },
};
