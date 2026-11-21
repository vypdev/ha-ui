import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import type {AxeResults} from 'axe-core';
import type {HaTextArea} from '@vypdev/ha-ui/textarea';
import {waitForCatalogStory} from './lifecycle.ts';

const require=createRequire(import.meta.url);
/** Compiled catalog behavior, accessibility and actual 390px geometry in each browser family. */
export async function exerciseCatalogTextAreas(page:Page,origin:string,output:string,engine:string){
  await mkdir(output,{recursive:true});await page.setViewportSize({width:390,height:844});
  const observations=[];
  for(const locale of ['en','es'])for(const theme of ['light','dark'])for(const variant of ['default','unicode-codepoints','empty-required','disabled','read-only','error']){
    const story='forms-text-area--'+variant;
    await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=locale:'+locale+';theme:'+theme+';width:narrow;motion:reduced');
    await waitForCatalogStory(page,story);
    const host=page.locator('vyp-ha-textarea'),control=page.getByRole('textbox',{name:locale==='es'?'Notas':'Notes',exact:true});
    await control.waitFor();assert.equal(await control.isDisabled(),variant==='disabled');
    assert.equal(await control.evaluate(element=>(element as HTMLTextAreaElement).readOnly),variant==='read-only');
    const geometry=await host.evaluate(element=>{
      const host=element as HaTextArea,control=host.shadowRoot!.querySelector('textarea')!,label=host.shadowRoot!.querySelector('label')!;
      return{rows:control.rows,width:control.getBoundingClientRect().width,height:control.getBoundingClientRect().height,labelBottom:label.getBoundingClientRect().bottom,controlTop:control.getBoundingClientRect().top,viewport:innerWidth,documentWidth:document.documentElement.scrollWidth};
    });
    assert.equal(geometry.rows,3);assert.equal(geometry.viewport,390);assert.ok(geometry.documentWidth<=390);assert.ok(geometry.height>=44);assert.ok(geometry.width>200);assert.ok(geometry.labelBottom<=geometry.controlTop);
    if(variant==='unicode-codepoints')assert.equal(await host.evaluate(element=>(element as HaTextArea).validity.valid),true);
    if(variant==='default'){
      await control.focus();assert.equal(await control.evaluate(element=>(element.getRootNode() as ShadowRoot).activeElement===element),true);
      await control.fill('First\n😀');await control.press('Enter');
      await page.waitForFunction(()=>document.querySelector('vyp-ha-textarea')!.value==='First\n😀\n');
      const border=await host.evaluate(element=>getComputedStyle(element.shadowRoot!.querySelector('.control')!,'::after').height);assert.equal(border,'2px');
      await page.getByRole('button',{name:locale==='es'?'Restablecer nota':'Reset note',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('vyp-ha-textarea')!.value==='First line\nDetails 😀');
    }
    await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
    const violations=await page.evaluate(async()=>{
      const axe=(window as unknown as {axe:{reset:()=>void;run:(root:Element)=>Promise<AxeResults>}}).axe;axe.reset();
      return(await axe.run(document.querySelector('main')!)).violations.map(({id,nodes})=>({id,targets:nodes.map(node=>node.target)}));
    });assert.deepEqual(violations,[],[engine,locale,theme,variant].join(' '));
    await host.screenshot({path:resolve(output,'textarea-'+engine+'-'+locale+'-'+theme+'-'+variant+'.png')});
    observations.push({locale,theme,variant,geometry,axeViolations:violations.length});
  }
  return{compiledCatalog:true,keyboardNewline:true,controlledReset:true,focusVisible:true,variants:observations.length,observations};
}
