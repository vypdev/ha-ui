'use client';
import {createElement,useLayoutEffect,useRef,type HTMLAttributes} from 'react';
import {flushSync} from 'react-dom';
import {textAreaValueDetail} from '@vypdev/ha-ui/textarea-contracts';
import type {TextAreaState} from '@vypdev/ha-ui/textarea-contracts';
import type {HaTextArea,TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
export interface TextAreaProps extends Pick<HTMLAttributes<HaTextArea>,'id'|'className'|'style'|'dir'|'lang'> {
  state:TextAreaState;value:string;name?:string;defaultValue?:string;disabled?:boolean;form?:string;
  onValueRequest?:(event:TextAreaValueEvent)=>void;onValueChange?:(value:string)=>void;
}
/** React owns the model; the explicitly registered core owns native form behavior and visuals. */
export function TextArea({state,value,name='',defaultValue='',disabled=false,form,onValueRequest,onValueChange,id,className,style,dir,lang}:TextAreaProps){
  const element=useRef<HaTextArea|null>(null);
  useLayoutEffect(()=>{
    const host=element.current!;host.state=state;host.name=name;host.defaultValue=defaultValue;host.disabled=disabled;
    if(form===undefined)host.removeAttribute('form');else host.setAttribute('form',form);
    host.value=value;
  },[state,value,name,defaultValue,disabled,form]);
  useLayoutEffect(()=>{
    const host=element.current!;
    const handle=(event:TextAreaValueEvent)=>{
      if(event.composedPath()[0]!==host)return;
      const detail=textAreaValueDetail(event.detail);
      if(onValueRequest===undefined&&onValueChange===undefined)return;
      // A native edit must see the accepted React value before the next keystroke.
      flushSync(()=>{
        onValueRequest?.(event);
        if(!event.defaultPrevented)onValueChange?.(detail.value);
      });
    };
    host.addEventListener('ha-value-request',handle);return ()=>host.removeEventListener('ha-value-request',handle);
  },[onValueRequest,onValueChange]);
  return createElement('vyp-ha-textarea',{ref:element,id,className,style,dir,lang});
}
