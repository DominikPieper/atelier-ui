import { render, screen } from '@testing-library/vue';
import AtlBreadcrumbs from './atl-breadcrumbs.vue';
import AtlBreadcrumbItem from './atl-breadcrumb-item.vue';
import { covers } from '../../testing/behavior';

describe('AtlBreadcrumbs', () => {
  covers('breadcrumbs', 'nav-aria-label')('renders a nav with aria-label', () => {
    render(AtlBreadcrumbs);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();
  });

  it('renders slot content inside an ol', () => {
    const { container } = render(AtlBreadcrumbs, {
      slots: { default: '<li>Home</li>' },
    });
    expect(container.querySelector('ol.breadcrumbs-list')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});

describe('AtlBreadcrumbItem', () => {
  covers('breadcrumbs', 'link-when-href')('renders a link when href is provided and current is false', () => {
    render(AtlBreadcrumbItem, {
      props: { href: '/home' },
      slots: { default: 'Home' },
    });
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders a span when current is true', () => {
    render(AtlBreadcrumbItem, {
      props: { href: '/page', current: true },
      slots: { default: 'Current' },
    });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const span = screen.getByText('Current');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveAttribute('aria-current', 'page');
  });

  it('renders a span without aria-current when no href and not current', () => {
    render(AtlBreadcrumbItem, { slots: { default: 'Item' } });
    const span = screen.getByText('Item');
    expect(span.tagName).toBe('SPAN');
    expect(span).not.toHaveAttribute('aria-current');
  });

  covers('breadcrumbs', 'current-class')('applies is-current class when current', () => {
    const { container } = render(AtlBreadcrumbItem, { props: { current: true } });
    expect(container.firstChild).toHaveClass('is-current');
  });
});
