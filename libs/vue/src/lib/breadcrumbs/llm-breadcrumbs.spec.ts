import { render, screen } from '@testing-library/vue';
import LlmBreadcrumbs from './llm-breadcrumbs.vue';
import LlmBreadcrumbItem from './llm-breadcrumb-item.vue';

describe('LlmBreadcrumbs', () => {
  it('renders a nav with aria-label', () => {
    render(LlmBreadcrumbs);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();
  });

  it('renders slot content inside an ol', () => {
    const { container } = render(LlmBreadcrumbs, {
      slots: { default: '<li>Home</li>' },
    });
    expect(container.querySelector('ol.breadcrumbs-list')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});

describe('LlmBreadcrumbItem', () => {
  it('renders a link when href is provided and current is false', () => {
    render(LlmBreadcrumbItem, {
      props: { href: '/home' },
      slots: { default: 'Home' },
    });
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders a span when current is true', () => {
    render(LlmBreadcrumbItem, {
      props: { href: '/page', current: true },
      slots: { default: 'Current' },
    });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const span = screen.getByText('Current');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveAttribute('aria-current', 'page');
  });

  it('renders a span without aria-current when no href and not current', () => {
    render(LlmBreadcrumbItem, { slots: { default: 'Item' } });
    const span = screen.getByText('Item');
    expect(span.tagName).toBe('SPAN');
    expect(span).not.toHaveAttribute('aria-current');
  });

  it('applies is-current class when current', () => {
    const { container } = render(LlmBreadcrumbItem, { props: { current: true } });
    expect(container.firstChild).toHaveClass('is-current');
  });
});
