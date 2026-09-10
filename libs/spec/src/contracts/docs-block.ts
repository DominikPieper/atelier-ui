/**
 * The Storybook docs-page block that displays a component's micro-contract
 * (ADR-0121 Decision 3 / S5b — "the block that displays it" plus the story-meta
 * import, the only two items left open from that decision).
 *
 * Framework-neutral, deliberately not `.tsx`: Angular's and Vue's Storybooks have
 * no JSX transform configured (`libs/angular/.storybook`, `libs/vue/.storybook`),
 * so this file uses `createElement`/`Fragment` from `react` directly. That import
 * is safe in all three Storybooks: `@storybook/addon-docs` (installed in all
 * three) depends on `react` directly (see its `package.json` `dependencies`),
 * and `react` resolves from each lib's own `.storybook` directory because every
 * framework shares this monorepo's root `node_modules` — verified 2026-09-10 by
 * resolving both specifiers from `libs/{angular,react,vue}/.storybook`.
 *
 * `ContractBlock` renders nothing when the current story meta carries no
 * `parameters.contract` (i.e. most components, until Step 2 of S5b lands the
 * import everywhere a contract exists). `contractDocsPage` mirrors Storybook's
 * own default `DocsPage` composition — Title, Subtitle, Description, (single-
 * story) Description, Primary, Controls, (multi-story) Stories, read from
 * `@storybook/addon-docs/blocks`' own `DocsPage.tsx` — with `ContractBlock`
 * appended, so a preview only has to set `parameters.docs.page =
 * contractDocsPage` once to get the contract section on every autodocs page.
 */
import { createElement, Fragment } from 'react';
import type { ComponentType, ReactElement, ReactNode } from 'react';
// `libs/spec/tsconfig.json` inherits the monorepo's classic
// `moduleResolution: "node"` (`tsconfig.base.json`), which cannot follow a
// subpath `exports` entry — `tsc -p libs/spec/tsconfig.lib.json` reports
// TS2307 for `@storybook/addon-docs/blocks` and suggests
// `node16`/`nodenext`/`bundler`. Widening that setting for the whole `spec`
// project to satisfy one file's import is out of scope here (and the kind of
// scope creep this contract layer's own rules forbid elsewhere — see
// `types.ts`'s header). Storybook's own Vite build resolves the subpath fine
// at runtime in all three frameworks (`exports` is exactly what Vite's
// resolver understands) — verified via `build-storybook`, not assumed.
//
// This file is ALSO reached — transitively, via `.storybook/vitest.setup.ts`
// -> `./preview` -> this module — by `libs/angular/tsconfig.spec.json`, which
// sets `moduleResolution: "bundler"` and resolves the very same import
// without complaint. A file type-checked under two projects with different
// resolution algorithms needs a directive that tolerates "no error here":
// `@ts-expect-error` would fail TS2578 ("Unused '@ts-expect-error'
// directive") under the project where the import DOES resolve, so this uses
// `@ts-ignore`, which suppresses an error when present and is silently a
// no-op when absent. Every shape used below is reconstructed by hand from
// `node_modules/@storybook/addon-docs/dist/blocks.d.ts` and cast immediately,
// so nothing downstream loses type-checking.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- see comment above
// @ts-ignore TS2307 under classic "node" resolution only; resolves fine at runtime and under "bundler".
import * as blocksModule from '@storybook/addon-docs/blocks';
import type { ComponentContract } from './types';

type UseOfMetaResult = {
  type: 'meta';
  csfFile: { stories: Record<string, unknown> };
  preparedMeta: { parameters: Record<string, unknown> };
};
type Blocks = {
  useOf: (
    moduleExportOrType: 'meta',
    validTypes?: ['meta'],
  ) => UseOfMetaResult;
  Title: ComponentType<Record<string, never>>;
  Subtitle: ComponentType<Record<string, never>>;
  Description: ComponentType<{ of?: string }>;
  Primary: ComponentType<Record<string, never>>;
  Controls: ComponentType<Record<string, never>>;
  Stories: ComponentType<Record<string, never>>;
};
const { useOf, Title, Subtitle, Description, Primary, Controls, Stories } =
  blocksModule as Blocks;

const FIGMA_FILE_KEY = 'QMnDD8uZQPldPrlCwZZ58T';

function figmaNodeUrl(nodeId: string): string {
  return `https://www.figma.com/design/${FIGMA_FILE_KEY}?node-id=${nodeId.replace(/:/g, '-')}`;
}

function isUnexplained(reason: string): boolean {
  return reason.includes('UNEXPLAINED');
}

/** Inline styles only — no new CSS file — using the docs' own `--ui-*` tokens. */
const styles = {
  section: {
    marginTop: 'var(--ui-spacing-8)',
    paddingTop: 'var(--ui-spacing-6)',
    borderTop: '1px solid var(--ui-color-border)',
    fontFamily: 'var(--ui-font-family)',
  },
  heading: {
    fontSize: 'var(--ui-font-size-lg)',
    fontWeight: 'var(--ui-font-weight-semibold)',
    color: 'var(--ui-color-text)',
    margin: '0 0 var(--ui-spacing-3)',
  },
  nodeLink: {
    fontFamily: 'var(--ui-font-mono)',
    fontSize: 'var(--ui-font-size-sm)',
    color: 'var(--ui-color-primary)',
  },
  subheading: {
    fontSize: 'var(--ui-font-size-md)',
    fontWeight: 'var(--ui-font-weight-medium)',
    color: 'var(--ui-color-text)',
    margin: 'var(--ui-spacing-5) 0 var(--ui-spacing-2)',
  },
  list: {
    margin: 0,
    paddingLeft: 'var(--ui-spacing-5)',
    fontSize: 'var(--ui-font-size-sm)',
    color: 'var(--ui-color-text-muted)',
  },
  item: {
    marginBottom: 'var(--ui-spacing-1)',
  },
  code: {
    fontFamily: 'var(--ui-font-mono)',
    color: 'var(--ui-color-text)',
  },
  unexplained: {
    marginLeft: 'var(--ui-spacing-1)',
    color: 'var(--ui-color-warning-text)',
    fontWeight: 'var(--ui-font-weight-semibold)',
  },
} as const;

