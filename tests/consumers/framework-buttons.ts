import assert from 'node:assert/strict';
import {join} from 'node:path';
import type {Page} from 'playwright';
import type {HaButton} from '@vypdev/ha-ui/button';

/** Exercise installed framework bindings through their app handlers and actual browser defaults. */
export async function exerciseFrameworkButton(page:Page,root:string,framework:string){
  const action=page.locator('#bound-submit'),button=action.getByRole('button',{name:'Save task',exact:true});
  const count=async(label:string)=>Number(await page.getByLabel(label,{exact:true}).textContent());
  const waitCount=async(label:string,expected:number)=>page.waitForFunction(({label,expected})=>document.querySelector('output[aria-label="'+label+'"]')!.textContent===String(expected),{label,expected});
  const geometry=await action.evaluate(host=>{const button=host.shadowRoot!.querySelector('button')!,surface=host.shadowRoot!.querySelector<HTMLElement>('[part=surface]')!;return{hit:button.getBoundingClientRect().height,paint:surface.getBoundingClientRect().height,line:getComputedStyle(surface).lineHeight};});
  assert.equal(geometry.paint,40);assert.ok(geometry.hit>=44);assert.equal(geometry.line,'14px');
  const start=await count('Press events'),accepted=await count('Accepted presses'),submitted=await count('Submit events');
  assert.equal(start,2,'The field Enter and invalid save must reach the real button binding');assert.equal(accepted,2);assert.equal(submitted,1);
  const proxy=await action.evaluateHandle(host=>(host as HaButton).submitter);
  assert.equal(await action.getAttribute('state'),null);assert.equal(await action.locator('[slot="leading"]').count(),1);
  await page.getByRole('button',{name:'Cancel button request',exact:true}).click();await button.click();await waitCount('Press events',start+1);
  assert.equal(await count('Accepted presses'),accepted);assert.equal(await count('Submit events'),submitted);
  await page.getByRole('button',{name:'Cancel button request',exact:true}).click();
  const textbox=page.getByRole('textbox',{name:'Task name',exact:true});await textbox.fill('Button journey');await button.focus();await page.keyboard.press('Space');
  await waitCount('Submit events',submitted+1);assert.equal(await count('Press events'),start+2);assert.equal(await count('Accepted presses'),accepted+1);assert.equal(await page.getByLabel('Button metadata').textContent(),'true');
  assert.deepEqual(JSON.parse((await page.getByLabel('Saved task').textContent())!),[['task','Button journey'],['action','save']]);
  await page.getByRole('button',{name:'Toggle button icons',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#bound-submit [slot="leading"]')===null);
  assert.equal(await proxy.evaluate((native)=>native!.parentElement===document.querySelector('#bound-submit')),true);
  await page.getByRole('button',{name:'Toggle button icons',exact:true}).click();await action.locator('[slot="leading"]').waitFor();
  await page.getByRole('button',{name:'Toggle button busy',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#bound-submit')!.shadowRoot!.querySelector('button')!.getAttribute('aria-busy')==='true');
  await action.evaluate(host=>(host as HaButton).click());assert.equal(await count('Press events'),start+2);assert.equal(await button.isDisabled(),true);
  await page.getByRole('button',{name:'Toggle button busy',exact:true}).click();await page.getByRole('button',{name:'Toggle button disabled',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#bound-submit')!.shadowRoot!.querySelector('button')!.disabled);
  await action.evaluate(host=>(host as HaButton).click());assert.equal(await count('Press events'),start+2);await page.getByRole('button',{name:'Toggle button disabled',exact:true}).click();
  await textbox.fill('');await button.click();await waitCount('Press events',start+3);assert.equal(await textbox.getAttribute('aria-invalid'),'true');assert.equal(await count('Submit events'),submitted+1);
  await page.getByRole('button',{name:'Reset task',exact:true}).click();await page.waitForFunction(()=>document.querySelector('output[aria-label="Field model"]')!.textContent==='Kitchen');assert.equal(await textbox.inputValue(),'Kitchen');
  const retained=await action.elementHandle();assert.ok(retained);await page.getByRole('button',{name:'Toggle action button',exact:true}).click();await action.waitFor({state:'detached'});
  await retained.evaluate(host=>host.dispatchEvent(new CustomEvent('ha-press-request',{detail:{type:'submit'},cancelable:true})));assert.equal(await count('Press events'),start+3);
  const form=page.getByRole('form',{name:'Task form',exact:true});
  await form.evaluate(element=>element.addEventListener('submit',event=>{(element as HTMLElement).dataset.nativeSubmitter=String((event as SubmitEvent).submitter);},{once:true}));
  await textbox.press('Enter');await waitCount('Submit events',submitted+2);
  assert.deepEqual(JSON.parse((await page.getByLabel('Saved task').textContent())!),[['task','Kitchen']]);
  assert.equal(await form.getAttribute('data-native-submitter'),'null');
  assert.equal(await page.getByLabel('Button metadata').textContent(),'false');

  await page.getByRole('button',{name:'Toggle action button',exact:true}).click();await button.click();await waitCount('Submit events',submitted+3);assert.equal(await count('Press events'),start+4);assert.equal(await count('Accepted presses'),accepted+3);
  await action.screenshot({path:join(root,'test-results','packed-'+framework+'-button-light.png')});
  return {sharedRenderer:true,originalCancelableRequest:true,validatedAcceptedSnapshot:true,keyboardActivation:true,nativeValidation:true,nativeSubmitter:true,frameworkReset:true,disabledAndBusy:true,projectionPreservesSubmitter:true,submitWithoutButton:true,teardownAndRemount:true};
}
