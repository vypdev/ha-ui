import {afterEach,expect,test,vi} from 'vitest';
import {createApp,h,nextTick,shallowRef,type App} from 'vue';
import {TextField} from '../../packages/vue/src/index.js';
import {registerField,type FieldValueEvent} from '../../packages/core/src/components/field.js';
import {fieldModel,fieldHost,fieldInput,propose,formEntries,malformedRequest,mutableRequest} from './field-framework-fixture.js';
let app:App|undefined;
function mount(observer?:(event:FieldValueEvent)=>void){
  const value=shallowRef('Kitchen'),state=shallowRef(fieldModel()),disabled=shallowRef(false),external=shallowRef(false),listener=shallowRef(observer),ack=shallowRef(true);
  const target=document.createElement('main');document.body.append(target);app=createApp({render:()=>h('form',{id:'vue-form'},[h(TextField,{state:state.value,modelValue:value.value,'onUpdate:modelValue':ack.value?(next:string)=>{value.value=next;}:undefined,onValueRequest:listener.value,name:'task',defaultValue:'Initial',disabled:disabled.value,form:external.value?'vue-form':undefined,id:'vue-field',class:'field',lang:'en',dir:'ltr'})])});app.mount(target);return {value,state,disabled,external,listener,ack};
}
afterEach(()=>{app?.unmount();app=undefined;document.body.replaceChildren();});
test('Vue preserves field properties before explicit upgrade',async()=>{
  mount();const field=fieldHost();expect(customElements.get('vyp-ha-field')).toBeUndefined();registerField();await field.updateComplete;
  expect(fieldInput(field).value).toBe('Kitchen');expect(field.state.label).toBe('Task name');expect(field.getAttribute('value')).toBe('Initial');expect(field.hasAttribute('state')).toBe(false);expect(field.id).toBe('vue-field');expect(field.className).toBe('field');
});
test('v-model acknowledges one original request and prop updates do not emit changes',async()=>{
  registerField();const observe=vi.fn();const model=mount(observe),field=fieldHost();await field.updateComplete;
  propose(field,'Laundry');await nextTick();await field.updateComplete;expect(model.value.value).toBe('Laundry');expect(formEntries()).toEqual([['task','Laundry']]);expect(observe).toHaveBeenCalledTimes(1);expect(observe.mock.calls[0][0].detail).toEqual({value:'Laundry',reason:'input'});
  model.value.value='Programmatic';await nextTick();await field.updateComplete;expect(fieldInput(field).value).toBe('Programmatic');expect(observe).toHaveBeenCalledTimes(1);
});
test('synchronous cancellation and listener/model-handler removal retain the accepted value',async()=>{
  registerField();const old=vi.fn(),current=vi.fn((event:FieldValueEvent)=>event.preventDefault());const model=mount(old),field=fieldHost();await field.updateComplete;
  model.listener.value=current;await nextTick();propose(field,'Rejected');await nextTick();expect(model.value.value).toBe('Kitchen');expect(field.value).toBe('Kitchen');expect(old).not.toHaveBeenCalled();expect(current).toHaveBeenCalledTimes(1);
  model.listener.value=undefined;model.ack.value=false;await nextTick();propose(field,'Unhandled');await nextTick();expect(fieldInput(field).value).toBe('Kitchen');expect(current).toHaveBeenCalledTimes(1);
});
test('updates shared constraints, disabled and external owner properties and acknowledges reset',async()=>{
  registerField();const model=mount(),field=fieldHost();await field.updateComplete;model.external.value=true;model.disabled.value=true;await nextTick();await field.updateComplete;
  expect(field.form?.id).toBe('vue-form');expect(fieldInput(field).disabled).toBe(true);expect(formEntries()).toEqual([]);model.disabled.value=false;model.external.value=false;model.state.value=fieldModel({label:'Nombre',maxLength:3});await nextTick();await field.updateComplete;
  expect(field.hasAttribute('form')).toBe(false);expect(field.validity.tooLong).toBe(true);expect(fieldInput(field).labels![0].textContent).toBe('Nombre');model.state.value=fieldModel();await nextTick();document.querySelector('form')!.reset();await nextTick();await field.updateComplete;expect(model.value.value).toBe('Initial');expect(field.value).toBe('Initial');
});
test('Vue unmount removes native field subscriptions',async()=>{
  registerField();const observe=vi.fn();mount(observe);const field=fieldHost();await field.updateComplete;app!.unmount();app=undefined;propose(field,'Retained');expect(observe).not.toHaveBeenCalled();
});

test('optional Vue field props and model subscribers need no extra attributes',async()=>{
  registerField();const target=document.createElement('main');document.body.append(target);app=createApp(TextField,{state:fieldModel(),modelValue:'Kitchen'});app.mount(target);const field=fieldHost();await field.updateComplete;
  propose(field,'Unhandled');await nextTick();expect(field.value).toBe('Kitchen');expect(field.name).toBe('');expect(field.defaultValue).toBe('');expect(field.disabled).toBe(false);
});

test('rejects malformed native request detail before the app or model subscriber',async()=>{registerField();const observe=vi.fn((event:FieldValueEvent)=>event.preventDefault()),model=mount(observe),field=fieldHost();await field.updateComplete;expect(malformedRequest(field)).toHaveLength(1);expect(observe).not.toHaveBeenCalled();expect(model.value.value).toBe('Kitchen');});

test('model updates use the validated snapshot after a foreign payload is mutated',async()=>{registerField();const model=mount(event=>{Reflect.set(event.detail,'value',42);}),field=fieldHost();await field.updateComplete;mutableRequest(field);await nextTick();await field.updateComplete;expect(model.value.value).toBe('Snapshot');expect(field.value).toBe('Snapshot');});
