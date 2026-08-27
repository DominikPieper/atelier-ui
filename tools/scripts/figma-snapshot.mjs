#!/usr/bin/env node
/**
 * figma-snapshot.mjs
 *
 * Refresh step for the Figma conformance gate. This is the ONE part of the gate
 * that talks to Figma: it spawns figma-console-mcp as a stdio MCP client, reads
 * the master COMPONENT_SETs over the Desktop Bridge, and writes the committed
 * snapshot `tools/figma/snapshot.json` that the offline `check:figma` runs
 * against. (See tools/scripts/check-figma.js and plan/adr/0019.)
 *
 *   npm run figma:snapshot
 *
 * Requirements: Figma Desktop running with the file open and the figma-console
 * Desktop Bridge plugin connected. Fails loud (exit 2) if the bridge is not
 * connected — never a silent / empty write.
 *
 * NOTE: figma-console-mcp binds a single bridge WebSocket and the plugin attaches
 * to one server instance. If another MCP client (e.g. an active Claude Code
 * session) already holds the bridge, this spawned instance will see no plugin
 * and fail the probe. Run it when no other figma-console client is connected.
 *
 * The snapshot stores Figma *facts* only (names, variant axes, descriptions,
 * layoutMode, and bound/unbound/raw determinations per node). All rule logic and
 * severities live in check-figma.js.
 */
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const OUT = resolve(ROOT, 'tools/figma/snapshot.json');
const FILE_KEY = 'QMnDD8uZQPldPrlCwZZ58T';

/**
 * Master COMPONENT_SET node IDs — the source of truth is plan/figma.md's
 * component table. Keep this in sync when masters are added/removed (the same
 * discipline plan/figma.md already documents). Masters with no spec interface
 * (e.g. AtlCodeBlock, AtlToast) are captured too; the gate's name check will
 * flag them unless allowlisted in lib/allowlists.js.
 */
const MASTERS = [
  { nodeId: '129:20' }, { nodeId: '129:33' }, { nodeId: '55:65' }, { nodeId: '55:22' },
  { nodeId: '55:92' }, { nodeId: '55:94' }, { nodeId: '55:123' }, { nodeId: '55:127' },
  { nodeId: '55:130' }, { nodeId: '55:52' }, { nodeId: '55:31' }, { nodeId: '55:36' },
  { nodeId: '55:41' }, { nodeId: '55:87' }, { nodeId: '55:137' }, { nodeId: '420:185' },
  { nodeId: '55:102' }, { nodeId: '420:153' }, { nodeId: '55:151' }, { nodeId: '55:47' },
  // 55:141 and 55:145 were COMPONENT_SETs whose only axis pictured an outcome of
  // content rather than a property — AtlBreadcrumbs `items` = 3|4|5 and AtlPagination
  // `position` = first|middle|last. ADR-0056 removed the axes, which collapsed each set
  // to the plain COMPONENT it always was; the other drawings live as content samples on
  // the Components page. The new ids are the surviving components.
  { nodeId: '55:139' }, { nodeId: '55:143' }, { nodeId: '421:398' }, { nodeId: '421:1183' },
  { nodeId: '420:286' }, { nodeId: '421:339' }, { nodeId: '421:505' }, { nodeId: '508:7221' },
  { nodeId: '507:2953' },
  // Child masters (ADR-0062). Ten parts that had no master of their own, which is
  // why their geometry was the one layer [ROOT-PAINT] could not reach: a part
  // promoted to a master has a ROOT, and a root is what the gate compares.
  { nodeId: '911:1056' }, // Navigation/AtlMenuItem
  { nodeId: '911:1059' }, // Navigation/AtlMenuSeparator
  { nodeId: '911:1069' }, // Navigation/AtlBreadcrumbItem
  { nodeId: '911:1075' }, // Navigation/AtlTab
  { nodeId: '911:1151' }, // Navigation/AtlStep
  { nodeId: '911:1086' }, // Form/AtlOption
  { nodeId: '911:1103' }, // Feedback/AtlAccordionItem
  { nodeId: '911:1112' }, // AI/AtlChatMessage
  { nodeId: '911:1116' }, // AI/AtlChatSuggestion
  { nodeId: '911:1119' }, // AI/AtlChatTyping
  // The table's parts (ADR-0065). These carry the three Booleans AtlTable had been
  // declaring on their behalf, which ADR-0056 forbids and ADR-0061 allowlisted only
  // until these existed.
  { nodeId: '911:1503' }, // Data/AtlTh
  { nodeId: '911:1496' }, // Data/AtlTd
  { nodeId: '911:1533' }, // Data/AtlTr
  { nodeId: '911:1546' }, // Data/AtlTbody
];

