import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildTruth,
  checkApi,
  checkClaims,
  checkForbidden,
  checkNesting,
  checkRawColors,
  checkSelectors,
  checkTokens,
  evaluateAnswer,
  extractCode,
  extractElements,
  hasKeyword,
  parseSelector,
} from './checker.mjs';

// A small hand-built truth, so these tests need neither the build output nor the network. The
// shape mirrors what buildTruth() derives; a separate test below runs it against the real manifest.
const truth = {
  elements: {
    'atl-input': {
      componentId: 'input',
      name: 'AtlInput',
      inputs: {
        label: null,
        placeholder: null,
        required: null,
        type: ['text', 'email'],
        value: null,
        errors: null,
      },
      outputs: ['valueChange', 'touchedChange'],
    },
    'atl-dialog': {
      componentId: 'dialog',
      name: 'AtlDialog',
      inputs: { open: null, size: ['sm', 'md', 'lg'], 'aria-label': null },
      outputs: ['openChange'],
    },
    'atl-card': {
      componentId: 'card',
      name: 'AtlCard',
      inputs: { variant: ['elevated', 'flat'] },
      outputs: [],
    },
  },
  attributes: {
    'atl-button': {
      componentId: 'button',
      name: 'AtlButton',
      host: 'button',
      inputs: {
        variant: ['primary', 'danger'],
        size: ['sm', 'md'],
        loading: null,
        disabled: null,
        type: ['button', 'submit'],
      },
      outputs: [],
    },
    atlTooltip: {
      componentId: 'tooltip',
      name: 'AtlTooltip',
      host: '',
      inputs: { atlTooltip: null, atlTooltipPosition: ['above', 'below'] },
      outputs: [],
    },
  },
  knownTags: [
    'atl-input',
    'atl-dialog',
    'atl-card',
    'atl-dialog-header',
    'atl-option',
  ],
  knownAttributes: ['atl-button', 'atlTooltip', 'atlMenuTriggerFor'],
  exports: ['AtlButton', 'AtlDialog', 'AtlDialogHeader'],
  tokens: [
    '--ui-color-text',
    '--ui-color-border',
    '--ui-color-border-strong',
    '--ui-spacing-4',
  ],
};

const reasons = (text) => checkApi(text, truth).findings.map((f) => f.reason);
const fence = (code) => '```html\n' + code + '\n```';

describe('extractElements', () => {
  it('reads bindings, events, structural directives and refs', () => {
    const [el] = extractElements(
      '<atl-input [(value)]="v" (valueChange)="x()" *ngIf="a" #ref label="L" />',
    );
    assert.deepEqual(
      el.attrs.map((a) => a.raw),
      ['[(value)]', '(valueChange)', '*ngIf', '#ref', 'label'],
    );
  });

  it('does not end a tag at a > inside a quoted value', () => {
    const [el] = extractElements(
      '<atl-input (valueChange)="onChange($event > 1 ? a : b)" label="x" />',
    );
    assert.deepEqual(
      el.attrs.map((a) => a.raw),
      ['(valueChange)', 'label'],
    );
  });

  it('handles multi-line tags and single quotes', () => {
    const [el] = extractElements(
      '<button\n  atl-button\n  variant=\'danger\'\n  [loading]="saving()"\n>',
    );
    assert.deepEqual(
      el.attrs.map((a) => a.raw),
      ['atl-button', 'variant', '[loading]'],
    );
  });

  it('skips comments and TypeScript generics', () => {
    const els = extractElements(
      '<!-- <atl-fake foo> -->\nconst s = signal<boolean>(false);\nArray<string>',
    );
    assert.deepEqual(
      els.map((e) => e.tag),
      ['boolean', 'string'],
    );
  });

  it('ignores placeholder tags such as <atl-...>', () => {
    assert.deepEqual(extractElements('<atl-...>'), []);
  });
});

describe('extractCode', () => {
  it('returns fenced blocks, unterminated fences and inline spans with a tag', () => {
    const text =
      'Use `<atl-card>` or `variant`:\n```html\n<atl-card/>\n```\n```ts\nopen = true;';
    assert.deepEqual(extractCode(text), [
      '<atl-card/>\n',
      'open = true;',
      '<atl-card>',
    ]);
  });
});

