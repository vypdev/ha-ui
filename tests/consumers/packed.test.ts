import test from 'node:test';
import assert from 'node:assert/strict';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
import {mkdtemp, mkdir, readFile, writeFile, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createServer} from 'vite';
import {chromium} from 'playwright';
import {parse, stringify} from 'yaml';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('../../', import.meta.url));
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

test('the actual packed package is reproducible and passes clean DOM-free and real-browser consumers', {timeout: 60_000}, async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'ha-ui-packed-contract-'));
  let passed = false;
  let server: Awaited<ReturnType<typeof createServer>> | undefined;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
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
    const cache=join(scratch,'empty-metadata-cache');
    const configuration=stringify({packages:[],autoInstallPeers:false,cacheDir:cache});
    await writeFile(join(consumer,'pnpm-workspace.yaml'),configuration);
    // A separate negative fixture reproduces the exact hosted failure with no ambient metadata.
    const negative=join(scratch,'without-lock'); await mkdir(negative);
    await writeFile(join(negative,'package.json'),await readFile(join(consumer,'package.json')));
    await writeFile(join(negative,'pnpm-workspace.yaml'),configuration);
    await assert.rejects(execute('pnpm',['install','--offline','--ignore-scripts'],{cwd:negative}),error=>{
      assert.ok(error instanceof Error && 'stdout' in error);
      assert.match(String(error.stdout),/ERR_PNPM_NO_OFFLINE_META/u); return true;
    });
    const sourceLock=parse(await readFile(resolve(root,'pnpm-lock.yaml'),'utf8'));
    const manifest=JSON.parse(await readFile(resolve(root,'packages/core/package.json'),'utf8'));
    const direct=sourceLock.importers['packages/core'].dependencies as Record<string,{specifier:string;version:string}>;
    const runtime: Record<string,string>={};
    for (const [name,pin] of Object.entries(direct)) {
      assert.equal(pin.specifier,manifest.dependencies[name]); runtime[name]=pin.version;
    }
    const packages: Record<string,unknown>={}, snapshots: Record<string,unknown>={};
    const pending=Object.entries(runtime).map(([name,version])=>name+'@'+version);
    for (const key of pending) {
      if (Object.hasOwn(snapshots,key)) continue;
      assert.ok(Object.hasOwn(sourceLock.packages,key) && Object.hasOwn(sourceLock.snapshots,key),'Every runtime node must have a reviewed exact source lock entry: '+key);
      packages[key]=sourceLock.packages[key]; snapshots[key]=sourceLock.snapshots[key];
      for (const [name,version] of Object.entries(sourceLock.snapshots[key].dependencies ?? {})) pending.push(name+'@'+String(version));
    }
    const fileVersion='file:'+relative(consumer,archives[0]).replaceAll('\\','/');
    const archiveKey=manifest.name+'@'+fileVersion;
    packages[archiveKey]={resolution:{integrity:'sha512-'+createHash('sha512').update(first).digest('base64'),tarball:fileVersion},version:manifest.version};
    snapshots[archiveKey]={dependencies:runtime};
    const frozenLock=stringify({lockfileVersion:sourceLock.lockfileVersion,settings:sourceLock.settings,importers:{'.':{dependencies:{[manifest.name]:{specifier:'file:'+archives[0],version:fileVersion}}}},packages,snapshots});
    await writeFile(join(consumer,'pnpm-lock.yaml'),frozenLock);
    const cacheConfiguration=await execute('pnpm',['config','get','cache-dir'],{cwd:consumer}); assert.equal(cacheConfiguration.stdout.trim(),cache);
    await execute('pnpm', ['install', '--frozen-lockfile', '--offline', '--ignore-scripts'], {cwd: consumer});
    assert.equal(await readFile(join(consumer,'pnpm-lock.yaml'),'utf8'),frozenLock);
    await assert.rejects(readFile(join(cache,'metadata-v1.3/registry.npmjs.org/lit.json')),{code:'ENOENT'});
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
    const packageFiles=['LICENSE'];
    for (const module of ['contracts','index','components/tabs']) {
      packageFiles.push('src/'+module+'.ts');
      for (const suffix of ['.js','.js.map','.d.ts','.d.ts.map']) packageFiles.push('dist/'+module+suffix);
    }
    for (const file of packageFiles)
      assert.deepEqual(await readFile(join(installed,file)),await readFile(resolve(root,'packages/core',file)));
    await writeFile(join(consumer,'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Packed navigation consumer</title></head><body><main></main><script type="module" src="/client.ts"></script></body></html>');
    await writeFile(join(consumer,'client.ts'), `import {registerTabs} from '@vypdev/ha-ui/tabs';
import {navigationState} from '@vypdev/ha-ui/contracts';
registerTabs();
const element=document.createElement('vyp-ha-tabs');
element.state=navigationState({kind:'navigation',label:'Household sections',selected:'overview',items:[{id:'overview',label:'Overview',href:'#overview'},{id:'tasks',label:'Tasks',href:'#tasks'}]});
element.addEventListener('ha-selection-request',event=>{event.preventDefault();element.state=navigationState({...element.state,selected:event.detail.id});});
document.querySelector('main')!.append(element);`);
    await writeFile(join(consumer,'client.tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2024',module:'NodeNext',moduleResolution:'NodeNext',strict:true,noEmit:true,lib:['ES2024','DOM'],types:[]},include:['client.ts']}));
    await execute(process.execPath,[resolve(root,'node_modules/typescript/bin/tsc'),'-p','client.tsconfig.json'],{cwd:consumer});
    server=await createServer({configFile:false,root:consumer,logLevel:'error',server:{host:'127.0.0.1',port:0}});
    await server.listen(); const address=server.httpServer!.address(); assert.ok(address && typeof address==='object');
    browser=await chromium.launch(); const browserPage=await browser.newPage({viewport:{width:360,height:640},reducedMotion:'reduce'});
    const errors: string[]=[]; browserPage.on('pageerror',error=>errors.push(error.message));
    await browserPage.goto('http://127.0.0.1:'+address.port);
    assert.equal(await browserPage.getByRole('navigation',{name:'Household sections'}).isVisible(),true);
    await browserPage.getByRole('link',{name:'Tasks',exact:true}).click();
    await browserPage.waitForFunction(()=>document.querySelector('vyp-ha-tabs')!.state.selected==='tasks');
    assert.equal(await browserPage.getByRole('link',{name:'Tasks',exact:true}).getAttribute('aria-current'),'page');
    assert.equal(new URL(browserPage.url()).hash,'','Canceled native link must not change location');
    await mkdir(resolve(root,'test-results'),{recursive:true});
    await browserPage.locator('vyp-ha-tabs').screenshot({path:resolve(root,'test-results/packed-navigation-light.png')});
    await browserPage.evaluate(async()=>{
      const element=document.querySelector('vyp-ha-tabs')!;
      element.state={kind:'panels',label:'Secciones del hogar',selected:'overview',items:[{id:'overview',label:'Resumen',disabled:false,href:null},{id:'tasks',label:'Tareas',disabled:false,href:null}]};
      const content=document.createElement('button'); content.slot='tasks'; content.textContent='Nueva tarea'; element.append(content);
      document.documentElement.lang='es';
      element.style.cssText='--primary-text-color:rgb(235,235,235);--secondary-text-color:rgb(189,189,189);--card-background-color:rgb(20,20,20);--divider-color:rgb(66,66,66);--primary-color:rgb(3,169,244)';
      await element.updateComplete;
    });
    await browserPage.getByRole('tab',{name:'Resumen',exact:true}).focus();
    await browserPage.keyboard.press('End');
    assert.equal(await browserPage.getByRole('tab',{name:'Tareas',exact:true}).evaluate(element=>element.matches(':focus-visible')),true);
    await browserPage.keyboard.press('Enter');
    assert.equal(await browserPage.getByRole('tabpanel',{name:'Tareas',exact:true}).isVisible(),true);
    assert.equal(await browserPage.getByRole('button',{name:'Nueva tarea',exact:true}).isVisible(),true);
    await browserPage.locator('vyp-ha-tabs').screenshot({path:resolve(root,'test-results/packed-panels-dark-es.png')});
    assert.deepEqual(errors,[]);
    const packedBrowser={engine:'chromium',version:browser.version(),compiledClient:true,navigation:true,panels:true,runtimeSpanishAndTheme:true,reducedMotion:true,consoleErrors:errors};
    await mkdir(resolve(root, 'test-results'), {recursive:true});
    await writeFile(resolve(root, 'test-results/packed-contract.json'), JSON.stringify({scope:'Core data and navigation component only; no framework adapter or application adoption',sha256:digest(first),bytes:first.byteLength,reproducible:true,cleanOfflineInstall:true,frozenRuntimeLock:true,isolatedMetadataCache:true,negativeWithoutLockRejected:true,compiledWithoutDomTypes:true,serverImport:true,packedBrowser},null,2)+'\n');
    passed = true;
  } finally {
    await browser?.close(); await server?.close();
    if (passed) await rm(scratch, {recursive:true});
    else console.error('Failed packed-consumer fixture retained at '+scratch);
  }
});
