import {presentationText} from './presentation-text.js';

export type DialogKind='standard'|'alert';
export type DialogWidth='small'|'medium'|'large'|'full';
export type DialogConfirmTone='primary'|'danger';
export type DialogAction='confirm'|'cancel'|'close'|'escape'|'scrim'|'native';
export interface DialogState {
 readonly title:string;readonly subtitle:string;readonly description:string;
 readonly kind:DialogKind;readonly width:DialogWidth;
 readonly closeLabel:string;readonly cancelLabel:string;readonly confirmLabel:string;
 readonly confirmTone:DialogConfirmTone;readonly confirmDisabled:boolean;
 readonly pending:boolean;readonly pendingLabel:string;readonly guardDismiss:boolean;
}
export interface DialogRequestDetail {readonly action:DialogAction;}
export class DialogInputError extends Error {
 readonly code='invalid_dialog';constructor(){super('invalid_dialog');this.name='DialogInputError';}
}
const keys=['title','subtitle','description','kind','width','closeLabel','cancelLabel','confirmLabel','confirmTone','confirmDisabled','pending','pendingLabel','guardDismiss'];
const actions=['confirm','cancel','close','escape','scrim','native'] as const;
function invalid():never{throw new DialogInputError();}
export function dialogOpen(raw:unknown):boolean{if(typeof raw!=='boolean')invalid();return raw;}
export function dialogState(raw:unknown):DialogState {
 if(typeof raw!=='object'||raw===null||Array.isArray(raw)||!Object.hasOwn(raw,'title')||Reflect.ownKeys(raw).some(key=>typeof key!=='string'||!keys.includes(key)))invalid();
 const value=raw as Record<string,unknown>;
 function text(key:string,maximum:number,fallback:string,empty=false):string {
  const next=value[key]===undefined?fallback:value[key];if(!presentationText(next,maximum,empty))invalid();return next;
 }
 function option<const T extends string>(key:string,accepted:readonly T[],fallback:T):T {
  const next=value[key]===undefined?fallback:value[key];
  if(typeof next!=='string'||!accepted.includes(next as T))invalid();return next as T;
 }
 function flag(key:string):boolean{return dialogOpen(value[key]===undefined?false:value[key]);}
 return Object.freeze({
  title:text('title',256,''),subtitle:text('subtitle',256,'',true),description:text('description',1024,'',true),
  kind:option('kind',['standard','alert'],'standard'),width:option('width',['small','medium','large','full'],'medium'),
  closeLabel:text('closeLabel',256,'Close'),cancelLabel:text('cancelLabel',256,'Cancel',true),confirmLabel:text('confirmLabel',256,'',true),
  confirmTone:option('confirmTone',['primary','danger'],'primary'),confirmDisabled:flag('confirmDisabled'),
  pending:flag('pending'),pendingLabel:text('pendingLabel',512,'Working…'),guardDismiss:flag('guardDismiss'),
 });
}
export function dialogRequestDetail(raw:unknown):DialogRequestDetail {
 if(typeof raw!=='object'||raw===null||Array.isArray(raw)||Reflect.ownKeys(raw).length!==1||!Object.hasOwn(raw,'action'))invalid();
 const action=(raw as Record<string,unknown>).action;if(!actions.includes(action as DialogAction))invalid();
 return Object.freeze({action:action as DialogAction});
}
