import {afterEach,expect,test,vi} from 'vitest';
import {buttonState,type ButtonState,type ButtonType,type ButtonPressDetail} from '../../packages/core/src/button-contracts.js';
import {registerButton,type HaButton,type ButtonPressEvent} from '../../packages/core/src/components/button.js';
export interface ButtonOptions {
  state:ButtonState;type?:ButtonType;name?:string;value?:string;disabled?:boolean;formNoValidate?:boolean;form?:string;icons?:boolean;
  onPressRequest?:((event:ButtonPressEvent)=>void);onPress?:((detail:ButtonPressDetail)=>void);
}
export interface ButtonMount {host:HaButton;update(patch:Partial<ButtonOptions>):Promise<void>;unmount():Promise<void>;}
export const buttonModel=(patch:Record<string,unknown>={})=>buttonState({label:'Save task',...patch});
export function buttonAdapterCases(mount:(target:HTMLElement,options:ButtonOptions)=>Promise<ButtonMount>){
  let view:ButtonMount|undefined;
  async function attach(options:Partial<ButtonOptions>={}){
    const form=document.createElement('form');form.id='owner';form.innerHTML='<input name="task" required value="Kitchen">';
    const target=document.createElement('div');form.append(target);document.body.append(form);
    view=await mount(target,{state:buttonModel(),...options});return view;
  }
  const settle=async()=>{await view!.host.updateComplete;};
  afterEach(async()=>{await view?.unmount();view=undefined;document.body.replaceChildren();});
  test('pre-upgrade properties survive explicit registration without state attributes',async()=>{
    const item=await attach({type:'submit',name:'action',value:'save',icons:true});expect(customElements.get('vyp-ha-button')).toBeUndefined();
    registerButton();await settle();expect(item.host.state.label).toBe('Save task');expect(item.host.type).toBe('submit');expect(item.host.name).toBe('action');expect(item.host.value).toBe('save');
    expect(item.host.hasAttribute('state')).toBe(false);expect(item.host.id).toBe('bound-button');expect(item.host.className).toBe('action');expect(item.host.lang).toBe('en');expect(item.host.dir).toBe('ltr');
    expect(item.host.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="leading"]')!.assignedElements()).toHaveLength(1);
    expect(item.host.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="trailing"]')!.assignedElements()).toHaveLength(1);
  });
  test('defaults and absent callbacks use the one shared button and safe action type',async()=>{
    registerButton();const {host}=await attach();await settle();expect(host.type).toBe('button');expect(host.name).toBe('');expect(host.value).toBe('');expect(host.disabled).toBe(false);expect(host.formNoValidate).toBe(false);
    expect(host.shadowRoot!.querySelectorAll('button')).toHaveLength(1);expect(host.submitter?.parentElement).toBe(host);host.click();await settle();expect(host.state.pressed).toBe(null);
  });
  test('one original cancelable request reaches the observer before the accepted snapshot',async()=>{
    registerButton();const order:string[]=[],accepted=vi.fn((_detail:ButtonPressDetail)=>order.push('accepted'));
    const observer=vi.fn((event:ButtonPressEvent)=>{expect(event.target).toBe(view!.host);expect(event.cancelable).toBe(true);expect(Object.isFrozen(event.detail)).toBe(true);order.push('observed');});
    const {host}=await attach({onPressRequest:observer,onPress:accepted});await settle();host.focus();expect(host.shadowRoot!.activeElement).toBe(host.shadowRoot!.querySelector('button'));host.click();
    expect(observer).toHaveBeenCalledTimes(1);expect(accepted).toHaveBeenCalledExactlyOnceWith({type:'button'});expect(order).toEqual(['observed','accepted']);expect(host.state.pressed).toBe(null);
  });
  test('a nested request bubbles for delegation without invoking this instance’s binding',async()=>{
    registerButton();const request=vi.fn(),accepted=vi.fn(),{host}=await attach({onPressRequest:request,onPress:accepted});await settle();
    const nested=document.createElement('vyp-ha-button');nested.state=buttonModel({label:'Nested command'});
    const bubbled=vi.fn((event:Event)=>expect(event.composedPath()[0]).toBe(nested));
    host.append(nested);await nested.updateComplete;
    host.addEventListener('ha-press-request',bubbled,{once:true});
    nested.click();
    expect(bubbled).toHaveBeenCalledTimes(1);
    expect(request).not.toHaveBeenCalled();expect(accepted).not.toHaveBeenCalled();
    host.click();
    expect(request).toHaveBeenCalledTimes(1);expect(accepted).toHaveBeenCalledExactlyOnceWith({type:'button'});
  });
  test('replaced and removed listeners cancel native submission synchronously without duplicates',async()=>{
    registerButton();const old=vi.fn(),accepted=vi.fn(),rejected=vi.fn((event:ButtonPressEvent)=>event.preventDefault());const {host,update}=await attach({type:'submit',onPressRequest:old,onPress:accepted});await settle();
    const submit=vi.fn((event:Event)=>event.preventDefault());host.form!.addEventListener('submit',submit);
    await update({onPressRequest:rejected});host.click();await new Promise(resolve=>setTimeout(resolve,20));expect(rejected).toHaveBeenCalledTimes(1);expect(old).not.toHaveBeenCalled();expect(accepted).not.toHaveBeenCalled();expect(submit).not.toHaveBeenCalled();
    await update({onPressRequest:undefined,onPress:undefined});host.click();await vi.waitFor(()=>expect(submit).toHaveBeenCalledTimes(1));expect(rejected).toHaveBeenCalledTimes(1);
  });
  test('native validation, submitter metadata and reset stay owned by the shared renderer',async()=>{
    registerButton();const accepted=vi.fn(),{host,update}=await attach({type:'submit',name:'action',value:'save',onPress:accepted});await settle();
    const form=host.form!,input=form.querySelector('input')!,entries:FormDataEntryValue[][]=[];form.addEventListener('submit',event=>{event.preventDefault();expect(event.submitter).toBe(host.submitter);entries.push([...new FormData(form,event.submitter).entries()].flat());});
    input.value='';host.click();await new Promise(resolve=>setTimeout(resolve,20));expect(entries).toEqual([]);
    await update({formNoValidate:true});host.click();await vi.waitFor(()=>expect(entries).toEqual([['task','','action','save']]));
    await update({type:'reset',formNoValidate:false});input.value='Edited';host.click();await vi.waitFor(()=>expect(input.value).toBe('Kitchen'));expect(accepted).toHaveBeenCalledTimes(3);
  });
  test('updates props, slots, external owner and controlled busy/pressed state without emitting intent',async()=>{
    registerButton();const accepted=vi.fn(),{host,update}=await attach({icons:true,onPress:accepted});await settle();const proxy=host.submitter;
    const external=document.createElement('form');external.id='external';document.body.append(external);
    await update({state:buttonModel({label:'Guardar',loading:true,pressed:true}),disabled:true,form:'external',icons:false,name:'next',value:'literal\nvalue'});await settle();expect(host.form).toBe(external);expect(host.state.pressed).toBe(true);expect(host.state.loading).toBe(true);expect(host.disabled).toBe(true);expect(host.submitter).toBe(proxy);expect(proxy!.parentElement).toBe(host);expect(host.value).toBe('literal\nvalue');host.click();expect(accepted).not.toHaveBeenCalled();
    await update({disabled:false});await settle();host.click();expect(accepted).not.toHaveBeenCalled();
    await update({state:buttonModel({pressed:false}),form:undefined,icons:true});await settle();expect(host.form?.id).toBe('owner');expect(host.hasAttribute('form')).toBe(false);expect(host.submitter).toBe(proxy);expect(host.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="leading"]')!.assignedElements()).toHaveLength(1);host.click();expect(accepted).toHaveBeenCalledTimes(1);expect(host.state.pressed).toBe(false);
  });
  test('rejects malformed requests before callbacks and uses the validated snapshot after mutation',async()=>{
    registerButton();const observer=vi.fn((event:ButtonPressEvent)=>Reflect.set(event.detail,'type','reset')),accepted=vi.fn(),{host}=await attach({onPressRequest:observer,onPress:accepted});await settle();
    const errors:unknown[]=[],capture=(event:ErrorEvent)=>{event.preventDefault();errors.push(event.error);};window.addEventListener('error',capture);
    try{host.dispatchEvent(new CustomEvent('ha-press-request',{detail:{type:'invalid'},cancelable:true}));}finally{window.removeEventListener('error',capture);}
    expect(errors).toHaveLength(1);expect(observer).not.toHaveBeenCalled();expect(accepted).not.toHaveBeenCalled();
    host.dispatchEvent(new CustomEvent('ha-press-request',{detail:{type:'submit'},cancelable:true}));expect(observer).toHaveBeenCalledTimes(1);expect(accepted).toHaveBeenCalledExactlyOnceWith({type:'submit'});
  });
  test('unmount releases both subscriptions from retained hosts and remount has one listener',async()=>{
    registerButton();const observer=vi.fn(),accepted=vi.fn();const first=await attach({onPressRequest:observer,onPress:accepted});await settle();await first.unmount();view=undefined;
    first.host.dispatchEvent(new CustomEvent('ha-press-request',{detail:{type:'button'},cancelable:true}));expect(observer).not.toHaveBeenCalled();expect(accepted).not.toHaveBeenCalled();
    const second=await attach({onPressRequest:observer,onPress:accepted});await settle();second.host.click();expect(observer).toHaveBeenCalledTimes(1);expect(accepted).toHaveBeenCalledTimes(1);
  });
}
