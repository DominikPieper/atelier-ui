import { useState, useEffect, useRef } from 'react';
import { ALL_COMPONENTS, CATEGORY_ICONS, componentDocs } from '../data/components';

export default function Search() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = query.trim() === ''
    ? []
    : ALL_COMPONENTS
        .filter(name => {
          const doc = componentDocs[name];
          return name.includes(query.toLowerCase()) ||
            doc?.name.toLowerCase().includes(query.toLowerCase());
        })
        .slice(0, 8);

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

  return (
    <div className="docs-search">
      <div className="docs-search-input-wrapper">
        <span className="docs-search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="docs-search-input"
          placeholder="Search components..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <kbd className="docs-search-kbd">⌘K</kbd>
      </div>

      {open && results.length > 0 && (
        <div ref={dropdownRef} className="docs-search-results">
          {results.map(name => (
            <button
              key={name}
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
        </div>
      )}
    </div>
  );
}
