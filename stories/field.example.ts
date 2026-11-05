import {html} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {catalogExample} from './catalog-example.js';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {textFieldState,textFieldValue,fieldValueDetail} from '@vypdev/ha-ui/field-contracts';
import type {FieldValueEvent} from '@vypdev/ha-ui/field';
import {catalogSettings,catalogCopy} from './catalog-state.js';
export interface Args {value:string;defaultValue:string;disabled:boolean;readOnly:boolean;required:boolean;error:boolean;submitted:string|null;placeholder?:string;description?:string;}
export const renderExample:NonNullable<Meta<Args>['render']>=(controls,context)=>{
    const copy=catalogCopy[catalogSettings(context.globals).locale];
    return catalogExample(controls,(args,setArgs)=>{
    const state=textFieldState({label:copy.fieldLabel,description:args.description===undefined?copy.description:args.description,placeholder:args.placeholder===undefined?copy.placeholder:args.placeholder,required:args.required,readOnly:args.readOnly,error:args.error?copy.error:'',requiredMessage:copy.required});
    return html`<form class="example-form" @submit=${(event:SubmitEvent)=>{event.preventDefault();const value=textFieldValue(new FormData(event.currentTarget as HTMLFormElement).get('task'));setArgs({...args,submitted:value});}}>
      <vyp-ha-field .state=${state} .value=${args.value} .defaultValue=${args.defaultValue} .name=${'task'} .disabled=${args.disabled}
        @ha-value-request=${(event:FieldValueEvent)=>{const detail=fieldValueDetail(event.detail);setArgs({...args,value:detail.value,error:false,submitted:null});}}></vyp-ha-field>
      <div class="example-actions"><vyp-ha-button .type=${'submit'} .disabled=${args.disabled} .state=${buttonState({label:copy.submit,variant:'primary'})}></vyp-ha-button><vyp-ha-button .type=${'reset'} .state=${buttonState({label:copy.reset})}></vyp-ha-button></div>
      <div role="status" aria-live="polite">${args.submitted===null?copy.draft:copy.submitted+': '+args.submitted}</div>
    </form>`;
    });
  };
