import assert from 'node:assert/strict';
import type {Page} from 'playwright';
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
  return results;
}
