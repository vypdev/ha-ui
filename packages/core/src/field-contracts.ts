import {presentationText} from './presentation-text.js';
export interface TextFieldState {
  readonly label:string; readonly description:string; readonly placeholder:string;
  readonly required:boolean; readonly readOnly:boolean; readonly minLength:number; readonly maxLength:number;
  readonly error:string; readonly requiredMessage:string; readonly tooShortMessage:string; readonly tooLongMessage:string;
}
export class FieldInputError extends Error {
  readonly code='invalid_field';
  constructor(){super('invalid_field');this.name='FieldInputError';}
}
function invalid():never{throw new FieldInputError();}
function length(value:unknown,fallback:number):number {
  const current=value===undefined?fallback:value;
  if(typeof current!=='number'||!Number.isSafeInteger(current)||current<0||current>16384)invalid();
  return current;
}
export function textFieldState(raw:unknown):TextFieldState {
  const keys=['label','description','placeholder','required','readOnly','minLength','maxLength','error','requiredMessage','tooShortMessage','tooLongMessage'];
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
  const minLength=length(source.minLength,0),maxLength=length(source.maxLength,16384);
  if(minLength>maxLength)invalid();
  return Object.freeze({label:text('label',256,false,''),description:text('description',512,true,''),placeholder:text('placeholder',512,true,''),required:boolean('required'),readOnly:boolean('readOnly'),minLength,maxLength,error:text('error',512,true,''),requiredMessage:text('requiredMessage',512,false,'Enter a value.'),tooShortMessage:text('tooShortMessage',512,false,'Enter more characters.'),tooLongMessage:text('tooLongMessage',512,false,'Enter fewer characters.')});
}
/** A literal single-line API value; no HTML parsing, normalization or diagnostic echo. */
export function textFieldValue(value:unknown):string {
  if(typeof value!=='string'||value.length>16384||/[\r\n]/u.test(value)||!value.isWellFormed())invalid();return value;
}
export function textFieldName(value:unknown):string {
  if(!presentationText(value,128,true))invalid();return value;
}
export interface TextFieldValidity {
  readonly flags:Readonly<{valueMissing:boolean;tooShort:boolean;tooLong:boolean;customError:boolean}>;
  readonly message:string;
}
export function textFieldValidity(rawValue:unknown,rawState:unknown,customError:unknown=''):TextFieldValidity {
  const value=textFieldValue(rawValue),state=textFieldState(rawState);
  if(!presentationText(customError,512,true))invalid();
  const flags=Object.freeze({valueMissing:state.required&&value.length===0,tooShort:value.length>0&&value.length<state.minLength,tooLong:value.length>state.maxLength,customError:!!(customError||state.error)});
  const message=customError||state.error||(flags.valueMissing?state.requiredMessage:flags.tooShort?state.tooShortMessage:flags.tooLong?state.tooLongMessage:'');
  return Object.freeze({flags,message});
}
