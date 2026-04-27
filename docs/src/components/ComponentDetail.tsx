import { useEffect, useState } from 'react';
import {
  LlmButton, LlmBadge, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmTextarea, LlmCheckbox, LlmToggle, LlmRadioGroup, LlmRadio,
  LlmSelect, LlmOption, LlmAlert, LlmAvatar, LlmAvatarGroup, LlmSkeleton,
  LlmTabGroup, LlmTab, LlmAccordionGroup, LlmAccordionItem, LlmTooltip,
  LlmProgress, LlmAccordionHeader, LlmBreadcrumbs, LlmBreadcrumbItem,
  LlmPagination, LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
  LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmCodeBlock,
} from '@atelier-ui/react';
import { componentDocs, COMPONENT_CATEGORIES } from '../data/components';
import { getFramework, setFramework, subscribeFramework, type Framework } from '../lib/framework-pref';

const CATEGORY_COLORS: Record<string, string> = {
  Inputs: '#7c3aed', Display: '#0284c7', Navigation: '#059669',
  Overlay: '#d97706', Layout: '#dc2626',
};

const IMPORT_MAP: Record<string, string[]> = {
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
  table: ['LlmTable', 'LlmThead', 'LlmTbody', 'LlmTr', 'LlmTh', 'LlmTd'],
  stepper: ['LlmStepper', 'LlmStep'],
  combobox: ['LlmCombobox'],
};

