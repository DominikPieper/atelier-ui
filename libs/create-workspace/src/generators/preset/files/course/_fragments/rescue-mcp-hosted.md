- **`storybook-{{FW}}` ist getrennt, oder jedes Tool liefert Fehler** (zum Beispiel „Failed to
  fetch manifest components.json: 522“). „Connected“ beweist nur, dass die URL antwortet,
  nicht, dass die Tools funktionieren. `npm run preflight` macht einen echten Aufruf gegen
  den Endpunkt und gibt den Fehlertext des Servers aus. Blockiert Dein Netz ausgehendes
  HTTPS, braucht ein Firmenproxy `HTTPS_PROXY=http://your-proxy:port`, bevor Du Claude Code
  startest. Einen Fehler auf Serverseite musst Du nicht beheben: Sag dem Trainer Bescheid.
