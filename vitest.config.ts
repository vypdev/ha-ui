import {fileURLToPath} from 'node:url';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {completeCoverage} from './tooling/coverage.mjs';
const contractSources=Object.fromEntries([['@vypdev/ha-ui/contracts','contracts.ts'],['@vypdev/ha-ui/field-contracts','field-contracts.ts'],['@vypdev/ha-ui/button-contracts','button-contracts.ts'],['@vypdev/ha-ui/tabs','components/tabs.ts'],['@vypdev/ha-ui/field','components/field.ts'],['@vypdev/ha-ui/button','components/button.ts'],['@vypdev/ha-ui/select-contracts','select-contracts.ts'],['@vypdev/ha-ui/select','components/select.ts'],['@vypdev/ha-ui/checkbox-contracts','checkbox-contracts.ts'],['@vypdev/ha-ui/checkbox','components/checkbox.ts'],['@vypdev/ha-ui/dialog-contracts','dialog-contracts.ts'],['@vypdev/ha-ui/dialog','components/dialog.ts'],['@vypdev/ha-ui/card-contracts','card-contracts.ts'],['@vypdev/ha-ui/card','components/card.ts']].map(([name,file])=>[name,fileURLToPath(new URL('./packages/core/src/'+file,import.meta.url))]));
export default defineConfig({test: {
  projects: [
    {resolve:{alias:contractSources},test: {name:'node', include:['tests/**/*.test.{ts,mjs}'], exclude:['tests/browser/**','tests/coverage-evidence.test.mjs','tests/consumers/packed.test.ts','tests/storybook/**']}},
    {resolve:{alias:contractSources},optimizeDeps:{include:['storybook/internal/core-events','storybook/internal/channels','axe-core','lit/static-html.js']},plugins:[svelte({configFile:'packages/svelte/svelte.config.js'})],test: {name:'browser', include:['tests/browser/**/*.test.{ts,mjs}'], browser:{enabled:true,provider:playwright(),headless:true,instances:[{browser:'chromium'}]}}},
    {extends:true,resolve:{alias:contractSources},optimizeDeps:{include:['lit','lit/static-html.js','lit/directives/style-map.js','storybook/internal/core-events']},plugins:[storybookTest({configDir:fileURLToPath(new URL('./.storybook',import.meta.url))})],test:{name:'storybook',browser:{enabled:true,provider:playwright(),headless:true,instances:[{browser:'chromium'}]}}},
  ],
  coverage: {...completeCoverage(['packages/*/src', 'tooling', 'stories', '.storybook'], 'coverage'),exclude:['stories/**/*.stories.ts']},
}});
