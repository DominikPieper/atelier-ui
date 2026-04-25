# Test fixtures

Behavior specifications for the skill — pairs of `input.md` (user prompt) and `expected.md` (the response shape the skill should produce). These are not unit tests in the executable sense; they are golden specs that a human reviewer or an LLM grader can use to verify that a change to a reference file did not silently regress common usage.

## Format

Every scenario lives in its own directory:

```
tests/<scenario-name>/
  input.md      — the user's prompt as it would arrive in chat
  expected.md   — frontmatter + the shape of the response the skill
                  should produce
```

Both files are markdown. `expected.md` carries YAML frontmatter:

```yaml
---
mode: Build | Audit | Decide | Migrate | Out-of-scope
references:                # which references/*.md should be consulted
  - tool-map.md
  - token-architecture.md
first-tool: figma_get_file_data | figma_setup_design_tokens | (none)
---
```

The body of `expected.md` describes:

- The decisions the agent should surface before any write call
- Tools the agent should reach for, in order
- Anti-patterns whose presence in the actual response counts as a regression

## How to grade a run

1. Pose the `input.md` text to the skill.
2. Read the response.
3. Check the frontmatter expectations — did the agent enter the right mode? Did it load the referenced files? Did it pick the listed first tool?
4. Walk the body — are the decisions surfaced? Are anti-patterns absent?
5. Score per category (Mode / Tools / Decisions / Anti-patterns) — Pass / Fail / Partial.

This is a manual or LLM-judged process by design. We do not have a deterministic agent harness in this repo; the test runner (`tools/scripts/test-skill.mjs`) only validates that the fixture files are well-formed and reference real reference docs.

## Scenarios

| Directory                     | Mode          | What it covers                                                |
|-------------------------------|---------------|---------------------------------------------------------------|
| `build-bootstrap-tokens`      | Build         | Greenfield token-system creation                              |
| `audit-existing-system`       | Audit         | Architectural deep-audit on an existing file                  |
| `decide-variant-vs-property`  | Decide        | The recurring "Variant or Component Property?" fork           |
| `migrate-rename-variable`     | Migrate       | Variable rename with code-side coordination                   |
| `out-of-scope-code-gen`       | Out-of-scope  | "Convert this Figma component to React" — should bow out      |

## Add a scenario

1. `mkdir tests/<descriptive-kebab-case-name>`
2. Write `input.md` — copy the kind of message a user actually types, not a polished version.
3. Write `expected.md` with the frontmatter above plus the body grading rubric.
4. Run `npx nx test figma-workspace-architect` to validate the fixture is well-formed.
5. Commit.

Keep one scenario tightly scoped — if a single user message would naturally trigger two modes, that is a separate fixture, not one fixture covering both.
