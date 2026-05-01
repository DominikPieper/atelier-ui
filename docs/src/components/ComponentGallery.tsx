import { useState, useMemo } from 'react';
import { ALL_COMPONENTS, COMPONENT_CATEGORIES, componentDocs, CATEGORY_ICONS } from '../data/components';

export default function ComponentGallery() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Object.keys(COMPONENT_CATEGORIES);

  const filteredCategories = useMemo(() => {
    const result: Record<string, string[]> = {};
    const q = query.toLowerCase();

    Object.entries(COMPONENT_CATEGORIES).forEach(([category, components]) => {
      if (activeCategory && category !== activeCategory) return;
      const filtered = (components as string[]).filter(name => {
        const doc = componentDocs[name];
        return name.toLowerCase().includes(q) ||
          doc?.name.toLowerCase().includes(q) ||
          doc?.description.toLowerCase().includes(q);
      });
      if (filtered.length > 0) result[category] = filtered;
    });

    return result;
  }, [query, activeCategory]);

  const visibleCount = Object.values(filteredCategories).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <>
      <div className="docs-page-header">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1 className="docs-page-title">Components</h1>
          <span className="docs-count-badge">{visibleCount} of {ALL_COMPONENTS.length}</span>
        </div>
        <p className="docs-page-description">
          Identical APIs across Angular, React, and Vue. Designed for AI-assisted development.
        </p>
      </div>

      <div className="docs-filter-bar">
        <div className="docs-filter-search-wrap">
          <svg
            className="docs-filter-search-icon"
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
            type="text"
            placeholder="Search components..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="docs-filter-search"
            aria-label="Search components"
          />
        </div>
        <div className="docs-category-pills" role="group" aria-label="Filter components by category">
          <button
            type="button"
            className={`docs-category-pill${!activeCategory ? ' active' : ''}`}
            aria-pressed={!activeCategory}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className={`docs-category-pill${activeCategory === cat ? ' active' : ''}`}
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(filteredCategories).map(([category, components]) => (
        <div key={category} className="docs-section">
          <h2 className="docs-section-title">
            {category}
          </h2>
          <div className="docs-component-grid">
            {components.map((name) => {
              const doc = componentDocs[name];
              return (
                <a
                  key={name}
                  href={`/components/${name}`}
                  className="docs-component-card"
                >
                  <div className="docs-component-card-icon" aria-hidden="true">
                    {(doc?.name ?? formatComponentName(name)).replace(/^Llm/, '').charAt(0)}
                  </div>
                  <div className="docs-component-card-header">
                    <div className="docs-component-card-name">
                      {doc?.name ?? formatComponentName(name)}
                    </div>
                    {doc?.status && (
                      <span className={`docs-status-badge docs-status-badge--${doc.status}`}>
                        {doc.status}
                      </span>
                    )}
                  </div>
                  <div className="docs-component-card-desc">
                    {doc?.description.slice(0, 85) ?? ''}
                    {(doc?.description.length ?? 0) > 85 ? '…' : ''}
                  </div>
                  <div className="docs-component-card-footer">
                    <span className="docs-component-card-cta" aria-hidden="true">View docs</span>
                    <span className="docs-fw-dots" aria-hidden="true">
                      <span className="docs-fw-dot docs-fw-dot--angular"></span>
                      <span className="docs-fw-dot docs-fw-dot--react"></span>
                      <span className="docs-fw-dot docs-fw-dot--vue"></span>
                    </span>
                    <span className="docs-visually-hidden">View docs. Available for Angular, React, and Vue.</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(filteredCategories).length === 0 && (
        <div className="docs-not-found">
          <p>No components found matching "{query}"</p>
        </div>
      )}
    </>
  );
}

function formatComponentName(name: string): string {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
