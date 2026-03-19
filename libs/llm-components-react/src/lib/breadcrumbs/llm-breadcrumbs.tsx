import { HTMLAttributes, ReactNode, AnchorHTMLAttributes, Children, isValidElement, cloneElement } from 'react';
import type { LlmBreadcrumbItemSpec } from '@llm-components/llm-components-spec';
import './llm-breadcrumbs.css';

/**
 * Properties for the LlmBreadcrumbs component.
 */
export interface LlmBreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  /**
   * The breadcrumb items to be rendered.
   */
  children?: ReactNode;
}

/**
 * A breadcrumbs component for displaying a navigation trail.
 */
export function LlmBreadcrumbs({ children, className, ...rest }: LlmBreadcrumbsProps) {
  const classes = ['llm-breadcrumbs', className].filter(Boolean).join(' ');

  // Automatically mark the last child as current
  const childArray = Children.toArray(children);
  const enhancedChildren = childArray.map((child, index) => {
    if (isValidElement(child) && index === childArray.length - 1) {
      return cloneElement(child, { current: true } as object);
    }
    return child;
  });

  return (
    <nav className={classes} aria-label="Breadcrumb" {...rest}>
      <ol role="list" className="breadcrumbs-list">
        {enhancedChildren}
      </ol>
    </nav>
  );
}

/**
 * Properties for the LlmBreadcrumbItem component.
 */
export interface LlmBreadcrumbItemProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    LlmBreadcrumbItemSpec {
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
export function LlmBreadcrumbItem({
  href,
  current = false,
  children,
  className,
  ...rest
}: LlmBreadcrumbItemProps) {
  const classes = ['llm-breadcrumb-item', current && 'is-current', className]
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
