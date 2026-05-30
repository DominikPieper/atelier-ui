import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { LlmCodeBlock } from './llm-code-block';

const CODE = `const greeting = 'Hello, World!';\nconsole.log(greeting);`;

const TEMPLATE = `<llm-code-block [code]="code" [language]="language" [filename]="filename" [copyable]="copyable" [showLineNumbers]="showLineNumbers" />`;

function defaults(): {
  code: string;
  language: string;
  filename: string;
  copyable: boolean;
  showLineNumbers: boolean;
} {
  return { code: CODE, language: 'typescript', filename: '', copyable: true, showLineNumbers: false };
}

describe('LlmCodeBlock', () => {
  covers('code-block', 'renders-code')('renders the code content', async () => {
    await render(TEMPLATE, {
      imports: [LlmCodeBlock],
      componentProperties: defaults(),
    });
    expect(screen.getByText(/Hello, World!/)).toBeInTheDocument();
  });

  covers('code-block', 'language-label')('shows the language label when no filename is provided', async () => {
    await render(TEMPLATE, {
      imports: [LlmCodeBlock],
      componentProperties: defaults(),
    });
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  covers('code-block', 'filename-label')('shows the filename label instead of language when filename is set', async () => {
    await render(TEMPLATE, {
      imports: [LlmCodeBlock],
      componentProperties: { ...defaults(), filename: 'app.ts' },
    });
    expect(screen.getByText('app.ts')).toBeInTheDocument();
    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
  });

  covers('code-block', 'copy-button')('renders a copy button when copyable is true', async () => {
    await render(TEMPLATE, {
      imports: [LlmCodeBlock],
      componentProperties: defaults(),
    });
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  covers('code-block', 'no-copy-button')('does not render a copy button when copyable is false', async () => {
    await render(TEMPLATE, {
      imports: [LlmCodeBlock],
      componentProperties: { ...defaults(), copyable: false },
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  covers('code-block', 'line-numbers')('shows line numbers when showLineNumbers is true', async () => {
    const { container } = await render(TEMPLATE, {
      imports: [LlmCodeBlock],
      componentProperties: { ...defaults(), showLineNumbers: true },
    });
    const lineNumbers = container.querySelectorAll('.code-line-number');
    expect(lineNumbers.length).toBe(2);
    expect(lineNumbers[0].textContent.trim()).toBe('1');
    expect(lineNumbers[1].textContent.trim()).toBe('2');
  });

  it('does not render line number elements when showLineNumbers is false', async () => {
    const { container } = await render(TEMPLATE, {
      imports: [LlmCodeBlock],
      componentProperties: defaults(),
    });
    expect(container.querySelectorAll('.code-line-number').length).toBe(0);
  });

  covers('code-block', 'copied-state')('shows copied state after clicking copy button', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    await render(TEMPLATE, {
      imports: [LlmCodeBlock],
      componentProperties: defaults(),
    });

    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });
});
