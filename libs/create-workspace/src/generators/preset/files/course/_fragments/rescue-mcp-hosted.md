- **`storybook-{{FW}}` is disconnected, or every tool errors** (for example "Failed to
  fetch manifest components.json: 522"). "Connected" only proves the URL answers, not that
  the tools work. `npm run preflight` makes a real call against the endpoint and prints the
  server's error text. If your network blocks outbound HTTPS, a corporate proxy needs
  `HTTPS_PROXY=http://your-proxy:port` before you start Claude Code. A server-side fault is
  not yours to fix: tell the trainer.
