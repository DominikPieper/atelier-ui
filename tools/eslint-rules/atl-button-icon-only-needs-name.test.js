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
  'a static aria-label': `<button atl-button aria-label="Close"><atl-icon name="close" /></button>`,
  'a bound [attr.aria-label] (spike false positive)': `<button atl-button [attr.aria-label]="closeLabel"><atl-icon name="close" /></button>`,
  'a bound [aria-label]': `<button atl-button [aria-label]="closeLabel"><atl-icon name="close" /></button>`,
  'an interpolated aria-label': `<button atl-button aria-label="Close {{ name }}"><atl-icon name="close" /></button>`,
  'aria-labelledby': `<button atl-button aria-labelledby="title-id"><atl-icon name="close" /></button>`,
  'a bound [attr.aria-labelledby]': `<button atl-button [attr.aria-labelledby]="id"><atl-icon name="close" /></button>`,

  // The name from content.
  'visible text': `<button atl-button>Save</button>`,
  'text beside an icon': `<button atl-button><atl-icon name="save" /> Save</button>`,
  'an interpolation (spike false positive)': `<button atl-button>{{ label }}</button>`,
  'an icon plus visually-hidden text': `<button atl-button><atl-icon name="close" /><span class="visually-hidden">Close</span></button>`,
  'a labelled icon': `<button atl-button><atl-icon name="close" label="Close" /></button>`,
  'a bound icon label': `<button atl-button><atl-icon name="close" [label]="closeLabel" /></button>`,
  'content passed through with ng-content': `<button atl-button><ng-content /></button>`,
  'an icon plus ng-content': `<button atl-button><atl-icon name="close" /><ng-content /></button>`,
  'an ng-container child': `<button atl-button><ng-container *ngTemplateOutlet="tpl" /></button>`,
  'an ng-template child': `<button atl-button><ng-template #t><atl-icon name="close" /></ng-template></button>`,
  'any other element beside the icon': `<button atl-button><atl-icon name="close" /><b>x</b></button>`,
  'a [innerHTML] binding': `<button atl-button [innerHTML]="html"></button>`,
  'a [textContent] binding': `<button atl-button [textContent]="text"></button>`,

  // Wrappers.
  'a button wrapped in @if, named (spike false positive)': `@if (show) { <button atl-button aria-label="Close"><atl-icon name="close" /></button> }`,
  'text inside an @if beside the icon': `<button atl-button><atl-icon name="close" />@if (wide) { Close }</button>`,
  'text in one @if branch, an icon in the other': `<button atl-button>@if (wide) { Close } @else { <atl-icon name="close" /> }</button>`,
  'text inside a @for': `<button atl-button>@for (w of words; track w) { {{ w }} }</button>`,
  'text inside a @switch case': `<button atl-button>@switch (m) { @case (1) { One } @default { <atl-icon name="a" /> } }</button>`,
  'text in the @empty block of a @for': `<button atl-button>@for (i of items; track i) { <atl-icon name="dot" /> } @empty { None }</button>`,
  'text inside a @defer block': `<button atl-button>@defer { Save }</button>`,
  'text under an *ngIf': `<button atl-button><span *ngIf="x">Close</span></button>`,

  // Other elements are none of this rule's business.
  'an icon in another atl component': `<atl-card><atl-icon name="close" /></atl-card>`,
  'an icon in a plain native button (no atl-button attribute)': `<button><atl-icon name="close" /></button>`,
  "the retired <atl-button> element is not this rule's business": `<atl-button><atl-icon name="close" /></atl-button>`,
  'a button with no atl- prefix': `<my-button><atl-icon name="close" /></my-button>`,
};

const invalid = {
  'a lone icon': {
    code: `<button atl-button><atl-icon name="close" /></button>`,
    errors: missing({ line: 1, column: 1 }),
  },
  'a lone icon, reported on the open tag only': {
    code: `<div>\n  <button atl-button variant="ghost">\n    <atl-icon name="close" />\n  </button>\n</div>`,
    errors: missing({ line: 2, column: 3, endLine: 2, endColumn: 38 }),
  },
  'two icons with whitespace between': {
    code: `<button atl-button>\n  <atl-icon name="a" />\n  <atl-icon name="b" />\n</button>`,
    errors: missing(),
  },
  'an empty button': {
    code: `<button atl-button></button>`,
    errors: missing(),
  },
  'a button with only whitespace': {
    code: `<button atl-button>   \n  </button>`,
    errors: missing(),
  },
  'a title is not an accessible name here': {
    code: `<button atl-button title="Close"><atl-icon name="close" /></button>`,
    errors: missing(),
  },
  'an unrelated aria attribute does not name it': {
    code: `<button atl-button aria-describedby="hint"><atl-icon name="close" /></button>`,
    errors: missing(),
  },
  'an aria-label look-alike on the icon only': {
    code: `<button atl-button><atl-icon name="close" aria-label="Close" /></button>`,
    errors: missing(),
  },
  'an @if wrapping the button': {
    code: `@if (show) { <button atl-button><atl-icon name="close" /></button> }`,
    errors: missing(),
  },
  'a @for wrapping the button': {
    code: `@for (a of actions; track a) { <button atl-button><atl-icon [name]="a.icon" /></button> }`,
    errors: missing(),
  },
  'an @if holding only an icon inside the button': {
    code: `<button atl-button>@if (open) { <atl-icon name="close" /> }</button>`,
    errors: missing(),
  },
  'an @if / @else holding only icons': {
    code: `<button atl-button>@if (open) { <atl-icon name="up" /> } @else { <atl-icon name="down" /> }</button>`,
    errors: missing(),
  },
  'a @for holding only an icon': {
    code: `<button atl-button>@for (i of items; track i) { <atl-icon name="dot" /> }</button>`,
    errors: missing(),
  },
  'a @switch of icons': {
    code: `<button atl-button>@switch (m) { @case (1) { <atl-icon name="a" /> } @default { <atl-icon name="b" /> } }</button>`,
    errors: missing(),
  },
  'an *ngIf icon': {
    code: `<button atl-button><atl-icon *ngIf="x" name="close" /></button>`,
    errors: missing(),
  },
  'two buttons, one named': {
    code: `<button atl-button aria-label="Close"><atl-icon name="close" /></button><button atl-button><atl-icon name="more" /></button>`,
    errors: missing({ line: 1, column: 73 }),
  },
  'a nested unnamed button is reported separately': {
    code: `<atl-card><button atl-button><atl-icon name="a" /></button><button atl-button>Go</button></atl-card>`,
    errors: missing(),
  },
};

run('atl-button-icon-only-needs-name', rule, { valid, invalid });
