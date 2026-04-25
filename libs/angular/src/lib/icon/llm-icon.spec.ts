import { render, screen } from '@testing-library/angular';
import { LlmIcon } from './llm-icon';

describe('LlmIcon', () => {
  it('renders the glyph for the named icon', async () => {
    await render('<llm-icon name="success" />', { imports: [LlmIcon] });
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it.each([
    ['success', '✓'],
    ['warning', '⚠'],
    ['danger', '✕'],
    ['info', 'ℹ'],
    ['close', '×'],
  ] as const)('renders %s as %s', async (name, glyph) => {
    await render(`<llm-icon name="${name}" />`, { imports: [LlmIcon] });
    expect(screen.getByText(glyph)).toBeInTheDocument();
  });

  it('is hidden from assistive tech by default (decorative)', async () => {
    const { container } = await render('<llm-icon name="info" />', { imports: [LlmIcon] });
    const host = container.querySelector('llm-icon');
    expect(host).toHaveAttribute('aria-hidden', 'true');
    expect(host).not.toHaveAttribute('role');
  });

  it('exposes role=img and aria-label when label is provided', async () => {
    const { container } = await render(
      '<llm-icon name="info" label="Information" />',
      { imports: [LlmIcon] }
    );
    const host = container.querySelector('llm-icon');
    expect(host).toHaveAttribute('role', 'img');
    expect(host).toHaveAttribute('aria-label', 'Information');
    expect(host).not.toHaveAttribute('aria-hidden');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', async (size) => {
    const { container } = await render(
      `<llm-icon name="success" size="${size}" />`,
      { imports: [LlmIcon] }
    );
    expect(container.querySelector('llm-icon')).toHaveClass(`size-${size}`);
  });
});
