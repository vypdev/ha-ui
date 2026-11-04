import {afterEach,expect,test,vi} from 'vitest';
import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteField.svelte';
import TextField from '../../packages/svelte/src/Field.svelte';
import {registerField} from '../../packages/core/src/components/field.js';
import {fieldModel,fieldHost,fieldInput,propose,formEntries,malformedRequest,mutableRequest} from './field-framework-fixture.js';
let instance;
function attach(component=Consumer,props={}){const target=document.createElement('main');document.body.append(target);instance=mount(component,{target,props});flushSync();return instance;}
afterEach(async()=>{if(instance)await unmount(instance);instance=undefined;document.body.replaceChildren();});
test('compiled Svelte preserves pre-upgrade field props',async()=>{
  attach();const field=fieldHost();expect(customElements.get('vyp-ha-field')).toBeUndefined();registerField();await field.updateComplete;
  expect(fieldInput(field).value).toBe('Kitchen');expect(field.state.label).toBe('Task name');expect(field.getAttribute('value')).toBe('Initial');expect(field.hasAttribute('state')).toBe(false);expect(field.id).toBe('svelte-field');expect(field.className).toBe('field');
});
test('typed callback props acknowledge one request through application runes',async()=>{
  registerField();const observe=vi.fn(),consumer=attach(Consumer,{observe}),field=fieldHost();await field.updateComplete;
  flushSync(()=>propose(field,'Laundry'));await field.updateComplete;expect(consumer.current()).toBe('Laundry');expect(formEntries()).toEqual([['task','Laundry']]);expect(observe).toHaveBeenCalledTimes(1);
  flushSync(()=>consumer.update('Programmatic'));await field.updateComplete;expect(fieldInput(field).value).toBe('Programmatic');expect(observe).toHaveBeenCalledTimes(1);
});
test('replacement, cancellation and callback removal preserve the controlled model',async()=>{
  registerField();const old=vi.fn(),current=vi.fn(event=>event.preventDefault()),consumer=attach(Consumer,{observe:old}),field=fieldHost();await field.updateComplete;
  flushSync(()=>consumer.setHandler(current));flushSync(()=>propose(field,'Rejected'));expect(consumer.current()).toBe('Kitchen');expect(fieldInput(field).value).toBe('Kitchen');expect(old).not.toHaveBeenCalled();expect(current).toHaveBeenCalledTimes(1);
  flushSync(()=>{consumer.setHandler(undefined);consumer.stopAcknowledging();});flushSync(()=>propose(field,'Unhandled'));expect(field.value).toBe('Kitchen');expect(current).toHaveBeenCalledTimes(1);
});
test('updates constraints, disabled/external owner and reset through the application model',async()=>{
  registerField();const consumer=attach(),field=fieldHost();await field.updateComplete;flushSync(()=>{consumer.setExternal(true);consumer.setDisabled(true);});await field.updateComplete;
  expect(field.form?.id).toBe('svelte-form');expect(fieldInput(field).disabled).toBe(true);expect(formEntries()).toEqual([]);
  flushSync(()=>{consumer.setExternal(false);consumer.setDisabled(false);consumer.configure(fieldModel({label:'Nombre',maxLength:3}));});await field.updateComplete;expect(field.hasAttribute('form')).toBe(false);expect(field.validity.tooLong).toBe(true);expect(fieldInput(field).labels[0].textContent).toBe('Nombre*');expect(fieldInput(field).getAttribute('aria-label')).toBe('Nombre');
  flushSync(()=>document.querySelector('form').reset());await field.updateComplete;expect(consumer.current()).toBe('Initial');expect(field.value).toBe('Initial');
});
test('standalone defaults and absent callbacks stay controlled and unmount releases subscriptions',async()=>{
  registerField();attach(TextField,{state:fieldModel(),value:'Kitchen'});const field=fieldHost();await field.updateComplete;propose(field,'Unhandled');expect(fieldInput(field).value).toBe('Kitchen');expect(field.name).toBe('');expect(field.defaultValue).toBe('');
  await unmount(instance);instance=undefined;const observe=vi.fn();attach(Consumer,{observe});const retained=fieldHost();await retained.updateComplete;await unmount(instance);instance=undefined;propose(retained,'Retained');expect(observe).not.toHaveBeenCalled();
});

test('rejects malformed native request detail before Svelte callbacks',async()=>{registerField();const observe=vi.fn(event=>event.preventDefault()),consumer=attach(Consumer,{observe}),field=fieldHost();await field.updateComplete;expect(malformedRequest(field)).toHaveLength(1);expect(observe).not.toHaveBeenCalled();expect(consumer.current()).toBe('Kitchen');});

test('application rune updates use the validated snapshot after a foreign payload is mutated',async()=>{registerField();const consumer=attach(Consumer,{observe:event=>{Reflect.set(event.detail,'value',42);}}),field=fieldHost();await field.updateComplete;flushSync(()=>mutableRequest(field));await field.updateComplete;expect(consumer.current()).toBe('Snapshot');expect(field.value).toBe('Snapshot');});
