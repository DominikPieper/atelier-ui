# Seat is red: what to do

Work top to bottom. Name which part is missing first (model access, the MCP servers, or Storybook) and fix only that one. Do not debug everything at once.

## 1. Model access

`npm run preflight` never sends a request to a model, so it cannot see this. Prove it with a real one:

```
claude -p "Reply with exactly: PREFLIGHT-OK"
```

An authentication error: `claude auth login` and finish the browser sign-in.

## 2. Preflight

1. Run `npm run preflight` and read the red rows.
2. `MCP: atelier ... is not installed`: run `npm install`, run preflight again.
3. Start a new Claude Code session from the workspace root after the install.

## 3. The MCP servers

1. In Claude Code type `/mcp`. Both `atelier` and `storybook-local` should be connected.
2. A server is missing or not connected: reconnect it from `/mcp`.
3. Do not edit `.mcp.json` and do not add a server by hand.

## 4. Storybook is not running

1. Start it: `npm run storybook`. The tools appear by themselves; if not, reconnect `storybook-local` in `/mcp`.
2. Port taken: stop what holds it (`lsof -nP -iTCP:<port> -sTCP:LISTEN`), start Storybook again.
3. A seat that stays red works on: the browser Storybook and `npm run check:stories` show the same result.

## 5. The Figma bridge

1. In Figma Desktop: Plugins, Development, run **Figma Desktop Bridge** in the course file.
2. Tools disconnect or the plugin is out of date: close the panel, run it again.
3. Several servers compete for the bridge: `pkill -f figma-console-mcp`, then call a Figma tool once. Claude Code starts a fresh server.

## Broken workspace

Do not repair it. Tell the trainer right away: the machine is theirs to fix. Meanwhile pair with a neighbour (one keyboard, the neighbour drives).

**Still red: ask your neighbour, then the trainer.**

The same steps are in `course/rescue.md` in your workspace.
