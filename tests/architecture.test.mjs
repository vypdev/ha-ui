import {test, expect} from 'vitest';
import {readFileSync, globSync} from 'node:fs';
import {resolve, relative, dirname} from 'node:path';
import ts from 'typescript';
import {parse} from 'yaml';

function imports(code) {
  const source = ts.createSourceFile('source.ts', code, ts.ScriptTarget.Latest, true);
  const results = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier)
      results.push(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
      results.push(ts.isStringLiteral(node.arguments[0]) ? node.arguments[0].text : '<dynamic>');
    ts.forEachChild(node, visit);
  }
  visit(source); return results;
}
function allowed(specifier) {
  return !specifier.startsWith('node:') && !/^(react|react-dom|vue|svelte|@angular)(\/|$)/u.test(specifier)
    && !specifier.includes('domus') && !specifier.includes('gateway') && specifier !== '<dynamic>';
}
test('the pure contract does not acquire framework or application imports', () => {
  const code = readFileSync('packages/core/src/contracts.ts', 'utf8');
  expect(imports(code)).toEqual([]);
});
test('architecture policy rejects direct, re-exported and dynamic framework dependencies', () => {
  for (const code of ['import x from "react";', 'export * from "@angular/core";', 'await import("vue");', 'await import(target);'])
    expect(imports(code).some(specifier => !allowed(specifier))).toBe(true);
});
test('every actual core module respects the dependency boundary', () => {
  for (const file of globSync('packages/core/src/**/*.ts')) for (const dependency of imports(readFileSync(file, 'utf8'))) {
    expect(allowed(dependency), `${file}: ${dependency}`).toBe(true);
    if (dependency.startsWith('.')) expect(relative(resolve('packages/core/src'), resolve(dirname(file), dependency)).startsWith('..')).toBe(false);
  }
});
test('CI Check runs for every PR update with frozen tools and all implemented quality gates', () => {
  const workflow = parse(readFileSync('.github/workflows/ci_check.yml', 'utf8'));
  expect(workflow.name).toBe('CI Check');
  expect(workflow.on.pull_request.types).toEqual(expect.arrayContaining(['opened','reopened','synchronize','ready_for_review','converted_to_draft']));
  expect(workflow.on.pull_request.paths).toBeUndefined();
  const job = workflow.jobs.quality;
  expect(job.name).toBe('CI Check'); expect(job.if).toBeUndefined();
  expect(job['continue-on-error']).toBeUndefined();
  expect(job.steps.every(step => step['continue-on-error'] === undefined)).toBe(true);
  const commands = job.steps.flatMap(step => step.run ? [step.run] : []);
  for (const command of ['pnpm install --frozen-lockfile --ignore-scripts', 'pnpm check', 'pnpm test', 'pnpm build', 'pnpm test:package']) expect(commands).toContain(command);
  const sdk = job.steps.find(step => step.with?.repository === 'vypdev/copilot');
  expect(sdk.with.ref).toBe('3e7ceea08e6131360e026937d1c0cc1b120472e0');
  expect(sdk.with['persist-credentials']).toBe(false);
  expect(commands.some(command => command.includes('specification_catalog_validator.cjs') && command.includes('main([], process.cwd())'))).toBe(true);
  const artifact = job.steps.find(step => step.uses?.startsWith('actions/upload-artifact@'));
  expect(artifact.if).toBe('${{ always() }}');
});
test('test configuration covers every package and authored tool per file without hiding runtime modules', () => {
  const source = readFileSync('vitest.config.ts', 'utf8');
  expect(source).toContain("completeCoverage(['packages/*/src', 'tooling'], 'coverage')");
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(manifest.scripts.test).toBe('vitest run --coverage && node --test tests/coverage-evidence.test.mjs');
});
