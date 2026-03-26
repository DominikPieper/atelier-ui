import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '../shared/code-block';

export const Route = createFileRoute('/install')({
  component: InstallPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

const mutedText: React.CSSProperties = {
  lineHeight: '1.6',
  marginBottom: '1rem',
  color: 'var(--ui-color-text-muted)',
};

const sectionHeadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1.25rem',
};

const logoStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  objectFit: 'contain',
  borderRadius: '6px',
};

function InstallPage() {
  return (
    <div
      className="docs-page"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
    >
      <div className="docs-page-header">
        <h1 className="docs-page-title">Installation</h1>
        <p className="docs-page-description">
          Get started with Atelier UI in your Angular or React project.
        </p>
      </div>

      {/* Angular */}
      <div className="docs-section">
        <div style={sectionHeadingStyle}>
          <img src="/angular-logo.svg" alt="Angular" style={logoStyle} />
          <h2 className="docs-section-title" style={{ margin: 0 }}>
            Angular
          </h2>
        </div>
        <p style={mutedText}>Install the Angular component library from npm:</p>
        <CodeBlock lang="shell" code="npm install @atelier-ui/angular" />
        <p style={mutedText}>Import the components you need:</p>
        <CodeBlock
          lang="ts"
          code={`import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
  LlmBadge, LlmAlert, LlmSelect, LlmOption,
  LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
  LlmTabGroup, LlmTab, LlmAccordionGroup, LlmAccordionItem,
  LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger,
  LlmTooltip, LlmToast, LlmToastContainer, LlmToastService,
  LlmSkeleton, LlmAvatar, LlmAvatarGroup
} from '@atelier-ui/angular';`}
        />
        <p style={mutedText}>Import the design tokens in your global styles:</p>
        <CodeBlock lang="css" code="@import '@atelier-ui/angular/styles/tokens.css';" />
      </div>

      {/* React */}
      <div className="docs-section">
        <div style={sectionHeadingStyle}>
          <img src="/react-logo.svg" alt="React" style={logoStyle} />
          <h2 className="docs-section-title" style={{ margin: 0 }}>
            React
          </h2>
        </div>
        <p style={mutedText}>Install the React component library from npm:</p>
        <CodeBlock lang="shell" code="npm install @atelier-ui/react" />
        <p style={mutedText}>Import the components you need:</p>
        <CodeBlock
          lang="ts"
          code={`import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
  LlmBadge, LlmAlert, LlmSelect, LlmOption,
  LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
  LlmTabGroup, LlmTab, LlmAccordionGroup, LlmAccordionItem,
  LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger,
  LlmTooltip, LlmSkeleton, LlmAvatar, LlmAvatarGroup,
  LlmProgress, LlmBreadcrumbs, LlmBreadcrumbItem, LlmPagination,
  LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter,
  LlmToastProvider, LlmToastContainer, LlmToast, useLlmToast
} from '@atelier-ui/react';`}
        />
        <p style={mutedText}>Import the design tokens in your global styles:</p>
        <CodeBlock lang="css" code="@import '@atelier-ui/react/styles/tokens.css';" />
        <p style={mutedText}>
          Wrap your app root with <code>LlmToastProvider</code> to enable toasts:
        </p>
        <CodeBlock
          lang="jsx"
          code={`<LlmToastProvider>
  <App />
  <LlmToastContainer position="bottom-right" />
</LlmToastProvider>`}
        />
      </div>

      {/* Vue */}
      <div className="docs-section">
        <div style={sectionHeadingStyle}>
          <img src="/vue-logo.svg" alt="Vue" style={logoStyle} />
          <h2 className="docs-section-title" style={{ margin: 0 }}>
            Vue
          </h2>
        </div>
        <p style={mutedText}>Install the Vue component library from npm:</p>
        <CodeBlock lang="shell" code="npm install @atelier-ui/vue" />
        <p style={mutedText}>Import the components you need:</p>
        <CodeBlock
          lang="ts"
          code={`import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
  LlmBadge, LlmAlert, LlmSelect, LlmOption,
  LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
  LlmTabGroup, LlmTab, LlmAccordionGroup, LlmAccordionItem,
  LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger,
  LlmTooltip, LlmSkeleton, LlmAvatar, LlmAvatarGroup
} from '@atelier-ui/vue';`}
        />
        <p style={mutedText}>Import the design tokens in your global styles:</p>
        <CodeBlock lang="css" code="@import '@atelier-ui/vue/styles/tokens.css';" />
      </div>
    </div>
  );
}
