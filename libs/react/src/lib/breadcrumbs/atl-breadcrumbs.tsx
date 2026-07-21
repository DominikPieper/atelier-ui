import { HTMLAttributes, ReactNode, AnchorHTMLAttributes, Children, isValidElement, cloneElement } from 'react';
import type { CSSProperties } from 'react';
import type { AtlBreadcrumbsSpec, AtlBreadcrumbItemSpec } from '../spec';
import './atl-breadcrumbs.css';

/**
 * Properties for the AtlBreadcrumbs component.
 */
export interface AtlBreadcrumbsProps extends HTMLAttributes<HTMLElement>, AtlBreadcrumbsSpec {
  /**
   * The breadcrumb items to be rendered.
   */
  children?: ReactNode;
}

/**
 * A breadcrumbs component for displaying a navigation trail.
 */
export function AtlBreadcrumbs({ children, separator = '/', className, style, ...rest }: AtlBreadcrumbsProps) {
  const classes = ['atl-breadcrumbs', className].filter(Boolean).join(' ');

  // Automatically mark the last child as current
  const childArray = Children.toArray(children);
  const enhancedChildren = childArray.map((child, index) => {
    if (isValidElement(child) && index === childArray.length - 1) {
      return cloneElement(child, { current: true } as object);
    }
    return child;
  });

  return (
    <nav
      className={classes}
      aria-label="Breadcrumb"
      style={{ '--atl-separator': `'${separator}'`, ...style } as CSSProperties}
      {...rest}
    >
      <ol className="breadcrumbs-list">
        {enhancedChildren}
      </ol>
    </nav>
  );
}

/**
 * Properties for the AtlBreadcrumbItem component.
 */
export interface AtlBreadcrumbItemProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    AtlBreadcrumbItemSpec {
  /**
   * The URL the breadcrumb points to.
   */
  href?: string;
  /**
   * Whether this is the current page.
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
      ) : (
        <span
          className="breadcrumb-current"
          aria-current={current ? 'page' : undefined}
        >
          {children}
        </span>
      )}
    </li>
  );
}
