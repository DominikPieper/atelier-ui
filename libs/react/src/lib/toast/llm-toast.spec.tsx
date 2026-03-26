import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmToastProvider, LlmToastContainer, useLlmToast } from './llm-toast';

function TestHarness({ position = 'bottom-right' as const }) {
  const { show } = useLlmToast();
  return (
    <>
      <button onClick={() => show('Hello world')}>Show default</button>
      <button onClick={() => show('Success!', { variant: 'success' })}>Show success</button>
      <button onClick={() => show('Danger!', { variant: 'danger' })}>Show danger</button>
      <button onClick={() => show('No dismiss', { dismissible: false })}>Show non-dismissible</button>
      <LlmToastContainer position={position} />
    </>
  );
}

function renderWithProvider(ui = <TestHarness />) {
  return render(<LlmToastProvider>{ui}</LlmToastProvider>);
}

describe('LlmToast', () => {
  it('shows a toast when show() is called', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show default' }));
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('shows toast with success variant class', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show success' }));
    expect(screen.getByText('Success!').closest('.llm-toast')).toHaveClass('variant-success');
  });

  it('shows toast with danger variant class', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'Show danger' }));
    expect(screen.getByText('Danger!').closest('.llm-toast')).toHaveClass('variant-danger');
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

  it('dismisses toast when dismiss button is clicked', async () => {
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

  it('container applies position class', () => {
    renderWithProvider(<TestHarness position="top-center" />);
    expect(document.querySelector('.llm-toast-container')).toHaveClass('position-top-center');
  });

  it.each(['top-right', 'top-center', 'bottom-right', 'bottom-center'] as const)(
    'applies position-%s class',
    (position) => {
      render(
        <LlmToastProvider>
          <LlmToastContainer position={position} />
        </LlmToastProvider>
      );
      expect(document.querySelector('.llm-toast-container')).toHaveClass(`position-${position}`);
    }
  );
});
