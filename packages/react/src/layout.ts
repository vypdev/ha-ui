'use client';
import {createElement,useLayoutEffect,useRef,type HTMLAttributes,type ReactNode} from 'react';
import type {GridState,RowState} from '@vypdev/ha-ui/layout-contracts';
import type {HaGrid,HaRow} from '@vypdev/ha-ui/layout';

type HostAttributes=Pick<HTMLAttributes<HTMLElement>,'id'|'className'|'style'|'dir'|'lang'>;
export interface RowProps extends HostAttributes {state:RowState;leading?:ReactNode;trailing?:ReactNode;}
export interface GridProps extends HostAttributes {state:GridState;children?:ReactNode;}
function useHost<T extends HTMLElement&{state:S|undefined},S>(state:S){
 const ref=useRef<T|null>(null);
 useLayoutEffect(()=>{ref.current!.state=state;},[state]);
 return ref;
}
function project(slot:'leading'|'trailing',content:ReactNode){
 return content===undefined?null:createElement('div',{slot,'data-vyp-ha-row-projection':''},content);
}
export function Row({state,leading,trailing,...attributes}:RowProps){
 const ref=useHost<HaRow,RowState>(state);
 return createElement('vyp-ha-row',{...attributes,ref},project('leading',leading),project('trailing',trailing));
}
export function Grid({state,children,...attributes}:GridProps){
 const ref=useHost<HaGrid,GridState>(state);
 return createElement('vyp-ha-grid',{...attributes,ref},children);
}
