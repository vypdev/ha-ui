import {navigationItemIcon,type NavigationIconPresentation} from './navigation-icons.js';
import {html,nothing} from 'lit';
import {catalogExample} from './catalog-example.js';
import {navigationState} from '@vypdev/ha-ui/contracts';
import type {HaTabs,NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {catalogSettings,catalogCopy} from './catalog-state.js';
export interface Args {selected:string;disabled:boolean;empty:boolean;longLabels:boolean;icons?:NavigationIconPresentation;overflow?:boolean;}
const sections=['overview','tasks','inventory','family','settings'] as const;
export const renderExample=(controls:Args,context:{globals:unknown})=>{
    const copy=catalogCopy[catalogSettings(context.globals).locale];
    return catalogExample(controls,(args,setArgs)=>{
    const items=args.empty?[]:(args.overflow?[...sections,'calendar','shopping','rewards'] as const:sections).map((id,index)=>({...(index<sections.length?navigationItemIcon(args.icons,sections[index],index):{}),id,label:args.longLabels?copy[id]+' — '+copy.long:copy[id],href:'#'+id,disabled:args.disabled}));
    const state=navigationState({kind:'navigation',label:copy.sections,scrollStartLabel:copy.scrollStart,scrollEndLabel:copy.scrollEnd,selected:args.disabled||args.empty?null:args.selected,items});
    return html`<vyp-ha-tabs style=${args.overflow?'max-width:240px':nothing} .state=${state} @ha-selection-request=${(event:NavigationSelectionEvent)=>{event.preventDefault();const next=navigationState({...state,selected:event.detail.id});setArgs({...args,selected:next.selected!});}}></vyp-ha-tabs>
      <section class="example-content"><h2>${items.find(item=>item.id===state.selected)?.label??copy.household}</h2><p>${args.empty?copy.empty:args.disabled?copy.disabled:copy.navigationHelp}</p></section>`;
    });
  };
