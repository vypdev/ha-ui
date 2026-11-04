import {afterEach,expect,test,vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {buttonState,ButtonInputError,type ButtonType} from '../../packages/core/src/button-contracts.js';
import {registerButton,HaButton,type ButtonPressEvent} from '../../packages/core/src/components/button.js';
import {registerField} from '../../packages/core/src/components/field.js';
const model=(patch:Record<string,unknown>={})=>buttonState({label:'Save task',...patch});
const control=(button:HaButton)=>button.shadowRoot!.querySelector('button')!;
const settle=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
async function mount(type:ButtonType='button',patch:Record<string,unknown>={}){registerButton();const form=document.createElement('form'),button=document.createElement('vyp-ha-button');button.state=model(patch);button.type=type;form.append(button);document.body.append(form);await button.updateComplete;return {form,button};}
afterEach(()=>document.body.replaceChildren());

test('preserves pre-upgrade state, type and boolean properties without object attributes',async()=>{
 const button=document.createElement('vyp-ha-button');button.state=model({label:'Save <b>task</b>'});button.type='submit';button.name='action';button.value='save';button.disabled=false;document.body.append(button);registerButton();await button.updateComplete;
 expect(button).toBeInstanceOf(HaButton);expect(control(button).textContent).toContain('Save <b>task</b>');expect(button.shadowRoot!.querySelector('b')).toBeNull();expect(button.hasAttribute('state')).toBe(false);expect(button.type).toBe('submit');expect(button.submitter!.name).toBe('action');expect(button.querySelectorAll('button')).toHaveLength(1);
});
test('registers explicitly and rejects conflicting constructors',()=>{registerButton();registerButton(customElements);expect(customElements.get('vyp-ha-button')).toBe(HaButton);expect(()=>registerButton({get:()=>HTMLElement} as unknown as CustomElementRegistry)).toThrow(/conflict/u);});
test('has safe defaults and delegates methods only after rendering',async()=>{const button=new HaButton();expect(button.submitter).toBeNull();expect(button.form).toBeNull();button.click();button.focus();button.blur();document.body.append(button);await button.updateComplete;expect(button.type).toBe('button');expect(button.state.label).toBe('Action');expect(button.name).toBe('');expect(button.value).toBe('');expect(button.disabled).toBe(false);expect(button.formNoValidate).toBe(false);button.focus({preventScroll:true});expect(button.shadowRoot!.activeElement).toBe(control(button));button.blur();expect(button.shadowRoot!.activeElement).toBeNull();});
test('reflects validated native metadata and rolls invalid properties back atomically',async()=>{
 const {button}=await mount();button.type='submit';button.name='action';button.value='<b>save</b>\nvalue';button.formNoValidate=true;button.formNoValidate=true;button.disabled=true;button.disabled=true;await button.updateComplete;
 expect(button.getAttribute('type')).toBe('submit');expect(button.submitter!.value).toBe('<b>save</b>\nvalue');expect(button.submitter!.formNoValidate).toBe(true);expect(control(button).disabled).toBe(true);
 for(const [key,value] of [['state',{label:''}],['type','unsafe'],['name','secret\nname'],['value','\ud800'],['disabled','false'],['formNoValidate','false']] as const)expect(()=>Reflect.set(button,key,value)).toThrow(ButtonInputError);
 expect(button.type).toBe('submit');expect(button.name).toBe('action');button.removeAttribute('type');button.removeAttribute('name');button.removeAttribute('value');button.removeAttribute('disabled');button.removeAttribute('formnovalidate');await button.updateComplete;
 expect(button.type).toBe('button');expect(button.hasAttribute('type')).toBe(false);expect(button.name).toBe('');expect(button.value).toBe('');expect(button.disabled).toBe(false);expect(button.formNoValidate).toBe(false);
 button.setAttribute('disabled','false');button.setAttribute('formnovalidate','false');expect(button.disabled).toBe(true);expect(button.formNoValidate).toBe(true);
});
test('restores invalid text attributes without exposing their input in diagnostics',async()=>{
 const {button}=await mount('submit');button.name='action';const errors:Error[]=[];const capture=(event:ErrorEvent)=>{event.preventDefault();errors.push(event.error as Error);};window.addEventListener('error',capture);
 try{button.setAttribute('name','secret\nname');button.setAttribute('value','\ud800');button.setAttribute('type','image');expect(button.getAttribute('name')).toBe('action');expect(button.hasAttribute('value')).toBe(false);expect(button.getAttribute('type')).toBe('submit');expect(errors).toHaveLength(3);for(const error of errors)expect(error.message).toBe('invalid_button');button.setAttribute('value','Valid');expect(button.value).toBe('Valid');}finally{window.removeEventListener('error',capture);}
});
test('emits one immutable cancelable request and one native click, while app-owned pressed state remains controlled',async()=>{
 const {button}=await mount('button',{pressed:false});const requests:ButtonPressEvent[]=[],clicks:Event[]=[];button.addEventListener('ha-press-request',event=>requests.push(event));button.addEventListener('click',event=>clicks.push(event));button.click();await settle();
 expect(requests).toHaveLength(1);expect(requests[0].detail).toEqual({type:'button'});expect(Object.isFrozen(requests[0].detail)).toBe(true);expect(requests[0].bubbles&&requests[0].composed&&requests[0].cancelable).toBe(true);expect(clicks).toHaveLength(1);expect(button.state.pressed).toBe(false);
 button.state=model({pressed:true});await button.updateComplete;expect(control(button).getAttribute('aria-pressed')).toBe('true');expect(requests).toHaveLength(1);
});
test('preserves trusted native Enter and Space activation without duplicate requests',async()=>{const {button}=await mount();const request=vi.fn();button.addEventListener('ha-press-request',request);button.focus();await userEvent.keyboard('{Enter}');await userEvent.keyboard(' ');await settle();expect(request).toHaveBeenCalledTimes(2);control(button).dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await settle();expect(request).toHaveBeenCalledTimes(2);});
test('honors canceled custom intent, an earlier native click cancellation and later host cancellation',async()=>{
 const {button,form}=await mount('submit');let submissions=0,requests=0;form.addEventListener('submit',event=>{event.preventDefault();submissions++;});button.addEventListener('ha-press-request',event=>{requests++;event.preventDefault();},{once:true});button.click();await settle();expect(submissions).toBe(0);expect(requests).toBe(1);
 button.addEventListener('click',event=>event.preventDefault(),{capture:true,once:true});button.click();await settle();expect(requests).toBe(1);
 button.addEventListener('click',event=>event.preventDefault(),{once:true});button.click();await settle();expect(submissions).toBe(0);
});
test('uses the real exposed submitter, browser validation and successful-control name/value exactly once',async()=>{
 const {form,button}=await mount('submit');button.name='action';button.value='save';const input=document.createElement('input');input.name='task';input.required=true;form.prepend(input);input.addEventListener('invalid',event=>event.preventDefault());const events:SubmitEvent[]=[];form.addEventListener('submit',event=>{event.preventDefault();events.push(event as SubmitEvent);});
 expect([...new FormData(form)]).toEqual([['task','']]);button.click();await settle();expect(events).toHaveLength(0);input.value='Kitchen';button.click();await settle();expect(events).toHaveLength(1);expect(events[0].submitter).toBe(button.submitter);expect([...new FormData(form,button.submitter!)]).toEqual([['task','Kitchen'],['action','save']]);
 input.value='';button.formNoValidate=true;button.click();await settle();expect(events).toHaveLength(2);
});
test('exposes native implicit submission and respects disabled or loading default submitters',async()=>{
 const {form,button}=await mount('submit');const input=document.createElement('input');form.prepend(input);let requests=0,submissions=0;button.addEventListener('ha-press-request',()=>requests++);form.addEventListener('submit',event=>{event.preventDefault();submissions++;});input.focus();await userEvent.keyboard('{Enter}');expect(requests).toBe(1);expect(submissions).toBe(1);
 button.state=model({loading:true});await button.updateComplete;input.focus();await userEvent.keyboard('{Enter}');expect(submissions).toBe(1);expect(requests).toBe(1);button.state=model();button.disabled=true;await button.updateComplete;await userEvent.keyboard('{Enter}');expect(submissions).toBe(1);
});
test('custom text-field Enter activates the actual default submitter and its cancelable request',async()=>{
 registerField();const {form,button}=await mount('submit');const field=document.createElement('vyp-ha-field');form.prepend(field);await field.updateComplete;let requests=0,submissions=0;button.addEventListener('ha-press-request',event=>{requests++;event.preventDefault();});form.addEventListener('submit',event=>{event.preventDefault();submissions++;});field.focus();await userEvent.keyboard('{Enter}');await settle();expect(requests).toBe(1);expect(submissions).toBe(0);
});
test('loading retains focus and announces status while blocking native and scripted activations',async()=>{
 const {button}=await mount();const requests=vi.fn();button.addEventListener('ha-press-request',requests);button.focus();button.state=model({loading:true,loadingLabel:'Guardando…'});await button.updateComplete;expect(button.shadowRoot!.activeElement).toBe(control(button));expect(control(button).disabled).toBe(false);expect(control(button).getAttribute('aria-disabled')).toBe('true');expect(control(button).getAttribute('aria-busy')).toBe('true');expect(button.shadowRoot!.querySelector('[role=status]')!.textContent).toBe('Guardando…');expect(button.submitter!.disabled).toBe(true);
 button.click();await userEvent.keyboard('{Enter}');button.submitter!.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));await settle();expect(requests).not.toHaveBeenCalled();button.state=model();await button.updateComplete;button.click();expect(requests).toHaveBeenCalledTimes(1);
});
test('disabled fieldsets disable the visible control but preserve the first-legend exception',async()=>{
 const {button,form}=await mount();const fieldset=document.createElement('fieldset'),legend=document.createElement('legend');fieldset.append(legend,button);form.append(fieldset);fieldset.disabled=true;await button.updateComplete;expect(button.disabled).toBe(false);expect(control(button).disabled).toBe(true);const request=vi.fn();button.addEventListener('ha-press-request',request);control(button).dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));expect(request).not.toHaveBeenCalled();legend.append(button);await button.updateComplete;expect(control(button).disabled).toBe(false);button.click();expect(request).toHaveBeenCalledTimes(1);
});
test('supports external and changing form ownership without inventing a form',async()=>{
 const {form,button}=await mount('submit');form.id='first';const other=document.createElement('form');other.id='second';document.body.append(other);button.setAttribute('form','second');expect(button.form).toBe(other);expect(button.submitter!.form).toBe(other);button.setAttribute('form','missing');expect(button.form).toBeNull();expect(button.submitter!.form).toBeNull();button.removeAttribute('form');expect(button.form).toBe(form);expect(button.submitter!.hasAttribute('form')).toBe(false);button.remove();document.body.append(button);expect(button.form).toBeNull();button.click();await settle();
});
test('uses normal cancelable reset semantics and never toggles controlled state on form reset',async()=>{
 const {form,button}=await mount('reset',{pressed:true});const input=document.createElement('input');input.defaultValue='Initial';input.value='Edited';form.prepend(input);form.addEventListener('reset',event=>event.preventDefault(),{once:true});button.click();await settle();expect(input.value).toBe('Edited');button.click();await settle();expect(input.value).toBe('Initial');expect(button.state.pressed).toBe(true);
});
test('aborts deferred actions when disabled, busy, retargeted, retyped or reconnected during intent',async()=>{
 for(const transition of ['disabled','busy','owner','type','reconnect']){const {form,button}=await mount('submit');const other=document.createElement('form');document.body.append(other);let submissions=0;for(const owner of [form,other])owner.addEventListener('submit',event=>{event.preventDefault();submissions++;});button.addEventListener('ha-press-request',()=>{if(transition==='disabled')button.disabled=true;else if(transition==='busy')button.state=model({loading:true});else if(transition==='owner'){other.id='changed-owner';button.setAttribute('form','changed-owner');}else if(transition==='type')button.type='reset';else{button.remove();form.append(button);}},{once:true});button.click();await settle();expect(submissions).toBe(0);expect(button.querySelectorAll('button')).toHaveLength(1);}
});
test('preserves native proxy request cancellation and bypasses form method shadowing',async()=>{
 const {form,button}=await mount('submit');let submissions=0;form.addEventListener('submit',event=>{event.preventDefault();submissions++;});button.addEventListener('ha-press-request',event=>event.preventDefault(),{once:true});button.submitter!.click();expect(submissions).toBe(0);const clobber=document.createElement('input');clobber.name='requestSubmit';form.append(clobber);button.click();await settle();expect(submissions).toBe(1);
});
test('keeps decorative icon slots inert and label text accessible in icon-only mode',async()=>{const {button}=await mount('button',{iconOnly:true});const icon=document.createElement('span');icon.slot='leading';icon.textContent='Decorative';button.append(icon);await button.updateComplete;expect(control(button).getAttribute('aria-label')).toBe('Save task');expect(button.shadowRoot!.querySelector('slot[name=leading]')!.parentElement!.hasAttribute('inert')).toBe(true);expect(button.shadowRoot!.querySelector('.label')!.classList.contains('sr-only')).toBe(true);});
test('renders all documented variants and sizes through public theme tokens',async()=>{
 const {button}=await mount();for(const variant of ['primary','neutral','danger','success','warning','plain','outlined','filled']){button.state=model({variant});await button.updateComplete;expect(control(button).dataset.variant).toBe(variant);}
 for(const [size,height] of [['small','44px'],['medium','44px'],['large','48px'],['extra-large','56px']]){button.state=model({size});await button.updateComplete;expect(getComputedStyle(control(button)).minHeight).toBe(height);}
 button.state=model({variant:'primary',pressed:false});button.style.setProperty('--vyp-ha-primary','#0075b5');button.style.setProperty('--vyp-ha-on-accent','#ffffff');await button.updateComplete;await expect.poll(()=>getComputedStyle(button.shadowRoot!.querySelector('[part=surface]')!).backgroundColor).toBe('rgb(0, 117, 181)');expect(getComputedStyle(button.shadowRoot!.querySelector('[part=surface]')!).backgroundColor).toBe('rgb(0, 117, 181)');expect(getComputedStyle(control(button)).color).toBe('rgb(255, 255, 255)');expect(control(button).getAttribute('aria-pressed')).toBe('false');button.state=model();await button.updateComplete;expect(control(button).hasAttribute('aria-pressed')).toBe(false);
});

