import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';

interface LlmComponentSchema {
  name: string;
  directory?: string;
  /** Which framework(s) to scaffold. Defaults to 'all'. */
  framework?: 'angular' | 'react' | 'vue' | 'both' | 'all';
}

export default async function generator(tree: Tree, options: LlmComponentSchema) {
  const framework = options.framework ?? 'all';
  const componentNames = names(options.name);
  const dir = options.directory ?? options.name;

  const isAll = framework === 'all';
  const isBoth = framework === 'both';

  if (framework === 'angular' || isBoth || isAll) {
    const angularDir = `libs/angular/src/lib/${dir}`;

    generateFiles(tree, path.join(__dirname, 'files'), angularDir, {
      ...componentNames,
      selector: `llm-${componentNames.fileName}`,
      className: `Llm${componentNames.className}`,
      tmpl: '',
    });

    const indexPath = 'libs/angular/src/index.ts';
    const currentContent = tree.read(indexPath, 'utf-8') ?? '';
    const exportLine = `export { Llm${componentNames.className} } from './lib/${dir}/llm-${componentNames.fileName}';\n`;
    if (!currentContent.includes(exportLine.trim())) {
      tree.write(indexPath, currentContent + exportLine);
    }
  }

  if (framework === 'react' || isBoth || isAll) {
    const reactDir = `libs/react/src/lib/${dir}`;
    const reactFilesDir = path.join(__dirname, '../llm-component-react/files');

    generateFiles(tree, reactFilesDir, reactDir, {
      ...componentNames,
      className: `Llm${componentNames.className}`,
      fileName: componentNames.fileName,
      tmpl: '',
    });

    const indexPath = 'libs/react/src/index.ts';
    const currentContent = tree.read(indexPath, 'utf-8') ?? '';
    const exportLine = `export * from './lib/${dir}/llm-${componentNames.fileName}';\n`;
    if (!currentContent.includes(exportLine.trim())) {
      tree.write(indexPath, currentContent + exportLine);
    }
  }

  if (framework === 'vue' || isAll) {
    const vueDir = `libs/vue/src/lib/${dir}`;
    const vueFilesDir = path.join(__dirname, '../llm-component-vue/files');

    generateFiles(tree, vueFilesDir, vueDir, {
      ...componentNames,
      className: `Llm${componentNames.className}`,
      fileName: componentNames.fileName,
      tmpl: '',
    });

    const indexPath = 'libs/vue/src/index.ts';
    const currentContent = tree.read(indexPath, 'utf-8') ?? '';
    const exportLine = `export { default as Llm${componentNames.className} } from './lib/${dir}/llm-${componentNames.fileName}.vue';\n`;
    if (!currentContent.includes(exportLine.trim())) {
      tree.write(indexPath, currentContent + exportLine);
    }
  }

  await formatFiles(tree);
}
