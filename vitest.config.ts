import {defineConfig} from 'vitest/config';
import {completeCoverage} from './tooling/coverage.mjs';
export default defineConfig({test: {
  include: ['tests/**/*.test.{ts,mjs}'], exclude: ['tests/coverage-evidence.test.mjs', 'tests/consumers/packed.test.ts'],
  coverage: completeCoverage(['packages/*/src', 'tooling'], 'coverage'),
}});