describe('checkApi: no false positives', () => {
  it('accepts documented inputs, outputs, two-way bindings and enum values', () => {
    assert.deepEqual(
      reasons(
        fence(
          '<atl-input label="Email" type="email" [required]="true" [(value)]="email" (touchedChange)="t()" />',
        ),
      ),
      [],
    );
  });

  it('ignores class, id, style, aria-*, data-*, [class.x], [style.x], [attr.x], i18n and roles', () => {
    assert.deepEqual(
      reasons(
        fence(
          '<atl-card class="a" id="b" style="c" role="region" aria-label="x" aria-labelledby="y" data-testid="z" [class.active]="a" [style.width.px]="w" [attr.aria-busy]="b" i18n-label i18n>x</atl-card>',
        ),
      ),
      [],
    );
  });

  it('ignores control flow, structural directives, template refs and native DOM events', () => {
    const code =
      '@if (open()) {\n  <atl-dialog [(open)]="open" (click)="a()" (keydown.enter)="b()" #dlg *ngIf="x" />\n} @else {\n  <p>no</p>\n}';
    assert.deepEqual(reasons(fence(code)), []);
  });

  it('accepts Angular forms directives, including Signal Forms [formField]', () => {
    assert.deepEqual(
      reasons(fence('<atl-input [formField]="form.email" />')),
      [],
    );
    assert.deepEqual(
      reasons(fence('<atl-input formControlName="email" [(ngModel)]="m" />')),
      [],
    );
  });

  it('accepts native button attributes on button[atl-button]', () => {
    assert.deepEqual(
      reasons(
        fence(
          '<button atl-button type="submit" name="go" form="f" autofocus [disabled]="x" (click)="go()">Go</button>',
        ),
      ),
      [],
    );
  });

  it('accepts two directives on one element, each with its own inputs', () => {
    assert.deepEqual(
      reasons(
        fence(
          '<button atl-button variant="danger" atlTooltip="Delete" atlTooltipPosition="below">x</button>',
        ),
      ),
      [],
    );
  });

  it('does not check attributes on a bare attribute directive host that are not its own', () => {
    assert.deepEqual(
      reasons(
        fence(
          '<div atlTooltip="Hint" class="x" foo="bar" (focus)="f()">x</div>',
        ),
      ),
      [],
    );
  });

  it('does not flag known child elements or helper directives', () => {
    assert.deepEqual(
      reasons(
        fence(
          '<atl-dialog-header foo="x">T</atl-dialog-header><atl-option optionValue="a" /><button atl-button atlMenuTriggerFor="m">x</button>',
        ),
      ),
      [],
    );
  });

  it('does not flag dynamic values for enum inputs', () => {
    assert.deepEqual(
      reasons(
        fence(
          '<button atl-button [variant]="isDanger ? \'danger\' : \'primary\'" variant="{{ v }}">x</button>',
        ),
      ),
      [],
    );
  });

  it('only scans code, not prose', () => {
    assert.deepEqual(
      reasons(
        'The atl-input has a `label` and I wonder about <atl-modal> in prose.',
      ),
      [],
    );
  });
});

describe('checkApi: findings', () => {
  it('flags an invented input and an invented output', () => {
    assert.deepEqual(
      reasons(fence('<atl-input errorMessage="x" (valueChanged)="f()" />')),
      ['undocumented-input', 'undocumented-output'],
    );
  });

  it('flags an invented component element', () => {
    assert.deepEqual(reasons(fence('<atl-modal [open]="o"></atl-modal>')), [
      'unknown-element',
    ]);
  });

  it('flags the attribute component used as an element', () => {
    assert.deepEqual(
      reasons(fence('<atl-button variant="primary">Save</atl-button>')),
      ['unknown-element'],
    );
  });

  it('flags an enum value that does not exist', () => {
    const f = checkApi(
      fence('<button atl-button variant="ghost" [size]="\'huge\'">x</button>'),
      truth,
    ).findings;
    assert.deepEqual(
      f.map((x) => x.reason),
      ['invalid-value', 'invalid-value'],
    );
  });

  it('flags a button attribute component on the wrong host', () => {
    assert.deepEqual(
      reasons(fence('<a atl-button href="/x" variant="primary">x</a>')),
      ['wrong-host'],
    );
  });

  it('flags an invented attribute selector and an invented icon input on a button', () => {
    assert.deepEqual(reasons(fence('<button atl-btn>x</button>')), [
      'unknown-attribute-selector',
    ]);
    assert.deepEqual(
      reasons(
        fence('<button atl-button icon="plus" [iconLeft]="i">x</button>'),
      ),
      ['undocumented-input', 'undocumented-input'],
    );
  });

  it('flags an invented tooltip option on the directive', () => {
    assert.deepEqual(
      reasons(fence('<span atlTooltip="x" atlTooltipColor="red">x</span>')),
      ['undocumented-input'],
    );
  });

  it('finds the problem inside a TypeScript template string and inside an inline code span', () => {
    assert.deepEqual(
      reasons(
        '```ts\n@Component({ template: `<atl-input maxlength="5" />` })\n```',
      ),
      ['undocumented-input'],
    );
    assert.deepEqual(reasons('Use `<atl-card elevation="2">` here.'), [
      'undocumented-input',
    ]);
  });
});

