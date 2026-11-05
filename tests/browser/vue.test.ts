import {afterEach, expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {createApp, h, nextTick, shallowRef, type App} from 'vue';
import {Tabs} from '../../packages/vue/src/index.js';
import {registerTabs, type NavigationSelectionEvent} from '../../packages/core/src/components/tabs.js';
import {panelState, view, tab, expectNavigationIcons, exerciseNestedTabRequest} from './framework-fixture.js';
let app: App | undefined;
afterEach(()=>{app?.unmount();app=undefined;document.body.replaceChildren();});
function mount(handler?: (event:NavigationSelectionEvent)=>void, content=true) {
  const state=shallowRef(panelState()),listener=shallowRef(handler),children=shallowRef(content);
  const target=document.createElement('main');document.body.append(target);
  app=createApp({render:()=>h(Tabs,{state:state.value,onSelectionRequest:listener.value,id:'vue-tabs',class:'household',dir:'ltr',lang:state.value.label==='Household sections'?'en':'es'},children.value?{default:()=>h('button',{slot:'tasks'},'Add task')}:undefined)});
  app.mount(target);return {state,listener,children};
}
test('preserves pre-upgrade property state with no serialized object attribute',async()=>{
  mount();const element=view();expect(customElements.get('vyp-ha-tabs')).toBeUndefined();
  expect(element.state.kind).toBe('panels');registerTabs();await element.updateComplete;
  expect(element.id).toBe('vue-tabs');expect(element.className).toBe('household');expect(element.hasAttribute('state')).toBe(false);expect(tab(element,'overview').textContent).toBe('Overview');expectNavigationIcons(element);
});
test('prop and callback replacements keep one current event and native cancellation',async()=>{
  registerTabs();const old=vi.fn(),current=vi.fn((event:NavigationSelectionEvent)=>event.preventDefault());
  const input=mount(old);const element=view();await element.updateComplete;
  input.state.value=panelState(true);input.listener.value=current;await nextTick();await element.updateComplete;
  expect(view()).toBe(element);expectNavigationIcons(element,true);await exerciseNestedTabRequest(element);expect(current).not.toHaveBeenCalled();
  await page.getByRole('tab',{name:'Tareas',exact:true}).click();
  expect(old).not.toHaveBeenCalled();expect(current).toHaveBeenCalledTimes(1);expect(current.mock.calls[0][0].defaultPrevented).toBe(true);
  expect(current.mock.calls[0][0].detail).toEqual({kind:'panels',id:'tasks'});expect(element.state.selected).toBe('overview');
  input.state.value={...input.state.value,selected:'tasks'};await nextTick();await element.updateComplete;
  await expect.element(page.getByRole('button',{name:'Add task',exact:true})).toBeVisible();
});
test('optional slots and callback removal stay controlled',async()=>{
  registerTabs();const handler=vi.fn();const input=mount(handler);const element=view();await element.updateComplete;
  input.listener.value=undefined;input.children.value=false;await nextTick();await element.updateComplete;
  await page.getByRole('tab',{name:'Tasks',exact:true}).click();expect(handler).not.toHaveBeenCalled();expect(element.children).toHaveLength(0);
});
test('unmount releases the native listener even if the host is retained',async()=>{
  registerTabs();const handler=vi.fn();mount(handler);const element=view();await element.updateComplete;
  app!.unmount();app=undefined;tab(element,'tasks').click();expect(handler).not.toHaveBeenCalled();
});
