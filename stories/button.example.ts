import {html,nothing} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {buttonState,type ButtonVariant,type ButtonSize,type ButtonType} from '@vypdev/ha-ui/button-contracts';
import {textFieldState,fieldValueDetail,textFieldValue} from '@vypdev/ha-ui/field-contracts';
import type {ButtonPressEvent} from '@vypdev/ha-ui/button';
import type {FieldValueEvent} from '@vypdev/ha-ui/field';
import {catalogExample} from './catalog-example.js';
import {catalogCopy,catalogSettings} from './catalog-state.js';
export interface Args {label:string;variant:ButtonVariant;size:ButtonSize;type:ButtonType;disabled:boolean;loading:boolean;iconOnly:boolean;pressed:boolean|null;cancelRequest:boolean;invalidField:boolean;noValidate:boolean;fieldValue:string;requests:number;submissions:number;resets:number;lastSubmission:string;}
export const renderExample:NonNullable<Meta<Args>['render']>=(controls,context)=>{
 const copy=catalogCopy[catalogSettings(context.globals).locale];
 return catalogExample(controls,(args,setArgs)=>html`<form class="example-form"
  @submit=${(event:SubmitEvent)=>{event.preventDefault();const data=new FormData(event.currentTarget as HTMLFormElement,event.submitter as HTMLButtonElement);setArgs({...args,submissions:args.submissions+1,lastSubmission:textFieldValue(data.get('task'))+' / '+data.get('action')});}}
  @reset=${()=>setArgs({...args,resets:args.resets+1,lastSubmission:''})}>
  <vyp-ha-field .state=${textFieldState({label:copy.fieldLabel,required:true,requiredMessage:copy.required})} .name=${'task'} .defaultValue=${'Kitchen'} .value=${args.invalidField?'':args.fieldValue}
   @ha-value-request=${(event:FieldValueEvent)=>{const detail=fieldValueDetail(event.detail);setArgs({...args,fieldValue:detail.value,invalidField:false});}}></vyp-ha-field>
  <vyp-ha-button .state=${buttonState({label:args.label||copy.submit,variant:args.variant,size:args.size,loading:args.loading,loadingLabel:copy.working,iconOnly:args.iconOnly,pressed:args.pressed})}
   .type=${args.type} .name=${'action'} .value=${'save'} .disabled=${args.disabled} .formNoValidate=${args.noValidate}
   @ha-press-request=${(event:ButtonPressEvent)=>{if(args.cancelRequest)event.preventDefault();setArgs({...args,requests:args.requests+1,pressed:args.pressed===null?null:!args.pressed});}}>${args.iconOnly?html`<span slot="leading">+</span>`:nothing}</vyp-ha-button>
  <div role="status" data-requests=${args.requests} data-submissions=${args.submissions} data-resets=${args.resets} aria-live="polite">${copy.requests}: ${args.requests}; ${copy.submitted}: ${args.submissions}; ${copy.resets}: ${args.resets}. ${args.lastSubmission}</div>
 </form>`);
};
export const renderVariants:NonNullable<Meta<Args>['render']>=(_controls,context)=>{
 const copy=catalogCopy[catalogSettings(context.globals).locale];
 return html`<section class="example-form"><h2>${copy.buttonVariants}</h2><div class="example-actions">${(['primary','neutral','danger','success','warning','plain','outlined','filled'] as const).map(variant=>html`<vyp-ha-button .state=${buttonState({label:copy.submit+' / '+variant,variant})}></vyp-ha-button>`)}</div></section>`;
};
