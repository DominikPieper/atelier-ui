import { render, screen } from '@testing-library/angular';
import { covers } from '../../testing/behavior';
import { AtlIcon } from './atl-icon';

describe('AtlIcon', () => {
  covers('icon', 'renders-glyph')('renders the glyph for the named icon', async () => {
    await render('<atl-icon name="success" />', { imports: [AtlIcon] });
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it.each([
    ['success', '✓'],
    ['warning', '⚠'],
    ['danger', '✕'],
    ['info', 'ℹ'],
    ['close', '×'],
  ] as const)('renders %s as %s', async (name, glyph) => {
    await render(`<atl-icon name="${name}" />`, { imports: [AtlIcon] });
    expect(screen.getByText(glyph)).toBeInTheDocument();
  });

  covers('icon', 'decorative-hidden')('is hidden from assistive tech by default (decorative)', async () => {
    const { container } = await render('<atl-icon name="info" />', { imports: [AtlIcon] });
    const host = container.querySelector('atl-icon');
    expect(host).toHaveAttribute('aria-hidden', 'true');
    expect(host).not.toHaveAttribute('role');
  });

  covers('icon', 'labelled-img')('exposes role=img and aria-label when label is provided', async () => {
    const { container } = await render(
      '<atl-icon name="info" label="Information" />',
      { imports: [AtlIcon] }
    );
    const host = container.querySelector('atl-icon');
    expect(host).toHaveAttribute('role', 'img');
    expect(host).toHaveAttribute('aria-label', 'Information');
    expect(host).not.toHaveAttribute('aria-hidden');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', async (size) => {
    const { container } = await render(
      `<atl-icon name="success" size="${size}" />`,
      { imports: [AtlIcon] }
    );
    expect(container.querySelector('atl-icon')).toHaveClass(`size-${size}`);
  });
});
