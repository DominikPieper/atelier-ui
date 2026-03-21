import React from 'react';
import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { ALL_COMPONENTS, COMPONENT_CATEGORIES } from '../component-data';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="docs-shell">
      <TopBar />
      <Sidebar />
      <main className="docs-main">
        <Outlet />
      </main>
    </div>
  );
}

function TopBar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isComponents = currentPath.startsWith('/components');

  return (
    <header className="docs-topbar">
      <Link to="/" className="docs-logo">
        <img
          src="/logo.png"
          alt="Atelier"
          className="docs-logo-img"
          height="32"
        />
        Atelier
      </Link>
      <div className="docs-topbar-links">
        <Link to="/" className={`docs-topbar-link${!isComponents ? ' active' : ''}`}>
          Documentation
        </Link>
        <Link to="/components" className={`docs-topbar-link${isComponents ? ' active' : ''}`}>
          Components
        </Link>
      </div>
    </header>
  );
}

function Sidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isComponents = currentPath.startsWith('/components');

  return (
    <nav className="docs-sidebar">
      {!isComponents ? (
        <>
          <div className="docs-nav-section">
            <div className="docs-nav-heading">Getting Started</div>
            <NavLink to="/" label="Overview" currentPath={currentPath} />
            <NavLink to="/install" label="Installation" currentPath={currentPath} />
          </div>

          <div className="docs-nav-section">
            <div className="docs-nav-heading">Concepts</div>
            <NavLink
              to="/philosophy"
              label="Core Philosophy"
              currentPath={currentPath}
            />
            <NavLink
              to="/design-principles"
              label="Design Principles"
              currentPath={currentPath}
            />
            <NavLink to="/roadmap" label="Roadmap" currentPath={currentPath} />
          </div>
        </>
      ) : (
        <>
          <div className="docs-nav-section">
            <div className="docs-nav-heading">Overview</div>
            <NavLink
              to="/components"
              label="All Components"
              currentPath={currentPath}
            />
          </div>

          {Object.entries(COMPONENT_CATEGORIES).map(([category, components]) => (
            <div key={category} className="docs-nav-section">
              <div className="docs-nav-heading">{category}</div>
              {components.map((name) => (
                <NavLinkComponent
                  key={name}
                  name={name}
                  label={formatComponentName(name)}
                  currentPath={currentPath}
                />
              ))}
            </div>
          ))}
        </>
      )}
    </nav>
  );
}

function NavLink({
  to,
  label,
  currentPath,
}: {
  to: string;
  label: string;
  currentPath: string;
}) {
  const isActive =
    currentPath === to || (to !== '/' && currentPath.startsWith(to));
  return (
    <Link to={to} className={`docs-nav-link${isActive ? ' active' : ''}`}>
      {label}
    </Link>
  );
}

function NavLinkComponent({
  name,
  label,
  currentPath,
}: {
  name: string;
  label: string;
  currentPath: string;
}) {
  const path = `/components/${name}`;
  const isActive = currentPath === path;
  return (
    <Link
      to="/components/$name"
      params={{ name }}
      className={`docs-nav-link${isActive ? ' active' : ''}`}
    >
      {label}
    </Link>
  );
}

function formatComponentName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
