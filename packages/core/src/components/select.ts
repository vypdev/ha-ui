import {LitElement,css,html,nothing} from 'lit';
import {SelectInputError,selectState,selectSelection,selectName,selectValidity,selectEntries,selectRestoreState,selectRestoreValue,type SelectState,type SelectSelection,type SelectValueReason,type SelectValueDetail} from '../select-contracts.js';
export type {SelectValueDetail,SelectValueReason} from '../select-contracts.js';
export type SelectValueEvent=CustomEvent<SelectValueDetail>;
const attributeName={fromAttribute:(value:string|null)=>value??''};
/** Controlled typed single/multiple selection; one native renderer and one native form bridge. */
export class HaSelect extends LitElement {
 static formAssociated=true;
 static shadowRootOptions={...LitElement.shadowRootOptions,delegatesFocus:true};
 static properties={state:{attribute:false,noAccessor:true},value:{attribute:false,noAccessor:true},defaultValue:{attribute:false,noAccessor:true},name:{converter:attributeName,noAccessor:true},disabled:{type:Boolean,noAccessor:true}};
 // Geometry adapted from Gateway's MIT field/select catalog; semantic behavior is authored here.
 static styles=css`
  :host{display:block;min-width:0;font:400 14px/1.35 var(--vyp-ha-font-family,var(--primary-font-family,Roboto,Noto,sans-serif));color:var(--vyp-ha-text,var(--primary-text-color,#1c1c1c));}
  .field{display:grid;gap:6px;}label{font-size:14px;line-height:1.35;}
  select{box-sizing:border-box;width:100%;min-width:0;min-height:56px;border:1px solid var(--vyp-ha-border,var(--divider-color,#e0e0e0));border-radius:var(--vyp-ha-field-radius,4px);padding:16px;color:inherit;background:var(--vyp-ha-surface,var(--card-background-color,#fff));font:inherit;}
  select:focus-visible{outline:2px solid var(--vyp-ha-primary,var(--primary-color,#0075b5));outline-offset:1px;}
  select:disabled{opacity:.5;cursor:not-allowed;}select[aria-invalid=true]{border-color:var(--vyp-ha-danger,var(--error-color,#b3261e));}
  .help,.error{font-size:12px;line-height:1.35;}.help{color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#595959));}.error{color:var(--vyp-ha-danger,var(--error-color,#b3261e));}
 `;
 #internals=this.attachInternals();#state=selectState({label:'Value',options:[]});#renderedState:SelectState|null=null;
 #value:SelectSelection=null;#defaultValue:SelectSelection=null;#name='';#disabled=false;#formDisabled=false;#dirty=false;#showValidation=false;#customError='';
 #pending:{reason:SelectValueReason;serialized:string}|null=null;#fromAttribute=false;#restoringAttribute=false;
 constructor(){super();this.addEventListener('invalid',this.#reveal);}
 attributeChangedCallback(name:string,previous:string|null,next:string|null):void{
  if(this.#restoringAttribute)return;
  try{if(name==='name')selectName(next??'');}catch(error){this.#restoringAttribute=true;if(previous===null)this.removeAttribute(name);else this.setAttribute(name,previous);this.#restoringAttribute=false;throw error;}
  this.#fromAttribute=true;super.attributeChangedCallback(name,previous,next);this.#fromAttribute=false;
 }
 get #control():HTMLSelectElement|null{return this.shadowRoot?.querySelector('select')??null;}
 get state():SelectState{return this.#state;}
 set state(raw:SelectState){const next=selectState(raw),previous=this.#state;this.#state=next;this.#sync();this.requestUpdate('state',previous);}
 get value():SelectSelection{return this.#value;}
 set value(raw:SelectSelection){const next=selectSelection(raw),previous=this.#value;this.#dirty=!(this.#pending?.reason==='reset'&&this.#pending.serialized===selectRestoreState(next));this.#value=next;this.#pending=null;this.#sync();this.requestUpdate('value',previous);}
 get defaultValue():SelectSelection{return this.#defaultValue;}
 set defaultValue(raw:SelectSelection){const next=selectSelection(raw);if(selectRestoreState(next)===selectRestoreState(this.#defaultValue))return;this.#defaultValue=next;if(!this.#dirty){this.#value=next;this.#sync();this.requestUpdate();}}
 get name():string{return this.#name;}
 set name(raw:string){const next=selectName(raw);if(next===this.#name)return;this.#name=next;if(!this.#fromAttribute)this.setAttribute('name',next);this.#sync();}
 get disabled():boolean{return this.#disabled;}
 set disabled(raw:boolean){if(typeof raw!=='boolean')throw new SelectInputError();if(raw===this.#disabled)return;this.#disabled=raw;this.toggleAttribute('disabled',raw);this.#sync();this.requestUpdate();}
 get form():HTMLFormElement|null{return this.#internals.form;}
 get labels():NodeListOf<HTMLLabelElement>{return this.#internals.labels as NodeListOf<HTMLLabelElement>;}
 get validity():ValidityState{return this.#internals.validity;}
 get validationMessage():string{return this.#internals.validationMessage;}
 get willValidate():boolean{return this.#internals.willValidate;}
 checkValidity():boolean{this.#reveal();return this.#internals.checkValidity();}
 reportValidity():boolean{this.#reveal();return this.#internals.reportValidity();}
 setCustomValidity(message:string):void{selectValidity(this.value,this.state,message);this.#customError=message;this.#sync();this.requestUpdate();}
 focus(options?:FocusOptions):void{this.#control?.focus(options);}
 blur():void{this.#control?.blur();}
 formDisabledCallback(disabled:boolean):void{this.#formDisabled=disabled;this.#sync();this.requestUpdate();}
 formResetCallback():void{this.#showValidation=false;this.#request(this.defaultValue,'reset');this.requestUpdate();}
 formStateRestoreCallback(raw:string|File|FormData,mode:'restore'|'autocomplete'):void{if(mode!=='restore'&&mode!=='autocomplete')throw new SelectInputError();this.#request(selectRestoreValue(raw),mode);}
 #sync():void{
  const state=this.state,disabled=this.disabled||this.#formDisabled,entries=selectEntries(this.value,state),restoration=selectRestoreState(this.value),control=this.#control;
  if(disabled||!this.name||entries.length===0)this.#internals.setFormValue(null,restoration);
  else if(state.multiple){const data=new FormData();for(const value of entries)data.append(this.name,value);this.#internals.setFormValue(data,restoration);}
  else this.#internals.setFormValue(entries[0],restoration);
  const validity=selectValidity(this.value,state,this.#customError);this.#internals.setValidity(validity.flags,validity.message,control??undefined);
  if(control!==null){
   control.disabled=disabled;control.multiple=state.multiple;control.size=state.size;
   const value=this.value,selected=typeof value==='object'?value??[]:[value],compatible=value===null||Array.isArray(value)===state.multiple;
   const indexes=new Set(compatible?state.options.flatMap((option,index)=>selected.includes(option.value)?[String(index)]:[]):[]);
   for(const option of control.options)option.selected=indexes.has(option.value);
   if(!state.multiple)control.value=indexes.values().next().value??'';
  }
 }
 protected updated():void{this.#sync();this.#renderedState=this.state;}
 #reveal():void{this.#showValidation=true;this.#sync();this.requestUpdate();}
 #request(raw:unknown,reason:SelectValueReason):void{
  try{const value=selectSelection(raw);this.#pending={reason,serialized:selectRestoreState(value)};this.dispatchEvent(new CustomEvent('ha-select-request',{detail:Object.freeze({value,reason}),bubbles:true,composed:true,cancelable:true}));}finally{this.#sync();}
 }
 #change():void{
  if(this.disabled||this.#formDisabled||this.#renderedState!==this.state){this.#sync();return;}
  try{
   const values=[];
   for(const option of this.#control!.selectedOptions){
    if(option.value==='')continue;
    if(!/^(0|[1-9]\d*)$/u.test(option.value))throw new SelectInputError();
    const item=this.state.options[Number(option.value)];if(item===undefined||item.disabled)throw new SelectInputError();values.push(item.value);
   }
   this.#dirty=true;this.#request(this.state.multiple?values:values[0]??null,'change');
  }finally{this.#sync();}
 }
 protected render(){
  const state=this.state,validity=selectValidity(this.value,state,this.#customError),message=(this.#showValidation||state.error||this.#customError)?validity.message:'';
  const described=[state.description?'help':'',message?'error':''].filter(Boolean).join(' ');
  return html`<div class="field" part="field"><label part="label" for="control">${state.label}</label>
   <select id="control" part="select" ?multiple=${state.multiple} size=${state.size} ?required=${state.required} aria-invalid=${String(!!message)} aria-describedby=${described||nothing} @change=${this.#change} @blur=${this.#reveal}>
    ${!state.multiple?html`<option value="" ?disabled=${state.required}>${state.placeholder}</option>`:nothing}
    ${state.options.map((option,index)=>html`<option value=${String(index)} ?disabled=${option.disabled}>${option.label}</option>`)}
    ${state.multiple&&state.options.length===0?html`<option value="" disabled>${state.emptyMessage}</option>`:nothing}
   </select>
   ${state.description?html`<div class="help" id="help" part="help">${state.description}</div>`:nothing}
   ${message?html`<div class="error" id="error" part="error" aria-live="polite">${message}</div>`:nothing}</div>`;
 }
}
export function registerSelect(registry:CustomElementRegistry|undefined=globalThis.customElements):void{
 if(registry===undefined||typeof document==='undefined')throw new Error('registerSelect requires a browser CustomElementRegistry');
 const current=registry.get('vyp-ha-select');if(current!==undefined&&current!==HaSelect)throw new Error('vyp-ha-select registration conflict; use one reviewed package cohort');if(current===undefined)registry.define('vyp-ha-select',HaSelect);
}
declare global{interface HTMLElementTagNameMap{'vyp-ha-select':HaSelect;}interface HTMLElementEventMap{'ha-select-request':SelectValueEvent;}}
