import React, { useState, useRef, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import type { Framework, McpTool } from './-mcp.types';
import { TOOL_DEFS } from './-mcp.data';
import { getToolResponse } from './-mcp.utils';
import { CodeBlock } from './-mcp-code-block';
import { fetchMcpTools, invokeMcpTool, LIVE_DEFAULT_PARAMS } from './-mcp.client';

export const Route = createFileRoute('/mcp')({
  component: McpPage,
});

const FRAMEWORK_COLORS: Record<Framework, string> = {
  angular: '#e23237',
  react:   '#61dafb',
  vue:     '#42b883',
};

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

const PROTOCOL_STEPS = [
  {
    n: '00',
    label: 'Connect',
    desc: 'Host sends initialize with capabilities. Server responds with its tool list.',
  },
  {
    n: '01',
    label: 'Identify need',
    desc: 'Model decides a tool call will give a more reliable answer than training data alone.',
  },
  {
    n: '02',
    label: 'Call server',
    desc: 'Structured request is sent — tool name plus typed parameters, no ambiguity.',
  },
  {
    n: '03',
    label: 'Receive JSON',
    desc: 'Exact prop names, types, and defaults come back. No hallucinated APIs.',
  },
] as const;

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

  const activeLiveTool = liveTools?.find(t => t.name === selectedTool);
  const activeMockTool = TOOL_DEFS.find(t => t.name === selectedTool) ?? TOOL_DEFS[0];

  useEffect(() => {
    let cancelled = false;
    fetchMcpTools(framework)
      .then(tools => {
        if (cancelled) return;
        setLiveTools(tools);
        setServerOnline(true);
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

  const toolList = liveTools ?? TOOL_DEFS.map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: { properties: {} },
  } as McpTool));

  const activeParams: Array<{ name: string; type: string; description: string; suggestions: string[] }> =
    activeLiveTool
      ? Object.entries(activeLiveTool.inputSchema.properties ?? {}).map(([name, p]) => ({
          name,
          type: p.type,
          description: p.description ?? '',
          suggestions: p.enum ?? [],
        }))
      : activeMockTool.params;

  const fwColor = FRAMEWORK_COLORS[framework];

  return (
    <div className="docs-inline-page" style={{ maxWidth: '980px' }}>
      <style>{`
        .mcp-grid { display: grid; grid-template-columns: 210px 1fr; gap: 1.5rem; align-items: start; }
        @media (max-width: 680px) { .mcp-grid { grid-template-columns: 1fr; } }

        .mcp-tool-btn { transition: background 0.12s, color 0.12s; }
        .mcp-tool-btn:hover { background: rgba(68,218,218,0.06) !important; color: var(--ui-color-primary) !important; }

        .mcp-param-input { transition: border-color 0.15s, background 0.15s; }
        .mcp-param-input:focus { border-color: var(--ui-color-primary) !important; background: var(--ui-color-surface-raised) !important; outline: none; }

        .mcp-chip:hover { opacity: 0.85; }

        .mcp-call-btn { transition: opacity 0.15s, box-shadow 0.2s; }
        .mcp-call-btn:not(:disabled):hover { opacity: 0.9; }

        @keyframes mcp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .mcp-protocol-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .mcp-protocol-step-divider {
          padding-right: 1rem;
          padding-left: 1rem;
          border-left: 1px solid rgba(64,72,93,0.25);
        }
        .mcp-protocol-step-first {
          padding-right: 1rem;
        }
        .mcp-protocol-step-last {
          padding-left: 1rem;
          border-left: 1px solid rgba(64,72,93,0.25);
        }
        @media (max-width: 680px) {
          .mcp-protocol-steps {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .mcp-protocol-step-divider,
          .mcp-protocol-step-first,
          .mcp-protocol-step-last {
            padding-left: 0 !important;
            padding-right: 0 !important;
            border-left: none !important;
          }
        }
        @media (max-width: 420px) {
          .mcp-protocol-steps { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          margin: '0 0 0.6rem',
          background: 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          MCP Playground
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '560px', lineHeight: '1.65' }}>
          Explore the component library MCP server. Select a tool, provide parameters,
          and call it to see exactly what structured data an AI receives.
        </p>
      </div>

      {/* ── Framework switcher ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)', marginRight: '0.25rem' }}>
            Server
          </span>
          {(['angular', 'react', 'vue'] as Framework[]).map(fw => {
            const active = framework === fw;
            const color = FRAMEWORK_COLORS[fw];
            return (
              <button
                key={fw}
                onClick={() => switchFramework(fw)}
                className="mcp-chip"
                style={{
                  padding: '0.3rem 0.85rem',
                  borderRadius: 'var(--ui-radius-md)',
                  border: 'none',
                  background: active ? `${color}22` : 'transparent',
                  color: active ? color : 'var(--ui-color-text-muted)',
                  cursor: 'pointer',
                  fontWeight: active ? '700' : '500',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.01em',
                }}
              >
                {fw.charAt(0).toUpperCase() + fw.slice(1)}
              </button>
            );
          })}
          <span style={{
            marginLeft: '0.5rem',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            color: 'var(--ui-color-text-muted)',
            opacity: 0.7,
          }}>
            @atelier-ui/{framework}
          </span>
          <span style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.7rem',
            fontWeight: '700',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: serverOnline ? '#34d399' : 'var(--ui-color-text-muted)',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: serverOnline ? '#34d399' : 'var(--ui-color-text-muted)',
              display: 'inline-block',
              animation: serverOnline ? 'none' : undefined,
            }} />
            {serverOnline ? 'Live' : 'Demo'}
          </span>
        </div>
      </div>

      {/* ── Angular parity note ── */}
      {framework === 'angular' && (
        <div style={{
          padding: '0.85rem 1.1rem',
          background: 'rgba(68,218,218,0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 'var(--ui-radius-md)',
          border: '1px solid rgba(68,218,218,0.1)',
          marginBottom: '1.75rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', margin: 0, lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--ui-color-text)' }}>Note:</strong> The Angular MCP server currently supports documentation tools only. Full story previews and test tools are available for React and Vue.
          </p>
        </div>
      )}

      {/* ── Protocol flow ── */}
      <div className="mcp-protocol-steps" style={{
        background: 'var(--ui-color-surface-sunken)',
        borderRadius: 'var(--ui-radius-md)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
      }}>
        {PROTOCOL_STEPS.map((s, i) => (
          <div key={i} className={i === 0 ? 'mcp-protocol-step-first' : i === PROTOCOL_STEPS.length - 1 ? 'mcp-protocol-step-last' : 'mcp-protocol-step-divider'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{
                fontSize: '0.62rem',
                fontFamily: 'monospace',
                fontWeight: '700',
                color: 'var(--ui-color-primary)',
                background: 'rgba(68,218,218,0.12)',
                padding: '0.1rem 0.35rem',
                borderRadius: '3px',
                letterSpacing: '0.04em',
              }}>{s.n}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--ui-color-text)', letterSpacing: '-0.01em' }}>
                {s.label}
              </span>
            </div>
            <p style={{ fontSize: '0.71rem', color: 'var(--ui-color-text-muted)', margin: 0, lineHeight: '1.5' }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── Main grid: tool list + tool panel ── */}
      <div className="mcp-grid">

        {/* Tool list sidebar */}
        <div style={{
          background: 'var(--ui-color-surface-sunken)',
          borderRadius: 'var(--ui-radius-md)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '0.65rem 0.85rem 0.5rem',
            fontSize: '0.62rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--ui-color-text-muted)',
          }}>
            Tools
          </div>
          {toolList.map(tool => {
            const active = selectedTool === tool.name;
            const mockTool = TOOL_DEFS.find(t => t.name === tool.name);
            const supported = !mockTool?.supportedFrameworks || mockTool.supportedFrameworks.includes(framework);

            return (
              <button
                key={tool.name}
                onClick={() => selectTool(tool.name)}
                className="mcp-tool-btn"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.55rem 0.85rem 0.55rem 0.75rem',
                  border: 'none',
                  borderLeft: `3px solid ${active ? 'var(--ui-color-primary)' : 'transparent'}`,
                  background: active ? 'rgba(68,218,218,0.07)' : 'transparent',
                  color: active ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  fontWeight: active ? '700' : '400',
                  opacity: supported ? 1 : 0.45,
                  letterSpacing: '0.01em',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tool.name}</span>
                  {!supported && (
                    <span style={{
                      fontSize: '0.55rem',
                      background: 'var(--ui-color-surface)',
                      padding: '0.1rem 0.3rem',
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}>
                      N/A
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tool panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Tool header — AI surface */}
          <div style={{
            background: 'rgba(68,218,218,0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(68,218,218,0.1)',
            borderRadius: 'var(--ui-radius-md)',
            padding: '1rem 1.25rem',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.3rem', lineHeight: 1.3 }}>
              <span style={{ color: 'var(--ui-color-primary)' }}>{selectedTool}</span>
              <span style={{ color: 'var(--ui-color-text-muted)', fontWeight: '400', fontSize: '0.82rem' }}>
                {activeLiveTool ? liveSignature(activeLiveTool) : activeMockTool.signature}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', margin: 0, lineHeight: '1.6' }}>
              {activeLiveTool ? activeLiveTool.description : activeMockTool.description}
            </p>
            {!activeLiveTool && (
              <div style={{
                marginTop: '0.85rem',
                padding: '0.55rem 0.85rem',
                background: 'rgba(166,214,68,0.06)',
                borderRadius: 'var(--ui-radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--ui-color-text-muted)',
                lineHeight: '1.55',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
              }}>
                <span style={{ color: 'var(--docs-tertiary, #a6d644)', flexShrink: 0 }}>💡</span>
                <span>{activeMockTool.workshopTip}</span>
              </div>
            )}
          </div>

          {/* Parameters */}
          {activeParams.length > 0 && (
            <div style={{
              background: 'var(--ui-color-surface-raised)',
              borderRadius: 'var(--ui-radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ fontSize: '0.62rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ui-color-text-muted)' }}>
                Parameters
              </div>
              {activeParams.map(param => (
                <div key={param.name}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: '700', color: 'var(--ui-color-text)' }}>
                      {param.name}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--docs-secondary, #89ceff)' }}>
                      {param.type}
                    </span>
                    {param.description && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--ui-color-text-muted)' }}>
                        — {param.description}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={params[param.name] ?? ''}
                    onChange={e => {
                      setParams(p => ({ ...p, [param.name]: e.target.value }));
                      setResponse(null);
                      setResponseVisible(false);
                    }}
                    className="mcp-param-input"
                    style={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--ui-radius-sm)',
                      border: '1px solid transparent',
                      background: 'var(--ui-color-surface-sunken)',
                      color: 'var(--ui-color-text)',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    }}
                    placeholder={param.suggestions[0] ?? ''}
                  />
                  {param.suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                      {param.suggestions.map(s => {
                        const isActive = params[param.name] === s;
                        return (
                          <button
                            key={s}
                            onClick={() => {
                              setParams(p => ({ ...p, [param.name]: s }));
                              setResponse(null);
                              setResponseVisible(false);
                            }}
                            className="mcp-chip"
                            style={{
                              padding: '0.15rem 0.55rem',
                              borderRadius: 'var(--ui-radius-sm)',
                              border: 'none',
                              background: isActive ? 'rgba(68,218,218,0.12)' : 'var(--ui-color-surface-sunken)',
                              color: isActive ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
                              cursor: 'pointer',
                              fontFamily: 'monospace',
                              fontSize: '0.72rem',
                              fontWeight: isActive ? '600' : '400',
                            }}
                          >
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
              className="mcp-call-btn"
              style={{
                padding: '0.55rem 1.75rem',
                borderRadius: 'var(--ui-radius-md)',
                border: 'none',
                background: calling
                  ? 'var(--ui-color-surface-raised)'
                  : 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
                color: calling ? 'var(--ui-color-text-muted)' : '#09141d',
                cursor: calling ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                letterSpacing: '0.03em',
                boxShadow: calling
                  ? '0 0 20px rgba(68,218,218,0.25)'
                  : 'none',
                animation: calling ? 'mcp-pulse 1.4s ease-in-out infinite' : 'none',
              }}
            >
              {calling ? '··· calling' : '▶  call'}
            </button>
          </div>

          {/* tool_call block */}
          {request && (
            <div style={{
              opacity: requestVisible ? 1 : 0,
              transform: requestVisible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}>
              <CodeBlock
                code={JSON.stringify(request, null, 2)}
                label="tool_call"
                labelColor="var(--ui-color-primary)"
              />
            </div>
          )}

          {/* tool_result block */}
          {response && (
            <div style={{
              opacity: responseVisible ? 1 : 0,
              transform: responseVisible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}>
              <CodeBlock
                code={JSON.stringify(response, null, 2)}
                label="tool_result"
                labelColor="#34d399"
                collapsible
              />
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'rgba(68,218,218,0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(68,218,218,0.08)',
                borderRadius: 'var(--ui-radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--ui-color-text-muted)',
                lineHeight: '1.6',
              }}>
                <strong style={{ color: 'var(--ui-color-text)', fontWeight: '700' }}>What the AI does next:</strong>{' '}
                this JSON is injected into the model's context. It reads the exact field names, types, and defaults — and uses them verbatim when generating code. No guessing, no hallucinated prop names.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Use with AI tools ── */}
      <div style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(64,72,93,0.2)' }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          marginBottom: '0.4rem',
          background: 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Use with AI tools
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ui-color-text-muted)', marginBottom: '1.75rem', lineHeight: '1.65' }}>
          The MCP servers are live. Add them to your AI tool's config and every tool shown above works directly — Claude, Cursor, and any MCP-compatible host.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--ui-color-text)' }}>Claude Desktop</span>
              <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--docs-secondary, #89ceff)' }}>
                ~/Library/Application Support/Claude/claude_desktop_config.json
              </span>
            </div>
            <CodeBlock
              label="claude_desktop_config.json"
              labelColor="var(--ui-color-text-muted)"
              code={JSON.stringify({
                mcpServers: {
                  'atelier-ui-angular': { url: 'https://atelier-ui.netlify.app/storybook-angular/mcp' },
                  'atelier-ui-react':   { url: 'https://atelier-ui.netlify.app/storybook-react/mcp' },
                  'atelier-ui-vue':     { url: 'https://atelier-ui.netlify.app/storybook-vue/mcp' },
                },
              }, null, 2)}
            />
          </div>
          <div>
            <div style={{ marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--ui-color-text)' }}>Cursor / VS Code</span>
              <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--docs-secondary, #89ceff)' }}>
                .cursor/mcp.json · .vscode/mcp.json
              </span>
            </div>
            <CodeBlock
              label="mcp.json"
              labelColor="var(--ui-color-text-muted)"
              code={JSON.stringify({
                servers: {
                  'atelier-ui-angular': { type: 'http', url: 'https://atelier-ui.netlify.app/storybook-angular/mcp' },
                  'atelier-ui-react':   { type: 'http', url: 'https://atelier-ui.netlify.app/storybook-react/mcp' },
                  'atelier-ui-vue':     { type: 'http', url: 'https://atelier-ui.netlify.app/storybook-vue/mcp' },
                },
              }, null, 2)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
