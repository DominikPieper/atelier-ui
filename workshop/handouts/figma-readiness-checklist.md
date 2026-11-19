# Is your Figma file ready?

Homework, on your own file: nobody starts this in the room. Tick what holds. Part A per master, Part B once per system.

Master / file checked: ______________________________

## Part A: one master

- [ ] Colour, spacing and radius are bound to variables
- [ ] Every frame with children uses Auto Layout
- [ ] Variables are scoped, not “all scopes”
- [ ] Each variable’s code name is recoverable
- [ ] Each variable says what it is for
- [ ] No default layer names in the component’s own tree
- [ ] Layer names match across variants
- [ ] The master has a structured description
- [ ] Variants and states are complete and drawn on the right axis
- [ ] Content decisions are recorded as properties, or a reason is given
- [ ] The accessibility audit ran, and you read how it classified the component

## Part B: the system

### Complete

- [ ] Every component you ship exists as a master
- [ ] Colour, spacing and type are named tokens on both sides

### Sound

- [ ] Colour pairs meet contrast, components pass an automated check

### Synchronized

- [ ] Each master maps to a code component with the same name and values
- [ ] A rendered component looks like its master
- [ ] Component documentation is generated from code

### Extensible

- [ ] There is a written way to change the system
- [ ] You know who uses what, and feedback arrives

### AI-ready

- [ ] Each component has machine-readable purpose, usage and an accessibility note in code
- [ ] An agent can look up exact props and variants without reading source

## The check prompt

For Part A, with figma-console-mcp connected to your file (a third-party tool) and the master selected:

> Run figma_lint_design on the node I have selected with only the rules hardcoded-color, default-name and detached-component. Return the findings as a list: layer, rule, message. Change nothing in the file.

Sort each finding: real or false alarm. The three rules see raw colours, default layer names and detached instances, nothing else on this page.

The finding I fix first: ______________________________
