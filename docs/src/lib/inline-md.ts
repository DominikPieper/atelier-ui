// Tiny inline-markdown renderer for curriculum strings kept as plain data:
// `code` and **bold** only, everything else HTML-escaped. Shared by the
// instructor curriculum (/schulung) and the participant Day 2 page
// (/build-your-own) so a string rendered on both reads identically.
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const inlineMd = (s: string): string =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
