import React, { useState } from 'react';
import { CodeBlock, MultiCodeBlock, CodeFile } from '../../shared/code-block';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import {
  LlmButton,
  LlmBadge,
  LlmCard,
  LlmCardHeader,
  LlmCardContent,
  LlmCardFooter,
  LlmInput,
  LlmTextarea,
  LlmCheckbox,
  LlmToggle,
  LlmRadioGroup,
  LlmRadio,
  LlmSelect,
  LlmOption,
  LlmAlert,
  LlmAvatar,
  LlmAvatarGroup,
  LlmSkeleton,
  LlmTabGroup,
  LlmTab,
  LlmAccordionGroup,
  LlmAccordionItem,
  LlmTooltip,
  LlmProgress,
  LlmAccordionHeader,
  LlmBreadcrumbs,
  LlmBreadcrumbItem,
  LlmPagination,
  LlmTable,
  LlmThead,
  LlmTbody,
  LlmTr,
  LlmTh,
  LlmTd,
  LlmStepper,
  LlmStep,
  LlmCombobox,
  LlmDialog,
  LlmDialogHeader,
  LlmDialogContent,
  LlmDialogFooter,
  LlmDrawer,
  LlmDrawerHeader,
  LlmDrawerContent,
  LlmDrawerFooter,
  LlmCodeBlock,
} from '@atelier-ui/react';
import { componentDocs, COMPONENT_CATEGORIES } from '../../component-data';

export const Route = createFileRoute('/components/$name')({
  component: ComponentDocPage,
  notFoundComponent: ComponentNotFound,
});

const CATEGORY_COLORS: Record<string, string> = {
  Inputs: '#7c3aed',
  Display: '#0284c7',
  Navigation: '#059669',
  Overlay: '#d97706',
  Layout: '#dc2626',
};

function getCategory(name: string): string {
  for (const [cat, components] of Object.entries(COMPONENT_CATEGORIES)) {
    if (components.includes(name)) return cat;
  }
  return '';
}

