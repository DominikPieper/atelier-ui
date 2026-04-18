import { defineEcConfig } from 'astro-expressive-code';

export default defineEcConfig({
  themes: ['github-dark-dimmed', 'github-light'],
  themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
  styleOverrides: {
    borderRadius: '0.5rem',
    frames: {
      shadowColor: 'transparent',
    },
  },
});
