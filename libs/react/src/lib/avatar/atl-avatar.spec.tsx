import { render, screen } from '@testing-library/react';
import { covers } from '../../testing/behavior';
import { AtlAvatar, AtlAvatarGroup } from './atl-avatar';

describe('AtlAvatar', () => {
  covers('avatar', 'img-when-src')('renders image when src is provided', () => {
    render(<AtlAvatar src="https://example.com/photo.jpg" alt="Jane Doe" />);
    expect(screen.getByAltText('Jane Doe')).toBeInTheDocument();
  });

  covers('avatar', 'icon-when-empty')('shows icon placeholder when no src or name', () => {
    const { container } = render(<AtlAvatar />);
    expect(container.querySelector('svg.icon')).toBeInTheDocument();
  });

  covers('avatar', 'initials-when-no-src')('shows initials when no src', () => {
    render(<AtlAvatar name="John Smith" />);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('shows single initial for single-word name', () => {
    render(<AtlAvatar name="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('applies size-%s class', (size) => {
    const { container } = render(<AtlAvatar size={size} name="Test" />);
    expect(container.firstChild).toHaveClass(`size-${size}`);
  });

  it.each(['circle', 'square'] as const)('applies shape-%s class', (shape) => {
    const { container } = render(<AtlAvatar shape={shape} name="Test" />);
    expect(container.firstChild).toHaveClass(`shape-${shape}`);
  });

  it('has role="img"', () => {
    render(<AtlAvatar name="Test User" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  covers('avatar', 'aria-label-from-name')('uses name as aria-label when no alt provided', () => {
    render(<AtlAvatar name="Jane Doe" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Jane Doe');
  });

  it('uses "Avatar" as aria-label fallback when no src, alt, or name', () => {
    render(<AtlAvatar />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Avatar');
  });
});

describe('AtlAvatarGroup', () => {
  it('shows all avatars when count is within max', () => {
    const { container } = render(
      <AtlAvatarGroup max={3}>
        <AtlAvatar name="Alice" />
        <AtlAvatar name="Bob" />
      </AtlAvatarGroup>
    );
    expect(container.querySelectorAll('.atl-avatar')).toHaveLength(2);
  });

  it('shows overflow badge when avatars exceed max', () => {
    render(
      <AtlAvatarGroup max={2}>
        <AtlAvatar name="Alice" />
        <AtlAvatar name="Bob" />
        <AtlAvatar name="Carol" />
      </AtlAvatarGroup>
    );
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('does not show overflow badge when count equals max', () => {
    const { container } = render(
      <AtlAvatarGroup max={2}>
        <AtlAvatar name="Alice" />
        <AtlAvatar name="Bob" />
      </AtlAvatarGroup>
    );
    expect(container.querySelector('.overflow-badge')).not.toBeInTheDocument();
  });
});