function unexplainedMarker(): ReactElement {
  return createElement('span', { style: styles.unexplained }, '[unexplained]');
}

function listItem(key: string, children: ReactNode): ReactElement {
  return createElement('li', { style: styles.item, key }, children);
}

function renderFigmaOnly(
  entries: ReadonlyArray<{ name: string; reason: string }>,
): ReactElement {
  return createElement(
    'ul',
    { style: styles.list },
    entries.map((e) =>
      listItem(e.name, [
        createElement('code', { style: styles.code, key: 'name' }, e.name),
        ': ',
        e.reason,
        isUnexplained(e.reason) ? unexplainedMarker() : null,
      ]),
    ),
  );
}

function renderCodeOnly(
  entries: ReadonlyArray<{ name: string; reason: string }>,
): ReactElement {
  return createElement(
    'ul',
    { style: styles.list },
    entries.map((e) =>
      listItem(e.name, [
        createElement('code', { style: styles.code, key: 'name' }, e.name),
        ': ',
        e.reason,
        isUnexplained(e.reason) ? unexplainedMarker() : null,
      ]),
    ),
  );
}

function renderAxisMap(
  entries: NonNullable<ComponentContract['axisMap']>,
): ReactElement {
  return createElement(
    'ul',
    { style: styles.list },
    entries.map((e, i) =>
      listItem(`${e.figmaAxis}-${e.codeProp}-${i}`, [
        createElement('code', { style: styles.code, key: 'axis' }, e.figmaAxis),
        ' → ',
        createElement('code', { style: styles.code, key: 'prop' }, e.codeProp),
        e.values ? ` (${JSON.stringify(e.values)})` : null,
        ': ',
        e.reason,
        isUnexplained(e.reason) ? unexplainedMarker() : null,
      ]),
    ),
  );
}

function renderProbes(
  entries: NonNullable<ComponentContract['probes']>,
): ReactElement {
  return createElement(
    'ul',
    { style: styles.list },
    entries.map((e) =>
      listItem(e.part, [
        createElement('code', { style: styles.code, key: 'part' }, e.part),
        ' via ',
        createElement('code', { style: styles.code, key: 'selector' }, e.selector),
        ': ',
        e.reason,
        isUnexplained(e.reason) ? unexplainedMarker() : null,
      ]),
    ),
  );
}

/**
 * Reads `parameters.contract` off the current story meta and renders the
 * "Contract" section, or nothing when the meta carries no contract.
 */
export function ContractBlock(): ReactElement | null {
  let contract: ComponentContract | undefined;
  try {
    const resolved = useOf('meta', ['meta']);
    contract = (
      resolved.preparedMeta.parameters as { contract?: ComponentContract }
    ).contract;
  } catch {
    contract = undefined;
  }
  if (!contract) return null;

  const parts: ReactNode[] = [
    createElement('h3', { style: styles.heading, key: 'heading' }, 'Contract'),
    createElement(
      'p',
      { key: 'node' },
      createElement(
        'a',
        {
          href: figmaNodeUrl(contract.figmaNodeId),
          style: styles.nodeLink,
          target: '_blank',
          rel: 'noreferrer',
        },
        contract.figmaNodeId,
      ),
    ),
  ];

  if (contract.figmaOnly?.length) {
    parts.push(
      createElement(
        'h4',
        { style: styles.subheading, key: 'figma-only-h' },
        'Figma-only',
      ),
      createElement(
        Fragment,
        { key: 'figma-only' },
        renderFigmaOnly(contract.figmaOnly),
      ),
    );
  }

  if (contract.codeOnly?.length) {
    parts.push(
      createElement(
        'h4',
        { style: styles.subheading, key: 'code-only-h' },
        'Code-only',
      ),
      createElement(
        Fragment,
        { key: 'code-only' },
        renderCodeOnly(contract.codeOnly),
      ),
    );
  }

  if (contract.axisMap?.length) {
    parts.push(
      createElement(
        'h4',
        { style: styles.subheading, key: 'axis-map-h' },
        'Axis map',
      ),
      createElement(Fragment, { key: 'axis-map' }, renderAxisMap(contract.axisMap)),
    );
  }

  if (contract.probes?.length) {
    parts.push(
      createElement('h4', { style: styles.subheading, key: 'probes-h' }, 'Probes'),
      createElement(Fragment, { key: 'probes' }, renderProbes(contract.probes)),
    );
  }

  return createElement('section', { style: styles.section }, parts);
}

/**
 * Drop-in `parameters.docs.page` replacement: the default autodocs
 * composition, mirrored from `@storybook/addon-docs`'s own `DocsPage`, with
 * `ContractBlock` appended.
 */
export function contractDocsPage(): ReactElement {
  const resolved = useOf('meta', ['meta']);
  const isSingleStory = Object.keys(resolved.csfFile.stories).length === 1;
  return createElement(
    Fragment,
    null,
    createElement(Title, null),
    createElement(Subtitle, null),
    createElement(Description, { of: 'meta' }),
    isSingleStory ? createElement(Description, { of: 'story' }) : null,
    createElement(Primary, null),
    createElement(Controls, null),
    isSingleStory ? null : createElement(Stories, null),
    createElement(ContractBlock, null),
  );
}
