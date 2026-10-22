# Design-system knowledge for AI agents: best-practice catalog

What the Atelier lab (ADR-0177) has measured about packaging design-system knowledge for coding
agents through an MCP server. Each entry is written so it can be carried into another design
system (first target: the Conciso Design System, CDS), and each one names its evidence. Nothing
enters this catalog on plausibility alone.

**How to read an entry.** _Practice_ is the transferable rule. _Evidence_ names the run, the
questions it was proven on, and the effect. _Cost_ is what it adds (tokens, snapshot size,
maintenance). _Transfer_ is its status for the CDS. A practice proven on four questions is a
strong hint, not a law, so every entry keeps its question count.

**Method in one paragraph.** `tools/mcp-eval/` asks consumer questions through `claude -p`
(Sonnet), with the agent isolated from repo and user settings, once per server variant and three
times per variant. Answers are scored by deterministic checks derived from the built manifest and
the layer sources (no LLM judge): invented inputs, elements and imports, the expected component,
forbidden components or nestings, and claim keywords. The server is `@atelier-ui/mcp`, whose
knowledge layers switch on and off one by one (`ATELIER_MCP_LAYERS`), so a layer's effect is the
score difference between L0 and L0 plus that layer. Reports are gitignored; the numbers below are
copied from them and from `tasks/todo.md`.

## Catalog

### 1. Any MCP server with the component docs beats none, by a lot

- **Practice.** Give the agent the component API from the docs build, not from its training data.
- **Evidence.** 2026-10-21, 13 questions × 3: without a server 48 % (47–49), manifest-only server
  96 % (95–97). Without a server the model says it does not know the library and then invents
  `<atelier-button>`, `AtelierPaginationModule`, `variant="ghost"`.
- **Cost.** Input tokens per answer 1.4 k → 25.9 k.
- **Transfer.** CDS has it (CDS-ADR-0012).

### 2. Ship the knowledge as a versioned package, not a hosted endpoint

- **Practice.** Snapshot the docs into an npm package built from the same commit as the library,
  served over stdio, with a version-mismatch warning. A hosted endpoint answers with `main`,
  which is wrong for every consumer not on the latest release.
- **Evidence.** The local package scores the same as the hosted endpoint: 94 % (92–95) against
  96 % (95–97), within run-to-run noise, same failure types. Hosted endpoints also hit throughput
  limits (owner report). The argument is version exactness; the eval only shows that the switch
  costs nothing.
- **Cost.** Snapshot 608 KB for the manifest layer; a release step.
- **Transfer.** CDS has it (CDS-ADR-0012).

### 3. Gate agent-facing knowledge against the implementation

- **Practice.** Every prose fact an agent reads (purpose, usage rules, pattern notes) must be
  checked against the component source, or it will spread errors with the authority of official
  docs. Names that the source also states (roles, `aria-*`, elements, input names, component
  names) are mechanically checkable per framework; behaviour and intent need a test per claim.
