import assert from 'node:assert/strict';
import {join} from 'node:path';
import type {Page} from 'playwright';
import type {HaSelect} from '@vypdev/ha-ui/select';

/** Real installed framework models and browser form actions, with no source aliases. */
export async function exerciseFrameworkSelect(page:Page,root:string,framework:string){
 const host=page.locator('#bound-category'),form=page.getByRole('form',{name:'Category form'}),single=page.getByRole('combobox',{name:'Category',exact:true});
 const waitModel=(value:unknown)=>page.waitForFunction(expected=>document.querySelector('output[aria-label="Category model"]')!.textContent===expected,JSON.stringify(value));
 const waitEvents=(value:number)=>page.waitForFunction(expected=>document.querySelector('output[aria-label="Category events"]')!.textContent===String(expected),value);
 const count=async(label:string)=>Number(await page.getByLabel(label,{exact:true}).textContent());
 const saved=async()=>JSON.parse((await page.getByLabel('Saved categories').textContent())!);
 await waitModel(1);assert.equal(await form.evaluate(element=>(element as HTMLFormElement).noValidate),false,'The real consumer explicitly enables native constraint validation');assert.equal(await host.getAttribute('state'),null);assert.equal(await host.getAttribute('value'),null);
 await single.click();await host.getByRole('option',{name:'Shopping',exact:true}).click();await waitModel('1');await waitEvents(1);assert.equal(await single.getAttribute('value'),'1');
 await page.getByRole('button',{name:'Save category',exact:true}).click();await page.waitForFunction(()=>document.querySelector('output[aria-label="Category submits"]')!.textContent==='1');assert.deepEqual(await saved(),[['category','1']]);
 await single.focus();await page.keyboard.press('o');await page.keyboard.press('Tab');await waitModel(false);await waitEvents(2);
 await page.getByRole('button',{name:'Reject category changes',exact:true}).click();await single.click();await host.getByRole('option',{name:'Maintenance',exact:true}).click();await waitEvents(3);await waitModel(false);assert.equal(await single.getAttribute('value'),'2');await page.getByRole('button',{name:'Reject category changes',exact:true}).click();
 await page.getByRole('button',{name:'Set category value',exact:true}).click();await waitModel(false);assert.equal(await count('Category events'),3);
 await page.getByRole('button',{name:'Toggle category options',exact:true}).click();await page.waitForFunction(()=>(document.querySelector('#bound-category') as HaSelect).validity.customError);await waitModel(false);assert.equal(await single.getAttribute('value'),'');
 await page.getByRole('button',{name:'Toggle category options',exact:true}).click();await page.waitForFunction(()=>(document.querySelector('#bound-category') as HaSelect).validity.valid);await waitModel(false);assert.equal(await single.getAttribute('value'),'2');assert.equal(await count('Category events'),3);
 await page.getByRole('button',{name:'Clear category',exact:true}).click();await waitModel(null);await form.evaluate(element=>{const form=element as HTMLFormElement;form.dataset.nativeInvalid='0';form.addEventListener('invalid',()=>{form.dataset.nativeInvalid='1';},{capture:true,once:true});});await page.getByRole('button',{name:'Save category',exact:true}).click();await page.waitForFunction(()=>document.querySelector<HTMLFormElement>('form[aria-label="Category form"]')!.dataset.nativeInvalid==='1');assert.equal(await single.getAttribute('aria-invalid'),'true');assert.equal(await count('Category submits'),1);assert.equal(await page.getByText('Choose a category.',{exact:true}).isVisible(),true);
 await page.getByRole('button',{name:'Reset category',exact:true}).click();await waitModel(1);await waitEvents(4);
 await page.getByRole('button',{name:'Toggle category disabled',exact:true}).click();assert.equal(await single.isDisabled(),true);assert.deepEqual(await form.evaluate(element=>[...new FormData(element as HTMLFormElement)]),[]);await page.getByRole('button',{name:'Toggle category disabled',exact:true}).click();assert.equal(await single.isDisabled(),false);
 await single.click();assert.equal(await host.getByRole('option',{name:'Archived',exact:true}).isDisabled(),true);await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Toggle category mode',exact:true}).click();const multiple=page.getByRole('listbox',{name:'Category',exact:true});await waitModel([1,false]);assert.equal(await count('Category events'),4);await multiple.selectOption(['1']);await waitModel(['1']);await waitEvents(5);
 await multiple.selectOption(['0','2']);await waitModel([1,false]);await waitEvents(6);await page.getByRole('button',{name:'Save category',exact:true}).click();await page.waitForFunction(()=>document.querySelector('output[aria-label="Category submits"]')!.textContent==='2');assert.deepEqual(await saved(),[['category','1'],['category','false']]);
 await multiple.selectOption(['1']);await waitModel(['1']);await waitEvents(7);await page.getByRole('button',{name:'Reset category',exact:true}).click();await waitModel([1,false]);await waitEvents(8);
 const retained=await host.elementHandle();assert.ok(retained);await page.getByRole('button',{name:'Toggle category',exact:true}).click();await host.waitFor({state:'detached'});await retained.evaluate(element=>element.dispatchEvent(new CustomEvent('ha-select-request',{detail:{value:[1],reason:'change'},cancelable:true})));assert.equal(await count('Category events'),8);await waitModel([1,false]);
 await page.getByRole('button',{name:'Toggle category',exact:true}).click();await multiple.selectOption(['2']);await waitModel([false]);await waitEvents(9);
 await host.screenshot({path:join(root,'test-results','packed-'+framework+'-select-multiple-light.png')});await page.getByRole('button',{name:'Toggle category mode',exact:true}).click();await waitModel(1);await host.screenshot({path:join(root,'test-results','packed-'+framework+'-select-light.png')});
 return {typedNumberStringBoolean:true,pickerTypeahead:true,originalRequestExactlyOnce:true,cancellation:true,programmaticWritesEmitNoIntent:true,asyncOptionsPreserveModel:true,requiredValidation:true,disabledSubmission:true,nativeFormData:true,multipleTypedValues:true,frameworkReset:true,teardownAndRemount:true};
}

