import {presentationText} from './presentation-text.js';
export type SelectValue=string|number|boolean;
export type SelectSelection=SelectValue|null|readonly SelectValue[];
export interface SelectOption {readonly value:SelectValue;readonly label:string;readonly disabled:boolean;}
export interface SelectState {
 readonly label:string;readonly options:readonly SelectOption[];readonly description:string;readonly placeholder:string;
 readonly emptyMessage:string;readonly error:string;readonly required:boolean;readonly multiple:boolean;readonly size:number;
 readonly requiredMessage:string;readonly unavailableMessage:string;
}
export class SelectInputError extends Error {readonly code='invalid_select';constructor(){super('invalid_select');this.name='SelectInputError';}}
function invalid():never{throw new SelectInputError();}
function object(raw:unknown,keys:readonly string[],required:readonly string[]):Record<string,unknown>{
 if(typeof raw!=='object'||raw===null||Array.isArray(raw)||required.some(key=>!Object.hasOwn(raw,key))||Reflect.ownKeys(raw).some(key=>typeof key!=='string'||!keys.includes(key)))invalid();
 return raw as Record<string,unknown>;
}
function array(raw:unknown):readonly unknown[]{
 if(!Array.isArray(raw)||raw.length>256||Reflect.ownKeys(raw).some(key=>key!=='length'&&(typeof key!=='string'||!/^(0|[1-9]\d*)$/u.test(key)||Number(key)>=raw.length)))invalid();
 return raw;
}
function primitive(raw:unknown):SelectValue{
 if(typeof raw==='boolean'||(typeof raw==='number'&&Number.isFinite(raw)))return raw;
 if(typeof raw==='string'&&raw.length<=1024&&raw.isWellFormed())return raw;
 return invalid();
}
function boolean(raw:unknown):boolean{if(raw===undefined)return false;if(typeof raw!=='boolean')invalid();return raw;}
function text(raw:unknown,maximum:number,empty:boolean,fallback:string):string{const value=raw===undefined?fallback:raw;if(!presentationText(value,maximum,empty))invalid();return value;}
/** Closed immutable options/configuration; selection has its own independently ordered model port. */
export function selectState(raw:unknown):SelectState{
 const source=object(raw,['label','options','description','placeholder','emptyMessage','error','required','multiple','size','requiredMessage','unavailableMessage'],['label','options']);
 const seen=new Set<SelectValue>(),options:SelectOption[]=[];
 for(const item of array(source.options)){
  const option=object(item,['value','label','disabled'],['value','label']),value=primitive(option.value);
  if(seen.has(value))invalid();seen.add(value);options.push(Object.freeze({value,label:text(option.label,256,false,''),disabled:boolean(option.disabled)}));
 }
 const multiple=boolean(source.multiple),size=source.size===undefined?(multiple?4:1):source.size;
 if(typeof size!=='number'||!Number.isSafeInteger(size)||size<1||size>20)invalid();
 return Object.freeze({label:text(source.label,256,false,''),options:Object.freeze(options),description:text(source.description,512,true,''),placeholder:text(source.placeholder,256,true,'Select an option'),emptyMessage:text(source.emptyMessage,512,false,'No options available.'),error:text(source.error,512,true,''),required:boolean(source.required),multiple,size,requiredMessage:text(source.requiredMessage,512,false,'Select an option.'),unavailableMessage:text(source.unavailableMessage,512,false,'Select an available option.')});
}
export function selectSelection(raw:unknown):SelectSelection{
 if(raw===null)return null;
 if(!Array.isArray(raw))return primitive(raw);
 const values:SelectValue[]=[],seen=new Set<SelectValue>();
 for(const item of array(raw)){const value=primitive(item);if(seen.has(value))invalid();seen.add(value);values.push(value);}
 return Object.freeze(values);
}
export function selectName(raw:unknown):string{if(!presentationText(raw,128,true))invalid();return raw;}
function values(value:SelectSelection):readonly SelectValue[]{return value===null?[]:typeof value==='object'?value:[value];}
function wrongMode(value:SelectSelection,state:SelectState):boolean{return value!==null&&Array.isArray(value)!==state.multiple;}
export interface SelectValidity {readonly flags:Readonly<{valueMissing:boolean;customError:boolean}>;readonly message:string;}
export function selectValidity(rawValue:unknown,rawState:unknown,rawCustomError:unknown=''):SelectValidity{
 const value=selectSelection(rawValue),state=selectState(rawState),custom=text(rawCustomError,512,true,''),selected=values(value);
 const available=new Set(state.options.filter(option=>!option.disabled).map(option=>option.value));
 const unavailable=wrongMode(value,state)||selected.some(item=>!available.has(item));
 const valueMissing=state.required&&selected.length===0,customError=!!(custom||state.error||unavailable);
 return Object.freeze({flags:Object.freeze({valueMissing,customError}),message:custom||state.error||(unavailable?state.unavailableMessage:valueMissing?state.requiredMessage:'')});
}
/** Successful native entries keep option order, omit unavailable values and serialize primitive types only here. */
export function selectEntries(rawValue:unknown,rawState:unknown):readonly string[]{
 const value=selectSelection(rawValue),state=selectState(rawState);if(wrongMode(value,state))return Object.freeze([]);
 const selected=new Set(values(value));return Object.freeze(state.options.filter(option=>!option.disabled&&selected.has(option.value)).map(option=>String(option.value)));
}
export type SelectValueReason='change'|'reset'|'restore'|'autocomplete';
export interface SelectValueDetail {readonly value:SelectSelection;readonly reason:SelectValueReason;}
export function selectValueDetail(raw:unknown):SelectValueDetail{
 const source=object(raw,['value','reason'],['value','reason']),value=selectSelection(source.value),reason=source.reason as SelectValueReason;
 if(!['change','reset','restore','autocomplete'].includes(reason))invalid();return Object.freeze({value,reason});
}
export function selectRestoreState(raw:unknown):string{return JSON.stringify(selectSelection(raw));}
export function selectRestoreValue(raw:unknown):SelectSelection{
 if(typeof raw!=='string'||raw.length>2000000||!raw.isWellFormed())invalid();
 let value:unknown;try{value=JSON.parse(raw);}catch{invalid();}return selectSelection(value);
}
