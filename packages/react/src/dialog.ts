'use client';
import {createElement,useLayoutEffect,useRef,type HTMLAttributes,type ReactNode} from 'react';
import {dialogRequestDetail,type DialogRequestDetail,type DialogState} from '@vypdev/ha-ui/dialog-contracts';
import type {DialogRequestEvent,HaDialog} from '@vypdev/ha-ui/dialog';
export interface DialogProps extends Pick<HTMLAttributes<HaDialog>,'id'|'className'|'style'|'dir'|'lang'>{
 state:DialogState;open:boolean;children?:ReactNode;footer?:ReactNode;
 onRequest?:(event:DialogRequestEvent)=>void;onAction?:(detail:DialogRequestDetail)=>void;
}
/** Bind application state and slots to the registered native modal. */
export function Dialog({state,open,children,footer,onRequest,onAction,id,className,style,dir,lang}:DialogProps){
 const ref=useRef<HaDialog|null>(null);
 useLayoutEffect(()=>{const host=ref.current!;host.state=state;host.open=open;},[state,open]);
 useLayoutEffect(()=>{
  const host=ref.current!;
  const handle=(event:DialogRequestEvent)=>{if(event.target!==host)return;const detail=dialogRequestDetail(event.detail);onRequest?.(event);if(!event.defaultPrevented)onAction?.(detail);};
  host.addEventListener('ha-dialog-request',handle);return()=>host.removeEventListener('ha-dialog-request',handle);
 },[onRequest,onAction]);
 return createElement('vyp-ha-dialog',{ref,id,className,style,dir,lang},children,footer===undefined?null:createElement('div',{slot:'footer'},footer));
}
