import { HTMLAttributes, ReactNode, Children, useState, useEffect } from 'react';
import './llm-avatar.css';

export interface LlmAvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy' | '';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function LlmAvatar({
  src = '',
  alt = '',
  name = '',
  size = 'md',
  shape = 'circle',
  status = '',
  className,
  ...rest
}: LlmAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Reset imgError when src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  const classes = ['llm-avatar', `size-${size}`, `shape-${shape}`, className]
    .filter(Boolean).join(' ');

  const initials = name ? getInitials(name) : '';
  const ariaLabel = alt || name || 'Avatar';

  return (
    <div className={classes} aria-label={ariaLabel} role="img" {...rest}>
      {src && !imgError ? (
        <img src={src} alt={alt || name} onError={() => setImgError(true)} />
      ) : initials ? (
        <span className="initials" aria-hidden="true">{initials}</span>
      ) : (
        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-10 1.343-10 4v2h20v-2c0-2.657-6.686-4-10-4z" />
        </svg>
      )}
      {status && <span className={`status-dot status-${status}`} aria-hidden="true" />}
    </div>
  );
}

export interface LlmAvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: LlmAvatarProps['size'];
  children?: ReactNode;
}

export function LlmAvatarGroup({
  max = 5,
  size = 'md',
  children,
  className,
  ...rest
}: LlmAvatarGroupProps) {
  const childArray = Children.toArray(children);
  const visible = childArray.slice(0, max);
  const overflow = childArray.length - max;

  const classes = ['llm-avatar-group', `size-${size}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {visible}
      {overflow > 0 && (
        <div
          className={`overflow-badge size-${size}`}
          aria-label={`+${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
