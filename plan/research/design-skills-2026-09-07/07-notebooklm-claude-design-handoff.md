<!-- NotebookLM synthesis answer, notebook f153635d-2589-4922-8fcc-6c171482d1fe, 2026-09-07. Numbers in brackets are NotebookLM citation ids; the map from id to source excerpt follows the answer. Second reader over the web sources in 03–06, not a primary source. -->

### 1. Handoff Paths between Claude Design and Claude Code as of 2026

The Model Context Protocol (MCP) and dedicated terminal integrations govern the workflow between Claude Design (`claude.ai/design`) and Claude Code [1, 2]:

#### **`design-sync`**
* **Sync Directions:** This command connects the Claude Code terminal to the Claude Design canvas in **both directions**—from the repository to the canvas, and from the canvas to the repository [1, 3]. 
* **Uploads & Downloads:** 
  * *Code to Canvas (Upload):* It reads the local library inside Claude Code and uploads the project's **actual design system (components, color tokens, typography, and spacing)** to Claude Design [4, 5]. First-time sync verifies every component and can take hours on large repositories [6] **[Only one source]**. 
  * *Canvas to Code (Download):* Once a designer polishes the visual layout on the canvas, `/design-sync` pulls it back into the codebase [1]. Claude Code builds against these real design-system components instead of creating generic approximations [4, 7].
  * *Safety & Mechanics:* The sync is **incremental and updates one component at a time** to reduce errors [4, 8] **[Only one source]**. Before any files are written, Claude Code generates a sync plan (`planId`) listing which files will be added or deleted, requiring manual developer approval [5, 9]. Files are uploaded in batches of up to 256, and individual files have a read limit of 256 KiB [8] **[Only one source]**. Synced files are treated strictly as data (not executable instructions) to mitigate prompt-injection risks [10] **[Only one source]**.
* **React-Only?**
  * One technical best-practice source states that `/design-sync` is specifically used to "Convert your repo's React design system and upload it to Claude Design" [6] **[Only one source]**. However, the underlying Figma MCP server itself returns framework-agnostic data, and developers can customize code generation prompts for other stacks like Vue, Svelte, or iOS [11, 12].

#### **The "Handoff Bundle"**
* When a visual design is completed in Claude Design, it packages the design's structural layout, assets, states, and rules into a **handoff bundle** [13, 14].
* The designer can pass this bundle to Claude Code with a single instruction [13]. The AI agent picks up exactly where the designer left off without needing screenshots or manual reconstruction, keeping components and spacing aligned with the design system [13].

#### **The `/design` Command**
* This Claude Code terminal command allows developers to **create, edit, and sync entire design projects directly from the command line** without opening a browser [9, 15, 16]. It operates as a prompt-based bundled skill that generates visual artboards on a canvas and publishes them as live, shareable artifacts [17].

#### **The Claude Design MCP Server**
* Exposes design files, components, and design tokens as structured data [2, 18].
* It is configured locally by pointing the Claude Code MCP settings to `https://api.anthropic.com/v1/design/mcp` and authenticating securely via `/design-login` in the browser [19]. 

---

### 2. The New Stack Overhaul Report: Fixed vs. Broken

The June 2026 report by *The New Stack* evaluated the major research preview upgrade of Claude Design [20]:

#### **What Was Reported as Fixed/Improved:**
* **Bidirectional Integration:** Tighter Design-to-Code and Code-to-Canvas workflows via terminal commands (`/design-sync` and `/design`), keeping visual and code assets in parallel alignment [15, 20, 21].
* **Brand Guidelines Consistency:** Claude Design now automatically inherits and validates visual outputs against imported design systems, correcting spacing, colors, and typography before showing results to prevent brand drift [22, 23].
* **Token Efficiency & Billing:** Anthropic restructured the product to address token inefficiencies that frustrated early users [24]. It **eliminated separate usage limits**, putting Claude Design, Claude Code, chat, and Cowork into a single shared subscription pool [25, 26].
* **New Canvas Editor:** Introduced fine-tuning controls that allow users to drag, resize, and align visual elements directly on the canvas [24, 27, 28].
* **Connector Ecosystem:** Added specialized connectors to sync designs with external tools like Adobe, Canva, Lovable, Miro, Replit, Vercel, and Wix [24, 29].

#### **What Was Reported as Still Broken/Unresolved:**
* **Persistent Departmental Silos:** AI product design leads noted that despite the sync commands, the overhauled tool **had not yet meaningfully reduced the visual back-and-forth** between designers and developers [24, 26].
* **High Token Costs and Latency:** Token usage remains expensive, and the canvas consumes them at an extremely fast rate [24, 30]. Designers highlighted that having Claude make every minor design detail change often **takes longer than just editing the component or pixel yourself** [21, 24].
* **The Full-Automation Fallacy:** Letting Claude build a codebase from start to finish is still unviable; human taste, direction, and design judgment remain necessary to avoid generic "AI slop" [31-33].