function getCategory(name: string): string {
  for (const [cat, components] of Object.entries(COMPONENT_CATEGORIES)) {
    if ((components as string[]).includes(name)) return cat;
  }
  return '';
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="docs-code-block">
      <div className="docs-code-block-header">
        <span className="docs-code-block-lang">{lang}</span>
        <button className={`docs-code-block-copy${copied ? ' copied' : ''}`} onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function MultiCodeBlock({ symbols }: { symbols: string[] }) {
  const [active, setActive] = useState(0);
  const frameworks = ['Angular', 'React', 'Vue'];
  const pkgs = ['@atelier-ui/angular', '@atelier-ui/react', '@atelier-ui/vue'];
  const codes = pkgs.map(pkg => `import { ${symbols.join(', ')} } from '${pkg}';`);
  return (
    <div>
      <div className="docs-multi-code-tabs" style={{ borderRadius: '8px 8px 0 0', marginBottom: 0 }}>
        {frameworks.map((fw, i) => (
          <button key={fw} className={`docs-multi-code-tab${active === i ? ' active' : ''}`} onClick={() => setActive(i)}>
            {fw}
          </button>
        ))}
      </div>
      <CodeBlock lang="ts" code={codes[active]} />
    </div>
  );
}

// ── Live demos ──
function ComponentDemo({ name }: { name: string }) {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('free');
  const [selectValue, setSelectValue] = useState('');
  const [inputValue, setInputValue] = useState('');
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
          <LlmInput type="text" placeholder="Default input" value={inputValue} onValueChange={setInputValue} />
          <LlmInput type="email" placeholder="Email address" />
          <LlmInput type="password" placeholder="Password" />
          <LlmInput invalid={true} placeholder="Invalid state" />
          <LlmInput disabled={true} placeholder="Disabled" />
        </div>
      );
    case 'textarea':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '400px' }}>
          <LlmTextarea placeholder="Tell us about yourself..." rows={3} />
          <LlmTextarea placeholder="Disabled" disabled={true} />
        </div>
      );
    case 'checkbox':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <LlmCheckbox checked={checkboxChecked} onCheckedChange={setCheckboxChecked}>I agree to the terms</LlmCheckbox>
          <LlmCheckbox indeterminate={true}>Indeterminate state</LlmCheckbox>
          <LlmCheckbox checked={true} disabled={true}>Disabled checked</LlmCheckbox>
        </div>
      );
    case 'toggle':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <LlmToggle checked={toggleChecked} onCheckedChange={setToggleChecked}>Email notifications</LlmToggle>
          <LlmToggle>Push notifications</LlmToggle>
          <LlmToggle checked={true} disabled={true}>Always enabled</LlmToggle>
        </div>
      );
    case 'radio-group':
      return (
        <LlmRadioGroup name="plan" value={radioValue} onValueChange={setRadioValue}>
          <LlmRadio radioValue="free">Free — Basic features</LlmRadio>
          <LlmRadio radioValue="pro">Pro — $9/month</LlmRadio>
          <LlmRadio radioValue="enterprise">Enterprise — Custom pricing</LlmRadio>
        </LlmRadioGroup>
      );
    case 'select':
      return (
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <LlmSelect placeholder="Select a country" value={selectValue} onValueChange={setSelectValue}>
            <LlmOption optionValue="us">United States</LlmOption>
            <LlmOption optionValue="ca">Canada</LlmOption>
            <LlmOption optionValue="uk">United Kingdom</LlmOption>
            <LlmOption optionValue="de">Germany</LlmOption>
          </LlmSelect>
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
        </div>
      );
    case 'card':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          <LlmCard variant="elevated" padding="md" style={{ flex: '1 1 220px', minWidth: 0 }}>
            <LlmCardHeader>Elevated Card</LlmCardHeader>
            <LlmCardContent>Default card with box shadow.</LlmCardContent>
            <LlmCardFooter><LlmButton variant="primary" size="sm">Action</LlmButton></LlmCardFooter>
          </LlmCard>
          <LlmCard variant="outlined" padding="md" style={{ flex: '1 1 220px', minWidth: 0 }}>
            <LlmCardHeader>Outlined Card</LlmCardHeader>
            <LlmCardContent>Card with a visible border.</LlmCardContent>
            <LlmCardFooter><LlmButton variant="outline" size="sm">Action</LlmButton></LlmCardFooter>
          </LlmCard>
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
            <LlmAvatar name="Carol White" size="xl" shape="square" />
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
          <div><p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>25%</p><LlmProgress value={25} /></div>
          <div><p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>60% — Success</p><LlmProgress value={60} variant="success" /></div>
          <div><p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>85% — Warning</p><LlmProgress value={85} variant="warning" /></div>
          <div><p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>Indeterminate</p><LlmProgress indeterminate={true} /></div>
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
        </div>
      );
    case 'tabs':
      return (
        <div style={{ width: '100%' }}>
          <LlmTabGroup selectedIndex={tabIndex} onSelectedIndexChange={setTabIndex}>
            <LlmTab label="Account">
              <div style={{ padding: '1rem 0' }}><LlmInput type="text" placeholder="Display name" /></div>
            </LlmTab>
            <LlmTab label="Notifications">
              <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <LlmToggle>Email notifications</LlmToggle>
                <LlmToggle checked={true}>Push notifications</LlmToggle>
              </div>
            </LlmTab>
            <LlmTab label="Billing" disabled={true}>Billing (disabled)</LlmTab>
          </LlmTabGroup>
        </div>
      );
    case 'pagination':
      return <LlmPagination page={currentPage} pageCount={10} onPageChange={setCurrentPage} siblingCount={1} />;
    case 'dialog':
      return (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <LlmButton variant="primary" onClick={() => setDialogOpen(true)}>Open Dialog</LlmButton>
          <LlmDialog open={dialogOpen} onOpenChange={setDialogOpen} size="md">
            <LlmDialogHeader>Component Specification</LlmDialogHeader>
            <LlmDialogContent>
              <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                The <code>LlmDialog</code> uses the native <code>&lt;dialog&gt;</code> element with
                built-in focus trapping and Escape key handling.
              </p>
            </LlmDialogContent>
            <LlmDialogFooter>
              <LlmButton variant="outline" onClick={() => setDialogOpen(false)}>Cancel</LlmButton>
              <LlmButton variant="primary" onClick={() => setDialogOpen(false)}>Got it</LlmButton>
            </LlmDialogFooter>
          </LlmDialog>
        </div>
      );
    case 'drawer':
      return (
        <div>
          <LlmButton variant="outline" onClick={() => setDrawerOpen(true)}>Open Drawer</LlmButton>
          <LlmDrawer open={drawerOpen} onOpenChange={setDrawerOpen} position="right" size="sm">
            <LlmDrawerHeader>Settings</LlmDrawerHeader>
            <LlmDrawerContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <LlmInput type="text" placeholder="Search..." />
                <LlmToggle checked={true}>Dark mode</LlmToggle>
              </div>
            </LlmDrawerContent>
            <LlmDrawerFooter>
              <LlmButton variant="outline" onClick={() => setDrawerOpen(false)}>Close</LlmButton>
              <LlmButton variant="primary" onClick={() => setDrawerOpen(false)}>Save</LlmButton>
            </LlmDrawerFooter>
          </LlmDrawer>
        </div>
      );
    case 'tooltip':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <LlmTooltip llmTooltip="Save your changes"><LlmButton variant="primary">Above</LlmButton></LlmTooltip>
          <LlmTooltip llmTooltip="Copy to clipboard" llmTooltipPosition="right"><LlmButton variant="outline">Right</LlmButton></LlmTooltip>
          <LlmTooltip llmTooltip="Delete item" llmTooltipPosition="below"><LlmButton variant="outline">Below</LlmButton></LlmTooltip>
        </div>
      );
    case 'accordion':
      return (
        <div style={{ width: '100%' }}>
          <LlmAccordionGroup variant="bordered">
            <LlmAccordionItem expanded={accordionExpanded} onExpandedChange={setAccordionExpanded}>
              <LlmAccordionHeader>What is Atelier UI?</LlmAccordionHeader>
              A component library designed for AI-generated applications with consistent APIs.
            </LlmAccordionItem>
            <LlmAccordionItem>
              <LlmAccordionHeader>How do I install it?</LlmAccordionHeader>
              Run <code>npm install @atelier-ui/react</code> and import the styles.
            </LlmAccordionItem>
          </LlmAccordionGroup>
        </div>
      );
    case 'alert':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <LlmAlert variant="info">This is an informational message.</LlmAlert>
          <LlmAlert variant="success">Your changes were saved successfully.</LlmAlert>
          <LlmAlert variant="warning" dismissible={true}>Your session expires in 5 minutes.</LlmAlert>
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
        </div>
      );
    case 'menu':
      return (
        <LlmAlert variant="info">
          Menu is built on @angular/cdk/menu. See the <strong>Data List with Actions</strong> cookbook pattern for a live interactive demo.
        </LlmAlert>
      );
    case 'toast':
      return (
        <LlmAlert variant="info">
          Toast requires <code>LlmToastProvider</code> wrapping your app root.
          Use the <code>useLlmToast()</code> hook to show toasts imperatively.
        </LlmAlert>
      );
    default:
      return <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Interactive demo coming soon. See the code example above.</p>;
  }
}

