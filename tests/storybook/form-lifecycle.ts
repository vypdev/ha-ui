import assert from 'node:assert/strict';
import type {Page} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {waitForCatalogStory} from './lifecycle.ts';

/** Real native reset must leave the catalog's controlled live status renderable in every engine. */
export async function exerciseCatalogForms(page:Page,origin:string){
  const results=[];
  for(const story of ['forms-text-field--default','forms-select--default','forms-checkbox--default','buttons-actions--reset']){
    await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story');
    const automatic=await waitForCatalogStory(page,story),status=page.getByRole('status');
    assert.ok((await status.textContent())!.length>0);
    if(story==='buttons-actions--reset'){
      const reset=page.getByRole('button',{name:'Submit example',exact:true});await reset.click();
      await page.waitForFunction(()=>document.querySelector('[role=status]')!.getAttribute('data-resets')==='2');
      assert.equal(await status.getAttribute('data-resets'),'2');await reset.click();
      await page.waitForFunction(()=>document.querySelector('[role=status]')!.getAttribute('data-resets')==='3');assert.equal(await status.getAttribute('data-resets'),'3');
    }else{
      const resetName=story==='forms-text-field--default'?'Reset draft':story==='forms-select--default'?'Reset category':'Reset notification';
      if(story==='forms-text-field--default')await page.getByRole('textbox',{name:'Task name',exact:true}).fill('Before reset');
      else if(story==='forms-select--default'){await page.getByRole('combobox',{name:'Category',exact:true}).click();await page.getByRole('option',{name:'Maintenance',exact:true}).click();}
      else await page.getByRole('checkbox',{name:'Notify household',exact:true}).check();
      await page.getByRole('button',{name:resetName,exact:true}).click();
      if(story==='forms-text-field--default'){
        await page.waitForFunction(()=>document.querySelector('vyp-ha-field')!.value==='Kitchen');
        assert.equal(await page.getByRole('textbox',{name:'Task name',exact:true}).inputValue(),'Kitchen');
        await page.getByRole('textbox',{name:'Task name',exact:true}).fill('After reset');
        await page.getByRole('button',{name:'Submit example',exact:true}).click();
        await page.waitForFunction(()=>document.querySelector('[role=status]')!.textContent==='Example submitted: After reset');assert.equal(await status.textContent(),'Example submitted: After reset');
      }else if(story==='forms-select--default'){
        await page.waitForFunction(()=>document.querySelector('vyp-ha-select')!.value===false);
        await page.getByRole('combobox',{name:'Category',exact:true}).click();await page.getByRole('option',{name:'Maintenance',exact:true}).click();
        await page.getByRole('button',{name:'Save category',exact:true}).click();
        await page.waitForFunction(()=>document.querySelector('[role=status]')!.textContent==='Saved: [["category","1"]]');assert.equal(await status.textContent(),'Saved: [["category","1"]]');
      }else{
        await page.waitForFunction(()=>document.querySelector('vyp-ha-checkbox')!.checked===false);
        await page.getByRole('checkbox',{name:'Notify household',exact:true}).check();
        await page.getByRole('button',{name:'Save notification',exact:true}).click();
        await page.waitForFunction(()=>document.querySelector('[role=status]')!.textContent==='Saved: [["notify","on"]]');assert.equal(await status.textContent(),'Saved: [["notify","on"]]');
      }
    }
    results.push({story,automatic,nativeResetThenUpdate:true,text:await status.textContent()});
  }
  const browser=page.context().browser()!;
  await mkdir('test-results',{recursive:true});
  for(const locale of ['en','es']){
    const numeric=await browser.newPage({viewport:{width:390,height:844},hasTouch:locale==='es',reducedMotion:'reduce'});
    try{
      const spanish=locale==='es';
      const story='forms-text-field--'+(spanish?'spanish-numeric-identifier':'numeric-identifier');
      await numeric.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story');
      const automatic=await waitForCatalogStory(numeric,story);
      const field=numeric.getByRole('textbox',{name:spanish?'Número del código de barras':'Barcode number',exact:true});
      if(spanish)await field.tap();else await field.focus();
      await numeric.keyboard.press('ControlOrMeta+A');
      await numeric.keyboard.type('00036000291452');
      assert.equal(await field.getAttribute('type'),'text');
      assert.equal(await field.getAttribute('inputmode'),'numeric');
      assert.equal(await field.inputValue(),'00036000291452');
      assert.equal(await field.evaluate(input=>input===(input.getRootNode() as ShadowRoot).activeElement),true);
      assert.equal(await field.getAttribute('aria-describedby'),'help');
      assert.deepEqual(await numeric.locator('form').evaluate(form=>[...new FormData(form as HTMLFormElement)]),[['task','00036000291452']]);
      assert.equal(await numeric.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      const submit=numeric.getByRole('button',{name:spanish?'Enviar ejemplo':'Submit example',exact:true});
      if(spanish)await submit.tap();else await submit.press('Enter');
      const text=(spanish?'Ejemplo enviado: ':'Example submitted: ')+'00036000291452';
      await numeric.getByRole('status').filter({hasText:text}).waitFor();
      await numeric.screenshot({path:'test-results/numeric-field-'+browser.browserType().name()+'-'+locale+'.png'});
      results.push({story,automatic,nativeResetThenUpdate:true,text});
    }finally{await numeric.close();}
  }
  return results;
}
