import {assertBoundNavigationIcons} from './navigation-icons.ts';
import {fixtureFonts} from './fonts.ts';
import {exerciseFrameworkCheckbox} from './checkboxes.ts';
import {exerciseFrameworkSelect} from './selects.ts';
import {exerciseFrameworkButton} from './framework-buttons.ts';
import {exerciseField} from './fields.ts';
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,cp,mkdir} from 'node:fs/promises';
import {resolve,join,dirname,relative} from 'node:path';
import {promisify} from 'node:util';
import {globSync} from 'node:fs';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parse,stringify} from 'yaml';
import {createServer,type Plugin} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import {transformAsync} from '@babel/core';
import linker from '@angular/compiler-cli/linker/babel';
import {needsLinking} from '@angular/compiler-cli/linker';
import type {Browser} from 'playwright';
import type {HaTabs} from '@vypdev/ha-ui/tabs';

const execute=promisify(execFile);
export async function exerciseFrameworks(root:string,scratch:string,browser:Browser) {
  const sourceLock=parse(await readFile(join(root,'pnpm-lock.yaml'),'utf8'));
  const results=[];
  for (const framework of ['react','vue','angular','svelte']) {
    const folder=join(scratch,'consumer-'+framework);
    await cp(join(root,'tests/consumers/fixtures',framework),folder,{recursive:true});
    await fixtureFonts(root,folder);
    const lock=parse(await readFile(join(folder,'pnpm-lock.yaml'),'utf8'));
    const candidateArchives=[];
    for (const [key,description] of Object.entries(lock.packages) as [string,{resolution:{tarball?:string;integrity:string}}][]) {
      if (description.resolution.tarball) {
        assert.ok(key.startsWith('@vypdev/ha-ui'));
        const archive=resolve(folder,description.resolution.tarball.slice('file:'.length));
        assert.equal(dirname(archive),join(scratch,'pack-1'));
        const bytes=await readFile(archive);
        description.resolution.integrity='sha512-'+createHash('sha512').update(bytes).digest('base64');
        candidateArchives.push({file:description.resolution.tarball,sha256:createHash('sha256').update(bytes).digest('hex')});
      } else assert.deepEqual(description,sourceLock.packages[key],'Registry resolution must match the reviewed source lock: '+key);
    }
    const frozen=stringify(lock);await writeFile(join(folder,'pnpm-lock.yaml'),frozen);
    const config=parse(await readFile(join(folder,'pnpm-workspace.yaml'),'utf8'));
    config.cacheDir=join(folder,'empty-metadata-cache');await writeFile(join(folder,'pnpm-workspace.yaml'),stringify(config));
    await execute('pnpm',['install','--frozen-lockfile','--offline','--ignore-scripts'],{cwd:folder});
    assert.equal(await readFile(join(folder,'pnpm-lock.yaml'),'utf8'),frozen);
    const installedRoot=join(folder,'node_modules/@vypdev/ha-ui-'+framework);
    const published=JSON.parse(await readFile(join(installedRoot,'package.json'),'utf8'));
    assert.equal(published.version,'0.1.0-next.1');
    assert.equal(published.dependencies['@vypdev/ha-ui'],'0.1.0-next.1');
    assert.doesNotMatch(JSON.stringify(published),/workspace:|file:/u,'Published metadata cannot retain fixture or workspace references');
    for (const source of globSync('packages/'+framework+'/src/**/*.{ts,svelte}',{cwd:root}))
      assert.deepEqual(await readFile(join(installedRoot,relative(join(root,'packages',framework),join(root,source)))),await readFile(join(root,source)),'Installed authored source must match '+source);
    const installed=await readdir(join(folder,'node_modules/.pnpm'));
    const identities={react:/^(react@|react-dom@)/u,vue:/^vue@/u,angular:/^@angular\+/u,svelte:/^svelte@/u};
    for (const [other,pattern] of Object.entries(identities)) if (other!==framework)
      assert.equal(installed.some(name=>pattern.test(name)),false,'A selected adapter must not install '+other);
    const compiler=framework==='svelte'?join(root,'node_modules/svelte-check/bin/svelte-check'):framework==='angular'?join(root,'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'):join(folder,'node_modules/typescript/bin/tsc');
    const args=framework==='svelte'?['--tsconfig','tsconfig.json']:['-p','tsconfig.json'];
    await execute(process.execPath,[compiler,...args],{cwd:folder});
    const plugins:Plugin[]=framework==='angular'?[{
      name:'official-angular-linker',enforce:'pre',
      async transform(code,id) {
        if (!needsLinking(id.split('?')[0],code)) return;
        const output=await transformAsync(code,{filename:id,configFile:false,babelrc:false,plugins:[linker],sourceMaps:true});
        assert.ok(output?.code);return {code:output.code,map:output.map?JSON.stringify(output.map):null};
      },
    }]:framework==='svelte'?svelte({configFile:false,compilerOptions:{dev:false}}):[];
    const server=await createServer({root:folder,configFile:false,plugins,logLevel:'error',optimizeDeps:framework==='angular'?{noDiscovery:true}:{},server:{host:'127.0.0.1',port:0}});
    const page=await browser.newPage({viewport:{width:360,height:640},reducedMotion:'reduce'});
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    try {
      await server.listen();const address=server.httpServer!.address();assert.ok(address&&typeof address==='object');
      await page.goto('http://127.0.0.1:'+address.port);
      await page.evaluate(()=>document.fonts.ready);
      let nativeHostAttributes;
      if(framework==='vue'){
        nativeHostAttributes=await page.locator('vyp-ha-tabs,vyp-ha-field,vyp-ha-button,vyp-ha-select,vyp-ha-checkbox').evaluateAll(elements=>elements.map(element=>{
          const host=element as HTMLElement&{form?:HTMLFormElement|null},owner=host.form;
          const entries=()=>owner?[...new FormData(owner)]:null,before=entries();host.hidden=true;
          const hidden=getComputedStyle(host).display,whileHidden=entries();host.hidden=false;
          return{tag:host.localName,title:host.title,description:host.getAttribute('aria-description'),proof:host.getAttribute('data-host-attributes'),hidden,visibleHeight:host.getBoundingClientRect().height,before,whileHidden};
        }));
        assert.deepEqual([...new Set(nativeHostAttributes.map(row=>row.tag))].sort(),['vyp-ha-tabs','vyp-ha-field','vyp-ha-button','vyp-ha-select','vyp-ha-checkbox'].sort());
        for(const row of nativeHostAttributes){assert.equal(row.title,'Vue host attributes');assert.equal(row.description,'Installed Vue host attributes');assert.equal(row.proof,'forwarded');assert.equal(row.hidden,'none');assert.ok(row.visibleHeight>0);assert.deepEqual(row.whileHidden,row.before);}
      }
      const textField=await exerciseField(page);
      const button=await exerciseFrameworkButton(page,root,framework);
      const select=await exerciseFrameworkSelect(page,root,framework);
      const checkbox=await exerciseFrameworkCheckbox(page,root,framework);
      const navigationIcons=await assertBoundNavigationIcons(page);
      await page.getByRole('tab',{name:'Tasks',exact:true}).click();
      await page.getByRole('button',{name:'Add task',exact:true}).waitFor({state:'visible'});
      assert.equal(await page.getByLabel('Selection events').textContent(),'1');
      assert.equal(await page.locator('vyp-ha-tabs').getAttribute('state'),null);
      await page.getByRole('button',{name:'Switch language',exact:true}).click();
      await page.getByRole('tab',{name:'Tareas',exact:true}).waitFor({state:'visible'});
      await assertBoundNavigationIcons(page,true);
      assert.equal(await page.getByRole('tab',{name:'Tareas',exact:true}).getAttribute('aria-selected'),'true');
      await page.getByRole('button',{name:'Toggle theme',exact:true}).click();
      await page.waitForFunction(()=>getComputedStyle(document.querySelector('vyp-ha-tabs')!.shadowRoot!.querySelector('.frame')!).backgroundColor==='rgb(20, 20, 20)');
      await page.getByRole('button',{name:'Toggle disabled',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('vyp-ha-tabs')!.shadowRoot!.querySelector<HTMLButtonElement>('#tab-tasks')!.disabled);
      assert.equal(await page.getByRole('tab',{name:'Tareas',exact:true}).isDisabled(),true);
      assert.equal(await page.getByLabel('Selection events').textContent(),'1');
      await page.getByRole('button',{name:'Toggle disabled',exact:true}).click();
      await page.getByRole('tab',{name:'Resumen',exact:true}).focus();await page.keyboard.press('End');await page.keyboard.press('Enter');
      await page.waitForFunction(()=>document.querySelector('output')!.textContent==='2');
      const retained=await page.locator('vyp-ha-tabs').elementHandle();assert.ok(retained);
      await page.getByRole('button',{name:'Toggle component',exact:true}).click();
      await page.locator('vyp-ha-tabs').waitFor({state:'detached'});
      await retained.evaluate(element=>element.shadowRoot!.querySelector<HTMLButtonElement>('#tab-tasks')!.click());
      assert.equal(await page.getByLabel('Selection events').textContent(),'2','Unmounted adapter must not invoke a retained callback');
      await page.getByRole('button',{name:'Toggle component',exact:true}).click();
      await page.getByRole('tab',{name:'Resumen',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('output')!.textContent==='3');
      await page.getByRole('tab',{name:'Tareas',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('output')!.textContent==='4');
      await page.getByRole('button',{name:'Add task',exact:true}).waitFor({state:'visible'});
      await mkdir(join(root,'test-results'),{recursive:true});
      await page.locator('vyp-ha-tabs').screenshot({path:join(root,'test-results','packed-'+framework+'-dark-es.png')});
      const textbox=page.getByRole('textbox',{name:'Nombre de la tarea',exact:true});
      assert.equal(await textbox.inputValue(),'Kitchen');
      assert.equal(await textbox.evaluate(control=>getComputedStyle(control).color),'rgb(235, 235, 235)');
      await page.locator('vyp-ha-field').screenshot({path:join(root,'test-results','packed-'+framework+'-field-dark-es.png')});
      await page.locator('#bound-submit').getByRole('button',{name:'Guardar tarea',exact:true}).waitFor();
      await page.locator('#bound-submit').screenshot({path:join(root,'test-results','packed-'+framework+'-button-dark-es.png')});
      await page.getByRole('combobox',{name:'Categoría',exact:true}).waitFor();
      await page.locator('#bound-category').screenshot({path:join(root,'test-results','packed-'+framework+'-select-dark-es.png')});
      await page.getByRole('button',{name:'Toggle category mode',exact:true}).click();await page.getByRole('button',{name:'Eliminar Mantenimiento',exact:true}).waitFor();
      await page.locator('#bound-category').screenshot({path:join(root,'test-results','packed-'+framework+'-select-multiple-dark-es.png')});
      await page.getByRole('button',{name:'Categoría',exact:true}).click();await page.getByRole('combobox',{name:'Buscar categorías',exact:true}).fill('comp');await page.getByRole('option',{name:'Compra',exact:true}).waitFor();await page.screenshot({path:join(root,'test-results','packed-'+framework+'-select-search-dark-es.png')});await page.keyboard.press('Escape');
      await page.getByRole('checkbox',{name:'Avisar al hogar',exact:true}).waitFor();
      await page.locator('#bound-checkbox').screenshot({path:join(root,'test-results','packed-'+framework+'-checkbox-dark-es.png')});
      await page.getByRole('button',{name:'Toggle partial',exact:true}).click();
      await page.waitForFunction(()=>Boolean((document.querySelector('#bound-checkbox') as HTMLElement).shadowRoot!.querySelector<HTMLInputElement>('input')!.indeterminate));
      await page.locator('#bound-checkbox').screenshot({path:join(root,'test-results','packed-'+framework+'-checkbox-partial-dark-es.png')});
      await textbox.fill('');await page.getByRole('button',{name:'Guardar tarea',exact:true}).click();
      assert.equal(await page.getByText('Introduce un valor.',{exact:true}).isVisible(),true);
      assert.equal(await page.locator('vyp-ha-field #error').evaluate(element=>getComputedStyle(element).color),'rgb(242, 139, 130)');
      await page.locator('vyp-ha-field').screenshot({path:join(root,'test-results','packed-'+framework+'-field-error-dark-es.png')});
      assert.deepEqual(errors,[]);
      results.push({framework,compiled:true,frozenOfflineInstall:true,noForeignFramework:true,candidateArchives,props:true,events:true,slots:true,disabled:true,runtimeSpanishAndTheme:true,keyboard:true,teardownAndRemount:true,nativeHostAttributes,navigationIcons,textField,button,select,checkbox,browser:browser.version(),errors});
      console.log('Packed '+framework+' compiler, bindings and real Chromium lifecycle passed');
    } finally {await page.close();await server.close();}
  }
  return results;
}
