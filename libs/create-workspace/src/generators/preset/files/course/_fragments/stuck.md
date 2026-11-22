## Wenn Du festhängst

Claude sieht weder Dein Terminal noch Deinen Bildschirm. Auf die Meldung „es geht nicht“
bekommst Du eine Vermutung, auf eine Meldung mit den fünf Dingen unten eine Diagnose. Gib
diese fünf Dinge an:

- **Ausgeführt.** Der genaue Befehl, so wie Du ihn getippt hast.
- **Exit-Code.** Führe den Check wie unten aus und lies die Datei danach. Wer in `head`
  oder `grep` pipet, bekommt den Exit-Code der Pipe, und der ist immer `0`: Ein roter Check
  sieht dann grün aus.
- **Ausgabe.** Der erste Fehler, kopiert, nicht abgetippt und nicht zusammengefasst. Die
  letzte Zeile einer langen Ausgabe ist meist nur eine Folge. Nenne die Datei, in der die
  Ausgabe liegt, damit der Agent sie selbst lesen kann.
- **Erwartet.** Eine Zeile: „Exit 0“, „die kompakte Card ist enger“, „keine axe-Verletzung“.
- **Geändert.** Die Befehle, die Du ausgeführt hast, der Reihe nach, und das Letzte, das grün
  war, bevor es kaputtging.

Sag dem Agenten außerdem, dass er vor jeder Änderung nennen soll, was er für die Ursache
hält und was ihn widerlegen würde.

```shell
npm run check:stories > check.out 2>&1; echo $?
```

`check.out` ist eine Arbeitsdatei im Workspace-Root. Lösche sie, wenn Du fertig bist
(`rm check.out`); die `.gitignore` des Workspace hält sie aus Deinen Commits heraus.
