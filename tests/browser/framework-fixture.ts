import {expect,vi} from 'vitest';
import {navigationIconPaths} from '../../stories/navigation-icons.js';
import {navigationState} from '../../packages/core/src/contracts.js';
import type {HaTabs} from '../../packages/core/src/components/tabs.js';
export const panelState = (spanish=false) => navigationState({kind:'panels',scrollStartLabel:spanish?'Desplazar al inicio':'Scroll to start',scrollEndLabel:spanish?'Desplazar al final':'Scroll to end',label:spanish?'Secciones del hogar':'Household sections',selected:'overview',items:[{iconPath:navigationIconPaths.overview,showLabel:false,id:'overview',label:spanish?'Resumen':'Overview'},{id:'locked',label:spanish?'Bloqueado':'Locked',disabled:true},{iconPath:navigationIconPaths.tasks,id:'tasks',label:spanish?'Tareas':'Tasks'}]});
export const view = () => document.querySelector('vyp-ha-tabs')!;
export const tab = (element: HaTabs, id: string) => element.shadowRoot!.querySelector<HTMLButtonElement>('#tab-'+id)!;

export function expectNavigationIcons(element:HaTabs,spanish=false) {
 const overview=tab(element,'overview'),tasks=tab(element,'tasks');
 expect(overview.getAttribute('aria-label')).toBe(spanish?'Resumen':'Overview');
 expect(overview.querySelector('path')!.getAttribute('d')).toBe(navigationIconPaths.overview);
 expect(overview.querySelector<HTMLElement>('[part=label]')!.hidden).toBe(true);
 expect(overview.getBoundingClientRect().width).toBe(56);
 expect(tasks.querySelector('path')!.getAttribute('d')).toBe(navigationIconPaths.tasks);
 expect(tasks.querySelector<HTMLElement>('[part=label]')!.hidden).toBe(false);
}

/** A nested panel control can bubble to app delegation without invoking the parent's binding. */
export async function exerciseNestedTabRequest(parent:HaTabs) {
 const nested=document.createElement('vyp-ha-tabs');
 nested.slot='overview';
 nested.state=navigationState({kind:'panels',label:'Nested sections',selected:'summary',
  items:[{id:'summary',label:'Nested summary'},{id:'details',label:'Nested details'}]});
 const observed=vi.fn((event:Event)=>expect(event.composedPath()[0]).toBe(nested));
 parent.addEventListener('ha-selection-request',observed);
 try{
  parent.append(nested);await nested.updateComplete;
  tab(nested,'details').click();
  expect(observed).toHaveBeenCalledTimes(1);
  expect(observed.mock.calls[0][0].defaultPrevented).toBe(false);
 }finally{parent.removeEventListener('ha-selection-request',observed);nested.remove();}
}