---

### 3. What Practitioners Say Fails: Artboard to Real Component Library

Practitioners and design system engineers report several persistent hurdles when translating a Claude Design artboard into a production codebase:

#### **Tokens & Variables Gaps**
* **Figma ALL_SCOPES Pollution:** Figma variable collections default to "all scopes," which clutters the property pickers inside code execution contexts unless variables are manually and strictly scoped [34] **[Only one source]**.
* **Missing Code Syntax Bindings:** If `codeSyntax.WEB` is not explicitly defined on Figma variables, extraction tools (like `get_design_context`) return raw variable hex values or names rather than the actual CSS/Tailwind tokens used in code, breaking the code handoff [34] **[Only one source]**.
* **Messy Source Files:** Design files built without strict auto layout or proper variable scales cause the AI to generate "made-up colors, wrong spacing, or duplicate components" [35, 36].

#### **Semantics & Logic Limitations**
* **Spatial-to-Rigid Box Translation:** Translating beautiful, spatial layouts into rigid HTML/CSS grid and flex boxes often forces developers to "jump through massive hoops" with local MCP setups and API limits [37, 38].
* **Lack of Application Logic:** The handoff only covers the visual layer; application logic, state management, API data fetching, and routing patterns are not mapped and require manual software engineering [39, 40].
* **Poor Accessibility Compliancy:** Generated components often fail Level A or AA WCAG standards (keyboard navigation, focus indicators, labeled inputs, and screen reader-friendly ARIA roles), requiring substantial manual accessibility QA [40, 41].

#### **Fidelity & Structure Gaps**
* **No Surgical Code Updates:** Claude Code excels at generating components from scratch, but it struggles with surgical code edits on an existing component when a design file undergoes minor revisions, often forcing full code regeneration [42].
* **Animation Loss:** Prototyping data (easing curves, smart animate curves, overlay physics) is not fully exposed through MCP, leaving the AI to guess micro-interaction parameters [43].
* **Deep Nesting Conflicts:** Components with more than 3 levels of nested overrides (e.g., cards containing headers containing badges containing icons) confuse context extraction, leading to the selection of incorrect variant combinations [43, 44].
* **Bloated Context Windows:** Large, complex frames containing multi-page flows consume too many tokens and can crash the local MCP connector, requiring developers to manually break designs down into atomic sections [45, 46].

---

### 4. Figma's "Create Skills for the Figma MCP Server" Guidelines

Figma’s official developer guide advises structuring repeatable workflows into `SKILL.md` manifests using the following technical blueprint [47]:

1. **Kebab-Case Naming:** Name the skill with a stable, lowercase, hyphenated identifier matching the folder name exactly (e.g., `figma-apply-palette`) [47].
2. **Actionable Description:** Write a precise, high-level description specifying exactly *when* the agent should invoke the skill (acting like a routing rule) [47, 48].
3. **Single `#` Heading:** Begin the markdown body with a single, clear title matching the folder name [47].
4. **"When to Use" Section:** Include a bulleted `## When to use` list detailing the situations the playbook addresses [47].
5. **Ordered, Imperative Instructions:** Write the core workflow under `## Instructions` using numbered steps and imperative verbs (e.g., "1. Run `get_design_context` first", "2. Bind fills to variables") [47].
6. **Concrete Examples:** Include a `## Examples` section mapping a representative user query to the expected output summary [47].
7. **Edge Cases and Fallbacks:** Provide a `## Common edge cases` section instructing the AI on what to do when ideal steps fail (such as handling missing variables or heavy frames) [47].
8. **Minimal Frontmatter:** Use custom fields like `compatibility` or `metadata` only when strictly necessary to declare server configurations or ownership [47].
9. **Safety and Scoping:** Figma recommends implementing `disable-model-invocation: true` for high-risk actions to prevent autonomous AI side effects [48].

---

### 5. Anthropic's "Complete Guide to Building Skills for Claude" Guidelines

Anthropic's platform specifications focus on context economics, discovery reliability, and script validation [49, 50]:

* **Context Economics (Under 500 Lines):** Keep the core `SKILL.md` body under **500 lines** [51, 52]. Move complex code structures, checklists, or long API tables into co-located markdown files in `references/`, `scripts/`, or `assets/` folders, using relative links [51, 53, 54].
* **Three-Level Progressive Disclosure:** 
  1. *Level 1:* YAML frontmatter (name & description) is always loaded into the system prompt to facilitate auto-discovery [53].
  2. *Level 2:* The core `SKILL.md` body loads only when the skill is contextually triggered [53].
  3. *Level 3:* Supporting files (linked from the body) load only when Claude explicitly accesses them [53].
