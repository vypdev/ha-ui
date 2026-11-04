import assert from 'node:assert/strict';
import {globSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {test} from 'node:test';
import {coverageProblems, runtimeExtensions} from '../tooling/coverage.mjs';

test('coverage includes every authored package/tool file and all four metrics', () => {
  const files = ['packages/*/src', 'tooling', 'stories', '.storybook'].flatMap(directory => globSync(`${directory}/**/*.${runtimeExtensions}`))
    .filter(path => !/\.d\.(ts|mts|cts)$|\.stories\.ts$/u.test(path)).map(path => resolve(path));
  const report = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'));
  assert.deepEqual(coverageProblems(report, files), []);
});