test('empty decorative slots add no visual spacing to the native button',async()=>{
 const {button}=await mount();const box=control(button).getBoundingClientRect(),label=button.shadowRoot!.querySelector('.label')!.getBoundingClientRect();expect(box.width-label.width).toBeCloseTo(34,0);
});

test('busy clicks never reach application bubble listeners and disabled cursors remain distinct',async()=>{
 const {button}=await mount('button',{loading:true});const clicks=vi.fn();button.addEventListener('click',clicks);button.click();await settle();expect(clicks).not.toHaveBeenCalled();expect(getComputedStyle(control(button)).cursor).toBe('wait');button.state=model();button.disabled=true;await button.updateComplete;expect(getComputedStyle(control(button)).cursor).toBe('not-allowed');
});
test('pressed state has a visible shape indicator and large icon buttons remain square',async()=>{
 const {button}=await mount('button',{pressed:true,iconOnly:true,size:'extra-large'});expect(getComputedStyle(button.shadowRoot!.querySelector('[part=surface]')!).boxShadow).not.toBe('none');const box=control(button).getBoundingClientRect();expect(box.width).toBe(box.height);
});

test('detached old buttons and removed submitters cannot perform or bubble actions',async()=>{
 const {button,form}=await mount('submit');const click=vi.fn(),press=vi.fn(),submit=vi.fn();button.addEventListener('click',click);button.addEventListener('ha-press-request',press);form.addEventListener('submit',event=>{event.preventDefault();submit();});button.remove();button.click();await settle();expect(click).not.toHaveBeenCalled();expect(press).not.toHaveBeenCalled();form.append(button);button.addEventListener('ha-press-request',()=>button.submitter!.remove(),{once:true});button.click();await settle();expect(submit).not.toHaveBeenCalled();
});
test('keeps native implicit activation blocked if the request handler makes the button busy',async()=>{
 const {button,form}=await mount('submit');const submit=vi.fn();form.addEventListener('submit',event=>{event.preventDefault();submit();});button.addEventListener('ha-press-request',()=>button.state=model({loading:true}),{once:true});button.submitter!.click();await settle();expect(submit).not.toHaveBeenCalled();
});
test('preserves visible keyboard focus and wraps long labels inside a narrow target',async()=>{
 const {button}=await mount('button',{label:'Complete the unusually long household maintenance task'});button.style.width='120px';await button.updateComplete;await userEvent.tab();expect(control(button).matches(':focus-visible')).toBe(true);expect(getComputedStyle(button.shadowRoot!.querySelector('[part=surface]')!).outlineStyle).toBe('solid');expect(control(button).getBoundingClientRect().width).toBeLessThanOrEqual(120);expect(control(button).getBoundingClientRect().height).toBeGreaterThan(44);expect(control(button).scrollWidth).toBeLessThanOrEqual(control(button).clientWidth);
});

