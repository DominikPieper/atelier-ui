import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader } from '../accordion/llm-accordion';
import { LlmAlert } from '../alert/llm-alert';
import { LlmAvatar, LlmAvatarGroup } from '../avatar/llm-avatar';
import { LlmBadge } from '../badge/llm-badge';
import { LlmBreadcrumbs, LlmBreadcrumbItem } from '../breadcrumbs/llm-breadcrumbs';
import { LlmButton } from '../button/llm-button';
import { LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter } from '../card/llm-card';
import { LlmCheckbox } from '../checkbox/llm-checkbox';
import { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter } from '../dialog/llm-dialog';
import { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter } from '../drawer/llm-drawer';
import { LlmInput } from '../input/llm-input';
import { LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger } from '../menu/llm-menu';
import { LlmPagination } from '../pagination/llm-pagination';
import { LlmProgress } from '../progress/llm-progress';
import { LlmRadioGroup } from '../radio-group/llm-radio-group';
import { LlmRadio } from '../radio/llm-radio';
import { LlmSelect, LlmOption } from '../select/llm-select';
import { LlmSkeleton } from '../skeleton/llm-skeleton';
import { LlmTabGroup, LlmTab } from '../tabs/llm-tabs';
import { LlmTextarea } from '../textarea/llm-textarea';
import { LlmToastProvider, LlmToastContainer, useLlmToast } from '../toast/llm-toast';
import { LlmToggle } from '../toggle/llm-toggle';
import { LlmTooltip } from '../tooltip/llm-tooltip';

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--ui-color-border, #e5e7eb)',
          color: 'var(--ui-color-text, #111827)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}

// ─── Toast section (needs hook inside provider) ───────────────────────────────

function ToastTriggers() {
  const { show } = useLlmToast();
  return (
    <Row>
      <LlmButton size="sm" onClick={() => show('Saved!', { variant: 'success' })}>
        Success
      </LlmButton>
      <LlmButton size="sm" variant="secondary" onClick={() => show('Something went wrong', { variant: 'danger' })}>
        Danger
      </LlmButton>
      <LlmButton size="sm" variant="outline" onClick={() => show('New message', { variant: 'info' })}>
        Info
      </LlmButton>
      <LlmButton size="sm" variant="outline" onClick={() => show('Check your settings', { variant: 'warning' })}>
        Warning
      </LlmButton>
      <LlmToastContainer position="bottom-right" />
    </Row>
  );
}

// ─── Full Showcase Component ──────────────────────────────────────────────────