describe('checkApi: invented names outside the atl- prefix', () => {
  it('flags a custom element that is not in the library', () => {
    assert.deepEqual(
      reasons(fence('<atelier-button variant="ghost">x</atelier-button>')),
      ['unknown-element'],
    );
    assert.deepEqual(reasons(fence('<ui-dialog [(open)]="o"></ui-dialog>')), [
      'unknown-element',
    ]);
  });

  it("accepts the user's own app-* components and Angular built-in elements", () => {
    assert.deepEqual(
      reasons(
        fence(
          '<app-root></app-root><app-user-card [user]="u" /><ng-container *ngIf="a"></ng-container><ng-template #t></ng-template><ng-content select="[x]" /><router-outlet />',
        ),
      ),
      [],
    );
  });

  it('does not read comparisons and generics in TypeScript as custom elements', () => {
    assert.deepEqual(
      reasons(
        '```ts\nfor (let i = 0; i<max-1; i++) {}\nconst a = b<c-d;\nconst m = new Map<some-key, number>();\n```',
      ),
      [],
    );
  });

  it('flags a named import that the package does not export', () => {
    const f = checkApi(
      "```ts\nimport { AtlButton, AtelierButton } from '@atelier-ui/angular';\n```",
      truth,
    ).findings;
    assert.deepEqual(
      f.map((x) => x.reason),
      ['unknown-import'],
    );
    assert.match(f[0].detail, /AtelierButton/);
  });

  it('accepts exported names, aliases, type imports and multi-line imports; ignores other packages', () => {
    const code =
      "```ts\nimport {\n  AtlDialog,\n  AtlDialogHeader as Header,\n} from '@atelier-ui/angular';\nimport type { AtlButton } from \"@atelier-ui/angular\";\nimport { Component } from '@angular/core';\nimport '@atelier-ui/angular/styles/tokens.css';\n```";
    assert.deepEqual(reasons(code), []);
  });

  it('ignores comments inside an import list', () => {
    const code =
      "```ts\nimport {\n  AtlDialog, /* + header/content/footer */\n  AtlDialogHeader, // verify export names AtlDialogContent\n} from '@atelier-ui/angular';\n```";
    assert.deepEqual(reasons(code), []);
  });

  it('does not call Angular Material or CDK elements invented', () => {
    assert.deepEqual(
      reasons(
        fence(
          '<mat-stepper><mat-step /></mat-stepper><cdk-virtual-scroll-viewport />',
        ),
      ),
      [],
    );
  });

  it('skips the import check when the truth carries no export list (old answer files)', () => {
    const old = { ...truth, exports: undefined };
    assert.deepEqual(
      checkApi("```ts\nimport { Nope } from '@atelier-ui/angular';\n```", old)
        .findings,
      [],
    );
  });
});

