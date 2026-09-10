import '@testing-library/jest-dom/vitest';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
/// <reference types="vitest/globals" />
import { setProjectAnnotations } from '@storybook/vue3';
import * as projectAnnotations from './preview';

const project = setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

beforeAll(project.beforeAll);
