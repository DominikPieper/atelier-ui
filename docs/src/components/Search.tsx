import { useState, useEffect, useRef } from 'react';
import { ALL_COMPONENTS, CATEGORY_ICONS, componentDocs } from '../data/components';

type PageResult = {
  url: string;
  title: string;
  excerpt: string;
};

type PagefindResult = {
  data(): Promise<{ url: string; excerpt: string; meta: { title?: string } }>;
};

type Pagefind = {
  search(query: string): Promise<{ results: PagefindResult[] }>;
  options?(opts: Record<string, unknown>): Promise<void>;
};

let pagefindPromise: Promise<Pagefind | null> | null = null;

function loadPagefind(): Promise<Pagefind | null> {
  if (pagefindPromise) return pagefindPromise;
  pagefindPromise = (async () => {
    try {
      // Dynamic URL so Vite/Rollup skip static resolution — pagefind.js is
      // produced by the astro-pagefind integration after the build.
      const url = '/pagefind/pagefind.js';
      const mod = (await import(/* @vite-ignore */ url)) as Pagefind;
      if (mod.options) await mod.options({ baseUrl: '/' });
      return mod;
    } catch {
      return null;
    }
  })();
  return pagefindPromise;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [pageResults, setPageResults] = useState<PageResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim().toLowerCase();
  const componentResults = trimmed === ''
    ? []
    : ALL_COMPONENTS
        .filter(name => {
          const doc = componentDocs[name];
          return name.includes(trimmed) || doc?.name.toLowerCase().includes(trimmed);
        })
        .slice(0, 6);

  useEffect(() => {
    if (trimmed === '') {
      setPageResults([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const pagefind = await loadPagefind();
      if (!pagefind || cancelled) return;
      const { results } = await pagefind.search(trimmed);
      const top = await Promise.all(results.slice(0, 6).map(r => r.data()));
      if (cancelled) return;
      setPageResults(top.map(d => ({
        url: d.url,
        title: d.meta.title ?? d.url,
        excerpt: d.excerpt,
      })));
    })();
    return () => { cancelled = true; };
  }, [trimmed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = componentResults.length > 0 || pageResults.length > 0;
  const showEmptyState = open && trimmed !== '' && !hasResults;

  return (
    <div className="docs-search">
      <div className="docs-search-input-wrapper">
        <span className="docs-search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="docs-search-input"
          placeholder="Search docs and components..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <kbd className="docs-search-kbd">⌘K</kbd>
      </div>

      {open && (hasResults || showEmptyState) && (
        <div ref={dropdownRef} className="docs-search-results">
          {componentResults.length > 0 && (
            <>
              <div className="docs-search-group-heading">Components</div>
              {componentResults.map(name => (
                <button
                  key={`c-${name}`}
                  className="docs-search-result"
                  onClick={() => {
                    window.location.href = `/components/${name}`;
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <span className="docs-search-result-icon">
                    {CATEGORY_ICONS[componentDocs[name]?.category ?? ''] ?? '🧩'}
                  </span>
                  <div className="docs-search-result-content">
                    <div className="docs-search-result-name">{componentDocs[name]?.name ?? name}</div>
                    <div className="docs-search-result-category">{componentDocs[name]?.category}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {pageResults.length > 0 && (
            <>
              <div className="docs-search-group-heading">Pages</div>
              {pageResults.map(p => (
                <button
                  key={`p-${p.url}`}
                  className="docs-search-result"
                  onClick={() => {
                    window.location.href = p.url;
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <span className="docs-search-result-icon">📄</span>
                  <div className="docs-search-result-content">
                    <div className="docs-search-result-name">{p.title}</div>
                    <div
                      className="docs-search-result-category docs-search-result-excerpt"
                      dangerouslySetInnerHTML={{ __html: p.excerpt }}
                    />
                  </div>
                </button>
              ))}
            </>
          )}

          {showEmptyState && (
            <div className="docs-search-empty">No matches for "{query}".</div>
          )}
        </div>
      )}
    </div>
  );
}
