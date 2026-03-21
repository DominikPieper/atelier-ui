/// <reference types="vitest/globals" />
import { setProjectAnnotations } from '@storybook/angular';
import * as projectAnnotations from './preview';

const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