describe('selectors and forbidden selectors', () => {
  it('matches tags and attribute selectors at word boundaries', () => {
    assert.equal(
      checkSelectors(fence('<atl-dialog-header>x</atl-dialog-header>'), [
        'atl-dialog',
      ]).pass,
      false,
    );
    assert.equal(
      checkSelectors(fence('<atl-dialog [(open)]="o"></atl-dialog>'), [
        'atl-dialog',
      ]).pass,
      true,
    );
    assert.equal(
      checkSelectors(fence('<button atl-button atlTooltip="x">x</button>'), [
        'atl-button',
        'atlTooltip',
      ]).pass,
      true,
    );
  });

  it('accepts alternatives and requires every item', () => {
    const answer = fence('<atl-toggle />');
    assert.equal(
      checkSelectors(answer, [['atl-toggle', 'atl-checkbox']]).pass,
      true,
    );
    assert.deepEqual(
      checkSelectors(answer, ['atl-toggle', 'atl-checkbox']).missing,
      ['atl-checkbox'],
    );
  });

  it('does not count a mention in prose as use', () => {
    assert.equal(
      checkSelectors('Use atl-combobox for this.', ['atl-combobox']).pass,
      false,
    );
  });

  it('reports forbidden selectors that are used', () => {
    assert.deepEqual(
      checkForbidden(fence('<atl-select />'), ['atl-select', 'atl-input']).used,
      ['atl-select'],
    );
  });
});

describe('claim keywords', () => {
  it('requires every group, one synonym per group, case-insensitive', () => {
    const answer =
      'The toggle applies immediately; a checkbox is committed on Submit.';
    assert.equal(
      checkClaims(answer, [
        ['immediately', 'instantly'],
        ['SUBMIT', 'save'],
      ]).pass,
      true,
    );
    assert.deepEqual(
      checkClaims(answer, [['immediately'], ['aria-live']]).missing,
      [['aria-live']],
    );
  });

  it('matches --token keywords as whole tokens', () => {
    assert.equal(
      hasKeyword('use --ui-color-border-strong here', '--ui-color-border'),
      false,
    );
    assert.equal(
      hasKeyword('use --ui-color-border, then', '--ui-color-border'),
      true,
    );
    assert.equal(
      hasKeyword('use var(--ui-color-border)', '--ui-color-border'),
      true,
    );
  });

  it('does not let a stray number satisfy a page-count claim, but accepts it in context', () => {
    const group = [
      ['pagecount]="12"', 'pagecount = 12', '240 / 20', 'math.ceil('],
    ];
    assert.equal(
      checkClaims('Show 12 results; page 12 of the docs; 12px gap.', group)
        .pass,
      false,
    );
    assert.equal(
      checkClaims('<atl-pagination [pageCount]="12" />', group).pass,
      true,
    );
    assert.equal(
      checkClaims('totalPages = Math.ceil(240 / 20);', group).pass,
      true,
    );
  });

  it('treats an empty claim list as passing', () => {
    assert.equal(checkClaims('anything', []).pass, true);
  });
});

describe('tokens and raw colours', () => {
  it('accepts known tokens, wildcards and prefixes', () => {
    assert.equal(
      checkTokens(
        'color: var(--ui-color-text); gap: var(--ui-spacing-4); see --ui-color-* and --ui-color-{role}',
        truth,
      ).pass,
      true,
    );
  });

  it('flags an invented token', () => {
    assert.deepEqual(
      checkTokens('var(--ui-color-brand-fancy)', truth).invented,
      ['--ui-color-brand-fancy'],
    );
  });

  it('flags hex, rgb/hsl and named colours in declarations', () => {
    assert.equal(
      checkRawColors('```css\n.a { color: #333; }\n```').pass,
      false,
    );
    assert.equal(
      checkRawColors('```css\n.a { background: rgba(0,0,0,.1); }\n```').pass,
      false,
    );
    assert.equal(
      checkRawColors('```css\n.a { border: 1px solid gray; }\n```').pass,
      false,
    );
  });

  it('does not flag tokens, template refs, ids or the words in selectors', () => {
    assert.equal(
      checkRawColors(
        '```html\n<input #abc />\n<div id="green">x</div>\n```\n```css\n.green-box { color: var(--ui-color-text); border: var(--ui-border-width) solid var(--ui-color-border); }\n```',
      ).pass,
      true,
    );
  });
});

