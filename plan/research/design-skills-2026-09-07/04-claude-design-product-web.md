# Claude Design (claude.ai/design) — research brief, as of 2026-09-07

Method: WebSearch + WebFetch only. Primary sources fetched in full where possible; WebSearch result
summaries that were **not** followed by a full WebFetch are tagged `[unverified / secondary]` even when
the search snippet itself claims to quote a primary page, because I did not see the raw page. One
additional non-web fact is called out separately in §4: this session has a live, connected MCP server
literally named `claude-design` (see the tool list in the system reminder), which lets me cross-check web
claims against a real tool schema without violating the "web only" research method (I did not invoke it).

## 1. What it is

Claude Design is an **Anthropic Labs** product, launched **April 17, 2026**, that lets a user
collaborate with Claude in a chat-plus-canvas interface to produce "polished visual work like designs,
prototypes, slides, one-pagers, and more" — it is prompt-to-design rather than a drawing tool
[verified: anthropic.com news post says this, fetched](https://www.anthropic.com/news/claude-design-anthropic-labs).
The UI is literally "a chat interface on the left and a canvas on the right"
[verified: support.claude.com get-started article, fetched](https://support.claude.com/en/articles/14604416-get-started-with-claude-design).
It is powered by **Claude Opus 4.7**, described by Anthropic as its most capable vision model
[verified: anthropic.com](https://www.anthropic.com/news/claude-design-anthropic-labs).

**Refinement / turns**: iteration happens through three channels — ordinary chat ("make the color scheme
darker"), inline comments on specific canvas elements ("make this button padding larger"), and direct
canvas editing (drag/resize/align, plus sliders for spacing/color/layout)
[verified: support.claude.com](https://support.claude.com/en/articles/14604416-get-started-with-claude-design).
Comments exist as a first-class object — this session's connected MCP schema exposes `list_comments` and
`ack_comments` as distinct tools (direct observation, see §4), consistent with the practitioner report that
projects can be shared "via generated link with async commenting enabled" so teammates can tag people and
react on canvas elements, though that same source calls comment-thread tracking "rough"
[unverified / secondary, designproject.io, fetched](https://designproject.io/blog/claude-design-workflow/).

**Sharing / roles**: projects support **view-only, comment, and edit** access, scoped to an organization,
plus an Enterprise-only **"Claude Design Admin"** custom role that can publish a design system
org-wide, set the org default, and delete design systems — without it, all members keep default access
[verified: support.claude.com admin guide, fetched](https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans).
This session's MCP schema separately exposes `add_member`, `remove_member`, `update_member_role`, and
`update_sharing` (direct observation, §4), which maps cleanly onto an owner/editor/viewer-style model even
though no fetched page spells out those exact three role names.

**Plans / gating**: available on **Pro, Max, Team, and Enterprise**, with **no Free-tier access**, as a
research preview / beta, sharing usage limits with chat/Claude Code rather than a separate allowance
[verified: multiple pages agree — anthropic.com, support.claude.com, claude.com/product/design, all fetched].
On **Enterprise it is default-off** and must be turned on by an admin under _Organization settings →
Capabilities → Anthropic Labs_; Team admins likewise must explicitly enable it
[verified: support.claude.com admin guide, fetched](https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans).
Data handling: Claude Design stores a design-system _representation_, not raw source files; local code is
not uploaded wholesale, and no training occurs on user data; Enterprise data-residency is **not**
supported yet [unverified / secondary — this line came from a WebFetch summary of the VentureBeat article, not independently cross-checked against an Anthropic privacy page](https://venturebeat.com/technology/anthropic-just-launched-claude-design-an-ai-tool-that-turns-prompts-into-prototypes-and-challenges-figma).

## 2. Inputs

The **Import** surface accepts, per the official get-started and design-system articles (both fetched):

- **Codebases**: "If your design system lives in code (for example, a React component library), you can
  link or upload the repository. Claude will read the components and styles"
  [verified: support.claude.com](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design).
- **Figma**: design files can be linked as a source during onboarding; every fetched primary page treats
  Figma strictly as an **input**, never as an export target (see §3).
- **Screenshots / web captures**: reference materials, competitor designs, wireframes, and a "web tool"
  that captures elements directly from live sites [verified: anthropic.com, claude.com/product].
- **Documents**: DOCX/PPTX/XLSX uploads, including "a well-designed PowerPoint or PDF that reflects your
  brand" from which Claude extracts colors, layout patterns, and typography
  [verified: support.claude.com](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design).
- **GitHub repositories** specifically (as distinct from generic codebase upload) are listed on the
  product page as an import method [verified: claude.com/product/design, fetched](https://claude.com/product/design).

**The "design system" object**: created during onboarding by analysis of whatever was imported; Claude
"analyzes them and extract[s] a reusable design system" holding a color palette, typography, components
(buttons/cards/nav), and layout/spacing patterns. New projects "automatically inherit your organization's
design system." It is updated by opening it and choosing **"Remix"**, which reopens a chat to revise it
[verified: support.claude.com, fetched](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design).
Claude Code has a matching pull side: `/design-sync` imports the design system into a Claude Code session
so "everything you build in Claude Design starts from your existing components," and Claude "checks its
own output against your design system, and makes corrections before you see them"
[verified: found via WebSearch AI-summary of a support.claude.com/Claude Code help-center query, not independently refetched as a standalone page — treat the exact wording as secondary even though the source is anthropic-owned](https://support.claude.com/en/collections/14445694-claude-code).

**Design skill / SKILL.md inside a project**: my direct, non-web observation is that the connected
`claude-design` MCP exposes a tool called `read_design_skill` (see §4), which strongly implies a Claude
Design project carries a portable skill-like artifact analogous to a `SKILL.md` — but no fetched Anthropic
page names this object or documents its schema, so its exact shape is **not verified from the web**.
Web search separately surfaces an _ecosystem_ of unrelated, community-authored "Claude Design skills"
(reusable `SKILL.md`/`DESIGN.md` prompt packs for Claude in general, e.g. a GitHub project literally named
`claude-design-skill`) — these are **not** part of the claude.ai/design product and should not be
conflated with it [unverified / secondary, search-snippet only](https://github.com/jiji262/claude-design-skill).

## 3. Outputs

Fetched pages disagree somewhat on the _breadth_ of the export list, which is worth flagging rather than
flattening:

- The launch blog post lists: internal (org-scoped) URL, **Canva** integration, PDF, PPTX, standalone
  HTML, folder exports [verified: anthropic.com, fetched](https://www.anthropic.com/news/claude-design-anthropic-labs).
- The get-started help article and the product page both list a longer roster: ZIP download, PDF, PPTX,
  standalone HTML, and connected apps **Adobe, Base44, Canva, Gamma, Lovable, Miro, Replit, Vercel, Wix**
  [verified: support.claude.com, fetched](https://support.claude.com/en/articles/14604416-get-started-with-claude-design)
  [verified: claude.com/product/design, fetched](https://claude.com/product/design).

Read together, the safest statement is: HTML/PDF/PPTX/ZIP export plus Canva are confirmed everywhere;
the wider partner-app list (Adobe, Base44, Gamma, Lovable, Miro, Replit, Vercel, Wix) is confirmed on two
of three fetched pages but may reflect a later rollout than the original announcement.

**Figma export**: **not** listed as an output/connected-app on _any_ fetched primary page — Figma appears
only under inputs. A WebSearch AI-summary (not a fetched page) states flatly "Claude Design cannot export
to Figma. Exports are limited to Canva, PDF, PPTX, HTML, and internal URL," and describes the only
official bridge as one-directional: a **read-only Figma plugin reachable through Claude Code** that pulls
variables/components/frames/styles out of Figma, after which Claude Design's codebase-reading onboarding
picks up those tokens — a one-time migration, not a live sync
[unverified / secondary — WebSearch summary, source pages not individually fetched](https://findskill.ai/blog/claude-design-figma-import-tokens/).
I could **not verify** this claim against a fetched Anthropic page; treat "no Figma export exists" as
plausible-but-unconfirmed, and "Figma is not among the documented export destinations" as the
confirmed, narrower claim.

**Claude Code handoff**: this is the best-documented output path. Anthropic's own phrasing: designs
package into a **"handoff bundle"** for a seamless jump to Claude Code
[verified: anthropic.com, fetched](https://www.anthropic.com/news/claude-design-anthropic-labs), and the
product page names the mechanism as moving "between Claude Design and Claude Code" via `/design-sync` or
`/design` [verified: claude.com/product/design, fetched](https://claude.com/product/design). Secondary
coverage adds that the bundle carries "components, tokens, assets, markup" and that Claude Code "continues
from your existing work instead of starting over from a screenshot"
[unverified / secondary](https://support.claude.com/en/collections/14445694-claude-code) /
[unverified / secondary, search-snippet](https://designproject.io/blog/claude-design-workflow/).

**Are artboards self-contained HTML with inline styles?** Not stated in so many words on any fetched
Claude Design page. Adjacent, better-documented evidence: (a) generic Claude "Artifacts" — the same
runtime the Claude Code `/design` command reuses for its artboards — are documented as single
self-contained files with HTML/CSS/JS inline, served under a strict CSP
[verified: code.claude.com/docs/en/artifacts, per WebSearch summary only, page not independently fetched](https://code.claude.com/docs/en/artifacts);
(b) a secondary blog states artboards are "editable UI options rendered through the Artifacts runtime,"
i.e. the same substrate [unverified / secondary, fetched](https://explainx.ai/blog/claude-code-design-command-artboards-research-preview-2026).
Net: **plausible by strong inference, not directly confirmed** for claude.ai/design's own canvas (as
opposed to Claude Code's `/design` artboards, which do reuse the Artifacts runtime by the same source).

## 4. MCP server

**Official server, confirmed to exist and to be auto-configured by Claude Code.** Two independent GitHub
issues filed against the official `anthropics/claude-code` repo — not third-party — describe a
built-in, harness-injected MCP entry named `claude_design` pointed at
`https://api.anthropic.com/v1/design/mcp` (HTTP transport), which for some accounts returns HTTP 404 and
cannot be removed by the user (`claude mcp remove "claude_design" -s dynamic` is refused: "Cannot remove
MCP server from scope: dynamic") — both filers read this as the entitlement/feature-flag not being live
for their org even though the config itself is always injected
[verified, fetched: GitHub issue #69313](https://github.com/anthropics/claude-code/issues/69313)
[verified, fetched: GitHub issue #69325](https://github.com/anthropics/claude-code/issues/69325).
Separately, the support help center documents the manual connect command for users who want it from a
plain Claude Code/terminal context:

```
claude mcp add --scope user --transport http claude-design https://api.anthropic.com/v1/design/mcp
```

[verified: support.claude.com get-started article, per WebFetch summary, fetched](https://support.claude.com/en/articles/14604416-get-started-with-claude-design).
These two independent findings triangulate: same host, same path, same server name family — good
confirmation this is a real, officially-owned endpoint gated by per-org entitlement rather than a rumor.

**Direct, non-web observation (disclosed per the task's honesty requirement, not a web source):** this very
session has a connected MCP server literally named `claude-design` whose tool surface is: `ack_comments`,
`add_member`, `copy_files`, `create_project`, `create_support_js`, `delete_files`, `finalize_plan`,
`get_claude_design_prompt`, `get_conversation`, `get_project`, `list_comments`, `list_design_systems`,
`list_files`, `list_members`, `list_projects`, `put_conversation`, `read_design_skill`, `read_file`,
`remove_member`, `render_preview`, `update_member_role`, `update_sharing`, `write_files`. I did not invoke
any of these (out of scope for a "web only" research task), so their exact behavior below is inference
plus secondary corroboration, not first-hand verification.

Web corroboration for a subset of the _same_ tool names comes only from **unofficial, third-party**
reimplementations that reverse-engineer or proxy Claude Design (e.g. `Evilander/claude-design-mcp`,
`pro-vi/designer`), surfaced via WebSearch summaries, not individually fetched in full:

- `finalize_plan` — "locks the exact set of paths you will write and delete, and the local directory
  uploads may be read from, returning a `planId`"
- `write_files` — "write files to the project where every path must be in the finalized plan's writes,
  passing the `planId` from `finalize_plan`" — i.e. a two-phase commit: propose paths, get a token, then
  write only those exact paths
- `render_preview` — "uses Playwright to render screenshots, disables JavaScript, blocks service workers,
  and uses a fresh browser context"
- `list_projects` — "lists chats with chatId, title, turns, and active status" (note: "turns" here matches
  the conversational/turn-based model in §1)
  [all four bullets: unverified / secondary, WebSearch-summary only, not independently fetched](https://github.com/e-brokenc0de/claude-design-mcp).

I explicitly checked and could **not** find any fetched or search-indexed page describing
`get_claude_design_prompt`, `read_design_skill`, or `create_support_js` — three of the eight tool names the
task asked about. My best-effort inference from naming alone (not verified): `get_claude_design_prompt`
likely returns the system/style prompt Claude Design uses for generation (useful for a client wanting to
replicate its behavior outside the product); `read_design_skill` likely reads the per-project
skill/style-guide object referenced in §2; `create_support_js` likely emits a small client-side JS shim
bundled with an exported artboard (form validation, tab/accordion behavior, etc. for a "static" HTML
export) — **flagging all three as unverified conjecture, not research findings**.

One fully unofficial repo (`e-brokenc0de/claude-design-mcp`) is explicit that it is **not** an API wrapper
at all: it drives a real logged-in Chrome via CDP and calls claude.ai's _internal_ `OmeletteService`
Connect-RPC endpoints, returning `NOT_AUTHED` if the browser session isn't logged in
[verified (of the repo's own claim), fetched](https://github.com/e-brokenc0de/claude-design-mcp) — this is
a different, browser-automation approach, not evidence about the official HTTP MCP server's internals.

## 5. Recommended workflow

No fetched Anthropic page publishes a numbered "how to go from canvas to component library" playbook;
the fullest treatment found is a practitioner blog (fetched in full), which converges with the official
pages on the concrete building blocks:

1. **Feed it real ground truth first.** Connect the GitHub repo and a design-system file or Storybook URL
   before generating anything, "because it's reading from this baseline"
   [unverified / secondary, fetched](https://designproject.io/blog/claude-design-workflow/) — consistent
   with the official §2 mechanism (link codebase/Figma/docs → design system extraction).
2. **Explore wide, cheaply, in Claude Design.** Ask for several directions (the source suggests ~5) at
   low fidelity; treat this output as directional, not final, and expect to answer PRD-style clarifying
   questions Claude surfaces before it generates
   [unverified / secondary](https://designproject.io/blog/claude-design-workflow/).
3. **Review on canvas, async.** Share the link with comment access; the official model here is chat +
   inline comments + slider/direct edits (§1); comment-thread resolution is reported as unreliable in
   practice [unverified / secondary](https://designproject.io/blog/claude-design-workflow/), matching the
   admin guide's more neutral note that "multi-person editing remains unreliable" and "inline comments
   occasionally don't persist" [unverified / secondary, drawn from a WebFetch summary of a support page that itself may have paraphrased loosely](https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans).
4. **Don't chase pixel-perfect fidelity inside Claude Design.** Once a direction is picked, hand off to
   Claude Code rather than polishing further, "as it will burn tokens and the output won't match your
   component library as cleanly as Claude Code can" — hand Claude Code the design-file reference plus the
   repo README and explicitly ask it to use the real component library
   [unverified / secondary](https://designproject.io/blog/claude-design-workflow/). This matches the
   official `/design-sync` self-correction loop in §2 (Claude checks its own output against the design
   system before showing it).

**Known limitations**, gathered across sources: no pixel-level/redline editing, only copy and code tweaks
[unverified / secondary]; design-system import quality depends on how clean/tokenized the source codebase
already is [verified: implied on claude.com/product/design; made explicit as a limitation in secondary
coverage]; a documented **semantic gap** — Claude Design reads literal token values (hex codes, spacing
numbers) but reportedly does not reliably infer _when_ a token applies (e.g. CTAs vs. success states),
producing detached hex values, off-scale spacing, and literal paddings even against a supplied token set
in one practitioner's test [unverified / secondary, search-snippet only](https://www.designsystemscollective.com/tested-claude-design-it-failed-to-use-tokens-heres-why-3ec611b59ce5);
large codebases can lag the editor, and the tool is reported as token-hungry against Pro-tier weekly caps
[unverified / secondary]. Together these read as "no live variables, literals only, needs human
re-binding to real tokens" — but no fetched primary page states this in Anthropic's own words; it is a
secondary-source characterization, not an admitted limitation.

## 6. Comparison

Positioning that recurs across sources (all comparison claims below are `[unverified / secondary]` unless
marked otherwise, since these are competitor products outside the fetch set's primary-source scope):

| Tool              | Reported niche                                                                                                         | Source note                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Claude Design** | Exploration → early production; strongest at "thinking in design systems," asks clarifying questions before generating | fetched practitioner comparison |
| **Google Stitch** | Free, fast, nascent exploration tool; DESIGN.md as a portable output other tools can read                              | search-snippet only             |
| **Figma Make**    | Production-grade but template-dependent, inside core Figma files                                                       | fetched practitioner comparison |
| **v0 (Vercel)**   | Best once you already know you want a working React/Next.js UI                                                         | search-snippet only             |
| **Lovable**       | Shortest path from description to a deployed full-stack app for beginners                                              | search-snippet only             |

Source: [createwith.com comparison, fetched in full](https://www.createwith.com/blog/we-tested-claude-design-vs-figma-make-google-stitch-and-claude-code) —
stages Claude Design at "exploration → early production," Claude Code at "production," Figma Make at
"production (template-based)," Google Stitch at "exploration (nascent)." Claude Design output is called
close to production-ready but needing ~10% manual finishing, with occasional overlapping text,
hallucinated SVG icons, and severe usage caps ("Pro users hit weekly caps within hours"); Figma Make's
output is "quite basic"; Google Stitch's is weakest of the four, "resembling a free Wordpress template
from 2012." The article does **not** recommend combining Claude Design with Figma — it reads Anthropic's
roadmap as a closed loop inside Claude's own ecosystem (Design → Canva/PowerPoint, or straight to Claude
Code), not toward Figma interoperability.

On **combining Claude Design with Figma** specifically, the only material found is the one-directional,
read-only Figma-plugin-via-Claude-Code bridge described in §3 (search-snippet only, not independently
fetched) — i.e., pull tokens/components _out of_ Figma once, then let Claude Design's own onboarding
absorb them; no fetched or found source describes push-to-Figma or two-way sync.

## What I could NOT verify

- Exact behavior of `get_claude_design_prompt`, `read_design_skill`, `create_support_js` (tool names only,
  no documentation found for any of the three).
- Whether Claude Design's own canvas artboards (as opposed to Claude Code's `/design` artboards) are
  literally single self-contained HTML files with inline styles — strongly implied by the shared
  "Artifacts runtime," not directly stated for claude.ai/design itself.
- Whether Figma export truly does not exist at all (only: it's absent from every fetched export/output
  list; the flat "cannot export to Figma" claim is search-snippet-only).
- Whether the broader connected-apps list (Adobe, Base44, Gamma, Lovable, Miro, Replit, Vercel, Wix) was
  live at the April 17, 2026 launch or added later — the launch blog post and the current help
  center/product pages disagree on breadth.
- The Canva-integration mechanics (the Canva newsroom post returned HTTP 403 and could not be fetched).
- Precise wording of the three collaboration roles (owner/editor/viewer) — official pages describe
  "view-only, comment, and edit access" without naming a role called "owner."

## Bibliography (all URLs touched)

Fetched in full:

- https://www.anthropic.com/news/claude-design-anthropic-labs
- https://support.claude.com/en/articles/14604416-get-started-with-claude-design
- https://claude.com/product/design
- https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans
- https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design
- https://github.com/e-brokenc0de/claude-design-mcp
- https://github.com/anthropics/claude-code/issues/69313
- https://github.com/anthropics/claude-code/issues/69325
- https://explainx.ai/blog/claude-code-design-command-artboards-research-preview-2026
- https://venturebeat.com/technology/anthropic-just-launched-claude-design-an-ai-tool-that-turns-prompts-into-prototypes-and-challenges-figma
- https://designproject.io/blog/claude-design-workflow/
- https://www.createwith.com/blog/we-tested-claude-design-vs-figma-make-google-stitch-and-claude-code
- https://www.canva.com/newsroom/news/canva-claude-design/ (HTTP 403 — could not retrieve content)
- https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/tool-description-designsync.md (fetch declined by the tool as likely-internal system-prompt content — no content obtained)

Seen only as WebSearch result snippets / AI summaries (not independently fetched, all treated as
`[unverified / secondary]` even where they claim to quote a primary page):
mindstudio.ai (×2), datacamp.com, community.safe.com, winbuzzer.com, shelby-ai.com,
support.claude.com/en/collections/14445694-claude-code, github.com/Evilander/claude-design-mcp,
github.com/pro-vi/designer, github.com/rohitg00/awesome-claude-design, github.com/VoltAgent/awesome-claude-design,
github.com/jiji262/claude-design-skill, clickup.com, magier.com, designsystemscollective.com (two different posts),
findskill.ai, forum.figma.com (several threads), uxpilot.ai, flowstep.ai, quasa.io,
engincanveske.substack.com, medium.com/design-bootcamp, lushbinary.com, vibecodewithmatt.com, mantlr.com,
ortemtech.com, aitoolsreview.co.uk, claudcod.com, orcarouter.ai, host-html.com, blog.htmlput.com,
thesolocreators.com, clauder-navi.com, buildwithclaude.com, code.claude.com/docs/en/artifacts,
dev.to/hira_jabeen_ccaa191c13070, code.claude.com/docs/en/mcp, lobehub.com/mcp/e-brokenc0de-claude-design-mcp,
platform.claude.com/docs/en/agent-sdk/mcp, obot.ai, claude-world.com, github.com/justinwlin/claude-mcp-guide,
gist.github.com/hqman/f46d5479a5b663c282c94faa8be866de, hermes-tutorials.dev, github.com/chrisdevelops/claude-code-nextjs-project,
agence-scroll.com, eigent.ai, creatoreconomy.so, anotherwrapper.com, github.com/anthropics/claude-ai-mcp,
blog.gopenai.com, glama.ai (several server listing pages), www.mejba.me.
