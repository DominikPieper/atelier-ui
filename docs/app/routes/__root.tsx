import { useState, useEffect } from 'react';
import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { COMPONENT_CATEGORIES } from '../component-data';

export const Route = createRootRoute({
  component: RootLayout,
});

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('docs-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Always set data-theme so explicit selectors are in control, not the media query
  useEffect(() => {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('docs-theme', theme);
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, toggleDark] = useDarkMode();
  const routerState = useRouterState();

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [routerState.location.pathname]);

  return (
    <div className="docs-shell">
      <TopBar onMenuToggle={() => setSidebarOpen((o) => !o)} dark={dark} onThemeToggle={toggleDark} />
      <div
        className={`docs-sidebar-backdrop${sidebarOpen ? ' docs-sidebar-backdrop--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar open={sidebarOpen} />
      <main className="docs-main">
        <Outlet />
      </main>
    </div>
  );
}

function TopBar({ onMenuToggle, dark, onThemeToggle }: { onMenuToggle: () => void; dark: boolean; onThemeToggle: () => void }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isComponents = currentPath.startsWith('/components');

  return (
    <header className="docs-topbar">
      <button className="docs-menu-btn" onClick={onMenuToggle} aria-label="Toggle navigation">
        <span />
        <span />
        <span />
      </button>
      <Link to="/" className="docs-logo">
        <img
          src="/logo.png"
          alt="Atelier"
          className="docs-logo-img"
          height="32"
        />
        <span className="docs-logo-text">Atelier</span>
      </Link>
      <div className="docs-topbar-links">
        <Link to="/" className={`docs-topbar-link${!isComponents ? ' active' : ''}`}>
          Documentation
        </Link>
        <Link to="/components" className={`docs-topbar-link${isComponents ? ' active' : ''}`}>
          Components
        </Link>
        <button
          className="docs-theme-btn"
          onClick={onThemeToggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

function Sidebar({ open }: { open: boolean }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isComponents = currentPath.startsWith('/components');

  return (
    <nav className={`docs-sidebar${open ? ' docs-sidebar--open' : ''}`}>
      {!isComponents ? (
        <>
          <div className="docs-nav-section">
            <div className="docs-nav-heading">Get Started</div>
            <NavLink to="/" label="Overview" currentPath={currentPath} />
            <NavLink to="/workshop" label="Workshop Setup" currentPath={currentPath} />
          </div>

          <div className="docs-nav-section">
            <div className="docs-nav-heading">Tools</div>
            <NavLink to="/mcp" label="MCP Playground" currentPath={currentPath} />
            <NavLink to="/storybook" label="Storybook" currentPath={currentPath} />
          </div>

          <div className="docs-nav-section">
            <div className="docs-nav-heading">The Library</div>
            <NavLink to="/install" label="Installation" currentPath={currentPath} />
            <NavLink to="/design-principles" label="LLM-Optimized APIs" currentPath={currentPath} />
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
