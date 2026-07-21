import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import AtlCodeBlock from './atl-code-block.vue';

const CODE = `const greeting = 'Hello, World!';\nconsole.log(greeting);`;

describe('AtlCodeBlock', () => {
  covers('code-block', 'renders-code')('renders the code content', () => {
    render(AtlCodeBlock, { props: { code: CODE } });
    expect(screen.getByText(/Hello, World!/)).toBeInTheDocument();
  });

  covers('code-block', 'language-label')('shows the language label when no filename is provided', () => {
    render(AtlCodeBlock, { props: { code: CODE, language: 'typescript' } });
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  covers('code-block', 'filename-label')('shows the filename label instead of language when filename is set', () => {
    render(AtlCodeBlock, { props: { code: CODE, language: 'typescript', filename: 'app.ts' } });
    expect(screen.getByText('app.ts')).toBeInTheDocument();
    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
  });

  covers('code-block', 'copy-button')('renders a copy button when copyable is true (default)', () => {
    render(AtlCodeBlock, { props: { code: CODE } });
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  covers('code-block', 'no-copy-button')('does not render a copy button when copyable is false', () => {
    render(AtlCodeBlock, { props: { code: CODE, copyable: false } });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  covers('code-block', 'line-numbers')('shows line numbers when showLineNumbers is true', () => {
    const { container } = render(AtlCodeBlock, {
      props: { code: CODE, showLineNumbers: true },
    });
    const lineNumbers = container.querySelectorAll('.code-line-number');
    expect(lineNumbers.length).toBe(2);
    expect(lineNumbers[0].textContent?.trim()).toBe('1');
    expect(lineNumbers[1].textContent?.trim()).toBe('2');
  });

  it('does not render line number elements when showLineNumbers is false', () => {
    const { container } = render(AtlCodeBlock, { props: { code: CODE } });
    expect(container.querySelectorAll('.code-line-number').length).toBe(0);
  });

  covers('code-block', 'copied-state')('shows copied state after clicking copy button', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    render(AtlCodeBlock, { props: { code: CODE } });
    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('defaults language label to "text"', () => {
    render(AtlCodeBlock, { props: { code: CODE } });
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
