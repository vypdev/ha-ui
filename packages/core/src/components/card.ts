import {LitElement,css,nothing} from 'lit';
import {html,literal} from 'lit/static-html.js';
import {cardState,type CardState} from '../card-contracts.js';

const headings={1:literal`h1`,2:literal`h2`,3:literal`h3`,4:literal`h4`,5:literal`h5`,6:literal`h6`};
const projection='[data-vyp-ha-card-projection]';
function hasContent(node:Node):boolean{
 if(node instanceof Text)return node.data.trim()!=='';
 return node instanceof Element&&(!node.matches(projection)||Array.from(node.childNodes).some(hasContent));
}
function populated(slot:HTMLSlotElement):boolean{
 return slot.assignedNodes({flatten:true}).some(hasContent);
}
/** One native article, with application-owned light DOM content and actions. */
export class HaCard extends LitElement {
 static properties={state:{attribute:false,noAccessor:true}};
 // Surface and header paint follow HA's ha-card; see NOTICE.
 static styles=css`
  :host{display:block;min-width:0;}:host([hidden]){display:none;}
  .card{box-sizing:border-box;position:relative;min-width:0;margin:0;
   background:var(--vyp-ha-surface-raised,var(--ha-card-background,var(--card-background-color,#fff)));
   backdrop-filter:var(--ha-card-backdrop-filter,none);box-shadow:var(--ha-card-box-shadow,none);
   border:var(--ha-card-border-width,1px) solid var(--vyp-ha-border,var(--ha-card-border-color,var(--divider-color,#e0e0e0)));
   border-radius:var(--ha-card-border-radius,var(--ha-border-radius-lg,12px));
   color:var(--vyp-ha-text,var(--primary-text-color,#141414));overflow-wrap:anywhere;
   transition:background-color var(--vyp-ha-motion-duration,300ms) ease-out,border-color var(--vyp-ha-motion-duration,300ms) ease-out,box-shadow var(--vyp-ha-motion-duration,300ms) ease-out;}
  .card[data-raised]{border:none;box-shadow:var(--ha-card-box-shadow,0 2px 1px -1px rgba(0,0,0,.2),0 1px 1px 0 rgba(0,0,0,.14),0 1px 3px 0 rgba(0,0,0,.12));}
  .heading{display:block;margin:0;color:var(--ha-card-header-color,var(--vyp-ha-text,var(--primary-text-color,#141414)));
   font-family:var(--ha-card-header-font-family,inherit);font-size:var(--ha-card-header-font-size,var(--ha-font-size-2xl,24px));
   font-weight:var(--ha-font-weight-normal,400);letter-spacing:-.012em;line-height:var(--ha-line-height-condensed,1.2);
   padding:var(--ha-space-5,20px) var(--ha-space-4,16px) var(--ha-space-6,24px);}
  .content{padding:var(--ha-space-4,16px);}
  .heading+.content{padding-block-start:0;margin-block-start:calc(var(--ha-space-2,8px) * -1);}
  .actions{border-block-start:1px solid var(--divider-color,#e8e8e8);padding-inline:var(--ha-space-2,8px);
   padding-block:var(--vyp-ha-card-actions-padding-block,calc(var(--ha-space-2,8px) - 2px));}
  [hidden]{display:none;}
  @media(prefers-reduced-motion:reduce){.card{transition:none;}}
 `;
 #state=cardState({});#body=false;#actions=false;
 #projectionChanges=new MutationObserver(records=>{
  const actionWrapper=this.querySelector(':scope > [slot=actions]'+projection);
  if(records.some(({target})=>target.parentNode===this||actionWrapper?.contains(target)))this.#slots();
 });
 get state():CardState{return this.#state;}
 set state(raw:CardState){const next=cardState(raw),previous=this.#state;this.#state=next;this.requestUpdate('state',previous);}
 connectedCallback():void{super.connectedCallback();if(this.hasUpdated){this.#observeProjection();this.#slots();}}
 disconnectedCallback():void{this.#projectionChanges.disconnect();super.disconnectedCallback();}
 protected firstUpdated():void{this.#observeProjection();}
 #observeProjection():void{this.#projectionChanges.observe(this,{childList:true,characterData:true,subtree:true});}
 #slots=():void=>{
  const root=this.shadowRoot!;
  const body=populated(root.querySelector<HTMLSlotElement>('slot:not([name])')!),actions=populated(root.querySelector<HTMLSlotElement>('slot[name=actions]')!);
  if(body===this.#body&&actions===this.#actions)return;
  this.#body=body;this.#actions=actions;this.requestUpdate();
 };
 protected render(){
  const state=this.state,tag=headings[state.headingLevel];
  return html`<article class="card" part="card" ?data-raised=${state.raised} aria-labelledby=${state.title?'card-title':nothing}>
   ${state.title?html`<${tag} class="heading" id="card-title" part="heading">${state.title}</${tag}>`:nothing}
   <div class="content" part="body" ?hidden=${!this.#body}><slot @slotchange=${this.#slots}></slot></div>
   <div class="actions" part="actions" ?hidden=${!this.#actions}><slot name="actions" @slotchange=${this.#slots}></slot></div>
  </article>`;
 }
}
export function registerCard(registry:CustomElementRegistry|undefined=globalThis.customElements):void{
 if(registry===undefined||typeof document==='undefined')throw new Error('registerCard requires a browser CustomElementRegistry');
 const current=registry.get('vyp-ha-card');if(current!==undefined&&current!==HaCard)throw new Error('vyp-ha-card registration conflict; use one reviewed package cohort');
 if(current===undefined)registry.define('vyp-ha-card',HaCard);
}
declare global{interface HTMLElementTagNameMap{'vyp-ha-card':HaCard;}}
