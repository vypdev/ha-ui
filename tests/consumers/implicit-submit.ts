import assert from 'node:assert/strict';
import type {Page} from 'playwright';
import type {HaTextField} from '@vypdev/ha-ui/field';

/** Compare real Enter on the installed custom element and native inputs in the same browser. */
export async function exerciseInstalledImplicitSubmit(page:Page){
  const cases=[['single',1],['enabled-native',0],['enabled-shared',0],['disabled-native',0],['disabled-shared',0],['fieldset-native',0],['fieldset-shared',0],['readonly-native',0],['readonly-shared',0],['hidden-native',0],['hidden-shared',0],['hidden-type',1],['external-disabled',0]] as const;
  const results=[];
  for(const [mode,expected] of cases)for(const shared of [false,true]){
    await page.evaluate(async({mode,shared})=>{
      const fixture=document.createElement('div');fixture.id='implicit-proof';
      const form=document.createElement('form');form.id='implicit-proof-owner';form.dataset.submissions='0';
      form.addEventListener('submit',event=>{event.preventDefault();form.dataset.submissions=String(Number(form.dataset.submissions)+1);});
      const first=document.createElement(shared?'vyp-ha-field':'input');first.id='implicit-first';first.setAttribute('name','first');
      (first as HTMLInputElement|HaTextField).value='Kitchen';form.append(first);fixture.append(form);document.body.append(fixture);
      if(shared)await (first as HaTextField).updateComplete;
      if(mode!=='single'){
        const other=document.createElement(mode.endsWith('-shared')?'vyp-ha-field':'input');
        if(mode==='hidden-type')(other as HTMLInputElement).type='hidden';
        if(mode.startsWith('disabled')||mode==='external-disabled')(other as HTMLInputElement).disabled=true;
        if(mode.startsWith('readonly'))(other as HTMLInputElement).readOnly=true;
        if(mode.startsWith('hidden-')&&mode!=='hidden-type')other.hidden=true;
        if(mode.startsWith('fieldset')){const fieldset=document.createElement('fieldset');fieldset.disabled=true;fieldset.append(other);form.append(fieldset);}
        else if(mode==='external-disabled'){other.setAttribute('form',form.id);fixture.append(other);}
        else form.append(other);
        if(other.localName==='vyp-ha-field')await (other as HaTextField).updateComplete;
      }
    },{mode,shared});
    try{
      const first=shared?page.locator('#implicit-first').getByRole('textbox'):page.locator('#implicit-first');await first.press('Enter');
      // Drain the component's deferred native action; this is a task barrier, not a timed visual delay.
      await page.evaluate(()=>new Promise<void>(resolve=>setTimeout(resolve)));
      const actual=await page.locator('#implicit-proof-owner').evaluate(form=>({submissions:Number((form as HTMLElement).dataset.submissions),entries:[...new FormData(form as HTMLFormElement)]}));
      assert.equal(actual.submissions,expected,`${mode}/${shared?'shared':'native'} Enter`);assert.deepEqual(actual.entries,[['first','Kitchen']]);
      results.push({mode,first:shared?'shared':'native',expected,...actual});
    }finally{await page.locator('#implicit-proof').evaluate(fixture=>fixture.remove());}
  }
  return {nativeDifferential:true,realKeyboard:true,proxyAddsNoFormData:true,cases:results};
}
