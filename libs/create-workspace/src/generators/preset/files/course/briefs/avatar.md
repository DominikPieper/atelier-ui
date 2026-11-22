# Komponenten-Brief: Avatar

> **Quelle:** eine kanonische Komponente, abgebildet auf das `Library Tokens`-Vokabular von Atelier.
> **Starter-Frame:** `Avatar / Starter`, Node `703:355` auf der Seite `🛠️ Workshop-Templates`.
> **Lies zuerst [`README.md`](README.md).** Die gemeinsamen Regeln und die Messlatte „Fertig, wenn“
> stehen dort und werden hier nicht wiederholt.

Ein grafischer Stellvertreter für eine Person, eine Organisation oder eine Entität (Bild, Initialen oder Icon)
in einer begrenzten 1:1-Fläche. Die Komponente wirkt trivial und ist es nicht: Ihre ganze Substanz ist eine
**Fallback-Kette** und der zugängliche Name, der jede Stufe davon überstehen muss.
Ein Avatar, der korrekt rendert, aber „image, AB“ ansagt, ist gescheitert.

---

## 1. Anatomie

Fünf Slots. Einer ist Pflicht, vier sind bedingt, und die Bedingungen sind die Komponente.

| Slot               | Pflicht | Figma                                    | Was es ist                                                                                                                                                                        |
| ------------------ | ------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container`        | ja      | Frame, feste Größe, Seitenverhältnis 1:1 | Die begrenzte Fläche. Trägt die Form, die Größenstufe und den Anker des Status. Der Radius ist an die Form-Variante gebunden.                                                     |
| `image`            | nein    | Bildfüllung auf dem Container            | Die primäre Darstellung. Lädt asynchron, `object-fit: cover`, auf die Form des Containers zugeschnitten.                                                                          |
| `initials`         | nein    | Text, zentriert                          | Fallback ohne Bild. Ein oder zwei Buchstaben, Größe auf die Avatar-Stufe skaliert.                                                                                                |
| `fallback-icon`    | nein    | Instanz                                  | Letzte Stufe. Eine generische Personen-Glyphe, wenn weder Bild noch Name existiert.                                                                                               |
| `status-indicator` | nein    | Frame, kleiner Kreis                     | Präsenzpunkt, verankert an der Ecke **inline-end / block-end** des Containers, mit einem Rahmen in der Farbe des Seitenhintergrunds, damit er sich von der Avatar-Fläche absetzt. |

**Die Fallback-Kette ist geordnet, und die Reihenfolge ist ein Vertrag:**
`image` → `initials` → `icon`. Die Bild-Stufe greift, wenn `src` vorhanden ist _und_
das Laden gelingt. Die Initialen-Stufe greift, wenn ein Name vorhanden ist _und_ die Bild-Stufe fehlgeschlagen ist.
Die Icon-Stufe greift, wenn beide fehlgeschlagen sind.

**Token-Budget.** `container`: Hintergrund `color/surface-sunken`, Rahmen `color/border`,
Radius `radius/full` (Kreis) oder `radius/md` (Quadrat). `initials`: Vordergrund
`color/text-muted`, Gewicht `font-weight/semibold`. `fallback-icon`: `color/text-muted`.
`status-indicator`: Radius `radius/full`, Rahmenfarbe `color/surface`.

**Größe ist ein Token, keine Zahl.** Binde die Abmessung des Containers an eine Stufe, nicht an
`24px`. Ein Avatar mit fest eingetragenen Pixeln gerät aus der Flucht mit dem Text daneben, sobald
die Typografie-Skala das erste Mal neu justiert wird.

---

## 2. Achsen

**Variante (die Form-Achse):** `circle` · `square`.

**Properties (keine Varianten):**

| Property             | Art     | Werte                               |
| -------------------- | ------- | ----------------------------------- |
| `size`               | enum    | `xs`, `sm`, `md`, `lg`, `xl`        |
| `status`             | enum    | `online`, `offline`, `away`, `busy` |
| `hasStatusIndicator` | boolean | —                                   |

Beachte, was hier _nicht_ steht: Es gibt keinen „Bild-Avatar“ und keinen „Initialen-Avatar“. Das sind
**Zustände einer Komponente**, nicht Varianten von zwei Komponenten (siehe §5).

### Umfang für den 90-Minuten-Block

**Im Umfang: `circle` und `square`, in den Zuständen `image-loaded` und `initials-fallback`.**
Dieses Paar ist der ganze Sinn der Komponente: Hier wird die Fallback-Kette sichtbar, und hier muss
der zugängliche Name in beiden identisch sein.

**Nicht im Umfang, und sag das in der Beschreibung, statt es stillschweigend wegzulassen:** die fünf
Größenstufen (baue `md`), die vier `status`-Werte, `image-loading` und `icon-fallback`.

---

## 3. Zustände

**Interaktiv:** `hover`, `focus-visible`, und nur, wenn der Avatar selbst der
Auslöser ist, was selten vorkommt. Meist übernimmt das Host-Element die Interaktion.

**Daten:** `image-loading`, `image-loaded`, `image-error`, `initials-fallback`,
`icon-fallback`.

Das sind Datenzustände, keine Varianten. Die Laufzeit wechselt von selbst zwischen ihnen, während das
Bild geladen wird. Die maßgebliche Quelle führt für den Avatar keine benannten Übergänge, weil
die Bewegung nur in eine Richtung läuft und vom Ladeergebnis getrieben wird, nicht von der Absicht des Nutzers:
`image-loading` löst sich zu `image-loaded` oder `image-error` auf, und `image-error` fällt
durch zu `initials-fallback` und dann zu `icon-fallback`, sobald die Vorbedingung jeder Stufe
scheitert.

Zeichne mindestens die Frames `image-loaded` und `initials-fallback`. Die kanonische Vorgabe
ist eindeutig: Designer zeichnen alle drei Fallback-Stufen für **einen** repräsentativen Avatar,
damit Entwickler eine Referenz für den Fall haben, den das Mockup nie zeigt.

---

## 4. Anforderungen an die Barrierefreiheit

Zwei davon haben den Schweregrad blocker. Beide betreffen den Namen, nicht das Bild. Jeder Punkt ist außerdem
mit **(dieser Block)** markiert, also prüfbar an den Frames `image-loaded` / `initials-fallback`,
die Du zeichnest, und an der Beschreibung, die Du schreibst, oder mit **(volle Komponente)**, also real, aber
abhängig von der `status`-Achse, die §2 aus dem Umfang nimmt (siehe [`README.md`, Punkt
7](README.md#fertig-wenn)).

1. **Jede Stufe hat einen zugänglichen Namen.** _(blocker · dieser Block)_ Die Stufen Initialen und Icon
   setzen `role="img"` plus `aria-label` am Container. Die Bild-Stufe nutzt
   `<img alt="…">`. Ein Avatar, der „AB“ ohne Label rendert, ist für
   assistive Technik bedeutungslos. Beide Frames im Umfang gibt es für dieselbe Entität: Schreib den gemeinsamen
   zugänglichen Namen in die Beschreibung (§6 verlangt das).
2. **Die Fallback-Reihenfolge ist fest.** _(blocker · dieser Block)_ Bild → Initialen → Icon,
   immer. Eine Implementierung, die je nach Umgebung oder Bibliotheksversion anders zurückfällt, gibt derselben Person
   auf verschiedenen Bildschirmen eine andere Identität. Die zwei Frames, die Du zeichnest, sind zwei Punkte auf dieser Reihenfolge, direkt prüfbar.
3. **Der Name ist der volle Name, nie die Initialen.** _(major · dieser Block)_
   `aria-label="Alex Black"`, nicht `aria-label="AB"`. Die Initialen sind visuelle Kurzschrift,
   der zugängliche Name ist die Wahrheit. Gleiche Vorgabe für die Beschreibung wie in Punkt 1.
4. **`alt` ist an der Bild-Stufe immer vorhanden.** _(major · dieser Block)_ `alt=""` für einen
   dekorativen Avatar, dessen Host den Namen schon trägt, sonst `alt="<entity name>"`.
   Nie _undefined_, sonst sagen manche Screenreader den Dateipfad an. Der Frame
   `image-loaded` ist im Umfang: Nenne den `alt`-Wert in seiner Beschreibung.
5. **Der Status-Punkt trägt ein Label.** _(major · volle Komponente)_ `aria-label="online"` /
   `"offline"` / `"away"` / `"busy"`. Ein farbiger Punkt allein ist eine Information nur für Sehende.
   Die `status`-Achse und `hasStatusIndicator` sind beide nicht im Umfang (§2): Nichts, was Du hier baust,
   hat einen Status-Punkt, den man beschriften könnte.
6. **Dekorative Avatare steigen ganz aus.** _(dieser Block)_ Steht neben dem Avatar ein sichtbarer Name,
   setze `aria-hidden="true"` und lass den Namen des Hosts das tragen:
   den Namen doppelt anzusagen ist schlimmer, als ihn hier gar nicht anzusagen. Eine
   inhaltliche Entscheidung, unabhängig davon, welche Fallback-Stufe gerade zu sehen ist: Halte sie in der Beschreibung fest.
7. **Der Status-Punkt ist mit logischen Properties verankert.** _(volle Komponente)_ `inset-inline-end`
   / `inset-block-end`, damit er bei RTL mitspiegelt und nicht am falschen
   Rand strandet. Hängt vom Status-Indikator ab, der nicht im Umfang ist (§2).

---

## 5. Figma ↔ Code: die Stolperstellen

| Gezeichnet als                                                       | Implementiert als                               | Warum es wehtut                                                                                                                                                                                      |
| -------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| „Avatar (image)“ und „Avatar (initials)“ als zwei Komponenten        | Eine Komponente mit Fallback-Kette zur Laufzeit | Die beiden laufen auseinander. Designer hören auf, den Initialen-Frame für neue Avatare zu zeichnen, und Entwickler haben keine Referenz für den Fallback, den der Nutzer tatsächlich sieht.         |
| Ein farbiger Punkt in der Nähe des Avatars, an absoluten Koordinaten | Ein Slot, verankert über logische Properties    | Identisch bei LTR, falsch bei RTL. Modelliere den Punkt als **Kind** des Containers, nicht als Geschwister.                                                                                          |
| Statischer Text „AB“ im Frame eingebacken                            | Initialen, berechnet aus einer `name`-Prop      | Die Datei dokumentiert den Algorithmus nie (erster Buchstabe? erste zwei? erster jedes Wortes?), also erfindet ihn jede Implementierung neu. Kanon: **erster Buchstabe jedes Wortes, maximal zwei**. |
| `width: 24px` am Frame                                               | Ein Größen-Token (`xs`…`xl`)                    | Die Figma-Datei hinkt der nächsten Neujustierung der Skala hinterher, und der ausgelieferte Avatar passt nicht mehr zum Text daneben.                                                                |

---

## 6. Woran Du „fertig“ erkennst

Zusätzlich zur gemeinsamen Messlatte in [`README.md`](README.md):

- Ein Component Set mit einer `variant`-Achse aus `circle` / `square`, nicht zwei Komponenten.
- Die Frames `image-loaded` und `initials-fallback` gibt es beide, für dieselbe Entität,
  mit **demselben** zugänglichen Namen in der Beschreibung.
- Die Beschreibung nennt die Fallback-Reihenfolge und den Initialen-Algorithmus.
- Der Status-Punkt, falls Du ihn baust, ist ein Kind des Containers und mit
  logischen Properties positioniert.

---

**Bevor Du promptest:** Schreib zuerst das Übergabedokument. Ein ausgefülltes Beispiel (zum Toast-Brief) steht in `../handoff-example.md`.
