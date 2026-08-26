import { useState } from 'react';
import './atl-code-block.css';
import { AtlIcon } from '../icon/atl-icon';

export interface AtlCodeBlockProps {
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

export function AtlCodeBlock({
  code,
  language = 'text',
  filename,
  copyable = true,
  showLineNumbers = false,
}: AtlCodeBlockProps) {
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
    <div className="atl-code-block">
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
                <AtlIcon name="check" size="sm" />
                Copied
              </>
            ) : (
              <>
                <AtlIcon name="copy" size="sm" />
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
