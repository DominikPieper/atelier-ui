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

  return (
    <>
      <div className="docs-page-header">
        <h1 className="docs-page-title">Components</h1>
        <p className="docs-page-description">
          {ALL_COMPONENTS.length} components for building AI-generated applications.
          Identical APIs across Angular, React, and Vue.
        </p>
      </div>

      <div className="docs-filter-bar" style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px', width: '100%' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            placeholder="Search components..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.25rem',
              borderRadius: 'var(--ui-radius-md)',
              border: '1px solid var(--ui-color-border)',
              background: 'var(--ui-color-surface-raised)',
              color: 'var(--ui-color-text)',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              border: `1px solid ${!activeCategory ? 'var(--ui-color-primary)' : 'var(--ui-color-border)'}`,
              background: !activeCategory ? 'var(--ui-color-primary-light)' : 'transparent',
              color: !activeCategory ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: `1px solid ${activeCategory === cat ? 'var(--ui-color-primary)' : 'var(--ui-color-border)'}`,
                background: activeCategory === cat ? 'var(--ui-color-primary-light)' : 'transparent',
                color: activeCategory === cat ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                    {doc?.description.slice(0, 80) ?? ''}
                    {(doc?.description.length ?? 0) > 80 ? '…' : ''}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(filteredCategories).length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.5 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>No components found matching your search.</p>
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
