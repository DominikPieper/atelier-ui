import type { AtlErrorItem } from './spec';

/**
 * The text of one entry of a form control's `errors`: the string itself, or the
 * `message` of a shared error item (Angular's `ValidationError` shape).
 */
export function errorMessage(error: string | AtlErrorItem): string | undefined {
  return typeof error === 'string' ? error : error.message;
}
