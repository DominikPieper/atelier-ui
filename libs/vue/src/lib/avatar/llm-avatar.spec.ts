import { render, screen } from '@testing-library/vue';
import LlmAvatar from './llm-avatar.vue';
import LlmAvatarGroup from './llm-avatar-group.vue';

describe('LlmAvatar', () => {
  it('renders with initials when name is provided and no src', () => {
    render(LlmAvatar, { props: { name: 'Jane Doe' } });
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders icon placeholder when no src or name', () => {
    const { container } = render(LlmAvatar);
    expect(container.querySelector('.icon')).toBeInTheDocument();
  });

  it('uses name as aria-label', () => {
    render(LlmAvatar, { props: { name: 'Alice' } });
    expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument();
  });

  it('uses alt as aria-label when both provided', () => {
    render(LlmAvatar, { props: { name: 'Alice', alt: 'Alice profile picture' } });
    expect(screen.getByRole('img', { name: 'Alice profile picture' })).toBeInTheDocument();
  });

  it('applies size and shape classes', () => {
    const { container } = render(LlmAvatar, { props: { size: 'lg', shape: 'square' } });
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('size-lg', 'shape-square');
  });

  it('renders status dot when status is provided', () => {
    const { container } = render(LlmAvatar, { props: { name: 'Bob', status: 'online' } });
    expect(container.querySelector('.status-dot.status-online')).toBeInTheDocument();
  });
});

describe('LlmAvatarGroup', () => {
  it('renders visible children up to max', () => {
    const { container } = render(LlmAvatarGroup, {
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
    const { container } = render(LlmAvatarGroup, {
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
    const { container } = render(LlmAvatarGroup, {
      props: { size: 'lg' },
      slots: { default: '<div>A</div>' },
    });
    expect(container.firstChild).toHaveClass('size-lg');
  });
});
