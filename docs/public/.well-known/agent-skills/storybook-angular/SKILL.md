# Storybook Angular MCP — Atelier UI

## What this skill does
Provides component documentation for the Atelier UI Angular component library via the Model Context Protocol (MCP). Use this to look up accurate component props, types, defaults, and usage examples before generating Angular code.

## Endpoint
https://atelier.pieper.io/storybook-angular/mcp

## Transport
HTTP (MCP over HTTP)

## Available Tools
- `list-all-documentation` — Lists all available component IDs in the library
- `get-documentation` — Returns full props, types, defaults, and usage examples for a component by ID
- `get-documentation-for-story` — Returns documentation for a specific story variant

## MCP Configuration
```json
{
  "mcpServers": {
    "storybook-angular": {
      "type": "http",
      "url": "https://atelier.pieper.io/storybook-angular/mcp"
    }
  }
}
```

## Components Covered
25+ Angular components including LlmButton, LlmCard, LlmInput, LlmTextarea, LlmCheckbox, LlmToggle, LlmBadge, LlmAlert, LlmSelect, LlmDialog, LlmTabGroup, LlmAccordionGroup, LlmMenu, LlmTooltip, LlmToast, LlmSkeleton, LlmAvatar, and more.

## Usage Pattern
1. Call `list-all-documentation` to get valid component IDs
2. Call `get-documentation` with an ID to retrieve the full API
3. Never invent props — only use what is documented
