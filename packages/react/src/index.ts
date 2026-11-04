'use client';
import {createElement, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode} from 'react';
import type {NavigationState} from '@vypdev/ha-ui/contracts';
import type {HaTabs, NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';

export interface TabsProps extends Pick<HTMLAttributes<HaTabs>,'id'|'className'|'style'|'dir'|'lang'> {
  state: NavigationState;
  onSelectionRequest?: (event:NavigationSelectionEvent)=>void;
  children?: ReactNode;
}
/** Only React bindings; the app explicitly registers the shared element at its client boundary. */
export function Tabs({state,onSelectionRequest,children,id,className,style,dir,lang}:TabsProps) {
  const element=useRef<HaTabs|null>(null);
  useLayoutEffect(()=>{element.current!.state=state;},[state]);
  useLayoutEffect(()=>{
    const host=element.current!;
    const handle=(event:NavigationSelectionEvent)=>onSelectionRequest?.(event);
    host.addEventListener('ha-selection-request',handle);
    return ()=>host.removeEventListener('ha-selection-request',handle);
  },[onSelectionRequest]);
  return createElement('vyp-ha-tabs',{ref:element,id,className,style,dir,lang},children);
}
export {TextField} from './text-field.js';
export type {TextFieldProps} from './text-field.js';
export {Button} from './button.js';
export type {ButtonProps} from './button.js';
export {Select} from './select.js';
export type {SelectProps} from './select.js';
