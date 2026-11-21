import {afterEach,expect,test,vi} from 'vitest';
import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteTextArea.svelte';
import TextArea from '../../packages/svelte/src/TextArea.svelte';
import {registerTextArea} from '../../packages/core/src/components/textarea.js';
import {textAreaModel,textAreaHost,textAreaInput,propose,formEntries,malformedRequest,mutableRequest,nestedTextAreaRequest} from './textarea-framework-fixture.js';
let instance;
function attach(component=Consumer,props={}){const target=document.createElement('main');document.body.append(target);instance=mount(component,{target,props});flushSync();return instance;}
afterEach(async()=>{if(instance)await unmount(instance);instance=undefined;document.body.replaceChildren();});
test('compiled Svelte preserves pre-upgrade field props',async()=>{
  attach();const field=textAreaHost();expect(customElements.get('vyp-ha-textarea')).toBeUndefined();registerTextArea();await field.updateComplete;
  expect(textAreaInput(field).value).toBe('Kitchen');expect(field.state.label).toBe('Task name');expect(field.getAttribute('value')).toBe('Initial');expect(field.hasAttribute('state')).toBe(false);expect(field.id).toBe('svelte-field');expect(field.className).toBe('field');
});
test('typed callback props acknowledge one request through application runes',async()=>{
  registerTextArea();const observe=vi.fn(),consumer=attach(Consumer,{observe}),field=textAreaHost();await field.updateComplete;
  flushSync(()=>propose(field,'Laundry\n😀'));await field.updateComplete;expect(consumer.current()).toBe('Laundry\n😀');expect(formEntries()).toEqual([['task','Laundry\n😀']]);expect(observe).toHaveBeenCalledTimes(1);
  flushSync(()=>consumer.update('Programmatic'));await field.updateComplete;expect(textAreaInput(field).value).toBe('Programmatic');expect(observe).toHaveBeenCalledTimes(1);
});
test('replacement, cancellation and callback removal preserve the controlled model',async()=>{
  registerTextArea();const old=vi.fn(),current=vi.fn(event=>event.preventDefault()),consumer=attach(Consumer,{observe:old}),field=textAreaHost();await field.updateComplete;
  flushSync(()=>consumer.setHandler(current));flushSync(()=>propose(field,'Rejected'));expect(consumer.current()).toBe('Kitchen');expect(textAreaInput(field).value).toBe('Kitchen');expect(old).not.toHaveBeenCalled();expect(current).toHaveBeenCalledTimes(1);
  flushSync(()=>{consumer.setHandler(undefined);consumer.stopAcknowledging();});flushSync(()=>propose(field,'Unhandled'));expect(field.value).toBe('Kitchen');expect(current).toHaveBeenCalledTimes(1);
});
test('updates constraints, disabled/external owner and reset through the application model',async()=>{
  registerTextArea();const consumer=attach(),field=textAreaHost();await field.updateComplete;flushSync(()=>{consumer.setExternal(true);consumer.setDisabled(true);});await field.updateComplete;
  expect(field.form?.id).toBe('svelte-form');expect(textAreaInput(field).disabled).toBe(true);expect(formEntries()).toEqual([]);
  flushSync(()=>{consumer.setExternal(false);consumer.setDisabled(false);consumer.configure(textAreaModel({label:'Nombre',maxLength:3}));});await field.updateComplete;expect(field.hasAttribute('form')).toBe(false);expect(field.validity.tooLong).toBe(true);expect(textAreaInput(field).labels[0].textContent).toBe('Nombre*');expect(textAreaInput(field).getAttribute('aria-label')).toBe('Nombre');
  flushSync(()=>document.querySelector('form').reset());await field.updateComplete;expect(consumer.current()).toBe('Initial');expect(field.value).toBe('Initial');
});
test('standalone defaults and absent callbacks stay controlled and unmount releases subscriptions',async()=>{
  registerTextArea();attach(TextArea,{state:textAreaModel(),value:'Kitchen'});const field=textAreaHost();await field.updateComplete;propose(field,'Unhandled');expect(textAreaInput(field).value).toBe('Kitchen');expect(field.name).toBe('');expect(field.defaultValue).toBe('');
  await unmount(instance);instance=undefined;const observe=vi.fn();attach(Consumer,{observe});const retained=textAreaHost();await retained.updateComplete;await unmount(instance);instance=undefined;propose(retained,'Retained');expect(observe).not.toHaveBeenCalled();
});

test('ignores requests from a nested field without canceling the DOM event',async()=>{
  registerTextArea();const observe=vi.fn(),consumer=attach(Consumer,{observe}),field=textAreaHost();await field.updateComplete;
  const bubbled=vi.fn();document.body.addEventListener('ha-value-request',bubbled,{once:true});
  flushSync(()=>{nestedTextAreaRequest(field);});
  expect(bubbled).toHaveBeenCalledTimes(1);expect(bubbled.mock.calls[0][0].defaultPrevented).toBe(false);
  expect(observe).not.toHaveBeenCalled();expect(consumer.current()).toBe('Kitchen');
});
test('rejects malformed native request detail before Svelte callbacks',async()=>{registerTextArea();const observe=vi.fn(event=>event.preventDefault()),consumer=attach(Consumer,{observe}),field=textAreaHost();await field.updateComplete;expect(malformedRequest(field)).toHaveLength(1);expect(observe).not.toHaveBeenCalled();expect(consumer.current()).toBe('Kitchen');});

test('application rune updates use the validated snapshot after a foreign payload is mutated',async()=>{registerTextArea();const consumer=attach(Consumer,{observe:event=>{Reflect.set(event.detail,'value',42);}}),field=textAreaHost();await field.updateComplete;flushSync(()=>mutableRequest(field));await field.updateComplete;expect(consumer.current()).toBe('Snapshot\n😀');expect(field.value).toBe('Snapshot\n😀');});
