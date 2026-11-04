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
