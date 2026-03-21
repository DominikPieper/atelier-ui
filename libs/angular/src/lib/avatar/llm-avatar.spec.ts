/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-condition */
import { render, screen, fireEvent } from '@testing-library/angular';
import { LlmAvatar, LlmAvatarGroup } from './llm-avatar';

describe('LlmAvatar', () => {
  it('renders without error with default inputs', async () => {
    const { container } = await render('<llm-avatar />', { imports: [LlmAvatar] });
    expect(container.querySelector('llm-avatar')).toBeInTheDocument();
  });

  it('has role="img" on host', async () => {
    const { container } = await render('<llm-avatar />', { imports: [LlmAvatar] });
    expect(container.querySelector('llm-avatar')).toHaveAttribute('role', 'img');
  });

  it('uses alt as aria-label', async () => {
    const { container } = await render(
      '<llm-avatar alt="Profile photo" />',
      { imports: [LlmAvatar] }
    );
    expect(container.querySelector('llm-avatar')).toHaveAttribute('aria-label', 'Profile photo');
  });

  it('falls back to name for aria-label when no alt', async () => {
    const { container } = await render(
      '<llm-avatar name="Jane Doe" />',
      { imports: [LlmAvatar] }
    );
    expect(container.querySelector('llm-avatar')).toHaveAttribute('aria-label', 'Jane Doe');
  });

  it('defaults aria-label to "Avatar" when no alt or name', async () => {
    const { container } = await render('<llm-avatar />', { imports: [LlmAvatar] });
    expect(container.querySelector('llm-avatar')).toHaveAttribute('aria-label', 'Avatar');
  });

  describe('content fallback', () => {
    it('renders an img when src is provided', async () => {
      const { container } = await render(
        '<llm-avatar src="https://example.com/photo.jpg" alt="User" />',
        { imports: [LlmAvatar] }
      );
      expect(container.querySelector('img')).toBeInTheDocument();
      expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    it('shows initials derived from name when no src', async () => {
      await render('<llm-avatar name="John Doe" />', { imports: [LlmAvatar] });
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('uses only first letter when name is a single word', async () => {
      await render('<llm-avatar name="Alice" />', { imports: [LlmAvatar] });
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('uses at most 2 initials from name', async () => {
      await render('<llm-avatar name="Anna Beth Carol" />', { imports: [LlmAvatar] });
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('shows icon SVG when neither src nor name is given', async () => {
      const { container } = await render('<llm-avatar />', { imports: [LlmAvatar] });
      expect(container.querySelector('svg.icon')).toBeInTheDocument();
    });

    it('falls back to initials after image load error', async () => {
      const { container } = await render(
        '<llm-avatar src="broken.jpg" name="Jane Doe" />',
        { imports: [LlmAvatar] }
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
          `<llm-avatar size="${size}" />`,
          { imports: [LlmAvatar] }
        );
        expect(container.querySelector('llm-avatar')).toHaveClass(`size-${size}`);
      }
    );
  });

  describe('shape classes', () => {
    it.each(['circle', 'square'] as const)(
      'applies shape-%s class to host',
      async (shape) => {
        const { container } = await render(
          `<llm-avatar shape="${shape}" />`,
          { imports: [LlmAvatar] }
        );
        expect(container.querySelector('llm-avatar')).toHaveClass(`shape-${shape}`);
      }
    );
  });

  describe('status dot', () => {
    it('renders status dot when status is set', async () => {
      const { container } = await render(
        '<llm-avatar status="online" />',
        { imports: [LlmAvatar] }
      );
      expect(container.querySelector('.status-dot')).toBeInTheDocument();
      expect(container.querySelector('.status-dot')).toHaveClass('status-online');
    });

    it.each(['online', 'offline', 'away', 'busy'] as const)(
      'applies status-%s class to dot',
      async (status) => {
        const { container } = await render(
          `<llm-avatar status="${status}" />`,
          { imports: [LlmAvatar] }
        );
        expect(container.querySelector('.status-dot')).toHaveClass(`status-${status}`);
      }
    );

    it('does not render status dot when status is empty', async () => {
      const { container } = await render('<llm-avatar />', { imports: [LlmAvatar] });
      expect(container.querySelector('.status-dot')).not.toBeInTheDocument();
    });
  });
});

describe('LlmAvatarGroup', () => {
  it('renders all avatars when count is within max', async () => {
    const { container } = await render(
      `<llm-avatar-group [max]="5">
        <llm-avatar name="A" />
        <llm-avatar name="B" />
        <llm-avatar name="C" />
      </llm-avatar-group>`,
      { imports: [LlmAvatarGroup, LlmAvatar] }
    );
    expect(container.querySelectorAll('llm-avatar').length).toBe(3);
    expect(container.querySelector('.overflow-badge')).not.toBeInTheDocument();
  });

  it('hides overflow avatars and shows +N badge', async () => {
    const { container } = await render(
      `<llm-avatar-group [max]="2">
        <llm-avatar name="A" />
        <llm-avatar name="B" />
        <llm-avatar name="C" />
        <llm-avatar name="D" />
      </llm-avatar-group>`,
      { imports: [LlmAvatarGroup, LlmAvatar] }
    );
    expect(container.querySelector('.overflow-badge')).toBeInTheDocument();
    expect(container.querySelector('.overflow-badge')?.textContent?.trim()).toBe('+2');
  });

  it('has group class on host', async () => {
    const { container } = await render(
      '<llm-avatar-group />',
      { imports: [LlmAvatarGroup] }
    );
    expect(container.querySelector('llm-avatar-group')).toHaveClass('group');
  });
});
