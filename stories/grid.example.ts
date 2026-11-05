import {html} from 'lit';
import type {Meta} from '@storybook/web-components-vite';
import {cardState} from '@vypdev/ha-ui/card-contracts';
import {gridState} from '@vypdev/ha-ui/layout-contracts';
import {catalogExample} from './catalog-example.js';
import {catalogSettings} from './catalog-state.js';

export interface GridArgs{columns:number;responsive:boolean;square:boolean;rtl:boolean;}
const copy={
 en:{label:'Household tasks',cards:[['Shopping','Review supplies.'],['Cleaning','Check the hallway.'],['Plants','Water the plants.']]},
 es:{label:'Tareas del hogar',cards:[['Compra','Revisa los suministros.'],['Limpieza','Revisa el pasillo.'],['Plantas','Riega las plantas.']]},
 ar:{label:'مهام المنزل',cards:[['التسوق','راجع اللوازم.'],['التنظيف','راجع الردهة.'],['النباتات','اسق النباتات.']]},
};
export const renderExample:NonNullable<Meta<GridArgs>['render']>=(controls,context)=>catalogExample(controls,args=>{
 const locale=args.rtl?'ar':catalogSettings(context.globals).locale;
 const text=copy[locale];
 const state=gridState({columns:args.columns,minColumnWidth:args.responsive?170:0,square:args.square,label:text.label});
 return html`<style>.layout-card::part(card){height:100%;}</style><vyp-ha-grid .state=${state} dir=${args.rtl?'rtl':'ltr'} lang=${locale}>
  ${text.cards.map(([title,description])=>html`<vyp-ha-card class="layout-card" .state=${cardState({title})}><div>${description}</div></vyp-ha-card>`)}
 </vyp-ha-grid>`;
});
