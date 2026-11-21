import {html} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {catalogExample} from './catalog-example.js';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {textAreaState,textAreaValue,textAreaValueDetail} from '@vypdev/ha-ui/textarea-contracts';
import type {TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
import {catalogSettings} from './catalog-state.js';
export interface Args {
  value:string;defaultValue:string;disabled:boolean;readOnly:boolean;required:boolean;error:boolean;
  rows:number;minLength:number;maxLength:number;submitted:string|null;
}
const copies={
  en:{label:'Notes',description:'Keep helpful details on separate lines.',placeholder:'Add a note.',required:'Enter a note.',short:'Add more characters.',long:'Use fewer characters.',error:'Review this note and try again.',submit:'Save note',reset:'Reset note',draft:'Unsaved note',saved:'Saved note'},
  es:{label:'Notas',description:'Escribe los detalles útiles en líneas separadas.',placeholder:'Añade una nota.',required:'Introduce una nota.',short:'Añade más caracteres.',long:'Usa menos caracteres.',error:'Revisa esta nota e inténtalo de nuevo.',submit:'Guardar nota',reset:'Restablecer nota',draft:'Nota sin guardar',saved:'Nota guardada'},
};
export const renderExample:NonNullable<Meta<Args>['render']>=(controls,context)=>{
  const copy=copies[catalogSettings(context.globals).locale];
  return catalogExample(controls,(args,setArgs)=>html`<form class="example-form" style="--ha-color-fill-neutral-normal-resting:var(--secondary-background-color,#e6e6e6)" @submit=${(event:SubmitEvent)=>{
    event.preventDefault();const value=textAreaValue(new FormData(event.currentTarget as HTMLFormElement).get('note'));setArgs({...args,submitted:value});
  }}>
    <vyp-ha-textarea .state=${textAreaState({label:copy.label,description:copy.description,placeholder:copy.placeholder,required:args.required,readOnly:args.readOnly,rows:args.rows,minLength:args.minLength,maxLength:args.maxLength,error:args.error?copy.error:'',requiredMessage:copy.required,tooShortMessage:copy.short,tooLongMessage:copy.long})}
      .value=${args.value} .defaultValue=${args.defaultValue} .name=${'note'} .disabled=${args.disabled}
      @ha-value-request=${(event:TextAreaValueEvent)=>{const detail=textAreaValueDetail(event.detail);setArgs({...args,value:detail.value,error:false,submitted:null});}}></vyp-ha-textarea>
    <div class="example-actions"><vyp-ha-button .type=${'submit'} .disabled=${args.disabled} .state=${buttonState({label:copy.submit,variant:'primary'})}></vyp-ha-button><vyp-ha-button .type=${'reset'} .state=${buttonState({label:copy.reset})}></vyp-ha-button></div>
    <div role="status" aria-live="polite" style="white-space:pre-wrap;overflow-wrap:anywhere">${args.submitted===null?copy.draft:copy.saved+': '+args.submitted}</div>
  </form>`);
};