function ComponentDocPage() {
  const { name } = Route.useParams();
  const doc = componentDocs[name];
  const [framework, setFramework] = useState<'angular' | 'react' | 'vue'>('angular');

  if (!doc) {
    throw notFound();
  }

  const category = getCategory(name);
  const categoryColor = CATEGORY_COLORS[category] ?? 'var(--ui-color-primary)';

  return (
    <>
      {/* Breadcrumb */}
      <nav className="docs-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/components">Components</Link>
        <span>/</span>
        <span>{doc.name}</span>
      </nav>

      {/* Page header */}
      <div className="docs-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span
            className="docs-category-tag"
            style={{
              background: `color-mix(in srgb, ${categoryColor} 12%, transparent)`,
              color: categoryColor,
            }}
          >
            {category}
          </span>
          {doc.status && (
            <span className={`docs-status-badge docs-status-badge--${doc.status}`}>
              {doc.status}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="docs-page-title">{doc.name}</h1>
            <p className="docs-page-description">{doc.description}</p>
            <code className="docs-selector-badge">{doc.selector}</code>
            {/* Meta chips */}
            <div className="docs-meta-chips">
              <span className="docs-meta-chip">WCAG AA</span>
              <span className="docs-meta-chip">0 deps</span>
            </div>
          </div>

          <div className="docs-framework-switcher">
            <button
              className={`docs-framework-btn ${framework === 'angular' ? 'is-active' : ''}`}
              onClick={() => setFramework('angular')}
            >
              Angular
            </button>
            <button
              className={`docs-framework-btn ${framework === 'react' ? 'is-active' : ''}`}
              onClick={() => setFramework('react')}
            >
              React
            </button>
            <button
              className={`docs-framework-btn ${framework === 'vue' ? 'is-active' : ''}`}
              onClick={() => setFramework('vue')}
            >
              Vue
            </button>
          </div>
        </div>
      </div>

      {/* Live demo */}
      <div className="docs-section">
        <h2 className="docs-section-title">Demo</h2>
        <div className="docs-demo">
          <div className="docs-demo-header">
            <span className="docs-demo-label">Live Preview</span>
          </div>
          <div className="docs-demo-canvas docs-demo-canvas--column">
            <ComponentDemo name={name} />
          </div>
          <CodeBlock lang="jsx" code={doc.codeExample} />
        </div>
      </div>

      {/* Props table */}
      {doc.props.length > 0 && (
        <div className="docs-section">
          <h2 className="docs-section-title">API ({framework.charAt(0).toUpperCase() + framework.slice(1)})</h2>
          <table className="docs-props-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((prop) => {
                const override = prop[framework];
                return (
                  <tr key={prop.name}>
                    <td><code className="docs-prop-name">{override?.name ?? prop.name}</code></td>
                    <td><code className="docs-prop-type">{override?.type ?? prop.type}</code></td>
                    <td><code className="docs-prop-default">{override?.default ?? prop.default}</code></td>
                    <td>{prop.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Import snippet */}
      <div className="docs-section">
        <h2 className="docs-section-title">Import</h2>
        <MultiCodeBlock files={generateImport(name)} />
      </div>

      {/* Storybook link */}
      <div className="docs-section">
        <a
          href={`https://atelier.pieper.io/storybook-react/?path=/docs/${name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="docs-btn docs-btn-outline"
        >
          📖 Explore in Storybook →
        </a>
      </div>

      {/* AI Usage */}
      {doc.aiUsage && (
        <div className="docs-section docs-ai-usage">
          <h2 className="docs-section-title">Prototyping with AI</h2>
          <div className="docs-ai-grid">
            <div className="docs-ai-card docs-ai-best-practices">
              <h3 className="docs-ai-card-title">✨ Best Practices</h3>
              <ul className="docs-ai-list">
                {doc.aiUsage.bestPractices.map((bp, i) => (
                  <li key={i}>{bp}</li>
                ))}
              </ul>
            </div>
            
            <div className="docs-ai-card docs-ai-hallucinations">
              <h3 className="docs-ai-card-title">⚠️ Common Hallucinations</h3>
              <ul className="docs-ai-list">
                {doc.aiUsage.commonHallucinations.map((ch, i) => (
                  <li key={i}>{ch}</li>
                ))}
              </ul>
            </div>

            <div className="docs-ai-card docs-ai-prompt" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 className="docs-ai-card-title" style={{ marginBottom: 0 }}>💬 Example Prompt</h3>
                <button 
                  className="docs-btn docs-btn-outline docs-btn-sm"
                  onClick={() => doc.aiUsage && navigator.clipboard.writeText(doc.aiUsage.promptSnippet)}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Copy Prompt
                </button>
              </div>
              <p className="docs-ai-prompt-text">{doc.aiUsage.promptSnippet}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ComponentNotFound() {
  return (
    <div className="docs-not-found">
      <h2>Component not found</h2>
      <p>The component you are looking for does not exist in this library.</p>
      <Link to="/components" className="docs-btn docs-btn-primary">
        ← Back to Components
      </Link>
    </div>
  );
}

function generateImport(name: string): CodeFile[] {
  const importMap: Record<string, string[]> = {
    button: ['LlmButton'],
    input: ['LlmInput'],
    textarea: ['LlmTextarea'],
    checkbox: ['LlmCheckbox'],
    toggle: ['LlmToggle'],
    'radio-group': ['LlmRadioGroup', 'LlmRadio'],
    select: ['LlmSelect', 'LlmOption'],
    badge: ['LlmBadge'],
    card: ['LlmCard', 'LlmCardHeader', 'LlmCardContent', 'LlmCardFooter'],
    avatar: ['LlmAvatar', 'LlmAvatarGroup'],
    skeleton: ['LlmSkeleton'],
    progress: ['LlmProgress'],
    breadcrumbs: ['LlmBreadcrumbs', 'LlmBreadcrumbItem'],
    tabs: ['LlmTabGroup', 'LlmTab'],
    pagination: ['LlmPagination'],
    menu: ['LlmMenu', 'LlmMenuItem', 'LlmMenuSeparator', 'LlmMenuTrigger'],
    dialog: ['LlmDialog', 'LlmDialogHeader', 'LlmDialogContent', 'LlmDialogFooter'],
    drawer: ['LlmDrawer', 'LlmDrawerHeader', 'LlmDrawerContent', 'LlmDrawerFooter'],
    tooltip: ['LlmTooltip'],
    toast: ['LlmToastProvider', 'LlmToastContainer', 'useLlmToast'],
    accordion: ['LlmAccordionGroup', 'LlmAccordionItem'],
    alert: ['LlmAlert'],
    'code-block': ['LlmCodeBlock'],
  };

  const imports = importMap[name] ?? [];
  if (imports.length === 0) return [];

  const symbols = imports.join(', ');

  return [
    { label: 'Angular', code: `import { ${symbols} } from '@atelier-ui/angular';`, lang: 'ts' },
    { label: 'React', code: `import { ${symbols} } from '@atelier-ui/react';`, lang: 'ts' },
    { label: 'Vue', code: `import { ${symbols} } from '@atelier-ui/vue';`, lang: 'ts' },
  ];
}

// Interactive demos for each component
function ComponentDemo({ name }: { name: string }) {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('free');
  const [selectValue, setSelectValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(3);

  switch (name) {
    case 'button':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <LlmButton variant="primary">Primary</LlmButton>
          <LlmButton variant="secondary">Secondary</LlmButton>
          <LlmButton variant="outline">Outline</LlmButton>
          <LlmButton variant="primary" size="sm">Small</LlmButton>
          <LlmButton variant="primary" size="lg">Large</LlmButton>
          <LlmButton variant="primary" loading={true}>Loading</LlmButton>
          <LlmButton variant="primary" disabled={true}>Disabled</LlmButton>
        </div>
      );

    case 'input':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '400px' }}>
          <LlmInput
            type="text"
            placeholder="Default input"
            value={inputValue}
            onValueChange={setInputValue}
          />
          <LlmInput type="email" placeholder="Email address" />
          <LlmInput type="password" placeholder="Password" />
          <LlmInput invalid={true} placeholder="Invalid state" />
          <LlmInput disabled={true} placeholder="Disabled" />
        </div>
      );

    case 'textarea':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '400px' }}>
          <LlmTextarea
            placeholder="Tell us about yourself..."
            rows={3}
            value={textareaValue}
            onValueChange={setTextareaValue}
          />
          <LlmTextarea placeholder="Disabled" disabled={true} />
        </div>
      );

    case 'checkbox':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <LlmCheckbox checked={checkboxChecked} onCheckedChange={setCheckboxChecked}>
            I agree to the terms and conditions
          </LlmCheckbox>
          <LlmCheckbox indeterminate={true}>Indeterminate state</LlmCheckbox>
          <LlmCheckbox checked={true} disabled={true}>Disabled checked</LlmCheckbox>
          <LlmCheckbox disabled={true}>Disabled unchecked</LlmCheckbox>
        </div>
      );

    case 'toggle':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <LlmToggle checked={toggleChecked} onCheckedChange={setToggleChecked}>
            Email notifications
          </LlmToggle>
          <LlmToggle>Push notifications</LlmToggle>
          <LlmToggle checked={true} disabled={true}>Always enabled (disabled)</LlmToggle>
        </div>
      );

    case 'radio-group':
      return (
        <LlmRadioGroup name="plan" value={radioValue} onValueChange={setRadioValue}>
          <LlmRadio radioValue="free">Free — Basic features</LlmRadio>
          <LlmRadio radioValue="pro">Pro — $9/month</LlmRadio>
          <LlmRadio radioValue="enterprise">Enterprise — Custom pricing</LlmRadio>
          <LlmRadio radioValue="legacy" disabled={true}>Legacy (unavailable)</LlmRadio>
        </LlmRadioGroup>
      );

    case 'select':
      return (
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <LlmSelect
            placeholder="Select a country"
            value={selectValue}
            onValueChange={setSelectValue}
          >
            <LlmOption optionValue="us">United States</LlmOption>
            <LlmOption optionValue="ca">Canada</LlmOption>
            <LlmOption optionValue="uk">United Kingdom</LlmOption>
            <LlmOption optionValue="de">Germany</LlmOption>
            <LlmOption optionValue="fr">France</LlmOption>
          </LlmSelect>
          {selectValue && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
              Selected: {selectValue}
            </p>
          )}
        </div>
      );

    case 'combobox':
      return (
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <LlmCombobox
            placeholder="Search framework..."
            options={[
              { label: 'Angular', value: 'ng' },
              { label: 'React', value: 'react' },
              { label: 'Vue', value: 'vue' },
              { label: 'Svelte', value: 'svelte' },
              { label: 'Solid', value: 'solid' },
            ]}
            value={selectValue}
            onValueChange={setSelectValue}
          />
          {selectValue && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
              Selected value: {selectValue}
            </p>
          )}
        </div>
      );

    case 'badge':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <LlmBadge>Default</LlmBadge>
          <LlmBadge variant="success">Active</LlmBadge>
          <LlmBadge variant="warning">Pending</LlmBadge>
          <LlmBadge variant="danger">Error</LlmBadge>
          <LlmBadge variant="info">Info</LlmBadge>
          <LlmBadge size="sm" variant="success">Small</LlmBadge>
          <LlmBadge size="sm" variant="danger">Small danger</LlmBadge>
        </div>
      );

    case 'card':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          <LlmCard variant="elevated" padding="md" style={{ flex: '1 1 220px', minWidth: 0 }}>
            <LlmCardHeader>Elevated Card</LlmCardHeader>
            <LlmCardContent>Default card with box shadow and no border.</LlmCardContent>
            <LlmCardFooter>
              <LlmButton variant="primary" size="sm">Action</LlmButton>
            </LlmCardFooter>
          </LlmCard>
          <LlmCard variant="outlined" padding="md" style={{ flex: '1 1 220px', minWidth: 0 }}>
            <LlmCardHeader>Outlined Card</LlmCardHeader>
            <LlmCardContent>Card with a visible border and no shadow.</LlmCardContent>
            <LlmCardFooter>
              <LlmButton variant="outline" size="sm">Action</LlmButton>
            </LlmCardFooter>
          </LlmCard>
        </div>
      );

    case 'table':
      return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <LlmTable variant="striped" style={{ width: '100%', minWidth: '600px' }}>
            <LlmThead>
              <LlmTr>
                <LlmTh>Name</LlmTh>
                <LlmTh>Status</LlmTh>
                <LlmTh>Role</LlmTh>
              </LlmTr>
            </LlmThead>
            <LlmTbody>
              <LlmTr selectable>
                <LlmTd><span style={{ fontWeight: 600 }}>Jane Doe</span></LlmTd>
                <LlmTd><LlmBadge variant="success" size="sm">Active</LlmBadge></LlmTd>
                <LlmTd>Admin</LlmTd>
              </LlmTr>
              <LlmTr selectable>
                <LlmTd><span style={{ fontWeight: 600 }}>John Smith</span></LlmTd>
                <LlmTd><LlmBadge variant="warning" size="sm">Pending</LlmBadge></LlmTd>
                <LlmTd>Editor</LlmTd>
              </LlmTr>
              <LlmTr selectable>
                <LlmTd><span style={{ fontWeight: 600 }}>Alice Johnson</span></LlmTd>
                <LlmTd><LlmBadge variant="success" size="sm">Active</LlmBadge></LlmTd>
                <LlmTd>Viewer</LlmTd>
              </LlmTr>
            </LlmTbody>
          </LlmTable>
        </div>
      );

    case 'avatar':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <LlmAvatar name="Jane Doe" size="xs" />
            <LlmAvatar name="John Smith" size="sm" />
            <LlmAvatar name="Alice Johnson" size="md" status="online" />
            <LlmAvatar name="Bob Brown" size="lg" status="away" />
            <LlmAvatar name="Carol White" size="xl" shape="square" status="busy" />
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>Group with overflow</p>
            <LlmAvatarGroup max={3} size="md">
              <LlmAvatar name="Alice" />
              <LlmAvatar name="Bob" />
              <LlmAvatar name="Carol" />
              <LlmAvatar name="Dave" />
              <LlmAvatar name="Eve" />
            </LlmAvatarGroup>
          </div>
        </div>
      );

    case 'skeleton':
      return (
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <LlmSkeleton variant="circular" width="48px" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <LlmSkeleton variant="text" width="40%" />
              <LlmSkeleton variant="text" />
              <LlmSkeleton variant="text" width="80%" />
            </div>
          </div>
          <LlmSkeleton variant="rectangular" height="120px" />
        </div>
      );

    case 'progress':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
          <div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>25% — Default</p>
            <LlmProgress value={25} />
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>60% — Success</p>
            <LlmProgress value={60} variant="success" />
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>85% — Warning</p>
            <LlmProgress value={85} variant="warning" />
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>Indeterminate</p>
            <LlmProgress indeterminate={true} />
          </div>
        </div>
      );

    case 'breadcrumbs':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <LlmBreadcrumbs>
            <LlmBreadcrumbItem href="/">Home</LlmBreadcrumbItem>
            <LlmBreadcrumbItem href="/components">Components</LlmBreadcrumbItem>
            <LlmBreadcrumbItem>Breadcrumbs</LlmBreadcrumbItem>
          </LlmBreadcrumbs>
          <LlmBreadcrumbs>
            <LlmBreadcrumbItem href="/">Dashboard</LlmBreadcrumbItem>
            <LlmBreadcrumbItem href="/settings">Settings</LlmBreadcrumbItem>
            <LlmBreadcrumbItem>Profile</LlmBreadcrumbItem>
          </LlmBreadcrumbs>
        </div>
      );

    case 'tabs':
      return (
        <div style={{ width: '100%' }}>
          <LlmTabGroup selectedIndex={tabIndex} onSelectedIndexChange={setTabIndex}>
            <LlmTab label="Account">
              <div style={{ padding: '1rem 0' }}>
                <LlmInput type="text" placeholder="Display name" />
              </div>
            </LlmTab>
            <LlmTab label="Notifications">
              <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <LlmToggle>Email notifications</LlmToggle>
                <LlmToggle checked={true}>Push notifications</LlmToggle>
              </div>
            </LlmTab>
            <LlmTab label="Billing" disabled={true}>
              Billing content (disabled)
            </LlmTab>
          </LlmTabGroup>
        </div>
      );

    case 'stepper':
      return (
        <div style={{ width: '100%' }}>
          <LlmStepper activeStep={tabIndex} onActiveStepChange={setTabIndex}>
            <LlmStep label="Personal Info" description="Enter your name">
              <div style={{ padding: '1.5rem 0' }}>
                <LlmInput placeholder="Name" />
              </div>
            </LlmStep>
            <LlmStep label="Account" description="Set your email">
              <div style={{ padding: '1.5rem 0' }}>
                <LlmInput type="email" placeholder="Email" />
              </div>
            </LlmStep>
            <LlmStep label="Review" description="Confirm details">
              <div style={{ padding: '1.5rem 0' }}>
                <p style={{ fontSize: '0.875rem' }}>Please confirm your details.</p>
              </div>
            </LlmStep>
          </LlmStepper>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <LlmButton variant="outline" size="sm" onClick={() => setTabIndex(Math.max(0, tabIndex - 1))}>Back</LlmButton>
            <LlmButton variant="primary" size="sm" onClick={() => setTabIndex(Math.min(2, tabIndex + 1))}>Next</LlmButton>
          </div>
        </div>
      );

    case 'pagination':
      return (
        <LlmPagination
          page={currentPage}
          pageCount={10}
          onPageChange={setCurrentPage}
          siblingCount={1}
        />
      );

    case 'menu':
      return (
        <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>
          Menu is built on @angular/cdk/menu. See the <strong>Data List with Actions</strong> cookbook pattern in Storybook for a live interactive demo.
        </p>
      );

    case 'dialog':
      return (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <LlmButton variant="primary" onClick={() => setDialogOpen(true)}>
            Open Standard Dialog
          </LlmButton>
          <LlmDialog open={dialogOpen} onOpenChange={setDialogOpen} size="md">
            <LlmDialogHeader>Component Specification</LlmDialogHeader>
            <LlmDialogContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                  The <code>LlmDialog</code> uses the native <code>&lt;dialog&gt;</code> element 
                  with standard-compliant accessibility features like focus trapping and 
                  Escape key handling.
                </p>
                <div style={{ background: 'var(--ui-color-surface-sunken)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.875rem' }}>Key Features:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Native modal behavior</li>
                    <li>Built-in backdrop with blur</li>
                    <li>Responsive size variants</li>
                    <li>Automatic focus management</li>
                  </ul>
                </div>
              </div>
            </LlmDialogContent>
            <LlmDialogFooter>
              <LlmButton variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </LlmButton>
              <LlmButton variant="primary" onClick={() => setDialogOpen(false)}>
                Got it
              </LlmButton>
            </LlmDialogFooter>
          </LlmDialog>
        </div>
      );

    case 'drawer':
      return (
        <div>
          <LlmButton variant="outline" onClick={() => setDrawerOpen(true)}>
            Open Drawer
          </LlmButton>
          <LlmDrawer open={drawerOpen} onOpenChange={setDrawerOpen} position="right" size="sm">
            <LlmDrawerHeader>Settings</LlmDrawerHeader>
            <LlmDrawerContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <LlmInput type="text" placeholder="Search..." />
                <LlmToggle checked={true}>Dark mode</LlmToggle>
                <LlmToggle>Compact view</LlmToggle>
              </div>
            </LlmDrawerContent>
            <LlmDrawerFooter>
              <LlmButton variant="outline" onClick={() => setDrawerOpen(false)}>
                Close
              </LlmButton>
              <LlmButton variant="primary" onClick={() => setDrawerOpen(false)}>
                Save
              </LlmButton>
            </LlmDrawerFooter>
          </LlmDrawer>
        </div>
      );

    case 'tooltip':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <LlmTooltip llmTooltip="Save your changes">
            <LlmButton variant="primary">Above (default)</LlmButton>
          </LlmTooltip>
          <LlmTooltip llmTooltip="Copy to clipboard" llmTooltipPosition="right">
            <LlmButton variant="outline">Right</LlmButton>
          </LlmTooltip>
          <LlmTooltip llmTooltip="Delete this item" llmTooltipPosition="below">
            <LlmButton variant="outline">Below</LlmButton>
          </LlmTooltip>
          <LlmTooltip llmTooltip="Navigation link" llmTooltipPosition="left">
            <LlmButton variant="secondary">Left</LlmButton>
          </LlmTooltip>
        </div>
      );

    case 'toast':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <LlmAlert variant="info">
            Toast requires <code>LlmToastProvider</code> wrapping your app root.
            Use the <code>useLlmToast()</code> hook to show toasts imperatively.
            See Storybook for a live interactive demo.
          </LlmAlert>
        </div>
      );

    case 'accordion':
      return (
        <div style={{ width: '100%' }}>
          <LlmAccordionGroup variant="bordered">
            <LlmAccordionItem expanded={accordionExpanded} onExpandedChange={setAccordionExpanded}>
              <LlmAccordionHeader>What is LLM Components?</LlmAccordionHeader>
              A component library designed for AI-generated applications. Consistent
              APIs for React and Angular.
            </LlmAccordionItem>
            <LlmAccordionItem>
              <LlmAccordionHeader>How do I install it?</LlmAccordionHeader>
              Run <code>npm install @atelier-ui/react</code> and
              import the styles from <code>@atelier-ui/react/styles/tokens.css</code>.
            </LlmAccordionItem>
            <LlmAccordionItem disabled={true}>
              <LlmAccordionHeader>Disabled item</LlmAccordionHeader>
              This item cannot be expanded.
            </LlmAccordionItem>
          </LlmAccordionGroup>
        </div>
      );

    case 'alert':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <LlmAlert variant="info">This is an informational message.</LlmAlert>
          <LlmAlert variant="success">Your changes were saved successfully.</LlmAlert>
          <LlmAlert variant="warning" dismissible={true}>
            Your session expires in 5 minutes.
          </LlmAlert>
          <LlmAlert variant="danger">Something went wrong. Please try again.</LlmAlert>
        </div>
      );

    case 'code-block':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <LlmCodeBlock
            language="typescript"
            filename="greeting.ts"
            code={`import { LlmButton } from '@atelier-ui/react';\n\nexport function GreetingButton({ name }: { name: string }) {\n  return (\n    <LlmButton variant="primary">\n      Hello, {name}!\n    </LlmButton>\n  );\n}`}
          />
          <LlmCodeBlock
            language="typescript"
            code={`const response = await fetch('/api/generate');\nconst { code } = await response.json();\nconsole.log(code);`}
            showLineNumbers={true}
          />
        </div>
      );

    default:
      return (
        <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>
          Interactive demo coming soon. See the code example above.
        </p>
      );
  }
}