- **Evidence.** Writing the layer questions surfaced four contradictions (R-230), one of them the
  first line of every `docs-show` for the select since ADR-0176 ("built on the native
  `<select>`" while Angular renders a CDK combobox). A sweep found nine more suspects (R-231).
- **Cost.** A gate per checkable claim kind; a `play` per behaviour claim.
- **Transfer.** Open. Atelier has no such gate yet either (R-231).

### 4. Put usage guidance on the component page, where the agent already looks

- **Practice.** "When to use / when not to use / use instead / related" belongs inside the
  component's docs response, not in a separate tool. The agent opens the component page before
  writing code; a separate guidance tool is only called when the agent already suspects a
  mistake, which is exactly when it does not need it.
- **Evidence.** 2026-10-21 ablation, 4 questions × 3 (chip-filter, category-tree, site-nav,
  product-thumbnail): manifest-only 50 % → with the purpose layer 96 % (88–100). Without it the
  model builds a chip from a badge, a site navigation from a menu, a product photo from an avatar.
- **Cost.** +32 KB snapshot; fewer input tokens per answer (27.6 k → 24.6 k across the set).
- **Transfer.** Not checked whether CDS component pages carry usage rules; CDS has separate usage
  pages (e.g. `buttons-verwendung.mdx`).

### 5. A "use instead" must point at something that exists

- **Practice.** Guidance that rules a component out must name an existing component or a
  concrete recipe. A pointer to a component the system does not have makes the agent improvise.
- **Evidence.** chip-filter: the badge's guidance says "use a dedicated chip/tag component" —
  there is none. The model reads the guidance, quotes it, and still wraps a button in a badge
  (0/3 with purpose and tokens on).
- **Cost.** Editorial; checkable by a gate (component names in `useInstead` must resolve).
- **Transfer.** Open.

### 6. Tokens need their own search tool with intent, not just names

- **Practice.** Expose tokens through a search tool that returns value, intent and constraints;
  put the consumer lint rules in the server instructions. Tokens belong to no component page,
  and a few hundred tokens do not fit in instructions.
- **Evidence.** 2026-10-21 ablation, 5 questions × 3 (focus ring, disabled opacity, control
  height, motion, raw-colour lint): manifest-only 71 % (67–73) → with the tokens layer 100 %
  (100–100). Without it the model writes "not documented" or invents `--ui-color-danger-light`.
  Tool calls on the focus-ring question 6.3 → 1.3.
- **Cost.** +40 KB snapshot; the search has no synonyms ("motion" finds nothing, "transition"
  does).
- **Transfer.** Open. The CDS server has the three docs tools only.

### 7. Knowledge layers add up and make answers cheaper

- **Practice.** Add layers independently; measure each against the manifest-only baseline on
  questions written for it, and keep the other layers' questions as a control.
- **Evidence.** Overall on the layer set: L0 53 % → purpose 64 % → tokens 64 % → both 72 %
  (72–72). Neither layer moved the other's questions, nor the composition/contract questions.
  Input tokens per answer fell from 27.6 k to 23.8 k with both layers, tool calls from 4.3 to 3.6.
- **Corrected 2026-10-22.** "Cheaper" holds for usage guidance and tokens, not for every layer:
  the composition layer raised tool calls on its own questions (5.3 → 7–8) and input tokens across
  the set (26.0 k → 27.6 k); all four layers together cost 28.0 k against 26.0 k for the manifest
  alone. All four layers together: 54 % (53–56) → 85 % (78–89), with a wider run-to-run spread
  than any single layer.
- **Transfer.** Method only.

### 8. Test the server as the packed artefact, not only with fixtures

- **Practice.** Smoke-test the packed tarball in a clean directory over stdio.
- **Evidence.** The purpose layer first enriched only the docgen shards. Unit tests passed
  because their fixture assumed the shard wins; `@storybook/mcp` actually lets the manifest entry's
  description win. Only the tarball smoke test caught it.
- **Transfer.** CDS has a tarball smoke test (CDS-ADR-0012).

### 9. Measure the agent, isolated, with deterministic checks

- **Practice.** Run the eval with and without the server, repeated, in an empty directory with the
  agent's own settings, hooks, memory and project instructions switched off, and score with
  checks derived from the build output, never a hand list and never an LLM judge. Re-score saved
  answers when a check is fixed instead of re-running.
- **Evidence.** A headless run without isolation saw 109 tools, the user's global instructions and
  a style hook. Two checker bugs found by reading answers moved the baseline from 54 % to 48 %
  (invented elements outside the library prefix passed) and one question from 0 % to 100 %
  (claim too literal). A question set the manifest already answers at 96 % cannot show any
  layer's effect; the second set was written so that each fact is present in its layer source
  and verified absent from the manifest.
- **Transfer.** CDS has a with/without eval; isolation flags, per-layer ablation and the
  absent-from-L0 rule are new.

### 10. Composition rules go on the page of every component they constrain

- **Practice.** Patterns span several components, so attach each pattern's "not for" cases and
  common mistakes to the docs page of each component in it. Components used by many patterns get
  an index line instead of the full text, or their pages drown in other components' warnings.
- **Evidence.** 2026-10-22 ablation, 3 questions × 3 (type-to-confirm, severity-grouped
  notifications, settings sub-tabs): manifest-only 56 % → with the composition layer 100 %
  (100–100). Without it the model puts type-to-confirm in a dialog and nests accordion groups and
  tab groups. Writing the layer surfaced three more defective pattern texts: a pointer to a
  component that does not exist (`AtlTabs`), a variation contradicting its own pattern, and a
  false `aria-describedby` claim (entries 3 and 5 again).
- **Cost.** +7 KB snapshot; 1–2 KB more per affected page; more tool calls (entry 7). Warnings
  attach by pattern membership, so a page can carry warnings about its neighbours.
- **Transfer.** Open.

## Open

- chip-filter still fails with every layer on: the badge's "use instead" points at a chip
  component that does not exist (entry 5). Needs an owner decision: a chip component, or a
  documented recipe the guidance can point at.
- Contract mismatches (2 questions: 0 % with any single layer, 33 % with all four — helped by
  other layers, not by a contract layer), component-specific a11y (1 question), instructions as their own layer.
- One model, one question set per layer. Before transfer, repeat the strongest entries (4, 6, 10)
  on a second model.
- The CDS transfer itself: each entry's change in the CDS needs the owner's go (ADR-0177 §2).
