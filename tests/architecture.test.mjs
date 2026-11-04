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
  expect(imports(code)).toEqual(['./presentation-text.js']);
  expect(imports(readFileSync('packages/core/src/field-contracts.ts','utf8'))).toEqual(['./presentation-text.js']);
  expect(imports(readFileSync('packages/core/src/button-contracts.ts','utf8'))).toEqual(['./presentation-text.js']);
  expect(imports(readFileSync('packages/core/src/presentation-text.ts','utf8'))).toEqual([]);
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
  for (const command of ['pnpm install --frozen-lockfile --ignore-scripts', 'pnpm check', 'pnpm exec playwright install --with-deps chromium --only-shell', 'pnpm test', 'pnpm build', 'pnpm test:package','pnpm storybook:build','pnpm test:storybook']) expect(commands).toContain(command);
  const sdk = job.steps.find(step => step.with?.repository === 'vypdev/copilot');
  expect(sdk.with.ref).toBe('3e7ceea08e6131360e026937d1c0cc1b120472e0');
  expect(sdk.with['persist-credentials']).toBe(false);
  expect(commands.some(command => command.includes('specification_catalog_validator.cjs') && command.includes('main([], process.cwd())'))).toBe(true);
  const artifact = job.steps.find(step => step.uses?.startsWith('actions/upload-artifact@'));
  expect(artifact.if).toBe('${{ always() }}');
});
test('test configuration covers every package and authored tool per file without hiding runtime modules', () => {
  const source = readFileSync('vitest.config.ts', 'utf8');
  expect(source).toContain("completeCoverage(['packages/*/src', 'tooling', 'stories', '.storybook'], 'coverage')");
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(manifest.scripts.test).toBe('vitest run --coverage && node --test tests/coverage-evidence.test.mjs');
});

