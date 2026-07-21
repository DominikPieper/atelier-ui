import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlTextareaSpec'],
  purpose:
    'Multi-line text field. Renders a `<textarea>` sized for wrapping prose, with optional auto-resize as content grows.',
  whenToUse: [
    'Collecting a description, comment, or message body where line breaks are part of the input.',
    'Capturing a code snippet, log paste, or long-form note.',
    'Editing freeform content where the visible height should grow with the text (`autoResize: true`).',
  ],
  antiPatterns: [
    {
      pattern: 'Collecting a single short value such as a title or email.',
      useInstead: 'AtlInput — sized for one-line entry with type-specific keyboard hints.',
    },
    {
      pattern: 'Building a rich-text editor with formatting toolbars.',
      useInstead: 'A dedicated editor (Tiptap, Lexical) — textarea is plain text only.',
    },
  ],
  relatedComponents: ['AtlInputSpec'],
  variantMatrix: [
    { rows: 3, autoResize: false },
    { rows: 6, autoResize: false },
    { rows: 3, autoResize: true },
    { rows: 3, disabled: true },
    { rows: 3, invalid: true },
    { rows: 3, readonly: true },
  ],
  accessibility: {
    role: 'textbox',
    keyboardBehavior:
      'Receives focus via Tab. Enter inserts a newline (it does not submit). Arrow keys, Home/End, and PageUp/PageDown navigate within the text. `invalid` toggles `aria-invalid`, `required` toggles `aria-required`.',
  },
};
