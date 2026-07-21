import { render, screen } from '@testing-library/react';
import { AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter } from './atl-card';
import { covers } from '../../testing/behavior';

describe('AtlCard', () => {
  covers('card', 'renders-content')('renders without error', () => {
    render(<AtlCard>Content</AtlCard>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies atl-card class', () => {
    const { container } = render(<AtlCard>C</AtlCard>);
    expect(container.firstChild).toHaveClass('atl-card');
  });

  it('defaults to elevated variant', () => {
    const { container } = render(<AtlCard>C</AtlCard>);
    expect(container.firstChild).toHaveClass('variant-elevated');
  });

  it('defaults to md padding', () => {
    const { container } = render(<AtlCard>C</AtlCard>);
    expect(container.firstChild).toHaveClass('padding-md');
  });

  it.each(['elevated', 'outlined', 'flat'] as const)('applies variant-%s class', (variant) => {
    const { container } = render(<AtlCard variant={variant}>C</AtlCard>);
    expect(container.firstChild).toHaveClass(`variant-${variant}`);
  });

  it.each(['none', 'sm', 'md', 'lg'] as const)('applies padding-%s class', (padding) => {
    const { container } = render(<AtlCard padding={padding}>C</AtlCard>);
    expect(container.firstChild).toHaveClass(`padding-${padding}`);
  });

  it('renders sub-components', () => {
    render(
      <AtlCard>
        <AtlCardHeader>Header</AtlCardHeader>
        <AtlCardContent>Body</AtlCardContent>
        <AtlCardFooter>Footer</AtlCardFooter>
      </AtlCard>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  covers('card', 'header-subcomponent')('AtlCardHeader applies atl-card-header class', () => {
    const { container } = render(<AtlCardHeader>H</AtlCardHeader>);
    expect(container.firstChild).toHaveClass('atl-card-header');
  });

  covers('card', 'content-subcomponent')('AtlCardContent applies atl-card-content class', () => {
    const { container } = render(<AtlCardContent>C</AtlCardContent>);
    expect(container.firstChild).toHaveClass('atl-card-content');
  });

  covers('card', 'footer-subcomponent')('AtlCardFooter applies atl-card-footer class', () => {
    const { container } = render(<AtlCardFooter>F</AtlCardFooter>);
    expect(container.firstChild).toHaveClass('atl-card-footer');
  });

  it('forwards additional className', () => {
    const { container } = render(<AtlCard className="custom">C</AtlCard>);
    expect(container.firstChild).toHaveClass('custom');
  });
});
