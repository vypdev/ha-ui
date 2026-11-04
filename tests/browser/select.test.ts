import {afterEach,expect,test,vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {selectState,SelectInputError} from '../../packages/core/src/select-contracts.js';
import {HaSelect,registerSelect,type SelectValueEvent} from '../../packages/core/src/components/select.js';
const options=[{value:1,label:'One'},{value:'1',label:'String one',disabled:true},{value:false,label:'False'},{value:'',label:'Empty literal'}];
const model=(patch:Record<string,unknown>={})=>selectState({label:'Category',options,...patch});
const control=(host:HaSelect)=>host.shadowRoot!.querySelector('select')!;
async function mount(patch:Record<string,unknown>={}){registerSelect();const form=document.createElement('form'),host=document.createElement('vyp-ha-select');host.state=model(patch);host.name='category';form.append(host);document.body.append(form);await host.updateComplete;return {host,form};}
function propose(host:HaSelect,indices:string[]){for(const option of control(host).options)option.selected=indices.includes(option.value);control(host).dispatchEvent(new Event('change',{bubbles:true}));}
function accept(host:HaSelect){host.addEventListener('ha-select-request',event=>{if(!event.defaultPrevented)host.value=event.detail.value;});}
const entries=(form:HTMLFormElement)=>[...new FormData(form)];
function errors(action:()=>void){const seen:Error[]=[],capture=(event:ErrorEvent)=>{event.preventDefault();seen.push(event.error);};window.addEventListener('error',capture);try{action();}finally{window.removeEventListener('error',capture);}return seen;}
afterEach(()=>document.body.replaceChildren());
test('pre-upgrade complex properties retain typed values without state/value attributes',async()=>{
 const host=document.createElement('vyp-ha-select');host.state=model();host.defaultValue=false;host.name='category';document.body.append(host);registerSelect();await host.updateComplete;
 expect(host).toBeInstanceOf(HaSelect);expect(host.value).toBe(false);expect(control(host).value).toBe('2');expect(host.hasAttribute('state')).toBe(false);expect(host.hasAttribute('value')).toBe(false);expect(host.hasAttribute('defaultvalue')).toBe(false);
});
test('explicit registration is idempotent and rejects another cohort',()=>{registerSelect();registerSelect(customElements);expect(()=>registerSelect({get:()=>HTMLElement} as unknown as CustomElementRegistry)).toThrow(/conflict/u);});
test('default host is usable, focus without connection is harmless and external owners/labels are native',async()=>{
 const host=new HaSelect();host.focus();host.blur();expect(host.value).toBe(null);expect(host.defaultValue).toBe(null);expect(host.name).toBe('');expect(host.disabled).toBe(false);expect(host.form).toBe(null);document.body.append(host);await host.updateComplete;expect(host.state.label).toBe('Value');expect(host.state.options).toEqual([]);
 const form=document.createElement('form');form.id='external';document.body.append(form);host.setAttribute('form','external');host.name='category';expect(host.form).toBe(form);expect(entries(form)).toEqual([]);
 const label=document.createElement('label');host.id='external-field';label.htmlFor=host.id;label.textContent='External';document.body.append(label);expect([...host.labels]).toEqual([label]);host.focus();expect(host.shadowRoot!.activeElement).toBe(control(host));host.blur();expect(host.shadowRoot!.activeElement).toBe(null);host.removeAttribute('form');expect(host.form).toBe(null);
});
test('labels, descriptions, errors and option labels stay inert and accessible',async()=>{
 const {host}=await mount({label:'<b>Category</b>',description:'Help <script>literal</script>',error:'Review <b>value</b>',options:[{value:'<img>',label:'<i>Literal option</i>'}]});
 expect(host.shadowRoot!.querySelector('script,b,i,img')).toBe(null);expect(control(host).labels![0].textContent).toBe('<b>Category</b>');expect(control(host).options[1].textContent).toBe('<i>Literal option</i>');expect(control(host).getAttribute('aria-describedby')).toBe('help error');expect(control(host).getAttribute('aria-invalid')).toBe('true');expect(host.shadowRoot!.getElementById('error')!.textContent).toBe('Review <b>value</b>');
});
test('native dropdown typeahead emits one typed composed cancelable request',async()=>{
 const {host}=await mount();host.value=1;await host.updateComplete;accept(host);const seen:SelectValueEvent[]=[];document.body.addEventListener('ha-select-request',event=>seen.push(event),{once:true});host.focus();await userEvent.keyboard('f{Tab}');await host.updateComplete;
 expect(host.value).toBe(false);expect(seen).toHaveLength(1);expect(seen[0].detail).toEqual({value:false,reason:'change'});expect(seen[0].cancelable).toBe(true);expect(seen[0].composed).toBe(true);expect(seen[0].bubbles).toBe(true);expect(Object.isFrozen(seen[0].detail)).toBe(true);
});
test('native visible-list arrows skip disabled options and retain visible keyboard focus',async()=>{
 const {host}=await mount({size:4});host.value=1;await host.updateComplete;accept(host);const observer=vi.fn();host.addEventListener('ha-select-request',observer);host.focus();await userEvent.keyboard('{ArrowDown}');await host.updateComplete;expect(host.value).toBe(false);expect(observer).toHaveBeenCalledTimes(1);expect(getComputedStyle(control(host)).outlineWidth).toBe('2px');
});
test('unhandled/canceled native changes restore the model and programmatic values emit no intent',async()=>{
 const {host,form}=await mount();host.value=1;await host.updateComplete;const observer=vi.fn((event:SelectValueEvent)=>event.preventDefault());host.addEventListener('ha-select-request',observer);
 propose(host,['2']);expect(host.value).toBe(1);expect(control(host).value).toBe('0');expect(entries(form)).toEqual([['category','1']]);expect(observer).toHaveBeenCalledTimes(1);host.removeEventListener('ha-select-request',observer);propose(host,['3']);expect(host.value).toBe(1);host.value=false;await host.updateComplete;expect(observer).toHaveBeenCalledTimes(1);expect(entries(form)).toEqual([['category','false']]);
});
test('single placeholder maps to null while a real empty-string option stays selected',async()=>{
 const {host,form}=await mount();accept(host);propose(host,['3']);expect(host.value).toBe('');expect(entries(form)).toEqual([['category','']]);propose(host,['']);expect(host.value).toBe(null);expect(entries(form)).toEqual([]);
});
test('multiple selection keeps typed snapshots and emits repeated successful entries in option order',async()=>{
 const {host,form}=await mount({multiple:true});host.value=[false,1];await host.updateComplete;expect(control(host).multiple).toBe(true);expect(control(host).size).toBe(4);expect(entries(form)).toEqual([['category','1'],['category','false']]);accept(host);const seen:SelectValueEvent[]=[];host.addEventListener('ha-select-request',event=>seen.push(event));propose(host,['0','3']);expect(host.value).toEqual([1,'']);expect(Object.isFrozen(host.value)).toBe(true);expect(Object.isFrozen(seen[0].detail.value)).toBe(true);expect(entries(form)).toEqual([['category','1'],['category','']]);propose(host,[]);expect(host.value).toEqual([]);expect(entries(form)).toEqual([]);
});
test('unknown/disabled/mode-mismatched model values stay explicit, invalid and never substitute another option',async()=>{
 const {host,form}=await mount();host.value='missing';await host.updateComplete;expect(host.value).toBe('missing');expect(control(host).value).toBe('');expect(host.validity.customError).toBe(true);expect(entries(form)).toEqual([]);
 host.value='1';await host.updateComplete;expect(control(host).value).toBe('1');expect(host.validity.customError).toBe(true);expect(entries(form)).toEqual([]);
 host.value=[1];await host.updateComplete;expect(control(host).value).toBe('');expect(entries(form)).toEqual([]);host.state=model({multiple:true});host.value=1;await host.updateComplete;expect(control(host).selectedOptions).toHaveLength(0);expect(entries(form)).toEqual([]);
 host.value=[1];host.state=model({multiple:true,options:[{value:1,label:'Updated one'}]});await host.updateComplete;expect(host.validity.valid).toBe(true);expect(host.value).toEqual([1]);expect(control(host).selectedOptions[0].textContent).toBe('Updated one');
});
test('required/custom validation and form submission use localized messages and the native owner',async()=>{
 const {host,form}=await mount({required:true,requiredMessage:'Elige una opción.',unavailableMessage:'Elige una opción disponible.'});host.addEventListener('invalid',event=>event.preventDefault());expect(host.validity.valueMissing).toBe(true);expect(host.willValidate).toBe(true);expect(host.shadowRoot!.getElementById('error')).toBe(null);expect(host.checkValidity()).toBe(false);await host.updateComplete;expect(host.validationMessage).toBe('Elige una opción.');expect(control(host).getAttribute('aria-describedby')).toBe('error');expect(form.checkValidity()).toBe(false);
 host.value=1;expect(host.validity.valid).toBe(true);host.setCustomValidity('Review the category.');expect(host.reportValidity()).toBe(false);await host.updateComplete;expect(host.shadowRoot!.getElementById('error')!.textContent).toBe('Review the category.');host.setCustomValidity('');await host.updateComplete;expect(host.validity.valid).toBe(true);expect(host.shadowRoot!.getElementById('error')).toBe(null);
 const saved:unknown[]=[];form.addEventListener('submit',event=>{event.preventDefault();saved.push(entries(form));});const button=document.createElement('button');button.type='submit';form.append(button);button.click();expect(saved).toEqual([[['category','1']]]);
});
test('disabled attributes and fieldsets preserve native legend exceptions and block forged edits',async()=>{
 const {host,form}=await mount({required:true});host.value=1;await host.updateComplete;const observer=vi.fn();host.addEventListener('ha-select-request',observer);host.disabled=true;host.disabled=true;await host.updateComplete;expect(host.hasAttribute('disabled')).toBe(true);expect(control(host).disabled).toBe(true);expect(host.willValidate).toBe(false);expect(entries(form)).toEqual([]);propose(host,['2']);expect(observer).not.toHaveBeenCalled();expect(control(host).value).toBe('0');host.disabled=false;host.setAttribute('disabled','false');expect(host.disabled).toBe(true);host.removeAttribute('disabled');
 const fieldset=document.createElement('fieldset'),legend=document.createElement('legend');form.append(fieldset);fieldset.append(legend,host);fieldset.disabled=true;await host.updateComplete;expect(control(host).disabled).toBe(true);expect(entries(form)).toEqual([]);legend.append(host);await host.updateComplete;expect(control(host).disabled).toBe(false);expect(entries(form)).toEqual([['category','1']]);
});
test('default changes, dirty writes and controlled reset keep the application model authoritative',async()=>{
 const {host,form}=await mount();host.defaultValue=1;host.defaultValue=1;await host.updateComplete;expect(host.value).toBe(1);host.defaultValue=false;expect(host.value).toBe(false);host.value=1;host.defaultValue='';expect(host.value).toBe(1);await host.updateComplete;const seen:SelectValueEvent[]=[];host.addEventListener('ha-select-request',event=>seen.push(event));form.reset();expect(host.value).toBe(1);expect(seen[0].detail).toEqual({value:'',reason:'reset'});accept(host);form.reset();await host.updateComplete;expect(host.value).toBe('');host.defaultValue=false;expect(host.value).toBe(false);
});
test('typed restoration and autocomplete go through the same controlled request',async()=>{
 const {host}=await mount();const seen:SelectValueEvent[]=[];host.addEventListener('ha-select-request',event=>seen.push(event));host.formStateRestoreCallback('false','restore');expect(host.value).toBe(null);expect(seen[0].detail).toEqual({value:false,reason:'restore'});accept(host);host.formStateRestoreCallback('1','autocomplete');expect(host.value).toBe(1);host.state=model({multiple:true});await host.updateComplete;host.formStateRestoreCallback('[1,false]','restore');expect(host.value).toEqual([1,false]);
 for(const raw of [new FormData(),new File(['secret'],'secret.txt'),'secret'])expect(()=>host.formStateRestoreCallback(raw,'restore')).toThrow(SelectInputError);expect(()=>host.formStateRestoreCallback('1','invalid' as 'restore')).toThrow(SelectInputError);
});
test('invalid public writes and name attributes retain the last accepted state without echo',async()=>{
 const {host}=await mount();const previous=host.state;for(const [key,value] of [['state',{}],['value',{}],['defaultValue',[1,1]],['name','secret\nname'],['disabled','false']] as const)expect(()=>Reflect.set(host,key,value)).toThrow(SelectInputError);expect(host.state).toBe(previous);expect(host.value).toBe(null);expect(host.defaultValue).toBe(null);expect(host.name).toBe('category');expect(errors(()=>host.setAttribute('name','secret\nname'))).toHaveLength(1);expect(host.getAttribute('name')).toBe('category');host.name='';host.name='';host.removeAttribute('name');expect(host.name).toBe('');
});
test('empty multi options show inert empty feedback and changing state cannot remap a stale DOM event',async()=>{
 const {host}=await mount({multiple:true,options:[],emptyMessage:'No hay opciones.'});expect(control(host).options[0].disabled).toBe(true);expect(control(host).options[0].textContent).toBe('No hay opciones.');
 host.state=model();await host.updateComplete;host.value=1;await host.updateComplete;const observer=vi.fn();host.addEventListener('ha-select-request',observer);host.state=model({options:[{value:'new',label:'New'}]});propose(host,['0']);expect(observer).not.toHaveBeenCalled();await host.updateComplete;accept(host);propose(host,['0']);expect(host.value).toBe('new');expect(observer).toHaveBeenCalledTimes(1);
});
test('invalid or disabled native option indexes throw a bounded diagnostic and restore accepted selection',async()=>{
 const {host}=await mount();host.value=1;await host.updateComplete;const observer=vi.fn();host.addEventListener('ha-select-request',observer);expect(errors(()=>propose(host,['1']))).toHaveLength(1);expect(control(host).value).toBe('0');const option=document.createElement('option');option.value='secret-index';control(host).append(option);expect(errors(()=>propose(host,['secret-index']))).toHaveLength(1);expect(control(host).value).toBe('0');option.value='999';expect(errors(()=>propose(host,['999']))).toHaveLength(1);expect(control(host).value).toBe('0');expect(host.value).toBe(1);expect(observer).not.toHaveBeenCalled();
});

test('invalid name on a fresh host rolls back to no attribute and explicit disabled callbacks retain state',async()=>{
 const host=new HaSelect();expect(errors(()=>host.setAttribute('name','secret\nname'))).toHaveLength(1);expect(host.hasAttribute('name')).toBe(false);document.body.append(host);await host.updateComplete;host.formDisabledCallback(true);await host.updateComplete;control(host).dispatchEvent(new Event('change'));expect(control(host).disabled).toBe(true);host.formDisabledCallback(false);await host.updateComplete;expect(control(host).disabled).toBe(false);
});

test('an application override during reset remains dirty and is not overwritten by a later default',async()=>{
 const {host,form}=await mount();host.defaultValue=1;host.value=false;await host.updateComplete;host.addEventListener('ha-select-request',event=>{if(event.detail.reason==='reset')host.value='';});form.reset();expect(host.value).toBe('');host.defaultValue=false;expect(host.value).toBe('');
});

test('valid native name attribute changes update successful entries without a request',async()=>{
 const {host,form}=await mount();host.value=1;const observer=vi.fn();host.addEventListener('ha-select-request',observer);host.setAttribute('name','renamed');expect(host.name).toBe('renamed');expect(entries(form)).toEqual([['renamed','1']]);host.removeAttribute('name');expect(host.name).toBe('');expect(entries(form)).toEqual([]);expect(observer).not.toHaveBeenCalled();
});
