/// <reference types="vitest/globals" />
import { setProjectAnnotations } from '@analogjs/storybook-angular';
import * as projectAnnotations from './preview';

const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
