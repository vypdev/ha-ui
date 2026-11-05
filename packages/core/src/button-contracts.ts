import {presentationText} from './presentation-text.js';
export type ButtonType='button'|'submit'|'reset';
export type ButtonVariant='primary'|'neutral'|'danger'|'success'|'warning'|'plain'|'outlined'|'filled';
export type ButtonSize='small'|'medium'|'large'|'extra-large';
export interface ButtonState {
 readonly label:string;readonly variant:ButtonVariant;readonly size:ButtonSize;readonly loading:boolean;
 readonly loadingLabel:string;readonly iconOnly:boolean;readonly pressed:boolean|null;
}
export interface ButtonPressDetail {readonly type:ButtonType;}
export class ButtonInputError extends Error {
 readonly code='invalid_button';constructor(){super('invalid_button');this.name='ButtonInputError';}
}
function invalid():never{throw new ButtonInputError();}
export function buttonState(raw:unknown):ButtonState {
 const keys=['label','variant','size','loading','loadingLabel','iconOnly','pressed'];
 if(typeof raw!=='object'||raw===null||Array.isArray(raw)||!Object.hasOwn(raw,'label')||Reflect.ownKeys(raw).some(key=>typeof key!=='string'||!keys.includes(key)))invalid();
 const source=raw as Record<string,unknown>;
 function text(key:string,maximum:number,fallback:string):string{const value=source[key]===undefined?fallback:source[key];if(!presentationText(value,maximum,false))invalid();return value;}
 function flag(key:string):boolean{const value=source[key]===undefined?false:source[key];if(typeof value!=='boolean')invalid();return value;}
 function option(key:string,values:readonly string[],fallback:string):string{const value=source[key]===undefined?fallback:source[key];if(typeof value!=='string'||!values.includes(value))invalid();return value;}
 const pressed=source.pressed===undefined?null:source.pressed;if(pressed!==null&&typeof pressed!=='boolean')invalid();
 return Object.freeze({label:text('label',256,''),variant:option('variant',['primary','neutral','danger','success','warning','plain','outlined','filled'],'neutral') as ButtonVariant,size:option('size',['small','medium','large','extra-large'],'medium') as ButtonSize,loading:flag('loading'),loadingLabel:text('loadingLabel',512,'Working…'),iconOnly:flag('iconOnly'),pressed});
}
export function buttonType(value:unknown):ButtonType {if(value!=='button'&&value!=='submit'&&value!=='reset')invalid();return value;}
export function buttonName(value:unknown):string {if(!presentationText(value,128,true))invalid();return value;}
export function buttonValue(value:unknown):string {if(typeof value!=='string'||value.length>16384||!value.isWellFormed())invalid();return value;}
export function buttonPressDetail(raw:unknown):ButtonPressDetail {
 if(typeof raw!=='object'||raw===null||Array.isArray(raw)||Reflect.ownKeys(raw).length!==1||!Object.hasOwn(raw,'type'))invalid();
 return Object.freeze({type:buttonType((raw as Record<string,unknown>).type)});
}
