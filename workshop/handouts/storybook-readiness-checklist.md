# Ist Dein Storybook bereit?

Hausaufgabe, an Deinem eigenen Storybook: Im Raum fängt das niemand an. Hake ab, was zutrifft. Teil A pro Komponente, Teil B einmal pro Setup, danach der Selbsttest.

Komponente / Storybook geprüft: ______________________________

## Teil A: eine Komponente

- [ ] Die Komponentenklasse hat eine JSDoc-Beschreibung
- [ ] Jeder Input hat eine JSDoc-Zeile, und Defaults sind echte Startwerte
- [ ] Geschlossene Wertemengen sind im Inputs-Block sichtbar
- [ ] Outputs und Two-Way-Bindings sind mit der eigenen API des Frameworks deklariert
- [ ] Eine Story pro Variantenwert und Zustand, gesteuert über Args
- [ ] Die drei ersten Stories sind die, die man kopieren soll
- [ ] Jede Story erzeugt ein vollständiges Snippet
- [ ] Eine Story, die eine Erklärung braucht, sagt das in einem JSDoc-Kommentar darüber

## Teil B: das Setup

- [ ] Der Build erzeugt ein Manifest mit einem echten Docgen-Durchlauf
- [ ] Ein Agent erreicht es, ohne Browser
- [ ] Du hast den Manifest-Report angesehen
- [ ] Story-Titel sind stabil und tragen die Kategorie
- [ ] Hinweise, die nicht zu einer einzelnen Komponente gehören, stehen in einem Docs-Eintrag, als Markdown geschrieben

## Übung: Prüfe Dein Storybook

Füge diesen schreibgeschützten Prompt in Deinen Agenten ein, mit dem MCP Deines Storybooks verbunden:

> Storybook-Bereitschaftscheck, nur lesen. Ändere keine Datei. Nutze nur die IDs, die `docs-list` liefert. (1) Rufe `docs-list` einmal auf: nenne Komponenten ohne Beschreibung und Einträge unter „Docs“. (2) Rufe `docs-show` pro Komponente auf (bei mehr als 15: nimm 10 und sag, welche Du übersprungen hast) und halte fest: Beschreibung und Zweck im ersten Satz; Inputs ohne Beschreibungszeile; Typen mit Alias-Namen, deren Werte nicht ausgeschrieben sind; Events oder Two-Way-Bindings, die im Block fehlen; Stories, die nur mit Namen gelistet sind (ohne Snippet); Variantenwerte oder Zustände ohne Story; ob die ersten drei Stories die Standardverwendung und die zwei typischsten Variationen sind. (3) Gib eine Tabelle aus: Komponente, Befund, welche Prüfung er verletzt, Wahrscheinlichkeit von falschem Code (hoch, mittel, niedrig). (4) Nenne den einen Befund, der Dich dazu bringen würde, eine Prop oder einen Wert zu erfinden, und warum. (5) Liste auf, was Du nicht prüfen konntest. Schlage keine Korrekturen vor und wende keine an.

Danach:

1. Such Dir einen aus: den Befund, der einen Agenten am ehesten eine Eigenschaft oder einen Wert erfinden ließe.
2. Behebe ihn dort, wo er deklariert ist: im JSDoc, im Typ oder in der Story.
3. Führe denselben Prompt noch einmal aus. Der Befund sollte weg sein, und nichts Neues sollte aufgetaucht sein.

Der Befund, den ich zuerst behebe: ______________________________
