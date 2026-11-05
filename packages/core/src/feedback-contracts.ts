import {presentationText} from './presentation-text.js';

export type FeedbackKind='notice'|'empty'|'loading';
export type FeedbackTone='info'|'success'|'warning'|'error';
export interface FeedbackState {
 readonly kind:FeedbackKind;readonly tone:FeedbackTone;readonly title:string;
 readonly message:string;readonly narrow:boolean;readonly icon:boolean;
}
export class FeedbackInputError extends Error {
 readonly code='invalid_feedback';
 constructor(){super('invalid_feedback');this.name='FeedbackInputError';}
}
const keys=['kind','tone','title','message','narrow','icon'];
const tones:readonly FeedbackTone[]=['info','success','warning','error'];
function invalid():never{throw new FeedbackInputError();}
export function feedbackState(raw:unknown):FeedbackState{
 if(typeof raw!=='object'||raw===null||Array.isArray(raw)||Reflect.ownKeys(raw).some(key=>typeof key!=='string'||!keys.includes(key)))invalid();
 const {kind,tone='info',title='',message='',narrow=false,icon=true}=raw as Record<string,unknown>;
 if(kind!=='notice'&&kind!=='empty'&&kind!=='loading')invalid();
 if(typeof tone!=='string'||!tones.includes(tone as FeedbackTone)||!presentationText(title,256,true)||!presentationText(message,512,true)||typeof narrow!=='boolean'||typeof icon!=='boolean')invalid();
 if(kind!=='notice'&&(tone!=='info'||narrow))invalid();
 if(kind==='empty'?title==='':message==='')invalid();
 if(kind==='loading'&&(title!==''||!icon))invalid();
 return Object.freeze({kind,tone:tone as FeedbackTone,title,message,narrow,icon});
}
