import assert from 'node:assert/strict';
import type {Page} from 'playwright';
import type {HaTextArea} from '@vypdev/ha-ui/textarea';

/** Each call runs against a different actually installed framework adapter and its live model. */
export async function exerciseFrameworkTextArea(page:Page){
  const host=page.locator('vyp-ha-textarea'),form=page.getByRole('form',{name:'Note form'});
  let textbox=page.getByRole('textbox',{name:'Notes',exact:true});
  const model=page.getByLabel('Note model'),events=page.getByLabel('Note events');
  const waitModel=async(value:string)=>{
    await page.waitForFunction(expected=>document.querySelector('output[aria-label="Note model"]')!.textContent===expected,value);
    assert.equal(await textbox.inputValue(),value);
  };
  await textbox.waitFor();assert.equal(await textbox.inputValue(),'Initial\n😀');assert.equal(await events.textContent(),'0');
  assert.deepEqual(await form.evaluate(element=>[...new FormData(element as HTMLFormElement)]),[['note','Initial\n😀']]);
  await textbox.tap();assert.equal(await textbox.evaluate(element=>(element.getRootNode() as ShadowRoot).activeElement===element),true);
  await textbox.fill('Line one\nLine two 😀');await waitModel('Line one\nLine two 😀');
  await textbox.press('Enter');await waitModel('Line one\nLine two 😀\n');
  assert.equal(await page.getByLabel('Saved note').textContent(),'','Enter cannot submit a textarea form');
  await page.getByRole('button',{name:'Save note',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('output[aria-label="Saved note"]')!.textContent!=='');
  assert.deepEqual(JSON.parse((await page.getByLabel('Saved note').textContent())!),[['note','Line one\nLine two 😀\n']]);
  const literal='<img src=x onerror=alert(1)>\n😀';await textbox.fill(literal);await waitModel(literal);
  assert.equal(await host.locator('img,script').count(),0);
  const boundary='😀'.repeat(1000);await textbox.fill(boundary);await waitModel(boundary);
  assert.equal(await host.evaluate(element=>(element as HaTextArea).checkValidity()),true);
  assert.equal(await textbox.getAttribute('maxlength'),null);
  await textbox.fill(boundary+'😀');await waitModel(boundary+'😀');
  assert.equal(await host.evaluate(element=>(element as HaTextArea).validity.tooLong),true);
  await textbox.fill('');await waitModel('');
  await textbox.pressSequentially('First');await textbox.press('Enter');await textbox.pressSequentially('Second');await waitModel('First\nSecond');
  await page.getByRole('button',{name:'Reset note',exact:true}).click();await waitModel('Initial\n😀');
  const invalidAssignment=await host.evaluate(element=>{
    const host=element as HaTextArea,before=host.value;
    try{host.value=String.fromCharCode(0xd800);throw Error('Malformed value was accepted');}
    catch(error){if(!(error instanceof Error)||error.message!=='invalid_textarea')throw error;}
    return host.value===before;
  });assert.equal(invalidAssignment,true);
  await page.getByRole('button',{name:'Toggle note readonly',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('vyp-ha-textarea')!.shadowRoot!.querySelector('textarea')!.readOnly);
  assert.equal(await textbox.evaluate(element=>(element as HTMLTextAreaElement).readOnly),true);
  assert.equal(await host.evaluate(element=>(element as HaTextArea).willValidate),false);
  assert.deepEqual(await form.evaluate(element=>[...new FormData(element as HTMLFormElement)]),[['note','Initial\n😀']]);
  await page.getByRole('button',{name:'Toggle note readonly',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('vyp-ha-textarea')!.readOnly);
  await page.getByRole('button',{name:'Toggle note disabled',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('vyp-ha-textarea')!.shadowRoot!.querySelector('textarea')!.disabled);
  assert.equal(await textbox.isDisabled(),true);
  assert.deepEqual(await form.evaluate(element=>[...new FormData(element as HTMLFormElement)]),[]);
  await page.getByRole('button',{name:'Toggle note disabled',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('vyp-ha-textarea')!.shadowRoot!.querySelector('textarea')!.disabled);
  await form.locator('fieldset').evaluate(element=>{(element as HTMLFieldSetElement).disabled=true;});
  assert.equal(await textbox.isDisabled(),true);assert.deepEqual(await form.evaluate(element=>[...new FormData(element as HTMLFormElement)]),[]);
  await form.locator('fieldset').evaluate(element=>{(element as HTMLFieldSetElement).disabled=false;});
  await page.getByRole('button',{name:'Reject note changes',exact:true}).click();
  await textbox.fill('Rejected\nNote');assert.equal(await textbox.inputValue(),'Initial\n😀');assert.equal(await model.textContent(),'Initial\n😀');
  await page.getByRole('button',{name:'Reject note changes',exact:true}).click();
  await host.evaluate(element=>(element as HaTextArea).formStateRestoreCallback('Restored\n😀','restore'));await waitModel('Restored\n😀');
  const beforeProgrammatic=await events.textContent();await page.getByRole('button',{name:'Set note value',exact:true}).click();await waitModel('Programmatic\n😀');assert.equal(await events.textContent(),beforeProgrammatic);
  const retained=await host.elementHandle();assert.ok(retained);
  await page.getByRole('button',{name:'Toggle note',exact:true}).click();await host.waitFor({state:'detached'});
  await retained.evaluate(element=>{const control=element.shadowRoot!.querySelector('textarea')!;control.value='Retained\nDraft';control.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}));});
  assert.equal(await events.textContent(),beforeProgrammatic);assert.equal(await model.textContent(),'Programmatic\n😀');
  await page.getByRole('button',{name:'Toggle note',exact:true}).click();await textbox.fill('Remounted\n😀');await waitModel('Remounted\n😀');
  assert.equal(await events.textContent(),String(Number(beforeProgrammatic)+1));
  await page.getByRole('button',{name:'Switch note language',exact:true}).click();await page.getByRole('button',{name:'Toggle note theme',exact:true}).click();
  textbox=page.getByRole('textbox',{name:'Notas',exact:true});await textbox.waitFor();assert.equal(await textbox.inputValue(),'Remounted\n😀');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('vyp-ha-textarea')!.shadowRoot!.querySelector('textarea')!).color==='rgb(235, 235, 235)');
  assert.equal(await textbox.evaluate(element=>getComputedStyle(element).color),'rgb(235, 235, 235)');
  await textbox.fill('');await page.getByRole('button',{name:'Save note',exact:true}).click();
  assert.equal(await page.getByText('Introduce una nota.',{exact:true}).isVisible(),true);assert.equal(await textbox.getAttribute('aria-describedby'),'help error');
  const geometry=await textbox.evaluate(element=>({width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height,viewport:innerWidth,documentWidth:document.documentElement.scrollWidth}));
  assert.equal(geometry.viewport,390);assert.ok(geometry.height>=44);assert.ok(geometry.width>200);assert.ok(geometry.documentWidth<=geometry.viewport);
  return {rapidNativeKeyboard:true,multilineControlledModel:true,trustedNewlineWithoutSubmission:true,inertText:true,unicode1000:true,codepointValidity:true,invalidAssignmentAtomic:true,nativeForm:true,readonlySuccessful:true,disabledAndFieldset:true,cancellation:true,restore:true,reset:true,programmaticWithoutIntent:true,exactlyOnceRemount:true,spanishDark:true,touch390:true,geometry};
}

