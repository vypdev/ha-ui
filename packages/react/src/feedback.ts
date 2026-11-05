'use client';
import {createElement,useLayoutEffect,useRef,type HTMLAttributes,type ReactNode} from 'react';
import type {FeedbackState} from '@vypdev/ha-ui/feedback-contracts';
import type {HaFeedback} from '@vypdev/ha-ui/feedback';

export interface FeedbackProps extends Pick<HTMLAttributes<HTMLElement>,'id'|'className'|'style'|'dir'|'lang'>{
 state:FeedbackState;action?:ReactNode;icon?:ReactNode;
}
function project(slot:'action'|'icon',content:ReactNode){
 return content==null||typeof content==='boolean'?null:createElement('div',{slot,'data-vyp-ha-feedback-projection':''},content);
}
export function Feedback({state,action,icon,...attributes}:FeedbackProps){
 const ref=useRef<HaFeedback|null>(null);
 useLayoutEffect(()=>{ref.current!.state=state;},[state]);
 return createElement('vyp-ha-feedback',{...attributes,ref},project('icon',icon),project('action',action));
}