describe('tokens and raw colours in prose, comments and fallbacks', () => {
  it('does not flag a token name that only appears in prose (a negation or a quote)', () => {
    assert.equal(
      checkTokens(
        "There is no `--ui-control-height` token, and I didn't want to invent --ui-motion-duration-fast.",
        truth,
      ).pass,
      true,
    );
  });
  it('flags an invented token declared or read in a code block, or read via var() in prose', () => {
    assert.deepEqual(
      checkTokens('```css\n.a { height: 2rem; --ui-bogus: 1; }\n```', truth)
        .invented,
      ['--ui-bogus'],
    );
    assert.deepEqual(
      checkTokens('Use `var(--ui-color-brand-fancy)` here.', truth).invented,
      ['--ui-color-brand-fancy'],
    );
  });
  it('ignores colour literals in CSS comments and in var() fallbacks, as the repo rule does', () => {
    assert.equal(
      checkRawColors(
        '```css\n.a { background: var(--ui-color-primary-light); /* rgba(0,100,112,0.08) in light */ }\n```',
      ).pass,
      true,
    );
    assert.equal(
      checkRawColors(
        '```css\n.a { background: var(--x, rgb(0 0 0 / 0.04)); color: var(--ui-color-text, #111); }\n```',
      ).pass,
      true,
    );
  });
  it('ignores linter output pasted in a code block', () => {
    assert.equal(
      checkRawColors(
        '```\n2:10  ✖  Unexpected hex color "#1a1a1a"  color-no-hex\n```',
      ).pass,
      true,
    );
  });
  it('ignores rgba alpha in shadow properties, but not elsewhere', () => {
    assert.equal(
      checkRawColors(
        '```css\n.a { box-shadow: 0 1px 2px rgba(0,0,0,.2); }\n```',
      ).pass,
      true,
    );
    assert.equal(
      checkRawColors('```css\n.a { --tile-ring: #005fcc; }\n```').pass,
      false,
    );
    assert.equal(
      checkRawColors(
        '```css\n.a { color: var(--ui-color-text); border-color: rgb(0 0 0 / 10%); }\n```',
      ).pass,
      false,
    );
  });
});

describe('checkNesting', () => {
  const pair = [['atl-accordion-item', 'atl-accordion-item']];
  it('flags an element opened inside an open element of the same name', () => {
    const r = checkNesting(
      fence(
        '<atl-accordion-group><atl-accordion-item>A\n<atl-accordion-group><atl-accordion-item>B</atl-accordion-item></atl-accordion-group>\n</atl-accordion-item></atl-accordion-group>',
      ),
      pair,
    );
    assert.equal(r.pass, false);
    assert.deepEqual(r.found, ['atl-accordion-item in atl-accordion-item']);
  });
  it('accepts siblings and closed elements', () => {
    const r = checkNesting(
      fence(
        '<atl-accordion-item>A</atl-accordion-item><atl-accordion-item>B</atl-accordion-item>',
      ),
      pair,
    );
    assert.equal(r.pass, true);
  });
  it('honours self-closing tags and elements closed by an enclosing closer', () => {
    assert.equal(
      checkNesting(fence('<atl-tab /><atl-tab />'), [['atl-tab', 'atl-tab']])
        .pass,
      true,
    );
    assert.equal(
      checkNesting(fence('<div><atl-x></div><atl-x>'), [['atl-x', 'atl-x']])
        .pass,
      true,
    );
    assert.equal(
      checkNesting(fence('<atl-x><atl-x>'), [['atl-x', 'atl-x']]).pass,
      false,
    );
  });
  it('ignores prose and tags that are not in code', () => {
    const r = checkNesting(
      'Do not put <atl-accordion-item> in <atl-accordion-item>.',
      pair,
    );
    assert.equal(r.pass, true);
  });
  it('checks an outer/inner pair of different names', () => {
    const r = checkNesting(
      fence('<atl-card><div><atl-dialog>x</atl-dialog></div></atl-card>'),
      [['atl-card', 'atl-dialog']],
    );
    assert.equal(r.pass, false);
  });
  it('is wired into evaluateAnswer as the nesting check', () => {
    const q = { id: 'q', checks: ['nesting'], forbidNested: pair };
    const bad = fence(
      '<atl-accordion-item><atl-accordion-item>x</atl-accordion-item></atl-accordion-item>',
    );
    assert.equal(evaluateAnswer(q, bad, truth).score, 0);
    assert.match(evaluateAnswer(q, bad, truth).checks[0].detail, /nested/);
    assert.equal(
      evaluateAnswer(
        q,
        fence('<atl-accordion-item>x</atl-accordion-item>'),
        truth,
      ).score,
      1,
    );
  });
});

