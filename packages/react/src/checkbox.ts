'use client';
import {createElement,useLayoutEffect,useRef,type HTMLAttributes} from 'react';
import {checkboxChangeDetail,type CheckboxState} from '@vypdev/ha-ui/checkbox-contracts';
import type {HaCheckbox,CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
export interface CheckboxProps extends Pick<HTMLAttributes<HaCheckbox>,'id'|'className'|'style'|'dir'|'lang'> {state:CheckboxState;checked:boolean;defaultChecked?:boolean;value?:string;name?:string;disabled?:boolean;form?:string;onCheckedRequest?:(event:CheckboxChangeEvent)=>void;onCheckedChange?:(checked:boolean)=>void;}
/** React owns checked and mixed configuration; the core owns the only native checkbox. */
export function Checkbox({state,checked,defaultChecked=false,value='on',name='',disabled=false,form,onCheckedRequest,onCheckedChange,id,className,style,dir,lang}:CheckboxProps){
 const element=useRef<HaCheckbox|null>(null);
 useLayoutEffect(()=>{const host=element.current!;host.state=state;host.name=name;host.value=value;host.defaultChecked=defaultChecked;host.disabled=disabled;if(form===undefined)host.removeAttribute('form');else host.setAttribute('form',form);host.checked=checked;},[state,checked,defaultChecked,value,name,disabled,form]);
 useLayoutEffect(()=>{const host=element.current!;const handle=(event:CheckboxChangeEvent)=>{const detail=checkboxChangeDetail(event.detail);onCheckedRequest?.(event);if(!event.defaultPrevented)onCheckedChange?.(detail.checked);};host.addEventListener('ha-check-request',handle);return ()=>host.removeEventListener('ha-check-request',handle);},[onCheckedRequest,onCheckedChange]);
 return createElement('vyp-ha-checkbox',{ref:element,id,className,style,dir,lang});
}
