import { render, screen } from '@testing-library/react';
import { covers } from '../../testing/behavior';
import { ATL_ICON_GEOMETRY } from '../icons';
import { AtlIcon } from './atl-icon';

describe('AtlIcon', () => {
  covers('icon', 'renders-geometry')('renders the geometry for the named icon', () => {
    const { container } = render(<AtlIcon name="success" />);
    const paths = [...container.querySelectorAll('.atl-icon svg path')].map((p) => p.getAttribute('d'));
    expect(paths).toEqual(ATL_ICON_GEOMETRY['success'].paths);
  });

  // Every name in the union must resolve to geometry — a missing entry would
  // render an empty svg rather than fail, which is how the Unicode map used to
  // hide gaps. See ADR-0046.
  it.each(Object.keys(ATL_ICON_GEOMETRY))('draws at least one path for %s', (name) => {
    const { container } = render(<AtlIcon name={name as keyof typeof ATL_ICON_GEOMETRY & never} />);
    expect(container.querySelectorAll('.atl-icon svg path').length).toBeGreaterThan(0);
  });

  it('paints stroke icons with currentColor and no fill, fill icons the other way round', () => {
    const stroke = render(<AtlIcon name="close" />).container.querySelector('svg');
    expect(stroke).toHaveAttribute('fill', 'none');
    expect(stroke).toHaveAttribute('stroke', 'currentColor');

    const filled = render(<AtlIcon name="person" />).container.querySelector('svg');
    expect(filled).toHaveAttribute('fill', 'currentColor');
    expect(filled).not.toHaveAttribute('stroke');
  });

  covers('icon', 'decorative-hidden')('is hidden from assistive tech by default', () => {
    const { container } = render(<AtlIcon name="info" />);
    const el = container.querySelector('.atl-icon');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).not.toHaveAttribute('role');
  });

  covers('icon', 'labelled-img')('exposes role=img and aria-label when label is provided', () => {
    render(<AtlIcon name="info" label="Information" />);
    const el = screen.getByRole('img', { name: 'Information' });
    expect(el).toBeInTheDocument();
    expect(el).not.toHaveAttribute('aria-hidden');
  });

  it('keeps the svg out of the accessibility tree and out of tab order', () => {
    const { container } = render(<AtlIcon name="info" label="Information" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', (size) => {
    const { container } = render(<AtlIcon name="success" size={size} />);
    expect(container.querySelector('.atl-icon')).toHaveClass(`size-${size}`);
  });
});
