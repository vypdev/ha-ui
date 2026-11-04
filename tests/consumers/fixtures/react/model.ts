import {navigationState} from '@vypdev/ha-ui/contracts';
import type {NavigationState} from '@vypdev/ha-ui/contracts';
export function model(spanish=false,selected='overview',disabled=false):NavigationState {
  return navigationState({kind:'panels',label:spanish?'Secciones del hogar':'Household sections',selected,items:[{iconPath:'M3 11L12 3L21 11V21H15V14H9V21H3Z',showLabel:false,id:'overview',label:spanish?'Resumen':'Overview'},{iconPath:'M4 3H20V21H4ZM7 6V9H10V6ZM12 6V8H17V6ZM7 12V15H10V12ZM12 12V14H17V12Z',id:'tasks',label:spanish?'Tareas':'Tasks',disabled}]});
}

import {textFieldState} from '@vypdev/ha-ui/field-contracts';
export function fieldModel(spanish=false){return textFieldState({label:spanish?'Nombre de la tarea':'Task name',description:spanish?'Una tarea del hogar.':'A household task.',required:true,minLength:3,maxLength:24,requiredMessage:spanish?'Introduce un valor.':'Enter a value.'});}

import {buttonState} from '@vypdev/ha-ui/button-contracts';
export const actionModel=(spanish:boolean,loading=false)=>buttonState({label:spanish?'Guardar tarea':'Save task',loading,loadingLabel:spanish?'Guardando…':'Saving…'});
export const resetModel=()=>buttonState({label:'Reset task'});

import {selectState} from '@vypdev/ha-ui/select-contracts';
export const categoryModel=(spanish:boolean,multiple=false,available=true)=>selectState({label:spanish?'Categoría':'Category',description:spanish?'Una categoría para esta tarea.':'A category for this task.',required:true,multiple,requiredMessage:spanish?'Elige una categoría.':'Choose a category.',unavailableMessage:spanish?'Elige una categoría disponible.':'Choose an available category.',options:[{value:1,label:spanish?'Mantenimiento':'Maintenance'},{value:'1',label:spanish?'Compra':'Shopping'},{value:false,label:spanish?'Otra':'Other'},{value:'',label:spanish?'Sin categoría':'No category'},{value:'archived',label:spanish?'Archivada':'Archived',disabled:true}].filter(option=>available||option.value!==false)});
export const categoryAction=(spanish:boolean,reset=false)=>buttonState({label:reset?(spanish?'Restablecer categoría':'Reset category'):(spanish?'Guardar categoría':'Save category')});

import {checkboxState} from '@vypdev/ha-ui/checkbox-contracts';
export const checkModel=(spanish:boolean,indeterminate:boolean)=>checkboxState({label:spanish?'Avisar al hogar':'Notify household',description:spanish?'Comparte la actualización de esta tarea.':'Share this task update.',required:true,indeterminate,requiredMessage:spanish?'Selecciona esta opción.':'Select this option.'});
export const checkAction=(spanish:boolean,reset=false)=>buttonState({label:reset?(spanish?'Restablecer aviso':'Reset notification'):(spanish?'Guardar aviso':'Save notification')});
