# Rescue: when your seat is red

Use this when `npm run preflight` is still red after the setup block, or a real prompt
fails. Setup has three independent parts: the Claude Code CLI, the MCP servers and model
access. Preflight checks the first two; model access is only proven by a real request.

## 1. Name what is missing

Read the preflight output and decide which of the three is missing: the CLI, an MCP server
or model access. Fix that one, not everything at once.

## 2. Model access

`claude --version` and a green preflight prove only that the CLI is installed. Prove model
access with a real request:

```shell
claude -p "Reply with exactly: PREFLIGHT-OK"
```

If it asks you to sign in or exits with an authentication error: in the course the machines
are provisioned and the login happens in the room (`claude auth login`, then finish the
browser sign-in). Tell the trainer.

## 3. MCP servers

Run `npm run preflight`, then start `claude` from the workspace root (the folder that holds
`.mcp.json`) and type `/mcp`.

- **No servers listed, or "Pending approval".** Claude Code was started before `.mcp.json`
  existed, or from a different folder. Close it, start `claude` in the workspace root,
  accept the "trust this folder" prompt and approve the project servers when asked. If you
  declined one earlier: `claude mcp reset-project-choices`, then start `claude` again.
  {{MCP_RESCUE}}
- **`storybook-local` is not connected.** Storybook is not running. Start it with
  `npm run storybook`; the tools appear on their own. If they do not: `/mcp` and reconnect
  `storybook-local`. If the port 6006 is taken, find the process first
  (`lsof -nP -iTCP:6006 -sTCP:LISTEN`) and stop that one; do not kill what you have not
  looked at.
- Do not edit `.mcp.json` and do not add a server by hand: the entries are part of the
  workspace. A seat that stays red works on without `storybook-local`: the browser Storybook
  and `npm run check:stories` show the same result.

## 4. Storybook does not start (port in use)

`EADDRINUSE` means a previous dev server still runs. Look at what holds the port:
`lsof -nP -iTCP:<port> -sTCP:LISTEN`. Stop that process only if it is the stale dev server.
The app serves on port 4200 (`npm start -- --port 4300` for another port); Storybook is
fixed to 6006.
{{FIGMA_RESCUE}}

## Still red

Do not repair a broken workspace yourself: tell the trainer, the machine is theirs to fix.
Whoever is still red in the setup block pairs with a neighbour (one keyboard, the neighbour
drives). Nobody starts Day 2 red: the trainer check happens at the coffee break or at lunch,
not as homework.

Still red: ask your neighbour, then the trainer.
