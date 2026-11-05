import {afterEach,expect,test,vi} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {selectState,type SelectState,type SelectSelection} from '../../packages/core/src/select-contracts.js';
import {registerSelect,type HaSelect,type SelectValueEvent} from '../../packages/core/src/components/select.js';
export interface SelectOptions {state:SelectState;value:SelectSelection;defaultValue?:SelectSelection;name?:string;disabled?:boolean;form?:string;onValueRequest?:(event:SelectValueEvent)=>void;onValueChange?:(value:SelectSelection)=>void;}
export interface SelectMount {host:HaSelect;update(patch:Partial<SelectOptions>):Promise<void>;unmount():Promise<void>;}
export const selectModel=(patch:Record<string,unknown>={})=>selectState({label:'Category',options:[{value:1,label:'One'},{value:'1',label:'String one'},{value:false,label:'Other'}],...patch});
export const selectControl=(host:HaSelect)=>host.shadowRoot!.querySelector<HTMLSelectElement|HTMLButtonElement>('#control')!;
export async function selectPropose(host:HaSelect,indexes:string[]){const control=selectControl(host);if(control instanceof HTMLSelectElement){for(const option of control.options)option.selected=indexes.includes(option.value);control.dispatchEvent(new Event('change'));}else{control.click();await host.updateComplete;host.shadowRoot!.getElementById('option-'+indexes[0])?.click();}await host.updateComplete;}
export function selectAdapterCases(mount:(target:HTMLElement,options:SelectOptions)=>Promise<SelectMount>){
 let view:SelectMount|undefined;
 async function attach(patch:Partial<SelectOptions>={}){const form=document.createElement('form');form.id='owner';const target=document.createElement('div');form.append(target);document.body.append(form);view=await mount(target,{state:selectModel(),value:null,...patch});return view;}
 const settle=async()=>view!.host.updateComplete;
 afterEach(async()=>{await view?.unmount();view=undefined;document.body.replaceChildren();});
 test('typed properties assigned before upgrade retain their values and no serialized configuration',async()=>{
  const {host}=await attach({value:false,defaultValue:1,name:'category'});expect(customElements.get('vyp-ha-select')).toBeUndefined();registerSelect();await settle();expect(host.value).toBe(false);expect(host.defaultValue).toBe(1);expect(selectControl(host).value).toBe('2');expect(host.id).toBe('bound-select');expect(host.className).toBe('choice');expect(host.lang).toBe('en');expect(host.dir).toBe('ltr');expect(host.hasAttribute('state')).toBe(false);expect(host.hasAttribute('value')).toBe(false);
 });
 test('safe defaults with no observers remain controlled',async()=>{registerSelect();const {host}=await attach();await settle();expect(host.name).toBe('');expect(host.defaultValue).toBe(null);expect(host.disabled).toBe(false);await selectPropose(host,['0']);expect(host.value).toBe(null);expect(selectControl(host).value).toBe('');});
 test('one original request precedes a typed callback and asynchronous application acknowledgement',async()=>{
  registerSelect();const order:string[]=[],observer=vi.fn((event:SelectValueEvent)=>{expect(event.target).toBe(view!.host);expect(event.cancelable).toBe(true);expect(Object.isFrozen(event.detail)).toBe(true);order.push('request');}),change=vi.fn((_value:SelectSelection)=>order.push('model'));
  const {host,update}=await attach({value:1,name:'category',onValueRequest:observer,onValueChange:change});await settle();await selectPropose(host,['2']);expect(host.value).toBe(1);expect(change).toHaveBeenCalledExactlyOnceWith(false);expect(observer).toHaveBeenCalledTimes(1);expect(order).toEqual(['request','model']);await update({value:false});await settle();expect(selectControl(host).value).toBe('2');expect([...new FormData(host.form!)]).toEqual([['category','false']]);expect(change).toHaveBeenCalledTimes(1);
 });
 test('a nested control request bubbles without updating the adapter model',async()=>{
  registerSelect();const observe=vi.fn(),change=vi.fn(),{host}=await attach({onValueRequest:observe,onValueChange:change});await settle();
  const child=document.createElement(host.localName);host.append(child);
  const request=new CustomEvent('ha-select-request',{detail:{value:1,reason:'change'},bubbles:true,composed:true,cancelable:true});
  const bubbled=vi.fn();document.body.addEventListener(request.type,bubbled,{once:true});
  expect(child.dispatchEvent(request)).toBe(true);
  expect(bubbled).toHaveBeenCalledExactlyOnceWith(request);
  expect(observe).not.toHaveBeenCalled();expect(change).not.toHaveBeenCalled();expect(host.value).toBe(null);
 });
 test('callback replacement/removal and synchronous cancellation preserve the model',async()=>{
  registerSelect();const old=vi.fn(),cancel=vi.fn((event:SelectValueEvent)=>event.preventDefault()),change=vi.fn();const {host,update}=await attach({value:1,onValueRequest:old,onValueChange:change});await settle();await update({onValueRequest:cancel});await selectPropose(host,['2']);expect(old).not.toHaveBeenCalled();expect(cancel).toHaveBeenCalledTimes(1);expect(change).not.toHaveBeenCalled();expect(host.value).toBe(1);await update({onValueRequest:undefined,onValueChange:undefined});await selectPropose(host,['2']);expect(host.value).toBe(1);expect(cancel).toHaveBeenCalledTimes(1);
 });
 test('multiple values keep types, immutable requests and repeated native form entries',async()=>{
  registerSelect();const change=vi.fn(),{host,update}=await attach({state:selectModel({multiple:true}),value:['1',1],name:'category',onValueChange:change});await settle();expect([...new FormData(host.form!)]).toEqual([['category','1'],['category','1']]);await selectPropose(host,['0','2']);expect(change).toHaveBeenCalledExactlyOnceWith([1,false]);expect(Object.isFrozen(change.mock.calls[0][0])).toBe(true);await update({value:[1,false]});await settle();expect([...new FormData(host.form!)]).toEqual([['category','1'],['category','false']]);host.focus();expect(host.shadowRoot!.activeElement).toBe(selectControl(host));host.blur();
 });
 test('updated state, disabled and external owner props keep the typed model',async()=>{
  registerSelect();const change=vi.fn(),{host,update}=await attach({value:1,onValueChange:change});await settle();const external=document.createElement('form');external.id='external';document.body.append(external);await update({disabled:true,form:'external',state:selectModel({label:'Categoría',size:6})});await settle();expect(host.form).toBe(external);expect(selectControl(host).disabled).toBe(true);expect((selectControl(host) as HTMLSelectElement).size).toBe(6);await selectPropose(host,['2']);expect(change).not.toHaveBeenCalled();await update({disabled:false,form:undefined,value:'missing'});await settle();expect(host.form?.id).toBe('owner');expect(host.value).toBe('missing');expect(host.validity.customError).toBe(true);await update({state:selectModel({options:[{value:'missing',label:'Loaded category'}]})});await settle();expect(host.value).toBe('missing');expect(host.validity.valid).toBe(true);expect(change).not.toHaveBeenCalled();
 });
 test('required validation and controlled reset wait for the application acknowledgement',async()=>{
  registerSelect();const change=vi.fn(),{host,update}=await attach({state:selectModel({required:true}),value:null,defaultValue:false,onValueChange:change});await settle();host.addEventListener('invalid',event=>event.preventDefault());expect(host.form!.checkValidity()).toBe(false);await update({value:1});await settle();expect(host.form!.checkValidity()).toBe(true);host.form!.reset();expect(change).toHaveBeenCalledExactlyOnceWith(false);expect(host.value).toBe(1);await update({value:false});await settle();expect(selectControl(host).value).toBe('2');
 });
 test('malformed event payloads are rejected before observers and accepted callbacks use a stable snapshot',async()=>{
  registerSelect();const observer=vi.fn((event:SelectValueEvent)=>Reflect.set(event.detail,'value','mutated')),change=vi.fn(),{host}=await attach({onValueRequest:observer,onValueChange:change});await settle();const errors:unknown[]=[],capture=(event:ErrorEvent)=>{event.preventDefault();errors.push(event.error);};window.addEventListener('error',capture);try{host.dispatchEvent(new CustomEvent('ha-select-request',{detail:{value:{},reason:'change'},cancelable:true}));}finally{window.removeEventListener('error',capture);}expect(errors).toHaveLength(1);expect(observer).not.toHaveBeenCalled();expect(change).not.toHaveBeenCalled();host.dispatchEvent(new CustomEvent('ha-select-request',{detail:{value:[1,'1'],reason:'change'},cancelable:true}));expect(change).toHaveBeenCalledExactlyOnceWith([1,'1']);expect(Object.isFrozen(change.mock.calls[0][0])).toBe(true);
 });
 test('unmount removes subscriptions from retained hosts and remount has one active listener',async()=>{
  registerSelect();const observer=vi.fn(),change=vi.fn();const first=await attach({onValueRequest:observer,onValueChange:change});await settle();await first.unmount();view=undefined;first.host.dispatchEvent(new CustomEvent('ha-select-request',{detail:{value:1,reason:'change'},cancelable:true}));expect(observer).not.toHaveBeenCalled();expect(change).not.toHaveBeenCalled();const second=await attach({onValueRequest:observer,onValueChange:change});await settle();await selectPropose(second.host,['0']);expect(observer).toHaveBeenCalledTimes(1);expect(change).toHaveBeenCalledExactlyOnceWith(1);
 });
 test('multiple dropdown binds chip/search requests, asynchronous acknowledgement and repeated entries',async()=>{
  registerSelect();const change=vi.fn(),observer=vi.fn(),{host,update}=await attach({state:selectModel({multiple:true,mode:'dropdown'}),value:[1,false],defaultValue:[1],name:'category',onValueRequest:observer,onValueChange:change});await settle();
  const owner=page.elementLocator(host);await owner.getByRole('button',{name:'Category',exact:true}).click();await owner.getByRole('combobox',{name:'Search options',exact:true}).fill('String');await userEvent.keyboard('{ArrowDown}{Enter}');
  expect(observer).toHaveBeenCalledTimes(1);expect(change).toHaveBeenCalledExactlyOnceWith([1,false,'1']);expect(Object.isFrozen(change.mock.calls[0][0])).toBe(true);expect(host.value).toEqual([1,false]);await update({value:[1,false,'1']});await settle();expect([...new FormData(host.form!)]).toEqual([['category','1'],['category','1'],['category','false']]);
  await owner.getByRole('button',{name:'Remove One',exact:true}).click();expect(change).toHaveBeenLastCalledWith([false,'1']);await update({value:[false,'1']});await settle();expect([...new FormData(host.form!)]).toEqual([['category','1'],['category','false']]);
  await update({disabled:true});await settle();expect((owner.getByRole('button',{name:'Category',exact:true}).element() as HTMLButtonElement).disabled).toBe(true);expect([...new FormData(host.form!)]).toEqual([]);await update({disabled:false});await settle();host.form!.reset();expect(change).toHaveBeenLastCalledWith([1]);expect(observer).toHaveBeenCalledTimes(3);
 });
 test('a canceled chip dropdown request never updates its framework model',async()=>{
  registerSelect();const change=vi.fn(),cancel=vi.fn((event:SelectValueEvent)=>event.preventDefault()),{host}=await attach({state:selectModel({multiple:true,mode:'dropdown'}),value:[1],onValueRequest:cancel,onValueChange:change});await settle();const owner=page.elementLocator(host);await owner.getByRole('button',{name:'Category',exact:true}).click();await owner.getByRole('option',{name:'Other',exact:true}).click();expect(cancel).toHaveBeenCalledTimes(1);expect(change).not.toHaveBeenCalled();expect(host.value).toEqual([1]);await expect.element(owner.getByRole('button',{name:'Remove One',exact:true})).toBeVisible();
 });
}
