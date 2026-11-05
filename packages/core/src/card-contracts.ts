import {presentationText} from './presentation-text.js';
export type CardHeadingLevel=1|2|3|4|5|6;
export interface CardState{readonly title:string;readonly headingLevel:CardHeadingLevel;readonly raised:boolean;}
export class CardInputError extends Error {
 readonly code='invalid_card';constructor(){super('invalid_card');this.name='CardInputError';}
}
const levels:readonly CardHeadingLevel[]=[1,2,3,4,5,6];
const keys=['title','headingLevel','raised'];
function invalid():never{throw new CardInputError();}
export function cardState(raw:unknown):CardState {
 if(typeof raw!=='object'||raw===null||Array.isArray(raw)||Reflect.ownKeys(raw).some(key=>typeof key!=='string'||!keys.includes(key)))invalid();
 const input=raw as Record<string,unknown>;
 const title=input.title===undefined?'':input.title,headingLevel=input.headingLevel===undefined?2:input.headingLevel,raised=input.raised===undefined?false:input.raised;
 if(!presentationText(title,256,true)||typeof headingLevel!=='number'||!levels.includes(headingLevel as CardHeadingLevel)||typeof raised!=='boolean')invalid();
 return Object.freeze({title,headingLevel:headingLevel as CardHeadingLevel,raised});
}
