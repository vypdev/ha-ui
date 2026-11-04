import {afterEach,expect,test} from 'vitest';
import {userEvent} from 'vitest/browser';
import {textFieldState,FieldInputError} from '../../packages/core/src/field-contracts.js';
import {HaTextField,registerField,type FieldValueEvent} from '../../packages/core/src/components/field.js';

const model=(patch:Record<string,unknown>={})=>textFieldState({label:'Task name',...patch});
const input=(field:HaTextField)=>field.shadowRoot!.querySelector('input')!;
async function mount(patch:Record<string,unknown>={}) {
  registerField(); const form=document.createElement('form');
  const field=document.createElement('vyp-ha-field');field.state=model(patch);field.name='task';form.append(field);document.body.append(form);
  await field.updateComplete;return {field,form};
}
const entries=(form:HTMLFormElement)=>[...new FormData(form).entries()];
function edit(field:HaTextField,value:string,options:InputEventInit={}) {
  input(field).value=value;input(field).dispatchEvent(new InputEvent('input',{bubbles:true,composed:true,...options}));
}
function accept(field:HaTextField) {field.addEventListener('ha-value-request',event=>{if(!event.defaultPrevented)field.value=event.detail.value;});}
afterEach(()=>document.body.replaceChildren());

test('preserves values assigned before explicit upgrade and never serializes controlled objects',async()=>{
  const field=document.createElement('vyp-ha-field');field.state=model({label:'Nombre'});field.value='Before upgrade';field.name='task';document.body.append(field);
  registerField();await field.updateComplete;
  expect(field).toBeInstanceOf(HaTextField);expect(input(field).value).toBe('Before upgrade');expect(input(field).labels![0].textContent).toContain('Nombre');
  expect(field.getAttribute('value')).toBeNull();expect(field.hasAttribute('state')).toBe(false);
});
test('registers explicitly and idempotently, rejecting conflicting definitions',()=>{
  registerField();registerField(customElements);expect(customElements.get('vyp-ha-field')).toBe(HaTextField);
  expect(()=>registerField({get:()=>HTMLElement} as unknown as CustomElementRegistry)).toThrow(/conflict/u);
});
test('provides an empty usable default and native form association',async()=>{
  const field=document.createElement('vyp-ha-field');document.body.append(field);await field.updateComplete;
  expect(field.state.label).toBe('Value');expect(field.value).toBe('');expect(field.defaultValue).toBe('');expect(field.form).toBeNull();expect(field.labels.length).toBe(0);
  const form=document.createElement('form');form.id='external';document.body.append(form);field.setAttribute('form','external');field.name='externalName';
  expect(field.form).toBe(form);expect(entries(form)).toEqual([['externalName','']]);
  const label=document.createElement('label');field.id='externalField';label.htmlFor=field.id;label.textContent='External';document.body.append(label);
  expect([...field.labels]).toEqual([label]);field.removeAttribute('form');expect(field.form).toBeNull();
});
test('renders inert label/help/placeholder/error text and connects accessible descriptions',async()=>{
  const {field}=await mount({label:'<b>Name</b>',description:'Helpful <script>text</script>',placeholder:'Example',error:'Review <b>this</b>'});
  expect(field.shadowRoot!.querySelector('script,b')).toBeNull();expect(input(field).labels![0].textContent).toBe('<b>Name</b>');expect(input(field).placeholder).toBe('Example');
  expect(input(field).getAttribute('aria-describedby')).toBe('help error');expect(input(field).getAttribute('aria-invalid')).toBe('true');
  expect(field.shadowRoot!.getElementById('error')!.textContent).toBe('Review <b>this</b>');
  field.state=model();await field.updateComplete;expect(input(field).hasAttribute('aria-describedby')).toBe(false);expect(input(field).getAttribute('aria-invalid')).toBe('false');
});
test('keeps accepted values controlled, requests once through shadow boundaries and supports cancellation',async()=>{
  const {field,form}=await mount();field.value='Accepted';await field.updateComplete;
  const received:FieldValueEvent[]=[];form.addEventListener('ha-value-request',event=>{received.push(event);event.preventDefault();});
  edit(field,'Proposed');expect(received).toHaveLength(1);expect(received[0].detail).toEqual({value:'Proposed',reason:'input'});
  expect(Object.isFrozen(received[0].detail)).toBe(true);expect(received[0].bubbles&&received[0].composed&&received[0].cancelable).toBe(true);
  expect(field.value).toBe('Accepted');expect(input(field).value).toBe('Accepted');expect(entries(form)).toEqual([['task','Accepted']]);
  field.value='Server update';await field.updateComplete;expect(received).toHaveLength(1);expect(input(field).value).toBe('Server update');
});
test('accepts synchronous edits, transformed results and deferred acknowledgments without losing the caret',async()=>{
  const {field}=await mount();const listener=(event:FieldValueEvent)=>{field.value=event.detail.value;};field.addEventListener('ha-value-request',listener);
  edit(field,'Wash dishes');expect(field.value).toBe('Wash dishes');
  input(field).setSelectionRange(2,4,'backward');field.value=field.value;expect(input(field).selectionStart).toBe(2);expect(input(field).selectionDirection).toBe('backward');
  field.removeEventListener('ha-value-request',listener);input(field).value='Wash kitchen';input(field).setSelectionRange(5,7,'backward');
  input(field).dispatchEvent(new InputEvent('input',{bubbles:true}));expect(input(field).value).toBe('Wash dishes');
  field.value='Wash kitchen';expect(input(field).selectionStart).toBe(5);expect(input(field).selectionEnd).toBe(7);expect(input(field).selectionDirection).toBe('backward');
  field.addEventListener('ha-value-request',event=>{field.value=event.detail.value.toUpperCase();},{once:true});edit(field,'new');expect(field.value).toBe('NEW');
  edit(field,'NEW');expect(field.value).toBe('NEW');
});
test('preserves literal values and rejects malformed assignments atomically without diagnostic echo',async()=>{
  const {field,form}=await mount();field.value='<script>literal</script>';await field.updateComplete;
  for(const [key,value] of [['state',{label:'secret\ninvalid'}],['value','secret\ninvalid'],['defaultValue','secret\ninvalid'],['name','secret\ninvalid'],['disabled','false'],['readOnly','false']] as const) {
    expect(()=>Reflect.set(field,key,value)).toThrow(FieldInputError);
    try{Reflect.set(field,key,value);}catch(error){expect((error as Error).message).not.toContain('secret');}
  }
  expect(field.value).toBe('<script>literal</script>');expect(entries(form)).toEqual([['task','<script>literal</script>']]);expect(field.shadowRoot!.querySelector('script')).toBeNull();
});
test('honors pristine defaults, dirty values, standard attributes and controlled form reset',async()=>{
  const {field,form}=await mount();field.setAttribute('value','Initial');await field.updateComplete;
  expect(field.value).toBe('Initial');expect(field.defaultValue).toBe('Initial');field.defaultValue='New baseline';expect(field.value).toBe('New baseline');
  field.value='Edited';field.defaultValue='Reset value';expect(field.value).toBe('Edited');expect(field.getAttribute('value')).toBe('Reset value');
  form.reset();expect(field.value).toBe('Edited');accept(field);form.reset();expect(field.value).toBe('Reset value');
  field.defaultValue='Pristine again';expect(field.value).toBe('Pristine again');field.removeAttribute('value');expect(field.value).toBe('');expect(field.defaultValue).toBe('');
  field.removeAttribute('name');expect(field.name).toBe('');expect(field.hasAttribute('name')).toBe(false);expect(field.hasAttribute('value')).toBe(false);expect(entries(form)).toEqual([]);field.name='new';field.name='new';expect(field.getAttribute('name')).toBe('new');
});
test('respects canceled reset and supports explicit state restore requests without assuming acceptance',async()=>{
  const {field,form}=await mount();field.defaultValue='Default';field.value='Current';const reasons:string[]=[];
  field.addEventListener('ha-value-request',event=>{reasons.push(event.detail.reason);if(event.detail.reason==='reset')event.preventDefault();else field.value=event.detail.value;});
  form.reset();expect(field.value).toBe('Current');field.formStateRestoreCallback('Restored','restore');expect(field.value).toBe('Restored');
  field.formStateRestoreCallback('Autofill','autocomplete');expect(field.value).toBe('Autofill');expect(reasons).toEqual(['reset','restore','autocomplete']);
  expect(()=>field.formStateRestoreCallback(new FormData(),'restore')).toThrow(FieldInputError);
  expect(()=>field.formStateRestoreCallback('x','other' as 'restore')).toThrow(FieldInputError);
  form.addEventListener('reset',event=>event.preventDefault(),{once:true});form.reset();expect(reasons).toHaveLength(3);
});
test('implements native required, length and custom validity, with localized error messages',async()=>{
  const {field,form}=await mount({required:true,minLength:3,maxLength:5,requiredMessage:'Introduce un valor.',tooShortMessage:'Demasiado corto.',tooLongMessage:'Demasiado largo.'});
  const invalid:Event[]=[];field.addEventListener('invalid',event=>{invalid.push(event);event.preventDefault();});
  expect(field.validity.valueMissing).toBe(true);expect(field.willValidate).toBe(true);expect(field.validationMessage).toBe('Introduce un valor.');expect(field.shadowRoot!.getElementById('error')).toBeNull();
  expect(field.checkValidity()).toBe(false);await field.updateComplete;expect(invalid).toHaveLength(1);expect(input(field).getAttribute('aria-invalid')).toBe('true');expect(field.shadowRoot!.getElementById('error')!.textContent).toBe('Introduce un valor.');
  field.value='ab';expect(field.validity.tooShort).toBe(true);expect(field.validationMessage).toBe('Demasiado corto.');
  field.value='123456';expect(field.validity.tooLong).toBe(true);expect(field.validationMessage).toBe('Demasiado largo.');
  field.value='Valid';expect(field.checkValidity()).toBe(true);expect(field.reportValidity()).toBe(true);expect(form.checkValidity()).toBe(true);
  field.setCustomValidity('Review this value.');expect(field.validity.customError).toBe(true);expect(field.reportValidity()).toBe(false);expect(field.validationMessage).toBe('Review this value.');
  expect(()=>field.setCustomValidity('secret\ninvalid')).toThrow(FieldInputError);expect(field.validationMessage).toBe('Review this value.');
  field.setCustomValidity('');expect(field.validity.valid).toBe(true);await field.updateComplete;expect(field.shadowRoot!.getElementById('error')).toBeNull();
});
test('shows constraint errors on blur, keeps help connected and delegates focus/blur',async()=>{
  const {field}=await mount({required:true,description:'Choose a name.'});field.focus({preventScroll:true});expect(field.shadowRoot!.activeElement).toBe(input(field));
  field.blur();await field.updateComplete;expect(field.shadowRoot!.activeElement).toBeNull();expect(input(field).getAttribute('aria-describedby')).toBe('help error');
});
test('excludes disabled and disabled-fieldset values while preserving the first legend exception',async()=>{
  const {field,form}=await mount({required:true});field.value='Saved';field.disabled=true;field.disabled=true;await field.updateComplete;
  expect(field.hasAttribute('disabled')).toBe(true);expect(input(field).disabled).toBe(true);expect(field.willValidate).toBe(false);expect(entries(form)).toEqual([]);
  field.disabled=false;field.setAttribute('disabled','false');expect(field.disabled).toBe(true);field.removeAttribute('disabled');await field.updateComplete;
  const fieldset=document.createElement('fieldset');const legend=document.createElement('legend');fieldset.append(legend);form.append(fieldset);fieldset.append(field);fieldset.disabled=true;await field.updateComplete;
  expect(field.disabled).toBe(false);expect(input(field).disabled).toBe(true);expect(entries(form)).toEqual([]);const received:FieldValueEvent[]=[];field.addEventListener('ha-value-request',event=>received.push(event));edit(field,'Synthetic');expect(received).toHaveLength(0);expect(input(field).value).toBe('Saved');
  legend.append(field);await field.updateComplete;expect(input(field).disabled).toBe(false);expect(entries(form)).toEqual([['task','Saved']]);
});
test('reflects readonly state and native readonly attributes without discarding form data',async()=>{
  const {field,form}=await mount({required:true,readOnly:true});expect(field.readOnly).toBe(true);expect(input(field).readOnly).toBe(true);expect(field.hasAttribute('readonly')).toBe(true);expect(field.willValidate).toBe(false);expect(entries(form)).toEqual([['task','']]);
  const received:FieldValueEvent[]=[];field.addEventListener('ha-value-request',event=>received.push(event));edit(field,'Synthetic');expect(received).toHaveLength(0);
  field.readOnly=false;field.readOnly=false;await field.updateComplete;expect(field.state.readOnly).toBe(false);expect(field.willValidate).toBe(true);
  field.setAttribute('readonly','false');await field.updateComplete;expect(field.state.readOnly).toBe(true);expect(input(field).readOnly).toBe(true);field.removeAttribute('readonly');expect(field.readOnly).toBe(false);
});
test.each([
  {case:'required empty',value:'',error:'',custom:'',message:'Enter a value.'},
  {case:'too short',value:'x',error:'',custom:'',message:'Enter more characters.'},
  {case:'too long',value:'Long value',error:'',custom:'',message:'Enter fewer characters.'},
  {case:'state error',value:'Valid',error:'Review the imported value.',custom:'',message:'Review the imported value.'},
  {case:'custom error',value:'Valid',error:'',custom:'Review the imported value.',message:'Review the imported value.'},
])('readonly $case remains a successful form value and never blocks native submission',async({value,error,custom,message})=>{
  const {field,form}=await mount({required:true,minLength:3,maxLength:5,readOnly:true,error});field.value=value;field.setCustomValidity(custom);await field.updateComplete;
  const button=document.createElement('button');button.type='submit';form.append(button);const submissions:FormDataEntryValue[][]=[];
  form.addEventListener('submit',event=>{event.preventDefault();submissions.push([...new FormData(form).values()]);});field.addEventListener('invalid',event=>event.preventDefault());
  // A readonly FACE is natively barred from validation even when its stored constraints are unsatisfied.
  expect(field.hasAttribute('readonly')).toBe(true);expect(field.willValidate).toBe(false);expect(field.validity.valid).toBe(false);
  expect(field.validationMessage).toBe(message);expect(field.checkValidity()).toBe(true);expect(field.reportValidity()).toBe(true);expect(form.checkValidity()).toBe(true);expect(form.reportValidity()).toBe(true);
  button.click();expect(submissions).toEqual([[value]]);
  field.readOnly=false;expect(field.willValidate).toBe(true);expect(form.checkValidity()).toBe(false);button.click();expect(submissions).toHaveLength(1);
  field.readOnly=true;button.click();expect(submissions).toEqual([[value],[value]]);expect(entries(form)).toEqual([['task',value]]);
});

