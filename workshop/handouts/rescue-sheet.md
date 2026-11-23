# Rescue: Wenn Dein Platz rot ist

Von oben nach unten. Benenne zuerst, welcher Teil fehlt (Modellzugang, MCP-Server oder Storybook), und behebe nur den. Nicht alles auf einmal.

## 1. Modellzugang

`npm run preflight` sendet nie eine Anfrage an ein Modell und sieht das deshalb nicht. Beweise den Zugang mit einer echten Anfrage:

```
claude -p "Reply with exactly: PREFLIGHT-OK"
```

Authentifizierungsfehler: Sag dem Trainer Bescheid. Die Anmeldung läuft im Raum: `claude auth login`, dann die Anmeldung im Browser abschließen.

## 2. Preflight

1. Führe `npm run preflight` aus und lies die roten Zeilen.
2. `MCP: atelier ... is not installed`: `npm install`, dann Preflight noch einmal.
3. Starte nach der Installation eine neue Claude-Code-Sitzung im Workspace-Root.

## 3. Die MCP-Server

1. Tippe in Claude Code `/mcp`. `atelier` und `storybook-local` sollten verbunden sein.
2. Ein Server fehlt oder ist nicht verbunden: In `/mcp` neu verbinden.
3. Bearbeite die `.mcp.json` nicht und füge keinen Server von Hand hinzu.

## 4. Storybook läuft nicht

1. Starte es: `npm run storybook`. Die Tools erscheinen von selbst; wenn nicht, `storybook-local` in `/mcp` neu verbinden.
2. Port belegt: `npm run storybook` bricht ab (`--exact-port`), statt auf 6007 auszuweichen. Sieh nach, wer 6006 hält: `lsof -nP -iTCP:6006 -sTCP:LISTEN` (keine Ausgabe heißt: frei). Beende nur den veralteten Dev-Server, dann starte neu.
3. `storybook-local` liest fest Port 6006. Prüfe vor jedem Lauf, dass dort Dein Storybook antwortet.
4. Ein Platz, der rot bleibt, arbeitet weiter: Das Storybook im Browser und `npm run check:stories` zeigen dasselbe Ergebnis.

## 5. Die Figma-Bridge

1. In Figma Desktop: Plugins, Development, **Figma Desktop Bridge** starten und das Panel offen lassen. Tools getrennt oder Plugin veraltet: Panel schließen, Plugin neu starten.
2. `WebSocket not connected`: Meist hat Dein Server auf einen anderen Port ausweichen müssen (9224 bis 9232), weil ein anderer figma-console-Server 9223 hält. Warte eine Minute, lass den Agenten `figma_get_status` mit `probe` aufrufen, versuche es dann noch einmal. Schließe andere Claude-Code-Sitzungen mit Figma. `figma_reconnect` hilft nicht.
3. Mehrere Server belegen die Bridge: `pkill -f figma-console-mcp`, dann ein Figma-Tool aufrufen. Claude Code startet einen frischen Server.

## Kaputter Workspace

Repariere ihn nicht selbst. Sag dem Trainer sofort Bescheid: Der Rechner ist seine Sache.

## Deine eigene Komponente trägt nicht

Du musst nichts aufholen. Zwei Einstiege: vor dem Bauen der Toast-Brief `course/briefs/toast.md` mit der fertigen Entscheidungsdatei `course/referenz/toast/ref-toast.decisions.md`; vor den Prüfungen die fertige Referenz-Toast in `course/referenz/toast/` (README dort).

**Noch rot: sag dem Trainer Bescheid.**

Dieselben Schritte stehen in `course/rescue.md` in Deinem Workspace.
