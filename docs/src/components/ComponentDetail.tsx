import { useEffect, useState } from 'react';
import {
  AtlButton, AtlBadge, AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter,
  AtlInput, AtlTextarea, AtlCheckbox, AtlToggle, AtlRadioGroup, AtlRadio,
  AtlSelect, AtlOption, AtlAlert, AtlAvatar, AtlAvatarGroup, AtlSkeleton,
  AtlTabGroup, AtlTab, AtlAccordionGroup, AtlAccordionItem, AtlTooltip,
  AtlProgress, AtlAccordionHeader, AtlBreadcrumbs, AtlBreadcrumbItem,
  AtlPagination, AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter,
  AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlCodeBlock,
} from '@atelier-ui/react';
import { componentDocs, COMPONENT_CATEGORIES } from '../data/components';
import { getFramework, setFramework, subscribeFramework, type Framework } from '../lib/framework-pref';

const CATEGORY_TONE: Record<string, string> = {
  Inputs: 'primary',
  Display: 'info',
  Navigation: 'success',
  Overlay: 'warning',
  Layout: 'danger',
};

const IMPORT_MAP: Record<string, string[]> = {
  button: ['AtlButton'],
  input: ['AtlInput'],
  textarea: ['AtlTextarea'],
  checkbox: ['AtlCheckbox'],
  toggle: ['AtlToggle'],
  'radio-group': ['AtlRadioGroup', 'AtlRadio'],
  select: ['AtlSelect', 'AtlOption'],
  badge: ['AtlBadge'],
  card: ['AtlCard', 'AtlCardHeader', 'AtlCardContent', 'AtlCardFooter'],
  avatar: ['AtlAvatar', 'AtlAvatarGroup'],
  skeleton: ['AtlSkeleton'],
  progress: ['AtlProgress'],
  breadcrumbs: ['AtlBreadcrumbs', 'AtlBreadcrumbItem'],
  tabs: ['AtlTabGroup', 'AtlTab'],
  pagination: ['AtlPagination'],
  menu: ['AtlMenu', 'AtlMenuItem', 'AtlMenuSeparator', 'AtlMenuTrigger'],
  dialog: ['AtlDialog', 'AtlDialogHeader', 'AtlDialogContent', 'AtlDialogFooter'],
  drawer: ['AtlDrawer', 'AtlDrawerHeader', 'AtlDrawerContent', 'AtlDrawerFooter'],
  tooltip: ['AtlTooltip'],
  toast: ['AtlToastProvider', 'AtlToastContainer', 'useAtlToast'],
  accordion: ['AtlAccordionGroup', 'AtlAccordionItem'],
  alert: ['AtlAlert'],
  'code-block': ['AtlCodeBlock'],
  table: ['AtlTable', 'AtlThead', 'AtlTbody', 'AtlTr', 'AtlTh', 'AtlTd'],
  stepper: ['AtlStepper', 'AtlStep'],
  combobox: ['AtlCombobox'],
};

function getCategory(name: string): string {
  for (const [cat, components] of Object.entries(COMPONENT_CATEGORIES)) {
    if ((components as string[]).includes(name)) return cat;
  }
  return '';
}

const EXAMPLE_LANG: Record<Framework, string> = {
  angular: 'html',
  react: 'jsx',
  vue: 'vue',
};

// Docs-site categories → Storybook title categories (lowercased path segments).
// They match 1:1 except "Layout" (accordion, alert), which Storybook files under "Feedback".
const STORYBOOK_CATEGORY: Record<string, string> = {
  Inputs: 'inputs',
  Display: 'display',
  Navigation: 'navigation',
  Overlay: 'overlay',
  Layout: 'feedback',
  AI: 'ai',
};

