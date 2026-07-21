import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';

interface AtlComponentReactSchema {
  name: string;
  directory?: string;
}

export default async function generator(tree: Tree, options: AtlComponentReactSchema) {
  const componentNames = names(options.name);
  const dir = options.directory ?? options.name;
  const libRoot = 'libs/react/src/lib';
  const componentDir = `${libRoot}/${dir}`;

  // Generate component files from templates
  generateFiles(tree, path.join(__dirname, 'files'), componentDir, {
    ...componentNames,
    // e.g. name='tooltip' → className='AtlTooltip'
    className: `Atl${componentNames.className}`,
    fileName: componentNames.fileName,
    tmpl: '',
  });

  // Append export to index.ts
  const indexPath = 'libs/react/src/index.ts';
  const currentContent = tree.read(indexPath, 'utf-8') ?? '';
  const exportLine = `export * from './lib/${dir}/atl-${componentNames.fileName}';\n`;

  if (!currentContent.includes(exportLine.trim())) {
    tree.write(indexPath, currentContent + exportLine);
  }

  await formatFiles(tree);
}
