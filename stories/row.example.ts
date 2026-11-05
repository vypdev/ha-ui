import {html,nothing} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {rowState} from '@vypdev/ha-ui/layout-contracts';
import {catalogExample} from './catalog-example.js';
import {catalogSettings} from './catalog-state.js';

export interface RowArgs{description:boolean;actions:boolean;long:boolean;rtl:boolean;reviewed:boolean;}
const copy={
 en:{list:'Household tasks',label:'Review kitchen supplies',description:'Check the shared shopping list.',long:'Review the kitchen, laundry and maintenance supplies for the shared household',action:'Review task',done:'Task reviewed.'},
 es:{list:'Tareas del hogar',label:'Revisar suministros',description:'Consulta la lista de la compra compartida.',long:'Revisar los suministros de cocina, lavandería y mantenimiento del hogar',action:'Revisar tarea',done:'Tarea revisada.'},
 ar:{list:'مهام المنزل',label:'راجع لوازم المطبخ',description:'راجع قائمة التسوق المشتركة.',long:'راجع لوازم المطبخ والغسيل والصيانة للمنزل المشترك',action:'راجع المهمة',done:'تمت مراجعة المهمة.'},
};
export const renderExample:NonNullable<Meta<RowArgs>['render']>=(controls,context)=>catalogExample(controls,(args,setArgs)=>{
 const text=copy[args.rtl?'ar':catalogSettings(context.globals).locale];
 const state=rowState({label:args.long?text.long:text.label,description:args.description?text.description:''});
 return html`<div role="list" aria-label=${text.list} dir=${args.rtl?'rtl':'ltr'} style="max-width:560px">
  <vyp-ha-row .state=${state}>
   ${args.actions?html`<svg aria-hidden="true" slot="leading" width="16" height="16" viewBox="0 0 16 16" style="display:block" fill="currentColor"><path d="M8 2 14 8 8 14 2 8Z"></path></svg><vyp-ha-button slot="trailing" .state=${buttonState({label:text.action,variant:'plain'})}
    @ha-press-request=${()=>setArgs({...args,reviewed:true})}></vyp-ha-button>`:nothing}
  </vyp-ha-row>
 </div><div role="status">${args.reviewed?text.done:''}</div>`;
});
