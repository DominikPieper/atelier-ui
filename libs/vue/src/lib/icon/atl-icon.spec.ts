import { render, screen } from '@testing-library/vue';
import { covers } from '../../testing/behavior';
import AtlIcon from './atl-icon.vue';

describe('AtlIcon', () => {
  covers('icon', 'renders-glyph')('renders the glyph for the named icon', () => {
    render(AtlIcon, { props: { name: 'success' } });
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it.each([
    ['success', '✓'],
    ['warning', '⚠'],
    ['danger', '✕'],
    ['info', 'ℹ'],
    ['close', '×'],
  ] as const)('renders %s as %s', (name, glyph) => {
    render(AtlIcon, { props: { name } });
    expect(screen.getByText(glyph)).toBeInTheDocument();
  });

  covers('icon', 'decorative-hidden')('is hidden from assistive tech by default', () => {
    render(AtlIcon, { props: { name: 'info' } });
    const el = screen.getByText('ℹ');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).not.toHaveAttribute('role');
  });

  covers('icon', 'labelled-img')('exposes role=img and aria-label when label is provided', () => {
    render(AtlIcon, { props: { name: 'info', label: 'Information' } });
    const el = screen.getByRole('img', { name: 'Information' });
    expect(el).toBeInTheDocument();
    expect(el).not.toHaveAttribute('aria-hidden');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', (size) => {
    render(AtlIcon, { props: { name: 'success', size } });
    expect(screen.getByText('✓')).toHaveClass(`size-${size}`);
  });
});
