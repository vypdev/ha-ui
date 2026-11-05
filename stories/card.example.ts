import {html,nothing} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {cardState} from '@vypdev/ha-ui/card-contracts';
import {catalogExample} from './catalog-example.js';
import {catalogSettings} from './catalog-state.js';

export interface Args{raised:boolean;actions:boolean;untitled:boolean;empty:boolean;long:boolean;rtl:boolean;reviewed:boolean;}
const labels={
 en:{title:'Household tasks',long:'Maintenance and supplies for the shared household',copy:'Review the kitchen supplies before shopping.',review:'Review task',done:'Task reviewed.'},
 es:{title:'Tareas del hogar',long:'Mantenimiento y suministros para la casa compartida',copy:'Revisa los suministros de la cocina antes de hacer la compra.',review:'Revisar tarea',done:'Tarea revisada.'},
 ar:{title:'مهام المنزل',long:'الصيانة واللوازم المنزلية المشتركة',copy:'راجع قائمة اللوازم.',review:'راجع المهمة',done:'تمت مراجعة المهمة.'},
};
export const renderExample:NonNullable<Meta<Args>['render']>=(controls,context)=>catalogExample(controls,(args,setArgs)=>{
 const locale=args.rtl?'ar':catalogSettings(context.globals).locale;
 const copy=labels[locale];
 const state=cardState({title:args.untitled?'':args.long?copy.long:copy.title,raised:args.raised});
 return html`<vyp-ha-card .state=${state} dir=${args.rtl?'rtl':'ltr'} lang=${locale} style="max-width:420px">
  ${args.empty?nothing:html`<div>${copy.copy}</div>`}
  ${args.actions?html`<vyp-ha-button slot="actions" id="card-review" .state=${buttonState({label:copy.review,variant:'plain'})}
   @ha-press-request=${()=>setArgs({...args,reviewed:true})}></vyp-ha-button>`:nothing}
 </vyp-ha-card><div role="status" lang=${locale} dir=${args.rtl?'rtl':'ltr'}>${args.reviewed?copy.done:''}</div>`;
});
