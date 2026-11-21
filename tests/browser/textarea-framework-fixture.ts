import {textAreaState} from '../../packages/core/src/textarea-contracts.js';
import type {HaTextArea} from '../../packages/core/src/components/textarea.js';
export const textAreaModel=(patch:Record<string,unknown>={})=>textAreaState({label:'Task name',description:'A household task.',required:true,minLength:2,maxLength:20,...patch});
export const textAreaHost=()=>document.querySelector('vyp-ha-textarea')!;
export const textAreaInput=(host:HaTextArea)=>host.shadowRoot!.querySelector('textarea')!;
export function propose(host:HaTextArea,value:string){textAreaInput(host).value=value;textAreaInput(host).dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}));}
export const formEntries=()=>[...new FormData(document.querySelector('form')!).entries()];
export function malformedRequest(host:HaTextArea){
  const errors:Error[]=[];const capture=(event:ErrorEvent)=>{event.preventDefault();errors.push(event.error as Error);};window.addEventListener('error',capture);
  try{host.dispatchEvent(new CustomEvent('ha-value-request',{detail:{value:42,reason:'input'},bubbles:true,composed:true,cancelable:true}));}
  finally{window.removeEventListener('error',capture);}return errors;
}
export function mutableRequest(host:HaTextArea){host.dispatchEvent(new CustomEvent('ha-value-request',{detail:{value:'Snapshot\n😀',reason:'input'},bubbles:true,composed:true,cancelable:true}));}

export function nestedTextAreaRequest(host:HaTextArea){
  const child=document.createElement('vyp-ha-textarea');
  host.append(child);
  const request=new CustomEvent('ha-value-request',{detail:{value:'Nested',reason:'input'},bubbles:true,composed:true,cancelable:true});
  child.dispatchEvent(request);
  return request;
}
