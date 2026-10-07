import { render, screen } from '@testing-library/vue';
import AtlBreadcrumbs from './atl-breadcrumbs.vue';
import AtlBreadcrumbItem from './atl-breadcrumb-item.vue';
import { covers } from '../../testing/behavior';

describe('AtlBreadcrumbs', () => {
  covers('breadcrumbs', 'nav-aria-label')(
    'renders a nav with aria-label',
    () => {
      render(AtlBreadcrumbs);
      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(nav).toBeInTheDocument();
    },
  );

  it('renders slot content inside an ol', () => {
    const { container } = render(AtlBreadcrumbs, {
      slots: { default: '<li>Home</li>' },
    });
    expect(container.querySelector('ol.breadcrumbs-list')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});

describe('AtlBreadcrumbs current', () => {
  const wrap = (template: string, data: object = {}) => ({
    components: { AtlBreadcrumbs, AtlBreadcrumbItem },
    setup: () => data,
    template: `<AtlBreadcrumbs>${template}</AtlBreadcrumbs>`,
  });

  it('defaults to the last item', () => {
    const { container } = render(
      wrap(`<AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
            <AtlBreadcrumbItem>B</AtlBreadcrumbItem>`),
    );
    const items = container.querySelectorAll('.atl-breadcrumb-item');
    expect(items[0]).not.toHaveClass('is-current');
    expect(items[1]).toHaveClass('is-current');
  });

  it('an explicit current on another item overrides the last-item default', () => {
    const { container } = render(
      wrap(`<AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
            <AtlBreadcrumbItem :current="true">B</AtlBreadcrumbItem>
            <AtlBreadcrumbItem href="/c">C</AtlBreadcrumbItem>`),
    );
    const items = container.querySelectorAll('.atl-breadcrumb-item');
    expect(items[0]).not.toHaveClass('is-current');
    expect(items[1]).toHaveClass('is-current');
    expect(items[2]).not.toHaveClass('is-current');
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'C' })).toHaveAttribute(
      'href',
      '/c',
    );
  });

  it(':current="false" on the last item leaves no current item', () => {
    const { container } = render(
      wrap(`<AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
            <AtlBreadcrumbItem href="/b" :current="false">B</AtlBreadcrumbItem>`),
    );
    expect(container.querySelector('.is-current')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-current]')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'B' })).toBeInTheDocument();
  });

  it('finds the last item in a v-for', () => {
    const { container } = render(
      wrap(
        `<AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
         <AtlBreadcrumbItem v-for="label in labels" :key="label">{{ label }}</AtlBreadcrumbItem>`,
        { labels: ['B', 'C'] },
      ),
    );
    const items = container.querySelectorAll('.atl-breadcrumb-item');
    expect(items).toHaveLength(3);
    expect(items[1]).not.toHaveClass('is-current');
    expect(items[2]).toHaveClass('is-current');
  });

  it('finds the last item behind a v-if', () => {
    const { container } = render(
      wrap(
        `<AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
         <AtlBreadcrumbItem>B</AtlBreadcrumbItem>
         <AtlBreadcrumbItem v-if="false">C</AtlBreadcrumbItem>`,
      ),
    );
    const items = container.querySelectorAll('.atl-breadcrumb-item');
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveClass('is-current');
  });
});

describe('AtlBreadcrumbItem', () => {
  covers('breadcrumbs', 'link-when-href')(
    'renders a link when href is provided and current is false',
    () => {
      render(AtlBreadcrumbItem, {
        props: { href: '/home' },
        slots: { default: 'Home' },
      });
      const link = screen.getByRole('link', { name: 'Home' });
      expect(link).toHaveAttribute('href', '/home');
    },
  );

  it('renders a span when current is true', () => {
    render(AtlBreadcrumbItem, {
      props: { href: '/page', current: true },
      slots: { default: 'Current' },
    });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const span = screen.getByText('Current');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveAttribute('aria-current', 'page');
    expect(span).toHaveClass('breadcrumb-current');
  });

  it('renders a span without aria-current when no href and not current', () => {
    render(AtlBreadcrumbItem, { slots: { default: 'Item' } });
    const span = screen.getByText('Item');
    expect(span.tagName).toBe('SPAN');
    expect(span).not.toHaveAttribute('aria-current');
    expect(span).toHaveClass('breadcrumb-text');
    expect(span).not.toHaveClass('breadcrumb-current');
  });

  covers('breadcrumbs', 'current-class')(
    'applies is-current class when current',
    () => {
      const { container } = render(AtlBreadcrumbItem, {
        props: { current: true },
      });
      expect(container.firstChild).toHaveClass('is-current');
    },
  );
});
