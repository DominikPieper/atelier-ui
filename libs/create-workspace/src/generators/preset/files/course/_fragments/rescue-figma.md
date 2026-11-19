## 5. The Figma bridge

The `figma-console` tools (`figma_take_screenshot`, `figma_get_selection`, ...) need the
Figma Desktop Bridge plugin running in Figma Desktop.

- **"bridge not connected" or a time-out.** In Figma Desktop run
  **Plugins, Development, Figma Desktop Bridge** and leave the panel open while you work.
  The panel scans ports 9223 to 9232; restart Claude Code so the MCP server claims a port,
  and the panel flips from "searching" to "connected".
- **The plugin is missing from Development.** Run `npx -y figma-console-mcp@1.40.0 --help`
  once (same version as the pin in `.mcp.json`) to put the plugin files into
  `~/.figma-console-mcp/plugin/`, then in Figma Desktop **Plugins, Development, Import
  plugin from manifest...** and pick that `manifest.json`.
- **The plugin is out of date** (preflight warns about it). Run the same `npx` command once
  to refresh the files, close the panel and run the plugin again.
- **Every port 9223 to 9232 is in use.** Check who holds them (`lsof -nP -iTCP:9223
-sTCP:LISTEN`) before you stop anything. Old figma-console servers from earlier sessions
  are the usual cause: `pkill -f figma-console-mcp` stops them, and Claude Code starts a
  fresh one on the next tool call.
- **A node id returns nothing.** Node ids belong to one file and change when a frame is
  recreated. Select the frame in Figma and call `figma_get_selection` to get the id that is
  live in your session; in a duplicate the ids are new.
- **403 or "invalid token" on file reads.** `FIGMA_ACCESS_TOKEN` is optional: the bridge
  covers inspection without it. To read metadata create a token in Figma (Settings,
  Security, Personal access tokens; scope Files, File content: Read), export it
  (`export FIGMA_ACCESS_TOKEN=figd_...` in your shell rc file) and restart Claude Code.

What works without the Figma Desktop Bridge: reading the readiness checklist in Figma, and
`docs-show` through the library MCP server. Anything that needs `figma_*` tools needs the
bridge: pair for that.
