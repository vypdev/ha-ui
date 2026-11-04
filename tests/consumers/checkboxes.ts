import assert from 'node:assert/strict';
import {join} from 'node:path';
import type {Page} from 'playwright';
import type {HaCheckbox} from '@vypdev/ha-ui/checkbox';

/** Exercise the installed bindings through actual browser actions and framework models. */
export async function exerciseFrameworkCheckbox(page:Page,root:string,framework:string){
 const host=page.locator('#bound-checkbox'),control=page.getByRole('checkbox',{name:'Notify household',exact:true}),form=page.getByRole('form',{name:'Checkbox form',exact:true});
 const model=(value:boolean)=>page.waitForFunction(expected=>document.querySelector('output[aria-label="Checkbox model"]')!.textContent===String(expected),value);
 const events=(value:number)=>page.waitForFunction(expected=>document.querySelector('output[aria-label="Checkbox events"]')!.textContent===String(expected),value);
 const submissions=(value:number)=>page.waitForFunction(expected=>document.querySelector('output[aria-label="Checkbox submits"]')!.textContent===String(expected),value);
 const entries=()=>form.evaluate(element=>[...new FormData(element as HTMLFormElement)]);
 await model(false);assert.equal(await form.evaluate(element=>(element as HTMLFormElement).noValidate),false);assert.equal(await host.getAttribute('state'),null);assert.equal(await host.getAttribute('checked'),null);assert.equal(await control.evaluate(element=>(element as HTMLInputElement).indeterminate),true);assert.deepEqual(await entries(),[]);
 await host.screenshot({path:join(root,'test-results','packed-'+framework+'-checkbox-partial-light.png')});
 await host.locator('label').click();await model(true);await events(1);assert.equal(await control.isChecked(),true);assert.equal(await control.evaluate(element=>(element as HTMLInputElement).indeterminate),false);
 await page.getByRole('button',{name:'Save notification',exact:true}).click();await submissions(1);assert.deepEqual(JSON.parse((await page.getByLabel('Saved checkbox',{exact:true}).textContent())!),[['notify','on']]);
 await control.focus();await page.keyboard.press('Space');await model(false);await events(2);assert.deepEqual(await entries(),[]);
 await form.evaluate(element=>{element.addEventListener('invalid',()=>{(element as HTMLElement).dataset.invalid='observed';},{capture:true,once:true});});await page.getByRole('button',{name:'Save notification',exact:true}).click();await page.waitForFunction(()=>document.querySelector<HTMLElement>('form[aria-label="Checkbox form"]')!.dataset.invalid==='observed');assert.equal(await control.getAttribute('aria-invalid'),'true');await submissions(1);await page.getByText('Select this option.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Reject check changes',exact:true}).click();await control.click();await events(3);await model(false);assert.equal(await control.isChecked(),false);await page.getByRole('button',{name:'Reject check changes',exact:true}).click();
 await page.getByRole('button',{name:'Set checked',exact:true}).click();await model(true);await events(3);await page.getByRole('button',{name:'Toggle partial',exact:true}).click();await page.waitForFunction(()=>(document.querySelector('#bound-checkbox') as HaCheckbox).indeterminate);assert.deepEqual(await entries(),[['notify','on']]);
 await control.focus();await page.keyboard.press('Enter');await submissions(2);await events(3);assert.equal(await control.isChecked(),true);
 await page.getByRole('button',{name:'Toggle check payload',exact:true}).click();await page.waitForFunction(()=>(document.querySelector('#bound-checkbox') as HaCheckbox).value==='confirmed');await page.getByRole('button',{name:'Save notification',exact:true}).click();await submissions(3);assert.deepEqual(JSON.parse((await page.getByLabel('Saved checkbox',{exact:true}).textContent())!),[['notify','confirmed']]);
 await page.getByRole('button',{name:'Toggle check disabled',exact:true}).click();assert.equal(await control.isDisabled(),true);assert.deepEqual(await entries(),[]);await page.getByRole('button',{name:'Toggle check disabled',exact:true}).click();assert.equal(await control.isDisabled(),false);
 await page.getByRole('button',{name:'Reset notification',exact:true}).click();await model(false);await events(4);assert.equal(await control.isChecked(),false);assert.deepEqual(await entries(),[]);
 await control.focus();await page.keyboard.press('Space');await model(true);await events(5);await page.getByRole('button',{name:'Reset notification',exact:true}).click();await model(false);await events(6);
 const retained=await host.elementHandle();assert.ok(retained);await page.getByRole('button',{name:'Toggle checkbox',exact:true}).click();await host.waitFor({state:'detached'});await retained.evaluate(element=>element.dispatchEvent(new CustomEvent('ha-check-request',{detail:{checked:true,reason:'change'},cancelable:true})));await events(6);await model(false);
 await page.getByRole('button',{name:'Toggle checkbox',exact:true}).click();await control.click();await model(true);await events(7);await host.screenshot({path:join(root,'test-results','packed-'+framework+'-checkbox-light.png')});
 return {strictBoolean:true,indeterminateSeparateFromChecked:true,nativeLabelAndSpace:true,originalRequestExactlyOnce:true,cancellation:true,programmaticWritesEmitNoIntent:true,requiredNativeValidation:true,disabledSubmission:true,defaultAndCustomPayload:true,enterUsesSharedSubmitter:true,frameworkReset:true,teardownAndRemount:true};
}

export async function exerciseInstalledCheckbox(page:Page){
 await page.evaluate(async()=>{
  const form=document.createElement('form');form.id='packed-check-proof';const host=document.createElement('vyp-ha-checkbox');host.id='packed-core-checkbox';host.state={...host.state,label:'Packed notification',required:true,indeterminate:true};host.name='notify';host.defaultChecked=true;host.checked=false;host.value='packed';host.addEventListener('ha-check-request',event=>{host.checked=event.detail.checked;host.indeterminate=false;});
  const submit=document.createElement('vyp-ha-button');submit.type='submit';submit.state={...submit.state,label:'Save packed notification'};form.append(host,submit);form.addEventListener('submit',event=>{event.preventDefault();form.dataset.saved=JSON.stringify([...new FormData(form)]);});document.body.append(form);await host.updateComplete;
 });
 const host=page.locator('#packed-core-checkbox'),form=page.locator('#packed-check-proof'),control=page.getByRole('checkbox',{name:'Packed notification',exact:true});
 assert.equal(await control.isChecked(),false);assert.equal(await control.evaluate(element=>(element as HTMLInputElement).indeterminate),true);await control.focus();await page.keyboard.press('Space');assert.equal(await control.isChecked(),true);assert.equal(await host.evaluate(element=>(element as HaCheckbox).checked),true);assert.equal(await control.evaluate(element=>(element as HTMLInputElement).indeterminate),false);
 await page.keyboard.press('Enter');await form.getAttribute('data-saved');await page.waitForFunction(()=>document.querySelector<HTMLElement>('#packed-check-proof')!.dataset.saved!==undefined);assert.deepEqual(JSON.parse((await form.getAttribute('data-saved'))!),[['notify','packed']]);
 const restored=await host.evaluate(async element=>{const host=element as HaCheckbox;host.formStateRestoreCallback('false','restore');await host.updateComplete;const restored=host.checked;host.form!.reset();await host.updateComplete;return {restored,reset:host.checked,entries:[...new FormData(host.form!)]};});assert.deepEqual(restored,{restored:false,reset:true,entries:[['notify','packed']]});await form.evaluate(element=>element.remove());
 return {booleanModel:true,nativeSpaceAndEnter:true,indeterminate:true,formData:true,explicitRestorationAndReset:restored};
}
