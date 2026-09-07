<!-- NotebookLM synthesis answer, notebook f153635d-2589-4922-8fcc-6c171482d1fe, 2026-09-07. Numbers in brackets are NotebookLM citation ids; the map from id to source excerpt follows the answer. Second reader over the web sources in 03–06, not a primary source. -->

### 📂 Area 1: Page Taxonomy, Order, and Structural Organization

*   [ ] **Establish a strict, standardized page taxonomy and order** to keep the component library clean for human designers and reliably traversable for MCP agents `[1]`:
    1.  **Cover**: High-fidelity file introduction `[1]`.
    2.  **Getting Started**: Onboarding notes, usage guidelines, and framework targets `[2, 3]`.
    3.  **Changelog**: Human-readable markdown record of changes and releases `[4, 5]`.
    4.  **Foundations/Tokens**: Rendered visual swatches of variables and styles `[1]`.
    5.  **Icons**: Automated icon assets published as a dedicated library file to prevent bloat `[6, 7]`.
    6.  **Components**: Individual, dedicated pages for each public composed component set `[6, 7]`.
    7.  **Patterns**: Molecules and layout combinations `[8, 9]`.
    8.  **Templates**: High-level page-level layouts built entirely from library components `[6, 7]`.
    9.  **Playground**: Interactive sandboxes with code preview tools `[10, 11]`.
    10. **Deprecated**: Retained older versions with clear warnings to prevent adoption `[12, 13]`.
    11. **Private/WIP**: Drafts and sandboxes shielded from the main publishing pipeline `[14, 15]`.
*   [ ] **Split large libraries into multiple files** (e.g., base, icons, components, templates) once the file size degrades canvas rendering performance `[6, 7]`. However, **keep all variable collections inside a single parent file** to prevent cross-file alias reference breakages `[6, 7]`.
*   [ ] **Implement a strict governance and branching model** `[16, 17]`. Designers must edit on isolated branches and submit merge requests comparing differences, requiring peer reviews (e.g., a two-approval checklist) before publishing changes back to the main file `[16-19]`.

---

### 🎨 Area 2: Key Landing & Documentation Pages

*   [ ] **Design an immaculate Cover Page** that acts as the visual and metadata entry point, declaring the file as the single source of truth for the organization `[1, 20]`.
*   [ ] **Create a dedicated Component Overview/Inventory Page** that contains rendered visual swatches, listed components, styles, and visual specs in a unified layout `[1, 21]`. This allows MCP agents to run discovery and audit file structures cleanly `[1]`.

---

### 📝 Area 3: Figma Component Documentation Frame Structure

