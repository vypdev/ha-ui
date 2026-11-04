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
 // HA/Web Awesome visible geometry with a separate native 44px hit target; see NOTICE.
 static styles=css`
  :host{display:inline-block;max-width:100%;font:var(--ha-font-weight-medium,500) var(--ha-font-size-m,14px)/1 var(--vyp-ha-font-family,var(--primary-font-family,Roboto,Noto,sans-serif));}
  button{--_height:var(--vyp-ha-button-height,var(--ha-button-height,var(--button-height,40px)));--_padding:var(--vyp-ha-button-padding,var(--ha-space-4,16px));
    --_fill:var(--vyp-ha-surface,transparent);--_text:var(--vyp-ha-text,var(--ha-color-on-neutral-quiet,var(--primary-text-color,#5e5e5e)));--_border:var(--vyp-ha-border,var(--wa-color-neutral-border-loud,var(--ha-color-fill-neutral-loud-resting,var(--divider-color,#5e5e5e))));
    box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:max(44px,var(--_height));max-width:100%;margin:0;padding:0;border:0;border-radius:var(--vyp-ha-button-radius,var(--ha-button-border-radius,var(--ha-border-radius-pill,9999px)));font:inherit;line-height:1;cursor:pointer;background:transparent;color:var(--_text);vertical-align:middle;}
  .surface{position:relative;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:0;min-height:var(--_height);max-width:100%;padding:0 var(--_padding);border:1px solid var(--_border);border-radius:inherit;background:var(--_fill);color:inherit;font:inherit;line-height:1;box-shadow:var(--ha-button-box-shadow,none);transition:background-color var(--vyp-ha-motion-duration,var(--ha-animation-duration-fast,150ms)) ease-out;}
  button[data-variant=primary],button[data-variant=plain],button[data-variant=outlined],button[data-variant=filled]{--_loud:var(--vyp-ha-primary,var(--ha-color-fill-primary-loud-resting,var(--primary-color,#0075b5)));--_loud-hover:var(--ha-color-fill-primary-loud-hover,var(--_loud));--_loud-active:var(--ha-color-fill-primary-loud-active,var(--_loud));--_on-loud:var(--vyp-ha-on-accent,var(--ha-color-on-primary-loud,var(--text-primary-color,#fff)));--_normal:var(--vyp-ha-surface-raised,var(--ha-color-fill-primary-normal-resting,var(--secondary-background-color,#dff3fc)));--_normal-hover:var(--ha-color-fill-primary-normal-hover,var(--_normal));--_normal-active:var(--ha-color-fill-primary-normal-active,var(--_normal));--_on-normal:var(--vyp-ha-primary,var(--ha-color-on-primary-normal,var(--primary-color,#006fae)));--_quiet-active:var(--ha-color-fill-primary-quiet-active,#eff9fe);}
  button[data-variant=primary],button[data-variant=danger],button[data-variant=success],button[data-variant=warning]{--_fill:var(--_loud);--_text:var(--_on-loud);--_border:transparent;}
  button[data-variant=danger]{--_loud:var(--vyp-ha-danger,var(--ha-color-fill-danger-loud-resting,var(--error-color,#b3261e)));--_loud-hover:var(--ha-color-fill-danger-loud-hover,var(--_loud));--_loud-active:var(--ha-color-fill-danger-loud-active,var(--_loud));--_on-loud:var(--vyp-ha-on-accent,var(--ha-color-on-danger-loud,var(--text-primary-color,#fff)));}
  button[data-variant=success]{--_loud:var(--vyp-ha-success,var(--ha-color-fill-success-loud-resting,var(--success-color,#146c2e)));--_loud-hover:var(--ha-color-fill-success-loud-hover,var(--_loud));--_loud-active:var(--ha-color-fill-success-loud-active,var(--_loud));--_on-loud:var(--vyp-ha-on-accent,var(--ha-color-on-success-loud,var(--text-primary-color,#fff)));}
  button[data-variant=warning]{--_loud:var(--vyp-ha-warning,var(--ha-color-fill-warning-loud-resting,var(--warning-color,#ffcc80)));--_loud-hover:var(--ha-color-fill-warning-loud-hover,var(--_loud));--_loud-active:var(--ha-color-fill-warning-loud-active,var(--_loud));--_on-loud:var(--vyp-ha-on-warning,var(--ha-color-on-warning-loud,#241b0c));}
  button[data-variant=plain]{--_fill:transparent;--_text:var(--_on-normal);--_border:transparent;}
  button[data-variant=outlined]{--_fill:transparent;--_text:var(--vyp-ha-text,var(--vyp-ha-primary,var(--ha-color-on-primary-quiet,var(--primary-color,#0075b5))));--_border:var(--vyp-ha-border,var(--vyp-ha-primary,var(--wa-color-brand-border-loud,var(--ha-color-on-primary-normal,var(--primary-color,#0075b5)))));}
  button[data-variant=filled]{--_fill:var(--_normal);--_text:var(--vyp-ha-text,var(--_on-normal));--_border:transparent;}
  button[data-size=small]{--_height:var(--vyp-ha-button-height,var(--ha-button-height,var(--button-height,32px)));--_padding:var(--vyp-ha-button-padding,var(--ha-space-3,12px));}
  button[data-size=large]{--_height:var(--vyp-ha-button-height,var(--ha-button-height,var(--button-height,48px)));font-size:var(--ha-font-size-l,16px);}
  button[data-size=extra-large]{--_height:var(--vyp-ha-button-height,var(--ha-button-height,var(--button-height,56px)));font-size:var(--ha-font-size-l,16px);}
  button[data-leading=true] .surface{padding-inline-start:var(--ha-space-2,8px);}button[data-trailing=true] .surface{padding-inline-end:var(--ha-space-2,8px);}
  .icon{display:inline-flex;flex:none;align-items:center;justify-content:center;width:24px;height:24px;pointer-events:none;}.leading{margin-inline-end:var(--ha-space-1,4px);}.trailing{margin-inline-start:var(--ha-space-1,4px);}
  ::slotted(*){max-width:24px;max-height:24px;pointer-events:none;}
  .label{min-width:0;box-sizing:border-box;display:inline-block;padding:var(--ha-space-1,4px) 0;overflow:var(--ha-button-label-overflow,hidden);text-overflow:ellipsis;white-space:normal;overflow-wrap:anywhere;}
  button[data-icon-only] .surface{width:var(--_height);height:var(--_height);padding:0;flex:none;}
  button[data-icon-only] .icon{margin:0;}
  button[data-icon-only][data-leading=true][data-trailing=true] .surface{width:auto;min-width:var(--_height);padding:0 var(--ha-space-2,8px);}
  button[data-icon-only][data-leading=true][data-trailing=true] .leading{margin-inline-end:var(--ha-space-1,4px);}
  button:focus{outline:none;}button:focus-visible .surface{outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px #989898));outline-offset:var(--wa-focus-ring-offset,2px);}
  @media(hover:hover){button:not(:disabled):not([aria-busy=true]):is([data-variant=primary],[data-variant=danger],[data-variant=success],[data-variant=warning]):hover{--_fill:var(--_loud-hover);}button:not(:disabled):not([aria-busy=true])[data-variant=filled]:hover{--_fill:var(--_normal-hover);}button:not(:disabled):not([aria-busy=true]):is([data-variant=outlined],[data-variant=plain]):hover{--_fill:var(--_normal);}button:not(:disabled):not([aria-busy=true])[data-variant=neutral]:hover{--_fill:var(--ha-color-fill-neutral-normal-resting,#e6e6e6);}}
  button:not(:disabled):not([aria-busy=true]):is([data-variant=primary],[data-variant=danger],[data-variant=success],[data-variant=warning]):active{--_fill:var(--_loud-active);}button:not(:disabled):not([aria-busy=true])[data-variant=filled]:active{--_fill:var(--_normal-active);}button:not(:disabled):not([aria-busy=true])[data-variant=plain]:active{--_fill:var(--_quiet-active);}button:not(:disabled):not([aria-busy=true]):is([data-variant=neutral],[data-variant=outlined]):active{--_fill:transparent;}
  button:disabled{cursor:not-allowed;--_fill:var(--ha-color-fill-disabled-loud-resting,#ccc);--_text:var(--ha-color-on-disabled-loud,#f3f3f3);--_border:transparent;}button:disabled .surface{opacity:.5;}
  button:disabled:is([data-variant=neutral],[data-variant=outlined],[data-variant=plain]){--_fill:transparent;--_text:var(--ha-color-on-disabled-quiet,#ccc);--_border:var(--ha-color-on-disabled-quiet,#ccc);}button:disabled[data-variant=filled]{--_fill:var(--ha-color-fill-disabled-normal-resting,#f3f3f3);--_text:var(--ha-color-on-disabled-normal,#ccc);}
  button:disabled[data-variant=plain]{--_border:transparent;}
  button:not(:disabled)[aria-busy=true]{cursor:wait;}button[aria-pressed=true] .surface{box-shadow:inset 0 0 0 2px currentColor;}
  button[aria-busy=true] .label,button[aria-busy=true] .icon{opacity:0;}
  .spinner{position:absolute;box-sizing:border-box;width:1em;height:1em;left:calc(50% - .5em);top:calc(50% - .5em);}
  .spinner svg{display:block;width:100%;height:100%;animation:vyp-ha-spin var(--vyp-ha-motion-duration,2s) linear infinite;}
  .spinner circle{--_circumference:calc((1em - 2px)*3.14159);cx:.5em;cy:.5em;r:calc(.5em - 1px);fill:none;stroke-width:2px;}
  .track{stroke:color-mix(in oklab,currentColor,transparent 90%);}.indicator{stroke:currentColor;stroke-linecap:round;stroke-dasharray:calc(.597*var(--_circumference)),calc(.796*var(--_circumference));stroke-dashoffset:calc(-.04*var(--_circumference));animation:vyp-ha-dash var(--vyp-ha-motion-duration,1.5s) ease-in-out infinite;}
  @keyframes vyp-ha-spin{to{transform:rotate(360deg);}}@keyframes vyp-ha-dash{0%{stroke-dasharray:calc(.008*var(--_circumference)),calc(1.194*var(--_circumference));stroke-dashoffset:0;}50%{stroke-dasharray:calc(.716*var(--_circumference)),calc(1.194*var(--_circumference));stroke-dashoffset:calc(-.278*var(--_circumference));}100%{stroke-dasharray:calc(.716*var(--_circumference)),calc(1.194*var(--_circumference));stroke-dashoffset:calc(-.987*var(--_circumference));}}
  @media(prefers-reduced-motion:reduce){.surface{transition-duration:min(var(--vyp-ha-motion-duration,1ms),1ms);}.spinner svg,.indicator{animation:none;}}
  [hidden]{display:none!important;}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}
 `;
 #internals=this.attachInternals();#state=buttonState({label:'Action'});#type:ButtonType='button';#name='';#value='';#disabled=false;#formDisabled=false;#formNoValidate=false;
 #proxy:HTMLButtonElement|null=null;#connection=0;#fromAttribute=false;#restoringAttribute=false;
 #leading=false;#trailing=false;
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
 #slots=():void=>{
  const filled=(name:string)=>this.shadowRoot!.querySelector<HTMLSlotElement>('slot[name='+name+']')!.assignedElements({flatten:true}).length>0;
  const leading=filled('leading'),trailing=filled('trailing');
  if(leading!==this.#leading||trailing!==this.#trailing){this.#leading=leading;this.#trailing=trailing;this.requestUpdate();}
 };
 protected updated():void{this.#sync();this.#slots();}
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
 protected render(){const state=this.state;return html`<button part="button" type="button" data-variant=${state.variant} data-size=${state.size} ?data-icon-only=${state.iconOnly} data-leading=${String(this.#leading)} data-trailing=${String(this.#trailing)}
  aria-label=${state.label} aria-busy=${String(state.loading)} aria-disabled=${String(this.#unavailable)} aria-pressed=${state.pressed===null?nothing:String(state.pressed)} @click=${this.#activate}>
  <span class="surface" part="surface"><span class="icon leading" aria-hidden="true" inert ?hidden=${!this.#leading}><slot name="leading" @slotchange=${this.#slots}></slot></span>
  <span class=${state.iconOnly?'label sr-only':'label'}>${state.label}</span>
  <span class="icon trailing" aria-hidden="true" inert ?hidden=${!this.#trailing}><slot name="trailing" @slotchange=${this.#slots}></slot></span>
  ${state.loading?html`<span class="spinner" part="spinner" aria-hidden="true"><svg focusable="false" fill="none"><circle class="track"></circle><circle class="indicator"></circle></svg></span>`:nothing}</span>
 </button>${state.loading?html`<span class="sr-only" role="status">${state.loadingLabel}</span>`:nothing}`;}

}
export function registerButton(registry:CustomElementRegistry|undefined=globalThis.customElements):void{
 if(registry===undefined||typeof document==='undefined')throw new Error('registerButton requires a browser CustomElementRegistry');
 const current=registry.get('vyp-ha-button');if(current!==undefined&&current!==HaButton)throw new Error('vyp-ha-button registration conflict; use one reviewed package cohort');if(current===undefined)registry.define('vyp-ha-button',HaButton);
}
declare global{interface HTMLElementTagNameMap{'vyp-ha-button':HaButton;}interface HTMLElementEventMap{'ha-press-request':ButtonPressEvent;}}
