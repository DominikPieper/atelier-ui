import { HTMLAttributes, ReactNode, AnchorHTMLAttributes, Children, isValidElement } from 'react';
import './llm-breadcrumbs.css';

export interface LlmBreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function LlmBreadcrumbs({ children, className, ...rest }: LlmBreadcrumbsProps) {
  const classes = ['llm-breadcrumbs', className].filter(Boolean).join(' ');

  // Automatically mark the last child as current
  const childArray = Children.toArray(children);
  const enhancedChildren = childArray.map((child, index) => {
    if (isValidElement(child) && index === childArray.length - 1) {
      return { ...child, props: { ...child.props, current: true } };
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

export interface LlmBreadcrumbItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  current?: boolean;
  children?: ReactNode;
}

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
