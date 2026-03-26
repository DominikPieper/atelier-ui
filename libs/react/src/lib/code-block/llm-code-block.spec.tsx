import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { LlmCodeBlock } from './llm-code-block';

const CODE = `const greeting = 'Hello, World!';\nconsole.log(greeting);`;

describe('LlmCodeBlock', () => {
  it('renders the code content', () => {
    render(<LlmCodeBlock code={CODE} />);
    expect(screen.getByText(/Hello, World!/)).toBeInTheDocument();
  });

  it('shows the language label when no filename is provided', () => {
    render(<LlmCodeBlock code={CODE} language="typescript" />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('shows the filename label instead of language when filename is set', () => {
    render(<LlmCodeBlock code={CODE} language="typescript" filename="app.ts" />);
    expect(screen.getByText('app.ts')).toBeInTheDocument();
    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
  });

  it('renders a copy button when copyable is true (default)', () => {
    render(<LlmCodeBlock code={CODE} />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('does not render a copy button when copyable is false', () => {
    render(<LlmCodeBlock code={CODE} copyable={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows line numbers when showLineNumbers is true', () => {
    const { container } = render(<LlmCodeBlock code={CODE} showLineNumbers />);
    const lineNumbers = container.querySelectorAll('.code-line-number');
    expect(lineNumbers.length).toBe(2);
    expect(lineNumbers[0].textContent).toBe('1');
    expect(lineNumbers[1].textContent).toBe('2');
  });

  it('does not render line number elements when showLineNumbers is false', () => {
    const { container } = render(<LlmCodeBlock code={CODE} />);
    expect(container.querySelectorAll('.code-line-number').length).toBe(0);
  });

  it('shows copied state after clicking copy button', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    render(<LlmCodeBlock code={CODE} />);
    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('defaults language label to "text"', () => {
    render(<LlmCodeBlock code={CODE} />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
