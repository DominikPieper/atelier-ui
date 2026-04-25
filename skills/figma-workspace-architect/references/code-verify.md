# Code-side visual verification

When a token, variant, or component change in Figma has a downstream visual effect in the consuming code repo, verify it actually renders the way the new spec promises — *before* declaring the change done.

This is a manual recipe, not an automated submode. It runs in ~5–15 minutes per change and catches the class of bug where Figma and code are individually correct but their handoff (CSS variable name, mode-aware override, theme-toggle wiring) is broken.

## When to run this recipe

Trigger it after any of these changes touch a token / component that has a paired code-side artifact:

- **Token consolidation or rename** (e.g. dropping `--ui-color-on-primary`, folding semantics into `--ui-color-text-on-primary`). Mode-aware overrides are the most common silent break.
- **Mode-value change** on a Semantic-tier variable (Light + Dark must both render correctly).
- **Variant Property rename or value change** that the code's prop API relies on — verify the component still renders for each value.
- **A11y fix** that depends on a computed contrast ratio (loading spinner color, focus ring) — eyeball is not enough; read computed values.

Skip it for:
- Pure-Figma changes with no code-side artifact (icon-set additions, page reorganization, Component descriptions).
- Code changes whose effect is covered by an existing visual regression test.

## Pre-flight

Before starting, confirm:

1. **Repo has Storybook** (or an equivalent component-rendering target — Histoire, Ladle, or a component-demo Vite app). If not, fall back to running the consuming app and navigating to a page using the affected component.
2. **Browser-automation MCP is available** (`claude-in-chrome` or equivalent). If not, the agent reports computed values manually by asking the user to paste them — slower but workable.
3. **Theme switching mechanism is known** for the target setup. Check the Storybook `preview.ts` decorator or the consuming app's theme provider:
   - URL parameter (`?theme=dark`)
   - HTML attribute (`data-theme="dark"` on `<html>` or `<body>`)
   - Decorator-driven via `globals.backgrounds.value` (Storybook's default)
   - JS callable (`setTheme('dark')`)

   Note the mechanism — different setups need different "switch to dark mode" steps.

## Recipe

### 1. Start the rendering target

```bash
# Storybook
nx run <framework>:storybook    # Nx repos
npm run storybook               # plain repos

# Or the consuming app
nx serve <app-name>
```

Background the process (don't block the chat). Capture the local URL (`http://localhost:4400` or similar).

### 2. Open the relevant story / page in the browser

For Storybook:

```
http://localhost:<port>/?path=/story/<category>-<component>--<story>
```

The story ID matches the file's title hierarchy (e.g. `title: 'Components/Inputs/LlmButton'`, story name `Primary` → `components-inputs-llmbutton--primary`). When the URL guess fails, navigate to the Storybook root and click through the sidebar.

### 3. Switch the theme

Use the setup-appropriate mechanism. Two common patterns:

**URL-based (cleanest, no JS hacking):**
```
?path=...&globals=backgrounds.value:dark
```

**JS-direct (when the URL parameter doesn't bind to the right state):**
```js
const iframe = document.querySelector('#storybook-preview-iframe');
const doc = iframe.contentDocument;
doc.documentElement.setAttribute('data-theme', 'dark');
```

**Trap:** Storybook's `backgrounds.value` may or may not propagate through to your `data-theme` attribute, depending on the decorator. Check `preview.ts` — many decorators have a stale comparison (`=== '#1a1a2e'` when the value is now the option key like `'dark'`). If the visual doesn't change after the URL toggle, the decorator is broken — fix that first.

### 4. Read computed values for the affected token / element

In claude-in-chrome:

```js
(() => {
  const iframe = document.querySelector('#storybook-preview-iframe');
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  const target = doc.querySelector('<your selector — e.g. .llm-button.variant-primary or llm-button>');
  const cs = win.getComputedStyle(target);
  return {
    htmlTheme: doc.documentElement.getAttribute('data-theme'),
    bg: cs.backgroundColor,
    color: cs.color,
    // Add any other property that the change is supposed to affect
  };
})()
```

The result tells you the real rendered values. Convert RGB → hex if you need to compare to Figma values:

```
rgb(0, 208, 208)  →  #00d0d0
rgb(15, 23, 42)   →  #0f172a
```

### 5. Compare against the spec

Run the same query in light mode (`data-theme="light"`). Compare:

| Property         | Light expected | Light actual | Dark expected | Dark actual |
|------------------|----------------|--------------|---------------|-------------|
| background       | `#007070`      | `#007070`    | `#00d0d0`     | `#00d0d0`   |
| color            | `#ffffff`      | `#ffffff`    | `#0f172a`     | `#0f172a`   |

**Pass:** all four cells match.
**Fail:** any mismatch — the token consolidation, mode-override, or theme-toggle wiring is broken; investigate before declaring done.

### 6. Optional: screenshot for the report

If the change is being shipped as a PR or audit-follow-up, capture a screenshot in each mode using `figma_capture_screenshot` (Figma side) and the browser-automation tool's `screenshot` action (code side). Place them side-by-side in the PR description.

### 7. Tear down

Stop the dev-server background task. The recipe is complete.

## Common traps

- **Storybook decorator's theme-value comparison is stale.** Compare against the option *key* (e.g. `'dark'`), not the hex value (`'#1a1a2e'`). Storybook 10 surfaces the key in `globals.backgrounds.value`. If the decorator was written before this convention, fix it as part of the verification step.
- **Iframe access is blocked by sensitive-key protection** in some browser-automation setups. Read computed values via the iframe's own `contentWindow.getComputedStyle`, not by reading inline `style` attributes (which may not exist when values come from CSS variables).
- **Component is a Web Component / custom element** (e.g. Angular's `<llm-button>`). The default `querySelector('button')` will miss it. Use the actual custom-element tag name from the framework.
- **Caching of CSS variables across HMR.** If a token rename doesn't visually update after a hot reload, hard-reload the iframe (`location.reload()` inside the preview iframe). Vite's HMR sometimes preserves stale `:root` definitions.
- **No visible change despite correct token values.** The token may be set correctly but no element binds to it — confirm that the component CSS actually uses `var(--<token>)` and not a hardcoded fallback.
