import { it } from 'vitest';
import type { Subject, BehaviorId } from '@atelier-ui/spec/behaviors.generated';

/**
 * Bind a behaviors.json id to the test that covers it.
 *
 * `covers('button', 'click-emits')('emits a click', fn)` is exactly
 * `it('emits a click', fn)` with a typed, parity-tracked id. A wrong id is a
 * COMPILE error (checked against `BehaviorId<Subject>`), and the
 * behavior-coverage gate reads these calls instead of grepping comment
 * markers. Returns Vitest's `it`, so `.each`/`.skip` and the Testing Library
 * body are untouched: `covers('chat', 'variant-class').each(cases)(name, fn)`.
 *
 * Test-only — intentionally NOT exported from the package barrel.
 */
export function covers<S extends Subject>(subject: S, id: BehaviorId<S>): typeof it {
  void subject;
  void id;
  return it;
}