/** Pure DOM consumer of the same packed constructor, independent of a framework bridge. */
export async function exerciseInstalledTextArea(page:Page){
  const observed=await page.evaluate(async()=>{
    const form=document.createElement('form'),field=document.createElement('vyp-ha-textarea');
    field.state={...field.state,label:'Installed multiline proof',required:true,minLength:1000,maxLength:1000};field.name='note';
    field.value='😀'.repeat(1000);const requests:{value:string;reason:string}[]=[];
    field.addEventListener('ha-value-request',event=>{requests.push({...event.detail});field.value=event.detail.value;});
    form.append(field);document.body.append(form);await field.updateComplete;
    try{
      const unicode={valid:field.checkValidity(),length:field.value.length,entries:[...new FormData(form)]};
      const literal='First\r\n\t😀 <img src=x onerror=alert(1)>';field.value=literal;await field.updateComplete;
      const programmatic={value:field.value,native:field.shadowRoot!.querySelector('textarea')!.value,entries:[...new FormData(form)],executable:field.shadowRoot!.querySelectorAll('img,script').length};
      field.formStateRestoreCallback('Restored\n😀','restore');
      const restore={value:field.value,requests};
      field.disabled=true;const disabled=[...new FormData(form)];
      return{unicode,programmatic,restore,disabled};
    }finally{form.remove();}
  });
  assert.deepEqual(observed.unicode,{valid:true,length:2000,entries:[['note','😀'.repeat(1000)]]});
  const literal='First\r\n\t😀 <img src=x onerror=alert(1)>';
  assert.deepEqual(observed.programmatic,{value:literal,native:literal.replace('\r\n','\n'),entries:[['note',literal]],executable:0});
  assert.deepEqual(observed.restore,{value:'Restored\n😀',requests:[{value:'Restored\n😀',reason:'restore'}]});assert.deepEqual(observed.disabled,[]);
  return{installedConstructor:true,unicodeCodepoints:true,literalProgrammaticCRLF:true,nativeLF:true,inertText:true,formRestore:true,disabledSubmission:true};
}

export async function exerciseInstalledLitTextArea(page:Page){
  const note=page.getByRole('textbox',{name:'Lit notes',exact:true});await note.waitFor();
  assert.equal(await note.inputValue(),'Lit first\n😀');assert.equal(await page.getByLabel('Lit note events').textContent(),'0');
  await note.fill('');await note.pressSequentially('First');await note.press('Enter');await note.pressSequentially('Second');
  await page.waitForFunction(()=>document.querySelector('[aria-label="Lit note model"]')!.textContent==='First\nSecond');
  assert.deepEqual(await page.getByRole('form',{name:'Installed Lit form'}).evaluate(element=>[...new FormData(element as HTMLFormElement)]),[['note','First\nSecond']]);
  await note.fill('😀'.repeat(1000));assert.equal(await page.locator('vyp-ha-textarea').evaluate(element=>(element as HaTextArea).checkValidity()),true);
  await page.getByRole('button',{name:'Reset Lit note',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[aria-label="Lit note model"]')!.textContent==='Lit baseline\n😀');
  assert.equal(await note.inputValue(),'Lit baseline\n😀');
  return{installedLit:true,controlledProperties:true,typedEvents:true,rapidNativeKeyboard:true,multilineForm:true,unicodeCodepoints:true,nativeReset:true};
}
