import {textFieldState} from '../../packages/core/src/field-contracts.js';
import type {HaTextField} from '../../packages/core/src/components/field.js';
export const fieldModel=(patch:Record<string,unknown>={})=>textFieldState({label:'Task name',description:'A household task.',required:true,minLength:2,maxLength:20,...patch});
export const fieldHost=()=>document.querySelector('vyp-ha-field')!;
export const fieldInput=(host:HaTextField)=>host.shadowRoot!.querySelector('input')!;
export function propose(host:HaTextField,value:string){fieldInput(host).value=value;fieldInput(host).dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}));}
export const formEntries=()=>[...new FormData(document.querySelector('form')!).entries()];
export function malformedRequest(host:HaTextField){
  const errors:Error[]=[];const capture=(event:ErrorEvent)=>{event.preventDefault();errors.push(event.error as Error);};window.addEventListener('error',capture);
  try{host.dispatchEvent(new CustomEvent('ha-value-request',{detail:{value:42,reason:'input'},bubbles:true,composed:true,cancelable:true}));}
  finally{window.removeEventListener('error',capture);}return errors;
}
export function mutableRequest(host:HaTextField){host.dispatchEvent(new CustomEvent('ha-value-request',{detail:{value:'Snapshot',reason:'input'},bubbles:true,composed:true,cancelable:true}));}

export function nestedFieldRequest(host:HaTextField){
  const child=document.createElement('vyp-ha-field');
  host.append(child);
  const request=new CustomEvent('ha-value-request',{detail:{value:'Nested',reason:'input'},bubbles:true,composed:true,cancelable:true});
  child.dispatchEvent(request);
  return request;
}