// Storybook docs IDs follow `components-<category>-<component>--docs`, where
// <component> is the primary selector lowercased (e.g. AtlTabGroup → atltabgroup).
function storybookDocsUrl(framework: Framework, name: string, category: string, selector: string): string {
  const base = `https://atelier.pieper.io/storybook-${framework}/`;
  const cat = STORYBOOK_CATEGORY[category];
  // Toast's docs selector is "AtlToastProvider + useAtlToast" but its Storybook id is atltoast.
  const segment = name === 'toast'
    ? 'atltoast'
    : selector.split(' + ')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (!cat || !segment) return base;
  return `${base}?path=/docs/components-${cat}-${segment}--docs`;
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
        <button className={`docs-code-block-copy${copied ? ' copied' : ''}`} onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

// Order mirrors the page-header framework switcher so the import tabs map 1:1
// onto the shared `Framework` preference rather than tracking a separate index.
const MULTI_CODE_FRAMEWORKS: Framework[] = ['angular', 'react', 'vue'];

function MultiCodeBlock({ symbols, framework }: { symbols: string[]; framework: Framework }) {
  const pkgs: Record<Framework, string> = {
    angular: '@atelier-ui/angular',
    react: '@atelier-ui/react',
    vue: '@atelier-ui/vue',
  };
  const code = `import { ${symbols.join(', ')} } from '${pkgs[framework]}';`;
  return (
    <div>
      {/* aria-pressed toggle buttons (not role=tab): clicking writes the shared
          framework preference, which drives several scattered surfaces on the
          page (demo, props, import) rather than a single tabpanel — so the
          honest pattern is a group of toggle buttons, not a tablist. */}
      <div className="docs-multi-code-tabs" style={{ borderRadius: '8px 8px 0 0', marginBottom: 0 }}>
        {MULTI_CODE_FRAMEWORKS.map(fw => {
          const active = framework === fw;
          return (
            <button
              key={fw}
              type="button"
              aria-pressed={active}
              className={`docs-multi-code-tab${active ? ' active' : ''}`}
              onClick={() => setFramework(fw)}
            >
              {fw.charAt(0).toUpperCase() + fw.slice(1)}
            </button>
          );
        })}
      </div>
      <CodeBlock lang="ts" code={code} />
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
          <AtlButton variant="primary">Primary</AtlButton>
          <AtlButton variant="secondary">Secondary</AtlButton>
          <AtlButton variant="outline">Outline</AtlButton>
          <AtlButton variant="primary" size="sm">Small</AtlButton>
          <AtlButton variant="primary" size="lg">Large</AtlButton>
          <AtlButton variant="primary" loading={true}>Loading</AtlButton>
          <AtlButton variant="primary" disabled={true}>Disabled</AtlButton>
        </div>
      );
    case 'input':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '400px' }}>
          <AtlInput type="text" placeholder="Default input" value={inputValue} onValueChange={setInputValue} />
          <AtlInput type="email" placeholder="Email address" />
          <AtlInput type="password" placeholder="Password" />
          <AtlInput invalid={true} placeholder="Invalid state" />
          <AtlInput disabled={true} placeholder="Disabled" />
        </div>
      );
    case 'textarea':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '400px' }}>
          <AtlTextarea placeholder="Tell us about yourself..." rows={3} />
          <AtlTextarea placeholder="Disabled" disabled={true} />
        </div>
      );
    case 'checkbox':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AtlCheckbox checked={checkboxChecked} onCheckedChange={setCheckboxChecked}>I agree to the terms</AtlCheckbox>
          <AtlCheckbox indeterminate={true}>Indeterminate state</AtlCheckbox>
          <AtlCheckbox checked={true} disabled={true}>Disabled checked</AtlCheckbox>
        </div>
      );
    case 'toggle':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AtlToggle checked={toggleChecked} onCheckedChange={setToggleChecked}>Email notifications</AtlToggle>
          <AtlToggle>Push notifications</AtlToggle>
          <AtlToggle checked={true} disabled={true}>Always enabled</AtlToggle>
        </div>
      );
    case 'radio-group':
      return (
        <AtlRadioGroup name="plan" value={radioValue} onValueChange={setRadioValue}>
          <AtlRadio radioValue="free">Free — Basic features</AtlRadio>
          <AtlRadio radioValue="pro">Pro — $9/month</AtlRadio>
          <AtlRadio radioValue="enterprise">Enterprise — Custom pricing</AtlRadio>
        </AtlRadioGroup>
      );
    case 'select':
      return (
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <AtlSelect placeholder="Select a country" value={selectValue} onValueChange={setSelectValue}>
            <AtlOption optionValue="us">United States</AtlOption>
            <AtlOption optionValue="ca">Canada</AtlOption>
            <AtlOption optionValue="uk">United Kingdom</AtlOption>
            <AtlOption optionValue="de">Germany</AtlOption>
          </AtlSelect>
        </div>
      );
    case 'badge':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <AtlBadge>Default</AtlBadge>
          <AtlBadge variant="success">Active</AtlBadge>
          <AtlBadge variant="warning">Pending</AtlBadge>
          <AtlBadge variant="danger">Error</AtlBadge>
          <AtlBadge variant="info">Info</AtlBadge>
          <AtlBadge size="sm" variant="success">Small</AtlBadge>
        </div>
      );
    case 'card':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          <AtlCard variant="elevated" padding="md" style={{ flex: '1 1 220px', minWidth: 0 }}>
            <AtlCardHeader>Elevated Card</AtlCardHeader>
            <AtlCardContent>Default card with box shadow.</AtlCardContent>
            <AtlCardFooter><AtlButton variant="primary" size="sm">Action</AtlButton></AtlCardFooter>
          </AtlCard>
          <AtlCard variant="outlined" padding="md" style={{ flex: '1 1 220px', minWidth: 0 }}>
            <AtlCardHeader>Outlined Card</AtlCardHeader>
            <AtlCardContent>Card with a visible border.</AtlCardContent>
            <AtlCardFooter><AtlButton variant="outline" size="sm">Action</AtlButton></AtlCardFooter>
          </AtlCard>
        </div>
      );
    case 'avatar':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AtlAvatar name="Jane Doe" size="xs" />
            <AtlAvatar name="John Smith" size="sm" />
            <AtlAvatar name="Alice Johnson" size="md" status="online" />
            <AtlAvatar name="Bob Brown" size="lg" status="away" />
            <AtlAvatar name="Carol White" size="xl" shape="square" />
          </div>
          <div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>Group with overflow</p>
            <AtlAvatarGroup max={3} size="md">
              <AtlAvatar name="Alice" />
              <AtlAvatar name="Bob" />
              <AtlAvatar name="Carol" />
              <AtlAvatar name="Dave" />
              <AtlAvatar name="Eve" />
            </AtlAvatarGroup>
          </div>
        </div>
      );
    case 'skeleton':
      return (
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <AtlSkeleton variant="circular" width="48px" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <AtlSkeleton variant="text" width="40%" />
              <AtlSkeleton variant="text" />
              <AtlSkeleton variant="text" width="80%" />
            </div>
          </div>
          <AtlSkeleton variant="rectangular" height="120px" />
        </div>
      );
    case 'progress':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
          <div><p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>25%</p><AtlProgress value={25} /></div>
          <div><p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>60% — Success</p><AtlProgress value={60} variant="success" /></div>
          <div><p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>85% — Warning</p><AtlProgress value={85} variant="warning" /></div>
          <div><p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>Indeterminate</p><AtlProgress indeterminate={true} /></div>
        </div>
      );
    case 'breadcrumbs':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AtlBreadcrumbs>
            <AtlBreadcrumbItem href="/">Home</AtlBreadcrumbItem>
            <AtlBreadcrumbItem href="/components">Components</AtlBreadcrumbItem>
            <AtlBreadcrumbItem>Breadcrumbs</AtlBreadcrumbItem>
          </AtlBreadcrumbs>
        </div>
      );
    case 'tabs':
      return (
        <div style={{ width: '100%' }}>
          <AtlTabGroup selectedIndex={tabIndex} onSelectedIndexChange={setTabIndex}>
            <AtlTab label="Account">
              <div style={{ padding: '1rem 0' }}><AtlInput type="text" placeholder="Display name" /></div>
            </AtlTab>
            <AtlTab label="Notifications">
              <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AtlToggle>Email notifications</AtlToggle>
                <AtlToggle checked={true}>Push notifications</AtlToggle>
              </div>
            </AtlTab>
            <AtlTab label="Billing" disabled={true}>Billing (disabled)</AtlTab>
          </AtlTabGroup>
        </div>
      );
    case 'pagination':
      return <AtlPagination page={currentPage} pageCount={10} onPageChange={setCurrentPage} siblingCount={1} />;
    case 'dialog':
      return (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <AtlButton variant="primary" onClick={() => setDialogOpen(true)}>Open Dialog</AtlButton>
          <AtlDialog open={dialogOpen} onOpenChange={setDialogOpen} size="md">
            <AtlDialogHeader>Component Specification</AtlDialogHeader>
            <AtlDialogContent>
              <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                The <code>AtlDialog</code> uses the native <code>&lt;dialog&gt;</code> element with
                built-in focus trapping and Escape key handling.
              </p>
            </AtlDialogContent>
            <AtlDialogFooter>
              <AtlButton variant="outline" onClick={() => setDialogOpen(false)}>Cancel</AtlButton>
              <AtlButton variant="primary" onClick={() => setDialogOpen(false)}>Got it</AtlButton>
            </AtlDialogFooter>
          </AtlDialog>
        </div>
      );
    case 'drawer':
      return (
        <div>
          <AtlButton variant="outline" onClick={() => setDrawerOpen(true)}>Open Drawer</AtlButton>
          <AtlDrawer open={drawerOpen} onOpenChange={setDrawerOpen} position="right" size="sm">
            <AtlDrawerHeader>Settings</AtlDrawerHeader>
            <AtlDrawerContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AtlInput type="text" placeholder="Search..." />
                <AtlToggle checked={true}>Dark mode</AtlToggle>
              </div>
            </AtlDrawerContent>
            <AtlDrawerFooter>
              <AtlButton variant="outline" onClick={() => setDrawerOpen(false)}>Close</AtlButton>
              <AtlButton variant="primary" onClick={() => setDrawerOpen(false)}>Save</AtlButton>
            </AtlDrawerFooter>
          </AtlDrawer>
        </div>
      );
    case 'tooltip':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <AtlTooltip atlTooltip="Save your changes"><AtlButton variant="primary">Above</AtlButton></AtlTooltip>
          <AtlTooltip atlTooltip="Copy to clipboard" atlTooltipPosition="right"><AtlButton variant="outline">Right</AtlButton></AtlTooltip>
          <AtlTooltip atlTooltip="Delete item" atlTooltipPosition="below"><AtlButton variant="outline">Below</AtlButton></AtlTooltip>
        </div>
      );
    case 'accordion':
      return (
        <div style={{ width: '100%' }}>
          <AtlAccordionGroup variant="bordered">
            <AtlAccordionItem expanded={accordionExpanded} onExpandedChange={setAccordionExpanded}>
              <AtlAccordionHeader>What is Atelier UI?</AtlAccordionHeader>
              A component library designed for AI-generated applications with consistent APIs.
            </AtlAccordionItem>
            <AtlAccordionItem>
              <AtlAccordionHeader>How do I install it?</AtlAccordionHeader>
              Run <code>npm install @atelier-ui/react</code> and import the styles.
            </AtlAccordionItem>
          </AtlAccordionGroup>
        </div>
      );
    case 'alert':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <AtlAlert variant="info">This is an informational message.</AtlAlert>
          <AtlAlert variant="success">Your changes were saved successfully.</AtlAlert>
          <AtlAlert variant="warning" dismissible={true}>Your session expires in 5 minutes.</AtlAlert>
          <AtlAlert variant="danger">Something went wrong. Please try again.</AtlAlert>
        </div>
      );
    case 'code-block':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <AtlCodeBlock
            language="typescript"
            filename="greeting.ts"
            code={`import { AtlButton } from '@atelier-ui/react';\n\nexport function GreetingButton({ name }: { name: string }) {\n  return (\n    <AtlButton variant="primary">\n      Hello, {name}!\n    </AtlButton>\n  );\n}`}
          />
        </div>
      );
    case 'menu':
      return (
        <AtlAlert variant="info">
          Menu is built on @angular/cdk/menu. See the <strong>Data List with Actions</strong> cookbook pattern for a live interactive demo.
        </AtlAlert>
      );
    case 'toast':
      return (
        <AtlAlert variant="info">
          Toast requires <code>AtlToastProvider</code> wrapping your app root.
          Use the <code>useAtlToast()</code> hook to show toasts imperatively.
        </AtlAlert>
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
        <h2>Component not found</h2>
        <p>The component <code>{name}</code> does not exist in this library.</p>
        <a href="/components" className="docs-btn docs-btn-primary">Back to components</a>
      </div>
    );
  }

  const category = getCategory(name);
  const categoryTone = CATEGORY_TONE[category] ?? 'primary';
  const importSymbols = IMPORT_MAP[name] ?? [];

  return (
    <>
      {/* Breadcrumb is now rendered once at the layout level (BaseLayout) for
          every nested route, so the in-island trail was removed to avoid a
          duplicate. */}

      {/* Page header */}
      <div className="docs-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className={`docs-category-tag docs-category-tag--${categoryTone}`}>
            {category}
          </span>
          {doc.status && (
            <span className={`docs-status-badge docs-status-badge--${doc.status}`}>{doc.status}</span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="docs-page-h1">{doc.name}</h1>
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
                type="button"
                aria-pressed={framework === fw}
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
          <CodeBlock lang={EXAMPLE_LANG[framework]} code={doc.examples[framework]} />
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
          <MultiCodeBlock symbols={importSymbols} framework={framework} />
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
          href={storybookDocsUrl(framework, name, category, doc.selector)}
          target="_blank"
          rel="noopener noreferrer"
          className="docs-btn docs-btn-outline"
        >
          Explore in Storybook
        </a>
      </div>

      {/* AI Usage */}
      {doc.aiUsage && (
        <div className="docs-section docs-ai-usage">
          <h2 className="docs-section-title">Prototyping with AI</h2>
          <div className="docs-ai-grid">
            <div className="docs-ai-card docs-ai-best-practices">
              <h3 className="docs-ai-card-title">Best practices</h3>
              <ul className="docs-ai-list">
                {doc.aiUsage.bestPractices.map((bp, i) => <li key={i}>{bp}</li>)}
              </ul>
            </div>
            <div className="docs-ai-card docs-ai-hallucinations">
              <h3 className="docs-ai-card-title">Common hallucinations</h3>
              <ul className="docs-ai-list">
                {doc.aiUsage.commonHallucinations.map((ch, i) => <li key={i}>{ch}</li>)}
              </ul>
            </div>
            <div className="docs-ai-card docs-ai-prompt" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 className="docs-ai-card-title" style={{ marginBottom: 0 }}>Example prompt</h3>
                <button
                  className="docs-btn docs-btn-outline docs-btn-sm"
                  onClick={() => doc.aiUsage && navigator.clipboard.writeText(doc.aiUsage.promptSnippet)}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Copy prompt
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
