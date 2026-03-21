import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';

interface LlmComponentVueSchema {
  name: string;
  directory?: string;
}

export default async function generator(tree: Tree, options: LlmComponentVueSchema) {
  const componentNames = names(options.name);
  const dir = options.directory ?? options.name;
  const libRoot = 'libs/vue/src/lib';
  const componentDir = `${libRoot}/${dir}`;

  // Generate component files from templates
  generateFiles(tree, path.join(__dirname, 'files'), componentDir, {
    ...componentNames,
    // e.g. name='tooltip' → className='LlmTooltip'
    className: `Llm${componentNames.className}`,
    fileName: componentNames.fileName,
    tmpl: '',
  });

  // Append export to index.ts
  const indexPath = 'libs/vue/src/index.ts';
  const currentContent = tree.read(indexPath, 'utf-8') ?? '';
  const exportLine = `export { default as Llm${componentNames.className} } from './lib/${dir}/llm-${componentNames.fileName}.vue';\n`;

  if (!currentContent.includes(exportLine.trim())) {
    tree.write(indexPath, currentContent + exportLine);
  }

  await formatFiles(tree);
}
