import {LitElement,css,html,nothing,svg} from 'lit';
import {feedbackState,type FeedbackState} from '../feedback-contracts.js';

// Material Design Icons paths used by Home Assistant. See NOTICE.
const icons={
 info:'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z',
 success:'M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z',
 warning:'M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16',
 error:'M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z',
 empty:'M3 16H10V14H3M18 14V10H16V14H12V16H16V20H18V16H22V14M14 6H3V8H14M14 10H3V12H14V10Z',
};
const glyph=(path:string)=>html`<span class="glyph">${svg`<svg viewBox="0 0 24 24" focusable="false"><path d=${path}></path></svg>`}</span>`;
const spinner=html`<span class="spinner" part="spinner" aria-hidden="true">${svg`<svg focusable="false" fill="none"><circle class="track"></circle><circle class="indicator"></circle></svg>`}</span>`;

/** Application-owned presentation and native actions; a stable announcement communicates state. */
export class HaFeedback extends LitElement {
 static properties={state:{attribute:false,noAccessor:true}};
 // HA alert/empty geometry and HA Web Awesome spinner paint. See NOTICE.
 static styles=css`
  :host{display:block;min-width:0;}:host([hidden]){display:none;}
  .surface{box-sizing:border-box;color:var(--vyp-ha-text,var(--primary-text-color,#141414));}
  .content,.announcement{min-width:0;}
  .notice{position:relative;padding:var(--ha-alert-padding,8px);}
  .notice::after{position:absolute;inset:0;pointer-events:none;content:'';opacity:.12;
   background:var(--_tone);border-radius:var(--ha-border-radius-sm,4px);}
  .notice[data-tone=info]{--_tone:var(--info-color,#039be5);}
  .notice[data-tone=success]{--_tone:var(--success-color,#43a047);}
  .notice[data-tone=warning]{--_tone:var(--warning-color,#ffa600);}
  .notice[data-tone=error]{--_tone:var(--error-color,#db4437);}
  .notice .content{display:flex;justify-content:space-between;align-items:center;}
  .notice[data-narrow] .content{flex-direction:column;align-items:stretch;}
  .notice .announcement{display:flex;align-self:stretch;align-items:flex-start;}
  .notice .icon{color:var(--_tone);--_icon-size:var(--ha-alert-icon-size,24px);}
  .notice:not([data-title]) .icon{align-self:center;}
  .notice .text{align-self:center;margin-inline:var(--ha-space-2,8px);line-height:normal;overflow-wrap:anywhere;text-align:start;}
  .notice .title{margin-block-start:2px;font-weight:var(--ha-font-weight-bold,700);}
  .notice .action{position:relative;z-index:1;display:flex;align-items:center;width:max-content;max-width:50%;flex:none;}
  .notice[data-narrow] .action{align-self:flex-end;max-width:100%;}
  .icon,.glyph{width:var(--_icon-size);height:var(--_icon-size);flex:none;}
  .glyph{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;fill:currentColor;}
  .glyph svg{display:block;width:100%;height:100%;}
  .empty{display:flex;justify-content:center;align-items:center;width:100%;height:100%;}
  .empty .content,.empty .announcement{display:flex;flex-direction:column;align-items:center;gap:var(--ha-space-4,16px);}
  .empty .content{box-sizing:border-box;width:max-content;max-width:min(500px,100%);
   padding:var(--ha-space-8,32px) var(--ha-space-4,16px);text-align:center;}
  .empty .announcement{max-width:100%;}
  .empty .text{display:contents;}
  .empty .icon{--_icon-size:var(--ha-empty-state-icon-size,64px);color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#595959));}
  .empty h2{margin:0;font-size:var(--ha-font-size-xl,20px);font-weight:var(--ha-font-weight-medium,500);line-height:var(--ha-line-height-condensed,1.2);overflow-wrap:anywhere;}
  .empty p{margin:0;color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#595959));overflow-wrap:anywhere;}
  .empty .action,.loading .action,slot{display:contents;}
  .loading .content,.loading .announcement{display:flex;align-items:center;gap:var(--ha-space-3,12px);}
  .loading .text{overflow-wrap:anywhere;}
  ::slotted(vyp-ha-button[slot=action]){margin-block:-2px;}
  ::slotted([slot=action][data-vyp-ha-feedback-projection]:empty){display:none;}
  ::slotted([slot=action][data-vyp-ha-feedback-projection]:has(>vyp-ha-button)){margin-block:-2px;}
  ::slotted([slot=icon][data-vyp-ha-feedback-projection]){display:contents;}

  .spinner{display:inline-flex;flex:none;width:var(--_size);height:var(--_size);--_size:var(--ha-spinner-size,28px);--_stroke:4px;}
  .spinner svg{width:100%;height:100%;animation:feedback-spin var(--vyp-ha-motion-duration,3.5s) linear infinite;}
  .track,.indicator{--_radius:calc(var(--_size)/2 - var(--_stroke)/2);--_circumference:calc(var(--_radius)*2*3.14159);
   cx:calc(var(--_size)/2);cy:calc(var(--_size)/2);r:var(--_radius);stroke-width:var(--_stroke);}
  .track{stroke:var(--ha-spinner-divider-color,var(--divider-color,#e0e0e0));}
  .indicator{stroke:var(--ha-spinner-indicator-color,var(--primary-color,#009ac7));stroke-linecap:round;
   stroke-dasharray:calc(.597*var(--_circumference)),calc(.796*var(--_circumference));stroke-dashoffset:calc(-.04*var(--_circumference));
   animation:feedback-dash var(--vyp-ha-motion-duration,1.5s) ease-in-out infinite;}
  @keyframes feedback-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes feedback-dash{
   0%{stroke-dasharray:calc(.008*var(--_circumference)),calc(1.194*var(--_circumference));stroke-dashoffset:0;}
   50%{stroke-dasharray:calc(.716*var(--_circumference)),calc(1.194*var(--_circumference));stroke-dashoffset:calc(-.278*var(--_circumference));}
   100%{stroke-dasharray:calc(.716*var(--_circumference)),calc(1.194*var(--_circumference));stroke-dashoffset:calc(-.987*var(--_circumference));}
  }
  @media(prefers-reduced-motion:reduce){.spinner svg,.indicator{animation:none;}}
 `;
 #state:FeedbackState|undefined;
 get state():FeedbackState|undefined{return this.#state;}
 set state(raw:FeedbackState){const old=this.#state;this.#state=feedbackState(raw);this.requestUpdate('state',old);}
 protected render(){
  const state=this.state;if(!state)return nothing;
  const icon=state.kind==='loading'?spinner:state.icon?html`<div class="icon" part="icon" aria-hidden="true">
   <slot name="icon">${glyph(icons[state.kind==='empty'?'empty':state.tone])}</slot></div>`:nothing;
  const text=state.kind==='empty'?html`<h2>${state.title}</h2>${state.message?html`<p>${state.message}</p>`:nothing}`:
   html`${state.title?html`<div class="title">${state.title}</div>`:nothing}<span>${state.message}</span>`;
  return html`<div part="surface" class=${'surface '+state.kind} data-tone=${state.tone} ?data-narrow=${state.narrow} ?data-title=${Boolean(state.title)}>
   <div class="content"><div part="message" class="announcement" role=${state.tone==='error'?'alert':'status'} aria-atomic="true">
    ${icon}<div class="text">${text}</div>
   </div><div class="action" part="action"><slot name="action"></slot></div></div>
  </div>`;
 }
}
export function registerFeedback(registry:CustomElementRegistry|undefined=globalThis.customElements):void{
 if(registry===undefined||typeof document==='undefined')throw new Error('registerFeedback requires a browser CustomElementRegistry');
 const current=registry.get('vyp-ha-feedback');if(current!==undefined&&current!==HaFeedback)throw new Error('vyp-ha-feedback registration conflict; use one reviewed package cohort');
 if(current===undefined)registry.define('vyp-ha-feedback',HaFeedback);
}
declare global{interface HTMLElementTagNameMap{'vyp-ha-feedback':HaFeedback;}}