interface ComponentDetailProps {
  name: string;
}

export default function ComponentDetail({ name }: ComponentDetailProps) {
  const doc = componentDocs[name];
  const [framework, setFrameworkState] = useState<Framework>(() => getFramework());

  useEffect(() => subscribeFramework(setFrameworkState), []);

  if (!doc) {
    return (
      <div className="docs-not-found">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧩</div>
        <h2>Component not found</h2>
        <p>The component <code>{name}</code> does not exist in this library.</p>
        <a href="/components" className="docs-btn docs-btn-primary">← Back to Components</a>
      </div>
    );
  }

  const category = getCategory(name);
  const categoryColor = CATEGORY_COLORS[category] ?? 'var(--ui-color-primary)';
  const importSymbols = IMPORT_MAP[name] ?? [];

  return (
    <>
      {/* Breadcrumb */}
      <nav className="docs-breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/components">Components</a>
        <span>/</span>
        <span>{doc.name}</span>
      </nav>

      {/* Page header */}
      <div className="docs-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span
            className="docs-category-tag"
            style={{ background: `color-mix(in srgb, ${categoryColor} 12%, transparent)`, color: categoryColor }}
          >
            {category}
          </span>
          {doc.status && (
            <span className={`docs-status-badge docs-status-badge--${doc.status}`}>{doc.status}</span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="docs-page-title">{doc.name}</h1>
            <p className="docs-page-description">{doc.description}</p>
            <code className="docs-selector-badge">{doc.selector}</code>
            <div className="docs-meta-chips">
              <span className="docs-meta-chip">WCAG AA</span>
              <span className="docs-meta-chip">0 deps</span>
            </div>
          </div>
          <div className="docs-framework-switcher">
            {(['angular', 'react', 'vue'] as const).map(fw => (
              <button
                key={fw}
                className={`docs-framework-btn${framework === fw ? ' is-active' : ''}`}
                onClick={() => setFramework(fw)}
              >
                {fw.charAt(0).toUpperCase() + fw.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live demo */}
      <div className="docs-section">
        <h2 className="docs-section-title">Demo</h2>
        <div className="docs-demo">
          <div className="docs-demo-header">
            <span className="docs-demo-label">Live Preview</span>
            <span className="docs-demo-fw-tag" title="The live preview renders the React build. Angular and Vue use the same props and produce equivalent output.">React</span>
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
              <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
            </thead>
            <tbody>
              {doc.props.map((prop) => {
                const override = prop[framework as keyof typeof prop] as { name?: string; type?: string; default?: string } | undefined;
                return (
                  <tr key={prop.name}>
                    <td><code className="docs-prop-name">{(override as { name?: string } | undefined)?.name ?? prop.name}</code></td>
                    <td><code className="docs-prop-type">{(override as { type?: string } | undefined)?.type ?? prop.type}</code></td>
                    <td><code className="docs-prop-default">{(override as { default?: string } | undefined)?.default ?? prop.default}</code></td>
                    <td>{prop.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Composition parts */}
      {doc.composition && doc.composition.length > 0 && (
        <div className="docs-section">
          <h2 className="docs-section-title">Composition parts</h2>
          <p className="docs-composition-intro">
            {doc.name} is composed from the parts below. Each part is its own component — drop the ones you don't need.
          </p>
          {doc.composition.map(part => (
            <div key={part.name} className="docs-composition-part">
              <h3 className="docs-composition-part-name"><code>{part.name}</code></h3>
              {part.description && (
                <p className="docs-composition-part-desc">{part.description}</p>
              )}
              {part.props.length > 0 && (
                <table className="docs-props-table">
                  <thead>
                    <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    {part.props.map(prop => (
                      <tr key={prop.name}>
                        <td><code className="docs-prop-name">{prop.name}</code></td>
                        <td><code className="docs-prop-type">{prop.type}</code></td>
                        <td><code className="docs-prop-default">{prop.default}</code></td>
                        <td>{prop.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Import snippet */}
      {importSymbols.length > 0 && (
        <div className="docs-section">
          <h2 className="docs-section-title">Import</h2>
          <MultiCodeBlock symbols={importSymbols} />
        </div>
      )}

      {/* Accessibility */}
      {doc.a11y && (
        <div className="docs-section">
          <h2 className="docs-section-title">Accessibility</h2>
          {doc.a11y.role && (
            <p className="docs-a11y-role">
              <span className="docs-a11y-role-label">ARIA role</span>
              <code>{doc.a11y.role}</code>
            </p>
          )}
          <table className="docs-props-table" style={{ marginBottom: doc.a11y.notes ? '1rem' : 0 }}>
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {doc.a11y.keyboard.map((row, i) => (
                <tr key={i}>
                  <td><kbd className="docs-a11y-kbd">{row.key}</kbd></td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {doc.a11y.notes && doc.a11y.notes.length > 0 && (
            <ul className="docs-a11y-notes">
              {doc.a11y.notes.map((note, i) => <li key={i}>{note}</li>)}
            </ul>
          )}
          <p className="docs-a11y-link">
            See the <a href="/accessibility">accessibility overview</a> for the site-wide WCAG stance.
          </p>
        </div>
      )}

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
                {doc.aiUsage.bestPractices.map((bp, i) => <li key={i}>{bp}</li>)}
              </ul>
            </div>
            <div className="docs-ai-card docs-ai-hallucinations">
              <h3 className="docs-ai-card-title">⚠️ Common Hallucinations</h3>
              <ul className="docs-ai-list">
                {doc.aiUsage.commonHallucinations.map((ch, i) => <li key={i}>{ch}</li>)}
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
