import {expect} from 'vitest';
import {navigationIconPaths} from '../../stories/navigation-icons.js';
import {navigationState} from '../../packages/core/src/contracts.js';
import type {HaTabs} from '../../packages/core/src/components/tabs.js';
export const panelState = (spanish=false) => navigationState({kind:'panels',label:spanish?'Secciones del hogar':'Household sections',selected:'overview',items:[{iconPath:navigationIconPaths.overview,showLabel:false,id:'overview',label:spanish?'Resumen':'Overview'},{id:'locked',label:spanish?'Bloqueado':'Locked',disabled:true},{iconPath:navigationIconPaths.tasks,id:'tasks',label:spanish?'Tareas':'Tasks'}]});
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
