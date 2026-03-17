import { render, screen } from '@testing-library/react';
import { LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter } from './llm-card';

describe('LlmCard', () => {
  it('renders without error', () => {
    render(<LlmCard>Content</LlmCard>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies llm-card class', () => {
    const { container } = render(<LlmCard>C</LlmCard>);
    expect(container.firstChild).toHaveClass('llm-card');
  });

  it('defaults to elevated variant', () => {
    const { container } = render(<LlmCard>C</LlmCard>);
    expect(container.firstChild).toHaveClass('variant-elevated');
  });

  it('defaults to md padding', () => {
    const { container } = render(<LlmCard>C</LlmCard>);
    expect(container.firstChild).toHaveClass('padding-md');
  });

  it.each(['elevated', 'outlined', 'flat'] as const)('applies variant-%s class', (variant) => {
    const { container } = render(<LlmCard variant={variant}>C</LlmCard>);
    expect(container.firstChild).toHaveClass(`variant-${variant}`);
  });

  it.each(['none', 'sm', 'md', 'lg'] as const)('applies padding-%s class', (padding) => {
    const { container } = render(<LlmCard padding={padding}>C</LlmCard>);
    expect(container.firstChild).toHaveClass(`padding-${padding}`);
  });

  it('renders sub-components', () => {
    render(
      <LlmCard>
        <LlmCardHeader>Header</LlmCardHeader>
        <LlmCardContent>Body</LlmCardContent>
        <LlmCardFooter>Footer</LlmCardFooter>
      </LlmCard>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('LlmCardHeader applies llm-card-header class', () => {
    const { container } = render(<LlmCardHeader>H</LlmCardHeader>);
    expect(container.firstChild).toHaveClass('llm-card-header');
  });

  it('LlmCardContent applies llm-card-content class', () => {
    const { container } = render(<LlmCardContent>C</LlmCardContent>);
    expect(container.firstChild).toHaveClass('llm-card-content');
  });

  it('LlmCardFooter applies llm-card-footer class', () => {
    const { container } = render(<LlmCardFooter>F</LlmCardFooter>);
    expect(container.firstChild).toHaveClass('llm-card-footer');
  });

  it('forwards additional className', () => {
    const { container } = render(<LlmCard className="custom">C</LlmCard>);
    expect(container.firstChild).toHaveClass('custom');
  });
});
