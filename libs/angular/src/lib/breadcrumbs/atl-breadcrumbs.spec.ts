/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen } from '@testing-library/angular';
import { AtlBreadcrumbs, AtlBreadcrumbItem } from './atl-breadcrumbs';
import { covers } from '../../testing/behavior';

const ALL_IMPORTS = [AtlBreadcrumbs, AtlBreadcrumbItem];

describe('AtlBreadcrumbs', () => {
  covers('breadcrumbs', 'nav-aria-label')(
    'renders a <nav> with aria-label="Breadcrumb"',
    async () => {
      const { container } = await render(
        `<atl-breadcrumbs><atl-breadcrumb-item>Home</atl-breadcrumb-item></atl-breadcrumbs>`,
        { imports: ALL_IMPORTS },
      );
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    },
  );

  it('renders an <ol> with role="list"', async () => {
    const { container } = await render(
      `<atl-breadcrumbs><atl-breadcrumb-item>Home</atl-breadcrumb-item></atl-breadcrumbs>`,
      { imports: ALL_IMPORTS },
    );
    const ol = container.querySelector('ol');
    expect(ol).toBeInTheDocument();
    expect(ol).toHaveAttribute('role', 'list');
  });

  it('keeps the static atl-breadcrumbs root class on the host', async () => {
    const { container } = await render(
      `<atl-breadcrumbs><atl-breadcrumb-item>Home</atl-breadcrumb-item></atl-breadcrumbs>`,
      { imports: ALL_IMPORTS },
    );
    expect(container.querySelector('atl-breadcrumbs')).toHaveClass(
      'atl-breadcrumbs',
    );
    expect(container.querySelector('nav > ol')).toHaveClass('breadcrumbs-list');
  });

  describe('AtlBreadcrumbItem', () => {
    covers('breadcrumbs', 'link-when-href')(
      'renders an <a href> for non-current items with href',
      async () => {
        const { container } = await render(
          `<atl-breadcrumbs>
          <atl-breadcrumb-item href="/home">Home</atl-breadcrumb-item>
          <atl-breadcrumb-item>Current</atl-breadcrumb-item>
        </atl-breadcrumbs>`,
          { imports: ALL_IMPORTS },
        );
        const link = container.querySelector('a[href="/home"]');
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent('Home');
      },
    );

    it('renders the last item as plain text, not as a link', async () => {
      // The current page is a <span aria-current="page">, as in React and Vue; an
      // <a> without an href is a link-shaped element that is not a link.
      const { container } = await render(
        `<atl-breadcrumbs>
          <atl-breadcrumb-item href="/home">Home</atl-breadcrumb-item>
          <atl-breadcrumb-item href="/current">Current</atl-breadcrumb-item>
        </atl-breadcrumbs>`,
        { imports: ALL_IMPORTS },
      );
      const items = container.querySelectorAll('atl-breadcrumb-item');
      const lastItem = items[items.length - 1];
      expect(lastItem.querySelector('a')).not.toBeInTheDocument();
      const text = lastItem.querySelector('span');
      expect(text).toHaveTextContent('Current');
      expect(text).toHaveAttribute('aria-current', 'page');
      expect(text).toHaveClass('breadcrumb-current');
    });

    it('renders a non-current item without an href as plain text, without aria-current', async () => {
      const { container } = await render(
        `<atl-breadcrumbs>
          <atl-breadcrumb-item>Middle</atl-breadcrumb-item>
          <atl-breadcrumb-item>Current</atl-breadcrumb-item>
        </atl-breadcrumbs>`,
        { imports: ALL_IMPORTS },
      );
      const first = container.querySelector('atl-breadcrumb-item') as Element;
      expect(first.querySelector('a')).not.toBeInTheDocument();
      expect(first.querySelector('span')).toHaveTextContent('Middle');
      expect(first.querySelector('span')).toHaveClass('breadcrumb-text');
      expect(first.querySelector('span')).not.toHaveClass('breadcrumb-current');
      expect(first.querySelector('[aria-current]')).not.toBeInTheDocument();
    });

    it('is the list item itself: a listitem that is a direct child of the <ol>', async () => {
      // No <li> inside the host and no element between the <ol> and the item, so the
      // shared stylesheet's child combinators match as they do in React and Vue.
      const { container } = await render(
        `<atl-breadcrumbs>
          <atl-breadcrumb-item href="/home">Home</atl-breadcrumb-item>
          <atl-breadcrumb-item>Current</atl-breadcrumb-item>
        </atl-breadcrumbs>`,
        { imports: ALL_IMPORTS },
      );
      const items = container.querySelectorAll('ol > atl-breadcrumb-item');
      expect(items).toHaveLength(2);
      items.forEach((item) => {
        expect(item).toHaveAttribute('role', 'listitem');
        expect(item).toHaveClass('atl-breadcrumb-item');
        expect(item.querySelector('li')).not.toBeInTheDocument();
      });
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('sets aria-current="page" on the last item', async () => {
      const { container } = await render(
        `<atl-breadcrumbs>
          <atl-breadcrumb-item href="/home">Home</atl-breadcrumb-item>
          <atl-breadcrumb-item>Products</atl-breadcrumb-item>
          <atl-breadcrumb-item>Widget</atl-breadcrumb-item>
        </atl-breadcrumbs>`,
        { imports: ALL_IMPORTS },
      );
      const items = container.querySelectorAll('atl-breadcrumb-item');
      expect(items[0].querySelector('[aria-current]')).not.toBeInTheDocument();
      expect(items[1].querySelector('[aria-current]')).not.toBeInTheDocument();
      expect(
        items[2].querySelector('[aria-current="page"]'),
      ).toBeInTheDocument();
    });

    it('does not set aria-current on non-last items', async () => {
      const { container } = await render(
        `<atl-breadcrumbs>
          <atl-breadcrumb-item href="/home">Home</atl-breadcrumb-item>
          <atl-breadcrumb-item>Current</atl-breadcrumb-item>
        </atl-breadcrumbs>`,
        { imports: ALL_IMPORTS },
      );
      const firstItem = container.querySelector('atl-breadcrumb-item');
      expect(
        firstItem!.querySelector('[aria-current]'),
      ).not.toBeInTheDocument();
    });

    covers('breadcrumbs', 'current-class')(
      'adds is-current class to host of last item',
      async () => {
        const { container } = await render(
          `<atl-breadcrumbs>
          <atl-breadcrumb-item>Home</atl-breadcrumb-item>
          <atl-breadcrumb-item>Current</atl-breadcrumb-item>
        </atl-breadcrumbs>`,
          { imports: ALL_IMPORTS },
        );
        const items = container.querySelectorAll('atl-breadcrumb-item');
        expect(items[0]).not.toHaveClass('is-current');
        expect(items[1]).toHaveClass('is-current');
      },
    );

    it('renders a single item as current', async () => {
      const { container } = await render(
        `<atl-breadcrumbs><atl-breadcrumb-item>Only</atl-breadcrumb-item></atl-breadcrumbs>`,
        { imports: ALL_IMPORTS },
      );
      const item = container.querySelector('atl-breadcrumb-item');
      expect(item).toHaveClass('is-current');
      expect(
        container.querySelector('[aria-current="page"]'),
      ).toBeInTheDocument();
    });

    it('renders projected content', async () => {
      await render(
        `<atl-breadcrumbs>
          <atl-breadcrumb-item href="/home">Home Page</atl-breadcrumb-item>
          <atl-breadcrumb-item>Current Page</atl-breadcrumb-item>
        </atl-breadcrumbs>`,
        { imports: ALL_IMPORTS },
      );
      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.getByText('Current Page')).toBeInTheDocument();
    });
  });
});
