import {fileURLToPath} from 'node:url';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {completeCoverage} from './tooling/coverage.mjs';
const contractSources=Object.fromEntries([['@vypdev/ha-ui/contracts','contracts.ts'],['@vypdev/ha-ui/field-contracts','field-contracts.ts'],['@vypdev/ha-ui/tabs','components/tabs.ts'],['@vypdev/ha-ui/field','components/field.ts']].map(([name,file])=>[name,fileURLToPath(new URL('./packages/core/src/'+file,import.meta.url))]));
export default defineConfig({test: {
  projects: [
    {resolve:{alias:contractSources},test: {name:'node', include:['tests/**/*.test.{ts,mjs}'], exclude:['tests/browser/**','tests/coverage-evidence.test.mjs','tests/consumers/packed.test.ts','tests/storybook/**']}},
    {resolve:{alias:contractSources},plugins:[svelte({configFile:'packages/svelte/svelte.config.js'})],test: {name:'browser', include:['tests/browser/**/*.test.{ts,mjs}'], browser:{enabled:true,provider:playwright(),headless:true,instances:[{browser:'chromium'}]}}},
    {extends:true,resolve:{alias:contractSources},optimizeDeps:{include:['lit','lit/directives/style-map.js']},plugins:[storybookTest({configDir:fileURLToPath(new URL('./.storybook',import.meta.url))})],test:{name:'storybook',browser:{enabled:true,provider:playwright(),headless:true,instances:[{browser:'chromium'}]}}},
  ],
  coverage: completeCoverage(['packages/*/src', 'tooling', 'stories', '.storybook'], 'coverage'),
}});
