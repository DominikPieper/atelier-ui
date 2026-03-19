# Storybook MCPs: Die Zukunft des Frontend Engineerings

**Format:** 30-minütiger Konferenzvortrag

---

## Abschnitt 1: Das Problem — Die Context Gap

KI-generierte Storybook Stories weisen immer wieder die gleichen Fehlermuster auf. Ein KI-Modell weiß nur, was in sein "Context-Window" (sein Kurzzeitgedächtnis) passt. Wenn es deine spezifische Codebase nicht sehen kann, rät es. Das führt zu Code, der zwar kompilierbar ist und läuft, dir aber nichts sagt.

### Die "Happy Path Only" Falle
Bitte eine KI, eine Story für einen Button zu schreiben, und du erhältst genau eine Story. Es fehlen: `Disabled`, `Loading`, `Error` — also jeder State, der in der Produktion tatsächlich kaputtgeht.

### Die Version Tax
Storybook 9 hat die Import-Pfade geändert (z. B. `storybook/test` vs. `@storybook/test`). KI-Modelle raten basierend auf alten Trainingsdaten und scheitern.

### Die Hallucination Tax
"Hallucination" (Halluzination) ist, wenn die KI selbstbewusst Code oder APIs erfindet, die in deinem Projekt gar nicht existieren. Sie generiert generisches Tailwind oder Material UI, weil sie nicht weiß, dass deine interne Bibliothek existiert. Sie erstellt "neue" Components, anstatt deine etablierten zu verwenden.

---

## Abschnitt 2: Was ist Storybook und was ist eine Story?

Bevor wir uns ansehen, wie KI mit Storybook interagiert, klären wir, was es überhaupt ist. Storybook ist ein Frontend-Workshop, um UI Components und Seiten isoliert voneinander zu bauen.

### Was ist eine "Story"?
Eine "Story" fängt einen einzelnen, spezifischen State einer UI Component ein. Anstatt dich durch eine komplexe Anwendung zu klicken, um zu sehen, wie ein Button aussieht, wenn er deaktiviert ist, schreibst du eine Story dafür.

### Beispiel: Der LLMButton
So sieht eine Story im Code aus. Wir definieren die Standard-Component und exportieren dann verschiedene "Stories" (States) wie `Primary`, `Small` oder `Disabled`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LlmButton } from './llm-button';

const meta: Meta<typeof LlmButton> = {
  title: 'Components/LlmButton',
  component: LlmButton,
};
export default meta;

type Story = StoryObj<typeof LlmButton>;

// Story: The primary variant of the button
export const Primary: Story = { 
  args: { variant: 'primary' } 
};

// Story: The button in a disabled state
export const Disabled: Story = { 
  args: { disabled: true } 
};

