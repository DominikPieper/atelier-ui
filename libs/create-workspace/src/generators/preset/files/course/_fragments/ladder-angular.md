This stage uses the Angular template rules that `npm run lint` runs in this workspace.
Three prompts, in order, on the Settings Card you just generated. Prompt 1 is the clean
run; prompts 2 and 3 break it on purpose, the tool says so, and the agent repairs it.

**Prompt 1, the clean run.**

```text
Run `npm run lint` and `npm run build`. Report each exit code. If one is not 0, read the
output (the full log when the summary has no error text), repair, and run both again.
```

If the agent already ran both while it generated, this run is green at once. That is not a
wasted step: until now you had the agent's word, now you have the exit codes.

**Prompt 2, break it on purpose.** Do not let the agent fix anything yet.

```text
Add an `<img src="/avatar.png">` without `alt` and a `<div (click)="save()">Save</div>`
to the Settings Card. Do not fix anything. Run `npm run lint`, report the exit code and
the rule ids it names.
```

Expect a non-zero exit code and these rule ids: `alt-text` (the image),
`click-events-have-key-events` and `interactive-supports-focus` (the div).

**Prompt 3, repair from the output.**

```text
Repair from the lint output. Run lint and build again and report both exit codes.
```

Now read the repair. What did the agent write as `alt`? Usually it invents a name such as
`alt="User avatar"`. Lint is green with any text, and with `alt=""` too, which hides the
image from a screen reader. Is that name right, and who decided? Green is not the same as
right.

**Clean-up.**

```text
Remove the image and the div again, run both, report the exit codes.
```

What lint does not see: a raw `<button>` where a library component exists, and meaning
(any `alt` text passes, the wrong one too). If the agent stalls or reports "failed" without error text, type
`npm run lint` (or `npm run build`) in the terminal and read the output yourself.
