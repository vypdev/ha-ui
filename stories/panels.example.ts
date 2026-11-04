import {navigationItemIcon,type NavigationIconPresentation} from './navigation-icons.js';
import {html} from 'lit';
import {catalogExample} from './catalog-example.js';
import {navigationState} from '@vypdev/ha-ui/contracts';
import type {HaTabs,NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {catalogSettings,catalogCopy} from './catalog-state.js';
export interface Args {selected:string|null;disabled:boolean;icons?:NavigationIconPresentation;}
export const renderExample=(controls:Args,context:{globals:unknown})=>{
    const copy=catalogCopy[catalogSettings(context.globals).locale];
    return catalogExample(controls,(args,setArgs)=>{
    const state=navigationState({kind:'panels',label:copy.panels,selected:args.disabled?null:args.selected,items:[{...navigationItemIcon(args.icons,'overview',0),id:'overview',label:copy.overview,disabled:args.disabled},{...navigationItemIcon(args.icons,'tasks',1),id:'tasks',label:copy.tasks,disabled:args.disabled}]});
    return html`<vyp-ha-tabs .state=${state} @ha-selection-request=${(event:NavigationSelectionEvent)=>{event.preventDefault();const next=navigationState({...state,selected:event.detail.id});setArgs({...args,selected:next.selected});}}>
      <div slot="overview" class="example-content"><h2>${copy.overview}</h2><p>${copy.panelOverview}</p></div>
      <div slot="tasks" class="example-content"><h2>${copy.tasks}</h2><p>${copy.panelTasks}</p></div>
    </vyp-ha-tabs>`;
    });
  };