*   [ ] **Embed documentation frames directly inside Figma component pages** to ensure that guidelines are visible at the immediate point-of-use `[22-25]`. Every component page or frame must cover `[24-28]`:
    *   **Purpose**: A clear, one-sentence description of what the component does `[26, 27]`.
    *   **Anatomy Pinned specs**: Visual callouts mapping out parent-child relationships and nested layers `[24, 25, 28]`.
    *   **Properties Table**: A breakdown of editable props, variants, and expected types with default values `[24, 25, 29]`.
    *   **Negative Guidance (Do/Don't)**: Usage rules and visual anti-patterns (e.g., when not to use a button variant or when to avoid disabled states) `[24-27]`.
    *   **Accessibility (a11y) Requirements**: Explicit instructions for keyboard navigation, ARIA roles, minimum touch target sizes (≥44x44px), and color contrast ratios (≥4.5:1) `[26, 27, 30-32]`.
    *   **Storybook & Code references**: Links to the Storybook documentation to maintain parallel structural documentation across both design and code environments `[24, 25, 33, 34]`.

---

### 🧱 Area 4: Component Architecture

*   [ ] **Prefix private Base Components with a period `.` or underscore `_`** `[14, 15]`. These contain raw visual shells and structure (flex rules, spacing), keeping them hidden from consumer library panels while letting you build composed public components on top `[14, 15]`.
*   [ ] **Build all components using Auto Layout** to automatically communicate responsive spacing intent and protect layouts when localized text scales `[35-38]`.
*   [ ] **Adopt an atomic structure** by constructing primitive layers first (spacers, text blocks, icon containers) and nesting them into public composed component sets `[39-42]`.
*   [ ] **Distribute customization across the 5 component property types** to prevent variant counts from multiplying combinatorially `[43, 44]`:
    *   **Variant**: Use *only* for visibly distinct style axes (e.g., sizes, types like primary/secondary, and interactive states) `[14, 15, 45, 46]`.
    *   **Boolean**: Use to toggle layer visibility on and off (e.g., optional left/right icons, badges, dividers) `[45-48]`. Moving on/off axes to booleans is the single most effective way to halve a variant set size `[49, 50]`.
    *   **Instance Swap**: Use to swap nested elements (like icons) from a closed library of candidates `[45-48]`. Ensure stable instance-swap IDs are used to allow Code Connect and MCP tools to resolve nested definitions dynamically `[51-54]`.
    *   **Text**: Use to edit the copy inside text layers from the sidebar without forcing designers to double-click into layers `[45, 46, 55, 56]`.
    *   **Native Slots**: Use native slots to define open-ended body areas (e.g., inside cards, modals, or sheets) `[45, 46, 57, 58]`. This allows teams to add custom layers without detaching and avoids creating countless visual layout variants `[57, 58]`.
*   [ ] **Maintain identical layer naming across variants** `[59, 60]`. This ensures that custom text overrides are preserved when designers switch states or variant styles `[59, 60]`.
*   [ ] **Align naming exactly with production code props** `[14, 15]`. Casing and names must match your framework interfaces (e.g., PascalCase for files, camelCase or lowercase kebab-case for props) `[14, 15]`. A variant called `Type=Primary, Size=Medium, State=Default` in Figma must cleanly map to `<Button variant="primary" size="md" />` in code `[14, 15]`.

---

### 🎨 Area 5: Variable Collections & Modes

*   [ ] **Deploy a structured, three-tier token architecture** using Figma Variables to separate primitive variables from functional usage and components `[61-72]`:
    *   **Tier 1: Primitives**: Absolute raw numbers and colors (e.g., `color-blue-500: #0835fb`, `spacing-4: 16px`, `radius-sm: 4px`) `[62, 65]`. Never map these directly to UI layers `[62, 65]`.
    *   **Tier 2: Semantic**: Purpose-driven aliases referencing primitives to describe usage (e.g., `color-primary: color-blue-500`, `spacing-section: spacing-8`) `[62, 65]`. Map these to design layers by default `[63, 66]`.
    *   **Tier 3: Component (Optional)**: Specific aliases tied to a component's visual variables (e.g., `button-primary-bg: color-primary`) `[63, 66, 69, 73]`. Use this tier primarily if building at enterprise scale `[63, 66]`.
*   [ ] **Utilize Variable Modes for multi-theme, brand, or density options** `[74-77]`. Mirrors of semantic tokens should be mapped across modes (e.g., Light and Dark) so that swapping a frame's mode instantly transforms elements with correct contrast and visibility without breaking bindings `[76-79]`.
*   [ ] **Enforce strict Variable Hygiene**:
    *   **Explicit Scoping**: Turn off Figma's default `ALL_SCOPES` setting for color or spacing variables so they don't pollute unrelated property dropdowns `[80]`.
    *   **WEB Code Syntax**: Assign `codeSyntax.WEB` with correct CSS custom property names (e.g., `--color-brand-primary`) to every semantic variable `[80]`. Without this, MCP tools like `get_design_context` will return raw internal Figma names instead of standard CSS tokens, breaking the design-to-code pipeline `[80]`.

---

### 🚀 Area 6: Handoff, Annotations & Code Connect

*   [ ] **Mark locked frames as "Ready for Dev"** to isolate production-ready components in the Dev Mode focus view, ensuring agents do not crawl draft frames `[81, 82]`.
*   [ ] **Add specs as pinned Annotations directly onto Figma nodes** to communicate interactive layout behavior (alignment, responsive resizing, motion ease) that raw visuals cannot fully capture `[28, 37, 83]`.
*   [ ] **Implement Code Connect** to bind published library components directly to their codebase targets, preventing coding agents from writing boilerplate code when production components already exist `[84-87]`:
    *   **Code Connect UI**: Connect the Figma file to your GitHub repository visually `[88-91]`. Use manual mapping paths and add custom instructions as notes to guide AI model output in Dev Mode `[10, 11, 88, 90, 92, 93]`.
    *   **Code Connect CLI**: Write framework-agnostic template files (e.g., `Button.figma.ts` or `Button.figma.js`) to live alongside code components in your codebase `[88, 90, 94-97]`.
*   [ ] **Write robust Code Connect Template Files** following the strict programmatic layout specification `[98-103]`:
    *   Include the **metadata comment block** `// url=https://figma.com/design/...` targeting the component set `[99, 101, 104, 105]`.
    *   Use methods on `figma.selectedInstance` (e.g., `getBoolean()`, `getEnum()`, `getString()`) to map variant states and pass variables dynamically to the template output `[99, 101, 106, 107]`.
    *   Declare the codebase snippet using the `figma.code` tagged template literal `[98, 100, 102, 103]`.
    *   Map complex structures with `getSlot()` and recursive iteration (`slot.connectedInstances.map(instance => instance.executeTemplate())`) so nested children write out code-connected scripts inside standard templates `[108-115]`.

---

### ⚖️ Architectural Gaps and Disagreements in the Industry

1.  **Custom Library vs. Popular Open Source Libraries**
    *   **Custom / Shadcn/ui Kits**: Proponents of shadcn/ui and custom setups (such as the *shadcndesign* and *shadcncraft* authors) argue that copy-and-paste registries are ideal for Code Connect because you have total control over the file path mapping and variant configuration `[116-118]`.
    *   **Open-Source Heavyweights**: On the other hand, design system engineers on Reddit (e.g., user `JustAirConditioners`) strongly warn that building and publishing your own custom component library is the "biggest design system footgun" and creates immense maintenance friction `[119, 120]`. They advocate starting with fully managed open-source component libraries like Mantine `[121, 122]`.
2.  **Variable Collection Setup (Three-Tier vs. Combined)**
    *   **Split Collections**: The Muzli blog and general token standards recommend establishing three entirely separate, distinct collections in Figma: Primitives, Semantic, and Components `[63, 66]`.
    *   **Single-Level Mapping**: The official Figma Learn Guide ("Introduction to Design Systems: Update 1") presents a simpler real-world implementation where teams set up semantic and component-specific tokens on the *same level* (meaning groups within a single collection), noting that component-specific tokens can be omitted or combined with semantic layers to save setup and restructuring time `[70, 123-125]`.
3.  **Figma MCP: Desktop Server vs. Remote Hosted Server**
    *   **Remote Server Priority**: Official Figma documentation heavily prefers the remote hosted server (`mcp.figma.com`) because a vast amount of editing capabilities (such as the `/design-sync` command, `write-to-canvas`, and HTML-to-Figma conversions) require the remote infrastructure and are completely absent from the desktop server `[126-130]`.
    *   **Desktop Server Priority**: Software engineers iterating rapidly (e.g., user `Deep_Ad1959` on Reddit) argue that the remote server adds high latency on every tool call, ruining the interactive loop when coding in real-time `[131, 132]`. They recommend using the local desktop server (`127.0.0.1:3845`) for heavy reading and light writing to bypass latency completely `[131-133]`.
4.  **Is Figma Necessary? Figma vs. Spatial Web Engines**
    *   **Figma-to-Code Handoff**: Standard workflows assume Figma is the necessary design engine, with Code Connect acting as the ideal handoff contract `[134, 135]`.
    *   **Spatial Web Engines**: Prominent product designers on Reddit (e.g., user `Complete-Scratch-899`) argue that forcing AI models to translate spatial Figma visual concepts into rigid HTML/CSS boxes is a broken handoff. They advocate for prototype-free workflows using spatial engines where the native vector design on the canvas runs directly in the browser as the actual web application, entirely bypassing the code translation layer `[136-138]`.

💡 **Next Step**: Would you like me to draft a fully compliant Code Connect template file (e.g., `Button.figma.ts`) for your primary button set using this structural blueprint?


## Citation map

- 1: 46169426-5ac7-4d9f-a833-39d6b753038c
- 2: 6b317680-74ea-4f29-8e8d-1c4df8e7a40a
- 3: 20b20686-058f-4b28-8f59-6199849be53c
- 4: d42d8ba4-98fb-4cad-ad18-77cc02a63e90
- 5: 7d5e86ba-ce4d-438c-9a69-11cfb87bd894
- 6: 616768c5-b050-4787-919c-80ac1b65e3d0
- 7: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 8: d5b32c5b-a623-4058-9462-27dc4f69dfa4
- 9: 290f6523-4222-43fd-b05b-cadc5f489c86
- 10: 20b20686-058f-4b28-8f59-6199849be53c
- 11: 4a35b2bf-704e-4c5f-97e3-c3b98b96ab0d
- 12: 16accd14-bed4-4528-8b5b-d17bc801695a
- 13: da28bca7-bd52-4fb5-b737-50b9f4600c8e
- 14: aad15693-f896-43be-a715-e6cbd9da0d9a
- 15: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 16: 616768c5-b050-4787-919c-80ac1b65e3d0
- 17: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 18: a152df90-7d42-4fae-93ae-6e95c203e677
- 19: 9baa5f11-0f3d-4d13-8041-a1ce736e7faf
- 20: c3cab5fd-179d-45ed-8094-7141bf3729b7
- 21: 0d3c190c-2b36-4997-b93c-b2991e844f38
- 22: 616768c5-b050-4787-919c-80ac1b65e3d0
- 23: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 24: d5b32c5b-a623-4058-9462-27dc4f69dfa4
- 25: 290f6523-4222-43fd-b05b-cadc5f489c86
- 26: 16accd14-bed4-4528-8b5b-d17bc801695a
- 27: da28bca7-bd52-4fb5-b737-50b9f4600c8e
- 28: 0d3c190c-2b36-4997-b93c-b2991e844f38
- 29: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 30: 1e5bcfd9-6657-4ac7-872d-bedd639ab251
- 31: 0ec8a8c7-c5f0-4e6c-a3a8-adb8da4e15fd
- 32: 994e1ae2-a545-4512-881a-be7aac4e978b
- 33: d5952221-6631-4aea-a0b0-5a7a5b0472eb
- 34: 3acbf257-2cf2-4291-a09c-0d811df5fd08
- 35: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 36: 395b468b-921a-430f-9be9-32e83c320e1e
- 37: 0ec8a8c7-c5f0-4e6c-a3a8-adb8da4e15fd
- 38: a16ac033-a921-4367-b81a-6be78bd6e04f
- 39: 616768c5-b050-4787-919c-80ac1b65e3d0
- 40: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 41: d5b32c5b-a623-4058-9462-27dc4f69dfa4
- 42: 290f6523-4222-43fd-b05b-cadc5f489c86
- 43: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 44: 395b468b-921a-430f-9be9-32e83c320e1e
- 45: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 46: 395b468b-921a-430f-9be9-32e83c320e1e
- 47: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 48: 395b468b-921a-430f-9be9-32e83c320e1e
- 49: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 50: 395b468b-921a-430f-9be9-32e83c320e1e
- 51: d5952221-6631-4aea-a0b0-5a7a5b0472eb
- 52: 3acbf257-2cf2-4291-a09c-0d811df5fd08
- 53: 78bb646e-1723-46f5-9c64-27c09131dc81
- 54: b088ddb3-0eae-4901-b741-7138400fc08e
- 55: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 56: 395b468b-921a-430f-9be9-32e83c320e1e
- 57: 616768c5-b050-4787-919c-80ac1b65e3d0
- 58: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 59: 616768c5-b050-4787-919c-80ac1b65e3d0
- 60: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 61: aad15693-f896-43be-a715-e6cbd9da0d9a
- 62: aad15693-f896-43be-a715-e6cbd9da0d9a
- 63: aad15693-f896-43be-a715-e6cbd9da0d9a
- 64: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 65: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 66: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 67: 11f57b51-c733-4a17-9080-4322f3010bf2
- 68: 11f57b51-c733-4a17-9080-4322f3010bf2
- 69: 11f57b51-c733-4a17-9080-4322f3010bf2
- 70: 11f57b51-c733-4a17-9080-4322f3010bf2
- 71: 58d418c0-161b-43d0-bc11-4a01bc37836f
- 72: 58d418c0-161b-43d0-bc11-4a01bc37836f
- 73: 58d418c0-161b-43d0-bc11-4a01bc37836f
- 74: aad15693-f896-43be-a715-e6cbd9da0d9a
- 75: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 76: 11f57b51-c733-4a17-9080-4322f3010bf2
- 77: 58d418c0-161b-43d0-bc11-4a01bc37836f
- 78: aad15693-f896-43be-a715-e6cbd9da0d9a
- 79: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 80: 46169426-5ac7-4d9f-a833-39d6b753038c
- 81: 2e4b4145-cf41-4a41-b969-b9b765e19c7c
- 82: a88f0ece-4597-47e8-9b4a-67f8b2e3dcea
- 83: a16ac033-a921-4367-b81a-6be78bd6e04f
- 84: 20b20686-058f-4b28-8f59-6199849be53c
- 85: 4a35b2bf-704e-4c5f-97e3-c3b98b96ab0d
- 86: 616768c5-b050-4787-919c-80ac1b65e3d0
- 87: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 88: 20b20686-058f-4b28-8f59-6199849be53c
- 89: 20b20686-058f-4b28-8f59-6199849be53c
- 90: 4a35b2bf-704e-4c5f-97e3-c3b98b96ab0d
- 91: 4a35b2bf-704e-4c5f-97e3-c3b98b96ab0d
- 92: 123ac2c8-6980-43a5-b066-f21cd9055c43
- 93: 9c5b5d56-b72b-4759-a77e-959a5299663d
- 94: 8999d90a-a618-4009-85d4-b413057bd1f6
- 95: e7448890-a9ff-4c44-887c-6b12b92a731b
- 96: 712bc45d-bf35-4547-8418-d8cbf92244ee
- 97: a7488b8a-d292-4a97-a83a-3ef090be5e0a
- 98: 8999d90a-a618-4009-85d4-b413057bd1f6
- 99: 8999d90a-a618-4009-85d4-b413057bd1f6
- 100: e7448890-a9ff-4c44-887c-6b12b92a731b
- 101: e7448890-a9ff-4c44-887c-6b12b92a731b
- 102: 712bc45d-bf35-4547-8418-d8cbf92244ee
- 103: a7488b8a-d292-4a97-a83a-3ef090be5e0a
- 104: 712bc45d-bf35-4547-8418-d8cbf92244ee
- 105: a7488b8a-d292-4a97-a83a-3ef090be5e0a
- 106: 712bc45d-bf35-4547-8418-d8cbf92244ee
- 107: a7488b8a-d292-4a97-a83a-3ef090be5e0a
- 108: 712bc45d-bf35-4547-8418-d8cbf92244ee
- 109: 712bc45d-bf35-4547-8418-d8cbf92244ee
- 110: 712bc45d-bf35-4547-8418-d8cbf92244ee
- 111: 712bc45d-bf35-4547-8418-d8cbf92244ee
- 112: a7488b8a-d292-4a97-a83a-3ef090be5e0a
- 113: a7488b8a-d292-4a97-a83a-3ef090be5e0a
- 114: a7488b8a-d292-4a97-a83a-3ef090be5e0a
- 115: a7488b8a-d292-4a97-a83a-3ef090be5e0a
- 116: 123ac2c8-6980-43a5-b066-f21cd9055c43
- 117: 123ac2c8-6980-43a5-b066-f21cd9055c43
- 118: 6f63c6ff-1478-4e6b-9bee-c584aa85347c
- 119: d42d8ba4-98fb-4cad-ad18-77cc02a63e90
- 120: 7d5e86ba-ce4d-438c-9a69-11cfb87bd894
- 121: d42d8ba4-98fb-4cad-ad18-77cc02a63e90
- 122: 7d5e86ba-ce4d-438c-9a69-11cfb87bd894
- 123: 11f57b51-c733-4a17-9080-4322f3010bf2
- 124: 58d418c0-161b-43d0-bc11-4a01bc37836f
- 125: 58d418c0-161b-43d0-bc11-4a01bc37836f
- 126: 6b317680-74ea-4f29-8e8d-1c4df8e7a40a
- 127: 6b317680-74ea-4f29-8e8d-1c4df8e7a40a
- 128: b827dbae-b482-42a4-bdf4-49f83921f6df
- 129: a16ac033-a921-4367-b81a-6be78bd6e04f
- 130: 0f35ca9e-3642-4ada-a5c8-01ee5256e016
- 131: b622a222-7387-4ae2-98ac-89e982523b5e
- 132: b622a222-7387-4ae2-98ac-89e982523b5e
- 133: 0ec8a8c7-c5f0-4e6c-a3a8-adb8da4e15fd
- 134: 3659ceb6-3dfb-4223-a2bc-c4bf5771928c
- 135: d4a024fb-2ee0-413d-808a-9a0084544c17
- 136: b622a222-7387-4ae2-98ac-89e982523b5e
- 137: b622a222-7387-4ae2-98ac-89e982523b5e
- 138: b622a222-7387-4ae2-98ac-89e982523b5e
