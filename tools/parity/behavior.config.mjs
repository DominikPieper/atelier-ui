/**
 * Atelier behaviour-coverage config for the typed behavior-coverage gate.
 * Every behaviour id in behaviors.json must be bound to a test via
 * `covers('<subject>', '<id>')(…)` in each framework adapter's spec file for
 * that component. The id is typed (BehaviorId<Subject>), so a typo is a compile
 * error; the gate AST-reads the covers() calls to enforce cross-framework parity.
 */
export default {
  manifestPath: 'libs/spec/src/behaviors.json',
  binder: 'covers',
  implementations: {
    angular: 'libs/angular/src/lib/{subject}',
    react: 'libs/react/src/lib/{subject}',
    vue: 'libs/vue/src/lib/{subject}',
  },
  filePattern: /\.spec\.(ts|tsx)$/,
  label: 'behavior',
};
