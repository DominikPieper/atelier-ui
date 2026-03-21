import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Atelier UI · Angular',
    brandImage: '/artelier-logo.png',
    brandUrl: 'https://github.com/DominikPieper/atelier-ui',
  }),
});
