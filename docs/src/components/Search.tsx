import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { ALL_COMPONENTS, componentDocs } from '../data/components';

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

const LISTBOX_ID = 'docs-search-listbox';
const optionId = (index: number) => `docs-search-option-${index}`;

/* Component-scoped styles that global.css cannot express for the new
 * markup: the keyboard-active state (mirrors .docs-search-result:hover)
 * and the group separator (the global `:not(:first-child)` rule no longer
 * matches once headings sit inside role="group" wrappers). */
const SCOPED_STYLES = `
.docs-search-result.is-active { background: var(--ui-color-surface-sunken); }
.docs-search-results [role='group'] + [role='group'] > .docs-search-group-heading {
  border-top: 1px solid var(--ui-color-border);
  margin-top: 4px;
}
`;

export default function Search() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [pageResults, setPageResults] = useState<PageResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [announcement, setAnnouncement] = useState('');
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

  // Flattened navigation order: components first, then pages — matching
  // the rendered order of the two groups.
  const flatUrls = [
    ...componentResults.map(name => `/components/${name}`),
    ...pageResults.map(p => p.url),
  ];

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

  // Reset keyboard selection whenever the query changes or the dropdown closes.
  useEffect(() => { setActiveIndex(-1); }, [trimmed]);
  useEffect(() => { if (!open) setActiveIndex(-1); }, [open]);

  // Clamp if async page results shrink the list under the active index.
  useEffect(() => {
    if (activeIndex >= flatUrls.length) {
      setActiveIndex(flatUrls.length - 1);
    }
  }, [flatUrls.length, activeIndex]);

  // Keep the keyboard-active option visible.
  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(optionId(activeIndex))
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Politely announce the result count, debounced so intermediate
  // keystrokes (and the async pagefind round-trip) don't spam SRs.
  useEffect(() => {
    if (trimmed === '') {
      setAnnouncement('');
      return;
    }
    const count = componentResults.length + pageResults.length;
    const timer = setTimeout(() => {
      setAnnouncement(count === 0 ? 'No results' : `${count} result${count === 1 ? '' : 's'}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [trimmed, componentResults.length, pageResults.length]);

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

  const navigateTo = (url: string) => {
    window.location.href = url;
    setOpen(false);
    setQuery('');
  };

  const handleInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!open || flatUrls.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => (i + 1) % flatUrls.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => (i <= 0 ? flatUrls.length - 1 : i - 1));
        break;
      case 'Enter': {
        e.preventDefault();
        const url = flatUrls[activeIndex >= 0 ? activeIndex : 0];
        if (url) navigateTo(url);
        break;
      }
      default:
        break;
    }
  };

  const hasResults = componentResults.length > 0 || pageResults.length > 0;
  const showEmptyState = open && trimmed !== '' && !hasResults;
  const listboxVisible = open && hasResults;

  const renderOption = (
    index: number,
    url: string,
    key: string,
    children: ReactNode,
  ) => (
    <button
      key={key}
      id={optionId(index)}
      role="option"
      aria-selected={index === activeIndex}
      tabIndex={-1}
      className={`docs-search-result${index === activeIndex ? ' is-active' : ''}`}
      onClick={() => navigateTo(url)}
      onMouseEnter={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );

  return (
    <div className="docs-search">
      <style>{SCOPED_STYLES}</style>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      <div className="docs-search-input-wrapper">
        <svg
          className="docs-search-icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="docs-search-input"
          placeholder="Search docs and components..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKeyDown}
          aria-label="Search docs and components"
          role="combobox"
          aria-expanded={listboxVisible}
          aria-controls={LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={
            listboxVisible && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
        />
        <kbd className="docs-search-kbd">⌘K</kbd>
      </div>

      {open && (hasResults || showEmptyState) && (
        <div ref={dropdownRef} className="docs-search-results">
          {hasResults && (
            <div role="listbox" id={LISTBOX_ID} aria-label="Search results">
              {componentResults.length > 0 && (
                <div role="group" aria-labelledby="docs-search-group-components">
                  <div
                    className="docs-search-group-heading"
                    role="presentation"
                    id="docs-search-group-components"
                  >
                    Components
                  </div>
                  {componentResults.map((name, i) =>
                    renderOption(i, `/components/${name}`, `c-${name}`, (
                      <>
                        <span className="docs-search-result-icon" aria-hidden="true">
                          {(componentDocs[name]?.name ?? name).replace(/^Llm/, '').charAt(0)}
                        </span>
                        <div className="docs-search-result-content">
                          <div className="docs-search-result-name">{componentDocs[name]?.name ?? name}</div>
                          <div className="docs-search-result-category">{componentDocs[name]?.category}</div>
                        </div>
                      </>
                    ))
                  )}
                </div>
              )}

              {pageResults.length > 0 && (
                <div role="group" aria-labelledby="docs-search-group-pages">
                  <div
                    className="docs-search-group-heading"
                    role="presentation"
                    id="docs-search-group-pages"
                  >
                    Pages
                  </div>
                  {pageResults.map((p, i) =>
                    renderOption(componentResults.length + i, p.url, `p-${p.url}`, (
                      <>
                        <svg
                          className="docs-search-result-icon"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <div className="docs-search-result-content">
                          <div className="docs-search-result-name">{p.title}</div>
                          <div
                            className="docs-search-result-category docs-search-result-excerpt"
                            dangerouslySetInnerHTML={{ __html: p.excerpt }}
                          />
                        </div>
                      </>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {showEmptyState && (
            <div className="docs-search-empty">No matches for "{query}".</div>
          )}
        </div>
      )}
    </div>
  );
}