function Showcase() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [toggleOn, setToggleOn] = useState(true);
  const [radioValue, setRadioValue] = useState('pro');
  const [selectValue, setSelectValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [page, setPage] = useState(3);
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <LlmToastProvider>
      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Component Showcase
          </h1>
          <p style={{ color: 'var(--ui-color-text-muted)', fontSize: '0.9rem' }}>
            All available React components at a glance.
          </p>
        </header>

        {/* ── Button ──────────────────────────────────────────────── */}
        <Section title="Button">
          <Row>
            <LlmButton variant="primary">Primary</LlmButton>
            <LlmButton variant="secondary">Secondary</LlmButton>
            <LlmButton variant="outline">Outline</LlmButton>
            <LlmButton variant="primary" disabled>Disabled</LlmButton>
            <LlmButton variant="primary" loading>Loading</LlmButton>
          </Row>
          <Row>
            <LlmButton size="sm">Small</LlmButton>
            <LlmButton size="md">Medium</LlmButton>
            <LlmButton size="lg">Large</LlmButton>
          </Row>
        </Section>

        {/* ── Badge ───────────────────────────────────────────────── */}
        <Section title="Badge">
          <Row>
            <LlmBadge variant="default">Default</LlmBadge>
            <LlmBadge variant="success">Success</LlmBadge>
            <LlmBadge variant="warning">Warning</LlmBadge>
            <LlmBadge variant="danger">Danger</LlmBadge>
            <LlmBadge variant="info">Info</LlmBadge>
            <LlmBadge variant="success" size="sm">Small</LlmBadge>
          </Row>
        </Section>

        {/* ── Avatar ──────────────────────────────────────────────── */}
        <Section title="Avatar & AvatarGroup">
          <Row>
            <LlmAvatar name="Alice Chen" size="xs" />
            <LlmAvatar name="Bob Smith" size="sm" status="online" />
            <LlmAvatar name="Carol Jones" size="md" status="away" />
            <LlmAvatar name="Dave Brown" size="lg" shape="square" />
            <LlmAvatar name="Eve Wilson" size="xl" status="busy" />
          </Row>
          <Row>
            <LlmAvatarGroup max={3} size="md">
              <LlmAvatar name="Alice Chen" />
              <LlmAvatar name="Bob Smith" />
              <LlmAvatar name="Carol Jones" />
              <LlmAvatar name="Dave Brown" />
              <LlmAvatar name="Eve Wilson" />
            </LlmAvatarGroup>
          </Row>
        </Section>

        {/* ── Alert ───────────────────────────────────────────────── */}
        <Section title="Alert">
          <LlmAlert variant="info">This is an info alert.</LlmAlert>
          <LlmAlert variant="success">Your changes were saved successfully.</LlmAlert>
          <LlmAlert variant="warning">Your session will expire in 5 minutes.</LlmAlert>
          <LlmAlert variant="danger">Something went wrong. Please try again.</LlmAlert>
          <LlmAlert variant="info" dismissible>This alert can be dismissed.</LlmAlert>
        </Section>

        {/* ── Card ────────────────────────────────────────────────── */}
        <Section title="Card">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {(['elevated', 'outlined', 'flat'] as const).map((v) => (
              <LlmCard key={v} variant={v} padding="md" style={{ flex: '1', minWidth: '180px' }}>
                <LlmCardHeader>{v.charAt(0).toUpperCase() + v.slice(1)}</LlmCardHeader>
                <LlmCardContent>Card content goes here.</LlmCardContent>
                <LlmCardFooter>
                  <LlmButton size="sm">Action</LlmButton>
                </LlmCardFooter>
              </LlmCard>
            ))}
          </div>
        </Section>

        {/* ── Input & Textarea ────────────────────────────────────── */}
        <Section title="Input">
          <Row>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <LlmInput placeholder="Text input" value={inputValue} onValueChange={setInputValue} />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <LlmInput type="email" placeholder="Email input" />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <LlmInput placeholder="Invalid state" invalid />
            </div>
          </Row>
        </Section>

        <Section title="Textarea">
          <LlmTextarea
            placeholder="Write something here…"
            rows={3}
            value={textareaValue}
            onValueChange={setTextareaValue}
          />
          <LlmTextarea placeholder="Auto-resize" autoResize />
        </Section>

        {/* ── Checkbox & Toggle ───────────────────────────────────── */}
        <Section title="Checkbox">
          <Row>
            <LlmCheckbox checked={checkboxChecked} onCheckedChange={setCheckboxChecked}>
              Accept terms and conditions
            </LlmCheckbox>
            <LlmCheckbox checked indeterminate>
              Indeterminate
            </LlmCheckbox>
            <LlmCheckbox checked disabled>
              Disabled
            </LlmCheckbox>
          </Row>
        </Section>

        <Section title="Toggle">
          <Row>
            <LlmToggle checked={toggleOn} onCheckedChange={setToggleOn}>
              Enable notifications
            </LlmToggle>
            <LlmToggle checked={false} disabled>
              Disabled
            </LlmToggle>
          </Row>
        </Section>

        {/* ── Radio & Select ──────────────────────────────────────── */}
        <Section title="RadioGroup">
          <LlmRadioGroup value={radioValue} onValueChange={setRadioValue} name="plan">
            <Row>
              <LlmRadio radioValue="free">Free</LlmRadio>
              <LlmRadio radioValue="pro">Pro</LlmRadio>
              <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
              <LlmRadio radioValue="legacy" disabled>Legacy (disabled)</LlmRadio>
            </Row>
          </LlmRadioGroup>
        </Section>

        <Section title="Select">
          <div style={{ maxWidth: '300px' }}>
            <LlmSelect value={selectValue} onValueChange={setSelectValue} placeholder="Select a country">
              <LlmOption optionValue="us">United States</LlmOption>
              <LlmOption optionValue="ca">Canada</LlmOption>
              <LlmOption optionValue="uk">United Kingdom</LlmOption>
              <LlmOption optionValue="de">Germany</LlmOption>
              <LlmOption optionValue="jp" disabled>Japan (unavailable)</LlmOption>
            </LlmSelect>
          </div>
        </Section>

        {/* ── Progress ────────────────────────────────────────────── */}
        <Section title="Progress">
          <LlmProgress value={20} />
          <LlmProgress value={50} variant="success" />
          <LlmProgress value={75} variant="warning" />
          <LlmProgress value={90} variant="danger" size="lg" />
          <LlmProgress indeterminate />
        </Section>

        {/* ── Skeleton ────────────────────────────────────────────── */}
        <Section title="Skeleton">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <LlmSkeleton variant="circular" width="48px" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <LlmSkeleton variant="text" width="40%" />
              <LlmSkeleton variant="text" />
              <LlmSkeleton variant="text" width="70%" />
            </div>
          </div>
          <LlmSkeleton variant="rectangular" height="80px" />
        </Section>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <Section title="Tabs">
          <LlmTabGroup selectedIndex={tabIndex} onSelectedIndexChange={setTabIndex}>
            <LlmTab label="Overview">Overview — general information about the item.</LlmTab>
            <LlmTab label="Details">Detailed specifications and technical information.</LlmTab>
            <LlmTab label="History">Historical records and activity log.</LlmTab>
            <LlmTab label="Disabled" disabled>Not accessible.</LlmTab>
          </LlmTabGroup>
          <LlmTabGroup variant="pills">
            <LlmTab label="All">All items shown here.</LlmTab>
            <LlmTab label="Active">Only active items.</LlmTab>
            <LlmTab label="Archived">Archived items.</LlmTab>
          </LlmTabGroup>
        </Section>

        {/* ── Accordion ───────────────────────────────────────────── */}
        <Section title="Accordion">
          <LlmAccordionGroup variant="bordered">
            <LlmAccordionItem>
              <LlmAccordionHeader>What is this component library?</LlmAccordionHeader>
              A set of accessible, composable UI components built for LLM-generated applications.
            </LlmAccordionItem>
            <LlmAccordionItem>
              <LlmAccordionHeader>How do I get started?</LlmAccordionHeader>
              Import any component from <code>@atelier-ui/react</code>.
            </LlmAccordionItem>
            <LlmAccordionItem disabled>
              <LlmAccordionHeader>Disabled section</LlmAccordionHeader>
              This is not accessible.
            </LlmAccordionItem>
          </LlmAccordionGroup>
        </Section>

        {/* ── Breadcrumbs ─────────────────────────────────────────── */}
        <Section title="Breadcrumbs">
          <LlmBreadcrumbs>
            <LlmBreadcrumbItem href="#">Home</LlmBreadcrumbItem>
            <LlmBreadcrumbItem href="#">Products</LlmBreadcrumbItem>
            <LlmBreadcrumbItem href="#">Category</LlmBreadcrumbItem>
            <LlmBreadcrumbItem>Current Page</LlmBreadcrumbItem>
          </LlmBreadcrumbs>
        </Section>

        {/* ── Pagination ──────────────────────────────────────────── */}
        <Section title="Pagination">
          <LlmPagination page={page} totalPages={10} onPageChange={setPage} />
        </Section>

        {/* ── Tooltip ─────────────────────────────────────────────── */}
        <Section title="Tooltip">
          <Row>
            <LlmTooltip llmTooltip="Appears above (default)">
              <LlmButton variant="outline" size="sm">Above</LlmButton>
            </LlmTooltip>
            <LlmTooltip llmTooltip="Appears below" llmTooltipPosition="below">
              <LlmButton variant="outline" size="sm">Below</LlmButton>
            </LlmTooltip>
            <LlmTooltip llmTooltip="Appears to the right" llmTooltipPosition="right">
              <LlmButton variant="outline" size="sm">Right</LlmButton>
            </LlmTooltip>
            <LlmTooltip llmTooltip="Appears to the left" llmTooltipPosition="left">
              <LlmButton variant="outline" size="sm">Left</LlmButton>
            </LlmTooltip>
          </Row>
        </Section>

        {/* ── Menu ────────────────────────────────────────────────── */}
        <Section title="Menu">
          <Row>
            <LlmMenuTrigger
              menu={
                <LlmMenu>
                  <LlmMenuItem>Edit</LlmMenuItem>
                  <LlmMenuItem>Duplicate</LlmMenuItem>
                  <LlmMenuSeparator />
                  <LlmMenuItem>Archive</LlmMenuItem>
                  <LlmMenuItem disabled>Delete (disabled)</LlmMenuItem>
                </LlmMenu>
              }
            >
              {({ onClick, ref }) => (
                <LlmButton variant="outline" size="sm" onClick={onClick} ref={ref as React.RefObject<HTMLButtonElement>}>
                  Open Menu ▾
                </LlmButton>
              )}
            </LlmMenuTrigger>
          </Row>
        </Section>

        {/* ── Dialog ──────────────────────────────────────────────── */}
        <Section title="Dialog">
          <Row>
            <LlmButton onClick={() => setDialogOpen(true)}>Open Dialog</LlmButton>
          </Row>
          <LlmDialog open={dialogOpen} onOpenChange={setDialogOpen} size="sm">
            <LlmDialogHeader>Confirm Action</LlmDialogHeader>
            <LlmDialogContent>
              Are you sure you want to proceed? This action cannot be undone.
            </LlmDialogContent>
            <LlmDialogFooter>
              <LlmButton variant="outline" onClick={() => setDialogOpen(false)}>Cancel</LlmButton>
              <LlmButton variant="primary" onClick={() => setDialogOpen(false)}>Confirm</LlmButton>
            </LlmDialogFooter>
          </LlmDialog>
        </Section>

        {/* ── Drawer ──────────────────────────────────────────────── */}
        <Section title="Drawer">
          <Row>
            <LlmButton variant="outline" onClick={() => setDrawerOpen(true)}>Open Drawer</LlmButton>
          </Row>
          <LlmDrawer open={drawerOpen} onOpenChange={setDrawerOpen} position="right" size="md">
            <LlmDrawerHeader>Settings Panel</LlmDrawerHeader>
            <LlmDrawerContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <LlmInput placeholder="Display name" />
                <LlmToggle checked={toggleOn} onCheckedChange={setToggleOn}>
                  Email notifications
                </LlmToggle>
                <LlmToggle checked={false}>Push notifications</LlmToggle>
              </div>
            </LlmDrawerContent>
            <LlmDrawerFooter>
              <LlmButton variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</LlmButton>
              <LlmButton onClick={() => setDrawerOpen(false)}>Save</LlmButton>
            </LlmDrawerFooter>
          </LlmDrawer>
        </Section>

        {/* ── Toast ───────────────────────────────────────────────── */}
        <Section title="Toast">
          <ToastTriggers />
        </Section>
      </div>
    </LlmToastProvider>
  );
}

// ─── Story ───────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Showcase/All Components',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const AllComponents: Story = {
  render: () => <Showcase />,
};
