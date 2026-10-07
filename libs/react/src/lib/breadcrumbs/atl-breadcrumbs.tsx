import {
  HTMLAttributes,
  ReactNode,
  AnchorHTMLAttributes,
  Children,
  Fragment,
  isValidElement,
  cloneElement,
} from 'react';
import type { ReactElement } from 'react';
import type { CSSProperties } from 'react';
import type { AtlBreadcrumbsSpec, AtlBreadcrumbItemSpec } from '../spec';
import '@atelier-ui/styles/breadcrumbs/atl-breadcrumbs.css';

/**
 * Properties for the AtlBreadcrumbs component.
 */
export interface AtlBreadcrumbsProps
  extends HTMLAttributes<HTMLElement>, AtlBreadcrumbsSpec {
  /**
   * Separator character shown between breadcrumb items.
   */
  separator?: string;
  /**
   * The breadcrumb items to be rendered.
   */
  children?: ReactNode;
}

/**
 * The children with every Fragment unwrapped, so items wrapped in `<>...</>` or
 * produced by `.map()` inside one are seen as the siblings they render as.
 */
function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );
}

/**
 * A breadcrumbs component for displaying a navigation trail.
 *
 * The last item is the current page unless an item sets `current` explicitly.
 * If any item does, only explicit values count: `current` on the item that is
 * the page, or `current={false}` on every item for a trail with no current page.
 * Items must be direct children, or inside a Fragment; a custom wrapper component
 * around them is not looked into, so set `current` on those items yourself.
 */
export function AtlBreadcrumbs({
  children,
  separator = '/',
  className,
  style,
  ...rest
}: AtlBreadcrumbsProps) {
  const classes = ['atl-breadcrumbs', className].filter(Boolean).join(' ');

  const flat = flattenChildren(children);
  const isItem = (
    child: ReactNode,
  ): child is ReactElement<{ current?: boolean }> =>
    isValidElement(child) && typeof child.type !== 'string';
  const items = flat.filter(isItem);
  const anyExplicit = items.some((item) => item.props.current !== undefined);
  const last = items[items.length - 1];
  const enhancedChildren = anyExplicit
    ? flat
    : flat.map((child) =>
        child === last ? cloneElement(last, { current: true }) : child,
      );

  return (
    <nav
      className={classes}
      aria-label="Breadcrumb"
      style={{ '--atl-separator': `'${separator}'`, ...style } as CSSProperties}
      {...rest}
    >
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- role="list" is
          NOT redundant here: .breadcrumbs-list sets list-style: none, and an
          unstyled-marker <ol>/<ul> with no explicit role is the documented
          Safari/VoiceOver case where the implicit list semantics can be
          dropped (ADR-0100). */}
      <ol role="list" className="breadcrumbs-list">
        {enhancedChildren}
      </ol>
    </nav>
  );
}

/**
 * Properties for the AtlBreadcrumbItem component.
 */
export interface AtlBreadcrumbItemProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>, AtlBreadcrumbItemSpec {
  /**
   * The URL the breadcrumb points to.
   */
  href?: string;
  /**
   * Whether this is the current page. Leave it unset and the last item is the
   * current page; set it on any item and only explicit values count.
   */
  current?: boolean;
  /**
   * The content to be rendered inside the breadcrumb item.
   */
  children?: ReactNode;
}

/**
 * An individual breadcrumb item.
 */
export function AtlBreadcrumbItem({
  href,
  current = false,
  children,
  className,
  ...rest
}: AtlBreadcrumbItemProps) {
  const classes = ['atl-breadcrumb-item', current && 'is-current', className]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classes}>
      {href && !current ? (
        <a href={href} className="breadcrumb-link" {...rest}>
          {children}
        </a>
      ) : current ? (
        <span className="breadcrumb-current" aria-current="page">
          {children}
        </span>
      ) : (
        <span className="breadcrumb-text">{children}</span>
      )}
    </li>
  );
}