export async function exerciseInstalledSelect(page:Page){
 await page.evaluate(async()=>{
  const form=document.createElement('form');form.id='packed-select-proof';const host=document.createElement('vyp-ha-select');host.id='packed-core-select';host.state={...host.state,label:'Packed category',options:[{value:1,label:'Maintenance',disabled:false},{value:'1',label:'Shopping',disabled:false},{value:false,label:'Other',disabled:false}],required:true};host.name='category';host.defaultValue=1;
  host.addEventListener('ha-select-request',event=>{host.value=event.detail.value;});const button=document.createElement('button');button.type='submit';button.textContent='Save packed category';form.append(host,button);form.addEventListener('submit',event=>{event.preventDefault();form.dataset.saved=JSON.stringify([...new FormData(form)]);});document.body.append(form);await host.updateComplete;
 });
 const control=page.getByRole('combobox',{name:'Packed category',exact:true});await control.click();await page.locator('#packed-core-select').getByRole('option',{name:'Shopping',exact:true}).click();assert.equal(await page.locator('#packed-core-select').evaluate(host=>(host as HaSelect).value),'1');await page.getByRole('button',{name:'Save packed category',exact:true}).click();assert.deepEqual(JSON.parse((await page.locator('#packed-select-proof').getAttribute('data-saved'))!),[['category','1']]);
 await control.focus();await page.keyboard.press('o');await page.keyboard.press('Tab');assert.equal(await page.locator('#packed-core-select').evaluate(host=>(host as HaSelect).value),false);
 await page.locator('#packed-core-select').evaluate(async element=>{const host=element as HaSelect;host.state={...host.state,multiple:true,size:4};host.value=[false,1];await host.updateComplete;});
 const multiple=page.getByRole('listbox',{name:'Packed category',exact:true});await multiple.selectOption(['0','1']);assert.deepEqual(await page.locator('#packed-core-select').evaluate(host=>(host as HaSelect).value),[1,'1']);await page.getByRole('button',{name:'Save packed category',exact:true}).click();assert.deepEqual(JSON.parse((await page.locator('#packed-select-proof').getAttribute('data-saved'))!),[['category','1'],['category','1']]);
 const result=await page.locator('#packed-core-select').evaluate(async element=>{const host=element as HaSelect;host.state={...host.state,multiple:false,size:1};host.formStateRestoreCallback('false','restore');await host.updateComplete;const restored=host.value;host.form!.reset();await host.updateComplete;return {restored,reset:host.value,entries:[...new FormData(host.form!)]};});assert.deepEqual(result,{restored:false,reset:1,entries:[['category','1']]});await page.locator('#packed-select-proof').evaluate(element=>element.remove());
 const ancestorScroll=await exerciseInstalledSelectScroll(page);
 return {typedSingleSelection:true,typedMultipleSelection:true,pickerTypeahead:true,nativeFormData:true,explicitTypedRestorationAndReset:result,ancestorScroll};
}

