import {presentationText} from './presentation-text.js';

export const TEXTAREA_MAX_CODEPOINTS=16384;
export interface TextAreaState {
  readonly label:string;readonly description:string;readonly placeholder:string;
  readonly required:boolean;readonly readOnly:boolean;readonly minLength:number;readonly maxLength:number;readonly rows:number;
  readonly error:string;readonly requiredMessage:string;readonly tooShortMessage:string;readonly tooLongMessage:string;
}
export class TextAreaInputError extends Error {
  readonly code='invalid_textarea';
  constructor(){super('invalid_textarea');this.name='TextAreaInputError';}
}
function invalid():never{throw new TextAreaInputError();}
function integer(value:unknown,fallback:number,minimum:number,maximum:number):number {
  const current=value===undefined?fallback:value;
  if(typeof current!=='number'||!Number.isSafeInteger(current)||current<minimum||current>maximum)invalid();
  return current;
}
/** Presentation configuration is independent of the existing single-line field contract. */
export function textAreaState(raw:unknown):TextAreaState {
  const keys=['label','description','placeholder','required','readOnly','minLength','maxLength','rows','error','requiredMessage','tooShortMessage','tooLongMessage'];
  if(typeof raw!=='object'||raw===null||Array.isArray(raw)||!Object.hasOwn(raw,'label')||Object.keys(raw).some(key=>!keys.includes(key)))invalid();
  const source=raw as Record<string,unknown>;
  function text(key:string,maximum:number,empty:boolean,fallback:string):string {
    const current=source[key]===undefined?fallback:source[key];
    if(!presentationText(current,maximum,empty))invalid();return current;
  }
  function boolean(key:string):boolean {
    const current=source[key]===undefined?false:source[key];
    if(typeof current!=='boolean')invalid();return current;
  }
  const minLength=integer(source.minLength,0,0,TEXTAREA_MAX_CODEPOINTS),maxLength=integer(source.maxLength,TEXTAREA_MAX_CODEPOINTS,0,TEXTAREA_MAX_CODEPOINTS);
  if(minLength>maxLength)invalid();
  return Object.freeze({
    label:text('label',256,false,''),description:text('description',512,true,''),placeholder:text('placeholder',512,true,''),
    required:boolean('required'),readOnly:boolean('readOnly'),minLength,maxLength,rows:integer(source.rows,3,2,20),
    error:text('error',512,true,''),requiredMessage:text('requiredMessage',512,false,'Enter a value.'),
    tooShortMessage:text('tooShortMessage',512,false,'Enter more characters.'),tooLongMessage:text('tooLongMessage',512,false,'Enter fewer characters.'),
  });
}
/** Preserve programmatic CR/LF/tab literally; diagnostics never contain the supplied value. */
export function textAreaValue(value:unknown):string {
  if(typeof value!=='string'||!value.isWellFormed()||Array.from(value).length>TEXTAREA_MAX_CODEPOINTS||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value))invalid();
  return value;
}
export function textAreaName(value:unknown):string {
  if(!presentationText(value,128,true))invalid();return value;
}
export interface TextAreaValidity {
  readonly flags:Readonly<{valueMissing:boolean;tooShort:boolean;tooLong:boolean;customError:boolean}>;
  readonly message:string;
}
export function textAreaValidity(rawValue:unknown,rawState:unknown,customError:unknown=''):TextAreaValidity {
  const value=textAreaValue(rawValue),state=textAreaState(rawState),size=Array.from(value).length;
  if(!presentationText(customError,512,true))invalid();
  const flags=Object.freeze({valueMissing:state.required&&size===0,tooShort:size>0&&size<state.minLength,tooLong:size>state.maxLength,customError:!!(customError||state.error)});
  const message=customError||state.error||(flags.valueMissing?state.requiredMessage:flags.tooShort?state.tooShortMessage:flags.tooLong?state.tooLongMessage:'');
  return Object.freeze({flags,message});
}
export type TextAreaValueReason='input'|'reset'|'restore'|'autocomplete';
export interface TextAreaValueDetail {readonly value:string;readonly reason:TextAreaValueReason;}
/** Model bridges validate the multiline payload before any application callback. */
export function textAreaValueDetail(raw:unknown):TextAreaValueDetail {
  if(typeof raw!=='object'||raw===null||Array.isArray(raw)||Object.keys(raw).length!==2||!Object.hasOwn(raw,'value')||!Object.hasOwn(raw,'reason'))invalid();
  const source=raw as Record<string,unknown>,value=textAreaValue(source.value),reason=source.reason as TextAreaValueReason;
  if(!['input','reset','restore','autocomplete'].includes(reason))invalid();
  return Object.freeze({value,reason});
}
