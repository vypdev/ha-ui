import {presentationText} from './presentation-text.js';
export interface CheckboxState {readonly label:string;readonly description:string;readonly error:string;readonly required:boolean;readonly indeterminate:boolean;readonly requiredMessage:string;}
export class CheckboxInputError extends Error {readonly code='invalid_checkbox';constructor(){super('invalid_checkbox');this.name='CheckboxInputError';}}
function invalid():never{throw new CheckboxInputError();}
function object(raw:unknown,keys:readonly string[],required:readonly string[]):Record<string,unknown>{
 if(typeof raw!=='object'||raw===null||Array.isArray(raw)||required.some(key=>!Object.hasOwn(raw,key))||Reflect.ownKeys(raw).some(key=>typeof key!=='string'||!keys.includes(key)))invalid();return raw as Record<string,unknown>;
}
function text(raw:unknown,maximum:number,empty:boolean,fallback:string):string{const value=raw===undefined?fallback:raw;if(!presentationText(value,maximum,empty))invalid();return value;}
export function checkboxChecked(raw:unknown):boolean{if(typeof raw!=='boolean')invalid();return raw;}
export function checkboxState(raw:unknown):CheckboxState{
 const source=object(raw,['label','description','error','required','indeterminate','requiredMessage'],['label']);
 return Object.freeze({label:text(source.label,256,false,''),description:text(source.description,512,true,''),error:text(source.error,512,true,''),required:source.required===undefined?false:checkboxChecked(source.required),indeterminate:source.indeterminate===undefined?false:checkboxChecked(source.indeterminate),requiredMessage:text(source.requiredMessage,512,false,'Select this option.')});
}
export function checkboxName(raw:unknown):string{if(!presentationText(raw,128,true))invalid();return raw;}
export function checkboxValue(raw:unknown):string{if(typeof raw!=='string'||raw.length>16384||!raw.isWellFormed())invalid();return raw;}
export interface CheckboxValidity {readonly flags:Readonly<{valueMissing:boolean;customError:boolean}>;readonly message:string;}
export function checkboxValidity(rawChecked:unknown,rawState:unknown,rawCustom:unknown=''):CheckboxValidity{
 const checked=checkboxChecked(rawChecked),state=checkboxState(rawState),custom=text(rawCustom,512,true,''),valueMissing=state.required&&!checked;
 return Object.freeze({flags:Object.freeze({valueMissing,customError:!!(custom||state.error)}),message:custom||state.error||(valueMissing?state.requiredMessage:'')});
}
export type CheckboxChangeReason='change'|'reset'|'restore'|'autocomplete';
export interface CheckboxChangeDetail {readonly checked:boolean;readonly reason:CheckboxChangeReason;}
export function checkboxChangeDetail(raw:unknown):CheckboxChangeDetail{
 const source=object(raw,['checked','reason'],['checked','reason']),checked=checkboxChecked(source.checked),reason=source.reason as CheckboxChangeReason;
 if(!['change','reset','restore','autocomplete'].includes(reason))invalid();return Object.freeze({checked,reason});
}
export function checkboxRestoreState(raw:unknown):string{return checkboxChecked(raw)?'true':'false';}
export function checkboxRestoreValue(raw:unknown):boolean{if(raw!=='true'&&raw!=='false')invalid();return raw==='true';}
