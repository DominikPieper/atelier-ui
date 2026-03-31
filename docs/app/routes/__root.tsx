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
      <BottomNav />
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
  const isMcp = currentPath === '/mcp';
  const isWorkshop = currentPath === '/workshop';
  const isDocs = !isComponents && !isMcp && !isWorkshop;

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
        <Link to="/" className={`docs-topbar-link${isDocs ? ' active' : ''}`}>
          Docs
        </Link>
        <Link to="/components" className={`docs-topbar-link${isComponents ? ' active' : ''}`}>
          Components
        </Link>
        <Link to="/mcp" className={`docs-topbar-link${isMcp ? ' active' : ''}`}>
          MCP Explorer
        </Link>
        <Link to="/workshop" className={`docs-topbar-link${isWorkshop ? ' active' : ''}`}>
          Workshop
        </Link>
      </div>

      <Search />

      <button
        className="docs-theme-btn"
        onClick={onThemeToggle}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </header>
  );
}

function Sidebar({ open }: { open: boolean }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isComponents = currentPath.startsWith('/components');

  return (
    <nav className={`docs-sidebar${open ? ' docs-sidebar--open' : ''}`}>
      <div className="docs-sidebar-header">
        <div className="docs-sidebar-title">Technical Atelier</div>
        <div className="docs-sidebar-version">v1.0.4-beta</div>
      </div>

      {!isComponents ? (
        <>
          <div className="docs-nav-section">
            <div className="docs-nav-heading">
              <span className="docs-nav-heading-icon">{SECTION_ICONS['Get Started']}</span>
              Get Started
            </div>
            <NavLink to="/" icon="dashboard" label="Overview" currentPath={currentPath} />
            <NavLink to="/workshop" icon="build_circle" label="Workshop Setup" currentPath={currentPath} />
          </div>

          <div className="docs-nav-section">
            <div className="docs-nav-heading">
              <span className="docs-nav-heading-icon">{SECTION_ICONS['Tools']}</span>
              Tools
            </div>
            <NavLink to="/mcp" icon="smart_toy" label="MCP Playground" currentPath={currentPath} />
            <NavLink to="/storybook" icon="book" label="Storybook" currentPath={currentPath} />
          </div>

          <div className="docs-nav-section">
            <div className="docs-nav-heading">
              <span className="docs-nav-heading-icon">{SECTION_ICONS['The Library']}</span>
              The Library
            </div>
            <NavLink to="/install" icon="download" label="Installation" currentPath={currentPath} />
            <NavLink to="/design-principles" icon="psychology" label="LLM-Optimized APIs" currentPath={currentPath} />
            <NavLink to="/patterns" icon="menu_book" label="Cookbook Patterns" currentPath={currentPath} />
            <NavLink to="/llms" icon="description" label="llms.txt" currentPath={currentPath} />
            <NavLink to="/prompts" icon="chat" label="Prompt Templates" currentPath={currentPath} />
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
              icon="grid_view"
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
  icon,
}: {
  to: string;
  label: string;
  currentPath: string;
  icon?: string;
}) {
  const isActive =
    currentPath === to || (to !== '/' && currentPath.startsWith(to));
  return (
    <Link to={to} className={`docs-nav-link${isActive ? ' active' : ''}`}>
      {icon && <span className="docs-nav-link-icon material-symbols-outlined">{icon}</span>}
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

function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isComponents = currentPath.startsWith('/components');
  const isMcp = currentPath === '/mcp';
  const isWorkshop = currentPath === '/workshop';
  const isDocs = !isComponents && !isMcp && !isWorkshop;

  return (
    <nav className="docs-bottom-nav">
      <Link to="/" className={`docs-bottom-nav-item${isDocs ? ' active' : ''}`}>
        <span className="docs-bottom-nav-icon material-symbols-outlined">menu_book</span>
        <span className="docs-bottom-nav-label">Docs</span>
      </Link>
      <Link to="/components" className={`docs-bottom-nav-item${isComponents ? ' active' : ''}`}>
        <span className="docs-bottom-nav-icon material-symbols-outlined">widgets</span>
        <span className="docs-bottom-nav-label">Components</span>
      </Link>
      <Link to="/mcp" className={`docs-bottom-nav-item${isMcp ? ' active' : ''}`}>
        <span className="docs-bottom-nav-icon material-symbols-outlined">smart_toy</span>
        <span className="docs-bottom-nav-label">MCP</span>
      </Link>
      <Link to="/workshop" className={`docs-bottom-nav-item${isWorkshop ? ' active' : ''}`}>
        <span className="docs-bottom-nav-icon material-symbols-outlined">build_circle</span>
        <span className="docs-bottom-nav-label">Workshop</span>
      </Link>
    </nav>
  );
}

function formatComponentName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
