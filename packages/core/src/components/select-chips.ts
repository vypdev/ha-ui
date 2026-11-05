import {css,html,svg,nothing,type ReactiveController,type ReactiveControllerHost} from 'lit';
import type {SelectSelection,SelectState,SelectValue} from '../select-contracts.js';
import {changeMultipleSelection,multipleSelectOptions} from '../select-multiple.js';
import {moveSelectOption} from '../select-navigation.js';
import {SelectionDialog} from './selection-dialog.js';
type Host=ReactiveControllerHost&HTMLElement&{readonly state:SelectState;readonly value:SelectSelection;readonly disabled:boolean};
type Frame={state:SelectState;value:SelectSelection;disabled:boolean};
const closePath='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z';
const addPath='M3 16H10V14H3M18 14V10H16V14H12V16H16V20H18V16H22V14M14 6H3V8H14M14 10H3V12H14V10Z';
const searchPath='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z';
const icon=(path:string)=>html`<span class="multi-icon">${svg`<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true"><g><path class="primary-path" d=${path}></path></g></svg>`}</span>`;
export const selectChipsStyles=css`
 .multiple-field{min-width:0;padding-block-end:12px;font:400 14px/1.6 var(--vyp-ha-font-family,var(--ha-font-family-body,Roboto,Noto,sans-serif));}
 .multiple-paint{min-width:0;}
 .multi-icon{display:inline-flex;vertical-align:middle;fill:currentColor;justify-content:center;align-items:center;position:relative;flex:none;width:24px;height:24px;}.multi-icon svg{pointer-events:none;display:block;width:100%;height:100%;}.multi-icon path{opacity:1;}
 .multi{min-width:0;}.multi-chips{display:flex;flex-wrap:wrap;gap:8px;padding-block:8px;}
 .multi-chip{position:relative;display:flex;align-items:center;box-sizing:border-box;min-width:0;max-width:100%;height:32px;padding-inline:16px 34px;border-radius:16px;color:var(--vyp-ha-text,var(--primary-text-color,#141414));}
 .multi-chip::before{content:'';position:absolute;inset:0;border-radius:inherit;background:var(--md-input-chip-selected-container-color,rgba(var(--rgb-primary-text-color,33,33,33),.15));opacity:var(--ha-input-chip-selected-container-opacity,1);pointer-events:none;}
 .multi-chip-label{position:relative;display:block;min-width:0;padding-block:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:400 14px/20px var(--vyp-ha-font-family,var(--ha-font-family-body,Roboto,Noto,sans-serif));}
 .multi-remove{position:absolute;display:flex;align-items:center;justify-content:flex-end;inset-inline-end:0;top:-6px;box-sizing:border-box;width:44px;height:44px;padding:0;padding-inline-end:8px;border:0;background:transparent;color:inherit;cursor:pointer;outline:0;}
 .multi-remove .multi-icon{width:18px;height:18px;}
 .multi-remove-paint{position:absolute;display:flex;align-items:center;justify-content:center;inset-block:6px;inset-inline-end:0;width:34px;}
 .multi-remove::before{content:'';position:absolute;inset-block:6px;inset-inline-end:0;width:34px;border-start-end-radius:16px;border-end-end-radius:16px;background:currentColor;opacity:0;pointer-events:none;}
 .multi-remove:hover:not(:disabled)::before{opacity:.08;}.multi-remove:active:not(:disabled)::before{opacity:.12;}
 .multi-remove:focus-visible::before{outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px #989898));outline-offset:2px;opacity:1;background:transparent;}
 .multi-chip[data-disabled]::before{background:var(--primary-text-color,#141414);opacity:.12;}.multi-chip[data-disabled] .multi-chip-label,.multi-chip[data-disabled] svg{opacity:.38;}
 .multi-remove:disabled{cursor:not-allowed;}.multi-add-wrap{position:relative;min-width:0;height:32px;}
 .multi-add{position:absolute;inset-block-start:0;display:inline-flex;align-items:flex-start;box-sizing:border-box;max-width:100%;min-width:44px;height:44px;padding:0;margin:0;border:0;background:transparent;color:inherit;cursor:pointer;outline:0;}
 .multi-add-paint{display:inline-flex;align-items:center;box-sizing:border-box;min-width:0;min-height:32px;padding-inline:8px 12px;gap:4px;border:1px solid transparent;border-radius:9999px;background:var(--vyp-ha-chip-action-surface,var(--ha-color-fill-primary-normal-resting,#dff3fc));color:var(--vyp-ha-primary,var(--ha-color-on-primary-normal,#00639c));font:500 14px/14px var(--vyp-ha-font-family,var(--ha-font-family-body,Roboto,Noto,sans-serif));}
 .multi-add-label{display:block;min-width:0;padding-block:4px;overflow:hidden;overflow-wrap:anywhere;text-align:start;}.multi-add .multi-icon{width:24px;height:24px;}
 .multi-add:hover:not(:disabled) .multi-add-paint{background:var(--ha-color-fill-primary-normal-hover,#b9e6fc);}.multi-add:active:not(:disabled) .multi-add-paint{background:var(--ha-color-fill-primary-normal-active,#dff3fc);}
 .multi-add:focus-visible .multi-add-paint{outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px #989898));outline-offset:2px;}
 .multi-add:disabled{cursor:not-allowed;}.multi-add:disabled .multi-add-paint{background:var(--ha-color-fill-disabled-normal-resting,#f3f3f3);color:var(--ha-color-on-disabled-normal,#b1b1b1);opacity:.5;}
 .multi-dialog{position:fixed;inset:0;box-sizing:border-box;width:100dvw;height:100dvh;max-width:none;max-height:none;padding:0;margin:0;border:0;background:transparent;color:inherit;outline:0;}
 .multi-dialog:not([open]){display:none;}.multi-dialog::backdrop{background:transparent;}
 /* Keep the open painted surface in a separate compositor layer, like HA's popover. */
 .multi-dialog[open] .multi-popup{will-change:transform;}
 .multi-popup{position:fixed;display:flex;flex-direction:column;isolation:isolate;box-sizing:border-box;width:320px;min-width:0;padding:0;border:1px solid var(--vyp-ha-border,var(--wa-color-surface-border,#e6e6e6));border-radius:8px;background:var(--vyp-ha-surface-raised,var(--card-background-color,#fff));color:var(--vyp-ha-text,var(--primary-text-color,#141414));box-shadow:var(--wa-shadow-m,0 3px 6px -1px #0000001a,0 8px 16px -2px #00000026);overflow:hidden;overscroll-behavior:contain;font:400 14px/1.6 var(--vyp-ha-font-family,var(--ha-font-family-body,Roboto,Noto,sans-serif));}
 #multi-options{min-height:0;overflow:auto;overscroll-behavior:contain;}
 .multi-search-wrap{flex:none;padding:16px 12px 12px;}.multi-search-box{position:relative;display:flex;align-items:center;box-sizing:border-box;width:100%;height:40px;padding-inline:8px;border:1px solid var(--vyp-ha-primary,var(--primary-color,#00639c));border-radius:8px;background:var(--vyp-ha-surface-raised,var(--card-background-color,#fff));font:400 14px/1.2 var(--vyp-ha-font-family,var(--ha-font-family-body,Roboto,Noto,sans-serif));}
 .multi-search-box .multi-icon{width:18px;height:18px;}.multi-search-input{box-sizing:border-box;flex:1;min-width:0;width:100%;height:38px;padding:0;padding-inline-start:4px;border:0;outline:0;background:transparent;color:inherit;font:400 14px/1.2 var(--vyp-ha-font-family,var(--ha-font-family-body,Roboto,Noto,sans-serif));}
 .multi-search-input::placeholder{color:var(--vyp-ha-search-placeholder,var(--ha-color-text-disabled,#989898));opacity:1;}
 .multi-search-clear-space{flex:none;width:24px;}.multi-search-clear{position:absolute;inset-inline-end:-2px;top:-3px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;color:var(--vyp-ha-search-placeholder,var(--wa-form-control-placeholder-color,#5e5e5e));cursor:pointer;}.multi-search-clear:focus-visible{outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px #989898));outline-offset:-4px;}
 .multi-option{box-sizing:border-box;display:flex;align-items:center;min-height:48px;padding-inline:16px;cursor:pointer;overflow:hidden;}.multi-option-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
 .multi-option[data-active],.multi-option:hover:not([aria-disabled=true]){background:var(--ha-color-fill-neutral-normal-resting,#e6e6e6);}.multi-option[aria-disabled=true]{opacity:.38;cursor:not-allowed;}
 .multi-empty{box-sizing:border-box;display:flex;align-items:center;gap:16px;min-height:48px;padding:12px 16px;line-height:24px;}.multi-empty .multi-icon{width:24px;height:24px;color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#5e5e5e));}.multi-empty-label{flex:1;min-width:0;line-height:22.4px;}
`;
/** Core-owned chip/search presentation. The owner remains the sole native-form and controlled-value bridge. */
export class SelectChips implements ReactiveController {
 #frame:Frame|null=null;#rendered:Frame|null=null;#opened=false;#query='';#active=-1;#dialog:SelectionDialog;
 constructor(private readonly host:Host,private readonly propose:(value:readonly SelectValue[])=>void,private readonly enabled:()=>boolean){host.addController(this);this.#dialog=new SelectionDialog(host,()=>this.close());}
 get #root():ShadowRoot{return this.host.shadowRoot!;}
 #valid(frame:Frame):boolean{return this.host.isConnected&&this.#frame===frame&&this.#rendered===frame&&frame.state===this.host.state&&frame.value===this.host.value&&!frame.disabled&&this.enabled();}
 #values(frame:Frame):readonly SelectValue[]{return typeof frame.value==='object'?frame.value??[]:[];}
 #choices(frame:Frame):readonly number[]{return multipleSelectOptions(frame.state.options,frame.value,this.#query);}
 #unavailable(frame:Frame,index:number):boolean{return frame.state.options[index].disabled||this.#values(frame).length>=256;}
 close():void{this.#dialog.close();if(this.#opened||this.#query){this.#opened=false;this.#query='';this.#active=-1;this.host.requestUpdate();}}
 focus(options?:FocusOptions):boolean{if(!this.#opened)return false;this.#root.querySelector<HTMLInputElement>('#multi-search')?.focus(options);return true;}
 #show(frame:Frame,origin:EventTarget|null):void{
  if(!this.#valid(frame)||origin!==this.#root.querySelector('#control'))return;
  this.#opened=true;this.#query='';this.#active=-1;this.host.requestUpdate();
 }
 #input(frame:Frame,event:Event):void{
  if(!this.#valid(frame)||!this.#opened||event.currentTarget!==this.#root.querySelector('#multi-search'))return;
  this.#query=(event.currentTarget as HTMLInputElement).value;this.#active=-1;this.host.requestUpdate();
 }
 #clear(frame:Frame,origin:EventTarget|null):void{
  if(!this.#valid(frame)||!this.#opened||origin!==this.#root.querySelector('.multi-search-clear'))return;
  this.#root.querySelector<HTMLInputElement>('#multi-search')!.focus();if(!this.#valid(frame))return;
  this.#query='';this.#active=-1;this.host.requestUpdate();
 }
 #remove(frame:Frame,index:number,origin:EventTarget|null):void{
  if(!this.#valid(frame)||origin!==this.#root.getElementById('multi-remove-'+index))return;
  // A current rendered removal index belongs to this immutable model snapshot.
  const next=changeMultipleSelection(frame.value,this.#values(frame)[index],'remove')!;
  this.#root.querySelector<HTMLButtonElement>('#control')!.focus();if(this.#valid(frame))this.propose(next);
 }
 #choose(frame:Frame,index:number,origin?:EventTarget|null):void{
  if(!this.#valid(frame)||!this.#opened||!this.#dialog.opened||!this.#choices(frame).includes(index)||frame.state.options[index].disabled)return;
  if(origin!==undefined&&origin!==this.#root.getElementById('multi-option-'+index))return;
  const next=changeMultipleSelection(frame.value,frame.state.options[index].value,'add');if(next===null)return;
  this.close();if(this.#valid(frame))this.propose(next);
 }
 #key(frame:Frame,event:KeyboardEvent):void{
  if(!this.#valid(frame)||!this.#opened||event.currentTarget!==this.#root.querySelector('#multi-search')||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='Enter'){event.preventDefault();if(this.#active>=0)this.#choose(frame,this.#active);return;}
  const movement=event.key==='ArrowDown'?'next':event.key==='ArrowUp'?'previous':event.key==='Home'&&this.#active>=0?'first':event.key==='End'&&this.#active>=0?'last':null;
  if(movement===null)return;event.preventDefault();const choices=this.#choices(frame),options=choices.map(index=>({...frame.state.options[index],disabled:this.#unavailable(frame,index)}));
  const selected=moveSelectOption(options,choices.indexOf(this.#active),movement);this.#active=selected<0?-1:choices[selected];this.host.requestUpdate();
 }
 hostUpdated():void{
  this.#rendered=this.#frame;if(!this.#opened)return;
  if(!this.#dialog.opened)this.#dialog.show(this.#root.querySelector('.multi-add-wrap')!,this.#root.querySelector('#multi-dialog')!,this.#root.querySelector('.multi-popup')!);else this.#dialog.position();
  this.#root.getElementById('multi-option-'+this.#active)?.scrollIntoView({block:'nearest'});
 }
 hostConnected():void{this.host.requestUpdate();}
 hostDisconnected():void{this.close();this.#rendered=null;}
 render(state:SelectState,value:SelectSelection,disabled:boolean,described:string,invalid:boolean){
  const frame:Frame={state,value,disabled};this.#frame=frame;const values=this.#values(frame),choices=this.#choices(frame);
  described=[described,state.required?'multi-required':''].filter(Boolean).join(' ');
  return html`<div class="multi" part="multiple" role="group" aria-label=${state.label} aria-disabled=${String(disabled)} aria-invalid=${String(invalid)} aria-describedby=${described||nothing}>
   <label class="accessible-label" for="control">${state.label}</label>
   ${state.required?html`<span class="accessible-label" id="multi-required">${state.requiredMessage}</span>`:nothing}
   ${values.length?html`<div class="multi-chips" part="chips" role="list" aria-label=${state.label}>${values.map((item,index)=>{const label=state.options.find(option=>option.value===item)?.label??state.unavailableMessage;return html`<div class="multi-chip" part="chip" role="listitem" ?data-disabled=${disabled}><span class="multi-chip-label">${label}</span><button class="multi-remove" part="remove" id=${'multi-remove-'+index} type="button" ?disabled=${disabled} aria-label=${state.removeLabel+' '+label} @click=${(event:MouseEvent)=>this.#remove(frame,index,event.currentTarget)}><span class="multi-remove-paint" part="remove-surface">${icon(closePath)}</span></button></div>`;})}</div>`:nothing}
   <div class="multi-add-wrap"><button class="multi-add" id="control" part="select" type="button" ?disabled=${disabled} aria-label=${state.label} aria-haspopup="dialog" aria-expanded=${String(this.#opened)} aria-controls="multi-dialog" aria-invalid=${String(invalid)} aria-describedby=${described||nothing} @click=${(event:MouseEvent)=>this.#show(frame,event.currentTarget)}><span class="multi-add-paint" part="action">${icon(addPath)}<span class="multi-add-label">${state.label}</span></span></button></div>
   <dialog class="multi-dialog" id="multi-dialog" aria-label=${state.label} aria-modal="true"><div class="multi-popup" part="popup">
    <div class="multi-search-wrap"><div class="multi-search-box">${icon(searchPath)}<input class="multi-search-input" id="multi-search" part="search" type="text" role="combobox" aria-label=${state.searchLabel} aria-describedby=${described||nothing} aria-required=${String(state.required&&values.length===0)} placeholder=${state.searchPlaceholder} maxlength="256" autocomplete="off" autofocus aria-autocomplete="list" aria-expanded=${String(this.#opened)} aria-controls="multi-options" aria-activedescendant=${this.#active>=0?'multi-option-'+this.#active:nothing} .value=${this.#query} @input=${(event:Event)=>this.#input(frame,event)} @keydown=${(event:KeyboardEvent)=>this.#key(frame,event)}>${this.#query?html`<span class="multi-search-clear-space"></span><button class="multi-search-clear" type="button" aria-label=${state.clearLabel} @click=${(event:MouseEvent)=>this.#clear(frame,event.currentTarget)}>${icon(closePath)}</button>`:nothing}</div></div>
    <div id="multi-options" role="listbox" aria-label=${state.label}>${choices.map(index=>html`<div class="multi-option" part="option" id=${'multi-option-'+index} role="option" aria-selected="false" aria-disabled=${String(this.#unavailable(frame,index))} ?data-active=${this.#active===index} @pointerdown=${(event:PointerEvent)=>event.preventDefault()} @click=${(event:MouseEvent)=>this.#choose(frame,index,event.currentTarget)}><span class="multi-option-label">${state.options[index].label}</span></div>`)}</div>
    ${choices.length===0?html`<div class="multi-empty" role="status">${icon(searchPath)}<span class="multi-empty-label">${this.#query?state.notFoundMessage:state.emptyMessage}</span></div>`:nothing}
   </div></dialog>
  </div>`;
 }
}
