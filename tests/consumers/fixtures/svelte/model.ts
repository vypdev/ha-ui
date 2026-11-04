import {navigationState} from '@vypdev/ha-ui/contracts';
import type {NavigationState} from '@vypdev/ha-ui/contracts';
export function model(spanish=false,selected='overview',disabled=false):NavigationState {
  return navigationState({kind:'panels',label:spanish?'Secciones del hogar':'Household sections',selected,items:[{id:'overview',label:spanish?'Resumen':'Overview'},{id:'tasks',label:spanish?'Tareas':'Tasks',disabled}]});
}