/** Actual compiled core in ordinary, shadow and slotted application scroll containers. */
export async function exerciseInstalledSelectScroll(page:Page){
 const results=[];
 for(const mode of ['light','shadow','slotted']){
  await page.evaluate(async mode=>{
   const wrapper=document.createElement('div');wrapper.id='packed-scroller-proof';wrapper.style.cssText='position:fixed;left:8px;top:8px;width:320px;z-index:100';
   const root=mode==='light'?wrapper:wrapper.attachShadow({mode:'open'}),panel=document.createElement('div'),content=document.createElement('div'),spacer=document.createElement('div');
   panel.id='packed-scroller-panel';panel.style.cssText='height:240px;width:320px;overflow:auto;scroll-behavior:auto';content.style.height='800px';spacer.style.height='80px';content.append(spacer);
   const form=document.createElement('form'),host=document.createElement('vyp-ha-select');host.id='packed-scrolling-select';host.style.width='280px';host.name='category';host.state={...host.state,label:'Scrolling category',required:true,options:[{value:1,label:'Maintenance',disabled:false},{value:'1',label:'Shopping',disabled:false}]};host.defaultValue=1;host.dataset.requests='0';host.addEventListener('ha-select-request',()=>{host.dataset.requests=String(Number(host.dataset.requests)+1);});form.append(host);
   if(mode==='slotted'){content.append(document.createElement('slot'));wrapper.append(form);}else content.append(form);
   panel.append(content);root.append(panel);document.body.append(wrapper);const after=document.createElement('button');after.id='packed-scroll-parking';after.textContent='Pointer parking';after.style.cssText='position:fixed;right:8px;bottom:8px;z-index:101';document.body.append(after);await host.updateComplete;
  },mode);
  const host=page.locator('#packed-scrolling-select'),control=host.getByRole('combobox',{name:'Scrolling category',exact:true});await control.click();await page.locator('#packed-scroll-parking').hover();
  const before=await host.evaluate(async element=>{await(element as HaSelect).updateComplete;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));return element.shadowRoot!.getElementById('options')!.getBoundingClientRect().top;});
  const panel=page.locator('#packed-scroller-panel'),initialScroll=await panel.evaluate(element=>element.scrollTop);
  await panel.evaluate(element=>{element.addEventListener('scroll',event=>{(element as HTMLElement).dataset.event=JSON.stringify({trusted:event.isTrusted,bubbles:event.bubbles,composed:event.composed});},{once:true});element.scrollTop+=40;});await page.locator('#packed-scroller-panel[data-event]').waitFor();
  const actual=await host.evaluate(element=>{const host=element as HaSelect;return{top:host.shadowRoot!.getElementById('options')!.getBoundingClientRect().top,anchorBottom:host.shadowRoot!.getElementById('control')!.getBoundingClientRect().bottom,requests:Number(host.dataset.requests),value:host.value,entries:[...new FormData(host.form!)]};});
  assert.equal(await panel.evaluate(element=>element.scrollTop),initialScroll+40);assert.equal(actual.top,before-40);assert.equal(actual.top,actual.anchorBottom);assert.equal(actual.requests,0);assert.equal(actual.value,1);assert.deepEqual(actual.entries,[['category','1']]);const event=JSON.parse((await panel.getAttribute('data-event'))!);assert.deepEqual(event,{trusted:true,bubbles:false,composed:false});results.push({mode,initialScroll,before,...actual,event});
  await page.locator('#packed-scroller-proof').evaluate(element=>element.remove());await page.locator('#packed-scroll-parking').evaluate(element=>element.remove());
 }
 return results;
}
