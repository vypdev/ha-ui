import {inspectToolchain} from '../../tooling/compatibility.mjs';
import {canonicalPackageArchive,captureCandidate,verifyCandidate} from '../../tooling/packaging.mjs';
import {exerciseInstalledFeedback} from './feedback.ts';
import {exerciseInstalledLayout} from './layouts.ts';
import {exerciseInstalledCard} from './cards.ts';
import {exerciseInstalledNavigationOverflow} from './navigation-overflow.ts';
import {exerciseInstalledNavigationIcons} from './navigation-icons.ts';
import {fixtureFonts} from './fonts.ts';
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
import type {HaTextField} from '../../packages/core/src/components/field.js';
import {exerciseInstalledCheckbox} from './checkboxes.ts';
import {exerciseInstalledSelect} from './selects.ts';
import {exerciseReadonlyField} from './fields.ts';
import {exerciseCoreButton} from './buttons.ts';
import {exerciseInstalledImplicitSubmit} from './implicit-submit.ts';
import {exerciseInstalledDialog} from './dialogs.ts';
import {exerciseFrameworks} from './frameworks.ts';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('../../', import.meta.url));
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

async function pristineRevision() {
  const expectedRevision = process.env.HA_UI_PACKED_EXPECTED_REVISION;
  try {
    const {stdout: status} = await execute(
      'git', ['status', '--porcelain=v1', '--untracked-files=all'], {cwd: root},
    );
    if (status !== '') {
      if (expectedRevision) throw new Error('The CI package checkout has local changes');
      return null;
    }
    const {stdout} = await execute('git', ['rev-parse', '--verify', 'HEAD'], {cwd: root});
    const revision = stdout.trim();
    if (expectedRevision) {
      assert.equal(revision, expectedRevision, 'The CI package checkout has a different revision');
    }
    return revision;
  } catch (error) {
    if (expectedRevision) throw error;
    return null;
  }
}

