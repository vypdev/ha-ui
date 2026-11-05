import type {Snippet} from 'svelte';
import type {HTMLAttributes} from 'svelte/elements';
import type {NavigationState} from '@vypdev/ha-ui/contracts';
import type {NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
export interface TabsProps extends Pick<HTMLAttributes<HTMLElement>,'id'|'class'|'style'|'lang'|'dir'> {
  state:NavigationState;
  onSelectionRequest?:(event:NavigationSelectionEvent)=>void;
  panels?:Readonly<Record<string,Snippet>>;
}

import type {TextFieldState} from '@vypdev/ha-ui/field-contracts';
import type {FieldValueEvent} from '@vypdev/ha-ui/field';
export interface TextFieldProps extends Pick<HTMLAttributes<HTMLElement>,'id'|'class'|'style'|'lang'|'dir'> {
  state:TextFieldState;value:string;name?:string;defaultValue?:string;disabled?:boolean;form?:string;
  onValueRequest?:(event:FieldValueEvent)=>void;onValueChange?:(value:string)=>void;
}

import type {ButtonState,ButtonType,ButtonPressDetail} from '@vypdev/ha-ui/button-contracts';
import type {ButtonPressEvent} from '@vypdev/ha-ui/button';
export interface ButtonProps extends Pick<HTMLAttributes<HTMLElement>,'id'|'class'|'style'|'lang'|'dir'> {
  state:ButtonState;type?:ButtonType;name?:string;value?:string;disabled?:boolean;formNoValidate?:boolean;form?:string;
  onPressRequest?:(event:ButtonPressEvent)=>void;onPress?:(detail:ButtonPressDetail)=>void;leading?:Snippet;trailing?:Snippet;
}

import type {SelectState,SelectSelection} from '@vypdev/ha-ui/select-contracts';
import type {SelectValueEvent} from '@vypdev/ha-ui/select';
export interface SelectProps extends Pick<HTMLAttributes<HTMLElement>,'id'|'class'|'style'|'lang'|'dir'> {state:SelectState;value:SelectSelection;name?:string;defaultValue?:SelectSelection;disabled?:boolean;form?:string;onValueRequest?:(event:SelectValueEvent)=>void;onValueChange?:(value:SelectSelection)=>void;}

import type {CheckboxState} from '@vypdev/ha-ui/checkbox-contracts';
import type {CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
export interface CheckboxProps extends Pick<HTMLAttributes<HTMLElement>,'id'|'class'|'style'|'lang'|'dir'> {state:CheckboxState;checked:boolean;defaultChecked?:boolean;value?:string;name?:string;disabled?:boolean;form?:string;onCheckedRequest?:(event:CheckboxChangeEvent)=>void;onCheckedChange?:(checked:boolean)=>void;}

import type {DialogRequestDetail,DialogState} from '@vypdev/ha-ui/dialog-contracts';
import type {DialogRequestEvent} from '@vypdev/ha-ui/dialog';
export interface DialogProps extends Pick<HTMLAttributes<HTMLElement>,'id'|'class'|'style'|'lang'|'dir'>{
 state:DialogState;open:boolean;children?:Snippet;footer?:Snippet;
 onRequest?:(event:DialogRequestEvent)=>void;onAction?:(detail:DialogRequestDetail)=>void;
}

import type {CardState} from '@vypdev/ha-ui/card-contracts';
export interface CardProps extends Pick<HTMLAttributes<HTMLElement>,'id'|'class'|'style'|'lang'|'dir'>{
 state:CardState;children?:Snippet;actions?:Snippet;
}
