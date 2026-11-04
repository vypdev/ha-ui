import assert from 'node:assert/strict';
import type {Page} from 'playwright';
import type {HaTextField} from '@vypdev/ha-ui/field';

/** Actual installed framework models, not source aliases or simulated form handlers. */
export async function exerciseField(page:Page){
  const textbox=page.getByRole('textbox',{name:'Task name',exact:true}),model=page.getByLabel('Field model'),events=page.getByLabel('Field events');
  const form=page.getByRole('form',{name:'Task form'});
  assert.equal(await textbox.inputValue(),'Kitchen');assert.equal(await model.textContent(),'Kitchen');
  assert.equal(await page.locator('vyp-ha-field').getAttribute('state'),null);
  const geometry=await page.locator('vyp-ha-field').evaluate(host=>{const control=host.shadowRoot!.querySelector('[part=control]')!,input=host.shadowRoot!.querySelector('input')!,label=host.shadowRoot!.querySelector('label')!,box=control.getBoundingClientRect();return{x:box.x,y:box.y,paintedHeight:box.height,nativeHeight:input.getBoundingClientRect().height,labelSize:getComputedStyle(label).fontSize,blockers:host.querySelectorAll('input[slot=native-blocker]').length};});
  assert.equal(geometry.paintedHeight,56);assert.equal(geometry.nativeHeight,56);assert.equal(geometry.labelSize,'10px');assert.equal(geometry.blockers,1);
  await page.mouse.click(geometry.x+4,geometry.y+4);assert.equal(await textbox.evaluate(element=>element===(element.getRootNode() as ShadowRoot).activeElement),true);assert.equal(await events.textContent(),'0');
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
  return {controlledModel:true,exactlyOnce:true,cancellation:true,programmaticWrite:true,nativeSubmitter:true,requiredValidation:true,disabledSubmission:true,frameworkReset:true,teardownAndRemount:true,materialGeometry:geometry,paintedGutterFocusWithoutModelIntent:true};
}

/** Verify the installed FACE's actual readonly submission contract, independently of framework validators. */
export async function exerciseReadonlyField(page:Page){
  const observations=await page.evaluate(async()=>{
    const results=[];
    for(const sample of [
      {name:'required empty',value:'',error:'',custom:''},
      {name:'too short',value:'x',error:'',custom:''},
      {name:'too long',value:'Long value',error:'',custom:''},
      {name:'state error',value:'Valid',error:'Review the imported value.',custom:''},
      {name:'custom error',value:'Valid',error:'',custom:'Review the imported value.'},
    ]){
      const form=document.createElement('form'),field=document.createElement('vyp-ha-field'),button=document.createElement('button');
      field.state={...field.state,label:'Readonly proof',required:true,readOnly:true,minLength:3,maxLength:5,error:sample.error};field.name='readonlyValue';field.value=sample.value;field.setCustomValidity(sample.custom);button.type='submit';form.append(field,button);document.body.append(form);await field.updateComplete;
      const submissions:FormDataEntryValue[][]=[];form.addEventListener('submit',event=>{event.preventDefault();submissions.push([...new FormData(form).values()]);});field.addEventListener('invalid',event=>event.preventDefault());
      const readonly={attribute:field.hasAttribute('readonly'),willValidate:field.willValidate,storedInvalid:!field.validity.valid,check:field.checkValidity(),report:field.reportValidity(),formCheck:form.checkValidity(),formReport:form.reportValidity()};
      button.click();const afterReadonly=submissions.length;
      field.readOnly=false;const editable={willValidate:field.willValidate,formCheck:form.checkValidity()};button.click();const afterEditable=submissions.length;
      field.readOnly=true;button.click();results.push({name:sample.name,value:sample.value,readonly,editable,afterReadonly,afterEditable,submissions,entries:[...new FormData(form)]});form.remove();
    }
    return results;
  });
  for(const result of observations){
    assert.deepEqual(result.readonly,{attribute:true,willValidate:false,storedInvalid:true,check:true,report:true,formCheck:true,formReport:true});
    assert.deepEqual(result.editable,{willValidate:true,formCheck:false});assert.equal(result.afterReadonly,1);assert.equal(result.afterEditable,1);
    assert.deepEqual(result.submissions,[[result.value],[result.value]]);assert.deepEqual(result.entries,[['readonlyValue',result.value]]);
  }
  return {cases:observations,readonlyValidationPolicyChanged:false,allNativeSubmissionsPassed:true};
}
