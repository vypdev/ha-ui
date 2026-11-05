'use client';
import {createElement,useLayoutEffect,useRef,type HTMLAttributes,type ReactNode} from 'react';
import type {CardState} from '@vypdev/ha-ui/card-contracts';
import type {HaCard} from '@vypdev/ha-ui/card';
export interface CardProps extends Pick<HTMLAttributes<HaCard>,'id'|'className'|'style'|'dir'|'lang'>{
 state:CardState;children?:ReactNode;actions?:ReactNode;
}
export function Card({state,children,actions,id,className,style,dir,lang}:CardProps){
 const ref=useRef<HaCard|null>(null);
 useLayoutEffect(()=>{ref.current!.state=state;},[state]);
 return createElement('vyp-ha-card',{ref,id,className,style,dir,lang},children,actions===undefined?null:createElement('div',{slot:'actions','data-vyp-ha-card-projection':''},actions));
}
