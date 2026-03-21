import { render, screen } from '@testing-library/react';
import { LlmAvatar, LlmAvatarGroup } from './llm-avatar';

describe('LlmAvatar', () => {
  it('renders image when src is provided', () => {
    render(<LlmAvatar src="https://example.com/photo.jpg" alt="Jane Doe" />);
    expect(screen.getByAltText('Jane Doe')).toBeInTheDocument();
  });

  it('shows initials when no src', () => {
    render(<LlmAvatar name="John Smith" />);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('shows single initial for single-word name', () => {
    render(<LlmAvatar name="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('applies size-%s class', (size) => {
    const { container } = render(<LlmAvatar size={size} name="Test" />);
    expect(container.firstChild).toHaveClass(`size-${size}`);
  });

  it.each(['circle', 'square'] as const)('applies shape-%s class', (shape) => {
    const { container } = render(<LlmAvatar shape={shape} name="Test" />);
    expect(container.firstChild).toHaveClass(`shape-${shape}`);
  });

  it('has role="img"', () => {
    render(<LlmAvatar name="Test User" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('uses name as aria-label when no alt provided', () => {
    render(<LlmAvatar name="Jane Doe" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Jane Doe');
  });

  it('uses "Avatar" as aria-label fallback when no src, alt, or name', () => {
    render(<LlmAvatar />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Avatar');
  });
});

describe('LlmAvatarGroup', () => {
  it('shows all avatars when count is within max', () => {
    const { container } = render(
      <LlmAvatarGroup max={3}>
        <LlmAvatar name="Alice" />
        <LlmAvatar name="Bob" />
      </LlmAvatarGroup>
    );
    expect(container.querySelectorAll('.llm-avatar')).toHaveLength(2);
  });

  it('shows overflow badge when avatars exceed max', () => {
    render(
      <LlmAvatarGroup max={2}>
        <LlmAvatar name="Alice" />
        <LlmAvatar name="Bob" />
        <LlmAvatar name="Carol" />
      </LlmAvatarGroup>
    );
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('does not show overflow badge when count equals max', () => {
    const { container } = render(
      <LlmAvatarGroup max={2}>
        <LlmAvatar name="Alice" />
        <LlmAvatar name="Bob" />
      </LlmAvatarGroup>
    );
    expect(container.querySelector('.overflow-badge')).not.toBeInTheDocument();
  });
});