test('commits one composition proposal and lets a newer external value win over the composing draft',async()=>{
  const {field}=await mount();const received:FieldValueEvent[]=[];field.addEventListener('ha-value-request',event=>received.push(event));accept(field);
  input(field).dispatchEvent(new CompositionEvent('compositionstart'));edit(field,'に',{isComposing:true});expect(received).toHaveLength(0);expect(input(field).value).toBe('に');
  input(field).value='日本';input(field).dispatchEvent(new CompositionEvent('compositionend'));edit(field,'日本');expect(received).toHaveLength(1);expect(field.value).toBe('日本');await Promise.resolve();
  input(field).dispatchEvent(new CompositionEvent('compositionstart'));edit(field,'草稿',{isComposing:true});field.value='External';input(field).dispatchEvent(new CompositionEvent('compositionend'));expect(field.value).toBe('External');expect(input(field).value).toBe('External');expect(received).toHaveLength(1);
  edit(field,'After');expect(field.value).toBe('After');expect(received).toHaveLength(2);
});
test('does not corrupt a rejected composition or process composing input without a start event',async()=>{
  const {field}=await mount();field.value='Accepted';const received:FieldValueEvent[]=[];field.addEventListener('ha-value-request',event=>received.push(event));
  edit(field,'Draft',{isComposing:true});expect(received).toHaveLength(0);input(field).dispatchEvent(new CompositionEvent('compositionstart'));edit(field,'Candidate',{isComposing:true});input(field).dispatchEvent(new CompositionEvent('compositionend'));edit(field,'Candidate');
  expect(received).toHaveLength(1);expect(input(field).value).toBe('Accepted');await Promise.resolve();edit(field,'Later');expect(received).toHaveLength(2);
});
test('submits on trusted Enter with the native default submitter and never bypasses form validation',async()=>{
  const {field,form}=await mount({required:true});const button=document.createElement('button');button.type='submit';button.name='action';button.value='save';button.textContent='Save';form.append(button);
  const submissions:SubmitEvent[]=[];form.addEventListener('submit',event=>{event.preventDefault();submissions.push(event as SubmitEvent);});field.addEventListener('invalid',event=>event.preventDefault());
  field.focus();await userEvent.keyboard('{Enter}');expect(submissions).toHaveLength(0);accept(field);await userEvent.keyboard('Kitchen{Enter}');expect(submissions).toHaveLength(1);expect(submissions[0].submitter).toBe(button);expect([...new FormData(form,button)]).toEqual([['task','Kitchen'],['action','save']]);
  button.disabled=true;await userEvent.keyboard('{Enter}');expect(submissions).toHaveLength(1);
});
test('handles implicit submission without a button, multiple blockers, canceled keys and external submitters',async()=>{
  const {field,form}=await mount();const submissions:SubmitEvent[]=[];form.id='owner';form.addEventListener('submit',event=>{event.preventDefault();submissions.push(event as SubmitEvent);});
  field.focus();await userEvent.keyboard('{Enter}');expect(submissions).toHaveLength(1);expect(submissions[0].submitter).toBeNull();
  const other=document.createElement('input');form.append(other);await userEvent.keyboard('{Enter}');expect(submissions).toHaveLength(1);other.remove();
  const second=document.createElement('vyp-ha-field');form.append(second);await second.updateComplete;await userEvent.keyboard('{Enter}');expect(submissions).toHaveLength(1);second.remove();
  const button=document.createElement('input');button.type='submit';button.setAttribute('form','owner');document.body.prepend(button);await userEvent.keyboard('{Enter}');expect(submissions.at(-1)!.submitter).toBe(button);
  field.addEventListener('keydown',event=>event.preventDefault(),{once:true});await userEvent.keyboard('{Enter}');expect(submissions).toHaveLength(2);
  for(const options of [{key:'a'},{key:'Enter',isComposing:true},{key:'Enter',ctrlKey:true}]){input(field).dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,...options}));await Promise.resolve();}
  expect(submissions).toHaveLength(2);button.remove();field.remove();document.body.append(field);field.focus();await userEvent.keyboard('{Enter}');expect(submissions).toHaveLength(2);
});
test('retains values across disconnect/reparenting and uses live HA theme tokens and locale',async()=>{
  const {field,form}=await mount();field.value='Saved';field.remove();document.body.append(field);expect(field.value).toBe('Saved');form.append(field);expect(entries(form)).toEqual([['task','Saved']]);
  field.style.setProperty('--primary-text-color','rgb(222, 223, 224)');field.style.setProperty('--card-background-color','rgb(30, 31, 32)');field.style.setProperty('--divider-color','rgb(70, 71, 72)');
  field.state=model({label:'Nombre de la tarea',description:'Elige un nombre.',placeholder:'Cocina'});await field.updateComplete;
  expect(getComputedStyle(input(field)).color).toBe('rgb(222, 223, 224)');expect(getComputedStyle(input(field)).backgroundColor).toBe('rgb(30, 31, 32)');expect(getComputedStyle(input(field)).minHeight).toBe('56px');expect(input(field).labels![0].textContent).toBe('Nombre de la tarea');expect(input(field).value).toBe('Saved');
});

