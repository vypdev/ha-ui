import {html} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {catalogExample} from './catalog-example.js';
import {catalogSettings} from './catalog-state.js';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {selectState,selectValueDetail,type SelectSelection} from '@vypdev/ha-ui/select-contracts';
import type {SelectValueEvent} from '@vypdev/ha-ui/select';
export interface Args {value:SelectSelection;defaultValue:SelectSelection;multiple:boolean;required:boolean;disabled:boolean;error:boolean;empty:boolean;cancel:boolean;submitted:string|null;}
const localized={en:{label:'Category',description:'Choose a category for the household task.',placeholder:'Select a category',empty:'No categories available.',error:'Review this category.',required:'Select a category.',unavailable:'Select an available category.',labels:['Maintenance','Shopping','Other','No category','Archived'],save:'Save category',reset:'Reset category',draft:'Draft',saved:'Saved'},es:{label:'Categoría',description:'Elige una categoría para la tarea del hogar.',placeholder:'Selecciona una categoría',empty:'No hay categorías disponibles.',error:'Revisa esta categoría.',required:'Selecciona una categoría.',unavailable:'Selecciona una categoría disponible.',labels:['Mantenimiento','Compra','Otra','Sin categoría','Archivada'],save:'Guardar categoría',reset:'Restablecer categoría',draft:'Borrador',saved:'Guardado'}};
export const renderExample:NonNullable<Meta<Args>['render']>=(controls,context)=>{
 const copy=localized[catalogSettings(context.globals).locale];
 return catalogExample(controls,(args,setArgs)=>{
  const state=selectState({label:copy.label,description:copy.description,placeholder:copy.placeholder,emptyMessage:copy.empty,required:args.required,multiple:args.multiple,error:args.error?copy.error:'',requiredMessage:copy.required,unavailableMessage:copy.unavailable,options:args.empty?[]:[{value:1,label:copy.labels[0]},{value:'1',label:copy.labels[1]},{value:false,label:copy.labels[2]},{value:'',label:copy.labels[3]},{value:'archived',label:copy.labels[4],disabled:true}]});
  return html`<form @submit=${(event:SubmitEvent)=>{event.preventDefault();setArgs({...args,submitted:JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)])});}}>
   <vyp-ha-select .state=${state} .value=${args.value} .defaultValue=${args.defaultValue} .name=${'category'} .disabled=${args.disabled} @ha-select-request=${(event:SelectValueEvent)=>{const detail=selectValueDetail(event.detail);if(args.cancel)event.preventDefault();else setArgs({...args,value:detail.value,error:false,submitted:null});}}></vyp-ha-select>
   <div class="example-actions"><vyp-ha-button .type=${'submit'} .disabled=${args.disabled} .state=${buttonState({label:copy.save,variant:'primary'})}></vyp-ha-button><vyp-ha-button .type=${'reset'} .state=${buttonState({label:copy.reset})}></vyp-ha-button></div>
   <output aria-live="polite">${args.submitted===null?copy.draft+': '+JSON.stringify(args.value):copy.saved+': '+args.submitted}</output>
  </form>`;
 });
};
