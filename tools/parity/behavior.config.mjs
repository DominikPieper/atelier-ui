/**
 * Atelier behaviour-coverage config for the generic marker-coverage runner.
 * Every behaviour id in behaviors.json must be tagged `// @behavior <id>` in
 * each framework adapter's spec file for that component.
 */
export default {
  manifestPath: 'libs/spec/src/behaviors.json',
  marker: '@behavior',
  implementations: {
    angular: 'libs/angular/src/lib/{subject}',
    react: 'libs/react/src/lib/{subject}',
    vue: 'libs/vue/src/lib/{subject}',
  },
  filePattern: /\.spec\.(ts|tsx)$/,
  label: 'behavior',
};
