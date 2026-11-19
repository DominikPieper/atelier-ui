# create-atelier-ui-workspace

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build create-atelier-ui-workspace` to build the library.

## Running unit tests

Run `nx test create-atelier-ui-workspace` to execute the unit tests via [Jest](https://jestjs.io).

## Usage

```
npx create-atelier-ui-workspace my-workshop --no-figma
```

The CLI creates **Angular workspaces only** for now (owner decision 2026-11-19).
There is no framework prompt; `--framework` may be omitted or set to `angular`.
`--framework react` and `--framework vue` exit non-zero with an error. The
`@atelier-ui/create-workspace` preset itself still supports React and Vue, so
re-enabling them is a one-line change to `ENABLED_FRAMEWORKS` in `bin/index.ts`.
Run with `--help` for all options.
