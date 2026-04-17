import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ALL_COMPONENTS, COMPONENT_CATEGORIES, componentDocs, CATEGORY_ICONS } from '../../component-data';

export const Route = createFileRoute('/components/')({
  component: ComponentsPage,
});

function ComponentsPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Object.keys(COMPONENT_CATEGORIES);

  const filteredCategories = useMemo(() => {
    const result: Record<string, string[]> = {};
    const q = query.toLowerCase();

    Object.entries(COMPONENT_CATEGORIES).forEach(([category, components]) => {
      if (activeCategory && category !== activeCategory) return;

      const filtered = components.filter(name => {
        const doc = componentDocs[name];
        return name.toLowerCase().includes(q) || doc?.name.toLowerCase().includes(q) || doc?.description.toLowerCase().includes(q);
      });

      if (filtered.length > 0) {
        result[category] = filtered;
      }
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

      {/* Filter bar */}
      <div className="docs-filter-bar">
        <div className="docs-filter-search-wrap">
          <span className="docs-filter-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search components..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="docs-filter-search"
          />
        </div>
        <div className="docs-category-pills">
          <button
            className={`docs-category-pill${!activeCategory ? ' active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`docs-category-pill${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(filteredCategories).map(([category, components]) => (
        <div key={category} className="docs-section">
          <h2 className="docs-section-title">
            {CATEGORY_ICONS[category]} {category}
          </h2>
          <div className="docs-component-grid">
            {components.map((name) => {
              const doc = componentDocs[name];
              return (
                <Link
                  key={name}
                  to="/components/$name"
                  params={{ name }}
                  className="docs-component-card"
                >
                  <div className="docs-component-card-icon">
                    {CATEGORY_ICONS[doc?.category ?? ''] ?? '🧩'}
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
                  <span className="docs-component-card-cta">View docs →</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(filteredCategories).length === 0 && (
        <div className="docs-not-found">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
          <p>No components found matching "{query}"</p>
        </div>
      )}
    </>
  );
}

function formatComponentName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