test('the actual packed package is reproducible and passes clean DOM-free and real-browser consumers', {timeout: 180_000}, async () => {
  const sourceRevision=await pristineRevision();
  const sourceLockBytes=await readFile(resolve(root,'pnpm-lock.yaml'));
  const sourceLock=parse(sourceLockBytes.toString('utf8'));
  const workspace=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
  const {stdout:pnpmVersion}=await execute('pnpm',['--version'],{cwd:root});
  const toolchain=inspectToolchain({node:process.versions.node,pnpm:pnpmVersion.trim(),manifest:workspace,lock:sourceLock});
  const scratch = await mkdtemp(join(tmpdir(), 'ha-ui-packed-contract-'));
  let passed = false;
  let server: Awaited<ReturnType<typeof createServer>> | undefined;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    const archives = [];
    for (const index of [1, 2]) {
      const destination = join(scratch, 'pack-' + index); await mkdir(destination);
      await execute('pnpm', ['build'], {cwd: root});
      for (const framework of ['core','react','vue','angular','svelte']) {
        const directory=framework==='angular'?'packages/angular/dist':'packages/'+framework;
        await execute('pnpm',['--dir',directory,'pack','--pack-destination',destination],{cwd:root});
      }
      const names = (await readdir(destination)).filter(name => name.endsWith('.tgz'));
      assert.equal(names.length, 5);
      for(const name of names){
        const path=join(destination,name);
        await writeFile(path,canonicalPackageArchive(await readFile(path)));
      }
      archives.push(join(destination, 'vypdev-ha-ui-0.1.0-next.2.tgz'));
      if(index===2)for(const file of names)assert.deepEqual(await readFile(join(scratch,'pack-1',file)),await readFile(join(destination,file)),'Every cohort coordinate must reproduce: '+file);
    }
    const cohort=[];
    const artifacts:{coordinate:string;version:string;bytes:Buffer}[]=[];
    for (const file of (await readdir(join(scratch,'pack-1'))).filter(name=>name.endsWith('.tgz')).sort()) {
      const bytes=await readFile(join(scratch,'pack-1',file));
      const packedMetadata=await execute('tar',['-xOf',join(scratch,'pack-1',file),'package/package.json']);
      const manifest=JSON.parse(packedMetadata.stdout);
      assert.equal(manifest.version,'0.1.0-next.2');assert.doesNotMatch(packedMetadata.stdout,/workspace:|file:/u);
      cohort.push({coordinate:manifest.name,version:manifest.version,sha256:digest(bytes),bytes:bytes.byteLength});
      artifacts.push({coordinate:manifest.name,version:manifest.version,bytes});
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
import {textFieldState,textFieldValidity,fieldValueDetail} from '@vypdev/ha-ui/field-contracts';
import {buttonState,buttonPressDetail,type ButtonType} from '@vypdev/ha-ui/button-contracts';
import {dialogState,dialogRequestDetail,type DialogAction} from '@vypdev/ha-ui/dialog-contracts';
import {cardState,type CardHeadingLevel} from '@vypdev/ha-ui/card-contracts';
import {gridState,rowState,type GridState} from '@vypdev/ha-ui/layout-contracts';
import {feedbackState,type FeedbackState} from '@vypdev/ha-ui/feedback-contracts';
const feedback:FeedbackState=feedbackState({kind:'empty',title:'No tasks'});if(feedback.kind!=='empty')throw Error('Expected pure feedback contract');
const layout:GridState=gridState({columns:3,minColumnWidth:150});if(layout.columns!==3||rowState({label:'Inspect'}).description!=='')throw Error('Expected pure layout contract');
const heading:CardHeadingLevel=3;if(cardState({title:'Household tasks',headingLevel:heading}).headingLevel!==heading)throw Error('Expected pure card contract');
const dialogAction:DialogAction='cancel';if(dialogState({title:'Review'}).kind!=='standard'||dialogRequestDetail({action:dialogAction}).action!=='cancel')throw Error('Expected pure dialog contract');
import {checkboxState,checkboxChecked,checkboxValidity,checkboxRestoreState,checkboxRestoreValue} from '@vypdev/ha-ui/checkbox-contracts';
if(checkboxChecked(false)||!checkboxValidity(false,checkboxState({label:'Notify',required:true})).flags.valueMissing||checkboxRestoreValue(checkboxRestoreState(true))!==true)throw Error('Expected pure boolean checkbox policy');
import {selectState,selectSelection,selectEntries,selectRestoreState,selectRestoreValue,type SelectSelection} from '@vypdev/ha-ui/select-contracts';
const choice:SelectSelection=selectSelection([1,'1',false]);const choices=selectState({label:'Category',multiple:true,options:[{value:1,label:'Number'},{value:'1',label:'Text'},{value:false,label:'Other'}]});if(selectEntries(choice,choices).length!==3||!Array.isArray(selectRestoreValue(selectRestoreState(choice))))throw Error('Expected typed pure select policy');
const action:ButtonType='submit';if(buttonState({label:'Save'}).loading||buttonPressDetail({type:action}).type!=='submit')throw Error('Expected pure button policy');
const field=textFieldState({label:'Name',required:true});
if(!textFieldValidity('',field).flags.valueMissing)throw Error('Expected pure field validation');
const request=fieldValueDetail({value:'Kitchen',reason:'input'});if(request.reason!=='input')throw Error('Expected typed request');
const kind: NavigationKind = 'panels';
const selected: string | null = navigationState({kind, label:'Sections', selected:null, items:[]}).selected;
void selected;`);
    await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify({compilerOptions:{target:'ES2024',module:'NodeNext',moduleResolution:'NodeNext',strict:true,noEmit:true,lib:['ES2024'],types:[]},include:['contract.ts']}));
    await execute(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'], {cwd: consumer});
    const probe = await execute(process.execPath, ['--input-type=module', '-e', `import {navigationState} from '@vypdev/ha-ui/contracts';
import {fieldValueDetail} from '@vypdev/ha-ui/field-contracts';
import {checkboxState,checkboxChecked} from '@vypdev/ha-ui/checkbox-contracts';
if(!Object.isFrozen(checkboxState({label:'Notify'}))||checkboxChecked(true)!==true)throw Error('Expected DOM-free checkbox policy');
import {selectSelection,selectRestoreValue,selectRestoreState} from '@vypdev/ha-ui/select-contracts';
if(!Object.isFrozen(selectSelection([1,'1',false]))||selectRestoreValue(selectRestoreState(false))!==false)throw Error('Expected DOM-free select policy');
import {buttonState,buttonPressDetail} from '@vypdev/ha-ui/button-contracts';
if(!Object.isFrozen(buttonState({label:'Save'}))||buttonPressDetail({type:'button'}).type!=='button')throw Error('Expected DOM-free button policy');
import {dialogState,dialogRequestDetail} from '@vypdev/ha-ui/dialog-contracts';
import {cardState} from '@vypdev/ha-ui/card-contracts';
import {gridState,rowState} from '@vypdev/ha-ui/layout-contracts';
import {feedbackState} from '@vypdev/ha-ui/feedback-contracts';
if(!Object.isFrozen(feedbackState({kind:'loading',message:'Loading'})))throw Error('Expected DOM-free feedback contract');
if(!Object.isFrozen(gridState({}))||!Object.isFrozen(rowState({label:'Inspect'})))throw Error('Expected DOM-free layout contract');
if(!Object.isFrozen(cardState({title:'Household tasks'}))||cardState({}).headingLevel!==2)throw Error('Expected DOM-free card contract');
if(!Object.isFrozen(dialogState({title:'Review'}))||dialogRequestDetail({action:'close'}).action!=='close')throw Error('Expected pure dialog policy');
if(!Object.isFrozen(fieldValueDetail({value:'Kitchen',reason:'input'})))throw Error('Expected immutable DOM-free request contract');
if(typeof document!=='undefined'||typeof customElements!=='undefined') throw Error('Expected a server-only consumer');
const value=navigationState({kind:'navigation',label:'Sections',selected:'tasks',items:[{id:'tasks',label:'Tareas 🧹',href:'#tasks'}]});
if(value.selected!=='tasks'||!Object.isFrozen(value.items))throw Error('Packed contract did not preserve controlled state');
console.log('Packed contract imported without DOM globals');`], {cwd: consumer});
    assert.match(probe.stdout, /Packed contract imported without DOM globals/u);
    const installed = join(consumer, 'node_modules/@vypdev/ha-ui');
    const packageFiles=['LICENSE','NOTICE','LICENSES/Home-Assistant-Apache-2.0.txt','LICENSES/Font-Awesome-Free-7.0.0.txt','LICENSES/Web-Awesome-3.14.0-ha.2-MIT.txt'];
    for (const module of ['contracts','index','presentation-text','field-contracts','components/tabs','components/field','button-contracts','components/button','select-contracts','components/select','components/select-list','checkbox-contracts','checkbox-mark','components/checkbox','components/implicit-submit','dialog-contracts','components/dialog','card-contracts','components/card','layout-contracts','components/layout','feedback-contracts','components/feedback']) {
      packageFiles.push('src/'+module+'.ts');
      for (const suffix of ['.js','.js.map','.d.ts','.d.ts.map']) packageFiles.push('dist/'+module+suffix);
    }
    for (const file of packageFiles)
      assert.deepEqual(await readFile(join(installed,file)),await readFile(resolve(root,'packages/core',file)));
    await writeFile(join(consumer,'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Packed navigation consumer</title></head><body><main></main><script type="module" src="/client.ts"></script></body></html>');
    await fixtureFonts(root,consumer);
    await writeFile(join(consumer,'client.ts'), `import {registerTabs} from '@vypdev/ha-ui/tabs';
import {registerField} from '@vypdev/ha-ui/field';
import {registerButton} from '@vypdev/ha-ui/button';
import {registerSelect} from '@vypdev/ha-ui/select';
import {registerCheckbox} from '@vypdev/ha-ui/checkbox';
import {registerDialog} from '@vypdev/ha-ui/dialog';
import {registerCard} from '@vypdev/ha-ui/card';
import {registerGrid,registerRow} from '@vypdev/ha-ui/layout';
import {registerFeedback} from '@vypdev/ha-ui/feedback';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {textFieldState} from '@vypdev/ha-ui/field-contracts';
import {navigationState} from '@vypdev/ha-ui/contracts';
registerTabs();
const element=document.createElement('vyp-ha-tabs');
element.state=navigationState({kind:'navigation',label:'Household sections',selected:'overview',items:[{id:'overview',label:'Overview',href:'#overview'},{id:'tasks',label:'Tasks',href:'#tasks'}]});
element.addEventListener('ha-selection-request',event=>{event.preventDefault();element.state=navigationState({...element.state,selected:event.detail.id});});
document.querySelector('main')!.append(element);
registerField();registerButton();registerSelect();registerCheckbox();registerDialog();registerCard();registerGrid();registerRow();registerFeedback();
const form=document.createElement('form'),field=document.createElement('vyp-ha-field');
field.state=textFieldState({label:'Task name',description:'A name for this task.',required:true,inputMode:'decimal'});field.name='task';field.defaultValue='Kitchen';
field.addEventListener('ha-value-request',event=>{if(!event.defaultPrevented)field.value=event.detail.value;});
const save=document.createElement('vyp-ha-button');save.type='submit';save.name='action';save.value='save';save.state=buttonState({label:'Save task'});
const reset=document.createElement('vyp-ha-button');reset.type='reset';reset.state=buttonState({label:'Reset task'});form.append(field,save,reset);
form.addEventListener('submit',event=>{event.preventDefault();form.dataset.submitted=JSON.stringify([...new FormData(form,(event as SubmitEvent).submitter as HTMLButtonElement)]);});
document.querySelector('main')!.append(form);`);
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
      element.style.cssText='--primary-text-color:rgb(235,235,235);--secondary-text-color:rgb(189,189,189);--card-background-color:rgb(20,20,20);--divider-color:rgb(66,66,66);--primary-color:rgb(3,169,244);--error-color:#f28b82';
      await element.updateComplete;
    });
    await browserPage.getByRole('tab',{name:'Resumen',exact:true}).focus();
    await browserPage.keyboard.press('End');
    assert.equal(await browserPage.getByRole('tab',{name:'Tareas',exact:true}).evaluate(element=>element.matches(':focus-visible')),true);
    await browserPage.keyboard.press('Enter');
    assert.equal(await browserPage.getByRole('tabpanel',{name:'Tareas',exact:true}).isVisible(),true);
    assert.equal(await browserPage.getByRole('button',{name:'Nueva tarea',exact:true}).isVisible(),true);
    await browserPage.locator('vyp-ha-tabs').screenshot({path:resolve(root,'test-results/packed-panels-dark-es.png')});
    const textbox=browserPage.getByRole('textbox',{name:'Task name',exact:true});
    assert.equal(await textbox.getAttribute('inputmode'),'decimal');
    assert.equal(await textbox.inputValue(),'Kitchen');await textbox.fill('');await browserPage.getByRole('button',{name:'Save task',exact:true}).click();
    assert.equal(await textbox.getAttribute('aria-invalid'),'true');assert.equal(await browserPage.getByText('Enter a value.',{exact:true}).isVisible(),true);
    assert.equal(await browserPage.locator('form').getAttribute('data-submitted'),null);
    await textbox.fill('2,25');await textbox.press('Enter');
    await browserPage.waitForFunction(()=>document.querySelector('form')!.dataset.submitted!==undefined);
    assert.deepEqual(JSON.parse((await browserPage.locator('form').getAttribute('data-submitted'))!),[['task','2,25'],['action','save']]);
    await browserPage.getByRole('button',{name:'Reset task',exact:true}).click();await browserPage.waitForFunction(()=>document.querySelector('vyp-ha-field')!.value==='Kitchen');assert.equal(await textbox.inputValue(),'Kitchen');
    await browserPage.evaluate(async()=>{
      const field=document.querySelector<HaTextField>('vyp-ha-field')!;
      document.body.style.backgroundColor='rgb(20,20,20)';
      field.state={...field.state,label:'Nombre de la tarea',description:'Un nombre para esta tarea.',requiredMessage:'Introduce un valor.'};
      field.style.cssText='--primary-text-color:rgb(235,235,235);--secondary-text-color:rgb(189,189,189);--card-background-color:rgb(20,20,20);--divider-color:rgb(66,66,66);--primary-color:rgb(3,169,244);--error-color:#f28b82';
      await field.updateComplete;field.disabled=true;
      if([...new FormData(field.form!)].length!==0)throw Error('Disabled field must be absent from submission');field.disabled=false;
    });
    assert.equal(await browserPage.getByRole('textbox',{name:'Nombre de la tarea',exact:true}).inputValue(),'Kitchen');
    await browserPage.locator('vyp-ha-field').screenshot({path:resolve(root,'test-results/packed-field-dark-es.png')});
    assert.deepEqual(errors,[]);
    const packedBrowser={engine:'chromium',version:browser.version(),compiledClient:true,navigation:true,panels:true,textField:{controlledInput:true,nativeSubmitter:true,requiredValidation:true,reset:true,disabledSubmission:true},runtimeSpanishAndTheme:true,reducedMotion:true,consoleErrors:errors};
    await mkdir(resolve(root, 'test-results'), {recursive:true});
    await writeFile(resolve(root, 'test-results/packed-contract.json'), JSON.stringify({scope:'Core data, navigation, text field and button; four field and button framework bindings are verified separately; broader controls and application adoption remain required',sha256:digest(first),bytes:first.byteLength,reproducible:true,cleanOfflineInstall:true,frozenRuntimeLock:true,isolatedMetadataCache:true,negativeWithoutLockRejected:true,compiledWithoutDomTypes:true,serverImport:true,packedBrowser},null,2)+'\n');
    const navigationIcons=await exerciseInstalledNavigationIcons(browserPage);
    const navigationOverflow=await exerciseInstalledNavigationOverflow(browserPage);
    await writeFile(resolve(root,'test-results/packed-navigation-overflow.json'),JSON.stringify(navigationOverflow,null,2)+'\n');
    await writeFile(resolve(root,'test-results/packed-navigation-icons.json'),JSON.stringify(navigationIcons,null,2)+'\n');
    const checkbox=await exerciseInstalledCheckbox(browserPage);
    await writeFile(resolve(root,'test-results/packed-checkbox.json'),JSON.stringify(checkbox,null,2)+'\n');
    const select=await exerciseInstalledSelect(browserPage);
    await writeFile(resolve(root,'test-results/packed-select.json'),JSON.stringify(select,null,2)+'\n');
    const dialog=await exerciseInstalledDialog(browserPage);
    await writeFile(resolve(root,'test-results/packed-dialog.json'),JSON.stringify(dialog,null,2)+'\n');
    const card=await exerciseInstalledCard(browserPage);
    await writeFile(resolve(root,'test-results/packed-card.json'),JSON.stringify(card,null,2)+'\n');
    const layout=await exerciseInstalledLayout(browserPage);
    await writeFile(resolve(root,'test-results/packed-layout.json'),JSON.stringify(layout,null,2)+'\n');
    const feedback=await exerciseInstalledFeedback(browserPage);
    await writeFile(resolve(root,'test-results/packed-feedback.json'),JSON.stringify(feedback,null,2)+'\n');
    const readonlyField=await exerciseReadonlyField(browserPage);
    await writeFile(resolve(root,'test-results/packed-readonly-field.json'),JSON.stringify(readonlyField,null,2)+'\n');
    const implicitSubmit=await exerciseInstalledImplicitSubmit(browserPage);
    await writeFile(resolve(root,'test-results/packed-implicit-submit.json'),JSON.stringify(implicitSubmit,null,2)+'\n');
    const coreButton=await exerciseCoreButton(browserPage,root);
    await writeFile(resolve(root,'test-results/packed-button.json'),JSON.stringify(coreButton,null,2)+'\n');
    await browserPage.close();await server.close();server=undefined;
    const frameworks=await exerciseFrameworks(root,scratch,browser);
    await writeFile(resolve(root,'test-results/packed-frameworks.json'),JSON.stringify({scope:'Navigation, text fields, buttons, checkboxes, typed selects, native dialogs, cards, layout and feedback with four framework bindings; framework SSR and application adoption remain required',frameworks},null,2)+'\n');
    const sourceLockSha256=digest(sourceLockBytes);
    const candidate=sourceRevision!==null&&sourceRevision===await pristineRevision()?captureCandidate({sourceRevision,lockSha256:sourceLockSha256,artifacts}):null;
    if(candidate)verifyCandidate(candidate,{sourceRevision:candidate.sourceRevision,lockSha256:sourceLockSha256},coordinate=>artifacts.find(artifact=>artifact.coordinate===coordinate)?.bytes);
    await writeFile(resolve(root,'test-results/packed-cohort.json'),JSON.stringify({scope:'Unpublished navigation, fields, buttons, checkboxes, typed selects, dialogs, cards, layout and feedback with four framework bindings; no registry publication or full capability acceptance',cohort,reproducible:true,toolchain,sourceLockSha256,candidate},null,2)+'\n');
    await mkdir(resolve(root,'test-results/packages'),{recursive:true});
    for(const file of (await readdir(join(scratch,'pack-1'))).filter(name=>name.endsWith('.tgz')))await writeFile(resolve(root,'test-results/packages',file),await readFile(join(scratch,'pack-1',file)));
    passed = true;
  } finally {
    await browser?.close(); await server?.close();
    if (passed) await rm(scratch, {recursive:true});
    else console.error('Failed packed-consumer fixture retained at '+scratch);
  }
});
