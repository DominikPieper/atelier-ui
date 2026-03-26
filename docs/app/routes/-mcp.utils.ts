import type { Framework } from './-mcp.types';
import { COMP_DOCS, SEARCH_MAP, COMP_META, STORIES_MAP } from './-mcp.data';

export type Token = { text: string; color?: string };

export function getToolResponse(toolName: string, params: Record<string, string>, fw: Framework): object {
  switch (toolName) {
    case 'list_components':
      return {
        total: 22,
        package: `@atelier-ui/${fw}`,
        categories: {
          Inputs:     ['button', 'input', 'textarea', 'checkbox', 'toggle', 'radio-group', 'select'],
          Display:    ['badge', 'card', 'avatar', 'skeleton', 'progress'],
          Navigation: ['breadcrumbs', 'tabs', 'pagination', 'menu'],
          Overlay:    ['dialog', 'drawer', 'tooltip', 'toast'],
          Layout:     ['accordion', 'alert'],
        },
      };

    case 'get_theming_guide':
      return {
        approach: 'CSS custom properties',
        import: `@import '@atelier-ui/${fw}/styles/tokens.css';`,
        token_categories: {
          color:      '20 tokens — primary, semantic, surface, text, border',
          spacing:    '10 tokens — --ui-spacing-1 through --ui-spacing-16',
          radius:     '5 tokens  — sm, md, lg, xl, full',
          typography: '12 tokens — family, size (xs–2xl), weight, line-height',
          shadow:     '4 tokens  — xs, sm, md, lg',
          transition: '3 tokens  — fast (150ms), normal (200ms), slow (300ms)',
        },
        key_tokens: {
          '--ui-color-primary':      '#00bebe',
          '--ui-color-surface':      '#ffffff',
          '--ui-color-surface-raised': '#fafafa',
          '--ui-color-border':       '#e5e7eb',
          '--ui-color-text':         '#0f172a',
          '--ui-color-text-muted':   '#64748b',
          '--ui-radius-md':          '0.5rem',
          '--ui-spacing-4':          '1rem',
        },
        dark_mode: {
          automatic: 'prefers-color-scheme media query — built in',
          explicit:  "Set data-theme='dark' on <html>",
          override:  "Any --ui-* variable can be overridden on :root or a scoped selector",
        },
      };

    case 'get_component_docs': {
      const slug = (params.component ?? '').toLowerCase().replace(/\s+/g, '-');
      const doc = COMP_DOCS[slug];
      if (!doc) return { error: `Component "${params.component ?? ''}" not found`, available: Object.keys(COMP_DOCS) };
      return doc[fw];
    }

    case 'search_components': {
      const q = (params.query ?? '').toLowerCase().trim();
      const key = Object.keys(SEARCH_MAP).find(k => q === k || q.includes(k) || k.includes(q));
      const slugs = key ? SEARCH_MAP[key] : [];
      if (!slugs.length) return { query: params.query, matches: [], hint: 'Try: form, overlay, navigation, display, feedback' };
      return { query: params.query, count: slugs.length, matches: slugs.map(s => COMP_META[s] ?? { name: s }) };
    }

    case 'get_stories': {
      if (fw === 'angular') {
        return { error: 'Tool "get_stories" (preview-stories) is currently not available for Angular MCP server.' };
      }
      const slug = (params.component ?? '').toLowerCase().replace(/\s+/g, '-');
      return STORIES_MAP[slug] ?? { component: params.component ?? '', stories: [], message: `No stories found for "${params.component ?? ''}"` };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

export function tokenizeJson(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    if (ch === '\n') { tokens.push({ text: '\n' }); i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === ' ' || ch === '\t') { tokens.push({ text: ch }); i++; continue; }
    if (ch === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') { if (code[j] === '\\') j++; j++; }
      const str = code.slice(i, j + 1);
      let k = j + 1;
      while (k < code.length && (code[k] === ' ' || code[k] === '\n')) k++;
      tokens.push({ text: str, color: code[k] === ':' ? '#00bebe' : '#059669' });
      i = j + 1; continue;
    }
    if (/[0-9-]/.test(ch)) {
      let j = i;
      while (j < code.length && /[0-9.e+-]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), color: '#7c3aed' }); i = j; continue;
    }
    if (code.slice(i, i + 4) === 'true')  { tokens.push({ text: 'true',  color: '#7c3aed' }); i += 4; continue; }
    if (code.slice(i, i + 5) === 'false') { tokens.push({ text: 'false', color: '#7c3aed' }); i += 5; continue; }
    if (code.slice(i, i + 4) === 'null')  { tokens.push({ text: 'null',  color: '#7c3aed' }); i += 4; continue; }
    tokens.push({ text: ch, color: '#6c7086' }); i++;
  }
  return tokens;
}
