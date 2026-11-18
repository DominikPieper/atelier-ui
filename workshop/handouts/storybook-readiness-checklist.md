# Is your Storybook ready?

Tick what holds. Part A per component, Part B once per setup, then the self-check.

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

Run the read-only prompt from the page (the agent calls `docs-list`, then `docs-show` per component, and reports against Part A). Then:

1. Pick one: the finding that would most likely make an agent invent a property or a value.
2. Fix it where it is declared: the JSDoc, the type or the story.
3. Re-run the same prompt. The finding should be gone and nothing new should have appeared.

The finding I fix first: ______________________________

The how: https://atelier.pieper.io/storybook-readiness