test('delivers pre-render restoration for deferred or synchronous consumer acknowledgment',async()=>{
  registerField();const field=document.createElement('vyp-ha-field');field.focus();field.blur();field.defaultValue='Baseline';field.defaultValue='Baseline';
  const requests:FieldValueEvent[]=[];field.addEventListener('ha-value-request',event=>requests.push(event));
  field.formStateRestoreCallback('Deferred','restore');expect(requests).toHaveLength(1);expect(requests[0].detail).toEqual({value:'Deferred',reason:'restore'});expect(field.value).toBe('Baseline');
  document.body.append(field);await field.updateComplete;expect(input(field).value).toBe('Baseline');
  field.value=requests[0].detail.value;expect(input(field).value).toBe('Deferred');expect(requests).toHaveLength(1);
  const early=document.createElement('vyp-ha-field');accept(early);early.formStateRestoreCallback('Before render','restore');document.body.append(early);await early.updateComplete;expect(input(early).value).toBe('Before render');
});

test('reveals field errors when the native form validates and preserves their accessible association',async()=>{
  const {field,form}=await mount({required:true});field.addEventListener('invalid',event=>event.preventDefault());
  expect(form.checkValidity()).toBe(false);await field.updateComplete;expect(input(field).getAttribute('aria-invalid')).toBe('true');expect(field.shadowRoot!.getElementById('error')!.textContent).toBe('Enter a value.');
});
test('ignores synthetic Enter and composing or modified keyboard input',async()=>{
  const {field,form}=await mount();const submissions:Event[]=[];form.addEventListener('submit',event=>{event.preventDefault();submissions.push(event);});
  input(field).dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await new Promise(resolve=>setTimeout(resolve,0));expect(submissions).toHaveLength(0);
  field.focus();for(const key of ['Control','Meta','Alt','Shift'])await userEvent.keyboard('{'+key+'>}{Enter}{/'+key+'}');
  input(field).dispatchEvent(new CompositionEvent('compositionstart'));await userEvent.keyboard('{Enter}');input(field).dispatchEvent(new CompositionEvent('compositionend'));expect(submissions).toHaveLength(0);
});

