import { fireEvent, render, screen } from '@testing-library/react';
import { AtlButton } from '@atelier-ui/react';

// A working pattern to copy: same purpose as atl-button.stories.tsx, but for
// a plain jsdom unit test (`npx nx test workshop-react`) rather than a
// browser-rendered story — the loop for anything that is not itself a
// story: a hook, a helper, a piece of app logic.
describe('AtlButton', () => {
  it('renders with its accessible name', () => {
    render(<AtlButton>Click me</AtlButton>);
    expect(
      screen.getByRole('button', { name: 'Click me' }),
    ).toBeInTheDocument();
  });

  it('fires its click handler when clicked', () => {
    const onClick = vi.fn();
    render(<AtlButton onClick={onClick}>Click me</AtlButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
