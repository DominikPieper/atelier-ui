# Day 1, Block 04: the docs the agent reads, and a story that can fail

Used in Day 1 Block 04. Two parts: you ask the `{{MCP}}` MCP what a library component can
do, and you write one story with a `play` function, see it red once and then green.
Storybook must be running (`npm run storybook`, port 6006) before Claude Code starts,
otherwise `storybook-local` is not connected (see `rescue.md`).

**Done when** `docs-show` was called on your seat, and one story with a `play` function was
red once and is green now.

## Part 1: ask the docs (14:40 to 15:00)

```text
Use the {{MCP}} MCP. Call docs-list, then docs-show for the AtlButton id, and
list its props with allowed values. Do not guess.
```

Then ask for something that does not exist:

```text
Does AtlButton have a `shadow` prop? Answer from docs-show only.
```

The answer you want is a plain "no", with the place the agent looked. An answer that
starts to explain how you could add a shadow anyway has left the docs.

## Part 2: a story with a `play`, red then green (15:00 to 15:25)

The workspace has one template story, the `atl-button.stories` file in
`workshop-{{FRAMEWORK_LC}}/src/`. Its `Primary` story clicks the button and checks that the
text next to it changes.

```text
Storybook is running on port 6006. Write one new story in the atl-button.stories
file under workshop-{{FRAMEWORK_LC}}/src/ for the Outline variant with a click,
modelled on the Primary story, with a play function that checks the behaviour.
Call get-storybook-story-instructions from storybook-local before you write
anything. Then run it with test-run through storybook-local and tell me the
result.
```

The file already has an `Outline` story, without a click. Which name did the agent give the
new one, and did it say why?

It will most likely be green on the first run. A `play` that has never failed has proven
nothing yet, so break it:

```text
Now break it on purpose: change the text the play function expects to `never`.
Run test-run again and show me the failure exactly as the tool reports it. Do
not fix it yet.
```

Read the failure in the agent's answer and in Storybook's interactions panel: it is the same
red. Which line names the text the `play` function looked for, and where does the output
show the text that is really on the page?

```text
Fix it again and show me that it is green.
```

## Part 3: read what was written

```text
Explain the anatomy of the story file you just edited to me: what is meta, what
is a story, what are args, what does play do, and where does the text `clicked`
come from?
```

Two questions for you, not for the agent:

- Look at the story list `docs-show` printed in part 1 and at your story file. They do not
  match: `docs-show` lists stories your file does not have, and it does not know the one
  you just wrote. Which Storybook does each answer come from? (`{{MCP}}` answers for the
  library as it was published; `storybook-local` answers for what runs on your machine.)
- The agent said "green". Did you see the story run, or did you read a sentence?

If `storybook-local` is not connected, start Storybook, then run `/mcp` and reconnect. The
interactions panel in the browser shows the same result meanwhile.
