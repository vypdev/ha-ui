import {afterEach,expect,test,vi} from 'vitest';
import {act,createElement,StrictMode,useState} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {TextField} from '../../packages/react/src/index.js';
import {registerField,type FieldValueEvent} from '../../packages/core/src/components/field.js';
import {fieldModel,fieldHost,fieldInput,propose,formEntries,malformedRequest,mutableRequest,nestedFieldRequest} from './field-framework-fixture.js';
import type {TextFieldState} from '../../packages/core/src/field-contracts.js';
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
let root:Root|undefined;let setValue:(value:string)=>void;let current='';
type Options={state?:TextFieldState;observe?:(event:FieldValueEvent)=>void;change?:(value:string)=>void;ack?:boolean;disabled?:boolean;external?:boolean};
function Consumer({state=fieldModel(),observe,change,ack=true,disabled=false,external=false}:Options){
  const [value,set]=useState('Kitchen');setValue=set;current=value;
  return createElement('form',{id:'react-form'},createElement(TextField,{state,value,onValueRequest:observe,onValueChange:ack?(next:string)=>{change?.(next);set(next);}:undefined,name:'task',defaultValue:'Initial',disabled,form:external?'react-form':undefined,id:'react-field',className:'field',lang:'en',dir:'ltr'}));
}
async function render(options:Options={}){if(!root){const target=document.createElement('main');document.body.append(target);root=createRoot(target);}await act(()=>root!.render(createElement(StrictMode,null,createElement(Consumer,options))));return fieldHost();}
afterEach(async()=>{await act(()=>root?.unmount());root=undefined;document.body.replaceChildren();});
test('pre-upgrade field props survive explicit registration without object/current-value attributes',async()=>{
  const field=await render();expect(customElements.get('vyp-ha-field')).toBeUndefined();expect(field.value).toBe('Kitchen');registerField();await field.updateComplete;
  expect(fieldInput(field).value).toBe('Kitchen');expect(field.state.label).toBe('Task name');expect(field.getAttribute('value')).toBe('Initial');expect(field.hasAttribute('state')).toBe(false);expect(field.id).toBe('react-field');expect(field.className).toBe('field');
});
test('controlled React state acknowledges one request and programmatic changes emit none',async()=>{
  registerField();const observe=vi.fn(),change=vi.fn();const field=await render({observe,change});await field.updateComplete;
  await act(()=>propose(field,'Laundry'));await field.updateComplete;expect(current).toBe('Laundry');expect(field.value).toBe('Laundry');expect(formEntries()).toEqual([['task','Laundry']]);expect(observe).toHaveBeenCalledTimes(1);expect(change).toHaveBeenCalledExactlyOnceWith('Laundry');
  await act(()=>setValue('Programmatic'));await field.updateComplete;expect(fieldInput(field).value).toBe('Programmatic');expect(observe).toHaveBeenCalledTimes(1);
  field.focus();expect(field.shadowRoot!.activeElement).toBe(fieldInput(field));
});
test('cancellation, callback replacement/removal and unhandled requests retain the accepted model',async()=>{
  registerField();const old=vi.fn(),currentObserver=vi.fn((event:FieldValueEvent)=>event.preventDefault()),change=vi.fn();const field=await render({observe:old});await field.updateComplete;
  await render({observe:currentObserver,change});await act(()=>propose(field,'Rejected'));expect(current).toBe('Kitchen');expect(fieldInput(field).value).toBe('Kitchen');expect(change).not.toHaveBeenCalled();expect(old).not.toHaveBeenCalled();expect(currentObserver).toHaveBeenCalledTimes(1);
  await render({ack:false});await act(()=>propose(field,'Unhandled'));expect(field.value).toBe('Kitchen');expect(currentObserver).toHaveBeenCalledTimes(1);
});
test('preserves required validation, disabled/external form properties and model reset',async()=>{
  registerField();const field=await render({external:true});await field.updateComplete;expect(field.form?.id).toBe('react-form');
  await act(()=>setValue(''));await field.updateComplete;field.addEventListener('invalid',event=>event.preventDefault());expect(document.querySelector('form')!.checkValidity()).toBe(false);
  await render({disabled:true});await field.updateComplete;expect(fieldInput(field).disabled).toBe(true);expect(formEntries()).toEqual([]);
  await render();await field.updateComplete;expect(field.hasAttribute('form')).toBe(false);expect(fieldInput(field).disabled).toBe(false);
  await act(()=>document.querySelector('form')!.reset());await field.updateComplete;expect(current).toBe('Initial');expect(field.value).toBe('Initial');
});
test('unmount releases both callbacks even if the old host emits later',async()=>{
  registerField();const observe=vi.fn(),change=vi.fn();const field=await render({observe,change});await field.updateComplete;await act(()=>root!.unmount());root=undefined;
  propose(field,'Retained');expect(observe).not.toHaveBeenCalled();expect(change).not.toHaveBeenCalled();
});

test('optional React field props and callbacks need no wrapper model or attributes',async()=>{
  registerField();const target=document.createElement('main');document.body.append(target);root=createRoot(target);
  await act(()=>root!.render(createElement(TextField,{state:fieldModel(),value:'Kitchen'})));const field=fieldHost();await field.updateComplete;
  await act(()=>propose(field,'Unhandled'));expect(field.value).toBe('Kitchen');expect(field.name).toBe('');expect(field.defaultValue).toBe('');expect(field.disabled).toBe(false);
});

test('ignores requests from a nested field without canceling the DOM event',async()=>{
  registerField();const observe=vi.fn(),change=vi.fn(),field=await render({observe,change});await field.updateComplete;
  const bubbled=vi.fn();document.body.addEventListener('ha-value-request',bubbled,{once:true});
  await act(()=>{nestedFieldRequest(field);});
  expect(bubbled).toHaveBeenCalledTimes(1);expect(bubbled.mock.calls[0][0].defaultPrevented).toBe(false);
  expect(observe).not.toHaveBeenCalled();expect(change).not.toHaveBeenCalled();expect(current).toBe('Kitchen');
});
test('rejects malformed native request detail before either application callback',async()=>{registerField();const observe=vi.fn((event:FieldValueEvent)=>event.preventDefault());const field=await render({observe});await field.updateComplete;expect(malformedRequest(field)).toHaveLength(1);expect(observe).not.toHaveBeenCalled();expect(current).toBe('Kitchen');});

test('uses the validated snapshot if an observer mutates a foreign event payload',async()=>{registerField();const field=await render({observe:event=>{Reflect.set(event.detail,'value',42);}});await field.updateComplete;await act(()=>mutableRequest(field));await field.updateComplete;expect(current).toBe('Snapshot');expect(field.value).toBe('Snapshot');});
