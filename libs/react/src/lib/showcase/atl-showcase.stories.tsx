import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader } from '../accordion/atl-accordion';
import { AtlAlert } from '../alert/atl-alert';
import { AtlAvatar, AtlAvatarGroup } from '../avatar/atl-avatar';
import { AtlBadge } from '../badge/atl-badge';
import { AtlBreadcrumbs, AtlBreadcrumbItem } from '../breadcrumbs/atl-breadcrumbs';
import { AtlButton } from '../button/atl-button';
import { AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter } from '../card/atl-card';
import { AtlCheckbox } from '../checkbox/atl-checkbox';
import { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter } from '../dialog/atl-dialog';
import { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter } from '../drawer/atl-drawer';
import { AtlInput } from '../input/atl-input';
import { AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger } from '../menu/atl-menu';
import { AtlPagination } from '../pagination/atl-pagination';
import { AtlProgress } from '../progress/atl-progress';
import { AtlRadioGroup } from '../radio-group/atl-radio-group';
import { AtlRadio } from '../radio/atl-radio';
import { AtlSelect, AtlOption } from '../select/atl-select';
import { AtlSkeleton } from '../skeleton/atl-skeleton';
import { AtlTabGroup, AtlTab } from '../tabs/atl-tabs';
import { AtlTextarea } from '../textarea/atl-textarea';
import { AtlToastProvider, AtlToastContainer, useAtlToast } from '../toast/atl-toast';
import { AtlToggle } from '../toggle/atl-toggle';
import { AtlTooltip } from '../tooltip/atl-tooltip';

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
  const { show } = useAtlToast();
  return (
    <Row>
      <AtlButton size="sm" onClick={() => show('Saved!', { variant: 'success' })}>
        Success
      </AtlButton>
      <AtlButton size="sm" variant="secondary" onClick={() => show('Something went wrong', { variant: 'danger' })}>
        Danger
      </AtlButton>
      <AtlButton size="sm" variant="outline" onClick={() => show('New message', { variant: 'info' })}>
        Info
      </AtlButton>
      <AtlButton size="sm" variant="outline" onClick={() => show('Check your settings', { variant: 'warning' })}>
        Warning
      </AtlButton>
      <AtlToastContainer position="bottom-right" />
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
    <AtlToastProvider>
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
            <AtlButton variant="primary">Primary</AtlButton>
            <AtlButton variant="secondary">Secondary</AtlButton>
            <AtlButton variant="outline">Outline</AtlButton>
            <AtlButton variant="primary" disabled>Disabled</AtlButton>
            <AtlButton variant="primary" loading>Loading</AtlButton>
          </Row>
          <Row>
            <AtlButton size="sm">Small</AtlButton>
            <AtlButton size="md">Medium</AtlButton>
            <AtlButton size="lg">Large</AtlButton>
          </Row>
        </Section>

        {/* ── Badge ───────────────────────────────────────────────── */}
        <Section title="Badge">
          <Row>
            <AtlBadge variant="default">Default</AtlBadge>
            <AtlBadge variant="success">Success</AtlBadge>
            <AtlBadge variant="warning">Warning</AtlBadge>
            <AtlBadge variant="danger">Danger</AtlBadge>
            <AtlBadge variant="info">Info</AtlBadge>
            <AtlBadge variant="success" size="sm">Small</AtlBadge>
          </Row>
        </Section>

        {/* ── Avatar ──────────────────────────────────────────────── */}
        <Section title="Avatar & AvatarGroup">
          <Row>
            <AtlAvatar name="Alice Chen" size="xs" />
            <AtlAvatar name="Bob Smith" size="sm" status="online" />
            <AtlAvatar name="Carol Jones" size="md" status="away" />
            <AtlAvatar name="Dave Brown" size="lg" shape="square" />
            <AtlAvatar name="Eve Wilson" size="xl" status="busy" />
          </Row>
          <Row>
            <AtlAvatarGroup max={3} size="md">
              <AtlAvatar name="Alice Chen" />
              <AtlAvatar name="Bob Smith" />
              <AtlAvatar name="Carol Jones" />
              <AtlAvatar name="Dave Brown" />
              <AtlAvatar name="Eve Wilson" />
            </AtlAvatarGroup>
          </Row>
        </Section>

        {/* ── Alert ───────────────────────────────────────────────── */}
        <Section title="Alert">
          <AtlAlert variant="info">This is an info alert.</AtlAlert>
          <AtlAlert variant="success">Your changes were saved successfully.</AtlAlert>
          <AtlAlert variant="warning">Your session will expire in 5 minutes.</AtlAlert>
          <AtlAlert variant="danger">Something went wrong. Please try again.</AtlAlert>
          <AtlAlert variant="info" dismissible>This alert can be dismissed.</AtlAlert>
        </Section>

        {/* ── Card ────────────────────────────────────────────────── */}
        <Section title="Card">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {(['elevated', 'outlined', 'flat'] as const).map((v) => (
              <AtlCard key={v} variant={v} padding="md" style={{ flex: '1', minWidth: '180px' }}>
                <AtlCardHeader>{v.charAt(0).toUpperCase() + v.slice(1)}</AtlCardHeader>
                <AtlCardContent>Card content goes here.</AtlCardContent>
                <AtlCardFooter>
                  <AtlButton size="sm">Action</AtlButton>
                </AtlCardFooter>
              </AtlCard>
            ))}
          </div>
        </Section>

        {/* ── Input & Textarea ────────────────────────────────────── */}
        <Section title="Input">
          <Row>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <AtlInput placeholder="Text input" value={inputValue} onValueChange={setInputValue} />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <AtlInput type="email" placeholder="Email input" />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <AtlInput placeholder="Invalid state" invalid />
            </div>
          </Row>
        </Section>

        <Section title="Textarea">
          <AtlTextarea
            placeholder="Write something here…"
            rows={3}
            value={textareaValue}
            onValueChange={setTextareaValue}
          />
          <AtlTextarea placeholder="Auto-resize" autoResize />
        </Section>

        {/* ── Checkbox & Toggle ───────────────────────────────────── */}
        <Section title="Checkbox">
          <Row>
            <AtlCheckbox checked={checkboxChecked} onCheckedChange={setCheckboxChecked}>
              Accept terms and conditions
            </AtlCheckbox>
            <AtlCheckbox checked indeterminate>
              Indeterminate
            </AtlCheckbox>
            <AtlCheckbox checked disabled>
              Disabled
            </AtlCheckbox>
          </Row>
        </Section>

        <Section title="Toggle">
          <Row>
            <AtlToggle checked={toggleOn} onCheckedChange={setToggleOn}>
              Enable notifications
            </AtlToggle>
            <AtlToggle checked={false} disabled>
              Disabled
            </AtlToggle>
          </Row>
        </Section>

        {/* ── Radio & Select ──────────────────────────────────────── */}
        <Section title="RadioGroup">
          <AtlRadioGroup value={radioValue} onValueChange={setRadioValue} name="plan">
            <Row>
              <AtlRadio radioValue="free">Free</AtlRadio>
              <AtlRadio radioValue="pro">Pro</AtlRadio>
              <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
              <AtlRadio radioValue="legacy" disabled>Legacy (disabled)</AtlRadio>
            </Row>
          </AtlRadioGroup>
        </Section>

        <Section title="Select">
          <div style={{ maxWidth: '300px' }}>
            <AtlSelect value={selectValue} onValueChange={setSelectValue} placeholder="Select a country">
              <AtlOption optionValue="us">United States</AtlOption>
              <AtlOption optionValue="ca">Canada</AtlOption>
              <AtlOption optionValue="uk">United Kingdom</AtlOption>
              <AtlOption optionValue="de">Germany</AtlOption>
              <AtlOption optionValue="jp" disabled>Japan (unavailable)</AtlOption>
            </AtlSelect>
          </div>
        </Section>

        {/* ── Progress ────────────────────────────────────────────── */}
        <Section title="Progress">
          <AtlProgress value={20} />
          <AtlProgress value={50} variant="success" />
          <AtlProgress value={75} variant="warning" />
          <AtlProgress value={90} variant="danger" size="lg" />
          <AtlProgress indeterminate />
        </Section>

        {/* ── Skeleton ────────────────────────────────────────────── */}
        <Section title="Skeleton">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <AtlSkeleton variant="circular" width="48px" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <AtlSkeleton variant="text" width="40%" />
              <AtlSkeleton variant="text" />
              <AtlSkeleton variant="text" width="70%" />
            </div>
          </div>
          <AtlSkeleton variant="rectangular" height="80px" />
        </Section>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <Section title="Tabs">
          <AtlTabGroup selectedIndex={tabIndex} onSelectedIndexChange={setTabIndex}>
            <AtlTab label="Overview">Overview — general information about the item.</AtlTab>
            <AtlTab label="Details">Detailed specifications and technical information.</AtlTab>
            <AtlTab label="History">Historical records and activity log.</AtlTab>
            <AtlTab label="Disabled" disabled>Not accessible.</AtlTab>
          </AtlTabGroup>
          <AtlTabGroup variant="pills">
            <AtlTab label="All">All items shown here.</AtlTab>
            <AtlTab label="Active">Only active items.</AtlTab>
            <AtlTab label="Archived">Archived items.</AtlTab>
          </AtlTabGroup>
        </Section>

        {/* ── Accordion ───────────────────────────────────────────── */}
        <Section title="Accordion">
          <AtlAccordionGroup variant="bordered">
            <AtlAccordionItem>
              <AtlAccordionHeader>What is this component library?</AtlAccordionHeader>
              A set of accessible, composable UI components built for LLM-generated applications.
            </AtlAccordionItem>
            <AtlAccordionItem>
              <AtlAccordionHeader>How do I get started?</AtlAccordionHeader>
              Import any component from <code>@atelier-ui/react</code>.
            </AtlAccordionItem>
            <AtlAccordionItem disabled>
              <AtlAccordionHeader>Disabled section</AtlAccordionHeader>
              This is not accessible.
            </AtlAccordionItem>
          </AtlAccordionGroup>
        </Section>

        {/* ── Breadcrumbs ─────────────────────────────────────────── */}
        <Section title="Breadcrumbs">
          <AtlBreadcrumbs>
            <AtlBreadcrumbItem href="#">Home</AtlBreadcrumbItem>
            <AtlBreadcrumbItem href="#">Products</AtlBreadcrumbItem>
            <AtlBreadcrumbItem href="#">Category</AtlBreadcrumbItem>
            <AtlBreadcrumbItem>Current Page</AtlBreadcrumbItem>
          </AtlBreadcrumbs>
        </Section>

        {/* ── Pagination ──────────────────────────────────────────── */}
        <Section title="Pagination">
          <AtlPagination page={page} totalPages={10} onPageChange={setPage} />
        </Section>

        {/* ── Tooltip ─────────────────────────────────────────────── */}
        <Section title="Tooltip">
          <Row>
            <AtlTooltip atlTooltip="Appears above (default)">
              <AtlButton variant="outline" size="sm">Above</AtlButton>
            </AtlTooltip>
            <AtlTooltip atlTooltip="Appears below" atlTooltipPosition="below">
              <AtlButton variant="outline" size="sm">Below</AtlButton>
            </AtlTooltip>
            <AtlTooltip atlTooltip="Appears to the right" atlTooltipPosition="right">
              <AtlButton variant="outline" size="sm">Right</AtlButton>
            </AtlTooltip>
            <AtlTooltip atlTooltip="Appears to the left" atlTooltipPosition="left">
              <AtlButton variant="outline" size="sm">Left</AtlButton>
            </AtlTooltip>
          </Row>
        </Section>

        {/* ── Menu ────────────────────────────────────────────────── */}
        <Section title="Menu">
          <Row>
            <AtlMenuTrigger
              menu={
                <AtlMenu>
                  <AtlMenuItem>Edit</AtlMenuItem>
                  <AtlMenuItem>Duplicate</AtlMenuItem>
                  <AtlMenuSeparator />
                  <AtlMenuItem>Archive</AtlMenuItem>
                  <AtlMenuItem disabled>Delete (disabled)</AtlMenuItem>
                </AtlMenu>
              }
            >
              {({ onClick, ref }) => (
                <AtlButton variant="outline" size="sm" onClick={onClick} ref={ref as React.RefObject<HTMLButtonElement>}>
                  Open Menu ▾
                </AtlButton>
              )}
            </AtlMenuTrigger>
          </Row>
        </Section>

        {/* ── Dialog ──────────────────────────────────────────────── */}
        <Section title="Dialog">
          <Row>
            <AtlButton onClick={() => setDialogOpen(true)}>Open Dialog</AtlButton>
          </Row>
          <AtlDialog open={dialogOpen} onOpenChange={setDialogOpen} size="sm">
            <AtlDialogHeader>Confirm Action</AtlDialogHeader>
            <AtlDialogContent>
              Are you sure you want to proceed? This action cannot be undone.
            </AtlDialogContent>
            <AtlDialogFooter>
              <AtlButton variant="outline" onClick={() => setDialogOpen(false)}>Cancel</AtlButton>
              <AtlButton variant="primary" onClick={() => setDialogOpen(false)}>Confirm</AtlButton>
            </AtlDialogFooter>
          </AtlDialog>
        </Section>

        {/* ── Drawer ──────────────────────────────────────────────── */}
        <Section title="Drawer">
          <Row>
            <AtlButton variant="outline" onClick={() => setDrawerOpen(true)}>Open Drawer</AtlButton>
          </Row>
          <AtlDrawer open={drawerOpen} onOpenChange={setDrawerOpen} position="right" size="md">
            <AtlDrawerHeader>Settings Panel</AtlDrawerHeader>
            <AtlDrawerContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AtlInput placeholder="Display name" />
                <AtlToggle checked={toggleOn} onCheckedChange={setToggleOn}>
                  Email notifications
                </AtlToggle>
                <AtlToggle checked={false}>Push notifications</AtlToggle>
              </div>
            </AtlDrawerContent>
            <AtlDrawerFooter>
              <AtlButton variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</AtlButton>
              <AtlButton onClick={() => setDrawerOpen(false)}>Save</AtlButton>
            </AtlDrawerFooter>
          </AtlDrawer>
        </Section>

        {/* ── Toast ───────────────────────────────────────────────── */}
        <Section title="Toast">
          <ToastTriggers />
        </Section>
      </div>
    </AtlToastProvider>
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
