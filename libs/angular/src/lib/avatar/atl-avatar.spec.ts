/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-condition */
import { render, screen, fireEvent } from '@testing-library/angular';
import { AtlAvatar, AtlAvatarGroup } from './atl-avatar';
import { covers } from '../../testing/behavior';

describe('AtlAvatar', () => {
  it('renders without error with default inputs', async () => {
    const { container } = await render('<atl-avatar />', { imports: [AtlAvatar] });
    expect(container.querySelector('atl-avatar')).toBeInTheDocument();
  });

  it('has role="img" on host', async () => {
    const { container } = await render('<atl-avatar />', { imports: [AtlAvatar] });
    expect(container.querySelector('atl-avatar')).toHaveAttribute('role', 'img');
  });

  it('uses alt as aria-label', async () => {
    const { container } = await render(
      '<atl-avatar alt="Profile photo" />',
      { imports: [AtlAvatar] }
    );
    expect(container.querySelector('atl-avatar')).toHaveAttribute('aria-label', 'Profile photo');
  });

  covers('avatar', 'aria-label-from-name')('falls back to name for aria-label when no alt', async () => {
    const { container } = await render(
      '<atl-avatar name="Jane Doe" />',
      { imports: [AtlAvatar] }
    );
    expect(container.querySelector('atl-avatar')).toHaveAttribute('aria-label', 'Jane Doe');
  });

  it('defaults aria-label to "Avatar" when no alt or name', async () => {
    const { container } = await render('<atl-avatar />', { imports: [AtlAvatar] });
    expect(container.querySelector('atl-avatar')).toHaveAttribute('aria-label', 'Avatar');
  });

  describe('content fallback', () => {
    covers('avatar', 'img-when-src')('renders an img when src is provided', async () => {
      const { container } = await render(
        '<atl-avatar src="https://example.com/photo.jpg" alt="User" />',
        { imports: [AtlAvatar] }
      );
      expect(container.querySelector('img')).toBeInTheDocument();
      expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    covers('avatar', 'initials-when-no-src')('shows initials derived from name when no src', async () => {
      await render('<atl-avatar name="John Doe" />', { imports: [AtlAvatar] });
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('uses only first letter when name is a single word', async () => {
      await render('<atl-avatar name="Alice" />', { imports: [AtlAvatar] });
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('uses at most 2 initials from name', async () => {
      await render('<atl-avatar name="Anna Beth Carol" />', { imports: [AtlAvatar] });
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    covers('avatar', 'icon-when-empty')('shows icon SVG when neither src nor name is given', async () => {
      const { container } = await render('<atl-avatar />', { imports: [AtlAvatar] });
      expect(container.querySelector('svg.icon')).toBeInTheDocument();
    });

    it('falls back to initials after image load error', async () => {
      const { container } = await render(
        '<atl-avatar src="broken.jpg" name="Jane Doe" />',
        { imports: [AtlAvatar] }
      );
      const img = container.querySelector('img')!;
      fireEvent.error(img);
      // After error, img should be gone and initials shown
      expect(container.querySelector('img')).not.toBeInTheDocument();
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('size classes', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
      'applies size-%s class to host',
      async (size) => {
        const { container } = await render(
          `<atl-avatar size="${size}" />`,
          { imports: [AtlAvatar] }
        );
        expect(container.querySelector('atl-avatar')).toHaveClass(`size-${size}`);
      }
    );
  });

  describe('shape classes', () => {
    it.each(['circle', 'square'] as const)(
      'applies shape-%s class to host',
      async (shape) => {
        const { container } = await render(
          `<atl-avatar shape="${shape}" />`,
          { imports: [AtlAvatar] }
        );
        expect(container.querySelector('atl-avatar')).toHaveClass(`shape-${shape}`);
      }
    );
  });

  describe('status dot', () => {
    it('renders status dot when status is set', async () => {
      const { container } = await render(
        '<atl-avatar status="online" />',
        { imports: [AtlAvatar] }
      );
      expect(container.querySelector('.status-dot')).toBeInTheDocument();
      expect(container.querySelector('.status-dot')).toHaveClass('status-online');
    });

    it.each(['online', 'offline', 'away', 'busy'] as const)(
      'applies status-%s class to dot',
      async (status) => {
        const { container } = await render(
          `<atl-avatar status="${status}" />`,
          { imports: [AtlAvatar] }
        );
        expect(container.querySelector('.status-dot')).toHaveClass(`status-${status}`);
      }
    );

    it('does not render status dot when status is empty', async () => {
      const { container } = await render('<atl-avatar />', { imports: [AtlAvatar] });
      expect(container.querySelector('.status-dot')).not.toBeInTheDocument();
    });
  });
});

describe('AtlAvatarGroup', () => {
  it('renders all avatars when count is within max', async () => {
    const { container } = await render(
      `<atl-avatar-group [max]="5">
        <atl-avatar name="A" />
        <atl-avatar name="B" />
        <atl-avatar name="C" />
      </atl-avatar-group>`,
      { imports: [AtlAvatarGroup, AtlAvatar] }
    );
    expect(container.querySelectorAll('atl-avatar').length).toBe(3);
    expect(container.querySelector('.overflow-badge')).not.toBeInTheDocument();
  });

  it('hides overflow avatars and shows +N badge', async () => {
    const { container } = await render(
      `<atl-avatar-group [max]="2">
        <atl-avatar name="A" />
        <atl-avatar name="B" />
        <atl-avatar name="C" />
        <atl-avatar name="D" />
      </atl-avatar-group>`,
      { imports: [AtlAvatarGroup, AtlAvatar] }
    );
    expect(container.querySelector('.overflow-badge')).toBeInTheDocument();
    expect(container.querySelector('.overflow-badge')?.textContent?.trim()).toBe('+2');
  });

  it('has group class on host', async () => {
    const { container } = await render(
      '<atl-avatar-group />',
      { imports: [AtlAvatarGroup] }
    );
    expect(container.querySelector('atl-avatar-group')).toHaveClass('group');
  });
});
