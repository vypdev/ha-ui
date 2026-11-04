import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import type {HaButton} from '@vypdev/ha-ui/button';
/** Real installed core button plus real installed field, without aliases or a simulated submitter. */
export async function exerciseCoreButton(page:Page,root:string){
 const save=page.locator('vyp-ha-button[type=submit]'),form=page.locator('form');
 assert.equal(await save.getAttribute('state'),null);
 await save.evaluate(host=>{const button=host as HaButton,owner=button.form!;owner.dataset.requests='0';owner.dataset.nativeClicks='0';owner.dataset.submitted='';button.addEventListener('ha-press-request',()=>owner.dataset.requests=String(Number(owner.dataset.requests)+1));button.addEventListener('click',()=>owner.dataset.nativeClicks=String(Number(owner.dataset.nativeClicks)+1));});
 await page.getByRole('button',{name:'Save task',exact:true}).click();await page.waitForFunction(()=>document.querySelector('form')!.dataset.submitted!=='');
 assert.deepEqual(JSON.parse((await form.getAttribute('data-submitted'))!),[['task','Kitchen'],['action','save']]);assert.equal(await form.getAttribute('data-requests'),'1');assert.equal(await form.getAttribute('data-native-clicks'),'1');
 assert.equal(await save.evaluate(host=>{const button=host as HaButton;return button.submitter instanceof HTMLButtonElement&&button.submitter.form===button.form;}),true);
 await save.evaluate(host=>{const button=host as HaButton;button.form!.dataset.submitted='';button.addEventListener('ha-press-request',event=>event.preventDefault(),{once:true});});
 await page.getByRole('button',{name:'Save task',exact:true}).click();await page.evaluate(()=>new Promise<void>(done=>setTimeout(done,0)));assert.equal(await form.getAttribute('data-submitted'),'');assert.equal(await form.getAttribute('data-requests'),'2');
 await page.getByRole('button',{name:'Save task',exact:true}).focus();await save.evaluate(host=>{const button=host as HaButton;button.state={...button.state,loading:true,loadingLabel:'Guardando…'};});
 await page.getByText('Guardando…',{exact:true}).waitFor();assert.equal(await save.evaluate(host=>host.shadowRoot!.activeElement===host.shadowRoot!.querySelector('button')),true);await page.keyboard.press('Enter');assert.equal(await form.getAttribute('data-requests'),'2');
 await save.evaluate(host=>{const button=host as HaButton;button.state={...button.state,loading:false};button.disabled=true;});assert.equal(await page.getByRole('button',{name:'Save task',exact:true}).isDisabled(),true);
 assert.deepEqual(await save.evaluate(host=>{const button=host as HaButton;return [...new FormData(button.form!,button.submitter!)];}),[['task','Kitchen']]);
 await save.evaluate(host=>(host as HaButton).disabled=false);await page.getByRole('textbox',{name:'Nombre de la tarea',exact:true}).press('Enter');await page.waitForFunction(()=>document.querySelector('form')!.dataset.submitted!=='');assert.equal(await form.getAttribute('data-requests'),'3');assert.equal(await form.getAttribute('data-native-clicks'),'3');
 await save.evaluate(host=>{const button=host as HaButton;button.form!.dataset.submitted='';button.formNoValidate=true;});await page.getByRole('textbox',{name:'Nombre de la tarea',exact:true}).fill('');await page.getByRole('button',{name:'Save task',exact:true}).click();await page.waitForFunction(()=>document.querySelector('form')!.dataset.submitted!=='');assert.deepEqual(JSON.parse((await form.getAttribute('data-submitted'))!),[['task',''],['action','save']]);
 await page.getByRole('button',{name:'Reset task',exact:true}).click();await page.waitForFunction(()=>document.querySelector('vyp-ha-field')!.value==='Kitchen');
 await save.evaluate(host=>{const button=host as HaButton;button.state={...button.state,label:'Guardar tarea',variant:'primary'};button.style.cssText='--primary-text-color:#ebebeb;--card-background-color:#141414;--primary-color:#03a9f4;--text-primary-color:#001e2b';});
 await page.getByRole('button',{name:'Guardar tarea',exact:true}).waitFor();await save.screenshot({path:resolve(root,'test-results/packed-button-dark-es.png')});
 return {realNativeSubmitter:true,nativeValidation:true,noValidate:true,successfulNameValue:true,cancellation:true,exactlyOnce:true,loadingRetainsFocus:true,disabledSubmission:true,fieldImplicitClick:true,reset:true,runtimeSpanishAndTheme:true};
}
