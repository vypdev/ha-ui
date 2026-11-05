import {exerciseFeedbackVisual} from './feedback-visual.ts';
import {exerciseInstalledFeedback} from '../consumers/feedback.ts';
import {exerciseLayoutVisual} from './layout-visual.ts';
import {exerciseInstalledLayout} from '../consumers/layouts.ts';
import {exerciseCardVisual} from './card-visual.ts';
import {exerciseInstalledCard} from '../consumers/cards.ts';
import {exerciseFieldVisual} from './field-visual.ts';
import {exerciseSelectVisual} from './select-visual.ts';
import {exerciseSelectMultipleVisual} from './select-multiple-visual.ts';
import {exerciseSelectListVisual} from './select-list-visual.ts';
import {exerciseDialogVisual} from './dialog-visual.ts';
import {exerciseInstalledDialog} from '../consumers/dialogs.ts';
import {exerciseCatalogForms} from './form-lifecycle.ts';
import {exerciseButtonVisual} from './button-visual.ts';
import {exerciseNavigationOverflowVisual} from './navigation-overflow-visual.ts';
import {exerciseNavigationIconsVisual} from './navigation-icons-visual.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import {exerciseNavigationVisual} from './navigation-visual.ts';
import {exerciseCheckboxVisual} from './checkbox-visual.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {preview} from 'vite';
import {chromium} from 'playwright';
import type {AxeResults} from 'axe-core';
import type {HaCheckbox} from '@vypdev/ha-ui/checkbox';
import type {HaTabs} from '@vypdev/ha-ui/tabs';
import type {HaSelect} from '@vypdev/ha-ui/select';
import type {HaTextField} from '@vypdev/ha-ui/field';

