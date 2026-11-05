import {afterEach, expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {act, createElement, StrictMode} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {Tabs} from '../../packages/react/src/index.js';
import {registerTabs, type NavigationSelectionEvent} from '../../packages/core/src/components/tabs.js';
import {panelState, view, tab, expectNavigationIcons, exerciseNestedTabRequest} from './framework-fixture.js';
let root: Root | undefined;
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
afterEach(async()=>{await act(()=>root?.unmount());root=undefined;document.body.replaceChildren();});
function render(state=panelState(), handler?: (event:NavigationSelectionEvent)=>void, content=true) {
  if (!root) { const target=document.createElement('main');document.body.append(target);root=createRoot(target); }
  return act(()=>root!.render(createElement(StrictMode,null,createElement(Tabs,{state,onSelectionRequest:handler,id:'react-tabs',className:'household',lang:state.label==='Household sections'?'en':'es',dir:'ltr',style:{'--primary-color':'rgb(0,110,180)'} as React.CSSProperties},content?createElement('button',{slot:'tasks'},'Add task'):undefined))));
}
test('mounts before explicit registration, preserving complex properties through upgrade',async()=>{
  const state=panelState(); await render(state);const element=view();
  expect(customElements.get('vyp-ha-tabs')).toBeUndefined();expect(element.state).toBe(state);
  registerTabs();await element.updateComplete;expect(tab(element,'overview').textContent).toBe('Overview');expectNavigationIcons(element);
  expect(element.id).toBe('react-tabs');expect(element.className).toBe('household');expect(element.hasAttribute('state')).toBe(false);
});
test('Strict Mode, rerenders and native cancellation yield one current callback',async()=>{
  registerTabs();const old=vi.fn(),current=vi.fn((event:NavigationSelectionEvent)=>event.preventDefault());
  await render(panelState(),old);const element=view();await element.updateComplete;
  await render(panelState(true),current);await element.updateComplete;expect(view()).toBe(element);
  expectNavigationIcons(element,true);await exerciseNestedTabRequest(element);expect(current).not.toHaveBeenCalled();
  await page.getByRole('tab',{name:'Tareas',exact:true}).click();
  expect(old).not.toHaveBeenCalled();expect(current).toHaveBeenCalledTimes(1);
  const event=current.mock.calls[0][0];expect(event.detail).toEqual({kind:'panels',id:'tasks'});expect(event.defaultPrevented).toBe(true);
  expect(element.state.selected).toBe('overview');expect(element.lang).toBe('es');
  await render({...panelState(true),selected:'tasks'},current);await element.updateComplete;await expect.element(page.getByRole('button',{name:'Add task',exact:true})).toBeVisible();
});
test('callback removal and slot removal do not retain old handlers or content',async()=>{
  registerTabs();const handler=vi.fn();await render(panelState(),handler);const element=view();await element.updateComplete;
  await render(panelState(),undefined,false);await element.updateComplete;
  await page.getByRole('tab',{name:'Tasks',exact:true}).click();expect(handler).not.toHaveBeenCalled();expect(element.children).toHaveLength(0);
});
test('unmount removes its native subscription from a retained former host',async()=>{
  registerTabs();const handler=vi.fn();await render(panelState(),handler);const element=view();await element.updateComplete;
  await act(()=>root!.unmount());root=undefined;
  tab(element,'tasks').click();expect(handler).not.toHaveBeenCalled();
});
