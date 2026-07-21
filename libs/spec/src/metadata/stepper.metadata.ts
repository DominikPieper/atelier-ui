import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlStepperSpec', 'AtlStepSpec'],
  purpose:
    'Multi-step progress indicator. Stepper owns the active index; each Step child labels one stage with completed/error/optional state.',
  whenToUse: [
    'Walking the user through a checkout, signup, or onboarding flow split across pages.',
    'Showing progress through a fixed sequence of tasks where the user can see what comes next.',
    'Enforcing order with `linear: true` so a later step cannot be jumped to until earlier ones complete.',
  ],
  antiPatterns: [
    {
      pattern: 'Navigating between sibling sections that have no inherent order.',
      useInstead: 'AtlTabGroup — tabs imply parallel views, steppers imply progression.',
    },
    {
      pattern: 'Reporting a single percentage or determinate loading state.',
      useInstead: 'A progress bar — steppers communicate discrete stages, not continuous progress.',
    },
    {
      pattern: 'Collapsing and expanding sections of a form on one page.',
      useInstead: 'AtlAccordionGroup — accordions are spatial, steppers are sequential.',
    },
  ],
  relatedComponents: ['AtlTabGroupSpec', 'AtlAccordionGroupSpec'],
  variantMatrix: [
    { orientation: 'horizontal', linear: true, activeStep: 0 },
    { orientation: 'horizontal', linear: true, activeStep: 1 },
    { orientation: 'horizontal', linear: false, activeStep: 2 },
    { orientation: 'vertical', linear: true, activeStep: 0 },
    { orientation: 'vertical', linear: false, activeStep: 1 },
  ],
  accessibility: {
    role: 'progressbar',
    keyboardBehavior:
      'The stepper itself is non-interactive — focus lives on the form controls and navigation buttons inside each step. Interactive step headers (when the flow is non-linear) accept focus via Tab and activate on Enter or Space.',
  },
};