test('focuses the native input through an associated external label',async()=>{
  const {field}=await mount();field.id='namedField';const label=document.createElement('label');label.htmlFor=field.id;label.textContent='External field label';document.body.append(label);
  await userEvent.click(label);expect(field.shadowRoot!.activeElement).toBe(input(field));
});
test('does not submit a new owner or a control disabled during a trusted key event',async()=>{
  for(const transition of ['own','fieldset','owner']) {
    const {field,form}=await mount();const fieldset=document.createElement('fieldset');form.append(fieldset);fieldset.append(field);const other=document.createElement('form');document.body.append(other);
    let submissions=0;for(const owner of [form,other])owner.addEventListener('submit',event=>{event.preventDefault();submissions++;});
    field.addEventListener('keydown',()=>{if(transition==='own')field.disabled=true;else if(transition==='fieldset')fieldset.disabled=true;else other.append(field);},{once:true});
    field.focus();await userEvent.keyboard('{Enter}');expect(submissions).toBe(0);
  }
});

test('restores invalid text attributes atomically and continues accepting later valid attributes',async()=>{
  const {field,form}=await mount();const errors:Error[]=[];const capture=(event:ErrorEvent)=>{event.preventDefault();errors.push(event.error as Error);};window.addEventListener('error',capture);
  try{
    field.setAttribute('name','secret\ninvalid');expect(field.name).toBe('task');expect(field.getAttribute('name')).toBe('task');
    field.setAttribute('value','secret\ninvalid');expect(field.defaultValue).toBe('');expect(field.hasAttribute('value')).toBe(false);expect(entries(form)).toEqual([['task','']]);
    field.setAttribute('name','valid');field.setAttribute('value','Valid');expect(field.name).toBe('valid');expect(field.value).toBe('Valid');expect(errors).toHaveLength(2);
    for(const error of errors){expect(error).toBeInstanceOf(FieldInputError);expect(error.message).toBe('invalid_field');}
  }finally{window.removeEventListener('error',capture);}
});

