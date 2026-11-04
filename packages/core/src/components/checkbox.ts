import {LitElement,css,html,nothing} from 'lit';
import {implicitSubmit} from './implicit-submit.js';
import {CheckboxInputError,checkboxState,checkboxChecked,checkboxName,checkboxValue,checkboxValidity,checkboxRestoreState,checkboxRestoreValue,type CheckboxState,type CheckboxChangeReason,type CheckboxChangeDetail} from '../checkbox-contracts.js';
export type {CheckboxChangeReason,CheckboxChangeDetail} from '../checkbox-contracts.js';
export type CheckboxChangeEvent=CustomEvent<CheckboxChangeDetail>;
const nameAttribute={fromAttribute:(raw:string|null)=>raw??''},valueAttribute={fromAttribute:(raw:string|null)=>raw??'on'};
/** One controlled native checkbox; mixed presentation and household policy stay with the app. */
export class HaCheckbox extends LitElement {
 static formAssociated=true;static shadowRootOptions={...LitElement.shadowRootOptions,delegatesFocus:true};
 static properties={state:{attribute:false,noAccessor:true},checked:{attribute:false,noAccessor:true},defaultChecked:{attribute:'checked',type:Boolean,noAccessor:true},name:{converter:nameAttribute,noAccessor:true},value:{converter:valueAttribute,noAccessor:true},disabled:{type:Boolean,noAccessor:true},indeterminate:{attribute:false,noAccessor:true}};
 // Visual geometry follows the measured HA ha-checkbox; source and icon notices ship with the package.
 static styles=css`
  :host{display:block;min-width:0;font:400 14px/1.2 var(--vyp-ha-font-family,var(--ha-font-family-body,var(--primary-font-family,Roboto,Noto,sans-serif)));color:var(--vyp-ha-text,var(--primary-text-color,#141414));-webkit-tap-highlight-color:transparent;}
  .field{display:grid;gap:7px;}.row{display:flex;align-items:center;gap:8px;min-height:20px;cursor:pointer;user-select:none;}.copy{min-width:0;line-height:1;overflow-wrap:anywhere;}
  .control{box-sizing:border-box;display:inline-flex;position:relative;flex:0 0 var(--ha-checkbox-size,20px);width:var(--ha-checkbox-size,20px);height:var(--ha-checkbox-size,20px);align-items:center;justify-content:center;border:var(--ha-checkbox-border-width,var(--ha-border-width-md,2px)) solid var(--ha-checkbox-border-color,var(--ha-color-border-neutral-normal,#989898));border-radius:var(--ha-checkbox-border-radius,var(--ha-border-radius-sm,4px));background:var(--ha-checkbox-background-color,transparent);}
  input{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);box-sizing:border-box;width:44px;height:44px;min-width:var(--ha-checkbox-min-touch-size,44px);min-height:var(--ha-checkbox-min-touch-size,44px);margin:0;padding:0;opacity:0;cursor:inherit;}
  .control:has(input:checked,input:indeterminate){background:var(--ha-checkbox-checked-background-color,var(--ha-color-fill-primary-loud-resting,var(--primary-color,#009ac7)));border-color:var(--ha-checkbox-checked-background-color,var(--ha-color-fill-primary-loud-resting,var(--primary-color,#009ac7)));color:var(--ha-checkbox-checked-icon-color,var(--ha-color-on-primary-loud,#fff));}
  .control:has(input:focus-visible:not(:disabled)){outline:var(--wa-focus-ring,solid 2px #989898);outline-offset:var(--wa-focus-ring-offset,2px);}
  .row:has(input:not(:disabled)):hover .control{background:var(--ha-checkbox-background-color-hover,var(--ha-color-form-background-hover,#e6e6e6));border-color:var(--ha-checkbox-border-color-hover,var(--ha-checkbox-border-color,var(--ha-color-border-neutral-loud,#5e5e5e)));}
  .row:has(input:checked:not(:disabled)):hover .control,.row:has(input:indeterminate:not(:disabled)):hover .control{background:var(--ha-checkbox-checked-background-color-hover,var(--ha-color-fill-primary-loud-hover,#006787));border-color:var(--ha-checkbox-checked-background-color-hover,var(--ha-color-fill-primary-loud-hover,#006787));}
  .icon{width:14px;height:14px;scale:var(--ha-checkbox-checked-icon-scale,.9);pointer-events:none;}.control:has(input:not(:checked):not(:indeterminate)) .icon{visibility:hidden;}.disabled{opacity:.5;cursor:not-allowed;}
  .required{margin-inline-start:var(--ha-checkbox-required-marker-offset,.1rem);}.required::after{content:var(--ha-checkbox-required-marker,"*");}
  .help,.error{font-size:var(--ha-font-size-xs,10px);line-height:1.2;}.help{color:var(--ha-color-text-secondary,var(--vyp-ha-text-secondary,var(--secondary-text-color,#5e5e5e)));}.error{color:var(--vyp-ha-danger,var(--ha-color-on-danger-quiet,var(--error-color,#b3261e)));}
 `;
 #connection=0;#internals=this.attachInternals();#state=checkboxState({label:'Value'});#checked=false;#defaultChecked=false;#value='on';#name='';#disabled=false;#formDisabled=false;#dirty=false;#customError='';#showValidation=false;
 #pending:{checked:boolean;reason:CheckboxChangeReason}|null=null;#fromAttribute=false;#restoringAttribute=false;
 constructor(){super();this.addEventListener('invalid',this.#reveal);}
  connectedCallback():void{super.connectedCallback();this.#connection++;}
  disconnectedCallback():void{this.#connection++;super.disconnectedCallback();}
 attributeChangedCallback(name:string,previous:string|null,next:string|null):void{
  if(this.#restoringAttribute)return;
  try{if(name==='name')checkboxName(next??'');else if(name==='value')checkboxValue(next??'on');}catch(error){this.#restoringAttribute=true;if(previous===null)this.removeAttribute(name);else this.setAttribute(name,previous);this.#restoringAttribute=false;throw error;}
  this.#fromAttribute=true;super.attributeChangedCallback(name,previous,next);this.#fromAttribute=false;
 }
 get #input():HTMLInputElement|null{return this.shadowRoot?.querySelector('input')??null;}
 get state():CheckboxState{return this.#state;}
 set state(raw:CheckboxState){const next=checkboxState(raw),previous=this.#state;this.#state=next;this.#sync();this.requestUpdate('state',previous);}
 get checked():boolean{return this.#checked;}
 set checked(raw:boolean){const next=checkboxChecked(raw),previous=this.#checked;this.#dirty=!(this.#pending?.reason==='reset'&&this.#pending.checked===next);this.#checked=next;this.#pending=null;this.#sync();this.requestUpdate('checked',previous);}
 get defaultChecked():boolean{return this.#defaultChecked;}
 set defaultChecked(raw:boolean){const next=checkboxChecked(raw);if(next===this.#defaultChecked)return;this.#defaultChecked=next;if(!this.#dirty)this.#checked=next;if(!this.#fromAttribute)this.toggleAttribute('checked',next);this.#sync();this.requestUpdate();}
 get value():string{return this.#value;}
 set value(raw:string){const next=checkboxValue(raw);if(next===this.#value)return;this.#value=next;if(!this.#fromAttribute)this.setAttribute('value',next);this.#sync();}
 get name():string{return this.#name;}
 set name(raw:string){const next=checkboxName(raw);if(next===this.#name)return;this.#name=next;if(!this.#fromAttribute)this.setAttribute('name',next);this.#sync();}
 get disabled():boolean{return this.#disabled;}
 set disabled(raw:boolean){const next=checkboxChecked(raw);if(next===this.#disabled)return;this.#disabled=next;this.toggleAttribute('disabled',next);this.#sync();this.requestUpdate();}
 get indeterminate():boolean{return this.state.indeterminate;}
 set indeterminate(raw:boolean){const next=checkboxChecked(raw);if(next===this.indeterminate)return;this.state=checkboxState({...this.state,indeterminate:next});}
 get form():HTMLFormElement|null{return this.#internals.form;}
 get labels():NodeListOf<HTMLLabelElement>{return this.#internals.labels as NodeListOf<HTMLLabelElement>;}
 get validity():ValidityState{return this.#internals.validity;}
 get validationMessage():string{return this.#internals.validationMessage;}
 get willValidate():boolean{return this.#internals.willValidate;}
 checkValidity():boolean{this.#reveal();return this.#internals.checkValidity();}
 reportValidity():boolean{this.#reveal();return this.#internals.reportValidity();}
 setCustomValidity(message:string):void{checkboxValidity(this.checked,this.state,message);this.#customError=message;this.#sync();this.requestUpdate();}
 focus(options?:FocusOptions):void{this.#input?.focus(options);}
 blur():void{this.#input?.blur();}
 click():void{this.#input?.click();}
 formDisabledCallback(disabled:boolean):void{this.#formDisabled=disabled;this.#sync();this.requestUpdate();}
 formResetCallback():void{this.#showValidation=false;this.#request(this.defaultChecked,'reset');this.requestUpdate();}
 formStateRestoreCallback(raw:string|File|FormData,mode:'restore'|'autocomplete'):void{if(mode!=='restore'&&mode!=='autocomplete')throw new CheckboxInputError();this.#request(checkboxRestoreValue(raw),mode);}
 #sync():void{
  const disabled=this.disabled||this.#formDisabled,control=this.#input,validity=checkboxValidity(this.checked,this.state,this.#customError);
  this.#internals.setFormValue(disabled||!this.checked?null:this.value,checkboxRestoreState(this.checked));this.#internals.setValidity(validity.flags,validity.message,control??undefined);
  if(control!==null){control.disabled=disabled;control.checked=this.checked;control.indeterminate=this.indeterminate;control.value=this.value;}
 }
 protected updated():void{this.#sync();}
 #reveal():void{this.#showValidation=true;this.#sync();this.requestUpdate();}
 #request(raw:unknown,reason:CheckboxChangeReason):void{try{const checked=checkboxChecked(raw);this.#pending={checked,reason};this.dispatchEvent(new CustomEvent('ha-check-request',{detail:Object.freeze({checked,reason}),bubbles:true,composed:true,cancelable:true}));}finally{this.#sync();}}
 #change():void{if(this.disabled||this.#formDisabled){this.#sync();return;}this.#dirty=true;this.#request(this.#input!.checked,'change');}
 #click():void{this.#dirty=true;setTimeout(()=>this.#sync());}
 #enter(event:KeyboardEvent):void{
  if(!event.isTrusted||event.key!=='Enter'||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
  const form=this.form,connection=this.#connection;setTimeout(()=>{if(connection!==this.#connection||event.defaultPrevented||this.disabled||this.#formDisabled||form===null||this.form!==form)return;implicitSubmit(form);});
 }
 protected render(){
  const state=this.state,validity=checkboxValidity(this.checked,state,this.#customError),message=(this.#showValidation||state.error||this.#customError)?validity.message:'',described=[state.description?'help':'',message?'error':''].filter(Boolean).join(' '),disabled=this.disabled||this.#formDisabled;
  return html`<div class="field" part="field"><label class=${disabled?'row disabled':'row'} part="row" for="control"><span class="control" part="control"><input id="control" type="checkbox" part="input" ?required=${state.required} aria-invalid=${String(!!message)} aria-describedby=${described||nothing} @change=${this.#change} @click=${this.#click} @keydown=${this.#enter} @blur=${this.#reveal}>
    ${state.indeterminate?html`<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.428571 8h9.142857" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"></path></svg>`:html`<svg class="icon" viewBox="0 0 448 512" aria-hidden="true"><!-- Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path fill="currentColor" d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"></path></svg>`}
   </span><span class="copy" part="label">${state.label}${state.required?html`<span class="required" aria-hidden="true"></span>`:nothing}</span></label>
   ${state.description?html`<div class="help" id="help" part="help">${state.description}</div>`:nothing}${message?html`<div class="error" id="error" part="error" aria-live="polite">${message}</div>`:nothing}</div>`;
 }
}
export function registerCheckbox(registry:CustomElementRegistry|undefined=globalThis.customElements):void{
 if(registry===undefined||typeof document==='undefined')throw new Error('registerCheckbox requires a browser CustomElementRegistry');
 const current=registry.get('vyp-ha-checkbox');if(current!==undefined&&current!==HaCheckbox)throw new Error('vyp-ha-checkbox registration conflict; use one reviewed package cohort');if(current===undefined)registry.define('vyp-ha-checkbox',HaCheckbox);
}
declare global{interface HTMLElementTagNameMap{'vyp-ha-checkbox':HaCheckbox;}interface HTMLElementEventMap{'ha-check-request':CheckboxChangeEvent;}}