test.each(['submit','reset'] as const)('one trusted %s activation emits one request and no auxiliary click',async type=>{
 const {form,button}=await mount(type);const input=document.createElement('input');input.name='task';input.defaultValue='Initial';input.value='Edited';form.prepend(input);button.name='action';button.value='save';
 const requests:ButtonPressEvent[]=[],nativeClicks:MouseEvent[]=[],actions:Event[]=[];button.addEventListener('ha-press-request',event=>requests.push(event));button.submitter!.addEventListener('click',event=>nativeClicks.push(event));form.addEventListener(type==='submit'?'submit':'reset',event=>{if(type==='submit')event.preventDefault();actions.push(event);});
 await userEvent.click(control(button));await settle();
 expect(requests).toHaveLength(1);expect(requests[0].detail).toEqual({type});expect(nativeClicks).toHaveLength(0);expect(actions).toHaveLength(1);
 if(type==='submit'){expect((actions[0] as SubmitEvent).submitter).toBe(button.submitter);expect([...new FormData(form,button.submitter!)]).toEqual([['task','Edited'],['action','save']]);}else expect(input.value).toBe('Initial');
 button.submitter!.click();await settle();expect(requests).toHaveLength(2);expect(nativeClicks).toHaveLength(1);expect(actions).toHaveLength(2);
});

test.each(['submit','reset'] as const)('native programmatic %s does not synthesize a submitter click or press request',async type=>{
 const {form,button}=await mount(type);const input=document.createElement('input');input.defaultValue='Initial';input.value='Edited';form.prepend(input);
 const request=vi.fn(),click=vi.fn(),actions:Event[]=[];button.addEventListener('ha-press-request',request);button.submitter!.addEventListener('click',click);form.addEventListener(type==='submit'?'submit':'reset',event=>{if(type==='submit')event.preventDefault();actions.push(event);});
 if(type==='submit')HTMLFormElement.prototype.requestSubmit.call(form,button.submitter!);else HTMLFormElement.prototype.reset.call(form);
 await settle();expect(actions).toHaveLength(1);expect(click).not.toHaveBeenCalled();expect(request).not.toHaveBeenCalled();if(type==='submit')expect((actions[0] as SubmitEvent).submitter).toBe(button.submitter);else expect(input.value).toBe('Initial');
});
