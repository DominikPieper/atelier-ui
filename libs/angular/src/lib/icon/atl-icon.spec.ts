import { render } from '@testing-library/angular';
import { covers } from '../../testing/behavior';
import { ATL_ICON_GEOMETRY } from '../icons';
import { AtlIcon } from './atl-icon';

describe('AtlIcon', () => {
  covers('icon', 'renders-geometry')('renders the geometry for the named icon', async () => {
    const { container } = await render('<atl-icon name="success" />', { imports: [AtlIcon] });
    const paths = [...container.querySelectorAll('atl-icon svg path')].map((p) => p.getAttribute('d'));
    expect(paths).toEqual(ATL_ICON_GEOMETRY['success'].paths);
  });

  // Every name in the union must resolve to geometry — a missing entry would
  // render an empty svg rather than fail, which is how the Unicode map used to
  // hide gaps. See ADR-0046.
  it.each(Object.keys(ATL_ICON_GEOMETRY))('draws at least one path for %s', async (name) => {
    const { container } = await render(`<atl-icon name="${name}" />`, { imports: [AtlIcon] });
    expect(container.querySelectorAll('atl-icon svg path').length).toBeGreaterThan(0);
  });

  // Two tests, not one: Angular Testing Library instantiates the TestBed on the
  // first render(), so a second render() in the same test throws.
  it('paints stroke icons with currentColor and no fill', async () => {
    const { container } = await render('<atl-icon name="close" />', { imports: [AtlIcon] });
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
  });

  it('paints fill icons with currentColor and no stroke', async () => {
    const { container } = await render('<atl-icon name="person" />', { imports: [AtlIcon] });
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).not.toHaveAttribute('stroke');
  });

  covers('icon', 'decorative-hidden')('is hidden from assistive tech by default (decorative)', async () => {
    const { container } = await render('<atl-icon name="info" />', { imports: [AtlIcon] });
    const host = container.querySelector('atl-icon');
    expect(host).toHaveAttribute('aria-hidden', 'true');
    expect(host).not.toHaveAttribute('role');
  });

  covers('icon', 'labelled-img')('exposes role=img and aria-label when label is provided', async () => {
    const { container } = await render('<atl-icon name="info" label="Information" />', {
      imports: [AtlIcon],
    });
    const host = container.querySelector('atl-icon');
    expect(host).toHaveAttribute('role', 'img');
    expect(host).toHaveAttribute('aria-label', 'Information');
    expect(host).not.toHaveAttribute('aria-hidden');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', async (size) => {
    const { container } = await render(`<atl-icon name="success" size="${size}" />`, {
      imports: [AtlIcon],
    });
    expect(container.querySelector('atl-icon')).toHaveClass(`size-${size}`);
  });
});
