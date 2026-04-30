import { OGImageRoute } from 'astro-og-canvas';
import { OG_PAGES } from '../../data/og-pages';

// Conciso teal brand. Dark slate canvas with teal anchor, mirroring
// libs/react/src/styles/tokens.css (--ui-color-primary: #006470).
const TEAL: [number, number, number] = [0, 100, 112];
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_700: [number, number, number] = [30, 41, 59];
const WHITE: [number, number, number] = [255, 255, 255];
const SLATE_300: [number, number, number] = [203, 213, 225];

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'slug',
  pages: OG_PAGES,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [SLATE_900, SLATE_700],
    border: { color: TEAL, width: 12, side: 'inline-start' },
    padding: 80,
    font: {
      title: {
        size: 72,
        weight: 'ExtraBold',
        color: WHITE,
        lineHeight: 1.15,
        families: ['Inter', 'sans-serif'],
      },
      description: {
        size: 32,
        color: SLATE_300,
        lineHeight: 1.4,
        families: ['Inter', 'sans-serif'],
      },
    },
    logo: {
      path: './public/logo.png',
      size: [128, 128],
    },
  }),
});