// Story: The button in a loading state
export const Loading: Story = { 
  args: { loading: true } 
};
```
Durch das Isolieren von Components geben wir sowohl Menschen als auch KI eine klare Sandbox, um UIs zu bauen, zu testen und zu dokumentieren.

---

## Abschnitt 3: Was ist MCP?

Das Model Context Protocol (MCP) ist der **"USB-C-Anschluss für AI Context"**. Es ersetzt fehleranfällige, maßgeschneiderte API-Integrationen durch einen einheitlichen, bidirektionalen Communication Layer.

![MCP Architecture](./mcp-architecture.png)

### Die Architektur: Client-Server-Host

- **AI Host:** Die Hauptanwendung (z. B. Claude Desktop, Cursor), die die User Session koordiniert.
- **MCP Client:** Die standardkonforme Component innerhalb des Hosts.
- **MCP Server:** Ein leichtgewichtiger Service, der Funktionen durch **Tools**, **Resources** und **Prompts** bereitstellt.

- **Stdio Transport:** Lokale Kommunikation ohne Netzwerk.
- **JSON-RPC 2.0:** Deterministisches, strukturiertes Messaging.
- **Local-First:** Dein Source Code verlässt niemals deinen Rechner.

---

## Abschnitt 4: Der gesamte Design-to-Code Cycle

Die wahre Stärke entsteht durch die Kombination von **Design Intent** (Design-Absicht) mit der **Implementation Reality** (Implementierungsrealität).

![Full Design-to-Code Cycle](./complete-workflow.png)

### Die Brücke: Intent vs. Reality

1. **Extraction (Figma MCP):** Figma ist das branchenübliche Kollaborationstool, in dem Designer die UI visuell erstellen. Die KI verbindet sich damit und liest direkte, rohe Tokens und Auto-Layout aus. Kein Raten anhand von Screenshots mehr.
2. **Discovery (Storybook MCP):** Die KI scannt deine Component Library, um zu sehen, was bereits gebaut wurde.
3. **Generation:** Die KI mappt den Figma-"Intent" auf deine "echten" Components.
4. **Validation:** Die KI führt Tests aus und macht Screenshots, um die Parity (Gleichheit) sicherzustellen.

---

## Abschnitt 5: Figma Console MCP — Die Design Truth

![Figma Console MCP](./figma-mcp.png)

Das Figma Console MCP gibt der KI eine direkte API zu deinen Design-Dateien.

### Design Discovery API (`figma_get_design_system_kit`)
Die KI extrahiert das gesamte Design System in einem optimierten Call:
- **Tokens:** Benannte Variablen für Designentscheidungen (z. B. `color-brand-blue = #0052cc`), die Design und Code für Farben, Spacing und Typografie synchron halten.
- **Components:** Metadata, Properties und Variants.
- **Styles:** Effect- und Grid-Definitionen.

### Implementation Support (`figma_get_component_for_development`)
Gibt technische Specs zurück, die fürs Coding optimiert sind:
- **Layout:** Exakte, CSS-ähnliche Werte für Padding, Gap und Size.
- **Typography:** Font Weight, Family und Line Height.
- **Image Preview:** Ein 2x PNG-Rendering als visuelle Referenz.

### Audit & Validation (`figma_check_design_parity`)
Die KI vergleicht die Design System Truth mit deinem Code:
- **Parity Score:** 0-100% Übereinstimmung.
- **Discrepancy Report:** Fehlende Props, Farbabweichungen oder Layout-Drifts.
- **Actionable Fixes:** Vorgeschlagene Code- oder Design-Änderungen, um die Parity wiederherzustellen.

---

## Abschnitt 6: Storybook MCP — Die Implementation Truth

![Storybook MCP](./storybook-mcp.png)

Das Storybook MCP stellt sicher, dass die KI niemals eine API halluziniert.

### Discovery API (`list-all-documentation`)
Die KI beginnt damit, das gesamte System zu scannen, um etablierte Components zu finden:
```text
- LlmAlert (components-llmalert)
- LlmAvatar (components-llmavatar)
- LlmButton (components-llmbutton)
- LlmCheckbox (components-llmcheckbox)
...
```

### Documentation API (`get-documentation`)
Sobald eine Component ausgewählt ist, liest die KI ihre **Living Specification**:
```markdown
# LlmButton (components-llmbutton)

## Props
- variant: 'primary' | 'secondary' | 'outline' (default: 'primary')
- size: 'sm' | 'md' | 'lg' (default: 'md')
- loading: boolean
...

## Real Usage Examples (from existing stories)
```
```typescript
<LlmButton variant="primary" size="md">Button</LlmButton>
```

---

## Abschnitt 7: Mandatory Guardrails (`get-storybook-story-instructions`)

Dieses Tool liefert die **Rules of Engagement** (Einsatzregeln). Es verhindert die "Version Tax", indem es der KI genau mitteilt, was du installiert hast.

### Version-Specific Guidance
```diff
// Storybook 9 forces package consolidation
- import { fn } from '@storybook/test';
+ import { fn } from 'storybook/test';

- import { Meta } from '@storybook/react';
+ import { Meta } from '@storybook/react-vite';
```

