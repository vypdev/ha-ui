import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {preview} from 'vite';
import {chromium} from 'playwright';
import type {AxeResults} from 'axe-core';
import type {HaTabs} from '@vypdev/ha-ui/tabs';
import type {HaSelect} from '@vypdev/ha-ui/select';
import type {HaTextField} from '@vypdev/ha-ui/field';

const require=createRequire(import.meta.url);
test('the complete static catalog works at the repository subpath with local assets and real production controls',{timeout:120_000},async()=>{
  const root=resolve(process.env.STORYBOOK_OUTPUT_DIR??'build/storybook'),output=resolve('test-results/storybook');await mkdir(output,{recursive:true});
  const index=JSON.parse(await readFile(resolve(root,'index.json'),'utf8'));
  const entries=Object.values(index.entries) as {id:string;type:string}[];
  assert.equal(entries.filter(entry=>entry.type==='story').length,39);assert.equal(entries.filter(entry=>entry.type==='docs').length,5);
  const server=await preview({configFile:false,base:'/ha-ui/',appType:'mpa',build:{outDir:root},preview:{host:'127.0.0.1',port:0},logLevel:'error'});
  const browser=await chromium.launch();const errors:string[]=[],external:string[]=[],badAssets:string[]=[];
  const address=server.httpServer.address();assert.ok(address&&typeof address==='object');const origin='http://127.0.0.1:'+address.port;
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==origin){external.push(url.origin+url.pathname);await route.abort();}else await route.continue();});
  context.on('page',page=>{page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)badAssets.push(response.status()+' '+new URL(response.url()).pathname);});});
  const page=await context.newPage();const results=[];
  try {
    for(const locale of ['en','es'])for(const theme of ['light','dark'])for(const width of [360,960])for(const story of ['navigation-household-sections--long-labels','tabs-local-panels--unselected','forms-text-field--read-only','forms-text-field--error','buttons-actions--variants','buttons-actions--loading','forms-select--default','forms-select--multiple']) {
      await page.setViewportSize({width,height:900});
      await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=locale:'+locale+';theme:'+theme+';width:'+(width===360?'narrow':'wide')+';motion:reduced');
      const frame=page.locator('main.catalog-frame');await frame.waitFor();assert.equal(await frame.getAttribute('lang'),locale);assert.equal(await frame.getAttribute('data-theme'),theme);
      await page.waitForFunction(()=>{const controls=[...document.querySelectorAll('vyp-ha-tabs,vyp-ha-field,vyp-ha-button,vyp-ha-select')];return controls.length>0&&controls.every(control=>Boolean(control.shadowRoot?.childElementCount));});
      assert.ok((await page.locator('vyp-ha-tabs,vyp-ha-field,vyp-ha-button,vyp-ha-select').evaluateAll(elements=>elements.map(element=>getComputedStyle(element).getPropertyValue('--vyp-ha-motion-duration').trim()))).every(value=>value==='0ms'));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No document-level horizontal clipping');
      await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
      const violations=await page.evaluate(async()=>{const axe=(window as unknown as {axe:{run:(element:Element)=>Promise<AxeResults>}}).axe;return (await axe.run(document.querySelector('main')!)).violations.map(({id,help,nodes})=>({id,help,targets:nodes.map(node=>node.target)}));});
      assert.deepEqual(violations,[],story+' '+locale+' '+theme+' '+width);
      if(story==='navigation-household-sections--long-labels') {
        const last=page.getByRole('link').last();await last.focus();const box=await last.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width+1,'Overflow destination scrolls into view: '+JSON.stringify({box,width,locale,theme}));
      }
      if(story.startsWith('forms-text-field'))await page.screenshot({path:resolve(output,(story.endsWith('--error')?'error-':'field-')+locale+'-'+theme+'-'+width+'.png')});
      if(story==='buttons-actions--loading')assert.equal(await page.locator('vyp-ha-button .spinner').evaluate(element=>getComputedStyle(element).animationName),'none');
      if(story.startsWith('forms-select'))await page.screenshot({path:resolve(output,story+'-'+locale+'-'+theme+'-'+width+'.png')});
      if(story.startsWith('buttons-'))await page.screenshot({path:resolve(output,story+'-'+locale+'-'+theme+'-'+width+'.png')});
      results.push({story,locale,theme,width,a11yViolations:violations.length});
    }
    await page.goto(origin+'/ha-ui/iframe.html?id=forms-text-field--default&viewMode=story');
    await page.waitForFunction(()=>document.querySelector('output')?.textContent?.includes('Example submitted: Kitchen'));
    const input=page.locator('vyp-ha-field input');await input.fill('Laundry');await page.waitForFunction(()=>(document.querySelector('vyp-ha-field') as HaTextField).value==='Laundry');
    await page.getByRole('button',{name:'Submit example'}).click();await page.getByText('Example submitted: Laundry',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Reset draft'}).click();await page.waitForFunction(()=>(document.querySelector('vyp-ha-field') as HaTextField).value==='Kitchen');
    await input.fill('');await page.getByRole('button',{name:'Submit example'}).click();await page.getByText('Enter a task name.',{exact:true}).waitFor();
    await page.screenshot({path:resolve(output,'field-native-invalid.png')});
    await page.goto(origin+'/ha-ui/iframe.html?id=forms-select--default&viewMode=story');
    await page.waitForFunction(()=>(document.querySelector('vyp-ha-select') as HaSelect)?.value===false);
    const selection=page.getByRole('combobox',{name:'Category',exact:true});await selection.selectOption('0');await page.waitForFunction(()=>(document.querySelector('vyp-ha-select') as HaSelect).value===1);
    await selection.focus();await page.keyboard.press('o');await page.keyboard.press('Tab');await page.waitForFunction(()=>(document.querySelector('vyp-ha-select') as HaSelect).value===false);
    await page.getByRole('button',{name:'Save category',exact:true}).click();await page.getByText('Saved: [["category","false"]]',{exact:true}).waitFor();
    await page.goto(origin+'/ha-ui/iframe.html?id=forms-select--multiple&viewMode=story');
    const multiple=page.getByRole('listbox',{name:'Category',exact:true});await multiple.selectOption(['0','2']);await page.waitForFunction(()=>JSON.stringify((document.querySelector('vyp-ha-select') as HaSelect).value)==='[1,false]');
    await page.getByRole('button',{name:'Save category',exact:true}).click();await page.getByText('Saved: [["category","1"],["category","false"]]',{exact:true}).waitFor();
    await page.goto(origin+'/ha-ui/iframe.html?id=tabs-local-panels--default&viewMode=story');
    await page.waitForFunction(()=>(document.querySelector('vyp-ha-tabs') as HaTabs)?.state?.selected==='tasks');
    await page.getByRole('tab',{name:'Tasks',exact:true}).focus();await page.keyboard.press('Home');await page.keyboard.press('Enter');
    await page.getByRole('tabpanel',{name:'Overview'}).waitFor({state:'visible'});
    await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Tasks',exact:true}).evaluate(element=>element===(element.getRootNode() as ShadowRoot).activeElement),true);
    assert.equal(await page.getByRole('tab',{name:'Overview',exact:true}).getAttribute('aria-selected'),'true');await page.keyboard.press('Enter');
    await page.getByRole('tabpanel',{name:'Tasks'}).waitFor({state:'visible'});
    await page.goto(origin+'/ha-ui/?path=/docs/forms-text-field--docs');
    const docs=page.frameLocator('#storybook-preview-iframe');await docs.getByRole('heading',{name:'Text field',exact:true}).waitFor();
    await page.screenshot({path:resolve(output,'manager-autodocs.png')});
    await docs.locator('textarea[id$="-forms-text-field--default-value"]').fill('Catalog control update');
    await page.waitForFunction(()=>{const frame=document.querySelector<HTMLIFrameElement>('#storybook-preview-iframe')!;return (frame.contentDocument!.querySelector('vyp-ha-field') as HaTextField).value==='Catalog control update';});
    await page.getByText('Light',{exact:true}).click();await page.getByText('Dark',{exact:true}).click();
    await page.getByText('English',{exact:true}).click();await page.getByText('Español',{exact:true}).click();
    await page.getByText('Wide',{exact:true}).click();await page.getByText('Narrow',{exact:true}).click();
    await page.getByText('System',{exact:true}).click();await page.getByText('Reduced',{exact:true}).click();
    await page.waitForFunction(()=>{const frame=document.querySelector<HTMLIFrameElement>('#storybook-preview-iframe')!,main=frame.contentDocument!.querySelector<HTMLElement>('main.catalog-frame')!;return main?.lang==='es'&&main.dataset.theme==='dark'&&main.dataset.motion==='reduced'&&main.style.maxWidth==='360px';});
    await page.screenshot({path:resolve(output,'manager-controls-dark-es.png')});
    assert.deepEqual(external,[],'The static catalog must not load external assets or telemetry');assert.deepEqual(badAssets,[]);assert.deepEqual(errors,[]);
    await writeFile(resolve(output,'evidence.json'),JSON.stringify({subpath:'/ha-ui/',storyCount:entries.filter(entry=>entry.type==='story').length,docsCount:entries.filter(entry=>entry.type==='docs').length,matrix:results,keyboard:true,nativeForm:true,selectForms:{typedDropdownTypeahead:true,multipleRepeatedEntries:true},managerDocs:true,managerControls:true,buttonReducedMotionVerified:true,external,badAssets,errors},null,2)+'\n');
  }finally {await context.close();await browser.close();await new Promise<void>((done,reject)=>server.httpServer.close(error=>error?reject(error):done()));}
});
