# Referenz: ein fertiger Toast (Notausgang)

Das hier ist ein **fertiger, geprüfter Toast** zum Toast-Brief (`briefs/toast.md`). Er ist der
**Notausgang für Block 03 und 04**: Wenn Deine eigene Komponente dann noch nicht trägt, nimmst
Du diese hier und machst mit den Prüfungen weiter. Er ist **kein Muster zum Abschreiben für
Block 02**. Dort baust Du Deine eigene Komponente aus Deinen Entscheidungen.

Solange der Ordner hier liegt, ist er **nicht** Teil der App: Storybook, Lint, Stylelint,
Unit-Tests und Build sehen nur `workshop-angular/`. Dein eigener Toast kann deshalb daneben
bestehen. Die Komponente heißt `RefToast` (Selektor `app-ref-toast`), nicht `AtlToast`.

## In einer Minute einbinden

Der Zielordner ist `workshop-angular/src/app/components/ref-toast/`. Kopiere den Inhalt dieses
Ordners (alles außer dieser `README.md`) dorthin. Oder sag dem Agenten:

> Kopiere alle Dateien aus `course/referenz/toast/` außer `README.md` nach
> `workshop-angular/src/app/components/ref-toast/`. Ändere nichts daran, und sag mir, welche
> Dateien Du angelegt hast.

Danach sieht Storybook die Stories unter `RefToast`, und `npm run check:unit` führt den Test aus.

## Der Beleg, dass es trägt

```bash
npm run check:stories
```

Fertig, wenn der Befehl mit Exit-Code 0 endet (prüfe den Exit-Code, nicht die letzte Zeile der
Ausgabe). Die Entscheidungen zu dieser Komponente stehen in `ref-toast.decisions.md`: ein
`play` je Verhaltenseintrag, der aktuelle Stand liegt in den Stories und im Test.
