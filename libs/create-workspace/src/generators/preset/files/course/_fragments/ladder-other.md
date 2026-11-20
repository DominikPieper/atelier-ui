Prompt 1 (the clean run) works on any framework:

```text
Run `npm run lint` and `npm run build`. Report each exit code. If one is not 0, read the
output (the full log when the summary has no error text), repair, and run both again.
```

If the agent already ran both while it generated, this run is green at once. That is not a
wasted step: until now you had the agent's word, now you have the exit codes.

The break-it-on-purpose prompts of this stage plant Angular template syntax and were only
checked on Angular, so they are not part of the {{FRAMEWORK}} course material. If it is
time for them, watch the trainer's demo.