### Critical Implementation Rules
- **Mocking Strategy:** Wenn externe Daten oder Services simuliert werden, damit eine Component isoliert ausgeführt werden kann (Mocking), müssen relative Imports **File Extensions** (Dateiendungen) verwenden.
- **Play Function Syntax:** Verwende NICHT `within(canvas)`; `canvas` verfügt bereits über Query-Methoden.
- **Coverage Goals:** Happy Path, Error, Loading und Empty States sind **erforderlich**.

---

## Abschnitt 8: Autonomous Verification Loop (`run-story-tests`)

![Autonomous Verification Loop](./autonomous-loop.png)

Hör auf, zwischen Fenstern zu wechseln, um zu prüfen, ob es funktioniert.

- **The Verification Loop:** Wenn eine `play`-Funktion fehlschlägt, sieht die KI den Stack Trace und behebt den Bug automatisch.
- **Interactive A11y (Accessibility):** Führt Accessibility Audits (`a11y: true`) während der Entwicklung durch, um sicherzustellen, dass die UI für alle nutzbar ist (wie z. B. für Screen-Reader-Nutzer). Es behebt semantische Probleme (wie fehlende Form-Labels) sofort.

---

## Abschnitt 9: Closing the Loop (`preview-stories`)

Die Feedback Loop gehört in den Chat.

- **Props & Globals Override:** Preview "Dark Mode" oder "Loading", ohne eine neue Story schreiben zu müssen.
- **Visual Confidence:** Die KI packt anklickbare Preview URLs in jede Antwort. Ein Klick zur Bestätigung, kein Context-Switching.

---

## Abschnitt 10: Maintaining Parity at Scale

Wie stoppen wir den visuellen Drift?

- **Continuous Auditing:** Nutze `figma_check_design_parity`, um zu erkennen, wenn Code und Design auseinanderlaufen.
- **Automated Fixes:** Die KI generiert Reports mit den exakten Code Changes, die benötigt werden, um mit dem neuesten Design System Update übereinzustimmen.

---

## Abschnitt 11: Real Examples (Angular/React)

### Angular Wrapper Pattern
Für komplexe DI (Dependency Injection) oder Services lernt die KI, das Wrapper `@Component` Pattern zu verwenden:
```typescript
@Component({ template: `<toast-story-wrapper />` })
class ToastStoryWrapper { ... }
```

### React Controlled State
Die KI nutzt `useState` in Story-Rendern, um komplexe Interaktionen zu handhaben:
```tsx
const [open, setOpen] = useState(false);
return <LlmDialog open={open} onOpenChange={setOpen} />;
```

---

## Abschnitt 12: Die neue Rolle des Senior Developers

Wenn die KI die "Übersetzung" übernimmt, was machst du dann noch?

1. **Review Intent:** Ist das Figma Design architektonisch solide?
2. **Review High-Level Logic:** Folgt die generierte Component den Patterns deines Teams?
3. **Orchestrate complexity:** Kümmere dich um die 10% der Fälle, die die KI nicht abdecken kann.
4. **System Maintenance:** Pflege die MCP Server und Generator Templates.

---

## Abschnitt 13: The Full Enforced Workflow (Summary)

```
User: "Implement the login form from Figma"
          │
          ▼
AI: Reads Figma Tokens → Discovers SB Components → Scans SB9 Rules
          │
          ▼
AI: Writes implementation using <LlmInput> & <LlmButton>
          │
          ▼
AI: Runs Story Tests → Performs A11y Audit → Captures Screenshot
          │
          ▼
AI: "Verified. Preview: [Link]. No A11y issues found."
```

---

## Abschnitt 14: Closing & Resources

- **Installiere `@storybook/mcp`** — Erhalte noch heute versionskorrekte Imports.
- **Installiere `figma-console-mcp`** — Verbinde deine KI mit deiner Design Truth.
- **Füge die `CLAUDE.md` Regel hinzu** — Mach es mandatory (verpflichtend), nicht optional.

### Fragen?
Du findest den gesamten Source Code und diese MCP Tools im `angular-llm-components` Repo.