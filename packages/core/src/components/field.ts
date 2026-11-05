import {LitElement,css,html,nothing} from 'lit';
import {implicitSubmit,trackImplicitBlocker} from './implicit-submit.js';
import {FieldInputError,textFieldName,textFieldState,textFieldValue,textFieldValidity,type TextFieldState,type FieldValueReason,type FieldValueDetail} from '../field-contracts.js';

export type {FieldValueReason,FieldValueDetail} from '../field-contracts.js';
export type FieldValueEvent=CustomEvent<FieldValueDetail>;
type Proposal={value:string;reason:FieldValueReason;start:number|null;end:number|null;direction:'forward'|'backward'|'none'|null};
const attributeText={fromAttribute:(value:string|null)=>value??''};
function boolean(value:unknown):boolean {if(typeof value!=='boolean')throw new FieldInputError();return value;}

/** A controlled single-line field with native form ownership and constraint validation. */
export class HaTextField extends LitElement {
  static formAssociated=true;
  static shadowRootOptions={...LitElement.shadowRootOptions,delegatesFocus:true};
  static properties={state:{attribute:false,noAccessor:true},value:{attribute:false,noAccessor:true},
    defaultValue:{attribute:'value',converter:attributeText,noAccessor:true},name:{converter:attributeText,noAccessor:true},
    disabled:{type:Boolean,noAccessor:true},readOnly:{attribute:'readonly',type:Boolean,noAccessor:true}};
  static get observedAttributes(){return [...super.observedAttributes,'form'];}
  // Material input geometry adapts the public HA input styles; see NOTICE.
  static styles=css`
    :host{display:block;min-width:0;padding-top:var(--ha-input-padding-top,0px);padding-bottom:var(--ha-input-padding-bottom,var(--ha-space-2,8px));font:var(--ha-font-weight-normal,400) var(--ha-font-size-m,14px)/var(--ha-line-height-normal,1.6) var(--vyp-ha-font-family,var(--ha-font-family-body,var(--primary-font-family,Roboto,Noto,sans-serif)));color:var(--vyp-ha-text,var(--primary-text-color,#141414));text-align:var(--ha-input-text-align,start);}
    :host([hidden]){display:none;}
    .field{position:relative;min-width:0;}
    .control{position:relative;display:flex;align-items:center;box-sizing:border-box;height:56px;padding:0 var(--ha-space-4,16px);border:0;border-radius:var(--vyp-ha-field-radius,var(--ha-border-radius-sm,4px) var(--ha-border-radius-sm,4px) var(--ha-border-radius-square,0px) var(--ha-border-radius-square,0px));background:var(--vyp-ha-surface,var(--ha-color-form-background,var(--card-background-color,#f3f3f3)));line-height:var(--ha-line-height-condensed,1.2);transition:background-color var(--vyp-ha-motion-duration,var(--ha-animation-duration-normal,250ms)) ease-in-out;}
    .control::after{content:'';position:absolute;inset-inline:0;bottom:0;height:1px;background:var(--vyp-ha-border,var(--ha-color-border-neutral-loud,var(--divider-color,#5e5e5e)));transition:height var(--vyp-ha-motion-duration,var(--ha-animation-duration-normal,250ms)) ease-in-out,background-color var(--vyp-ha-motion-duration,var(--ha-animation-duration-normal,250ms)) ease-in-out;pointer-events:none;}
    .label{position:absolute;top:0;inset-inline-start:0;max-width:100%;z-index:1;box-sizing:border-box;padding:var(--ha-space-5,20px) var(--ha-space-4,16px) 0;margin:0 0 .5em;font-weight:var(--ha-font-weight-normal,400);font-size:var(--ha-font-size-m,14px);line-height:var(--ha-line-height-condensed,1.2);color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#5e5e5e));pointer-events:none;transition:padding-top var(--vyp-ha-motion-duration,var(--ha-animation-duration-normal,250ms)) ease-in-out,font-size var(--vyp-ha-motion-duration,var(--ha-animation-duration-normal,250ms)) ease-in-out,color var(--vyp-ha-motion-duration,var(--ha-animation-duration-normal,250ms)) ease-in-out;}
    .field[data-raised] .label,:host(:focus-within) .label{padding-top:var(--ha-space-3,12px);font-size:var(--ha-font-size-xs,10px);}
    :host(:focus-within) .label{color:var(--vyp-ha-primary,var(--primary-color,#00639c));}
    :host(:focus-within) .control::after{height:2px;background:var(--vyp-ha-primary,var(--primary-color,#00639c));}
    input{box-sizing:border-box;flex:1;width:100%;min-width:0;min-height:56px;height:56px;margin:0;padding:var(--ha-space-3,12px) 0 0;border:0;border-radius:0;outline:none;background:transparent;color:inherit;font:inherit;text-align:inherit;}
    input::placeholder{color:var(--vyp-ha-placeholder,var(--ha-color-neutral-60,var(--vyp-ha-text-secondary,var(--secondary-text-color,#666))));opacity:1;}
    .control:hover{background:var(--vyp-ha-surface-hover,var(--vyp-ha-surface,var(--ha-color-form-background-hover,var(--card-background-color,#e6e6e6))));}
    .field[data-disabled] .control{opacity:.5;cursor:not-allowed;background:var(--vyp-ha-surface-disabled,var(--vyp-ha-surface,var(--ha-color-form-background-disabled,var(--card-background-color,#ccc))));}
    .field[data-disabled] .label{opacity:.5;}input:disabled{cursor:not-allowed;}
    .field[data-invalid]:not([data-disabled]) .label{color:var(--vyp-ha-danger,var(--ha-color-fill-danger-loud-resting,var(--error-color,#b3261e)));}
    .field[data-invalid]:not([data-disabled]) .control::after{background:var(--vyp-ha-danger,var(--ha-color-border-danger-normal,var(--error-color,#b3261e)));}
    .hint{display:flex;flex-direction:column;justify-content:center;align-items:stretch;min-width:0;height:0;min-height:0;margin:0 0 0 var(--ha-space-3,12px);font-size:var(--ha-font-size-s,12px);line-height:var(--ha-line-height-normal,1.6);color:var(--vyp-ha-text-secondary,var(--ha-color-text-secondary,var(--secondary-text-color,#5e5e5e)));}
    .hint[data-visible]{height:auto;min-height:var(--ha-space-5,20px);}
    .help,.error{font:inherit;overflow-wrap:anywhere;}.error{color:var(--vyp-ha-danger,var(--ha-color-on-danger-quiet,var(--error-color,#b3261e)));}
    @media(prefers-reduced-motion:reduce){.control,.control::after,.label{transition-duration:min(var(--vyp-ha-motion-duration,1ms),1ms);}}
  `;
  #connection=0;#internals=this.attachInternals();#blocker:HTMLInputElement|null=null;
  #state=textFieldState({label:'Value'});
  #value='';#defaultValue='';#name='';#disabled=false;#formDisabled=false;
  #dirty=false;#showValidation=false;#customError='';#composing=false;#revision=0;#compositionRevision=0;
  #pending:Proposal|null=null;#finalComposition:string|null=null;#fromAttribute=false;#restoringAttribute=false;
  constructor(){super();this.addEventListener('invalid',this.#reveal);}
  connectedCallback():void{
    super.connectedCallback();this.#connection++;
    if(this.#blocker===null){const blocker=document.createElement('input');blocker.type='text';blocker.hidden=true;blocker.disabled=true;blocker.tabIndex=-1;blocker.slot='native-blocker';blocker.setAttribute('aria-hidden','true');trackImplicitBlocker(blocker);this.#blocker=blocker;}
    if(this.#blocker.parentNode!==this)this.append(this.#blocker);this.#sync();
  }
  disconnectedCallback():void{this.#connection++;super.disconnectedCallback();}
  attributeChangedCallback(name:string,previous:string|null,next:string|null):void{
    if(this.#restoringAttribute)return;
    try{if(name==='value')textFieldValue(next??'');else if(name==='name')textFieldName(next??'');}
    catch(error){
      this.#restoringAttribute=true;
      if(previous===null)this.removeAttribute(name);else this.setAttribute(name,previous);
      this.#restoringAttribute=false;throw error;
    }
    this.#fromAttribute=true;super.attributeChangedCallback(name,previous,next);this.#fromAttribute=false;if(name==='form')this.#sync();
  }
  get #input():HTMLInputElement|null{return this.shadowRoot?.querySelector('input')??null;}
  get state():TextFieldState{return this.#state;}
  set state(raw:TextFieldState){const next=textFieldState(raw),previous=this.#state;this.#state=next;this.#sync();this.requestUpdate('state',previous);}
  get value():string{return this.#value;}
  set value(raw:string){
    const next=textFieldValue(raw),previous=this.#value,pending=this.#pending;
    this.#dirty=pending?.reason==='reset'&&pending.value===next?false:true;
    if(next!==previous)this.#revision++;
    this.#value=next;this.#sync();
    if(pending!==null&&pending.value===next){this.#input?.setSelectionRange(pending.start,pending.end,pending.direction??undefined);}
    this.#pending=null;this.requestUpdate('value',previous);
  }
  get defaultValue():string{return this.#defaultValue;}
  set defaultValue(raw:string){
    const next=textFieldValue(raw),previous=this.#defaultValue;if(next===previous)return;
    this.#defaultValue=next;if(!this.#dirty){this.#revision++;this.#value=next;this.#sync();}
    this.#reflect('value',next);this.requestUpdate('defaultValue',previous);
  }
  get name():string{return this.#name;}
  set name(raw:string){const next=textFieldName(raw);if(next===this.#name)return;this.#name=next;this.#reflect('name',next);}
  get disabled():boolean{return this.#disabled;}
  set disabled(raw:boolean){const next=boolean(raw);if(next===this.#disabled)return;this.#disabled=next;this.toggleAttribute('disabled',next);this.#sync();this.requestUpdate();}
  get readOnly():boolean{return this.#state.readOnly;}
  set readOnly(raw:boolean){const next=boolean(raw);if(next===this.readOnly)return;this.state=textFieldState({...this.state,readOnly:next});}
  #reflect(name:string,value:string):void{if(!this.#fromAttribute&&this.getAttribute(name)!==value)this.setAttribute(name,value);}
  get form():HTMLFormElement|null{return this.#internals.form;}
  get labels():NodeListOf<HTMLLabelElement>{return this.#internals.labels as NodeListOf<HTMLLabelElement>;}
  get validity():ValidityState{return this.#internals.validity;}
  get validationMessage():string{return this.#internals.validationMessage;}
  get willValidate():boolean{return this.#internals.willValidate;}
  checkValidity():boolean{this.#reveal();return this.#internals.checkValidity();}
  reportValidity():boolean{this.#reveal();return this.#internals.reportValidity();}
  setCustomValidity(message:string):void{textFieldValidity(this.value,this.state,message);this.#customError=message;this.#sync();this.requestUpdate();}
  focus(options?:FocusOptions):void{this.#input?.focus(options);}
  blur():void{this.#input?.blur();}
  formDisabledCallback(disabled:boolean):void{this.#formDisabled=disabled;this.#sync();this.requestUpdate();}
  formAssociatedCallback():void{this.#sync();}
  formResetCallback():void{this.#showValidation=false;this.#request(this.defaultValue,'reset');this.requestUpdate();}
  formStateRestoreCallback(value:string|File|FormData,mode:'restore'|'autocomplete'):void{
    if(mode!=='restore'&&mode!=='autocomplete')throw new FieldInputError();this.#request(value,mode);
  }
  #sync():void{
    const disabled=this.disabled||this.#formDisabled,control=this.#input,validity=textFieldValidity(this.value,this.state,this.#customError);
    this.toggleAttribute('readonly',this.readOnly);
    this.#internals.setFormValue(disabled?null:this.value,this.value);
    this.#internals.setValidity(validity.flags,validity.message,control??undefined);
    if(control!==null){control.disabled=disabled;control.readOnly=this.readOnly;if(!this.#composing&&control.value!==this.value)control.value=this.value;}
    if(this.#blocker!==null){this.#blocker.disabled=true;const owner=this.getAttribute('form');if(owner===null)this.#blocker.removeAttribute('form');else this.#blocker.setAttribute('form',owner);}
  }
  protected updated():void{this.#sync();}
  #reveal():void{this.#showValidation=true;this.#sync();this.requestUpdate();}
  #request(raw:unknown,reason:FieldValueReason):void{
    try{
      const value=textFieldValue(raw),control=this.#input;
      this.#pending={value,reason,start:control?.selectionStart??null,end:control?.selectionEnd??null,direction:control?.selectionDirection??null};
      const event:FieldValueEvent=new CustomEvent('ha-value-request',{detail:Object.freeze({value,reason}),bubbles:true,composed:true,cancelable:true});
      this.dispatchEvent(event);
    }finally{this.#sync();}
  }
  #edit(event:InputEvent):void{
    if(this.#composing||event.isComposing)return;
    const value=this.#input!.value;
    if(this.disabled||this.#formDisabled||this.readOnly||value===this.#finalComposition||value===this.value){this.#sync();return;}
    this.#dirty=true;this.#request(value,'input');
  }
  #startComposition():void{this.#composing=true;this.#compositionRevision=this.#revision;}
  #endComposition():void{
    this.#composing=false;const value=this.#input!.value;
    if(this.#revision!==this.#compositionRevision){this.#sync();return;}
    this.#edit(new InputEvent('input'));this.#finalComposition=value;
    queueMicrotask(()=>{this.#finalComposition=null;});
  }
  #enter(event:KeyboardEvent):void{
    if(!event.isTrusted||event.key!=='Enter'||event.isComposing||this.#composing||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
    // Shadow inputs have no outer form owner. Defer until application key handlers can cancel.
    const form=this.form,connection=this.#connection;
    setTimeout(()=>{
      if(connection!==this.#connection||event.defaultPrevented||this.disabled||this.#formDisabled||form===null||this.form!==form)return;
      implicitSubmit(form);
    });
  }
  protected render(){
    const state=this.state,validity=textFieldValidity(this.value,state,this.#customError),message=(this.#showValidation||state.error||this.#customError)?validity.message:'';
    const described=[state.description?'help':'',message?'error':''].filter(Boolean).join(' ');
    return html`<div class="field" part="field" ?data-raised=${this.value.length>0||state.placeholder.length>0} ?data-disabled=${this.disabled||this.#formDisabled} ?data-invalid=${!!message}>
      <label class="label" part="label" for="control">${state.label+(state.required?'*':'')}</label>
      <div class="control" part="control" @click=${()=>this.focus()}><input id="control" part="input" type="text" .value=${this.value} placeholder=${state.placeholder} ?required=${state.required}
        minlength=${state.minLength} maxlength=${state.maxLength} aria-label=${state.label} aria-invalid=${String(!!message)} aria-describedby=${described||nothing}
        @input=${this.#edit} @blur=${this.#reveal} @keydown=${this.#enter} @compositionstart=${this.#startComposition} @compositionend=${this.#endComposition}></div>
      <div class="hint" ?data-visible=${!!(state.required||state.description||message)}>
        ${state.description?html`<div class="help" part="help" id="help">${state.description}</div>`:nothing}
        ${message?html`<div class="error" part="error" id="error" aria-live="polite">${message}</div>`:nothing}</div></div>`;
  }
}
/** Register once at an explicit browser boundary; never import this entrypoint during SSR rendering. */
export function registerField(registry:CustomElementRegistry|undefined=globalThis.customElements):void{
  if(registry===undefined||typeof document==='undefined')throw new Error('registerField requires a browser CustomElementRegistry');
  const current=registry.get('vyp-ha-field');if(current!==undefined&&current!==HaTextField)throw new Error('vyp-ha-field registration conflict; use one reviewed package cohort');
  if(current===undefined)registry.define('vyp-ha-field',HaTextField);
}
declare global {
  interface HTMLElementTagNameMap {'vyp-ha-field':HaTextField;}
  interface HTMLElementEventMap {'ha-value-request':FieldValueEvent;}
}
