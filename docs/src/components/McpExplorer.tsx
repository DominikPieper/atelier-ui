import { useState, useRef, useEffect } from 'react';

type Framework = 'angular' | 'react' | 'vue';

const SITE_URL = 'https://atelier.pieper.io';

const FRAMEWORK_COLORS: Record<Framework, string> = {
  angular: '#e23237', react: '#61dafb', vue: '#42b883',
};

interface ToolDef {
  name: string;
  signature: string;
  description: string;
  workshopTip: string;
  params: Array<{ name: string; type: string; description: string; suggestions: string[] }>;
  defaultParams: Record<string, string>;
  supportedFrameworks?: Framework[];
}

const ALL_COMPONENT_SLUGS = [
  'button', 'badge', 'input', 'textarea', 'select', 'checkbox', 'toggle',
  'dialog', 'drawer', 'tooltip', 'toast', 'card', 'alert', 'tabs',
  'accordion', 'avatar', 'skeleton', 'progress', 'breadcrumbs', 'pagination', 'menu', 'radio-group',
];

const TOOL_DEFS: ToolDef[] = [
  {
    name: 'get_component_docs',
    signature: '(component: string)',
    description: 'Returns the full API for a component — inputs, outputs, types, defaults, and integration notes.',
    workshopTip: 'Called when a user asks about a specific component. The AI gets exact prop names, types, and defaults — so it writes correct code instead of guessing the API.',
    params: [{ name: 'component', type: 'string', description: 'Component slug', suggestions: ALL_COMPONENT_SLUGS }],
    defaultParams: { component: 'button' },
  },
  {
    name: 'list_components',
    signature: '()',
    description: 'Returns all available components grouped by category.',
    workshopTip: 'Called at the start of a session or when the user asks "what components are available?". Gives the AI a full map of the library before diving into specifics.',
    params: [],
    defaultParams: {},
  },
  {
    name: 'search_components',
    signature: '(query: string)',
    description: 'Fuzzy-search components by keyword. Returns matching names and descriptions.',
    workshopTip: 'Called when the user expresses an intent rather than naming a specific component. Helps the AI match need to component.',
    params: [{ name: 'query', type: 'string', description: 'Search term', suggestions: ['form', 'inputs', 'overlay', 'navigation', 'display', 'feedback', 'modal', 'button'] }],
    defaultParams: { query: 'form' },
  },
  {
    name: 'get_stories',
    signature: '(component: string)',
    description: 'Returns Storybook story metadata for a component — names, descriptions, and variant previews.',
    workshopTip: 'Called when the user wants usage examples. The AI reads the story names and descriptions to show real-world patterns.',
    params: [{ name: 'component', type: 'string', description: 'Component slug', suggestions: ['button', 'dialog', 'alert', 'card', 'select', 'tabs', 'input', 'badge'] }],
    defaultParams: { component: 'button' },
    supportedFrameworks: ['react', 'vue'],
  },
  {
    name: 'get_theming_guide',
    signature: '()',
    description: 'Returns the full CSS custom property reference, token categories, and dark mode setup.',
    workshopTip: 'Called when the user asks about customising colors, spacing, or dark mode. The AI gets the exact token names and values — no hallucinated CSS variable names.',
    params: [],
    defaultParams: {},
  },
];

