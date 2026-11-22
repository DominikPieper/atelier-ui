# Prompt-Rubrik

Sechs Prüfungen für Deine eigenen Prompts, an beiden Tagen. Geh sie durch, bevor Du einen
Prompt abschickst, und noch einmal, wenn das Ergebnis nicht stimmt. Eine Aufgabenkarte sagt
Dir, was am Ende da sein muss. Wie Du den Prompt formulierst, bleibt Deine Sache. Die
Rubrik sagt Dir, woran Du ihn misst.

1. **Quelle benannt.** Der Prompt nennt, woraus der Agent arbeitet: eine Node-ID, ein
   Entscheidungsdatei, eine Datei. Ohne Quelle füllt der Agent die Lücke aus dem Gedächtnis.
2. **Scope-Guard.** Der Prompt sagt, was mit dem passiert, was fehlt: Es endet als Liste
   offener Fragen, nicht als geratener Wert.
3. **Plan zuerst.** Für alles, was über eine Datei hinausgeht, liest Du den Plan, bevor
   Code entsteht (Plan-Modus mit Shift+Tab).
4. **Ziel genannt.** Der Prompt sagt, was am Ende gelten muss, über das hinaus, was `/verify`
   ohnehin prüft. Der erste Prompt trägt die ganze Aufgabe samt Ziel in einer Nachricht.
5. **Ein Befund pro Runde.** In Korrekturrunden geht pro Prompt ein Befund zurück, damit Du
   siehst, was genau diese Änderung bewirkt hat. Der erste Prompt ist davon ausgenommen.
6. **Fix am richtigen Ort.** Etwas Einmaliges gehört in den nächsten Prompt. Etwas, das
   wiederkehrt, gehört als einfache Zeile mit ihrem Grund in `CLAUDE.md` oder den Skill.
   Etwas, das nie passieren darf, gehört in eine Lint-Regel oder einen Hook.

Über allen sechs steht eine Regel: Beschreib, was erreicht sein soll und warum, nicht jeden
Handgriff auf dem Weg dorthin. Den Weg findet der Agent selbst. Schritt-für-Schritt-Anleitungen,
technische Vorgaben, die niemand braucht, und „MUSS“ in Großbuchstaben machen das Ergebnis
eher schlechter. Zu vage hilft aber auch nicht: Quelle, Rahmen und Ziel gehören hinein.

Hängst Du fest, melde dem Agenten die fünf Dinge aus dem Abschnitt „Wenn Du festhängst“,
statt „es geht nicht“ zu schreiben.