* **Third-Person Descriptions:** Descriptions must always be written in the **third person** (e.g., "Analyzes Figma design files", not "I can analyze...") to avoid POV-related discovery failures when injected into system prompts [55].
* **Gerund Skill Names:** Name skills using the **gerund form** (verb + "-ing", e.g., `processing-pdfs`, `analyzing-spreadsheets`) to clearly describe the capability [55] **[Only one source]**.
* **Shallow File Reference Depth:** Keep referenced files strictly **one level deep from `SKILL.md`** [56]. Deeply nested links cause Claude to only preview files (using commands like `head -100`) rather than reading them completely [56].
* **Validation Loops:** Incorporate "plan-validate-execute" patterns and clear validation loops ("Run validator -> fix errors -> repeat") so Claude can systematically correct its own errors [57, 58].
* **Evaluation-Driven Design:** Build concrete evaluations and test queries **before** documenting the skill's instructions to ensure you are solving real baseline failures [59].
* **Solve, Don't Defer:** Executable scripts co-located in the `scripts/` folder should handle errors natively and log verbose warnings rather than crashing or punting errors back to Claude [60, 61].
* **Platform Portability:** Avoid Windows-style backslashes in paths; always use Unix-style forward slashes (e.g., `scripts/helper.py`) to prevent cross-platform execution failures [62].

---

### 💡 What you might want to do next
Would you like to build an automated **interactive validation skill** using Claude Code to audit your Figma files for `ALL_SCOPES` variables or missing `codeSyntax.WEB` tokens before you trigger your next design-to-code handoff?


## Citation map

- 1: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 2: d4a024fb-2ee0-413d-808a-9a0084544c17
- 3: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 4: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 5: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 6: c0588c41-5a8a-4357-81ee-0c84b748913a
- 7: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 8: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 9: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 10: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 11: 0ec8a8c7-c5f0-4e6c-a3a8-adb8da4e15fd
- 12: d4a024fb-2ee0-413d-808a-9a0084544c17
- 13: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 14: b9c3e9d3-3e4e-4e38-8ad3-f0f3930f9e1d
- 15: ce0a08eb-dca1-4a5d-8967-427cc931f759
- 16: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 17: c0588c41-5a8a-4357-81ee-0c84b748913a
- 18: 6baa2ea0-7651-42db-af25-a420306861ac
- 19: f30854ee-af9b-4943-9df3-ea16899f477e
- 20: ce0a08eb-dca1-4a5d-8967-427cc931f759
- 21: ce0a08eb-dca1-4a5d-8967-427cc931f759
- 22: ce0a08eb-dca1-4a5d-8967-427cc931f759
- 23: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 24: ce0a08eb-dca1-4a5d-8967-427cc931f759
- 25: ce0a08eb-dca1-4a5d-8967-427cc931f759
- 26: ce0a08eb-dca1-4a5d-8967-427cc931f759
- 27: ce0a08eb-dca1-4a5d-8967-427cc931f759
- 28: 8b6d7a15-0a19-48c5-9a26-b5c17658d27c
- 29: 84982c69-9ec9-4be0-a1f5-c8ba65890ac8
- 30: 97088497-34da-4042-a2c7-eba85d91c8e1
- 31: ce0a08eb-dca1-4a5d-8967-427cc931f759
- 32: b622a222-7387-4ae2-98ac-89e982523b5e
- 33: 97088497-34da-4042-a2c7-eba85d91c8e1
- 34: 46169426-5ac7-4d9f-a833-39d6b753038c
- 35: 843d3a62-1012-4426-89ae-ef663826bd62
- 36: dd926e5c-c5f8-4113-8d52-17a384bd716e
- 37: b622a222-7387-4ae2-98ac-89e982523b5e
- 38: b622a222-7387-4ae2-98ac-89e982523b5e
- 39: 6baa2ea0-7651-42db-af25-a420306861ac
- 40: d4a024fb-2ee0-413d-808a-9a0084544c17
- 41: b827dbae-b482-42a4-bdf4-49f83921f6df
- 42: 6baa2ea0-7651-42db-af25-a420306861ac
- 43: d4a024fb-2ee0-413d-808a-9a0084544c17
- 44: d4a024fb-2ee0-413d-808a-9a0084544c17
- 45: b827dbae-b482-42a4-bdf4-49f83921f6df
- 46: 0ec8a8c7-c5f0-4e6c-a3a8-adb8da4e15fd
- 47: 2385e880-4c25-4f3e-ba46-85c96d411fcc
- 48: 2385e880-4c25-4f3e-ba46-85c96d411fcc
- 49: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 50: 319a3408-3a29-4460-b3d6-754af38b7435
- 51: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 52: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 53: 319a3408-3a29-4460-b3d6-754af38b7435
- 54: 319a3408-3a29-4460-b3d6-754af38b7435
- 55: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 56: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 57: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 58: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 59: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 60: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 61: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
- 62: 9cb8b513-7f32-4afd-bc4b-40ab5e7eb46a