// Mock responses
const MOCK_RESPONSES: Record<string, (params: Record<string, string>, fw: Framework) => object> = {
  get_component_docs: (params, fw) => {
    const comp = params.component ?? 'button';
    if (fw === 'angular') {
      return {
        component: comp, selector: `llm-${comp}`, package: `@atelier-ui/angular`, type: 'standalone',
        inputs: {
          variant: "'primary' | 'secondary' | 'outline' | 'danger' (default: 'primary')",
          size: "'sm' | 'md' | 'lg' (default: 'md')",
          disabled: 'boolean (default: false)',
          loading: 'boolean (default: false)',
        },
        outputs: { click: 'EventEmitter<void>' },
        content_projection: 'default slot — button label',
      };
    }
    if (fw === 'react') {
      return {
        component: comp, element: `Llm${comp.charAt(0).toUpperCase() + comp.slice(1)}`,
        package: `@atelier-ui/react`,
        props: {
          variant: "'primary' | 'secondary' | 'outline' | 'danger' (default: 'primary')",
          size: "'sm' | 'md' | 'lg' (default: 'md')",
          disabled: 'boolean (default: false)',
          loading: 'boolean (default: false)',
          onClick: '() => void',
        },
        children: 'ReactNode — button label',
      };
    }
    return {
      component: comp, element: `Llm${comp.charAt(0).toUpperCase() + comp.slice(1)}`,
      package: `@atelier-ui/vue`,
      props: {
        variant: "'primary' | 'secondary' | 'outline' | 'danger' (default: 'primary')",
        size: "'sm' | 'md' | 'lg' (default: 'md')",
        disabled: 'boolean (default: false)',
        loading: 'boolean (default: false)',
      },
      emits: { click: 'void' },
      slots: 'default — button label',
    };
  },
  list_components: () => ({
    total: 24,
    categories: {
      Inputs: ['button', 'input', 'textarea', 'checkbox', 'toggle', 'radio-group', 'select', 'combobox'],
      Display: ['badge', 'card', 'avatar', 'skeleton', 'progress', 'table', 'code-block'],
      Navigation: ['breadcrumbs', 'tabs', 'pagination', 'menu', 'stepper'],
      Overlay: ['dialog', 'drawer', 'tooltip', 'toast'],
      Layout: ['accordion', 'alert'],
    },
  }),
  search_components: (params) => {
    const q = (params.query ?? 'form').toLowerCase();
    const MAP: Record<string, string[]> = {
      form: ['input', 'textarea', 'checkbox', 'toggle', 'select', 'radio-group'],
      inputs: ['input', 'textarea', 'checkbox', 'toggle', 'select', 'radio-group'],
      overlay: ['dialog', 'drawer', 'tooltip', 'toast'],
      modal: ['dialog', 'drawer'],
      navigation: ['breadcrumbs', 'tabs', 'pagination', 'menu'],
      display: ['badge', 'card', 'avatar', 'skeleton', 'progress'],
      feedback: ['alert', 'toast', 'skeleton', 'progress'],
      button: ['button'],
    };
    const matches = MAP[q] ?? ['input', 'checkbox', 'toggle'];
    return {
      query: q,
      results: matches.map(name => ({
        name,
        description: `${name.charAt(0).toUpperCase() + name.slice(1)} component — see get_component_docs for full API`,
      })),
    };
  },
  get_stories: (params, fw) => ({
    component: params.component ?? 'button',
    framework: fw,
    story_count: 4,
    stories: [
      { name: 'Default', description: 'Standard usage with default props' },
      { name: 'Variants', description: 'primary, secondary, outline, danger side by side' },
      { name: 'Sizes', description: 'sm / md / lg comparison' },
      { name: 'States', description: 'Loading and disabled states' },
    ],
  }),
  get_theming_guide: () => ({
    tokens: {
      colors: {
        'primary': 'var(--ui-color-primary) — main brand color',
        'primary-light': 'var(--ui-color-primary-light) — tinted background',
        'surface': 'var(--ui-color-surface)',
        'surface-raised': 'var(--ui-color-surface-raised)',
        'text': 'var(--ui-color-text)',
        'text-muted': 'var(--ui-color-text-muted)',
        'border': 'var(--ui-color-border)',
      },
      spacing: { 'radius-sm': '4px', 'radius-md': '8px', 'radius-lg': '12px' },
    },
    dark_mode: 'Set data-theme="dark" on <html> — all tokens switch automatically',
  }),
};

const PROTOCOL_STEPS = [
  { n: '00', label: 'Connect', desc: 'Host sends initialize with capabilities. Server responds with its tool list.' },
  { n: '01', label: 'Identify need', desc: 'Model decides a tool call will give a more reliable answer than training data alone.' },
  { n: '02', label: 'Call server', desc: 'Structured request is sent — tool name plus typed parameters, no ambiguity.' },
  { n: '03', label: 'Receive JSON', desc: 'Exact prop names, types, and defaults come back. No hallucinated APIs.' },
];

interface McpTool {
  name: string;
  description: string;
  inputSchema: { properties?: Record<string, { type: string; description?: string; enum?: string[] }> };
}

async function fetchMcpTools(fw: Framework): Promise<McpTool[]> {
  const url = `${SITE_URL}/storybook-${fw}/mcp`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json() as { result?: { tools?: McpTool[] } };
  return data.result?.tools ?? [];
}

