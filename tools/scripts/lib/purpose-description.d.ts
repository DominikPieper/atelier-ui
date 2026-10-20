export const KNOWLEDGE_DIR: string;
export function componentName(specName: string): string;
export function loadPrimaryNames(dir?: string): string[];
export function loadPurposes(dir?: string): Record<string, string>;
export function withPurpose(
  purposes: Record<string, string>,
  name: string,
  description: string | undefined,
): string | undefined;
