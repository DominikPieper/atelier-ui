# @atelier-ui/styles

The component CSS of Atelier UI, written once. One file per component, rooted at
the component's own class (`.atl-button`, `.atl-badge`, `.atl-dialog`), driven by
the `--ui-*` design tokens.

```css
@import '@atelier-ui/styles/button/atl-button.css';
```

## Who uses it

- **`@atelier-ui/react`** depends on this package at runtime. Its components
  `import '@atelier-ui/styles/<dir>/atl-<name>.css'`, and your bundler resolves
  that specifier.
- **`@atelier-ui/angular`** and **`@atelier-ui/vue`** consume it at build time
  only: Angular inlines it into the component styles (`ViewEncapsulation.None`),
  Vue extracts it into `index.css`. They do not depend on this package at
  runtime.

You normally do not install this package yourself. The tokens (`--ui-*`) come
from your framework package, e.g. `@atelier-ui/react/styles/tokens.css`.

## Layout

Every file is served as `@atelier-ui/styles/<dir>/atl-<name>.css`. The CSS files
are side-effectful (`"sideEffects": ["**/*.css"]`); keep them when tree-shaking.
