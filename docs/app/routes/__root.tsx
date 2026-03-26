import { useState, useEffect, useRef } from 'react';
import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
  useNavigate,
} from '@tanstack/react-router';
import { COMPONENT_CATEGORIES, CATEGORY_ICONS, SECTION_ICONS, ALL_COMPONENTS, componentDocs } from '../component-data';

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

function Search() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = query.trim() === '' 
    ? [] 
    : ALL_COMPONENTS
        .filter(name => {
          const doc = componentDocs[name];
          return name.includes(query.toLowerCase()) || doc?.name.toLowerCase().includes(query.toLowerCase());
        })
        .slice(0, 8);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
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
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
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
                navigate({ to: '/components/$name', params: { name } });
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
      
      <Search />

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
            <div className="docs-nav-heading">
              <span className="docs-nav-heading-icon">{SECTION_ICONS['Get Started']}</span>
              Get Started
            </div>
            <NavLink to="/" label="Overview" currentPath={currentPath} />
            <NavLink to="/workshop" label="Workshop Setup" currentPath={currentPath} />
          </div>

          <div className="docs-nav-section">
            <div className="docs-nav-heading">
              <span className="docs-nav-heading-icon">{SECTION_ICONS['Tools']}</span>
              Tools
            </div>
            <NavLink to="/mcp" label="MCP Playground" currentPath={currentPath} />
            <NavLink to="/storybook" label="Storybook" currentPath={currentPath} />
          </div>

          <div className="docs-nav-section">
            <div className="docs-nav-heading">
              <span className="docs-nav-heading-icon">{SECTION_ICONS['The Library']}</span>
              The Library
            </div>
            <NavLink to="/install" label="Installation" currentPath={currentPath} />
            <NavLink to="/design-principles" label="LLM-Optimized APIs" currentPath={currentPath} />
            <NavLink to="/patterns" label="Cookbook Patterns" currentPath={currentPath} />
            <NavLink to="/llms" label="llms.txt" currentPath={currentPath} />
            <NavLink to="/prompts" label="Prompt Templates" currentPath={currentPath} />
          </div>
        </>
      ) : (
        <>
          <div className="docs-nav-section">
            <div className="docs-nav-heading">
              <span className="docs-nav-heading-icon">{SECTION_ICONS['Overview']}</span>
              Overview
            </div>
            <NavLink
              to="/components"
              label="All Components"
              currentPath={currentPath}
            />
          </div>

          {Object.entries(COMPONENT_CATEGORIES).map(([category, components]) => (
            <div key={category} className="docs-nav-section">
              <div className="docs-nav-heading">
                <span className="docs-nav-heading-icon">{CATEGORY_ICONS[category]}</span>
                {category}
              </div>
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
