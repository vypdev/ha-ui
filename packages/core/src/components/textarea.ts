import {LitElement,css,html,nothing} from 'lit';
import {TextAreaInputError,textAreaName,textAreaState,textAreaValue,textAreaValidity,type TextAreaState,type TextAreaValueReason,type TextAreaValueDetail} from '../textarea-contracts.js';

export type {TextAreaValueReason,TextAreaValueDetail} from '../textarea-contracts.js';
export type TextAreaValueEvent=CustomEvent<TextAreaValueDetail>;
type Proposal={value:string;reason:TextAreaValueReason;start:number|null;end:number|null;direction:'forward'|'backward'|'none'|null};
const attributeText={fromAttribute:(value:string|null)=>value??''};
function boolean(value:unknown):boolean {if(typeof value!=='boolean')throw new TextAreaInputError();return value;}

/** Controlled multiline text with native textarea editing and outer-form ownership. */
export class HaTextArea extends LitElement {
  static formAssociated=true;
  static shadowRootOptions={...LitElement.shadowRootOptions,delegatesFocus:true};
  static properties={state:{attribute:false,noAccessor:true},value:{attribute:false,noAccessor:true},
    defaultValue:{attribute:'value',converter:attributeText,noAccessor:true},name:{converter:attributeText,noAccessor:true},
    disabled:{type:Boolean,noAccessor:true},readOnly:{attribute:'readonly',type:Boolean,noAccessor:true}};
  // Filled-field typography and theme tokens reuse the attributed HA-derived styles in NOTICE.
  static styles=css`
    :host{display:block;min-width:0;padding-bottom:var(--ha-input-padding-bottom,var(--ha-space-2,8px));font:var(--ha-font-weight-normal,400) var(--ha-font-size-m,14px)/var(--ha-line-height-normal,1.6) var(--vyp-ha-font-family,var(--ha-font-family-body,var(--primary-font-family,Roboto,Noto,sans-serif)));color:var(--vyp-ha-text,var(--primary-text-color,#141414));text-align:start;}
    :host([hidden]){display:none;}
    .field{position:relative;min-width:0;}
    .control{position:relative;min-width:0;box-sizing:border-box;padding:var(--ha-space-3,12px) var(--ha-space-4,16px) var(--ha-space-2,8px);border-radius:var(--vyp-ha-field-radius,4px 4px 0 0);background:var(--vyp-ha-surface,var(--ha-color-form-background,var(--card-background-color,#f3f3f3)));}
    .control::after{content:'';position:absolute;inset-inline:0;bottom:0;height:1px;background:var(--vyp-ha-border,var(--ha-color-border-neutral-loud,var(--divider-color,#5e5e5e)));pointer-events:none;}
    .label{display:block;margin-bottom:var(--ha-space-2,8px);overflow-wrap:anywhere;font-size:var(--ha-font-size-s,12px);line-height:1.4;color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#5e5e5e));}
    textarea{display:block;box-sizing:border-box;width:100%;min-width:0;max-width:100%;min-height:64px;margin:0;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;resize:vertical;overflow-wrap:anywhere;}
    textarea::placeholder{color:var(--vyp-ha-placeholder,var(--ha-color-neutral-60,var(--vyp-ha-text-secondary,var(--secondary-text-color,#666))));opacity:1;}
    .control:hover{background:var(--vyp-ha-surface-hover,var(--vyp-ha-surface,var(--ha-color-form-background-hover,var(--card-background-color,#e6e6e6))));}
    :host(:focus-within) .control::after{height:2px;background:var(--vyp-ha-primary,var(--primary-color,#00639c));}
    :host(:focus-within) .label{color:var(--vyp-ha-primary,var(--primary-color,#00639c));}
    .field[data-disabled] .control{opacity:.5;cursor:not-allowed;}.field[data-disabled] textarea{cursor:not-allowed;}
    .field[data-invalid]:not([data-disabled]) .control::after{height:2px;background:var(--vyp-ha-danger,var(--error-color,#b3261e));}
    .field[data-invalid]:not([data-disabled]) .label,.error{color:var(--vyp-ha-danger,var(--error-color,#b3261e));}
    .hint{min-width:0;margin:0 var(--ha-space-3,12px);font-size:var(--ha-font-size-s,12px);color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#5e5e5e));overflow-wrap:anywhere;}
    .help,.error{padding-top:2px;}.error{font-weight:var(--ha-font-weight-medium,500);}
  `;
  #internals=this.attachInternals();#state=textAreaState({label:'Value'});
  #value='';#defaultValue='';#name='';#disabled=false;#formDisabled=false;
  #dirty=false;#showValidation=false;#customError='';#composing=false;#revision=0;#compositionRevision=0;
  #pending:Proposal|null=null;#finalComposition:string|null=null;#fromAttribute=false;#restoringAttribute=false;
  constructor(){super();this.addEventListener('invalid',this.#reveal);}
  connectedCallback():void{super.connectedCallback();this.#sync();}
  attributeChangedCallback(name:string,previous:string|null,next:string|null):void{
    if(this.#restoringAttribute)return;
    try{if(name==='value')textAreaValue(next??'');else if(name==='name')textAreaName(next??'');}
    catch(error){this.#restoringAttribute=true;if(previous===null)this.removeAttribute(name);else this.setAttribute(name,previous);this.#restoringAttribute=false;throw error;}
    this.#fromAttribute=true;super.attributeChangedCallback(name,previous,next);this.#fromAttribute=false;
  }
  get #input():HTMLTextAreaElement|null{return this.shadowRoot?.querySelector('textarea')??null;}
  get state():TextAreaState{return this.#state;}
  set state(raw:TextAreaState){const next=textAreaState(raw),previous=this.#state;this.#state=next;this.#sync();this.requestUpdate('state',previous);}
  get value():string{return this.#value;}
  set value(raw:string){
    const next=textAreaValue(raw),previous=this.#value,pending=this.#pending;
    this.#dirty=!(pending?.reason==='reset'&&pending.value===next);
    if(next!==previous)this.#revision++;
    this.#value=next;this.#sync();
    if(pending!==null&&pending.value===next)this.#input?.setSelectionRange(pending.start,pending.end,pending.direction??undefined);
    this.#pending=null;this.requestUpdate('value',previous);
  }
  get defaultValue():string{return this.#defaultValue;}
  set defaultValue(raw:string){
    const next=textAreaValue(raw),previous=this.#defaultValue;if(next===previous)return;
    this.#defaultValue=next;if(!this.#dirty){this.#revision++;this.#value=next;this.#sync();}
    this.#reflect('value',next);this.requestUpdate('defaultValue',previous);
  }
  get name():string{return this.#name;}
  set name(raw:string){const next=textAreaName(raw);if(next===this.#name)return;this.#name=next;this.#reflect('name',next);}
  get disabled():boolean{return this.#disabled;}
  set disabled(raw:boolean){const next=boolean(raw);if(next===this.#disabled)return;this.#disabled=next;this.toggleAttribute('disabled',next);this.#sync();this.requestUpdate();}
  get readOnly():boolean{return this.#state.readOnly;}
  set readOnly(raw:boolean){const next=boolean(raw);if(next===this.readOnly)return;this.state=textAreaState({...this.state,readOnly:next});}
  #reflect(name:string,value:string):void{if(!this.#fromAttribute&&this.getAttribute(name)!==value)this.setAttribute(name,value);}
  get form():HTMLFormElement|null{return this.#internals.form;}
  get labels():NodeListOf<HTMLLabelElement>{return this.#internals.labels as NodeListOf<HTMLLabelElement>;}
  get validity():ValidityState{return this.#internals.validity;}
  get validationMessage():string{return this.#internals.validationMessage;}
  get willValidate():boolean{return this.#internals.willValidate;}
  checkValidity():boolean{this.#reveal();return this.#internals.checkValidity();}
  reportValidity():boolean{this.#reveal();return this.#internals.reportValidity();}
  setCustomValidity(message:string):void{textAreaValidity(this.value,this.state,message);this.#customError=message;this.#sync();this.requestUpdate();}
  focus(options?:FocusOptions):void{this.#input?.focus(options);}
  blur():void{this.#input?.blur();}
  formDisabledCallback(disabled:boolean):void{this.#formDisabled=disabled;this.#sync();this.requestUpdate();}
  formAssociatedCallback():void{this.#sync();}
  formResetCallback():void{this.#showValidation=false;this.#request(this.defaultValue,'reset');this.requestUpdate();}
  formStateRestoreCallback(value:string|File|FormData,mode:'restore'|'autocomplete'):void{
    if(mode!=='restore'&&mode!=='autocomplete')throw new TextAreaInputError();this.#request(value,mode);
  }
  #sync():void{
    const disabled=this.disabled||this.#formDisabled,control=this.#input,validity=textAreaValidity(this.value,this.state,this.#customError);
    this.toggleAttribute('readonly',this.readOnly);
    this.#internals.setFormValue(disabled?null:this.value,this.value);
    this.#internals.setValidity(validity.flags,validity.message,control??undefined);
    if(control!==null){control.disabled=disabled;control.readOnly=this.readOnly;if(!this.#composing&&control.value!==this.value)control.value=this.value;}
  }
  protected updated():void{this.#sync();}
  #reveal():void{this.#showValidation=true;this.#sync();this.requestUpdate();}
  #request(raw:unknown,reason:TextAreaValueReason):void{
    try{
      const value=textAreaValue(raw),control=this.#input;
      this.#pending={value,reason,start:control?.selectionStart??null,end:control?.selectionEnd??null,direction:control?.selectionDirection??null};
      const event:TextAreaValueEvent=new CustomEvent('ha-value-request',{detail:Object.freeze({value,reason}),bubbles:true,composed:true,cancelable:true});
      this.dispatchEvent(event);
    }finally{this.#sync();}
  }
  #edit(event:InputEvent):void{
    if(this.#composing||event.isComposing)return;
    const value=this.#input!.value;
    if(this.disabled||this.#formDisabled||this.readOnly||value===this.#finalComposition||value===this.value){this.#sync();return;}
    // The native UTF-16 maxlength is deliberately absent. Only the codepoint safety bound applies.
    try{textAreaValue(value);}catch{this.#sync();return;}
    this.#dirty=true;this.#request(value,'input');
  }
  #startComposition():void{this.#composing=true;this.#compositionRevision=this.#revision;}
  #endComposition():void{
    this.#composing=false;const value=this.#input!.value;
    if(this.#revision!==this.#compositionRevision){this.#sync();return;}
    this.#edit(new InputEvent('input'));this.#finalComposition=value;
    queueMicrotask(()=>{this.#finalComposition=null;});
  }
  protected render(){
    const state=this.state,validity=textAreaValidity(this.value,state,this.#customError),message=(this.#showValidation||state.error||this.#customError)?validity.message:'';
    const described=[state.description?'help':'',message?'error':''].filter(Boolean).join(' ');
    return html`<div class="field" part="field" ?data-disabled=${this.disabled||this.#formDisabled} ?data-invalid=${!!message}>
      <div class="control" part="control" @click=${()=>this.focus()}>
        <label class="label" part="label" for="control">${state.label}${state.required?html`<span aria-hidden="true">*</span>`:nothing}</label>
        <textarea id="control" part="input" rows=${state.rows} .value=${this.value} placeholder=${state.placeholder} ?required=${state.required}
          aria-label=${state.label} aria-invalid=${String(!!message)} aria-describedby=${described||nothing}
          @input=${this.#edit} @blur=${this.#reveal} @compositionstart=${this.#startComposition} @compositionend=${this.#endComposition}></textarea>
      </div>
      <div class="hint">${state.description?html`<div class="help" part="help" id="help">${state.description}</div>`:nothing}
        ${message?html`<div class="error" part="error" id="error" aria-live="polite">${message}</div>`:nothing}</div>
    </div>`;
  }
}
/** Explicit browser registration; importing contracts never defines an element. */
export function registerTextArea(registry:CustomElementRegistry|undefined=globalThis.customElements):void{
  if(registry===undefined||typeof document==='undefined')throw new Error('registerTextArea requires a browser CustomElementRegistry');
  const current=registry.get('vyp-ha-textarea');if(current!==undefined&&current!==HaTextArea)throw new Error('vyp-ha-textarea registration conflict; use one reviewed package cohort');
  if(current===undefined)registry.define('vyp-ha-textarea',HaTextArea);
}
declare global {interface HTMLElementTagNameMap {'vyp-ha-textarea':HaTextArea;}}