main().catch((err) => {
  console.error(`✗ figma:snapshot failed: ${err?.message ?? err}`);
  process.exit(2);
});

async function main() {
  const client = new Client({ name: 'atelier-figma-snapshot', version: '1.0.0' }, { capabilities: {} });
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'figma-console-mcp@latest'],
    env: { ...process.env },
  });
  await client.connect(transport);

  try {
    // 1. Probe the bridge — fail loud if the plugin is not connected.
    // The plugin discovers a freshly-spawned server via the advertised port
    // file and attaches ~0.5s after startup, so retry the probe briefly
    // instead of failing on the first attempt (observed race: probe at
    // t+0ms, plugin connect at t+400ms).
    let status = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      status = await call(client, 'figma_get_status', { probe: true });
      if (isConnected(status)) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!isConnected(status)) {
      console.error(
        '✗ Figma Desktop Bridge not connected. Open Figma Desktop with the file and the\n' +
          '  figma-console Desktop Bridge plugin running, and ensure no other MCP client holds\n' +
          '  the bridge, then re-run npm run figma:snapshot.'
      );
      process.exit(2);
    }
    const serverVersion = status?.serverVersion ?? status?.details?.serverVersion ?? null;
    const figmaLastModified =
      status?.details?.lastModified ?? status?.lastModified ?? null;

    // 2. Library Tokens collection — the semantic tier mirroring tokens.css (--ui-*).
    const vars = await call(client, 'figma_get_variables', {
      format: 'filtered',
      collection: 'Library Tokens',
      verbosity: 'summary',
    });
    const uiTokens = (vars?.data?.variables ?? []).map((v) => v.name).sort();

    // 2b. Property facts the per-component read does not expose: which declared
    //     properties something actually references, and every pictogram drawn as a
    //     TEXT character. Both were invisible until 2026-08-27 — twenty declared
    //     Booleans toggled nothing and forty-two icons were characters, in a file the
    //     library is transferred to (ADR-0058). One round trip for all masters.
    const probeCode = `
      await figma.loadAllPagesAsync();
      const out = {};
      for (const set of figma.root.findAll((n) => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && /^(Action|Form|Display|Navigation|Overlay|Feedback|AI|Data)\\//.test(n.name)))) {
        const kids = set.type === 'COMPONENT_SET' ? set.children : [set];
        const referenced = new Set();
        const glyphs = [];
        const iconInstances = new Set();
        for (const v of kids) {
          for (const n of [v, ...v.findAll(() => true)]) {
            const r = n.componentPropertyReferences;
            if (r) for (const val of Object.values(r)) referenced.add(val);
            if (n.type === 'INSTANCE') {
              // documentAccess: dynamic-page — the synchronous mainComponent getter
              // returns nothing here, so the async form is the only one that resolves.
              let main = null;
              try { main = await n.getMainComponentAsync(); } catch (e) { main = null; }
              if (main && main.name.indexOf('Icon/') === 0) iconInstances.add(n.name);
            }
            if (n.type === 'TEXT') {
              // A glyph inside an INSTANCE belongs to the child master, which states its
              // own exemption there. Composing AtlBreadcrumbs from AtlBreadcrumbItem
              // instances otherwise made the parent inherit the finding without the
              // reason (ADR-0068) — the same rule the layer walk already follows.
              let gAnc = n.parent, inInstance = false;
              while (gAnc && gAnc.id !== v.id) { if (gAnc.type === 'INSTANCE') { inInstance = true; break; } gAnc = gAnc.parent; }
              if (inInstance) continue;
              const c = (n.characters || '').trim();
              // Two shapes, and the second was a hole: a whole string that is a pictogram
              // ("✓"), and a pictogram EMBEDDED in prose ("‹ Prev"), which a length test
              // never reaches. AtlPagination hid two of them that way.
              if (c && c.length <= 3 && /[^\\x00-\\x7F]/.test(c)) {
                glyphs.push({ layer: n.name, chars: c });
              } else if (c) {
                const inner = c.match(/[\\u2190-\\u21FF\\u2300-\\u27BF\\u2B00-\\u2BFF\\u25A0-\\u25FF\\u2039\\u203A\\u00AB\\u00BB]/g);
                if (inner) for (const g of [...new Set(inner)]) glyphs.push({ layer: n.name, chars: g, inString: c.slice(0, 24) });
              }
            }
          }
        }
        // Which VARIABLE a paint is bound to, not merely whether it is bound. The
        // token gate could only see bound-or-raw, so three of AtlMenu's root facts
        // pointed at the wrong variable (radius/sm for --ui-radius-lg,
        // color/surface for surface-raised, info-bg for surface-sunken) and passed
        // (ADR-0060). Keyed by variant name so the check can resolve the CSS
        // cascade for the exact variant it samples.
        const rootPaint = {};
        for (const v of kids) {
          const bv = v.boundVariables || {};
          const paintVar = async (list) => {
            const p0 = (list || [])[0];
            if (!p0) return null;
            const id = p0.boundVariables && p0.boundVariables.color && p0.boundVariables.color.id;
            if (!id) return 'RAW';
            const vr = await figma.variables.getVariableByIdAsync(id);
            return vr ? vr.name : 'RAW';
          };
          let radius = null;
          if (bv.topLeftRadius) {
            const vr = await figma.variables.getVariableByIdAsync(bv.topLeftRadius.id);
            radius = vr ? vr.name : 'RAW';
          } else if (v.cornerRadius !== figma.mixed && v.cornerRadius > 0) {
            radius = 'RAW';
          }
          rootPaint[v.name] = {
            fill: await paintVar(v.fills),
            stroke: await paintVar(v.strokes),
            strokeWeight: v.strokeWeight === figma.mixed ? 'mixed' : v.strokeWeight,
            // Per side, because three components paint one edge rather than a box:
            // AtlToast's 4px left accent, the tab list's bottom rule, the accordion
            // group's top rule. A four-side reading called the accent "no stroke".
            strokeSides: [v.strokeTopWeight, v.strokeRightWeight, v.strokeBottomWeight, v.strokeLeftWeight],
            radius,
            radiusPx: v.cornerRadius === figma.mixed ? 'mixed' : v.cornerRadius,
            effects: (v.effects || []).filter((e) => e.visible !== false).map((e) => e.type),
            // The root's OWN text. AtlAvatar's xs initials were 9px against
            // --ui-font-size-2xs (10px) and nothing compared them: [LAYER-PAINT]
            // reads named layers, and the root is [ROOT-PAINT]'s, which had no
            // typography.
            fontSize: (function () {
              const t = (v.children || []).filter((c) => c.type === 'TEXT');
              return t.length === 1 && t[0].fontSize !== figma.mixed ? t[0].fontSize : null;
            })(),
            lineHeight: (function () {
              const t = (v.children || []).filter((c) => c.type === 'TEXT');
              if (t.length !== 1) return null;
              const lh = t[0].lineHeight;
              return lh !== figma.mixed && lh.unit === 'PERCENT' ? lh.value : null;
            })(),
          };
        }
        // Overlay layers (_disabled-overlay, _invalid-border, _readonly-surface, ...).
        // Read HERE rather than from the per-component deep read, which filters
        // invisible nodes — and a Figma Boolean's only mechanism is toggling
        // visibility, so every node a Boolean switches on is invisible by default.
        // That is why 34 raw stroke colours and 78 misplaced rectangles sat
        // unreported for months (ADR-0061).
        const overlays = [];
        for (const v of kids) {
          for (const n of v.findAll((x) => x.name.charAt(0) === '_')) {
            const par = n.parent;
            const varOf = async (list) => {
              const p0 = (list || [])[0];
              if (!p0 || p0.visible === false) return null;
              // A gradient carries its bindings on the STOPS, not on the paint, so a
              // paint-level read called the shimmer raw while its middle stop was
              // bound. Transparent stops need no variable — they are absence, not
              // colour.
              if (String(p0.type).indexOf('GRADIENT') === 0) {
                const stops = p0.gradientStops || [];
                const opaque = stops.filter((st) => (st.color ? st.color.a : 0) > 0.001);
                if (!opaque.length) return null;
                const names = [];
                for (const st of opaque) {
                  const sid = st.boundVariables && st.boundVariables.color && st.boundVariables.color.id;
                  if (!sid) return 'RAW';
                  const sv = await figma.variables.getVariableByIdAsync(sid);
                  names.push(sv ? sv.name : 'RAW');
                }
                return names.join('+');
              }
              const id = p0.boundVariables && p0.boundVariables.color && p0.boundVariables.color.id;
              if (!id) return 'RAW';
              const vr = await figma.variables.getVariableByIdAsync(id);
              return vr ? vr.name : 'RAW';
            };
            overlays.push({
              variant: v.name,
              layer: n.name,
              type: n.type,
              fill: await varOf(n.fills),
              stroke: await varOf(n.strokes),
              box: [Math.round(n.x), Math.round(n.y), Math.round(n.width), Math.round(n.height)],
              parentBox: [Math.round(par.width), Math.round(par.height)],
              parentName: par.name,
              visible: n.visible !== false,
              boundTo: (n.componentPropertyReferences || {}).visible || null,
            });
          }
        }
        // Inner layers, addressed by NAME. The convention is that a layer named for a
        // CSS class draws that rule, so the name is the selector and no table has to
        // be maintained. Identical clones (twelve menu items) collapse to one entry
        // with a count.
        const layers = [];
        const seenLayer = new Set();
        const GENERIC = ['Frame', 'Group', 'Rectangle', 'Ellipse', 'Vector', 'Line', 'Text', 'Union', 'Slice'];
        for (const v of kids) {
          for (const n of v.findAll((x) => x.type === 'FRAME' || x.type === 'RECTANGLE' || x.type === 'ELLIPSE' || x.type === 'INSTANCE')) {
            const nm = String(n.name);
            if (nm.charAt(0) === '_' || GENERIC.indexOf(nm) >= 0) continue;
            if (n.type === 'INSTANCE') continue; // an instance is its own master
            // Nor anything INSIDE an instance. That is the point of composing a parent
            // from child masters: the layer belongs to the master that defines it and is
            // checked there. Without this, AtlTbody re-reported AtlTr's select cell.
            let anc = n.parent, nested = false;
            while (anc && anc.id !== v.id) { if (anc.type === 'INSTANCE') { nested = true; break; } anc = anc.parent; }
            if (nested) continue;
            const paintVar = async (list) => {
              const p0 = (list || [])[0];
              if (!p0 || p0.visible === false) return null;
              const id = p0.boundVariables && p0.boundVariables.color && p0.boundVariables.color.id;
              if (!id) return 'RAW';
              const vr = await figma.variables.getVariableByIdAsync(id);
              return vr ? vr.name : 'RAW';
            };
            const bv = n.boundVariables || {};
            let radius = null;
            if (bv.topLeftRadius) {
              const vr = await figma.variables.getVariableByIdAsync(bv.topLeftRadius.id);
              radius = vr ? vr.name : 'RAW';
            } else if (n.cornerRadius !== figma.mixed && n.cornerRadius > 0) radius = 'RAW';
            const ownText = ('children' in n ? n.children : []).filter((c) => c.type === 'TEXT');
            const fact = {
              layer: nm,
              type: n.type,
              fill: await paintVar(n.fills),
              stroke: await paintVar(n.strokes),
              strokeSides: 'strokeTopWeight' in n ? [n.strokeTopWeight, n.strokeRightWeight, n.strokeBottomWeight, n.strokeLeftWeight] : null,
              radius,
              effects: (n.effects || []).filter((e) => e.visible !== false).map((e) => e.type),
              layoutMode: n.layoutMode || 'NONE',
              padding: 'paddingTop' in n ? [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft] : null,
              gap: 'itemSpacing' in n ? n.itemSpacing : null,
              minHeight: 'minHeight' in n ? n.minHeight : null,
              height: Math.round(n.height * 100) / 100,
              width: Math.round(n.width * 100) / 100,
              fontSize: ownText.length === 1 && ownText[0].fontSize !== figma.mixed ? ownText[0].fontSize : null,
              lineHeight: ownText.length === 1 && ownText[0].lineHeight !== figma.mixed && ownText[0].lineHeight.unit === 'PERCENT' ? ownText[0].lineHeight.value : null,
            };
            const key = v.name + '|' + JSON.stringify(fact);
            if (seenLayer.has(key)) {
              const prev = layers.find((L) => L.variant === v.name && L.key === key);
              if (prev) prev.count++;
              continue;
            }
            seenLayer.add(key);
            layers.push(Object.assign({ variant: v.name, key, count: 1 }, fact));
          }
        }
        for (const L of layers) delete L.key;
        const props = {};
        for (const [k, v] of Object.entries(set.componentPropertyDefinitions || {})) props[k] = v.type;
        const seen = new Set();
        out[set.id] = {
          properties: props,
          referencedProperties: [...referenced],
          iconInstanceNames: [...iconInstances],
          rootPaint,
          overlays,
          layers,
          glyphTextNodes: glyphs.filter((g) => { const k = g.layer + '|' + g.chars; if (seen.has(k)) return false; seen.add(k); return true; }),
        };
      }
      // File-wide typography. The masters were drawn in Inter while
      // --ui-font-family said Instrument Sans, and the 19 ty/* text styles
      // documented a Montserrat scale the library never had (ADR-0059). Neither
      // was visible to any gate, so both are captured as facts here.
      const fontTally = {};
      const fontSamples = {};
      for (const pg of figma.root.children) {
        for (const t of pg.findAll((n) => n.type === 'TEXT')) {
          const fn = t.fontName;
          const key = fn === figma.mixed ? 'MIXED' : fn.family;
          fontTally[key] = (fontTally[key] || 0) + 1;
          if (!fontSamples[key]) fontSamples[key] = pg.name + ' \u203a ' + String(t.name).slice(0, 40);
        }
      }
      const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => ({
        name: s.name,
        family: s.fontName.family,
        style: s.fontName.style,
        size: s.fontSize,
        lineHeightUnit: s.lineHeight.unit,
        lineHeightValue: s.lineHeight.unit === 'AUTO' ? null : s.lineHeight.value,
      }));
      return { masters: out, typography: { fontFamilies: fontTally, fontSamples, textStyles } };
    `;
    const probe = (await call(client, 'figma_execute', { code: probeCode, timeout: 25000 }))?.result ?? {};

    // 3. Each master: set-level metadata + a deep read of its default variant.
    const components = [];
    for (const { nodeId } of MASTERS) {
      const comp = (await call(client, 'figma_get_component', { nodeId, enrich: true }))?.component;
      if (!comp) {
        console.warn(`⚠ skipped ${nodeId}: figma_get_component returned no component`);
        continue;
      }
      // A master can be a plain COMPONENT rather than a COMPONENT_SET: ADR-0056 removed
      // the illustration axes from AtlBreadcrumbs and AtlPagination, and a component with
      // no axis has none. Its children are its parts, not its variants, so do not read
      // them as variant names — `Home`, `/`, `Settings` would otherwise be parsed as one.
      const isSet = comp.type === 'COMPONENT_SET';
      const variantAxes = isSet ? variantAxesOf(comp.componentPropertyDefinitions) : {};
      const variants = isSet
        ? (comp.children ?? []).map((c) => parseVariantName(c.name)).filter(Boolean)
        : [];
      const defaultVariantId = pickDefaultVariant(comp, variantAxes);
      const deep = defaultVariantId
        ? (await call(client, 'figma_get_component_for_development_deep', { nodeId: defaultVariantId, depth: 8 }))?.component
        : null;

      components.push({
        name: comp.name,
        selector: leafName(comp.name),
        nodeId,
        description: comp.description ?? '',
        variantAxes,
        variants,
        // From the 2b probe: the declared property types, which of them anything
        // references, and the pictograms drawn as TEXT characters.
        properties: probe.masters?.[nodeId]?.properties ?? {},
        referencedProperties: probe.masters?.[nodeId]?.referencedProperties ?? [],
        iconInstanceNames: probe.masters?.[nodeId]?.iconInstanceNames ?? [],
        rootPaint: probe.masters?.[nodeId]?.rootPaint ?? {},
        overlays: probe.masters?.[nodeId]?.overlays ?? [],
        layers: probe.masters?.[nodeId]?.layers ?? [],
        glyphTextNodes: probe.masters?.[nodeId]?.glyphTextNodes ?? [],
        sampledVariant: defaultVariantId,
        nodes: deep ? collectNodeFacts(deep) : [],
      });
    }

    if (components.length === 0) throw new Error('no components captured');

    const snapshot = {
      meta: {
        fileKey: FILE_KEY,
        fileName: status?.details?.fileName ?? 'Atelier UI',
        figmaLastModified,
        generatedAt: new Date().toISOString(),
        gitSha: gitSha(),
        serverVersion,
        coverage: `All ${components.length} masters. Token/auto-layout checks sample each master's default variant.`,
        note: 'Facts captured from Figma via figma-console MCP read-tools. Rules live in check-figma.js.',
      },
      uiTokens,
      typography: probe.typography ?? null,
      components,
    };
    writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n');
    console.log(`✓ wrote ${components.length} master(s) to ${OUT}`);
  } finally {
    await client.close();
  }
}

