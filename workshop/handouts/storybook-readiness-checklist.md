# Is your Storybook ready?

Homework, on your own Storybook: nobody starts this in the room. Tick what holds. Part A per component, Part B once per setup, then the self-check.

Component / Storybook checked: ______________________________

## Part A: one component

- [ ] The component class has a JSDoc description
- [ ] Every input has a JSDoc line, and defaults are real initial values
- [ ] Closed value sets are visible in the Inputs block
- [ ] Outputs and two-way bindings are declared with the framework’s own API
- [ ] One story per variant value and state, driven by args
- [ ] The three stories that come first are the ones to copy
- [ ] Every story produces a complete snippet
- [ ] A story that needs explaining says so, in a JSDoc comment above it

## Part B: the setup

- [ ] The build emits a manifest with a real docgen pass
- [ ] An agent can reach it, without a browser
- [ ] You have looked at the manifest report
- [ ] Story titles are stable and carry the category
- [ ] Guidance that is not about one component sits in a docs entry, written as Markdown

## Exercise: check your Storybook

Paste this read-only prompt into your agent, with your Storybook's MCP connected:

> Storybook readiness check, read-only. Do not edit any file. Use only the ids `docs-list` returns. (1) Call `docs-list` once: report components with no description and entries under "Docs". (2) Call `docs-show` per component (more than 15: take 10, say which you skipped) and record: description and purpose in its first sentence; inputs without a description line; named-alias types whose values are not printed; events or two-way bindings missing from the block; stories listed by name only (no snippet); variant values or states without a story; whether the first three stories are default usage plus the two most typical variations. (3) Report a table: component, finding, which check it breaks, likelihood of wrong code (high, medium, low). (4) Name the one finding that would make you invent a prop or a value, and why. (5) List what you could not check. Propose or apply no fixes.

Then:

1. Pick one: the finding that would most likely make an agent invent a property or a value.
2. Fix it where it is declared: the JSDoc, the type or the story.
3. Re-run the same prompt. The finding should be gone and nothing new should have appeared.

The finding I fix first: ______________________________
