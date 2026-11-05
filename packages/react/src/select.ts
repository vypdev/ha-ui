'use client';
import {createElement,useLayoutEffect,useRef,type HTMLAttributes} from 'react';
import {selectValueDetail,type SelectState,type SelectSelection} from '@vypdev/ha-ui/select-contracts';
import type {HaSelect,SelectValueEvent} from '@vypdev/ha-ui/select';
export interface SelectProps extends Pick<HTMLAttributes<HaSelect>,'id'|'className'|'style'|'dir'|'lang'> {state:SelectState;value:SelectSelection;name?:string;defaultValue?:SelectSelection;disabled?:boolean;form?:string;onValueRequest?:(event:SelectValueEvent)=>void;onValueChange?:(value:SelectSelection)=>void;}
/** React owns typed selection; the shared native renderer owns forms and keyboard semantics. */
export function Select({state,value,name='',defaultValue=null,disabled=false,form,onValueRequest,onValueChange,id,className,style,dir,lang}:SelectProps){
 const element=useRef<HaSelect|null>(null);
 useLayoutEffect(()=>{const host=element.current!;host.state=state;host.name=name;host.defaultValue=defaultValue;host.disabled=disabled;if(form===undefined)host.removeAttribute('form');else host.setAttribute('form',form);host.value=value;},[state,value,name,defaultValue,disabled,form]);
 useLayoutEffect(()=>{
  const host=element.current!;
  const handle=(event:SelectValueEvent)=>{
    if(event.composedPath()[0]!==host)return;
    const detail=selectValueDetail(event.detail);
    onValueRequest?.(event);
    if(!event.defaultPrevented)onValueChange?.(detail.value);
  };
  host.addEventListener('ha-select-request',handle);
  return ()=>host.removeEventListener('ha-select-request',handle);
 },[onValueRequest,onValueChange]);
 return createElement('vyp-ha-select',{ref:element,id,className,style,dir,lang});
}
