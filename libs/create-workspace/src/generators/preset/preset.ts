import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { applicationGenerator } from '@nx/angular/generators';
import * as path from 'path';
import { PresetGeneratorSchema } from './schema';

export async function presetGenerator(tree: Tree, options: PresetGeneratorSchema) {
  const appName = options.appName ?? 'workshop';

  // 1. Create an Angular application
  await applicationGenerator(tree, {
    name: appName,
    directory: appName,
    style: 'css',
    routing: true,
    standalone: true,
    ssr: false,
    skipTests: true,
    skipFormat: true,
  });

  // 2. Add @atelier-ui/angular and @atelier-ui/spec as dependencies
  const installTask = addDependenciesToPackageJson(
    tree,
    {
      '@atelier-ui/angular': 'latest',
      '@atelier-ui/spec': 'latest',
    },
    {}
  );

  // 3. Write static template files (.claude/settings.json, README)
  generateFiles(tree, path.join(__dirname, 'files'), '.', options);

  await formatFiles(tree);

  return runTasksInSerial(installTask, () => installPackagesTask(tree));
}

export default presetGenerator;
