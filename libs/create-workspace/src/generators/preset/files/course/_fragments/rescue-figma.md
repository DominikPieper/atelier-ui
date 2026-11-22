## 5. Die Figma-Bridge

Die `figma-console`-Tools (`figma_take_screenshot`, `figma_get_selection`, ...) brauchen das
Plugin Figma Desktop Bridge, das in Figma Desktop läuft.

- **„bridge not connected“ oder ein Time-out.** Starte in Figma Desktop
  **Plugins, Development, Figma Desktop Bridge** und lass das Panel offen, solange Du
  arbeitest. Das Panel scannt die Ports 9223 bis 9232. Starte Claude Code neu, damit der
  MCP-Server einen Port belegt, dann springt das Panel von „searching“ auf „connected“.
- **Das Plugin fehlt unter Development.** Führe einmal `npx -y figma-console-mcp@1.40.0 --help`
  aus (dieselbe Version wie der Pin in `.mcp.json`), damit die Plugin-Dateien in
  `~/.figma-console-mcp/plugin/` landen. Wähle dann in Figma Desktop **Plugins, Development,
  Import plugin from manifest...** und nimm diese `manifest.json`.
- **Das Plugin ist veraltet** (preflight warnt davor). Führe denselben `npx`-Befehl einmal
  aus, um die Dateien zu aktualisieren, schließe das Panel und starte das Plugin neu.
- **Alle Ports 9223 bis 9232 sind belegt.** Sieh nach, wer sie hält (`lsof -nP -iTCP:9223
-sTCP:LISTEN`), bevor Du etwas beendest. Meist sind alte figma-console-Server aus früheren
  Sitzungen schuld: `pkill -f figma-console-mcp` beendet sie, und Claude Code startet beim
  nächsten Tool-Aufruf einen frischen.
- **`WebSocket not connected` bei einem `figma_*`-Aufruf.** Meist hat Dein Server auf einen
  anderen Port ausweichen müssen (9224 bis 9232), weil ein anderer figma-console-Server
  Port 9223 hält, zum Beispiel aus einer zweiten Claude-Code-Sitzung mit Figma. Das Plugin
  findet einen neuen Server nur beim nächsten Scan. Warte eine Minute, lass den Agenten
  `figma_get_status` mit `probe` aufrufen und den Aufruf danach noch einmal versuchen.
  Schließe andere Claude-Code-Sitzungen, die Figma nutzen. `figma_reconnect` hilft nicht.
- **Eine Node-ID liefert nichts.** Node-IDs gehören zu einer Datei und ändern sich, wenn ein
  Frame neu angelegt wird. Wähle den Frame in Figma aus und rufe `figma_get_selection` auf,
  dann hast Du die ID, die in Deiner Sitzung gilt. In einem Duplikat sind die IDs neu.
- **403 oder „invalid token“ beim Lesen von Dateien.** `FIGMA_ACCESS_TOKEN` ist optional: Die
  Bridge deckt die Inspektion auch ohne ihn ab. Für Metadaten erstelle in Figma ein Token
  (Settings, Security, Personal access tokens; Scope Files, File content: Read), exportiere
  es (`export FIGMA_ACCESS_TOKEN=figd_...` in Deiner Shell-rc-Datei) und starte Claude Code
  neu.

Was ohne die Figma Desktop Bridge geht: die Bereitschafts-Checkliste in Figma lesen und
`docs-show` über den Bibliotheks-MCP-Server. Alles, was `figma_*`-Tools braucht, braucht die
Bridge: Macht das zu zweit.
