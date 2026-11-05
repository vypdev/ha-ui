import {LitElement,css,html,nothing} from 'lit';
import {buttonState} from '../button-contracts.js';
import {dialogOpen,dialogRequestDetail,dialogState,type DialogAction,type DialogRequestDetail,type DialogState} from '../dialog-contracts.js';
import {registerButton} from './button.js';
export type {DialogRequestDetail} from '../dialog-contracts.js';
export type DialogRequestEvent=CustomEvent<DialogRequestDetail>;

function focusedElement(document:Document):HTMLElement|null {
 let focus=document.activeElement;
 while(focus?.shadowRoot?.activeElement)focus=focus.shadowRoot.activeElement;
 return focus instanceof HTMLElement&&focus!==document.body?focus:null;
}

/** Native top layer and focus; the consumer owns opening and acknowledges each typed intent. */
export class HaDialog extends LitElement {
 static properties={state:{attribute:false,noAccessor:true},open:{type:Boolean,noAccessor:true}};
 // Surface and header geometry follow the measured HA dialog. See NOTICE.
 static styles=css`
  :host{display:contents;}
  dialog{--full-width:var(--ha-dialog-width-full,min(95vw,var(--safe-width,100vw)));
   --surface-width:min(var(--ha-dialog-width-md,580px),var(--full-width));
   position:fixed;box-sizing:border-box;inset:0;width:var(--surface-width);max-width:var(--surface-width);min-width:0;
   max-height:var(--ha-dialog-max-height,calc(var(--safe-height,100dvh) - var(--ha-space-20,80px)));min-height:var(--ha-dialog-min-height,0px);
   margin:var(--dialog-surface-margin-top,auto) auto auto;padding:0;border:0;outline:none;
   border-radius:var(--ha-dialog-border-radius,var(--ha-border-radius-3xl,24px));
   color:var(--vyp-ha-text,var(--primary-text-color,#141414));
   background:var(--vyp-ha-surface-raised,var(--ha-dialog-surface-background,var(--card-background-color,#fff)));
   box-shadow:var(--dialog-box-shadow,var(--wa-shadow-l,0 6px 12px -3px #0000001f,0 16px 32px -6px #0003));
   backdrop-filter:var(--ha-dialog-surface-backdrop-filter,none);
   transform:translate(calc(var(--safe-area-offset-left,0px) - var(--safe-area-offset-right,0px)),calc(var(--safe-area-offset-top,0px) - var(--safe-area-offset-bottom,0px)));
   font:400 14px/1.6 var(--vyp-ha-font-family,var(--ha-font-family-body,var(--primary-font-family,Roboto,Noto,sans-serif)));
   overflow:hidden;
  }
  dialog[open]{display:flex;flex-direction:column;}
  dialog[data-width=small]{--surface-width:min(var(--ha-dialog-width-sm,320px),var(--full-width));}
  dialog[data-width=large]{--surface-width:min(var(--ha-dialog-width-lg,1024px),var(--full-width));}
  dialog[data-width=full]{--surface-width:var(--full-width);}
  dialog::backdrop{background:var(--mdc-dialog-scrim-color,transparent);backdrop-filter:var(--ha-dialog-scrim-backdrop-filter,var(--dialog-backdrop-filter,brightness(68%)));}
  .header{display:flex;align-items:center;flex:none;min-height:68px;padding-inline:var(--ha-space-1,4px) var(--ha-space-3,12px);}
  .header[data-scrolled]{border-bottom:1px solid var(--mdc-dialog-scroll-divider-color,#0000001f);}
  .close{flex:none;--vyp-ha-button-height:var(--ha-icon-button-size,48px);--vyp-ha-primary:var(--primary-text-color,#141414);
   --wa-focus-ring-offset:-4px;--ha-color-fill-primary-normal-resting:color-mix(in srgb,currentColor 10%,transparent);}
  .close svg{display:block;width:24px;height:24px;fill:currentColor;}
  .heading{min-width:0;padding:10px 4px;}.title,.subtitle,.description{margin:0;overflow-wrap:anywhere;}
  .title{font-family:inherit;font-size:var(--ha-dialog-header-title-font-size,var(--ha-font-size-xl,20px));font-weight:var(--ha-dialog-header-title-font-weight,500);line-height:var(--ha-dialog-header-title-line-height,1.2);color:var(--ha-dialog-header-title-color,inherit);}
  .subtitle{font-size:var(--ha-font-size-m,14px);line-height:var(--ha-line-height-normal,1.6);color:var(--vyp-ha-text-secondary,var(--ha-dialog-header-subtitle-color,var(--secondary-text-color,#595959)));}
  .content-wrapper{position:relative;display:flex;flex-direction:column;flex:1 1 auto;min-height:0;}
  .body{min-height:0;flex:1 1 auto;overflow:auto;overscroll-behavior:contain;padding:var(--dialog-content-padding,0 var(--ha-space-6,24px) var(--ha-space-6,24px));}
  .content{display:flow-root;}
  .fade-top,.fade-bottom{position:absolute;inset-inline:0;height:var(--ha-space-2,8px);pointer-events:none;opacity:0;
   background:linear-gradient(to bottom,var(--ha-color-shadow-scrollable-fade,#00000014),transparent);
   transition:opacity var(--vyp-ha-motion-duration,180ms) ease-in-out;}
  .fade-top{inset-block-start:0;}.fade-bottom{inset-block-end:0;transform:rotate(180deg);}
  .content-wrapper[data-top] .fade-top,.content-wrapper[data-bottom] .fade-bottom{opacity:1;}
  @media(prefers-reduced-motion:reduce){.fade-top,.fade-bottom{transition:none;}}
  .footer{display:flex;justify-content:flex-end;flex-wrap:wrap;align-items:center;flex:none;gap:var(--ha-space-3,12px);padding:10px var(--ha-space-4,16px) 14px;}
  .footer[hidden]{display:none;}.footer slot{display:contents;}
  ::slotted(div[slot=footer]){display:flex;flex-wrap:wrap;align-items:center;gap:var(--ha-space-3,12px);}
  @media(min-width:450px) and (min-height:500px){.header{padding-inline:var(--ha-space-2,8px) var(--ha-space-4,16px);}}
  @media(max-width:450px),(max-height:500px){
   dialog[data-kind=standard]{--surface-width:var(--ha-dialog-width-full,100vw);max-height:var(--ha-dialog-max-height,100dvh);min-height:var(--ha-dialog-min-height,100dvh);margin:0;border-radius:0;transform:none;
    padding:var(--safe-area-inset-top,0px) var(--safe-area-inset-right,0px) var(--safe-area-inset-bottom,0px) var(--safe-area-inset-left,0px);}
  }
 `;
 #state=dialogState({title:'Dialog'});#open=false;#rendered:DialogState|null=null;
 #opener:HTMLElement|null=null;#scrimPointer=false;#footer=false;#resize:ResizeObserver|null=null;
 get state():DialogState{return this.#state;}
 set state(raw:DialogState){const next=dialogState(raw),previous=this.#state;this.#state=next;this.requestUpdate('state',previous);}
 get open():boolean{return this.#open;}
 set open(raw:boolean){const next=dialogOpen(raw),previous=this.#open;if(next===previous)return;this.#open=next;this.requestUpdate('open',previous);}
 get #dialog():HTMLDialogElement|null{return this.shadowRoot?.querySelector('dialog')??null;}
 connectedCallback():void{super.connectedCallback();this.requestUpdate();}
 disconnectedCallback():void{this.#rendered=null;this.#closeModal();super.disconnectedCallback();}
 protected updated():void{
  if(!this.isConnected)return;
  const dialog=this.#dialog!;this.#rendered=this.state;
  if(!this.open){this.#closeModal();return;}
  if(!dialog.open){
   this.#opener??=focusedElement(this.ownerDocument);dialog.showModal();
   if(this.isConnected&&this.open&&dialog.open){
    // Some engines choose an internal button before inspecting projected autofocus.
    const target=[...this.querySelectorAll<HTMLElement>('[autofocus]')].find(control=>!control.matches(':disabled,[disabled]')&&control.getClientRects().length>0);
    if(target&&!target.matches(':focus-within'))target.focus({preventScroll:true});
   }
  }
  // Native focus can synchronously close or disconnect the owner.
  if(this.isConnected&&this.open&&dialog.open&&this.#resize===null){
   this.#resize=new ResizeObserver(this.#syncScroll);
   this.#resize.observe(dialog.querySelector('.body')!);this.#resize.observe(dialog.querySelector('.content')!);
   this.#syncScroll();
  }
 }
 #closeModal():void{
  const opener=this.#opener;this.#opener=null;this.#scrimPointer=false;
  this.#resize?.disconnect();this.#resize=null;
  const dialog=this.#dialog;if(dialog?.open)dialog.close();
  if(opener?.isConnected&&this.ownerDocument.activeElement===this.ownerDocument.body)opener.focus({preventScroll:true});
 }
 #request(action:DialogAction,state=this.state):void {
  if(!this.isConnected||!this.open||state!==this.state||state!==this.#rendered)return;
  if(action==='confirm'&&(state.pending||state.confirmDisabled))return;
  this.dispatchEvent(new CustomEvent('ha-dialog-request',{detail:dialogRequestDetail({action}),bubbles:true,composed:true,cancelable:true}));
 }
 #fromButton(action:DialogAction,state:DialogState,event:Event):void {
  if(event.target!==event.currentTarget||event.defaultPrevented||!this.#dialog?.open)return;
  this.#request(action,state);
 }
 #cancel(event:Event):void {
  event.preventDefault();if(!this.state.guardDismiss)this.#request('escape');
 }
 #closed():void {
  if(!this.isConnected||!this.open||this.#dialog?.open)return;
  if(!this.state.guardDismiss)this.#request('native');this.requestUpdate();
 }
 #outside(event:MouseEvent):boolean{
  if(event.target!==event.currentTarget)return false;
  const {left,right,top,bottom}=(event.currentTarget as HTMLElement).getBoundingClientRect();
  return event.clientX<left||event.clientX>=right||event.clientY<top||event.clientY>=bottom;
 }
 #pointerDown(event:PointerEvent):void{this.#scrimPointer=event.isPrimary&&event.button===0&&this.#outside(event);}
 #pointerCancel():void{this.#scrimPointer=false;}
 #click(event:MouseEvent):void {
  const started=this.#scrimPointer;this.#scrimPointer=false;
  if(started&&this.#outside(event)&&!this.state.guardDismiss)this.#request('scrim');
 }
 #slotChanged(event:Event):void{
  const populated=(event.currentTarget as HTMLSlotElement).assignedElements().length>0;
  if(populated!==this.#footer){this.#footer=populated;this.requestUpdate();}
 }
 #syncScroll=():void=>{
  const dialog=this.#dialog;if(!dialog?.open)return;
  const body=dialog.querySelector<HTMLElement>('.body')!,wrapper=body.parentElement!;
  const offset=Number.parseFloat(getComputedStyle(body).getPropertyValue('--safe-area-inset-bottom'))||0;
  wrapper.toggleAttribute('data-top',body.scrollTop>4);
  wrapper.toggleAttribute('data-bottom',body.scrollHeight-body.clientHeight>body.scrollTop+offset+4);
  dialog.querySelector('.header')!.toggleAttribute('data-scrolled',body.scrollTop>0);
 };
 protected render(){
  const state=this.state;
  return html`<dialog part="dialog" role=${state.kind==='alert'?'alertdialog':nothing} aria-labelledby="dialog-title"
   aria-describedby=${state.description?'dialog-description':nothing} data-kind=${state.kind} data-width=${state.width}
   @cancel=${this.#cancel} @close=${this.#closed} @pointerdown=${this.#pointerDown} @pointercancel=${this.#pointerCancel} @click=${this.#click}>
   <header class="header" part="header"><vyp-ha-button class="close" part="close" .state=${buttonState({label:state.closeLabel,variant:'plain',iconOnly:true})}
    @ha-press-request=${(event:Event)=>this.#fromButton('close',state,event)}><svg slot="leading" viewBox="0 0 24 24" aria-hidden="true"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12Z"></path></svg></vyp-ha-button>
    <div class="heading"><h2 id="dialog-title" class="title" part="title">${state.title}</h2>${state.subtitle?html`<p class="subtitle" part="subtitle">${state.subtitle}</p>`:nothing}</div>
   </header>
   <div class="content-wrapper"><div class="body" part="body" @scroll=${this.#syncScroll}><div class="content">
    ${state.description?html`<p id="dialog-description" class="description">${state.description}</p>`:nothing}<slot></slot>
   </div></div><div class="fade-top" aria-hidden="true"></div><div class="fade-bottom" aria-hidden="true"></div></div>
   <footer class="footer" part="footer" ?hidden=${!this.#footer&&!state.cancelLabel&&!state.confirmLabel}><slot name="footer" @slotchange=${this.#slotChanged}>
    ${state.cancelLabel?html`<vyp-ha-button data-action="cancel" .state=${buttonState({label:state.cancelLabel,variant:'neutral'})}
     @ha-press-request=${(event:Event)=>this.#fromButton('cancel',state,event)}></vyp-ha-button>`:nothing}
    ${state.confirmLabel?html`<vyp-ha-button data-action="confirm" .disabled=${state.confirmDisabled}
     .state=${buttonState({label:state.confirmLabel,variant:state.confirmTone,loading:state.pending,loadingLabel:state.pendingLabel})}
     @ha-press-request=${(event:Event)=>this.#fromButton('confirm',state,event)}></vyp-ha-button>`:nothing}
   </slot></footer></dialog>`;
 }
}
export function registerDialog(registry:CustomElementRegistry|undefined=globalThis.customElements):void {
 if(registry===undefined||typeof document==='undefined')throw new Error('registerDialog requires a browser CustomElementRegistry');
 const existing=registry.get('vyp-ha-dialog');
 if(existing!==undefined&&existing!==HaDialog)throw new Error('vyp-ha-dialog registration conflict; use one reviewed package cohort');
 registerButton(registry);if(existing===undefined)registry.define('vyp-ha-dialog',HaDialog);
}
declare global{interface HTMLElementTagNameMap{'vyp-ha-dialog':HaDialog;}interface HTMLElementEventMap{'ha-dialog-request':DialogRequestEvent;}}
