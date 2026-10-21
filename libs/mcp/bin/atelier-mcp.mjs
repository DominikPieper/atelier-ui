#!/usr/bin/env node
// Thin entry point for the `atelier-mcp` bin. The server itself lives in src/server.mjs so it
// can be imported and tested without spawning a child process.
import { startServer } from '../src/server.mjs';

startServer().catch((err) => {
  console.error('[atelier-mcp] failed to start:', err);
  process.exitCode = 1;
});
