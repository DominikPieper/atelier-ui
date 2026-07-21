import { render, screen } from '@testing-library/vue';
import AtlAvatar from './atl-avatar.vue';
import AtlAvatarGroup from './atl-avatar-group.vue';
import { covers } from '../../testing/behavior';

describe('AtlAvatar', () => {
  covers('avatar', 'initials-when-no-src')('renders with initials when name is provided and no src', () => {
    render(AtlAvatar, { props: { name: 'Jane Doe' } });
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  covers('avatar', 'img-when-src')('renders an img when src is provided', () => {
    const { container } = render(AtlAvatar, {
      props: { src: 'https://example.com/photo.jpg', alt: 'Jane' },
    });
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  covers('avatar', 'icon-when-empty')('renders icon placeholder when no src or name', () => {
    const { container } = render(AtlAvatar);
    expect(container.querySelector('.icon')).toBeInTheDocument();
  });

  covers('avatar', 'aria-label-from-name')('uses name as aria-label', () => {
    render(AtlAvatar, { props: { name: 'Alice' } });
    expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument();
  });

  it('uses alt as aria-label when both provided', () => {
    render(AtlAvatar, { props: { name: 'Alice', alt: 'Alice profile picture' } });
    expect(screen.getByRole('img', { name: 'Alice profile picture' })).toBeInTheDocument();
  });

  it('applies size and shape classes', () => {
    const { container } = render(AtlAvatar, { props: { size: 'lg', shape: 'square' } });
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('size-lg', 'shape-square');
  });

  it('renders status dot when status is provided', () => {
    const { container } = render(AtlAvatar, { props: { name: 'Bob', status: 'online' } });
    expect(container.querySelector('.status-dot.status-online')).toBeInTheDocument();
  });
});

describe('AtlAvatarGroup', () => {
  it('renders visible children up to max', () => {
    const { container } = render(AtlAvatarGroup, {
      props: { max: 2 },
      slots: {
        default: `
          <div class="avatar-1">A1</div>
          <div class="avatar-2">A2</div>
          <div class="avatar-3">A3</div>
        `,
      },
    });
    // The group should render the overflow badge
    expect(container.querySelector('.overflow-badge')).toBeInTheDocument();
    expect(container.querySelector('.overflow-badge')?.textContent?.trim()).toBe('+1');
  });

  it('does not render overflow badge when children count is within max', () => {
    const { container } = render(AtlAvatarGroup, {
      props: { max: 5 },
      slots: {
        default: `
          <div>A1</div>
          <div>A2</div>
        `,
      },
    });
    expect(container.querySelector('.overflow-badge')).not.toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(AtlAvatarGroup, {
      props: { size: 'lg' },
      slots: { default: '<div>A</div>' },
    });
    expect(container.firstChild).toHaveClass('size-lg');
  });
});
