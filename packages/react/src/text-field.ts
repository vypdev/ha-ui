'use client';
import {createElement,useLayoutEffect,useRef,type HTMLAttributes} from 'react';
import {fieldValueDetail} from '@vypdev/ha-ui/field-contracts';
import type {TextFieldState} from '@vypdev/ha-ui/field-contracts';
import type {HaTextField,FieldValueEvent} from '@vypdev/ha-ui/field';
export interface TextFieldProps extends Pick<HTMLAttributes<HaTextField>,'id'|'className'|'style'|'dir'|'lang'> {
  state:TextFieldState;value:string;name?:string;defaultValue?:string;disabled?:boolean;form?:string;
  onValueRequest?:(event:FieldValueEvent)=>void;onValueChange?:(value:string)=>void;
}
/** React owns the model; the explicitly registered core owns native form behavior and visuals. */
export function TextField({state,value,name='',defaultValue='',disabled=false,form,onValueRequest,onValueChange,id,className,style,dir,lang}:TextFieldProps){
  const element=useRef<HaTextField|null>(null);
  useLayoutEffect(()=>{
    const host=element.current!;host.state=state;host.name=name;host.defaultValue=defaultValue;host.disabled=disabled;
    if(form===undefined)host.removeAttribute('form');else host.setAttribute('form',form);
    host.value=value;
  },[state,value,name,defaultValue,disabled,form]);
  useLayoutEffect(()=>{
    const host=element.current!;
    const handle=(event:FieldValueEvent)=>{
      if(event.composedPath()[0]!==host)return;
      const detail=fieldValueDetail(event.detail);
      onValueRequest?.(event);
      if(!event.defaultPrevented)onValueChange?.(detail.value);
    };
    host.addEventListener('ha-value-request',handle);return ()=>host.removeEventListener('ha-value-request',handle);
  },[onValueRequest,onValueChange]);
  return createElement('vyp-ha-field',{ref:element,id,className,style,dir,lang});
}
