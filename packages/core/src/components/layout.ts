import {LitElement,css,html,nothing} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import {gridState,rowState,type GridState,type RowState} from '../layout-contracts.js';

export class HaRow extends LitElement {
 static properties={state:{attribute:false,noAccessor:true}};
 // Home Assistant list row geometry; see NOTICE.
 static styles=css`
  :host{display:block;min-width:0;}:host([hidden]){display:none;}
  .row{box-sizing:border-box;display:flex;align-items:center;gap:var(--ha-md-list-item-gap,var(--ha-space-4,16px));
   padding:var(--ha-space-3,12px) var(--ha-space-4,16px);min-height:56px;
   color:var(--vyp-ha-text,var(--primary-text-color,#141414));text-align:start;
   font-size:var(--ha-font-size-l,16px);line-height:1.5;}
  .row[data-description]{min-height:72px;}
  .text{flex:1;min-width:0;overflow:hidden;overflow-wrap:anywhere;}
  .label{font-size:var(--ha-font-size-l,16px);line-height:1.5;font-weight:var(--ha-font-weight-normal,400);}
  .description{font-size:var(--ha-font-size-m,14px);line-height:20px;color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#595959));}
  slot{display:contents;}
  ::slotted(*){flex:none;max-inline-size:100%;}
  ::slotted([slot=leading]){color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#595959));}
  ::slotted([data-vyp-ha-row-projection]:empty){display:none;}
 `;
 #state:RowState|undefined;
 get state():RowState|undefined{return this.#state;}
 set state(raw:RowState){const previous=this.#state;this.#state=rowState(raw);this.requestUpdate('state',previous);}
 protected render(){
  const state=this.state;if(!state)return nothing;
  return html`<div class="row" role="listitem" part="row" ?data-description=${Boolean(state.description)}>
   <slot name="leading"></slot><div class="text"><div class="label" part="label">${state.label}</div>
    ${state.description?html`<div class="description" part="description">${state.description}</div>`:nothing}</div>
   <slot name="trailing"></slot>
  </div>`;
 }
}

export class HaGrid extends LitElement {
 static properties={state:{attribute:false,noAccessor:true}};
 // Matches the Home Assistant Lovelace grid gap and fixed tracks; see NOTICE.
 static styles=css`
  :host{display:block;min-width:0;}:host([hidden]){display:none;}
  .grid{display:grid;min-width:0;gap:var(--grid-card-gap,8px);
   grid-template-columns:repeat(var(--_columns),minmax(0,1fr));}
  .grid[data-responsive]{
   --_track:calc((100% - (var(--_columns) - 1) * var(--grid-card-gap,8px)) / var(--_columns));
   grid-template-columns:repeat(auto-fill,minmax(min(100%,max(var(--_minimum),var(--_track))),1fr));}
  slot{display:contents;}
  ::slotted(*){min-inline-size:0;}
  .grid[data-square] ::slotted(*){aspect-ratio:1;min-block-size:0;}
 `;
 #state=gridState({});
 get state():GridState{return this.#state;}
 set state(raw:GridState){const previous=this.#state;this.#state=gridState(raw);this.requestUpdate('state',previous);}
 protected render(){
  const state=this.state;
  return html`<div class="grid" part="grid" role=${state.label?'region':nothing} aria-label=${state.label||nothing}
   ?data-responsive=${Boolean(state.minColumnWidth)} ?data-square=${state.square}
   style=${styleMap({'--_columns':String(state.columns),'--_minimum':state.minColumnWidth+'px'})}><slot></slot></div>`;
 }
}

function register(name:string,element:CustomElementConstructor,registry:CustomElementRegistry|undefined):void{
 if(registry===undefined||typeof document==='undefined')throw new Error('Layout registration requires a browser CustomElementRegistry');
 const current=registry.get(name);
 if(current!==undefined&&current!==element)throw new Error(name+' registration conflict; use one reviewed package cohort');
 if(current===undefined)registry.define(name,element);
}
export function registerRow(registry:CustomElementRegistry|undefined=globalThis.customElements):void{register('vyp-ha-row',HaRow,registry);}
export function registerGrid(registry:CustomElementRegistry|undefined=globalThis.customElements):void{register('vyp-ha-grid',HaGrid,registry);}
declare global{interface HTMLElementTagNameMap{'vyp-ha-row':HaRow;'vyp-ha-grid':HaGrid;}}
