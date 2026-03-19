import { HTMLAttributes, ReactNode, Children, useState, useEffect } from 'react';
import type {
  LlmAvatarSpec,
  LlmAvatarGroupSpec,
} from '@llm-components/llm-components-spec';
import './llm-avatar.css';

/**
 * Properties for the LlmAvatar component.
 */
export interface LlmAvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    LlmAvatarSpec {
  /**
   * The URL of the image to display.
   */
  src?: string;
  /**
   * Accessible text for the avatar image.
   */
  alt?: string;
  /**
   * The name of the person/entity, used for initials if no image is provided.
   */
  name?: string;
  /**
   * The size of the avatar.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * The shape of the avatar.
   */
  shape?: 'circle' | 'square';
  /**
   * The status indicator to display on the avatar.
   */
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

/**
 * An avatar component for displaying user profile pictures or initials.
 */
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

/**
 * Properties for the LlmAvatarGroup component.
 */
export interface LlmAvatarGroupProps
  extends HTMLAttributes<HTMLDivElement>,
    LlmAvatarGroupSpec {
  /**
   * The maximum number of avatars to show before displaying an overflow badge.
   */
  max?: number;
  /**
   * The size of the avatars in the group.
   */
  size?: LlmAvatarProps['size'];
  /**
   * The avatars to be rendered in the group.
   */
  children?: ReactNode;
}

/**
 * A container for grouping multiple avatars.
 */
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
