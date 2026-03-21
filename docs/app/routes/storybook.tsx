import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/storybook')({
  component: StorybookPage,
});

function StorybookPage() {
  return (
    <>
      <div className="docs-page-header">
        <h1 className="docs-page-title">Storybook</h1>
        <p className="docs-page-description">
          Interactive component explorers for both the React and Angular libraries. Browse
          stories, inspect props, and test accessibility in isolation.
        </p>
      </div>

      <div className="docs-storybook-grid">
        <a
          href="/storybook-react/"
          target="_blank"
          rel="noopener noreferrer"
          className="docs-storybook-card"
        >
          <img src="/react-logo.png" alt="React" className="docs-storybook-logo" />
          <div className="docs-storybook-card-name">React</div>
          <div className="docs-storybook-card-desc">
            Storybook for <code>@atelier-ui/react</code>
          </div>
          <div className="docs-storybook-card-arrow">Open →</div>
        </a>

        <a
          href="/storybook-angular/"
          target="_blank"
          rel="noopener noreferrer"
          className="docs-storybook-card"
        >
          <img src="/angular-logo.jpg" alt="Angular" className="docs-storybook-logo" />
          <div className="docs-storybook-card-name">Angular</div>
          <div className="docs-storybook-card-desc">
            Storybook for <code>@atelier-ui/angular</code>
          </div>
          <div className="docs-storybook-card-arrow">Open →</div>
        </a>
      </div>
    </>
  );
}
