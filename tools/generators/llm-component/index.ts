import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';

interface LlmComponentSchema {
  name: string;
  directory?: string;
}

export default async function generator(tree: Tree, options: LlmComponentSchema) {
  const componentNames = names(options.name);
  const dir = options.directory ?? options.name;
  const libRoot = 'libs/llm-components/src/lib';
  const componentDir = `${libRoot}/${dir}`;

  // Generate component files from templates
  generateFiles(tree, path.join(__dirname, 'files'), componentDir, {
    ...componentNames,
    // e.g. name='tooltip' → selector='llm-tooltip', className='LlmTooltip'
    selector: `llm-${componentNames.fileName}`,
    className: `Llm${componentNames.className}`,
    tmpl: '',
  });

  // Append export to index.ts
  const indexPath = 'libs/llm-components/src/index.ts';
  const currentContent = tree.read(indexPath, 'utf-8') ?? '';
  const exportLine = `export { Llm${componentNames.className} } from './lib/${dir}/llm-${componentNames.fileName}';\n`;

  if (!currentContent.includes(exportLine.trim())) {
    tree.write(indexPath, currentContent + exportLine);
  }

  await formatFiles(tree);
}
