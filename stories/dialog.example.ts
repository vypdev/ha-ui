import {html,nothing} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {dialogRequestDetail,dialogState,type DialogAction,type DialogKind,type DialogWidth} from '@vypdev/ha-ui/dialog-contracts';
import type {DialogRequestEvent} from '@vypdev/ha-ui/dialog';
import {catalogExample} from './catalog-example.js';
import {catalogSettings} from './catalog-state.js';

export interface Args{
 open:boolean;kind:DialogKind;width:DialogWidth;pending:boolean;guardDismiss:boolean;
 confirmDisabled:boolean;long:boolean;reject:boolean;lastAction:DialogAction|null;
}
const labels={
 en:{open:'Review task deletion',title:'Delete task?',description:'Remove the reminder to check the kitchen supplies?',subtitle:'Household tasks',confirm:'Delete',cancel:'Cancel',close:'Close',pending:'Deleting task…',ready:'Ready',accepted:'Last action'},
 es:{open:'Revisar eliminación',title:'¿Eliminar la tarea?',description:'¿Quitar el recordatorio de revisar los suministros de la cocina?',subtitle:'Tareas del hogar',confirm:'Eliminar',cancel:'Cancelar',close:'Cerrar',pending:'Eliminando tarea…',ready:'Listo',accepted:'Última acción'},
};
export const renderExample:NonNullable<Meta<Args>['render']>=(controls,context)=>{
 const copy=labels[catalogSettings(context.globals).locale];
 return catalogExample(controls,(args,setArgs)=>{
  const state=dialogState({title:copy.title,description:copy.description,subtitle:args.long?copy.subtitle:'',closeLabel:copy.close,cancelLabel:copy.cancel,confirmLabel:copy.confirm,confirmTone:'danger',kind:args.kind,width:args.width,pending:args.pending,pendingLabel:copy.pending,guardDismiss:args.guardDismiss,confirmDisabled:args.confirmDisabled});
  return html`<vyp-ha-button id="open-task-dialog" .state=${buttonState({label:copy.open,variant:'primary'})} @ha-press-request=${()=>setArgs({...args,open:true,lastAction:null})}></vyp-ha-button>
   <vyp-ha-dialog .state=${state} .open=${args.open} @ha-dialog-request=${(event:DialogRequestEvent)=>{
    const detail=dialogRequestDetail(event.detail);if(args.reject){event.preventDefault();return;}setArgs({...args,open:false,lastAction:detail.action});
   }}>${args.long?Array.from({length:16},()=>html`<p>${copy.description}</p>`):nothing}</vyp-ha-dialog>
   <div role="status">${args.lastAction===null?copy.ready:copy.accepted+': '+args.lastAction}</div>`;
 });
};
