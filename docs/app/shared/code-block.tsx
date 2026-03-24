import React from 'react';

// ─── Token type ───────────────────────────────────────────────────────────────

export type Token = { text: string; color?: string };

// ─── Color palette ────────────────────────────────────────────────────────────
// Matches the existing .docs-demo-code palette used across the app.

const C = {
  keyword:   '#7c3aed', // purple   — import, from, npx, npm, string, boolean
  name:      '#00bebe', // teal     — component names, identifiers
  string:    '#059669', // green    — string literals, package names
  muted:     '#6c7086', // gray     — punctuation, flags, comments
  text:      '#cdd6f4', // default  — plain text
} as const;

// ─── Tokenizers ───────────────────────────────────────────────────────────────

function tokenizeShellLine(line: string, tokens: Token[]) {
  const KEYWORDS = /^(npx|npm|node|cd|pnpm|yarn|bun)\b/;
  let rest = line.trimStart();
  const indent = line.slice(0, line.length - rest.length);
  if (indent) tokens.push({ text: indent });

  // Command keyword at start of line
  const kw = rest.match(KEYWORDS);
  if (kw) {
    tokens.push({ text: kw[0], color: C.keyword });
    rest = rest.slice(kw[0].length);
  }

  // Tokenise remaining words
  const parts = rest.split(/(\s+)/);
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part });
    } else if (part.startsWith('--') || part.startsWith('-')) {
      tokens.push({ text: part, color: C.muted });
    } else if (part.includes('=')) {
      // flag=value: split and colour separately
      const eqIdx = part.indexOf('=');
      tokens.push({ text: part.slice(0, eqIdx + 1), color: C.muted });
      tokens.push({ text: part.slice(eqIdx + 1), color: C.string });
    } else if (part.startsWith('@') || /^[a-z][\w-]*\//.test(part)) {
      // @scope/pkg or scoped package
      tokens.push({ text: part, color: C.string });
    } else {
      // sub-command / arg
      tokens.push({ text: part, color: C.name });
    }
  }
}

function tokenizeTsLine(line: string, tokens: Token[]) {
  // Comments
  const commentIdx = line.indexOf('//');
  if (commentIdx !== -1 && !line.trimStart().startsWith('import')) {
    if (commentIdx > 0) {
      tokenizeTsLineContent(line.slice(0, commentIdx), tokens);
    }
    tokens.push({ text: line.slice(commentIdx), color: C.muted });
    return;
  }

  tokenizeTsLineContent(line, tokens);
}

function tokenizeTsLineContent(line: string, tokens: Token[]) {
  // import … from '…'
  const importMatch = line.match(/^(import)\s*/);
  if (importMatch) {
    tokens.push({ text: 'import', color: C.keyword });
    const rest = line.slice(importMatch[0].length);
    const fromIdx = rest.lastIndexOf(' from ');
    if (fromIdx !== -1) {
      const before = rest.slice(0, fromIdx);
      const after = rest.slice(fromIdx + 6);
      tokenizeBraces(before, tokens);
      tokens.push({ text: ' from ', color: C.keyword });
      const semiIdx = after.lastIndexOf(';');
      if (semiIdx !== -1) {
        tokens.push({ text: after.slice(0, semiIdx), color: C.string });
        tokens.push({ text: ';', color: C.muted });
      } else {
        tokens.push({ text: after, color: C.string });
      }
      return;
    }
    tokens.push({ text: rest, color: C.text });
    return;
  }

  // TypeScript type declaration: identifier: type  or  identifier: 'lit' | 'lit'
  const typeDecl = line.match(/^(\s*)([A-Za-z_$][\w$]*)(\s*:\s*)(.*)/);
  if (typeDecl) {
    const [, indent, prop, colon, rest] = typeDecl;
    if (indent) tokens.push({ text: indent });
    tokens.push({ text: prop, color: C.name });
    tokens.push({ text: colon, color: C.muted });
    tokenizeTsTypes(rest, tokens);
    return;
  }

  tokens.push({ text: line, color: C.text });
}

function tokenizeTsTypes(segment: string, tokens: Token[]) {
  // Split on | and string literals
  const parts = segment.split(/(\'[^\']*\'|\"[^\"]*\"|[|])/);
  for (const part of parts) {
    if (!part) continue;
    if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
      tokens.push({ text: part, color: C.string });
    } else if (part === '|') {
      tokens.push({ text: ' | ', color: C.muted });
    } else {
      const TYPE_KW = /\b(string|number|boolean|null|undefined|void|any|never|object|unknown)\b/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = TYPE_KW.exec(part)) !== null) {
        if (m.index > last) tokens.push({ text: part.slice(last, m.index), color: C.text });
        tokens.push({ text: m[0], color: C.keyword });
        last = m.index + m[0].length;
      }
      if (last < part.length) tokens.push({ text: part.slice(last), color: C.text });
    }
  }
}