test('restores the accepted DOM value after a malformed synthetic edit without emitting a request',async()=>{
  const {field,form}=await mount();field.value='Accepted';const received:FieldValueEvent[]=[],errors:Error[]=[];
  field.addEventListener('ha-value-request',event=>received.push(event));const capture=(event:ErrorEvent)=>{event.preventDefault();errors.push(event.error as Error);};window.addEventListener('error',capture);
  try{edit(field,'\ud800');expect(input(field).value).toBe('Accepted');expect(field.value).toBe('Accepted');expect(entries(form)).toEqual([['task','Accepted']]);expect(received).toHaveLength(0);expect(errors).toHaveLength(1);expect(errors[0]).toBeInstanceOf(FieldInputError);}
  finally{window.removeEventListener('error',capture);}
});

// WCAG AA for the renderer fallback, without relying on a themed catalog override.
test('uses an AA-contrast error fallback on a white surface',async()=>{
  const {field}=await mount({error:'Review this value'});
  const rgb=getComputedStyle(field.shadowRoot!.getElementById('error')!).color;
  const values=rgb.match(/\d+/gu)!.map(Number).slice(0,3).map(value=>{const channel=value/255;return channel<=0.04045?channel/12.92:((channel+0.055)/1.055)**2.4;});
  const luminance=0.2126*values[0]+0.7152*values[1]+0.0722*values[2];
  expect(1.05/(luminance+0.05)).toBeGreaterThanOrEqual(4.5);
});

test('implicit Enter clicks the native default submitter so application click cancellation can prevent submission',async()=>{
 const {field,form}=await mount();const button=document.createElement('button');button.type='submit';form.append(button);let clicks=0,submissions=0;button.addEventListener('click',event=>{clicks++;event.preventDefault();});form.addEventListener('submit',event=>{event.preventDefault();submissions++;});field.focus();await userEvent.keyboard('{Enter}');expect(clicks).toBe(1);expect(submissions).toBe(0);
});

test.each(['requestSubmit','getRootNode'])('implicit Enter supports a legal field name that shadows %s',async name=>{
 const {field,form}=await mount();field.name=name;let submissions=0;form.addEventListener('submit',event=>{event.preventDefault();submissions++;});field.focus();await userEvent.keyboard('{Enter}');await new Promise<void>(done=>setTimeout(done,0));expect(submissions).toBe(1);
});