describe('evaluateAnswer', () => {
  it('scores the share of passed checks and names the failure', () => {
    const question = {
      id: 'q',
      checks: ['api', 'selectors', 'claims'],
      expectSelectors: ['atl-dialog'],
      claims: [['escape']],
    };
    const r = evaluateAnswer(
      question,
      fence('<atl-dialog bogus="x" />'),
      truth,
    );
    assert.equal(r.score, 1 / 3);
    assert.deepEqual(
      r.checks.map((c) => [c.id, c.pass]),
      [
        ['api', false],
        ['selectors', true],
        ['claims', false],
      ],
    );
  });

  it('can match claims in code only, so a prose negation does not count', () => {
    const q = {
      id: 'q',
      checks: ['claims'],
      claimsIn: 'code',
      claims: [['headinglevel="2"']],
    };
    const prose = "I didn't invent a `headingLevel` prop.";
    assert.equal(evaluateAnswer(q, prose, truth).score, 0);
    assert.equal(
      evaluateAnswer(
        q,
        fence('<atl-accordion-item headingLevel="2">x</atl-accordion-item>'),
        truth,
      ).score,
      1,
    );
    // Without the option the same prose still counts (the default is the whole answer).
    assert.equal(
      evaluateAnswer(
        { ...q, claimsIn: undefined, claims: [['headinglevel']] },
        prose,
        truth,
      ).score,
      1,
    );
  });

  it('rejects an unknown check id', () => {
    assert.throws(
      () => evaluateAnswer({ id: 'q', checks: ['nope'] }, '', truth),
      /unknown check/,
    );
  });
});

describe('parseSelector', () => {
  it('splits element, attribute and bare attribute selectors', () => {
    assert.deepEqual(parseSelector('button[atl-button]'), [
      { kind: 'attribute', host: 'button', attr: 'atl-button' },
    ]);
    assert.deepEqual(parseSelector('[atlTooltip]'), [
      { kind: 'attribute', host: '', attr: 'atlTooltip' },
    ]);
    assert.deepEqual(parseSelector('atl-card, a[x]'), [
      { kind: 'element', tag: 'atl-card' },
      { kind: 'attribute', host: 'a', attr: 'x' },
    ]);
  });
});

// Runs against the real build output when it exists, so a manifest shape change is caught here
// and not only in a live run. Skipped, not failed, on a checkout without `dist`.
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const manifestDir = join(repoRoot, 'dist/storybook/angular');
describe(
  'buildTruth against the real manifest',
  { skip: !existsSync(join(manifestDir, 'manifests/components.json')) },
  () => {
    const real = buildTruth({ manifestDir, repoRoot });

    it('derives the button as an attribute component with its enums', () => {
      assert.equal(real.attributes['atl-button'].host, 'button');
      assert.deepEqual(real.attributes['atl-button'].inputs.variant, [
        'primary',
        'secondary',
        'outline',
        'danger',
      ]);
      assert.ok(Object.hasOwn(real.attributes, 'atlTooltip'));
    });

    it('derives the exported names from the package entry point', () => {
      for (const name of [
        'AtlButton',
        'AtlDialogHeader',
        'AtlToastService',
        'ATL_DIALOG',
      ]) {
        assert.ok(real.exports.includes(name), name);
      }
    });

    it('derives element components, outputs and child elements', () => {
      assert.ok(real.elements['atl-dialog'].outputs.includes('openChange'));
      assert.ok(real.knownTags.includes('atl-dialog-header'));
      assert.ok(real.knownTags.includes('atl-option'));
      assert.ok(real.tokens.includes('--ui-color-text-muted'));
    });

    it('accepts the usage examples the manifest ships and flags a ghost button', () => {
      const ok = fence(
        '<button atl-button variant="outline" [disabled]="true">Cancel</button>\n<atl-select [(value)]="country" placeholder="Pick"><atl-option optionValue="us">US</atl-option></atl-select>\n<atl-dialog [(open)]="isOpen"><atl-dialog-header>T</atl-dialog-header></atl-dialog>',
      );
      assert.deepEqual(checkApi(ok, real).findings, []);
      assert.deepEqual(
        checkApi(
          fence('<button atl-button variant="ghost">x</button>'),
          real,
        ).findings.map((f) => f.reason),
        ['invalid-value'],
      );
    });
  },
);
