import {LitElement,css,html,nothing} from 'lit';
import {ButtonInputError,buttonState,buttonType,buttonName,buttonValue,type ButtonState,type ButtonType,type ButtonPressDetail} from '../button-contracts.js';
export type {ButtonPressDetail} from '../button-contracts.js';
export type ButtonPressEvent=CustomEvent<ButtonPressDetail>;
const textAttribute={fromAttribute:(value:string|null)=>value??''};
const typeAttribute={fromAttribute:(value:string|null)=>value??'button'};
function flag(value:unknown):boolean{if(typeof value!=='boolean')throw new ButtonInputError();return value;}

/** One visual button and one real browser submitter; applications own pressed/busy state. */
export class HaButton extends LitElement {
 static formAssociated=true;
 static shadowRootOptions={...LitElement.shadowRootOptions,delegatesFocus:true};
 static properties={state:{attribute:false,noAccessor:true},type:{converter:typeAttribute,noAccessor:true},name:{converter:textAttribute,noAccessor:true},value:{converter:textAttribute,noAccessor:true},disabled:{type:Boolean,noAccessor:true},formNoValidate:{attribute:'formnovalidate',type:Boolean,noAccessor:true}};
 static get observedAttributes(){return [...super.observedAttributes,'form'];}
 // Gateway MIT pill geometry, with a minimum 44px target. No framework-specific visuals.
 static styles=css`
  :host{display:inline-block;max-width:100%;font:500 14px/1.35 var(--vyp-ha-font-family,var(--primary-font-family,Roboto,Noto,sans-serif));}
  button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:44px;min-height:44px;max-width:100%;padding:8px 16px;border:1px solid var(--vyp-ha-border,var(--divider-color,#e0e0e0));border-radius:var(--vyp-ha-button-radius,9999px);font:inherit;line-height:1.35;white-space:normal;overflow-wrap:anywhere;cursor:pointer;color:var(--vyp-ha-text,var(--primary-text-color,#1c1c1c));background:var(--vyp-ha-surface,var(--card-background-color,#fff));}
  button[data-variant=primary]{background:var(--vyp-ha-primary,var(--primary-color,#0075b5));border-color:transparent;color:var(--vyp-ha-on-accent,var(--text-primary-color,#fff));}
  button[data-variant=danger]{background:var(--vyp-ha-danger,var(--error-color,#b3261e));border-color:transparent;color:var(--vyp-ha-on-accent,var(--text-primary-color,#fff));}
  button[data-variant=success]{background:var(--vyp-ha-success,var(--success-color,#146c2e));border-color:transparent;color:var(--vyp-ha-on-accent,var(--text-primary-color,#fff));}
  button[data-variant=warning]{background:var(--vyp-ha-warning,var(--warning-color,#ffcc80));border-color:transparent;color:var(--vyp-ha-on-warning,#241b0c);}
  button[data-variant=plain]{background:transparent;border-color:transparent;color:var(--vyp-ha-primary,var(--primary-color,#0075b5));}
  button[data-variant=outlined]{background:transparent;}button[data-variant=filled]{background:var(--vyp-ha-surface-raised,var(--secondary-background-color,#f1f1f1));border-color:transparent;}
  button[data-size=small]{padding-inline:12px;}button[data-size=large]{min-height:48px;font-size:16px;}button[data-size=extra-large]{min-height:56px;padding-inline:20px;font-size:16px;}
  button[data-icon-only]{padding:8px;}button[data-icon-only][data-size=large]{min-width:48px;}button[data-icon-only][data-size=extra-large]{min-width:56px;}button:focus-visible{outline:2px solid var(--vyp-ha-primary,var(--primary-color,#0075b5));outline-offset:2px;}
  button:disabled{opacity:.5;cursor:not-allowed;}button:not(:disabled)[aria-busy=true]{cursor:wait;}button[aria-pressed=true]{box-shadow:inset 0 0 0 2px currentColor;}
  .icon{display:contents;}::slotted(*){max-width:20px;max-height:20px;pointer-events:none;}
  .spinner{box-sizing:border-box;flex:0 0 auto;width:16px;height:16px;border:2px solid currentColor;border-inline-end-color:transparent;border-radius:50%;animation:vyp-ha-spin var(--vyp-ha-motion-duration,700ms) linear infinite;}
  @keyframes vyp-ha-spin{to{transform:rotate(360deg);}}@media(prefers-reduced-motion:reduce){.spinner{animation:none;}}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}
 `;
 #internals=this.attachInternals();#state=buttonState({label:'Action'});#type:ButtonType='button';#name='';#value='';#disabled=false;#formDisabled=false;#formNoValidate=false;
 #proxy:HTMLButtonElement|null=null;#connection=0;#fromAttribute=false;#restoringAttribute=false;
 readonly #proxyClick=(event:MouseEvent)=>this.#activate(event,true);
 connectedCallback():void{
  super.connectedCallback();this.#connection++;
  if(this.#proxy===null){const proxy=document.createElement('button');proxy.hidden=true;proxy.tabIndex=-1;proxy.slot='native-submitter';proxy.setAttribute('aria-hidden','true');proxy.addEventListener('click',this.#proxyClick);this.#proxy=proxy;this.append(proxy);}
  this.#sync();
 }
 disconnectedCallback():void{super.disconnectedCallback();this.#connection++;}
 attributeChangedCallback(name:string,previous:string|null,next:string|null):void{
  if(this.#restoringAttribute)return;
  try{if(name==='type')buttonType(next??'button');else if(name==='name')buttonName(next??'');else if(name==='value')buttonValue(next??'');}
  catch(error){this.#restoringAttribute=true;if(previous===null)this.removeAttribute(name);else this.setAttribute(name,previous);this.#restoringAttribute=false;throw error;}
  this.#fromAttribute=true;super.attributeChangedCallback(name,previous,next);this.#fromAttribute=false;if(name==='form')this.#sync();
 }
 get state():ButtonState{return this.#state;}
 set state(raw:ButtonState){const next=buttonState(raw),previous=this.#state;this.#state=next;this.#sync();this.requestUpdate('state',previous);}
 get type():ButtonType{return this.#type;}
 set type(raw:ButtonType){const next=buttonType(raw);if(next===this.#type)return;this.#type=next;this.#reflect('type',next);this.#sync();this.requestUpdate();}
 get name():string{return this.#name;}
 set name(raw:string){const next=buttonName(raw);if(next===this.#name)return;this.#name=next;this.#reflect('name',next);this.#sync();}
 get value():string{return this.#value;}
 set value(raw:string){const next=buttonValue(raw);if(next===this.#value)return;this.#value=next;this.#reflect('value',next);this.#sync();}
 get disabled():boolean{return this.#disabled;}
 set disabled(raw:boolean){const next=flag(raw);if(next===this.#disabled)return;this.#disabled=next;this.toggleAttribute('disabled',next);this.#sync();this.requestUpdate();}
 get formNoValidate():boolean{return this.#formNoValidate;}
 set formNoValidate(raw:boolean){const next=flag(raw);if(next===this.#formNoValidate)return;this.#formNoValidate=next;this.toggleAttribute('formnovalidate',next);this.#sync();}
 get form():HTMLFormElement|null{return this.#internals.form;}
 get submitter():HTMLButtonElement|null{return this.#proxy;}
 get #control():HTMLButtonElement|null{return this.shadowRoot?.querySelector('button')??null;}
 get #unavailable():boolean{return this.disabled||this.#formDisabled||this.state.loading;}
 click():void{this.#control?.click();}
 focus(options?:FocusOptions):void{this.#control?.focus(options);}
 blur():void{this.#control?.blur();}
 formDisabledCallback(disabled:boolean):void{this.#formDisabled=disabled;this.#sync();this.requestUpdate();}
 formAssociatedCallback():void{this.#sync();}
 #reflect(name:string,value:string):void{if(!this.#fromAttribute&&this.getAttribute(name)!==value)this.setAttribute(name,value);}
 #sync():void{
  const proxy=this.#proxy;if(proxy===null)return;
  proxy.type=this.type;proxy.name=this.name;proxy.value=this.value;proxy.disabled=this.#unavailable;proxy.formNoValidate=this.formNoValidate;
  const owner=this.getAttribute('form');if(owner===null)proxy.removeAttribute('form');else proxy.setAttribute('form',owner);
  const control=this.#control;if(control!==null)control.disabled=this.disabled||this.#formDisabled;
 }
 protected updated():void{this.#sync();}
 #activate(event:MouseEvent,native=false):void{
  if(!this.isConnected||this.#unavailable){event.preventDefault();event.stopImmediatePropagation();return;}
  if(event.defaultPrevented)return;
  const type=this.type,form=this.form,connection=this.#connection;
  const request:ButtonPressEvent=new CustomEvent('ha-press-request',{detail:Object.freeze({type}),bubbles:true,composed:true,cancelable:true});
  if(!this.dispatchEvent(request)){event.preventDefault();return;}
  if(native||type==='button'||form===null)return;
  const proxy=this.#proxy!;
  setTimeout(()=>{
   if(event.defaultPrevented||!this.isConnected||connection!==this.#connection||this.#unavailable||this.form!==form||this.type!==type||proxy.parentNode!==this)return;
   if(type==='submit')HTMLFormElement.prototype.requestSubmit.call(form,proxy);else HTMLFormElement.prototype.reset.call(form);
  });
 }
 protected render(){const state=this.state;return html`<button part="button" type="button" data-variant=${state.variant} data-size=${state.size} ?data-icon-only=${state.iconOnly}
  aria-label=${state.label} aria-busy=${String(state.loading)} aria-disabled=${String(this.#unavailable)} aria-pressed=${state.pressed===null?nothing:String(state.pressed)} @click=${this.#activate}>
  <span class="icon" aria-hidden="true" inert><slot name="leading"></slot></span>
  ${state.loading?html`<span class="spinner" aria-hidden="true"></span>`:nothing}<span class=${state.iconOnly?'label sr-only':'label'}>${state.label}</span>
  <span class="icon" aria-hidden="true" inert><slot name="trailing"></slot></span>
 </button>${state.loading?html`<span class="sr-only" role="status">${state.loadingLabel}</span>`:nothing}`;}
}
export function registerButton(registry:CustomElementRegistry|undefined=globalThis.customElements):void{
 if(registry===undefined||typeof document==='undefined')throw new Error('registerButton requires a browser CustomElementRegistry');
 const current=registry.get('vyp-ha-button');if(current!==undefined&&current!==HaButton)throw new Error('vyp-ha-button registration conflict; use one reviewed package cohort');if(current===undefined)registry.define('vyp-ha-button',HaButton);
}
declare global{interface HTMLElementTagNameMap{'vyp-ha-button':HaButton;}interface HTMLElementEventMap{'ha-press-request':ButtonPressEvent;}}
