import {presentationText} from './presentation-text.js';

export interface RowState {readonly label:string;readonly description:string;}
export interface GridState {readonly columns:number;readonly minColumnWidth:number;readonly square:boolean;readonly label:string;}
type LayoutErrorCode='invalid_row'|'invalid_grid';
export class LayoutInputError extends Error {
 constructor(readonly code:LayoutErrorCode){super(code);this.name='LayoutInputError';}
}
function source(raw:unknown,keys:readonly string[],code:LayoutErrorCode):Record<string,unknown>{
 if(typeof raw!=='object'||raw===null||Array.isArray(raw)||Reflect.ownKeys(raw).some(key=>typeof key!=='string'||!keys.includes(key)))throw new LayoutInputError(code);
 return raw as Record<string,unknown>;
}
function integer(value:unknown,min:number,max:number):value is number{
 return typeof value==='number'&&Number.isInteger(value)&&value>=min&&value<=max;
}
export function rowState(raw:unknown):RowState {
 const input=source(raw,['label','description'],'invalid_row');
 const {label,description=''}=input;
 if(!presentationText(label,256)||!presentationText(description,512,true))throw new LayoutInputError('invalid_row');
 return Object.freeze({label,description});
}
export function gridState(raw:unknown):GridState {
 const input=source(raw,['columns','minColumnWidth','square','label'],'invalid_grid');
 const {columns=3,minColumnWidth=0,square=false,label=''}=input;
 if(!integer(columns,1,6)||(minColumnWidth!==0&&!integer(minColumnWidth,96,720))||typeof square!=='boolean'||!presentationText(label,256,true))throw new LayoutInputError('invalid_grid');
 return Object.freeze({columns,minColumnWidth,square,label});
}
