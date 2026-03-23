import React, { useState, useRef, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import type { Framework, McpTool } from './mcp.types';
import { TOOL_DEFS } from './mcp.data';
import { getToolResponse } from './mcp.utils';
import { CodeBlock } from './mcp-code-block';
import { fetchMcpTools, invokeMcpTool, LIVE_DEFAULT_PARAMS } from './mcp.client';

export const Route = createFileRoute('/mcp')({
  component: McpPage,
});

// Build a signature string from a live tool's inputSchema
function liveSignature(tool: McpTool): string {
  const props = tool.inputSchema.properties ?? {};
  const required = new Set(tool.inputSchema.required ?? []);
  const parts = Object.entries(props).map(([name, p]) => {
    const suffix = required.has(name) ? '' : '?';
    return `${name}${suffix}: ${p.type}`;
  });
  return parts.length ? `(${parts.join(', ')})` : '()';
}

function McpPage() {
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

  // Derived: active tool — live or mock
  const activeLiveTool = liveTools?.find(t => t.name === selectedTool);
  const activeMockTool = TOOL_DEFS.find(t => t.name === selectedTool) ?? TOOL_DEFS[0];

  // Fetch real tools on mount and when framework changes
  useEffect(() => {
    let cancelled = false;
    fetchMcpTools(framework)
      .then(tools => {
        if (cancelled) return;
        setLiveTools(tools);
        setServerOnline(true);
        // Auto-select first real tool
        if (tools.length > 0) {
          const first = tools[0];
          setSelectedTool(first.name);
          setParams(LIVE_DEFAULT_PARAMS[first.name] ?? {});
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLiveTools(null);
        setServerOnline(false);
      });
    return () => { cancelled = true; };
  }, [framework]);

  function selectTool(name: string) {
    setSelectedTool(name);
    if (serverOnline && liveTools) {
      setParams(LIVE_DEFAULT_PARAMS[name] ?? {});
    } else {
      const tool = TOOL_DEFS.find(t => t.name === name) ?? TOOL_DEFS[0];
      setParams({ ...tool.defaultParams });
    }
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
        setResponse(getToolResponse(selectedTool, params, framework));
        setCalling(false);
        requestAnimationFrame(() => requestAnimationFrame(() => setResponseVisible(true)));
      }, 350);
    }
  }

  useEffect(() => () => { if (callTimer.current) clearTimeout(callTimer.current); }, []);

  // Which tools to render in sidebar
  const toolList = liveTools ?? TOOL_DEFS.map(t => ({ name: t.name, description: t.description, inputSchema: { properties: {} } } as McpTool));

  // Params list for the active tool
  const activeParams: Array<{ name: string; type: string; description: string; suggestions: string[] }> =
    activeLiveTool
      ? Object.entries(activeLiveTool.inputSchema.properties ?? {}).map(([name, p]) => ({
          name,
          type: p.type,
          description: p.description ?? '',
          suggestions: p.enum ?? [],
        }))
      : activeMockTool.params;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem' }}>
      <style>{`
        .mcp-grid { display: grid; grid-template-columns: 200px 1fr; gap: 1.5rem; align-items: start; }
        @media (max-width: 680px) { .mcp-grid { grid-template-columns: 1fr; } }
        .mcp-tool-btn:hover { background: rgba(0,190,190,0.04) !important; color: var(--ui-color-primary) !important; }
        .mcp-chip:hover { border-color: var(--ui-color-primary) !important; color: var(--ui-color-primary) !important; }
        .mcp-input:focus { border-color: var(--ui-color-primary) !important; outline: none; }
      `}</style>

      <div className="docs-page-header">
        <h1 className="docs-page-title">MCP Playground</h1>
        <p className="docs-page-description">
          Explore the component library MCP server. Select a tool, provide parameters,
          and call it to see exactly what structured data an AI receives.
        </p>
      </div>

      {/* Server switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ui-color-text-muted)', marginRight: '0.25rem' }}>Server:</span>
        {(['angular', 'react', 'vue'] as Framework[]).map(fw => {
          const active = framework === fw;
          return (
            <button key={fw} onClick={() => switchFramework(fw)} style={{ padding: '0.35rem 0.9rem', borderRadius: 'var(--ui-radius-md)', border: `2px solid ${active ? 'var(--ui-color-primary)' : 'var(--ui-color-border)'}`, background: active ? 'var(--ui-color-primary)' : 'transparent', color: active ? 'var(--ui-color-text-on-primary)' : 'var(--ui-color-text)', cursor: 'pointer', fontWeight: active ? '600' : '400', fontSize: '0.875rem', transition: 'all 0.15s' }}>
              {fw.charAt(0).toUpperCase() + fw.slice(1)}
            </button>
          );
        })}
        <code style={{ marginLeft: '0.25rem', fontSize: '0.78rem', color: 'var(--ui-color-text-muted)', fontFamily: 'monospace' }}>
          @atelier-ui/{framework}
        </code>
        {/* Live / Demo badge */}
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: '600', color: serverOnline ? '#059669' : 'var(--ui-color-text-muted)' }}>
          {serverOnline ? '● Live' : '○ Demo'}
        </span>
      </div>

      {/* Protocol flow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--ui-color-surface-raised)', border: '1px solid var(--ui-color-border)', borderRadius: 'var(--ui-radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
        {([
          { n: '⓪', label: 'Client connects', desc: 'The host sends initialize with its capabilities. The server responds with its tool list. This negotiation happens once per session.' },
          { n: '①', label: 'AI identifies need', desc: 'The model decides a tool call will give a more reliable answer than its training data alone.' },
          { n: '②', label: 'Calls the MCP server', desc: 'A structured request is sent — tool name plus typed parameters, no ambiguity.' },
          { n: '③', label: 'Receives structured JSON', desc: 'Exact prop names, types, and defaults come back. No hallucinated APIs.' },
        ] as const).map((s, i) => (
          <div key={i} style={{ padding: '0.85rem 1rem', borderRight: i < 3 ? '1px solid var(--ui-color-border)' : 'none' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--ui-color-primary)', marginBottom: '0.25rem' }}>{s.n} {s.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.45' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="mcp-grid">
        {/* Tool list */}
        <div style={{ background: 'var(--ui-color-surface-raised)', border: '1px solid var(--ui-color-border)', borderRadius: 'var(--ui-radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--ui-color-border)', fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)' }}>
            Tools
          </div>
          {toolList.map(tool => {
            const active = selectedTool === tool.name;
            return (
              <button key={tool.name} onClick={() => selectTool(tool.name)} className="mcp-tool-btn" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', border: 'none', borderLeft: `3px solid ${active ? 'var(--ui-color-primary)' : 'transparent'}`, background: active ? 'rgba(0,190,190,0.06)' : 'transparent', color: active ? 'var(--ui-color-primary)' : 'var(--ui-color-text)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: active ? '600' : '400', transition: 'all 0.1s' }}>
                {tool.name}
              </button>
            );
          })}
        </div>

        {/* Tool panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tool header */}
          <div style={{ background: 'var(--ui-color-surface-raised)', border: '1px solid var(--ui-color-border)', borderRadius: 'var(--ui-radius-md)', padding: '1rem 1.25rem' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: '600', color: 'var(--ui-color-primary)', marginBottom: '0.2rem' }}>
              {selectedTool}
              <span style={{ color: 'var(--ui-color-text-muted)', fontWeight: '400' }}>
                {activeLiveTool ? liveSignature(activeLiveTool) : activeMockTool.signature}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.5' }}>
              {activeLiveTool ? activeLiveTool.description : activeMockTool.description}
            </div>
            {!activeLiveTool && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(0,190,190,0.04)', border: '1px solid rgba(0,190,190,0.15)', borderRadius: 'var(--ui-radius-sm)', fontSize: '0.75rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.5' }}>
                💡 {activeMockTool.workshopTip}
              </div>
            )}
          </div>

          {/* Parameters */}
          {activeParams.length > 0 && (
            <div style={{ background: 'var(--ui-color-surface-raised)', border: '1px solid var(--ui-color-border)', borderRadius: 'var(--ui-radius-md)', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)', marginBottom: '0.85rem' }}>
                Parameters
              </div>
              {activeParams.map(param => (
                <div key={param.name}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: '600', color: 'var(--ui-color-text)' }}>{param.name}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--ui-color-text-muted)' }}>{param.type}</span>
                    {param.description && <span style={{ fontSize: '0.75rem', color: 'var(--ui-color-text-muted)' }}>— {param.description}</span>}
                  </div>
                  <input
                    type="text"
                    value={params[param.name] ?? ''}
                    onChange={e => { setParams(p => ({ ...p, [param.name]: e.target.value })); setResponse(null); setResponseVisible(false); }}
                    className="mcp-input"
                    style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '0.45rem 0.75rem', borderRadius: 'var(--ui-radius-sm)', border: '1px solid var(--ui-color-input-border)', background: 'var(--ui-color-input-bg)', color: 'var(--ui-color-text)', fontFamily: 'monospace', fontSize: '0.85rem', transition: 'border-color 0.15s' }}
                    placeholder={param.suggestions[0] ?? ''}
                  />
                  {param.suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                      {param.suggestions.map(s => {
                        const active = params[param.name] === s;
                        return (
                          <button key={s} onClick={() => { setParams(p => ({ ...p, [param.name]: s })); setResponse(null); setResponseVisible(false); }} className="mcp-chip" style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', border: `1px solid ${active ? 'var(--ui-color-primary)' : 'var(--ui-color-border)'}`, background: active ? 'rgba(0,190,190,0.08)' : 'transparent', color: active ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.72rem', transition: 'all 0.1s' }}>
                            {s}
                          </button>
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
            <button
              onClick={handleCall}
              disabled={calling}
              style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--ui-radius-md)', border: 'none', background: calling ? 'var(--ui-color-surface-sunken)' : 'var(--ui-color-primary)', color: calling ? 'var(--ui-color-text-muted)' : 'var(--ui-color-text-on-primary)', cursor: calling ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.15s' }}
            >
              {calling ? '··· Calling…' : '▶  Call'}
            </button>
          </div>

          {/* tool_call — appears immediately when Call is clicked */}
          {request && (
            <div style={{ opacity: requestVisible ? 1 : 0, transform: requestVisible ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.2s ease, transform 0.2s ease' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-primary)', marginBottom: '0.4rem' }}>
                tool_call
              </div>
              <CodeBlock code={JSON.stringify(request, null, 2)} />
            </div>
          )}

          {/* tool_result — fades in after response */}
          {response && (
            <div style={{ opacity: responseVisible ? 1 : 0, transform: responseVisible ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#059669', marginBottom: '0.4rem' }}>
                tool_result
              </div>
              <CodeBlock code={JSON.stringify(response, null, 2)} collapsible />
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: 'var(--ui-color-surface-raised)', border: '1px solid var(--ui-color-border)', borderRadius: 'var(--ui-radius-sm)', fontSize: '0.75rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--ui-color-text)', fontWeight: '600' }}>What the AI does next:</strong> this JSON is injected into the model's context. It reads the exact field names, types, and defaults — and uses them verbatim when generating code. No guessing, no hallucinated prop names.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Use with AI tools */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--ui-color-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem' }}>Use with AI tools</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--ui-color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          The <code>@atelier-ui/mcp</code> server package is coming. Once published, add it to your AI tool's config and every tool shown above works live — Claude, Cursor, and any MCP-compatible host.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--ui-color-text-muted)', marginBottom: '0.5rem' }}>
              Claude Desktop <span style={{ fontWeight: '400', fontFamily: 'monospace' }}>~/Library/Application Support/Claude/claude_desktop_config.json</span>
            </div>
            <CodeBlock code={JSON.stringify({
              mcpServers: {
                'atelier-ui': {
                  command: 'npx',
                  args: ['-y', '@atelier-ui/mcp'],
                },
              },
            }, null, 2)} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--ui-color-text-muted)', marginBottom: '0.5rem' }}>
              Cursor / VS Code <span style={{ fontWeight: '400', fontFamily: 'monospace' }}>.cursor/mcp.json &nbsp;·&nbsp; .vscode/mcp.json</span>
            </div>
            <CodeBlock code={JSON.stringify({
              servers: {
                'atelier-ui': {
                  type: 'stdio',
                  command: 'npx',
                  args: ['-y', '@atelier-ui/mcp'],
                },
              },
            }, null, 2)} />
          </div>
        </div>
      </div>
    </div>
  );
}
