import {navigationState} from '../../packages/core/src/contracts.js';
import type {HaTabs} from '../../packages/core/src/components/tabs.js';
export const panelState = (spanish=false) => navigationState({kind:'panels',label:spanish?'Secciones del hogar':'Household sections',selected:'overview',items:[{id:'overview',label:spanish?'Resumen':'Overview'},{id:'locked',label:spanish?'Bloqueado':'Locked',disabled:true},{id:'tasks',label:spanish?'Tareas':'Tasks'}]});
export const view = () => document.querySelector('vyp-ha-tabs')!;
export const tab = (element: HaTabs, id: string) => element.shadowRoot!.querySelector<HTMLButtonElement>('#tab-'+id)!;
