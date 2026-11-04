import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {completeCoverage} from './tooling/coverage.mjs';
const contractSources={'@vypdev/ha-ui/field-contracts':fileURLToPath(new URL('./packages/core/src/field-contracts.ts',import.meta.url))};
export default defineConfig({test: {
  projects: [
    {resolve:{alias:contractSources},test: {name:'node', include:['tests/**/*.test.{ts,mjs}'], exclude:['tests/browser/**','tests/coverage-evidence.test.mjs','tests/consumers/packed.test.ts']}},
    {resolve:{alias:contractSources},plugins:[svelte({configFile:'packages/svelte/svelte.config.js'})],test: {name:'browser', include:['tests/browser/**/*.test.{ts,mjs}'], browser:{enabled:true,provider:playwright(),headless:true,instances:[{browser:'chromium'}]}}},
  ],
  coverage: completeCoverage(['packages/*/src', 'tooling'], 'coverage'),
}});