// ---------------------------------------------------------------------------
// MCP helper — figma-console returns JSON inside a text content block.
// ---------------------------------------------------------------------------
async function call(client, name, args) {
  const res = await client.callTool({ name, arguments: args });
  const text = res?.content?.find((c) => c.type === 'text')?.text ?? '';
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${name} returned non-JSON output`);
  }
}

function isConnected(status) {
  return Boolean(
    status?.connected ||
      status?.plugin?.connected ||
      status?.details?.plugin?.connected ||
      status?.probeResult?.success ||
      // figma-console-mcp >= 1.35 moved the probe result under `setup` and
      // reports the live transport under `transport.websocket.available`.
      status?.setup?.probeResult?.success ||
      status?.setup?.valid ||
      status?.transport?.websocket?.available
  );
}

// ---------------------------------------------------------------------------
// Shape helpers
// ---------------------------------------------------------------------------

/** "Action/AtlButton" -> "AtlButton" (strip section path prefix). */
function leafName(name) {
  return String(name || '').split('/').pop().trim();
}

/** componentPropertyDefinitions -> { variant: [...], size: [...] } (VARIANT only). */
function variantAxesOf(defs) {
  const axes = {};
  for (const [key, def] of Object.entries(defs || {})) {
    if (def?.type === 'VARIANT' && Array.isArray(def.variantOptions)) {
      axes[key] = def.variantOptions;
    }
  }
  return axes;
}

/** "variant=primary, size=md, state=default" -> { variant:'primary', size:'md', state:'default' }. */
function parseVariantName(name) {
  if (!name || !name.includes('=')) return null;
  const out = {};
  for (const part of name.split(',')) {
    const [k, v] = part.split('=').map((s) => s.trim());
    if (k && v !== undefined) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

/** Pick the variant child whose axes are all the default values (else first child). */
function pickDefaultVariant(comp, variantAxes) {
  const defaults = {};
  for (const [key, def] of Object.entries(comp.componentPropertyDefinitions || {})) {
    if (def?.type === 'VARIANT' && def.defaultValue !== undefined) defaults[key] = def.defaultValue;
  }
  const children = comp.children ?? [];
  const match = children.find((c) => {
    const ax = parseVariantName(c.name);
    return ax && Object.keys(variantAxes).every((k) => String(ax[k]) === String(defaults[k]));
  });
  return (match ?? children[0])?.id ?? null;
}

// ---------------------------------------------------------------------------
// Node-fact extraction — walk the deep tree and record bound/unbound/raw facts.
// ---------------------------------------------------------------------------
const SPACING_KEYS = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing'];

function collectNodeFacts(root) {
  const out = [];
  walk(root, out);
  return out;
}

function walk(node, out) {
  if (!node) return;
  // Hidden nodes are walked, not skipped. A Figma Boolean's ONLY mechanism is
  // toggling `visible`, so every node a Boolean switches on is hidden by default —
  // which made the overlays the single blind spot of the token gate: 34
  // `_invalid-border` rectangles carried a raw stroke colour and none of them was
  // ever reported (ADR-0061). What a property turns on has to be checked while it
  // is off.
  const hidden = node.visible === false || node._hidden === true;
  const children = Array.isArray(node.children) ? node.children : [];
  const bound = node.boundVariables || {};

  const rawColors = [];
  for (const paint of [...(node.fills || []), ...(node.strokes || [])]) {
    if (paint?.type === 'SOLID' && paint.visible !== false && !paint.boundVariables?.color) {
      rawColors.push(toHex(paint.color));
    }
  }

  const radiusBound = bound.cornerRadius || bound.topLeftRadius || bound.topRightRadius || bound.bottomLeftRadius || bound.bottomRightRadius;
  const unboundRadius = typeof node.cornerRadius === 'number' && node.cornerRadius > 0 && !radiusBound ? node.cornerRadius : 0;

  const unboundSpacing = [];
  if (node.layoutMode && node.layoutMode !== 'NONE') {
    for (const key of SPACING_KEYS) {
      if (typeof node[key] === 'number' && node[key] > 0 && !bound[key]) unboundSpacing.push(key);
    }
  }

  const nonSemanticTokens = [];
  for (const entry of Object.values(bound)) {
    const list = Array.isArray(entry) ? entry : [entry];
    for (const v of list) {
      // Both the semantic UI tier and the component tier (ADR-0018:
      // Primitive→UI→Component) are legitimate binding targets for
      // component chrome — only direct primitive COLOR bindings are
      // flagged. Dimension primitives (spacing/*, radius/*, icon-stroke/*)
      // have no higher-tier equivalent: the scale itself is the semantic
      // layer, so binding to them is correct, not a smell.
      if (
        v?.collection &&
        !['Library Tokens', 'Component Tokens'].includes(v.collection) &&
        v.name &&
        !/^(spacing|radius|icon-stroke)\//.test(v.name)
      )
        nonSemanticTokens.push(v.name);
    }
  }

  const hasChildren = children.length > 0;
  const relevant = rawColors.length || unboundRadius || unboundSpacing.length || nonSemanticTokens.length || hasChildren;
  if (relevant) {
    out.push({
      name: node.name,
      type: node.type,
      hasChildren,
      hidden,
      layoutMode: node.layoutMode || 'NONE',
      rawColors,
      unboundRadius,
      unboundSpacing,
      nonSemanticTokens,
    });
  }
  for (const child of children) walk(child, out);
}

function toHex(c) {
  if (!c) return '#000000';
  const h = (n) => Math.round((n ?? 0) * 255).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

function gitSha() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}
