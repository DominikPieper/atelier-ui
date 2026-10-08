import type { ReactNode } from 'react';
import {
  AtlAccordionGroup,
  AtlAccordionHeader,
  AtlAccordionItem,
  AtlAlert,
  AtlAvatar,
  AtlAvatarGroup,
  AtlBadge,
  AtlBreadcrumbItem,
  AtlBreadcrumbs,
  AtlButton,
  AtlCard,
  AtlCardContent,
  AtlCardHeader,
  AtlChatMessage,
  AtlCheckbox,
  AtlCodeBlock,
  AtlCombobox,
  AtlIcon,
  AtlInput,
  AtlPagination,
  AtlProgress,
  AtlRadio,
  AtlRadioGroup,
  AtlSelect,
  AtlOption,
  AtlSkeleton,
  AtlStep,
  AtlStepper,
  AtlTab,
  AtlTabGroup,
  AtlTable,
  AtlTbody,
  AtlTd,
  AtlTh,
  AtlThead,
  AtlToastItem,
  AtlToggle,
  AtlTextarea,
  AtlTr,
} from '@atelier-ui/react';

/**
 * Gallery card previews: component name -> resting-state render function.
 * Rendered with the React adapter inside an inert, aria-hidden frame, so
 * nothing here is interactive. A name missing from this map falls back to the
 * monogram in ComponentGallery.
 *
 * Overlays never render open: dialog / drawer / menu / popover-likes show the
 * button that would open them, tooltip shows its trigger, toast renders the
 * item inline (no provider, no portal).
 */
export const COMPONENT_PREVIEWS: Record<string, () => ReactNode> = {
  button: () => <AtlButton variant="primary">Save changes</AtlButton>,
  input: () => <AtlInput type="email" placeholder="Email address" />,
  textarea: () => <AtlTextarea placeholder="Tell us more…" rows={2} />,
  checkbox: () => <AtlCheckbox checked={true}>Accept terms</AtlCheckbox>,
  toggle: () => <AtlToggle checked={true}>Notifications</AtlToggle>,
  'radio-group': () => (
    <AtlRadioGroup name="gallery-plan" value="pro">
      <AtlRadio radioValue="free">Free</AtlRadio>
      <AtlRadio radioValue="pro">Pro</AtlRadio>
    </AtlRadioGroup>
  ),
  select: () => (
    <AtlSelect label="Country" placeholder="Select a country" value="">
      <AtlOption optionValue="us">United States</AtlOption>
    </AtlSelect>
  ),
  combobox: () => (
    <AtlCombobox
      placeholder="Search country…"
      options={[{ value: 'de', label: 'Germany' }]}
    />
  ),
  badge: () => (
    <div className="docs-preview-row">
      <AtlBadge variant="success">Active</AtlBadge>
      <AtlBadge variant="warning">Pending</AtlBadge>
    </div>
  ),
  icon: () => (
    <div className="docs-preview-row">
      <AtlIcon name="check" size="lg" />
      <AtlIcon name="edit" size="lg" />
      <AtlIcon name="delete" size="lg" />
    </div>
  ),
  card: () => (
    <AtlCard>
      <AtlCardHeader>Project</AtlCardHeader>
      <AtlCardContent>Three open tasks.</AtlCardContent>
    </AtlCard>
  ),
  table: () => (
    <AtlTable aria-label="Preview">
      <AtlThead>
        <AtlTr>
          <AtlTh>Name</AtlTh>
          <AtlTh>Role</AtlTh>
        </AtlTr>
      </AtlThead>
      <AtlTbody>
        <AtlTr>
          <AtlTd>Jane</AtlTd>
          <AtlTd>Admin</AtlTd>
        </AtlTr>
      </AtlTbody>
    </AtlTable>
  ),
  avatar: () => (
    <AtlAvatarGroup max={3} size="md">
      <AtlAvatar name="Alice Johnson" />
      <AtlAvatar name="Bob Brown" />
      <AtlAvatar name="Carol White" />
      <AtlAvatar name="Dave Green" />
    </AtlAvatarGroup>
  ),
  skeleton: () => (
    <div className="docs-preview-stack">
      <AtlSkeleton variant="text" width="60%" />
      <AtlSkeleton variant="text" />
      <AtlSkeleton variant="text" width="80%" />
    </div>
  ),
  progress: () => <AtlProgress value={60} variant="success" />,
  'code-block': () => (
    <AtlCodeBlock code={`<AtlButton variant="primary">Hi</AtlButton>`} />
  ),
  breadcrumbs: () => (
    <AtlBreadcrumbs>
      <AtlBreadcrumbItem href="/">Home</AtlBreadcrumbItem>
      <AtlBreadcrumbItem>Button</AtlBreadcrumbItem>
    </AtlBreadcrumbs>
  ),
  tabs: () => (
    <AtlTabGroup>
      <AtlTab label="Account">Account</AtlTab>
      <AtlTab label="Billing">Billing</AtlTab>
    </AtlTabGroup>
  ),
  stepper: () => (
    <AtlStepper activeStep={1}>
      <AtlStep label="Account" completed={true}>
        {null}
      </AtlStep>
      <AtlStep label="Profile">{null}</AtlStep>
    </AtlStepper>
  ),
  pagination: () => <AtlPagination page={2} pageCount={4} siblingCount={0} />,
  // Overlays and portal users: resting state only, never open.
  menu: () => <AtlButton variant="outline">Actions</AtlButton>,
  dialog: () => <AtlButton variant="primary">Open dialog</AtlButton>,
  drawer: () => <AtlButton variant="outline">Open drawer</AtlButton>,
  tooltip: () => <AtlButton variant="primary">Save</AtlButton>,
  toast: () => (
    <AtlToastItem
      data={{
        id: 'preview',
        message: 'Changes saved',
        variant: 'success',
        dismissible: true,
      }}
      onDismiss={() => undefined}
    />
  ),
  accordion: () => (
    <AtlAccordionGroup variant="bordered">
      <AtlAccordionItem>
        <AtlAccordionHeader>Shipping</AtlAccordionHeader>
        Ships in two days.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Returns</AtlAccordionHeader>
        Thirty days.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
  alert: () => <AtlAlert variant="info">Your trial ends in 3 days.</AtlAlert>,
  // Static messages only: the inline chat surface reserves 24rem of height.
  chat: () => (
    <div className="docs-preview-stack">
      <AtlChatMessage role="user">Summarise this page</AtlChatMessage>
      <AtlChatMessage role="assistant">Sure, here you go.</AtlChatMessage>
    </div>
  ),
};