async function invokeMcpTool(fw: Framework, name: string, args: Record<string, string>): Promise<unknown> {
  const url = `${SITE_URL}/storybook-${fw}/mcp`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name, arguments: args } }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json() as { result?: unknown };
  return data.result;
}

function CodePane({ code, label, labelColor = 'var(--ui-color-primary)' }: { code: string; label: string; labelColor?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div style={{ background: 'var(--ui-color-surface-sunken)', borderRadius: 'var(--ui-radius-md)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 700, color: labelColor, letterSpacing: '0.03em' }}>{label}</span>
        <button onClick={copy} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.68rem', color: copied ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)', fontFamily: 'monospace',
        }}>
          {copied ? '✓' : 'copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '0.75rem', overflow: 'auto', maxHeight: '400px', fontSize: '0.78rem', lineHeight: 1.5 }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function McpExplorer() {
  const [framework, setFramework] = useState<Framework>('angular');
  const [selectedTool, setSelectedTool] = useState('get_component_docs');
  const [params, setParams] = useState<Record<string, string>>({ component: 'button' });
  const [request, setRequest] = useState<object | null>(null);
  const [requestVisible, setRequestVisible] = useState(false);
  const [response, setResponse] = useState<object | null>(null);
  const [calling, setCalling] = useState(false);
  const [responseVisible, setResponseVisible] = useState(false);
  const [liveTools, setLiveTools] = useState<McpTool[] | null>(null);
  const [serverOnline, setServerOnline] = useState(false);
  const callTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeMockTool = TOOL_DEFS.find(t => t.name === selectedTool) ?? TOOL_DEFS[0];
  const activeLiveTool = liveTools?.find(t => t.name === selectedTool);

  useEffect(() => {
    let cancelled = false;
    setLiveTools(null);
    setServerOnline(false);
    fetchMcpTools(framework).then(tools => {
      if (cancelled) return;
      setLiveTools(tools);
      setServerOnline(true);
    }).catch(() => {
      if (cancelled) return;
      setServerOnline(false);
    });
    return () => { cancelled = true; };
  }, [framework]);

  function selectTool(name: string) {
    setSelectedTool(name);
    const tool = TOOL_DEFS.find(t => t.name === name) ?? TOOL_DEFS[0];
    setParams({ ...tool.defaultParams });
    setRequest(null);
    setRequestVisible(false);
    setResponse(null);
    setResponseVisible(false);
  }

  function switchFramework(fw: Framework) {
    setFramework(fw);
    setRequest(null);
    setRequestVisible(false);
    setResponse(null);
    setResponseVisible(false);
  }

  function handleCall() {
    if (callTimer.current) clearTimeout(callTimer.current);
    setCalling(true);
    setResponse(null);
    setResponseVisible(false);

    const req = Object.keys(params).length > 0
      ? { name: selectedTool, arguments: params }
      : { name: selectedTool };
    setRequest(req);
    requestAnimationFrame(() => requestAnimationFrame(() => setRequestVisible(true)));

    if (serverOnline) {
      invokeMcpTool(framework, selectedTool, params)
        .then(result => {
          setResponse(result as object);
          setCalling(false);
          requestAnimationFrame(() => requestAnimationFrame(() => setResponseVisible(true)));
        })
        .catch(err => {
          setResponse({ error: String(err) });
          setCalling(false);
          requestAnimationFrame(() => requestAnimationFrame(() => setResponseVisible(true)));
        });
    } else {
      callTimer.current = setTimeout(() => {
        const mockFn = MOCK_RESPONSES[selectedTool];
        setResponse(mockFn ? mockFn(params, framework) : { result: 'ok' });
        setCalling(false);
        requestAnimationFrame(() => requestAnimationFrame(() => setResponseVisible(true)));
      }, 350);
    }
  }

  useEffect(() => () => { if (callTimer.current) clearTimeout(callTimer.current); }, []);

  const toolList = liveTools ?? TOOL_DEFS.map(t => ({ name: t.name, description: t.description, inputSchema: { properties: {} } } as McpTool));

  const activeParams = activeLiveTool
    ? Object.entries(activeLiveTool.inputSchema.properties ?? {}).map(([name, p]) => ({
        name, type: p.type, description: p.description ?? '', suggestions: p.enum ?? [],
      }))
    : activeMockTool.params;

  return (
    <div className="docs-inline-page">
      <style>{`
        .mcp-grid { display: grid; grid-template-columns: 210px 1fr; gap: 1.5rem; align-items: start; }
        @media (max-width: 680px) { .mcp-grid { grid-template-columns: 1fr; } }
        .mcp-protocol-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .mcp-protocol-step { padding: 0 1rem; border-left: 1px solid rgba(64,72,93,0.25); }
        .mcp-protocol-step:first-child { padding-left: 0; border-left: none; }
        .mcp-protocol-step:last-child { padding-right: 0; }
        @media (max-width: 680px) { .mcp-protocol-steps { grid-template-columns: repeat(2, 1fr); gap: 1rem; } .mcp-protocol-step { border-left: none; padding: 0; } }
        @keyframes mcp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="docs-page-h1">MCP Playground</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '560px', lineHeight: '1.65' }}>
          Explore the component library MCP server. Select a tool, provide parameters,
          and call it to see exactly what structured data an AI receives.
        </p>
      </div>

      {/* Framework switcher */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)', marginRight: '0.25rem' }}>
            Server
          </span>
          {(['angular', 'react', 'vue'] as Framework[]).map(fw => {
            const active = framework === fw;
            const color = FRAMEWORK_COLORS[fw];
            return (
              <button key={fw} onClick={() => switchFramework(fw)} style={{
                // Brand-coloured border carries the active cue; the text uses
                // --ui-color-text (AA-safe). Brand colours like #61dafb (React
                // light blue) and #42b883 (Vue green) only hit 1.5–2.4:1 on
                // a light surface as text — they're tuned for their own brand
                // backgrounds, not neutral chrome.
                padding: '0.3rem 0.85rem', borderRadius: 'var(--ui-radius-md)',
                border: active ? `1.5px solid ${color}` : '1.5px solid transparent',
                background: active ? 'var(--ui-color-surface-raised)' : 'transparent',
                color: active ? 'var(--ui-color-text)' : 'var(--ui-color-text-muted)',
                cursor: 'pointer', fontWeight: active ? 700 : 500,
                fontSize: '0.82rem', fontFamily: 'monospace',
              }}>
                {fw.charAt(0).toUpperCase() + fw.slice(1)}
              </button>
            );
          })}
          {/* No opacity — --ui-color-text-muted is already AA-safe (#4f5f7c
           * light, 5.07:1 on surface-sunken). Adding 0.7 opacity composited
           * the colour down to 3.1:1 (axe color-contrast violation). */}
          <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--ui-color-text-muted)' }}>
            @atelier-ui/{framework}
          </span>
          <span style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase',
            letterSpacing: '0.05em', color: serverOnline ? '#34d399' : 'var(--ui-color-text-muted)',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: serverOnline ? '#34d399' : 'var(--ui-color-text-muted)', display: 'inline-block' }} />
            {serverOnline ? 'Live' : 'Demo'}
          </span>
        </div>
      </div>

      {framework === 'angular' && (
        <div style={{
          padding: '0.85rem 1.1rem', background: 'rgba(68,218,218,0.05)',
          borderRadius: 'var(--ui-radius-md)', border: '1px solid rgba(68,218,218,0.1)',
          marginBottom: '1.75rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', margin: 0, lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--ui-color-text)' }}>Note:</strong> The Angular MCP server currently supports documentation tools only. Full story previews and test tools are available for React and Vue.
          </p>
        </div>
      )}

      {/* Protocol flow */}
      <div className="mcp-protocol-steps" style={{
        background: 'var(--ui-color-surface-sunken)', borderRadius: 'var(--ui-radius-md)',
        padding: '1.25rem 1.5rem', marginBottom: '1.75rem',
      }}>
        {PROTOCOL_STEPS.map((s, i) => (
          <div key={i} className="mcp-protocol-step">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{
                fontSize: '0.62rem', fontFamily: 'monospace', fontWeight: 700,
                color: 'var(--ui-color-primary)', background: 'rgba(68,218,218,0.12)',
                padding: '0.1rem 0.35rem', borderRadius: '3px', letterSpacing: '0.04em',
              }}>{s.n}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>{s.label}</span>
            </div>
            <p style={{ fontSize: '0.71rem', color: 'var(--ui-color-text-muted)', margin: 0, lineHeight: '1.5' }}>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="mcp-grid">
        {/* Tool list sidebar */}
        <div style={{ background: 'var(--ui-color-surface-sunken)', borderRadius: 'var(--ui-radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '0.65rem 0.85rem 0.5rem', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ui-color-text-muted)' }}>
            Tools
          </div>
          {toolList.map(tool => {
            const active = selectedTool === tool.name;
            const mockDef = TOOL_DEFS.find(t => t.name === tool.name);
            const supported = !mockDef?.supportedFrameworks || mockDef.supportedFrameworks.includes(framework);
            return (
              <button
                key={tool.name}
                onClick={() => supported && selectTool(tool.name)}
                disabled={!supported}
                aria-disabled={!supported || undefined}
                title={supported ? undefined : `Not supported on ${framework}`}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.55rem 0.85rem 0.55rem 0.75rem', border: 'none',
                  borderLeft: `3px solid ${active ? 'var(--ui-color-primary)' : 'transparent'}`,
                  background: active ? 'rgba(68,218,218,0.07)' : 'transparent',
                  // disabled buttons are exempt from WCAG contrast requirements
                  // (per the disabled-controls exception). The opacity is the
                  // visual "this is unavailable" cue; aria-disabled signals it
                  // to assistive tech. Keep cursor + textDecoration to make
                  // the unavailable state obvious for sighted users too.
                  color: active ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
                  cursor: supported ? 'pointer' : 'not-allowed',
                  fontFamily: 'monospace', fontSize: '0.78rem',
                  fontWeight: active ? 700 : 400,
                  opacity: supported ? 1 : 0.55,
                  textDecoration: supported ? 'none' : 'line-through',
                }}
              >
                {tool.name}
              </button>
            );
          })}
        </div>

        {/* Tool panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tool header */}
          <div style={{
            background: 'rgba(68,218,218,0.05)', border: '1px solid rgba(68,218,218,0.1)',
            borderRadius: 'var(--ui-radius-md)', padding: '1rem 1.25rem',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.3rem' }}>
              <span style={{ color: 'var(--ui-color-primary)' }}>{selectedTool}</span>
              <span style={{ color: 'var(--ui-color-text-muted)', fontWeight: 400, fontSize: '0.82rem' }}>
                {activeMockTool.signature}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', margin: 0, lineHeight: '1.6' }}>
              {activeMockTool.description}
            </p>
            {!serverOnline && (
              <div style={{
                marginTop: '0.85rem', padding: '0.55rem 0.85rem',
                background: 'var(--ui-color-info-bg)', borderRadius: 'var(--ui-radius-sm)',
                fontSize: '0.75rem', color: 'var(--ui-color-info-text)', lineHeight: '1.55',
                display: 'flex', gap: '0.5rem',
              }}>
                <span style={{ color: 'var(--ui-color-info)', flexShrink: 0 }}>💡</span>
                <span>{activeMockTool.workshopTip}</span>
              </div>
            )}
          </div>

          {/* Parameters */}
          {activeParams.length > 0 && (
            <div style={{
              background: 'var(--ui-color-surface-raised)', borderRadius: 'var(--ui-radius-md)',
              padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
            }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ui-color-text-muted)' }}>
                Parameters
              </div>
              {activeParams.map(param => (
                <div key={param.name}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>{param.name}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--docs-secondary, #89ceff)' }}>{param.type}</span>
                    {param.description && <span style={{ fontSize: '0.72rem', color: 'var(--ui-color-text-muted)' }}>— {param.description}</span>}
                  </div>
                  <input
                    type="text"
                    value={params[param.name] ?? ''}
                    onChange={e => { setParams(p => ({ ...p, [param.name]: e.target.value })); setResponse(null); }}
                    style={{
                      display: 'block', width: '100%', boxSizing: 'border-box',
                      padding: '0.45rem 0.75rem', borderRadius: 'var(--ui-radius-sm)',
                      border: '1px solid transparent', background: 'var(--ui-color-surface-sunken)',
                      color: 'var(--ui-color-text)', fontFamily: 'monospace', fontSize: '0.85rem',
                    }}
                    placeholder={param.suggestions[0] ?? ''}
                  />
                  {param.suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                      {param.suggestions.slice(0, 12).map(s => {
                        const isActive = params[param.name] === s;
                        return (
                          <button key={s} onClick={() => { setParams(p => ({ ...p, [param.name]: s })); setResponse(null); }} style={{
                            minHeight: '24px', padding: '0.4rem 0.65rem', borderRadius: 'var(--ui-radius-sm)', border: 'none',
                            background: isActive ? 'var(--ui-color-primary-light)' : 'var(--ui-color-surface-sunken)',
                            color: isActive ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
                            cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: isActive ? 600 : 400,
                          }}>{s}</button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Call button */}
          <div>
            <button onClick={handleCall} disabled={calling} style={{
              padding: '0.55rem 1.75rem', borderRadius: 'var(--ui-radius-md)', border: 'none',
              background: calling ? 'var(--ui-color-surface-raised)' : 'var(--ui-color-primary)',
              color: calling ? 'var(--ui-color-text-muted)' : 'var(--ui-color-text-on-primary)',
              cursor: calling ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace', letterSpacing: '0.03em',
              animation: calling ? 'mcp-pulse 1.4s ease-in-out infinite' : 'none',
            }}>
              {calling ? '··· calling' : '▶  call'}
            </button>
          </div>

          {request && (
            <div style={{ opacity: requestVisible ? 1 : 0, transform: requestVisible ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.2s ease, transform 0.2s ease' }}>
              <CodePane code={JSON.stringify(request, null, 2)} label="tool_call" labelColor="var(--ui-color-primary)" />
            </div>
          )}

          {response && (
            <div style={{ opacity: responseVisible ? 1 : 0, transform: responseVisible ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
              <CodePane code={JSON.stringify(response, null, 2)} label="tool_result" labelColor="#34d399" />
              <div style={{
                marginTop: '0.75rem', padding: '0.75rem 1rem',
                background: 'rgba(68,218,218,0.04)', border: '1px solid rgba(68,218,218,0.08)',
                borderRadius: 'var(--ui-radius-sm)', fontSize: '0.75rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6',
              }}>
                <strong style={{ color: 'var(--ui-color-text)', fontWeight: 700 }}>What the AI does next:</strong>{' '}
                this JSON is injected into the model's context. It reads the exact field names, types, and defaults — and uses them verbatim when generating code. No guessing, no hallucinated prop names.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Use with AI tools */}
      <div style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ui-color-border)' }}>
        <h2 style={{
          fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.4rem',
          color: 'var(--ui-color-primary)',
        }}>Use with AI tools</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ui-color-text-muted)', marginBottom: '1.75rem', lineHeight: '1.65' }}>
          The MCP servers are live. Add them to your AI tool's config and every tool shown above works directly — Claude, Cursor, and any MCP-compatible host.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>Claude Desktop</span>
              <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--docs-secondary, #89ceff)' }}>
                ~/Library/Application Support/Claude/claude_desktop_config.json
              </span>
            </div>
            <CodePane
              label="claude_desktop_config.json"
              labelColor="var(--ui-color-text-muted)"
              code={JSON.stringify({
                mcpServers: {
                  'atelier-ui-angular': { url: `${SITE_URL}/storybook-angular/mcp` },
                  'atelier-ui-react': { url: `${SITE_URL}/storybook-react/mcp` },
                  'atelier-ui-vue': { url: `${SITE_URL}/storybook-vue/mcp` },
                },
              }, null, 2)}
            />
          </div>
          <div>
            <div style={{ marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>Cursor / VS Code</span>
              <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--docs-secondary, #89ceff)' }}>
                .cursor/mcp.json · .vscode/mcp.json
              </span>
            </div>
            <CodePane
              label="mcp.json"
              labelColor="var(--ui-color-text-muted)"
              code={JSON.stringify({
                servers: {
                  'atelier-ui-angular': { type: 'http', url: `${SITE_URL}/storybook-angular/mcp` },
                  'atelier-ui-react': { type: 'http', url: `${SITE_URL}/storybook-react/mcp` },
                  'atelier-ui-vue': { type: 'http', url: `${SITE_URL}/storybook-vue/mcp` },
                },
              }, null, 2)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
