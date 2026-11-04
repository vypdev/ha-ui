import {LitElement,css,html,nothing} from 'lit';
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
  // Field geometry adapted from Gateway's MIT ui-catalog.css. All rendering stays in the shared core.
  static styles=css`
    :host {display:block;min-width:0;font:400 14px/1.35 var(--vyp-ha-font-family,var(--primary-font-family,Roboto,Noto,sans-serif));color:var(--vyp-ha-text,var(--primary-text-color,#1c1c1c));}
    .field {display:grid;gap:6px;} label {font-size:14px;line-height:1.35;}
    input {box-sizing:border-box;width:100%;min-width:0;min-height:56px;border:1px solid var(--vyp-ha-border,var(--divider-color,#e0e0e0));
      border-radius:var(--vyp-ha-field-radius,4px);padding:16px;color:inherit;background:var(--vyp-ha-surface,var(--card-background-color,#fff));font:inherit;}
    input:focus-visible {outline:2px solid var(--vyp-ha-primary,var(--primary-color,#0075b5));outline-offset:1px;}
    input:disabled {opacity:.5;cursor:not-allowed;} input[aria-invalid=true] {border-color:var(--vyp-ha-danger,var(--error-color,#b3261e));}
    .help,.error {font-size:12px;line-height:1.35;} .help {color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#595959));}
    .error {color:var(--vyp-ha-danger,var(--error-color,#b3261e));}
  `;
  #internals=this.attachInternals();
  #state=textFieldState({label:'Value'});
  #value='';#defaultValue='';#name='';#disabled=false;#formDisabled=false;
  #dirty=false;#showValidation=false;#customError='';#composing=false;#revision=0;#compositionRevision=0;
  #pending:Proposal|null=null;#finalComposition:string|null=null;#fromAttribute=false;#restoringAttribute=false;
  constructor(){super();this.addEventListener('invalid',this.#reveal);}
  attributeChangedCallback(name:string,previous:string|null,next:string|null):void{
    if(this.#restoringAttribute)return;
    try{if(name==='value')textFieldValue(next??'');else if(name==='name')textFieldName(next??'');}
    catch(error){
      this.#restoringAttribute=true;
      if(previous===null)this.removeAttribute(name);else this.setAttribute(name,previous);
      this.#restoringAttribute=false;throw error;
    }
    this.#fromAttribute=true;super.attributeChangedCallback(name,previous,next);this.#fromAttribute=false;
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
    const form=this.form;
    setTimeout(()=>{
      if(event.defaultPrevented||this.disabled||this.#formDisabled||form===null||this.form!==form)return;
      const controls=[...(form.getRootNode() as Document|ShadowRoot).querySelectorAll<HTMLInputElement|HTMLButtonElement|HaTextField>('input,button,vyp-ha-field')].filter(control=>control.form===form);
      const submitter=controls.find(control=>(control instanceof HTMLButtonElement||control instanceof HTMLInputElement)&&(control.type==='submit'||control.type==='image')) as HTMLButtonElement|HTMLInputElement|undefined;
      if(submitter!==undefined){if(!submitter.disabled)form.requestSubmit(submitter);return;}
      const blockers=controls.filter(control=>control instanceof HaTextField||(control instanceof HTMLInputElement&&['text','search','url','tel','email','password','date','month','week','time','datetime-local','number'].includes(control.type)));
      if(blockers.length<=1)form.requestSubmit();
    });
  }
  protected render(){
    const state=this.state,validity=textFieldValidity(this.value,state,this.#customError),message=(this.#showValidation||state.error||this.#customError)?validity.message:'';
    const described=[state.description?'help':'',message?'error':''].filter(Boolean).join(' ');
    return html`<div class="field" part="field"><label part="label" for="control">${state.label}</label>
      <input id="control" part="input" type="text" .value=${this.value} placeholder=${state.placeholder} ?required=${state.required}
        minlength=${state.minLength} maxlength=${state.maxLength} aria-invalid=${String(!!message)} aria-describedby=${described||nothing}
        @input=${this.#edit} @blur=${this.#reveal} @keydown=${this.#enter} @compositionstart=${this.#startComposition} @compositionend=${this.#endComposition}>
      ${state.description?html`<div class="help" part="help" id="help">${state.description}</div>`:nothing}
      ${message?html`<div class="error" part="error" id="error" aria-live="polite">${message}</div>`:nothing}</div>`;
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
