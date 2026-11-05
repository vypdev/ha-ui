import type {SelectOption,SelectSelection,SelectValue} from './select-contracts.js';
/** Search excludes accepted values without coercing their primitive identities. Disabled choices remain visible. */
export function multipleSelectOptions(options:readonly SelectOption[],value:SelectSelection,query:string):readonly number[]{
 const selected=typeof value==='object'?value??[]:[],search=query.trim().toLowerCase();
 return Object.freeze(options.flatMap((option,index)=>selected.includes(option.value)||!option.label.toLowerCase().includes(search)?[]:[index]));
}
/** Explicit user edits retain unknown values and model order; a full selection cannot overflow its contract. */
export function changeMultipleSelection(value:SelectSelection,item:SelectValue,action:'add'|'remove'):readonly SelectValue[]|null{
 const selected:readonly SelectValue[]=typeof value==='object'?value??[]:[];
 if(action==='add'){
  if(selected.includes(item)||selected.length>=256)return null;
  return Object.freeze([...selected,item]);
 }
 if(!selected.includes(item))return null;
 return Object.freeze(selected.filter(value=>value!==item));
}
