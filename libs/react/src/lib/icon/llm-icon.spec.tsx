import { render, screen } from '@testing-library/react';
import { LlmIcon } from './llm-icon';

describe('LlmIcon', () => {
  it('renders the glyph for the named icon', () => {
    render(<LlmIcon name="success" />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it.each([
    ['success', '✓'],
    ['warning', '⚠'],
    ['danger', '✕'],
    ['info', 'ℹ'],
    ['close', '×'],
  ] as const)('renders glyph %s as %s', (name, glyph) => {
    render(<LlmIcon name={name} />);
    expect(screen.getByText(glyph)).toBeInTheDocument();
  });

  it('is hidden from assistive tech by default', () => {
    render(<LlmIcon name="info" />);
    const el = screen.getByText('ℹ');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).not.toHaveAttribute('role');
  });

  it('exposes role=img and aria-label when label is provided', () => {
    render(<LlmIcon name="info" label="Information" />);
    const el = screen.getByRole('img', { name: 'Information' });
    expect(el).toBeInTheDocument();
    expect(el).not.toHaveAttribute('aria-hidden');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', (size) => {
    render(<LlmIcon name="success" size={size} />);
    expect(screen.getByText('✓')).toHaveClass(`size-${size}`);
  });
});
