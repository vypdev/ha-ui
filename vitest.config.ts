import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {completeCoverage} from './tooling/coverage.mjs';
export default defineConfig({test: {
  projects: [
    {test: {name:'node', include:['tests/**/*.test.{ts,mjs}'], exclude:['tests/browser/**','tests/coverage-evidence.test.mjs','tests/consumers/packed.test.ts']}},
    {plugins:[svelte({configFile:'packages/svelte/svelte.config.js'})],test: {name:'browser', include:['tests/browser/**/*.test.{ts,mjs}'], browser:{enabled:true,provider:playwright(),headless:true,instances:[{browser:'chromium'}]}}},
  ],
  coverage: completeCoverage(['packages/*/src', 'tooling'], 'coverage'),
}});
