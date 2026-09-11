# Storybook React MCP — Atelier UI

## What this skill does

Provides component documentation for the Atelier UI React component library via the Model Context Protocol (MCP). Use this to look up accurate component props, types, defaults, and usage examples before generating React code.

## Endpoint

https://atelier.pieper.io/storybook-react/mcp

## Transport

HTTP (MCP over HTTP)

## Available Tools

- `docs-list` — Lists all available component IDs in the library
- `docs-show` — Returns full props, types, defaults, and usage examples for a component by ID
- `docs-show-story` — Returns documentation for a specific story variant

## MCP Configuration

```json
{
  "mcpServers": {
    "storybook-react": {
      "type": "http",
      "url": "https://atelier.pieper.io/storybook-react/mcp"
    }
  }
}
```

## Components Covered

25+ React components including AtlButton, AtlCard, AtlInput, AtlTextarea, AtlCheckbox, AtlToggle, AtlBadge, AtlAlert, AtlSelect, AtlDialog, AtlTabGroup, AtlAccordionGroup, AtlMenu, AtlTooltip, AtlToastProvider, useAtlToast, AtlSkeleton, AtlAvatar, AtlAvatarGroup, and more.

## Usage Pattern

1. Call `docs-list` to get valid component IDs
2. Call `docs-show` with an ID to retrieve the full API
3. Never invent props — only use what is documented
