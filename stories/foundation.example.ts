import {html} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {catalogExample} from './catalog-example.js';
import {navigationState} from '@vypdev/ha-ui/contracts';
import type {HaTabs,NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {catalogSettings,catalogCopy} from './catalog-state.js';
export interface Args {selected:string;disabled:boolean;empty:boolean;longLabels:boolean;}
const sections=['overview','tasks','inventory','family','settings'] as const;
export const renderExample:NonNullable<Meta<Args>['render']>=(controls,context)=>{
    const copy=catalogCopy[catalogSettings(context.globals).locale];
    return catalogExample(controls,(args,setArgs)=>{
    const items=args.empty?[]:sections.map(id=>({id,label:args.longLabels?copy[id]+' — '+copy.long:copy[id],href:'#'+id,disabled:args.disabled}));
    const state=navigationState({kind:'navigation',label:copy.sections,selected:args.disabled||args.empty?null:args.selected,items});
    return html`<vyp-ha-tabs .state=${state} @ha-selection-request=${(event:NavigationSelectionEvent)=>{event.preventDefault();const next=navigationState({...state,selected:event.detail.id});setArgs({...args,selected:next.selected!});}}></vyp-ha-tabs>
      <section class="example-content"><h2>${items.find(item=>item.id===state.selected)?.label??copy.household}</h2><p>${args.empty?copy.empty:args.disabled?copy.disabled:copy.navigationHelp}</p></section>`;
    });
  };
