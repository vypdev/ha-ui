import assert from 'node:assert/strict';
import type {Page} from 'playwright';
import type {HaTextField} from '@vypdev/ha-ui/field';

/** Actual installed framework models, not source aliases or simulated form handlers. */
export async function exerciseField(page:Page){
  const textbox=page.getByRole('textbox',{name:'Task name',exact:true}),model=page.getByLabel('Field model'),events=page.getByLabel('Field events');
  const form=page.getByRole('form',{name:'Task form'});
  assert.equal(await textbox.inputValue(),'Kitchen');assert.equal(await model.textContent(),'Kitchen');
  assert.equal(await page.locator('vyp-ha-field').getAttribute('state'),null);
  await textbox.fill('Laundry');await page.waitForFunction(()=>document.querySelector('output[aria-label="Field model"]')!.textContent==='Laundry');
  assert.equal(await events.textContent(),'1');await textbox.press('Enter');
  await page.waitForFunction(()=>document.querySelector('output[aria-label="Saved task"]')!.textContent!=='');
  assert.deepEqual(JSON.parse((await page.getByLabel('Saved task').textContent())!),[['task','Laundry'],['action','save']]);
  await page.getByRole('button',{name:'Reject field changes',exact:true}).click();await textbox.fill('Rejected');
  await page.waitForFunction(()=>document.querySelector('output[aria-label="Field events"]')!.textContent==='2');
  assert.equal(await textbox.inputValue(),'Laundry');assert.equal(await model.textContent(),'Laundry');assert.equal(await events.textContent(),'2');
  await page.getByRole('button',{name:'Reject field changes',exact:true}).click();await page.getByRole('button',{name:'Set field value',exact:true}).click();
  await textbox.waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector<HaTextField>('vyp-ha-field')!.value==='Programmatic');
  assert.equal(await events.textContent(),'2');assert.notEqual(await page.locator('vyp-ha-field').getAttribute('value'),'Programmatic');
  await page.getByRole('button',{name:'Toggle field disabled',exact:true}).click();assert.equal(await textbox.isDisabled(),true);
  assert.deepEqual(await form.evaluate(element=>[...new FormData(element as HTMLFormElement)]),[]);
  await page.getByRole('button',{name:'Toggle field disabled',exact:true}).click();assert.equal(await textbox.isDisabled(),false);
  await textbox.fill('');await page.getByRole('button',{name:'Save task',exact:true}).click();assert.equal(await textbox.getAttribute('aria-invalid'),'true');
  assert.equal(await page.getByText('Enter a value.',{exact:true}).isVisible(),true);
  await page.getByRole('button',{name:'Reset task',exact:true}).click();await page.waitForFunction(()=>document.querySelector('output[aria-label="Field model"]')!.textContent==='Kitchen');
  assert.equal(await textbox.inputValue(),'Kitchen');
  const retained=await page.locator('vyp-ha-field').elementHandle();assert.ok(retained);const before=await events.textContent();
  await page.getByRole('button',{name:'Toggle field',exact:true}).click();await page.locator('vyp-ha-field').waitFor({state:'detached'});
  await retained.evaluate(host=>{const control=host.shadowRoot!.querySelector('input')!;control.value='Retained';control.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}));});
  assert.equal(await events.textContent(),before);assert.equal(await model.textContent(),'Kitchen');
  await page.getByRole('button',{name:'Toggle field',exact:true}).click();await textbox.fill('Remounted');
  await page.waitForFunction(()=>document.querySelector('output[aria-label="Field model"]')!.textContent==='Remounted');
  assert.equal(await events.textContent(),String(Number(before)+1));
  await page.getByRole('button',{name:'Reset task',exact:true}).click();await page.waitForFunction(()=>document.querySelector('output[aria-label="Field model"]')!.textContent==='Kitchen');
  return {controlledModel:true,exactlyOnce:true,cancellation:true,programmaticWrite:true,nativeSubmitter:true,requiredValidation:true,disabledSubmission:true,frameworkReset:true,teardownAndRemount:true};
}
