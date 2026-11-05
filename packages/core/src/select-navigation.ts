import type {SelectOption} from './select-contracts.js';
export type OptionMovement='next'|'previous'|'first'|'last';
/** Navigation is a data-only preview; it never commits or coerces an application value. */
export function moveSelectOption(options:readonly SelectOption[],current:number,movement:OptionMovement):number{
 const available=options.flatMap((option,index)=>option.disabled?[]:[index]);
 if(available.length===0)return -1;
 if(movement==='first')return available[0];
 if(movement==='last')return available[available.length-1];
 const position=available.indexOf(current);
 if(position<0)return movement==='previous'?available[available.length-1]:available[0];
 return available[Math.max(0,Math.min(available.length-1,position+(movement==='next'?1:-1)))];
}
/** Prefix search wraps after the current item, retaining exact primitive option identity. */
export function matchSelectOption(options:readonly SelectOption[],current:number,query:string):number{
 const prefix=query.toLowerCase();if(!prefix)return -1;
 for(let offset=1;offset<=options.length;offset++){
  const index=((current+offset)%options.length+options.length)%options.length,option=options[index];
  if(!option.disabled&&option.label.toLowerCase().startsWith(prefix))return index;
 }
 return -1;
}
