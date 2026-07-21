import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtlToastProvider, AtlToastContainer, useAtlToast } from './atl-toast';
import { covers } from '../../testing/behavior';

function TestHarness({ position = 'bottom-right' as const }) {
  const { show } = useAtlToast();
  return (
    <>
      <button onClick={() => show('Hello world')}>Show default</button>
      <button onClick={() => show('Success!', { variant: 'success' })}>Show success</button>
      <button onClick={() => show('Danger!', { variant: 'danger' })}>Show danger</button>
      <button onClick={() => show('No dismiss', { dismissible: false })}>Show non-dismissible</button>
      <AtlToastContainer position={position} />
    </>
  );
}

function renderWithProvider(ui = <TestHarness />) {
  return render(<AtlToastProvider>{ui}</AtlToastProvider>);
}

describe('AtlToast', () => {
  covers('toast', 'show-adds')('shows a toast when show() is called', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show default' }));
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  covers('toast', 'variant-class')('shows toast with success variant class', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show success' }));
    expect(screen.getByText('Success!').closest('.atl-toast')).toHaveClass('variant-success');
  });

  it('shows toast with danger variant class', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show danger' }));
    expect(screen.getByText('Danger!').closest('.atl-toast')).toHaveClass('variant-danger');
  });

  it('shows dismiss button by default', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show default' }));
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('does not show dismiss button when dismissible is false', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show non-dismissible' }));
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  covers('toast', 'dismiss-button-click')('dismisses toast when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show default' }));
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
  });

  it('can show multiple toasts at once', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show default' }));
    await user.click(screen.getByRole('button', { name: 'Show success' }));
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  covers('toast', 'position-class')('container applies position class', () => {
    renderWithProvider(<TestHarness position="top-center" />);
    expect(document.querySelector('.atl-toast-container')).toHaveClass('position-top-center');
  });

  it.each(['top-right', 'top-center', 'bottom-right', 'bottom-center'] as const)(
    'applies position-%s class',
    (position) => {
      render(
        <AtlToastProvider>
          <AtlToastContainer position={position} />
        </AtlToastProvider>
      );
      expect(document.querySelector('.atl-toast-container')).toHaveClass(`position-${position}`);
    }
  );
});
