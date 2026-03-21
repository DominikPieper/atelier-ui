import { render, screen } from '@testing-library/vue';
import LlmCard from './llm-card.vue';
import LlmCardHeader from './llm-card-header.vue';
import LlmCardContent from './llm-card-content.vue';
import LlmCardFooter from './llm-card-footer.vue';

describe('LlmCard', () => {
  it('renders slot content', () => {
    render(LlmCard, { slots: { default: 'Card body' } });
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    const { container } = render(LlmCard, { props: { variant: 'outlined' } });
    expect(container.firstChild).toHaveClass('variant-outlined');
  });

  it('applies padding class', () => {
    const { container } = render(LlmCard, { props: { padding: 'lg' } });
    expect(container.firstChild).toHaveClass('padding-lg');
  });

  it('defaults to elevated variant and md padding', () => {
    const { container } = render(LlmCard);
    expect(container.firstChild).toHaveClass('llm-card', 'variant-elevated', 'padding-md');
  });
});

describe('LlmCardHeader', () => {
  it('renders slot content', () => {
    render(LlmCardHeader, { slots: { default: 'Header text' } });
    expect(screen.getByText('Header text')).toBeInTheDocument();
  });

  it('has llm-card-header class', () => {
    const { container } = render(LlmCardHeader);
    expect(container.firstChild).toHaveClass('llm-card-header');
  });
});

describe('LlmCardContent', () => {
  it('renders slot content', () => {
    render(LlmCardContent, { slots: { default: 'Content text' } });
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  it('has llm-card-content class', () => {
    const { container } = render(LlmCardContent);
    expect(container.firstChild).toHaveClass('llm-card-content');
  });
});

describe('LlmCardFooter', () => {
  it('renders slot content', () => {
    render(LlmCardFooter, { slots: { default: 'Footer text' } });
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('has llm-card-footer class', () => {
    const { container } = render(LlmCardFooter);
    expect(container.firstChild).toHaveClass('llm-card-footer');
  });
});
