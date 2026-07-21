import { render, screen } from '@testing-library/vue';
import { covers } from '../../testing/behavior';
import AtlCard from './atl-card.vue';
import AtlCardHeader from './atl-card-header.vue';
import AtlCardContent from './atl-card-content.vue';
import AtlCardFooter from './atl-card-footer.vue';

describe('AtlCard', () => {
  covers('card', 'renders-content')('renders slot content', () => {
    render(AtlCard, { slots: { default: 'Card body' } });
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    const { container } = render(AtlCard, { props: { variant: 'outlined' } });
    expect(container.firstChild).toHaveClass('variant-outlined');
  });

  it('applies padding class', () => {
    const { container } = render(AtlCard, { props: { padding: 'lg' } });
    expect(container.firstChild).toHaveClass('padding-lg');
  });

  it('defaults to elevated variant and md padding', () => {
    const { container } = render(AtlCard);
    expect(container.firstChild).toHaveClass('atl-card', 'variant-elevated', 'padding-md');
  });
});

describe('AtlCardHeader', () => {
  it('renders slot content', () => {
    render(AtlCardHeader, { slots: { default: 'Header text' } });
    expect(screen.getByText('Header text')).toBeInTheDocument();
  });

  covers('card', 'header-subcomponent')('has atl-card-header class', () => {
    const { container } = render(AtlCardHeader);
    expect(container.firstChild).toHaveClass('atl-card-header');
  });
});

describe('AtlCardContent', () => {
  it('renders slot content', () => {
    render(AtlCardContent, { slots: { default: 'Content text' } });
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  covers('card', 'content-subcomponent')('has atl-card-content class', () => {
    const { container } = render(AtlCardContent);
    expect(container.firstChild).toHaveClass('atl-card-content');
  });
});

describe('AtlCardFooter', () => {
  it('renders slot content', () => {
    render(AtlCardFooter, { slots: { default: 'Footer text' } });
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  covers('card', 'footer-subcomponent')('has atl-card-footer class', () => {
    const { container } = render(AtlCardFooter);
    expect(container.firstChild).toHaveClass('atl-card-footer');
  });
});