const adapterFrameworks={react:'react',vue:'vue',angular:'@angular/core',svelte:'svelte'};
function adapterImport(framework,specifier) {
  if (specifier==='@vypdev/ha-ui' || specifier.startsWith('@vypdev/ha-ui/')) return true;
  if (specifier.startsWith('.')) return true;
  if (framework==='angular' && specifier==='@angular/forms') return true;
  const own=adapterFrameworks[framework];
  return specifier===own || specifier.startsWith(own+'/');
}
test('each adapter imports only its own framework, local bindings and the shared core',()=>{
  for (const framework of Object.keys(adapterFrameworks)) for (const file of globSync('packages/'+framework+'/src/**/*.{ts,svelte}')) {
    const original=readFileSync(file,'utf8');
    const code=file.endsWith('.svelte')?original.match(/<script[^>]*>([\s\S]*?)<\/script>/u)[1]:original;
    for (const dependency of imports(code)) {
      expect(adapterImport(framework,dependency),file+': '+dependency).toBe(true);
      if (dependency.startsWith('.')) expect(relative(resolve('packages',framework,'src'),resolve(dirname(file),dependency)).startsWith('..')).toBe(false);
    }
    expect(original).not.toMatch(/<style|role=["'](?:tab|tablist|tabpanel)|<nav[ >]|<button[ >]/u);
  }
});
test('adapter direction rejects other frameworks, adapters, application code and server I/O',()=>{
  for (const [framework,dependency] of [['react','vue'],['vue','@vypdev/ha-ui-react'],['angular','lit'],['svelte','@angular/core'],['react','domus'],['vue','node:fs'],['angular','homeassistant-gateway']])
    expect(adapterImport(framework,dependency)).toBe(false);
});
test('framework entrypoints never import the core DOM renderer at runtime or register tags',()=>{
  for (const framework of Object.keys(adapterFrameworks)) for (const file of globSync('packages/'+framework+'/src/**/*.{ts,svelte}')) {
    const original=readFileSync(file,'utf8');
    const code=file.endsWith('.svelte')?original.match(/<script[^>]*>([\s\S]*?)<\/script>/u)[1]:original;
    const parsed=ts.createSourceFile('source.ts',code,ts.ScriptTarget.Latest,true);
    for (const node of parsed.statements) if (ts.isImportDeclaration(node) && node.moduleSpecifier.text.startsWith('@vypdev/ha-ui'))
      expect(node.importClause.isTypeOnly||node.moduleSpecifier.text==='@vypdev/ha-ui/field-contracts',file).toBe(true);
    expect(code).not.toMatch(/customElements|registerTabs/u);
  }
});
test('adapter manifests keep other frameworks out and retain the exact shared cohort',()=>{
  for (const [framework,peer] of Object.entries(adapterFrameworks)) {
    const manifest=JSON.parse(readFileSync('packages/'+framework+'/package.json','utf8'));
    expect(Object.keys(manifest.peerDependencies)).toEqual(framework==='angular'?[peer,'@angular/forms']:[peer]);
    expect(manifest.dependencies['@vypdev/ha-ui']).toBe(framework==='angular'?'0.1.0-next.1':'workspace:*');
    expect(Object.keys(manifest.dependencies).sort()).toEqual(framework==='angular'?['@vypdev/ha-ui','tslib']:['@vypdev/ha-ui']);
    expect(manifest.version).toBe(JSON.parse(readFileSync('packages/core/package.json','utf8')).version);
  }
});

test('strict checks cover the source, Node consumer tooling and every Svelte fixture',()=>{
  const manifest=JSON.parse(readFileSync('package.json','utf8'));
  for (const command of ['tsc --noEmit -p tsconfig.json','tsc --noEmit -p tsconfig.consumers.json','svelte-check --tsconfig tsconfig.svelte-source.json','svelte-check --tsconfig tsconfig.svelte-tests.json'])expect(manifest.scripts.check).toContain(command);
  const source=JSON.parse(readFileSync('tsconfig.json','utf8'));
  expect(source.compilerOptions.strict).toBe(true);expect(source.compilerOptions.skipLibCheck).toBe(false);
  for (const framework of Object.keys(adapterFrameworks)) {
    const fixture=JSON.parse(readFileSync('tests/consumers/fixtures/'+framework+'/tsconfig.json','utf8'));
    expect(fixture.compilerOptions.strict).toBe(true);expect(fixture.compilerOptions.skipLibCheck).toBe(false);
  }
});

test('CSF test definitions delegate all rendering to independently covered examples',()=>{
  for(const file of globSync('stories/*.stories.ts')) {
    const code=readFileSync(file,'utf8');
    expect(code).toContain('render:renderExample');
    expect(imports(code).some(path=>path.endsWith('.example.js'))).toBe(true);
    expect(code).not.toMatch(/html`|catalogExample\(|customElements\.define|attachShadow|<style/u);
  }
  for(const file of globSync('stories/*.example.ts')) {
    const code=readFileSync(file,'utf8');expect(code).toContain('catalogExample(controls,');
    expect(code).not.toMatch(/customElements\.define|attachShadow|<input[ >]|<nav[ >]|role=["'](?:tab|tablist|tabpanel)/u);
  }
});
test('Pages builds only the trusted default branch and grants write permissions only to deployment',()=>{
  const workflow=parse(readFileSync('.github/workflows/storybook_pages.yml','utf8'));
  expect(workflow.on.push.branches).toEqual(['master']);expect(workflow.on.pull_request).toBeUndefined();
  expect(workflow.permissions).toEqual({contents:'read'});
  const build=workflow.jobs.build,deploy=workflow.jobs.deploy;
  expect(build.if).toBe("github.ref == 'refs/heads/master'");expect(build.permissions).toBeUndefined();
  for(const command of ['pnpm install --frozen-lockfile --ignore-scripts','pnpm check','pnpm test','pnpm test:package','pnpm storybook:build','pnpm test:storybook'])expect(build.steps.flatMap(step=>step.run?[step.run]:[])).toContain(command);
  expect(deploy.needs).toBe('build');expect(deploy.permissions).toEqual({pages:'write','id-token':'write'});
  expect(deploy.environment.name).toBe('github-pages');expect(workflow.concurrency['cancel-in-progress']).toBe(false);
});
