import { useState } from 'react';
import './llm-code-block.css';

export interface LlmCodeBlockProps {
  /** The code string to display. */
  code: string;
  /** Language label shown in the header. Ignored if filename is set. */
  language?: string;
  /** Optional filename shown in the header instead of the language label. */
  filename?: string;
  /** Whether to show a copy-to-clipboard button. */
  copyable?: boolean;
  /** Whether to display line numbers alongside the code. */
  showLineNumbers?: boolean;
}

export function LlmCodeBlock({
  code,
  language = 'text',
  filename,
  copyable = true,
  showLineNumbers = false,
}: LlmCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const displayLabel = filename || language;
  const lines = code.split('\n');

  function handleCopy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="llm-code-block">
      <div className="code-block-header">
        <span className="code-block-label">{displayLabel}</span>
        {copyable && (
          <button
            className="code-block-copy"
            type="button"
            aria-label={copied ? 'Copied' : 'Copy code'}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>
      <div className="code-block-body">
        <pre className="code-block-pre">
          <code>
            {showLineNumbers
              ? lines.map((line, i) => (
                  <span key={i} className="code-line">
                    <span className="code-line-number">{i + 1}</span>
                    <span className="code-line-text">{line}</span>
                  </span>
                ))
              : code}
          </code>
        </pre>
      </div>
    </div>
  );
}
