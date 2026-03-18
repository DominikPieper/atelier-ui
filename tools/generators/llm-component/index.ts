import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';

interface LlmComponentSchema {
  name: string;
  directory?: string;
  /** Which framework(s) to scaffold. Defaults to 'both'. */
  framework?: 'angular' | 'react' | 'both';
}

export default async function generator(tree: Tree, options: LlmComponentSchema) {
  const framework = options.framework ?? 'both';
  const componentNames = names(options.name);
  const dir = options.directory ?? options.name;

  if (framework === 'angular' || framework === 'both') {
    const angularDir = `libs/llm-components-angular/src/lib/${dir}`;

    generateFiles(tree, path.join(__dirname, 'files'), angularDir, {
      ...componentNames,
      selector: `llm-${componentNames.fileName}`,
      className: `Llm${componentNames.className}`,
      tmpl: '',
    });

    const indexPath = 'libs/llm-components-angular/src/index.ts';
    const currentContent = tree.read(indexPath, 'utf-8') ?? '';
    const exportLine = `export { Llm${componentNames.className} } from './lib/${dir}/llm-${componentNames.fileName}';\n`;
    if (!currentContent.includes(exportLine.trim())) {
      tree.write(indexPath, currentContent + exportLine);
    }
  }

  if (framework === 'react' || framework === 'both') {
    const reactDir = `libs/llm-components-react/src/lib/${dir}`;
    const reactFilesDir = path.join(__dirname, '../llm-component-react/files');

    generateFiles(tree, reactFilesDir, reactDir, {
      ...componentNames,
      className: `Llm${componentNames.className}`,
      fileName: componentNames.fileName,
      tmpl: '',
    });

    const indexPath = 'libs/llm-components-react/src/index.ts';
    const currentContent = tree.read(indexPath, 'utf-8') ?? '';
    const exportLine = `export * from './lib/${dir}/llm-${componentNames.fileName}';\n`;
    if (!currentContent.includes(exportLine.trim())) {
      tree.write(indexPath, currentContent + exportLine);
    }
  }

  await formatFiles(tree);
}
