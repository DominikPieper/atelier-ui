'use strict';

/**
 * Tests for atelier-template/atl-button-icon-only-needs-name. Run with
 * `node --test tools/eslint-rules/` (part of `npm run check:eslint-rules`). Every
 * branch of the rule has a valid and an invalid case; the false-positive cases from
 * the P3.3 spike (bound aria-label, an @if wrapper, interpolation) are named below.
 */

const rule = require('./atl-button-icon-only-needs-name');
const { run } = require('./template-rule-tester');

const missing = (extra = {}) => [{ messageId: 'missing', ...extra }];

const valid = {
  // The name attribute, in every spelling.
  'a static aria-label': `<atl-button aria-label="Close"><atl-icon name="close" /></atl-button>`,
  'a bound [attr.aria-label] (spike false positive)': `<atl-button [attr.aria-label]="closeLabel"><atl-icon name="close" /></atl-button>`,
  'a bound [aria-label]': `<atl-button [aria-label]="closeLabel"><atl-icon name="close" /></atl-button>`,
  'an interpolated aria-label': `<atl-button aria-label="Close {{ name }}"><atl-icon name="close" /></atl-button>`,
  'aria-labelledby': `<atl-button aria-labelledby="title-id"><atl-icon name="close" /></atl-button>`,
  'a bound [attr.aria-labelledby]': `<atl-button [attr.aria-labelledby]="id"><atl-icon name="close" /></atl-button>`,

  // The name from content.
  'visible text': `<atl-button>Save</atl-button>`,
  'text beside an icon': `<atl-button><atl-icon name="save" /> Save</atl-button>`,
  'an interpolation (spike false positive)': `<atl-button>{{ label }}</atl-button>`,
  'an icon plus visually-hidden text': `<atl-button><atl-icon name="close" /><span class="visually-hidden">Close</span></atl-button>`,
  'a labelled icon': `<atl-button><atl-icon name="close" label="Close" /></atl-button>`,
  'a bound icon label': `<atl-button><atl-icon name="close" [label]="closeLabel" /></atl-button>`,
  'content passed through with ng-content': `<atl-button><ng-content /></atl-button>`,
  'an icon plus ng-content': `<atl-button><atl-icon name="close" /><ng-content /></atl-button>`,
  'an ng-container child': `<atl-button><ng-container *ngTemplateOutlet="tpl" /></atl-button>`,
  'an ng-template child': `<atl-button><ng-template #t><atl-icon name="close" /></ng-template></atl-button>`,
  'any other element beside the icon': `<atl-button><atl-icon name="close" /><b>x</b></atl-button>`,
  'a [innerHTML] binding': `<atl-button [innerHTML]="html"></atl-button>`,
  'a [textContent] binding': `<atl-button [textContent]="text"></atl-button>`,

  // Wrappers.
  'a button wrapped in @if, named (spike false positive)': `@if (show) { <atl-button aria-label="Close"><atl-icon name="close" /></atl-button> }`,
  'text inside an @if beside the icon': `<atl-button><atl-icon name="close" />@if (wide) { Close }</atl-button>`,
  'text in one @if branch, an icon in the other': `<atl-button>@if (wide) { Close } @else { <atl-icon name="close" /> }</atl-button>`,
  'text inside a @for': `<atl-button>@for (w of words; track w) { {{ w }} }</atl-button>`,
  'text inside a @switch case': `<atl-button>@switch (m) { @case (1) { One } @default { <atl-icon name="a" /> } }</atl-button>`,
  'text in the @empty block of a @for': `<atl-button>@for (i of items; track i) { <atl-icon name="dot" /> } @empty { None }</atl-button>`,
  'text inside a @defer block': `<atl-button>@defer { Save }</atl-button>`,
  'text under an *ngIf': `<atl-button><span *ngIf="x">Close</span></atl-button>`,

  // Other elements are none of this rule's business.
  'an icon in another atl component': `<atl-card><atl-icon name="close" /></atl-card>`,
  'an icon in a native button': `<button><atl-icon name="close" /></button>`,
  'a button with no atl- prefix': `<my-button><atl-icon name="close" /></my-button>`,
};

const invalid = {
  'a lone icon': {
    code: `<atl-button><atl-icon name="close" /></atl-button>`,
    errors: missing({ line: 1, column: 1 }),
  },
  'a lone icon, reported on the open tag only': {
    code: `<div>\n  <atl-button variant="ghost">\n    <atl-icon name="close" />\n  </atl-button>\n</div>`,
    errors: missing({ line: 2, column: 3, endLine: 2, endColumn: 31 }),
  },
  'two icons with whitespace between': {
    code: `<atl-button>\n  <atl-icon name="a" />\n  <atl-icon name="b" />\n</atl-button>`,
    errors: missing(),
  },
  'an empty button': {
    code: `<atl-button></atl-button>`,
    errors: missing(),
  },
  'a self-closing button': {
    code: `<atl-button />`,
    errors: missing(),
  },
  'a button with only whitespace': {
    code: `<atl-button>   \n  </atl-button>`,
    errors: missing(),
  },
  'a title is not an accessible name here': {
    code: `<atl-button title="Close"><atl-icon name="close" /></atl-button>`,
    errors: missing(),
  },
  'an unrelated aria attribute does not name it': {
    code: `<atl-button aria-describedby="hint"><atl-icon name="close" /></atl-button>`,
    errors: missing(),
  },
  'an aria-label look-alike on the icon only': {
    code: `<atl-button><atl-icon name="close" aria-label="Close" /></atl-button>`,
    errors: missing(),
  },
  'an @if wrapping the button': {
    code: `@if (show) { <atl-button><atl-icon name="close" /></atl-button> }`,
    errors: missing(),
  },
  'a @for wrapping the button': {
    code: `@for (a of actions; track a) { <atl-button><atl-icon [name]="a.icon" /></atl-button> }`,
    errors: missing(),
  },
  'an @if holding only an icon inside the button': {
    code: `<atl-button>@if (open) { <atl-icon name="close" /> }</atl-button>`,
    errors: missing(),
  },
  'an @if / @else holding only icons': {
    code: `<atl-button>@if (open) { <atl-icon name="up" /> } @else { <atl-icon name="down" /> }</atl-button>`,
    errors: missing(),
  },
  'a @for holding only an icon': {
    code: `<atl-button>@for (i of items; track i) { <atl-icon name="dot" /> }</atl-button>`,
    errors: missing(),
  },
  'a @switch of icons': {
    code: `<atl-button>@switch (m) { @case (1) { <atl-icon name="a" /> } @default { <atl-icon name="b" /> } }</atl-button>`,
    errors: missing(),
  },
  'an *ngIf icon': {
    code: `<atl-button><atl-icon *ngIf="x" name="close" /></atl-button>`,
    errors: missing(),
  },
  'two buttons, one named': {
    code: `<atl-button aria-label="Close"><atl-icon name="close" /></atl-button><atl-button><atl-icon name="more" /></atl-button>`,
    errors: missing({ line: 1, column: 70 }),
  },
  'a nested unnamed button is reported separately': {
    code: `<atl-card><atl-button><atl-icon name="a" /></atl-button><atl-button>Go</atl-button></atl-card>`,
    errors: missing(),
  },
};

run('atl-button-icon-only-needs-name', rule, { valid, invalid });
