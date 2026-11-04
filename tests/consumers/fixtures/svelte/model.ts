import {navigationState} from '@vypdev/ha-ui/contracts';
import type {NavigationState} from '@vypdev/ha-ui/contracts';
export function model(spanish=false,selected='overview',disabled=false):NavigationState {
  return navigationState({kind:'panels',label:spanish?'Secciones del hogar':'Household sections',selected,items:[{id:'overview',label:spanish?'Resumen':'Overview'},{id:'tasks',label:spanish?'Tareas':'Tasks',disabled}]});
}

import {textFieldState} from '@vypdev/ha-ui/field-contracts';
export function fieldModel(spanish=false){return textFieldState({label:spanish?'Nombre de la tarea':'Task name',description:spanish?'Una tarea del hogar.':'A household task.',required:true,minLength:3,maxLength:24,requiredMessage:spanish?'Introduce un valor.':'Enter a value.'});}

import {buttonState} from '@vypdev/ha-ui/button-contracts';
export const actionModel=(spanish:boolean,loading=false)=>buttonState({label:spanish?'Guardar tarea':'Save task',loading,loadingLabel:spanish?'Guardando…':'Saving…'});
export const resetModel=()=>buttonState({label:'Reset task'});