const require=createRequire(import.meta.url);
test('the complete static catalog works at the repository subpath with local assets and real production controls',{timeout:750_000},async t=>{
  const root=resolve(process.env.STORYBOOK_OUTPUT_DIR??'build/storybook'),output=resolve('test-results/storybook');await mkdir(output,{recursive:true});
  const index=JSON.parse(await readFile(resolve(root,'index.json'),'utf8'));
  const entries=Object.values(index.entries) as {id:string;type:string}[];
  assert.equal(entries.filter(entry=>entry.type==='story').length,92);assert.equal(entries.filter(entry=>entry.type==='docs').length,11);
  const fontFiles=(await readdir(resolve(root,'assets'))).filter(name=>/^NotoSansArabic-Regular-[A-Za-z0-9_-]+\.ttf$/u.test(name));
  assert.equal(fontFiles.length,1,'One local Arabic fallback is required');
  const font=JSON.parse(await readFile(resolve('docs/evidence/ha-card-reference.json'),'utf8')).arabicFont;
  assert.equal(createHash('sha256').update(await readFile(resolve(root,'assets',fontFiles[0]))).digest('hex'),font.sha256);
  const server=await preview({configFile:false,base:'/ha-ui/',appType:'mpa',build:{outDir:root},preview:{host:'127.0.0.1',port:0},logLevel:'error'});
  let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
  try {
  browser=await chromium.launch();const errors:string[]=[],external:string[]=[],badAssets:string[]=[];
  const address=server.httpServer.address();assert.ok(address&&typeof address==='object');const origin='http://127.0.0.1:'+address.port;
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==origin){external.push(url.origin+url.pathname);await route.abort();}else await route.continue();});
  context.on('page',page=>{page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)badAssets.push(response.status()+' '+new URL(response.url()).pathname);});});
  type Completion=Awaited<ReturnType<typeof waitForCatalogStory>>;
  const page=await context.newPage();const results:{story:string;locale:string;theme:string;width:number;a11yViolations:number;automatic:Completion}[]=[];
  let interactionEvidence:{sameStoryRerender:{firstRun:Completion;secondRun:Completion;thirdRun:Completion};catalogForms:Awaited<ReturnType<typeof exerciseCatalogForms>>;dialog:Awaited<ReturnType<typeof exerciseInstalledDialog>>;card:Awaited<ReturnType<typeof exerciseInstalledCard>>;layout:Awaited<ReturnType<typeof exerciseInstalledLayout>>;feedback:Awaited<ReturnType<typeof exerciseInstalledFeedback>>}|undefined;
  let visualEvidence:{checkboxVisual:Awaited<ReturnType<typeof exerciseCheckboxVisual>>;navigationVisual:Awaited<ReturnType<typeof exerciseNavigationVisual>>;navigationIconsVisual:Awaited<ReturnType<typeof exerciseNavigationIconsVisual>>;navigationOverflowVisual:Awaited<ReturnType<typeof exerciseNavigationOverflowVisual>>;buttonVisual:Awaited<ReturnType<typeof exerciseButtonVisual>>;fieldVisual:Awaited<ReturnType<typeof exerciseFieldVisual>>;selectVisual:Awaited<ReturnType<typeof exerciseSelectVisual>>}|undefined;
  let selectMultipleVisual:Awaited<ReturnType<typeof exerciseSelectMultipleVisual>>|undefined;
  let selectListVisual:Awaited<ReturnType<typeof exerciseSelectListVisual>>|undefined;
  let dialogVisual:Awaited<ReturnType<typeof exerciseDialogVisual>>|undefined;
  let cardVisual:Awaited<ReturnType<typeof exerciseCardVisual>>|undefined;
  let feedbackVisual:Awaited<ReturnType<typeof exerciseFeedbackVisual>>|undefined;
  let layoutVisual:Awaited<ReturnType<typeof exerciseLayoutVisual>>|undefined;
    await t.test('all locale/theme/width accessibility combinations',{timeout:180_000},async()=>{
    for(const locale of ['en','es'])for(const theme of ['light','dark'])for(const width of [360,960])for(const story of ['navigation-household-sections--long-labels','tabs-local-panels--unselected','forms-text-field--read-only','forms-text-field--error','forms-text-field--empty-optional','forms-text-field--focused-optional','buttons-actions--variants','buttons-actions--loading','forms-select--default','forms-select--multiple','forms-select--single-list','forms-select--multiple-list','forms-checkbox--partial','forms-checkbox--long-label','navigation-household-sections--mixed','tabs-local-panels--icon-only','navigation-household-sections--overflow','tabs-local-panels--overflow','overlays-dialog--alert','overlays-dialog--busy','surfaces-card--default','surfaces-card--with-actions','layout-row--with-action','layout-grid--default','feedback-status--error-notice','feedback-status--empty','feedback-status--loading']) {
      await page.setViewportSize({width,height:900});
      await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=locale:'+locale+';theme:'+theme+';width:'+(width===360?'narrow':'wide')+';motion:reduced');
      const automatic=await waitForCatalogStory(page,story);
      const frame=page.locator('main.catalog-frame');await frame.waitFor();assert.equal(await frame.getAttribute('lang'),locale);assert.equal(await frame.getAttribute('data-theme'),theme);
      await page.waitForFunction(()=>{const controls=[...document.querySelectorAll('vyp-ha-tabs,vyp-ha-field,vyp-ha-button,vyp-ha-select,vyp-ha-checkbox,vyp-ha-card,vyp-ha-row,vyp-ha-grid,vyp-ha-feedback')];return controls.length>0&&controls.every(control=>Boolean(control.shadowRoot?.childElementCount));});
      assert.ok((await page.locator('vyp-ha-tabs,vyp-ha-field,vyp-ha-button,vyp-ha-select,vyp-ha-checkbox,vyp-ha-card,vyp-ha-row,vyp-ha-grid,vyp-ha-feedback').evaluateAll(elements=>elements.map(element=>getComputedStyle(element).getPropertyValue('--vyp-ha-motion-duration').trim()))).every(value=>value==='0ms'));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No document-level horizontal clipping');
      await page.evaluate(()=>Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]));assert.equal(await page.evaluate(()=>document.fonts.check('14px Roboto')),true);
      await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
      const violations=await page.evaluate(async()=>{const axe=(window as unknown as {axe:{reset:()=>void;run:(element:Element)=>Promise<AxeResults>}}).axe;axe.reset();return (await axe.run(document.querySelector('main')!)).violations.map(({id,help,nodes})=>({id,help,targets:nodes.map(node=>node.target)}));});
      assert.deepEqual(violations,[],story+' '+locale+' '+theme+' '+width);
      if(story==='navigation-household-sections--long-labels') {
        const last=page.getByRole('link').last();await last.focus();const box=await last.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width+1,'Overflow destination scrolls into view: '+JSON.stringify({box,width,locale,theme}));
      }
      if(story.startsWith('forms-text-field'))await page.screenshot({path:resolve(output,(story.endsWith('--error')?'error-':'field-')+locale+'-'+theme+'-'+width+'.png')});
      if(story==='buttons-actions--loading')assert.equal(await page.locator('vyp-ha-button .spinner svg').evaluate(element=>getComputedStyle(element).animationName),'none');
      if(story.startsWith('forms-checkbox'))await page.screenshot({path:resolve(output,story+'-'+locale+'-'+theme+'-'+width+'.png')});
      if(story.startsWith('forms-select'))await page.screenshot({path:resolve(output,story+'-'+locale+'-'+theme+'-'+width+'.png')});
      if(story.startsWith('buttons-'))await page.screenshot({path:resolve(output,story+'-'+locale+'-'+theme+'-'+width+'.png')});
      if(story.startsWith('overlays-dialog')){assert.equal(await page.locator('vyp-ha-dialog dialog').evaluate(element=>element.matches(':modal')),true);await page.screenshot({path:resolve(output,story+'-'+locale+'-'+theme+'-'+width+'.png')});}
      if(story.startsWith('surfaces-card')){assert.equal(await page.getByRole('article').count(),1);await page.screenshot({path:resolve(output,story+'-'+locale+'-'+theme+'-'+width+'.png')});}
      if(story==='layout-row--with-action')assert.equal(await page.getByRole('listitem').count(),1);
      if(story==='layout-grid--default'){
       const columns=await page.locator('vyp-ha-grid [part=grid]').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').length);
       assert.equal(columns,width===360?1:3);
      }
      if(story==='feedback-status--error-notice')assert.equal(await page.locator('vyp-ha-feedback').getByRole('alert').count(),1);
      if(story==='feedback-status--empty')assert.equal(await page.locator('vyp-ha-feedback').getByRole('heading',{level:2}).count(),1);
      if(story==='feedback-status--loading')assert.equal(await page.locator('vyp-ha-feedback .spinner svg').evaluate(element=>getComputedStyle(element).animationName),'none');
      results.push({story,locale,theme,width,a11yViolations:violations.length,automatic});
    }
    });
    assert.equal(results.length,216,'The complete accessibility matrix is required');
    await t.test('catalog controls, native forms and projected interactions',{timeout:120_000},async()=>{
    await page.goto(origin+'/ha-ui/iframe.html?id=forms-text-field--default&viewMode=story');
    await page.waitForFunction(()=>document.querySelector('[role=status]')?.textContent?.includes('Example submitted: Kitchen'));
    const input=page.getByRole('textbox',{name:'Task name',exact:true});await input.fill('Laundry');await page.waitForFunction(()=>(document.querySelector('vyp-ha-field') as HaTextField).value==='Laundry');
    await page.getByRole('button',{name:'Submit example'}).click();await page.getByText('Example submitted: Laundry',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Reset draft'}).click();await page.waitForFunction(()=>(document.querySelector('vyp-ha-field') as HaTextField).value==='Kitchen');
    await input.fill('');await page.getByRole('button',{name:'Submit example'}).click();await page.getByText('Enter a task name.',{exact:true}).waitFor();
    await page.screenshot({path:resolve(output,'field-native-invalid.png')});
    await page.goto(origin+'/ha-ui/iframe.html?id=forms-select--default&viewMode=story');
    await page.waitForFunction(()=>(document.querySelector('vyp-ha-select') as HaSelect)?.value===false);
    const selection=page.getByRole('combobox',{name:'Category',exact:true});await selection.click();await page.getByRole('option',{name:'Maintenance',exact:true}).click();await page.waitForFunction(()=>(document.querySelector('vyp-ha-select') as HaSelect).value===1);
    await selection.focus();await page.keyboard.press('o');await page.keyboard.press('Tab');await page.waitForFunction(()=>(document.querySelector('vyp-ha-select') as HaSelect).value===false);
    await page.getByRole('button',{name:'Save category',exact:true}).click();await page.getByText('Saved: [["category","false"]]',{exact:true}).waitFor();
    await page.goto(origin+'/ha-ui/iframe.html?id=forms-select--multiple&viewMode=story');
    await waitForCatalogStory(page,'forms-select--multiple');await page.getByRole('button',{name:'Remove Shopping',exact:true}).click();await page.getByRole('button',{name:'Category',exact:true}).click();await page.getByRole('option',{name:'Other',exact:true}).click();await page.waitForFunction(()=>JSON.stringify((document.querySelector('vyp-ha-select') as HaSelect).value)==='[1,false]');
    await page.getByRole('button',{name:'Save category',exact:true}).click();await page.getByText('Saved: [["category","1"],["category","false"]]',{exact:true}).waitFor();
    await page.goto(origin+'/ha-ui/iframe.html?id=forms-checkbox--default&viewMode=story');
    await page.waitForFunction(()=>(document.querySelector('vyp-ha-checkbox') as HaCheckbox)?.checked===false);
    const checkbox=page.getByRole('checkbox',{name:'Notify household',exact:true});await checkbox.focus();await page.keyboard.press('Space');await page.waitForFunction(()=>(document.querySelector('vyp-ha-checkbox') as HaCheckbox).checked);
    await page.getByRole('button',{name:'Save notification',exact:true}).click();await page.getByText('Saved: [["notify","on"]]',{exact:true}).waitFor();await page.getByRole('button',{name:'Reset notification',exact:true}).click();await page.waitForFunction(()=>(document.querySelector('vyp-ha-checkbox') as HaCheckbox).checked===false);
    await page.goto(origin+'/ha-ui/iframe.html?id=forms-checkbox--required&viewMode=story');
    await page.getByText('Select this option.',{exact:true}).waitFor();await page.getByRole('checkbox',{name:'Notify household',exact:true}).click();await page.getByRole('button',{name:'Save notification',exact:true}).click();await page.getByText('Saved: [["notify","on"]]',{exact:true}).waitFor();
    await page.goto(origin+'/ha-ui/iframe.html?id=tabs-local-panels--default&viewMode=story');
    await page.waitForFunction(()=>(document.querySelector('vyp-ha-tabs') as HaTabs)?.state?.selected==='tasks');
    await page.getByRole('tab',{name:'Tasks',exact:true}).focus();await page.keyboard.press('Home');await page.keyboard.press('Enter');
    await page.getByRole('tabpanel',{name:'Overview'}).waitFor({state:'visible'});
    await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Tasks',exact:true}).evaluate(element=>element===(element.getRootNode() as ShadowRoot).activeElement),true);
    assert.equal(await page.getByRole('tab',{name:'Overview',exact:true}).getAttribute('aria-selected'),'true');await page.keyboard.press('Enter');
    await page.getByRole('tabpanel',{name:'Tasks'}).waitFor({state:'visible'});
    await page.goto(origin+'/ha-ui/?path=/story/forms-text-field--default');
    const iframe=await page.locator('#storybook-preview-iframe').elementHandle();assert.ok(iframe);const liveFrame=await iframe.contentFrame();assert.ok(liveFrame);
    const firstRun=await waitForCatalogStory(liveFrame,'forms-text-field--default');
    await page.getByRole('button',{name:'Reload story',exact:true}).click();const secondRun=await waitForCatalogStory(liveFrame,'forms-text-field--default',firstRun.revision);
    await page.getByRole('button',{name:'Reload story',exact:true}).click();const thirdRun=await waitForCatalogStory(liveFrame,'forms-text-field--default',secondRun.revision);
    const sameStoryRerender={firstRun,secondRun,thirdRun};
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
    const catalogForms=await exerciseCatalogForms(page,origin);
    await page.goto(origin+'/ha-ui/iframe.html?id=overlays-dialog--default&viewMode=story');await waitForCatalogStory(page,'overlays-dialog--default');
    const dialog=await exerciseInstalledDialog(page);
    await page.goto(origin+'/ha-ui/iframe.html?id=surfaces-card--default&viewMode=story');await waitForCatalogStory(page,'surfaces-card--default');
    const card=await exerciseInstalledCard(page);
    await page.goto(origin+'/ha-ui/iframe.html?id=layout-grid--default&viewMode=story');await waitForCatalogStory(page,'layout-grid--default');
    const layout=await exerciseInstalledLayout(page);
    await page.goto(origin+'/ha-ui/iframe.html?id=feedback-status--default&viewMode=story');await waitForCatalogStory(page,'feedback-status--default');
    const feedback=await exerciseInstalledFeedback(page);
    interactionEvidence={sameStoryRerender,catalogForms,dialog,card,layout,feedback};
    });
    assert.ok(interactionEvidence,'Complete catalog interactions are required');
    await t.test('established original HA visual families and single open-menu accessibility',{timeout:240_000},async()=>{
    const checkboxVisual=await exerciseCheckboxVisual(page,origin,output);
    const navigationVisual=await exerciseNavigationVisual(page,origin,output);
    const navigationIconsVisual=await exerciseNavigationIconsVisual(page,origin,output);
    const navigationOverflowVisual=await exerciseNavigationOverflowVisual(page,origin,output);
    const buttonVisual=await exerciseButtonVisual(page,origin,output);
    const fieldVisual=await exerciseFieldVisual(page,origin,output);
    const selectVisual=await exerciseSelectVisual(page,origin,output);
    visualEvidence={checkboxVisual,navigationVisual,navigationIconsVisual,navigationOverflowVisual,buttonVisual,fieldVisual,selectVisual};
    });
    await t.test('original HA multiple chips, search and open-dialog accessibility',{timeout:120_000},async()=>{
    selectMultipleVisual=await exerciseSelectMultipleVisual(page,origin,output);
    });
    await t.test('original HA visible radio and checkbox lists',{timeout:120_000},async()=>{
    selectListVisual=await exerciseSelectListVisual(page,origin,output);
    });
    await t.test('original HA modal surfaces, footer commands and scroll states',{timeout:120_000},async()=>{
    dialogVisual=await exerciseDialogVisual(page,origin,output);
    });
    await t.test('original HA card surfaces, heading geometry and projected action paint',{timeout:120_000},async()=>{
    cardVisual=await exerciseCardVisual(page,origin,output);
    });
    await t.test('original HA list rows and Lovelace layout',{timeout:120_000},async()=>{
    layoutVisual=await exerciseLayoutVisual(page,origin,output);
    });
    await t.test('original HA notices, empty surfaces and loading indicators',{timeout:120_000},async()=>{
    feedbackVisual=await exerciseFeedbackVisual(page,origin,output);
    });
    assert.ok(feedbackVisual,'Original feedback visuals are required');
    assert.ok(layoutVisual,'Original layout visuals are required');
    assert.ok(cardVisual,'Original card visuals are required');
    assert.ok(visualEvidence,'Every established original HA visual family is required');assert.ok(selectMultipleVisual,'Original multiple chip/search visuals are required');assert.ok(selectListVisual,'Original visible-list visuals are required');assert.ok(dialogVisual,'Original dialog visuals are required');
    assert.deepEqual(external,[],'The static catalog must not load external assets or telemetry');assert.deepEqual(badAssets,[]);assert.deepEqual(errors,[]);
    await writeFile(resolve(output,'evidence.json'),JSON.stringify({subpath:'/ha-ui/',storyCount:entries.filter(entry=>entry.type==='story').length,docsCount:entries.filter(entry=>entry.type==='docs').length,matrix:results,keyboard:true,nativeForm:true,selectForms:{typedDropdownTypeahead:true,multipleRepeatedEntries:true},checkboxForms:{nativeSpace:true,labelClick:true,requiredValidation:true,controlledReset:true},localRoboto:true,...interactionEvidence,...visualEvidence,selectMultipleVisual,selectListVisual,dialogVisual,cardVisual,layoutVisual,feedbackVisual,managerDocs:true,managerControls:true,buttonReducedMotionVerified:true,external,badAssets,errors},null,2)+'\n');
  }finally {
    try{await browser?.close();}
    finally{await new Promise<void>((done,reject)=>server.httpServer.close(error=>error?reject(error):done()));}
  }
});
