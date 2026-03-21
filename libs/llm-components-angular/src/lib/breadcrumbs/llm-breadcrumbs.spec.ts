/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen } from '@testing-library/angular';
import { LlmBreadcrumbs, LlmBreadcrumbItem } from './llm-breadcrumbs';

const ALL_IMPORTS = [LlmBreadcrumbs, LlmBreadcrumbItem];

describe('LlmBreadcrumbs', () => {
  it('renders a <nav> with aria-label="Breadcrumb"', async () => {
    const { container } = await render(
      `<llm-breadcrumbs><llm-breadcrumb-item>Home</llm-breadcrumb-item></llm-breadcrumbs>`,
      { imports: ALL_IMPORTS }
    );
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('renders an <ol> with role="list"', async () => {
    const { container } = await render(
      `<llm-breadcrumbs><llm-breadcrumb-item>Home</llm-breadcrumb-item></llm-breadcrumbs>`,
      { imports: ALL_IMPORTS }
    );
    const ol = container.querySelector('ol');
    expect(ol).toBeInTheDocument();
    expect(ol).toHaveAttribute('role', 'list');
  });

  describe('LlmBreadcrumbItem', () => {
    it('renders an <a href> for non-current items with href', async () => {
      const { container } = await render(
        `<llm-breadcrumbs>
          <llm-breadcrumb-item href="/home">Home</llm-breadcrumb-item>
          <llm-breadcrumb-item>Current</llm-breadcrumb-item>
        </llm-breadcrumbs>`,
        { imports: ALL_IMPORTS }
      );
      const link = container.querySelector('a[href="/home"]');
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('Home');
    });

    it('renders an <a> without href for the last item', async () => {
      const { container } = await render(
        `<llm-breadcrumbs>
          <llm-breadcrumb-item href="/home">Home</llm-breadcrumb-item>
          <llm-breadcrumb-item href="/current">Current</llm-breadcrumb-item>
        </llm-breadcrumbs>`,
        { imports: ALL_IMPORTS }
      );
      const items = container.querySelectorAll('llm-breadcrumb-item');
      const lastItem = items[items.length - 1];
      const anchor = lastItem.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor).not.toHaveAttribute('href');
    });

    it('sets aria-current="page" on the last item', async () => {
      const { container } = await render(
        `<llm-breadcrumbs>
          <llm-breadcrumb-item href="/home">Home</llm-breadcrumb-item>
          <llm-breadcrumb-item>Products</llm-breadcrumb-item>
          <llm-breadcrumb-item>Widget</llm-breadcrumb-item>
        </llm-breadcrumbs>`,
        { imports: ALL_IMPORTS }
      );
      const items = container.querySelectorAll('llm-breadcrumb-item');
      expect(items[0].querySelector('[aria-current]')).not.toBeInTheDocument();
      expect(items[1].querySelector('[aria-current]')).not.toBeInTheDocument();
      expect(items[2].querySelector('[aria-current="page"]')).toBeInTheDocument();
    });

    it('does not set aria-current on non-last items', async () => {
      const { container } = await render(
        `<llm-breadcrumbs>
          <llm-breadcrumb-item href="/home">Home</llm-breadcrumb-item>
          <llm-breadcrumb-item>Current</llm-breadcrumb-item>
        </llm-breadcrumbs>`,
        { imports: ALL_IMPORTS }
      );
      const firstItem = container.querySelector('llm-breadcrumb-item');
      expect(firstItem!.querySelector('[aria-current]')).not.toBeInTheDocument();
    });

    it('adds is-current class to host of last item', async () => {
      const { container } = await render(
        `<llm-breadcrumbs>
          <llm-breadcrumb-item>Home</llm-breadcrumb-item>
          <llm-breadcrumb-item>Current</llm-breadcrumb-item>
        </llm-breadcrumbs>`,
        { imports: ALL_IMPORTS }
      );
      const items = container.querySelectorAll('llm-breadcrumb-item');
      expect(items[0]).not.toHaveClass('is-current');
      expect(items[1]).toHaveClass('is-current');
    });

    it('renders a single item as current', async () => {
      const { container } = await render(
        `<llm-breadcrumbs><llm-breadcrumb-item>Only</llm-breadcrumb-item></llm-breadcrumbs>`,
        { imports: ALL_IMPORTS }
      );
      const item = container.querySelector('llm-breadcrumb-item');
      expect(item).toHaveClass('is-current');
      expect(container.querySelector('[aria-current="page"]')).toBeInTheDocument();
    });

    it('renders projected content', async () => {
      await render(
        `<llm-breadcrumbs>
          <llm-breadcrumb-item href="/home">Home Page</llm-breadcrumb-item>
          <llm-breadcrumb-item>Current Page</llm-breadcrumb-item>
        </llm-breadcrumbs>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.getByText('Current Page')).toBeInTheDocument();
    });
  });
});
