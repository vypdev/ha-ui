'use client';
import {createElement,useLayoutEffect,useRef,type HTMLAttributes,type ReactNode} from 'react';
import {buttonPressDetail,type ButtonState,type ButtonType,type ButtonPressDetail} from '@vypdev/ha-ui/button-contracts';
import type {HaButton,ButtonPressEvent} from '@vypdev/ha-ui/button';
export interface ButtonProps extends Pick<HTMLAttributes<HaButton>,'id'|'className'|'style'|'dir'|'lang'> {
  state:ButtonState;type?:ButtonType;name?:string;value?:string;disabled?:boolean;formNoValidate?:boolean;form?:string;
  onPressRequest?:(event:ButtonPressEvent)=>void;onPress?:(detail:ButtonPressDetail)=>void;leading?:ReactNode;trailing?:ReactNode;
}
/** Bind properties and synchronous intent; the registered core owns visuals and native forms. */
export function Button({state,type='button',name='',value='',disabled=false,formNoValidate=false,form,onPressRequest,onPress,leading,trailing,id,className,style,dir,lang}:ButtonProps){
  const element=useRef<HaButton|null>(null);
  useLayoutEffect(()=>{
    const host=element.current!;host.state=state;host.type=type;host.name=name;host.value=value;host.disabled=disabled;host.formNoValidate=formNoValidate;
    if(form===undefined)host.removeAttribute('form');else host.setAttribute('form',form);
  },[state,type,name,value,disabled,formNoValidate,form]);
  useLayoutEffect(()=>{
    const host=element.current!;
    const handle=(event:ButtonPressEvent)=>{const detail=buttonPressDetail(event.detail);onPressRequest?.(event);if(!event.defaultPrevented)onPress?.(detail);};
    host.addEventListener('ha-press-request',handle);return ()=>host.removeEventListener('ha-press-request',handle);
  },[onPressRequest,onPress]);
  return createElement('vyp-ha-button',{ref:element,id,className,style,dir,lang},leading===undefined?null:createElement('span',{slot:'leading'},leading),trailing===undefined?null:createElement('span',{slot:'trailing'},trailing));
}
