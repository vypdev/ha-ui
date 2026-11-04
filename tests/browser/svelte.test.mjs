import {afterEach,expect,test,vi} from 'vitest';
import {page} from 'vitest/browser';
import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteTabs.svelte';
import Tabs from '../../packages/svelte/src/Tabs.svelte';
import {registerTabs} from '../../packages/core/src/components/tabs.js';
import {panelState,view,tab,expectNavigationIcons} from './framework-fixture.js';
let instance;
afterEach(async()=>{if(instance)await unmount(instance);instance=undefined;document.body.replaceChildren();});
function attach(component,props){const target=document.createElement('main');document.body.append(target);instance=mount(component,{target,props});flushSync();return instance;}
test('compiled Svelte preserves pre-upgrade properties without serialized objects',async()=>{
  attach(Consumer,{initial:panelState()});const element=view();expect(customElements.get('vyp-ha-tabs')).toBeUndefined();expect(element.state.kind).toBe('panels');
  registerTabs();await element.updateComplete;expect(tab(element,'overview').textContent).toBe('Overview');expectNavigationIcons(element);expect(element.id).toBe('svelte-tabs');expect(element.className).toBe('household');expect(element.hasAttribute('state')).toBe(false);
});
test('rune props, callbacks and snippet content remain controlled in the real component',async()=>{
  registerTabs();const observe=vi.fn(event=>event.preventDefault());const consumer=attach(Consumer,{initial:panelState(),observe});const element=view();await element.updateComplete;
  flushSync(()=>consumer.update(panelState(true)));await element.updateComplete;expect(view()).toBe(element);
  expectNavigationIcons(element,true);await page.getByRole('tab',{name:'Tareas',exact:true}).click();expect(observe).toHaveBeenCalledTimes(1);expect(observe.mock.calls[0][0].defaultPrevented).toBe(true);expect(observe.mock.calls[0][0].detail).toEqual({kind:'panels',id:'tasks'});expect(element.state.selected).toBe('overview');
  flushSync(()=>consumer.update({...element.state,selected:'tasks'}));await element.updateComplete;await expect.element(page.getByRole('button',{name:'Add task',exact:true})).toBeVisible();
  flushSync(()=>consumer.clearPanels());expect(element.children).toHaveLength(0);
  flushSync(()=>consumer.clearHandler());await page.getByRole('tab',{name:'Resumen',exact:true}).click();expect(observe).toHaveBeenCalledTimes(1);
});
test('no callback or content is required and no alternate visuals are rendered',async()=>{
  registerTabs();attach(Tabs,{state:panelState()});const element=view();await element.updateComplete;
  await page.getByRole('tab',{name:'Tasks',exact:true}).click();expect(element.children).toHaveLength(0);expect(element.state.selected).toBe('overview');
});
test('unmount removes the native callback on a retained old host',async()=>{
  registerTabs();const observe=vi.fn();attach(Consumer,{initial:panelState(),observe});const element=view();await element.updateComplete;
  await unmount(instance);instance=undefined;tab(element,'tasks').click();expect(observe).not.toHaveBeenCalled();
});
