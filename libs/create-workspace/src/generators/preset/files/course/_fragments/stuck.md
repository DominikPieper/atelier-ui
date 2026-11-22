## Wenn Du festhängst

Claude sieht weder Dein Terminal noch Deinen Bildschirm. Auf die Meldung „es geht nicht“
bekommst Du eine Vermutung, auf eine Meldung mit den vier Dingen unten eine Diagnose. Füge
diese vier Dinge ein:

1. **Der genaue Fehler.** Der erste Fehler, kopiert, nicht abgetippt und nicht
   zusammengefasst. Die letzte Zeile einer langen Ausgabe ist meist nur eine Folge.
2. **Der Exit-Code.** Führe den Check wie unten aus und lies die Datei danach. Wer in `head`
   oder `grep` pipet, bekommt den Exit-Code der Pipe, und der ist immer `0`: Ein roter Check
   sieht dann grün aus.
3. **Was Du erwartet hast.** Eine Zeile: „Exit 0“, „die kompakte Card ist enger“, „keine
   axe-Verletzung“.
4. **Was sich zuletzt geändert hat.** Die Befehle, die Du ausgeführt hast, der Reihe nach,
   und das Letzte, das grün war, bevor es kaputtging.

```shell
npm run check:stories > check.out 2>&1; echo $?
```

`check.out` ist eine Arbeitsdatei im Workspace-Root. Lösche sie, wenn Du fertig bist
(`rm check.out`); die `.gitignore` des Workspace hält sie aus Deinen Commits heraus.

Eine Meldung, die Du ausfüllen und einfügen kannst:

```text
Ein Check ist rot. Hilf mir, die Ursache zu finden, nicht nur einen Patch.

Ausgeführt: npm run check:stories > check.out 2>&1; echo $?
Exit-Code:  1
Ausgabe:    check.out (lies sie; der erste Fehler ist der, auf den es ankommt)
Erwartet:   Exit 0, jede Story rendert und besteht ihre play-Funktion und den axe-Check
Geändert:   seit dem letzten grünen Lauf habe ich nur die Prop density und ihre Stories ergänzt (die fehlschlagende Story ist die neue)

Bevor Du etwas änderst, sag mir, was Du für die Ursache hältst und was Dich widerlegen
würde.
```