function tokenizeBraces(segment: string, tokens: Token[]) {
  let i = 0;
  while (i < segment.length) {
    const ch = segment[i];
    if (ch === '{' || ch === '}' || ch === ',' || ch === '\n') {
      tokens.push({ text: ch, color: C.muted });
      i++;
    } else if (ch === ' ') {
      tokens.push({ text: ch });
      i++;
    } else {
      let end = i;
      while (end < segment.length && !/[{},\s]/.test(segment[end])) end++;
      tokens.push({ text: segment.slice(i, end), color: C.name });
      i = end;
    }
  }
}

function tokenizeJsxLine(line: string, tokens: Token[]) {
  // Comment line
  if (line.trimStart().startsWith('//')) {
    tokens.push({ text: line, color: C.muted });
    return;
  }
  let rest = line;
  while (rest.length) {
    if (rest[0] === '<') {
      const closeIdx = rest.indexOf('>');
      const tag = closeIdx !== -1 ? rest.slice(0, closeIdx + 1) : rest;
      tokenizeJsxTag(tag, tokens);
      rest = closeIdx !== -1 ? rest.slice(closeIdx + 1) : '';
    } else {
      const ltIdx = rest.indexOf('<');
      const text = ltIdx !== -1 ? rest.slice(0, ltIdx) : rest;
      tokens.push({ text, color: C.text });
      rest = ltIdx !== -1 ? rest.slice(ltIdx) : '';
    }
  }
}

function tokenizeJsxTag(tag: string, tokens: Token[]) {
  tokens.push({ text: '<', color: C.muted });
  const inner = tag.slice(1, tag.endsWith('/>') ? -2 : -1).trimEnd();
  const slash = tag.endsWith('/>') ? '/>' : '>';
  const spaceIdx = inner.indexOf(' ');
  const name = spaceIdx === -1 ? inner : inner.slice(0, spaceIdx);
  const attrs = spaceIdx === -1 ? '' : inner.slice(spaceIdx);
  const isClose = name.startsWith('/');
  if (isClose) {
    tokens.push({ text: '/', color: C.muted });
    tokens.push({ text: name.slice(1), color: C.name });
  } else {
    tokens.push({ text: name, color: C.name });
  }
  if (attrs) tokens.push({ text: attrs, color: C.text });
  tokens.push({ text: slash, color: C.muted });
}

function tokenizeJson(code: string): Token[] {
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
      tokens.push({ text: str, color: code[k] === ':' ? C.name : C.string });
      i = j + 1; continue;
    }
    if (/[0-9-]/.test(ch)) {
      let j = i;
      while (j < code.length && /[0-9.e+-]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), color: C.keyword }); i = j; continue;
    }
    if (code.slice(i, i + 4) === 'true')  { tokens.push({ text: 'true',  color: C.keyword }); i += 4; continue; }
    if (code.slice(i, i + 5) === 'false') { tokens.push({ text: 'false', color: C.keyword }); i += 5; continue; }
    if (code.slice(i, i + 4) === 'null')  { tokens.push({ text: 'null',  color: C.keyword }); i += 4; continue; }
    tokens.push({ text: ch, color: C.muted }); i++;
  }
  return tokens;
}

// ─── Main tokenize function ───────────────────────────────────────────────────

export type Lang = 'ts' | 'shell' | 'css' | 'jsx' | 'json' | 'text';

export function tokenize(code: string, lang: Lang): Token[] {
  const tokens: Token[] = [];

  if (lang === 'json') {
    return tokenizeJson(code);
  }

  if (lang === 'text') {
    tokens.push({ text: code, color: C.text });
    return tokens;
  }

  if (lang === 'css') {
    const m = code.match(/^(@import)\s+(['"][^'"]+['"])(;?)$/);
    if (m) {
      tokens.push({ text: m[1], color: C.keyword });
      tokens.push({ text: ' ' });
      tokens.push({ text: m[2], color: C.string });
      tokens.push({ text: m[3], color: C.text });
      return tokens;
    }
    tokens.push({ text: code });
    return tokens;
  }

  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) tokens.push({ text: '\n' });
    if (lang === 'shell') {
      tokenizeShellLine(lines[i], tokens);
    } else if (lang === 'ts') {
      tokenizeTsLine(lines[i], tokens);
    } else if (lang === 'jsx') {
      tokenizeJsxLine(lines[i], tokens);
    }
  }

  return tokens;
}

// ─── CodeBlock component ──────────────────────────────────────────────────────

export function CodeBlock({ code, lang }: { code: string; lang: Lang }) {
  const tokens = tokenize(code.trim(), lang);
  return (
    <div className="docs-demo-code" style={{ borderRadius: '8px', marginBottom: '1rem' }}>
      <pre style={{ margin: 0, fontFamily: "'Menlo','Monaco','Courier New',monospace", fontSize: '0.8rem', lineHeight: 1.6, overflowX: 'auto' }}>
        {tokens.map((t, i) => (
          <span key={i} style={{ color: t.color ?? C.text }}>
            {t.text}
          </span>
        ))}
      </pre>
    </div>
  );
}
