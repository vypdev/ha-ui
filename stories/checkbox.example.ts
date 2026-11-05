import {html} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {catalogExample} from './catalog-example.js';
import {catalogSettings} from './catalog-state.js';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {checkboxState,checkboxChangeDetail} from '@vypdev/ha-ui/checkbox-contracts';
import type {CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
export interface Args {checked:boolean;defaultChecked:boolean;indeterminate:boolean;required:boolean;disabled:boolean;error:boolean;cancel:boolean;longLabel:boolean;value:string;submitted:string|null;}
const localized={en:{label:'Notify household',long:'Notify everyone in the household about this task and its materials before the next scheduled occurrence.',description:'Share this task update.',error:'Review this option.',required:'Select this option.',save:'Save notification',reset:'Reset notification',draft:'Draft',saved:'Saved'},es:{label:'Avisar al hogar',long:'Avisar a todas las personas del hogar sobre esta tarea y sus materiales antes de la siguiente fecha prevista.',description:'Comparte la actualización de esta tarea.',error:'Revisa esta opción.',required:'Selecciona esta opción.',save:'Guardar aviso',reset:'Restablecer aviso',draft:'Borrador',saved:'Guardado'}};
export const renderExample:NonNullable<Meta<Args>['render']>=(controls,context)=>{
 const copy=localized[catalogSettings(context.globals).locale];
 return catalogExample(controls,(args,setArgs)=>html`<form @submit=${(event:SubmitEvent)=>{event.preventDefault();setArgs({...args,submitted:JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)])});}}>
   <vyp-ha-checkbox .state=${checkboxState({label:args.longLabel?copy.long:copy.label,description:copy.description,required:args.required,indeterminate:args.indeterminate,error:args.error?copy.error:'',requiredMessage:copy.required})} .checked=${args.checked} .defaultChecked=${args.defaultChecked} .name=${'notify'} .value=${args.value} .disabled=${args.disabled} @ha-check-request=${(event:CheckboxChangeEvent)=>{const detail=checkboxChangeDetail(event.detail);if(args.cancel)event.preventDefault();else setArgs({...args,checked:detail.checked,indeterminate:false,error:false,submitted:null});}}></vyp-ha-checkbox>
   <div class="example-actions"><vyp-ha-button .type=${'submit'} .disabled=${args.disabled} .state=${buttonState({label:copy.save,variant:'primary'})}></vyp-ha-button><vyp-ha-button .type=${'reset'} .state=${buttonState({label:copy.reset})}></vyp-ha-button></div>
   <div role="status" aria-live="polite">${args.submitted===null?copy.draft+': '+String(args.checked):copy.saved+': '+args.submitted}</div>
  </form>`);
};
