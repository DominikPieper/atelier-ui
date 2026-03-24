import { createFileRoute, Link } from '@tanstack/react-router';
import { ALL_COMPONENTS, COMPONENT_CATEGORIES, componentDocs } from '../../component-data';

export const Route = createFileRoute('/components/')({
  component: ComponentsPage,
});

const CATEGORY_ICONS: Record<string, string> = {
  Inputs: '✏️',
  Display: '🎨',
  Navigation: '🧭',
  Overlay: '🪟',
  Layout: '📐',
};

function ComponentsPage() {
  return (
    <>
      <div className="docs-page-header">
        <h1 className="docs-page-title">Components</h1>
        <p className="docs-page-description">
          {ALL_COMPONENTS.length} components for building AI-generated applications.
          Identical APIs for React and Angular.
        </p>
      </div>

      {Object.entries(COMPONENT_CATEGORIES).map(([category, components]) => (
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
                  <div className="docs-component-card-name">
                    {doc?.name ?? formatComponentName(name)}
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
    </>
  );
}

function formatComponentName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
