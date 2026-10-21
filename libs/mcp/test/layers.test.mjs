import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BASE_LAYER, LAYERS, resolveLayers } from '../src/layers.mjs';

const registry = [{ id: 'api' }, { id: 'purpose' }, { id: 'tokens' }];

test('unset or empty spec means every layer', () => {
  assert.deepEqual(resolveLayers(undefined, registry), registry);
  assert.deepEqual(resolveLayers('', registry), registry);
  assert.deepEqual(resolveLayers(' , ', registry), registry);
});

test('a list selects exactly those layers, in registry order', () => {
  assert.deepEqual(resolveLayers('tokens, api', registry), [
    { id: 'api' },
    { id: 'tokens' },
  ]);
  assert.deepEqual(resolveLayers('api', registry), [{ id: 'api' }]);
});

test('an unknown id is an error naming the known ids', () => {
  assert.throws(
    () => resolveLayers('api,purpse', registry),
    /unknown layer\(s\) "purpse"\. Known: api, purpose, tokens/,
  );
});

test('the base layer cannot be switched off', () => {
  assert.throws(
    () => resolveLayers('purpose', registry),
    /base layer "api" cannot be switched off/,
  );
});

test('the shipped registry is L0 only, and L0 is the base layer', () => {
  assert.deepEqual(
    LAYERS.map((layer) => layer.id),
    [BASE_LAYER],
  );
});
