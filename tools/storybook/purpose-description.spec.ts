import { describe, expect, it } from 'vitest';
import {
  componentName,
  loadPurposes,
  withPurpose,
} from '../scripts/lib/purpose-description.js';

describe('componentName', () => {
  it('strips the Spec and Options suffixes', () => {
    expect(componentName('AtlButtonSpec')).toBe('AtlButton');
    expect(componentName('AtlTableOptions')).toBe('AtlTable');
    expect(componentName('AtlSpecimen')).toBe('AtlSpecimen');
  });
});

describe('withPurpose', () => {
  const purposes = { AtlButton: 'Primary action trigger.' };

  it('prepends the purpose, a blank line, then the original', () => {
    expect(withPurpose(purposes, 'AtlButton', 'JSDoc text.')).toBe(
      'Primary action trigger.\n\nJSDoc text.',
    );
  });

  it('is just the purpose when there is no original description', () => {
    expect(withPurpose(purposes, 'AtlButton', undefined)).toBe(
      'Primary action trigger.',
    );
    expect(withPurpose(purposes, 'AtlButton', '  ')).toBe(
      'Primary action trigger.',
    );
  });

  it('leaves components without metadata untouched', () => {
    expect(withPurpose(purposes, 'AtlToast', 'Toast.')).toBe('Toast.');
    expect(withPurpose(purposes, 'AtlToast', undefined)).toBeUndefined();
    expect(withPurpose(purposes, 'toString', 'x')).toBe('x');
  });

  it('is idempotent', () => {
    const once = withPurpose(purposes, 'AtlButton', 'JSDoc text.');
    expect(withPurpose(purposes, 'AtlButton', once)).toBe(once);
  });
});

describe('loadPurposes', () => {
  const purposes = loadPurposes();

  it('maps spec-derived component names to the metadata purpose', () => {
    expect(purposes['AtlButton']).toMatch(/^Primary action trigger\./);
    expect(purposes['AtlTable']).toBeTruthy();
  });

  it('has no entry for components without metadata', () => {
    expect(purposes['AtlToast']).toBeUndefined();
    expect(purposes['AtlCodeBlock']).toBeUndefined();
  });
});
