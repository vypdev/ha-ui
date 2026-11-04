import test from 'node:test';
import assert from 'node:assert/strict';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
import {mkdtemp, mkdir, readFile, writeFile, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('../../', import.meta.url));
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

test('the actual packed contract is reproducible and compiles/imports in a clean DOM-free consumer', {timeout: 60_000}, async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'ha-ui-packed-contract-'));
  let passed = false;
  try {
    const archives = [];
    for (const index of [1, 2]) {
      const destination = join(scratch, 'pack-' + index); await mkdir(destination);
      await execute('pnpm', ['build'], {cwd: root});
      await execute('pnpm', ['--dir', 'packages/core', 'pack', '--pack-destination', destination], {cwd: root});
      const names = (await readdir(destination)).filter(name => name.endsWith('.tgz'));
      assert.equal(names.length, 1); archives.push(join(destination, names[0]));
    }
    const first = await readFile(archives[0]), second = await readFile(archives[1]);
    assert.deepEqual(first, second, 'Repeated independent builds must produce the same packed bytes');
    const consumer = join(scratch, 'consumer'); await mkdir(consumer);
    await writeFile(join(consumer, 'package.json'), JSON.stringify({name:'packed-contract-fixture', private:true, type:'module', packageManager:'pnpm@10.34.0', dependencies:{'@vypdev/ha-ui':'file:'+archives[0]}}));
    await execute('pnpm', ['install', '--offline', '--ignore-scripts'], {cwd: consumer});
    await writeFile(join(consumer, 'contract.ts'), `import {navigationState, type NavigationKind} from '@vypdev/ha-ui/contracts';
const kind: NavigationKind = 'panels';
const selected: string | null = navigationState({kind, label:'Sections', selected:null, items:[]}).selected;
void selected;`);
    await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify({compilerOptions:{target:'ES2024',module:'NodeNext',moduleResolution:'NodeNext',strict:true,noEmit:true,lib:['ES2024'],types:[]},include:['contract.ts']}));
    await execute(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'], {cwd: consumer});
    const probe = await execute(process.execPath, ['--input-type=module', '-e', `import {navigationState} from '@vypdev/ha-ui/contracts';
if(typeof document!=='undefined'||typeof customElements!=='undefined') throw Error('Expected a server-only consumer');
const value=navigationState({kind:'navigation',label:'Sections',selected:'tasks',items:[{id:'tasks',label:'Tareas 🧹',href:'#tasks'}]});
if(value.selected!=='tasks'||!Object.isFrozen(value.items))throw Error('Packed contract did not preserve controlled state');
console.log('Packed contract imported without DOM globals');`], {cwd: consumer});
    assert.match(probe.stdout, /Packed contract imported without DOM globals/u);
    const installed = join(consumer, 'node_modules/@vypdev/ha-ui');
    for (const file of ['dist/contracts.js','dist/contracts.d.ts','src/contracts.ts','LICENSE'])
      assert.deepEqual(await readFile(join(installed,file)),await readFile(resolve(root,'packages/core',file)));
    await mkdir(resolve(root, 'test-results'), {recursive:true});
    await writeFile(resolve(root, 'test-results/packed-contract.json'), JSON.stringify({scope:'Core data contract only; no rendered component, adapter or application adoption',sha256:digest(first),bytes:first.byteLength,reproducible:true,cleanOfflineInstall:true,compiledWithoutDomTypes:true,serverImport:true},null,2)+'\n');
    passed = true;
  } finally {
    if (passed) await rm(scratch, {recursive:true});
    else console.error('Failed packed-consumer fixture retained at '+scratch);
  }
});
