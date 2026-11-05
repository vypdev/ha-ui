import {LitElement,css,html,nothing} from 'lit';
import {SelectInputError,selectState,selectSelection,selectName,selectValidity,selectEntries,selectRestoreState,selectRestoreValue,type SelectState,type SelectSelection,type SelectValueReason,type SelectValueDetail} from '../select-contracts.js';
import {moveSelectOption,matchSelectOption} from '../select-navigation.js';
import {SelectionPopup} from './selection-popup.js';
export type {SelectValueDetail,SelectValueReason} from '../select-contracts.js';
export type SelectValueEvent=CustomEvent<SelectValueDetail>;
const attributeName={fromAttribute:(value:string|null)=>value??''};
/** Controlled typed selection; one shared renderer and one native form bridge. */
export class HaSelect extends LitElement {
 static formAssociated=true;
 static shadowRootOptions={...LitElement.shadowRootOptions,delegatesFocus:true};
 static properties={state:{attribute:false,noAccessor:true},value:{attribute:false,noAccessor:true},defaultValue:{attribute:false,noAccessor:true},name:{converter:attributeName,noAccessor:true},disabled:{type:Boolean,noAccessor:true}};
 // Geometry adapted from Gateway's MIT field/select catalog; semantic behavior is authored here.
 static styles=css`
  :host{display:block;min-width:0;font:400 14px/1.35 var(--vyp-ha-font-family,var(--primary-font-family,Roboto,Noto,sans-serif));color:var(--vyp-ha-text,var(--primary-text-color,#1c1c1c));}
    :host([hidden]){display:none;}
  .field{display:grid;gap:6px;}label{font-size:14px;line-height:1.35;}
  select{box-sizing:border-box;width:100%;min-width:0;min-height:56px;border:1px solid var(--vyp-ha-border,var(--divider-color,#e0e0e0));border-radius:var(--vyp-ha-field-radius,4px);padding:16px;color:inherit;background:var(--vyp-ha-surface,var(--card-background-color,#fff));font:inherit;}
  select:focus-visible{outline:2px solid var(--vyp-ha-primary,var(--primary-color,#0075b5));outline-offset:1px;}
  select:disabled{opacity:.5;cursor:not-allowed;}select[aria-invalid=true]{border-color:var(--vyp-ha-danger,var(--error-color,#b3261e));}
  .help,.error{font-size:12px;line-height:1.35;}.help{color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#595959));}.error{color:var(--vyp-ha-danger,var(--error-color,#b3261e));}
  .picker-field{display:block;min-width:0;font:400 14px/1.6 var(--vyp-ha-font-family,var(--ha-font-family-body,var(--primary-font-family,Roboto,Noto,sans-serif)));}
  .accessible-label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
  .picker{position:relative;display:flex;box-sizing:border-box;min-width:0;min-height:56px;border-radius:var(--vyp-ha-field-radius,var(--ha-border-radius-sm,4px) var(--ha-border-radius-sm,4px) 0 0);background:var(--vyp-ha-surface,var(--ha-color-form-background,#f3f3f3));}
  .picker::before{content:'';position:absolute;inset:0;z-index:2;border-radius:inherit;background:var(--vyp-ha-text-secondary,var(--secondary-text-color,#5e5e5e));opacity:0;pointer-events:none;transition:opacity var(--vyp-ha-motion-duration,15ms) linear;}
  .picker[data-hovered]:not([data-disabled])::before{opacity:var(--md-ripple-hover-opacity,.08);}
  .picker::after{content:'';position:absolute;inset-inline:0;bottom:0;z-index:3;height:1px;background:var(--vyp-ha-border,var(--ha-color-border-neutral-loud,#5e5e5e));pointer-events:none;}
  .picker:focus-within:not([data-open])::after{height:2px;background:var(--vyp-ha-primary,var(--mdc-theme-primary,var(--primary-color,#00639c)));}
  .picker[data-invalid]::after{height:2px;background:var(--vyp-ha-danger,var(--mdc-theme-error,var(--error-color,#b3261e)));}
  .picker[data-disabled]{background:var(--vyp-ha-surface-disabled,var(--ha-color-form-background-disabled,#ccc));opacity:.5;cursor:not-allowed;}
  .trigger{position:relative;box-sizing:border-box;display:flex;align-items:center;flex:1;gap:8px;min-width:0;width:100%;min-height:56px;padding:0 8px 0 16px;margin:0;border:0;border-radius:inherit;background:transparent;color:inherit;text-align:start;cursor:pointer;outline:none;}
  :host(:dir(rtl)) .trigger{padding:0 16px 0 8px;}
  .trigger:disabled{cursor:not-allowed;opacity:.5;}.text{display:flex;flex:1;flex-direction:column;min-width:0;}
  .overline,.headline{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font:400 14px/1.6 var(--vyp-ha-font-family,var(--ha-font-family-body,var(--primary-font-family,Roboto,Noto,sans-serif)));}
  .overline{font:400 12px/18.4px var(--vyp-ha-font-family,var(--mdc-typography-caption-font-family,Roboto));white-space:normal;overflow-wrap:anywhere;color:var(--vyp-ha-text-secondary,var(--mdc-text-field-label-ink-color,#0009));}
  .headline{color:var(--vyp-ha-text,var(--primary-text-color,#141414));}.headline[data-placeholder]{color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#5e5e5e));}
  .arrow{position:relative;display:block;flex:none;width:32px;height:20px;vertical-align:middle;color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#5e5e5e));fill:currentColor;}.arrow svg{display:block;width:100%;height:100%;pointer-events:none;}.arrow path{opacity:1;}
  .clear{position:absolute;display:flex;align-items:center;justify-content:center;inset-inline-end:34px;top:6px;width:44px;height:44px;padding:4px;border:0;background:transparent;color:var(--vyp-ha-text-secondary,var(--secondary-text-color,#5e5e5e));cursor:pointer;}
  .clear svg{display:block;width:24px;height:24px;fill:currentColor;}.clear:focus-visible{outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px #989898));outline-offset:2px;}
  .picker[data-clearable] .text{padding-inline-end:24px;}
  .picker-help,.picker-error{display:block;min-width:0;margin:8px 0 0;padding:0 16px;font:400 12px/normal var(--vyp-ha-font-family,var(--ha-font-family-body,var(--primary-font-family,Roboto,Noto,sans-serif)));letter-spacing:var(--mdc-typography-caption-letter-spacing,.0333333em);color:var(--vyp-ha-text-secondary,var(--mdc-text-field-label-ink-color,#0009));overflow-wrap:anywhere;}
  .popup{position:fixed;inset:auto;box-sizing:border-box;display:flex;flex-direction:column;width:max-content;min-width:0;margin:0;padding:4px;border:1px solid var(--vyp-ha-border,var(--wa-color-surface-border,#e6e6e6));border-radius:8px;background:var(--vyp-ha-surface-raised,var(--card-background-color,#fff));color:var(--vyp-ha-text,var(--primary-text-color,#141414));box-shadow:var(--wa-shadow-m,0 3px 6px -1px #0000001a,0 8px 16px -2px #00000026);overflow:auto;overscroll-behavior:contain;font:400 14px/1.2 var(--vyp-ha-font-family,var(--ha-font-family-body,var(--primary-font-family,Roboto,Noto,sans-serif)));}
  .popup:not(:popover-open){display:none;}.option{isolation:isolate;box-sizing:border-box;display:flex;align-items:center;flex:none;min-width:0;min-height:40px;padding:7px 14px;border-radius:4px;cursor:pointer;white-space:nowrap;user-select:none;}
  .option[aria-selected=true]{font-weight:500;color:var(--vyp-ha-primary,var(--primary-color,#00639c));background:var(--ha-color-fill-primary-quiet-resting,#eff9fe);}
  .option:hover:not([aria-disabled=true]){background:var(--ha-color-fill-neutral-normal-resting,#e6e6e6);}.option[aria-selected=true]:hover:not([aria-disabled=true]){background:var(--ha-color-fill-primary-quiet-hover,#dff3fc);}
  .option[data-keyboard]{position:relative;z-index:1;outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px #989898));outline-offset:0;background:var(--ha-color-fill-neutral-normal-resting,#e6e6e6);}
  .option[aria-selected=true][data-keyboard]{background:var(--ha-color-fill-primary-quiet-resting,#eff9fe);}.option[aria-disabled=true]{opacity:.5;cursor:not-allowed;}
  @media(prefers-reduced-motion:reduce){.picker::before{transition-duration:min(var(--vyp-ha-motion-duration,1ms),1ms);}}
 `;
 #internals=this.attachInternals();#state=selectState({label:'Value',options:[]});#renderedState:SelectState|null=null;
 #value:SelectSelection=null;#defaultValue:SelectSelection=null;#name='';#disabled=false;#formDisabled=false;#dirty=false;#showValidation=false;#customError='';
 #pending:{reason:SelectValueReason;serialized:string}|null=null;#fromAttribute=false;#restoringAttribute=false;
 #opened=false;#active=-1;#keyboard=false;#search='';#searchUntil=0;#hovered=false;#popup=new SelectionPopup(this,()=>this.#hide());
 constructor(){super();this.addEventListener('invalid',this.#reveal);}
 attributeChangedCallback(name:string,previous:string|null,next:string|null):void{
  if(this.#restoringAttribute)return;
  try{if(name==='name')selectName(next??'');}catch(error){this.#restoringAttribute=true;if(previous===null)this.removeAttribute(name);else this.setAttribute(name,previous);this.#restoringAttribute=false;throw error;}
  this.#fromAttribute=true;super.attributeChangedCallback(name,previous,next);this.#fromAttribute=false;
 }
 get #control():HTMLSelectElement|HTMLButtonElement|null{return this.shadowRoot?.querySelector('#control')??null;}
 get #pickerMode():boolean{return !this.state.multiple&&this.state.size===1;}
 get #selectedIndex():number{return this.value===null||typeof this.value==='object'?-1:this.state.options.findIndex(option=>option.value===this.value);}
 get state():SelectState{return this.#state;}
 set state(raw:SelectState){const next=selectState(raw),previous=this.#state;this.#hide();this.#state=next;this.#sync();this.requestUpdate('state',previous);}
 get value():SelectSelection{return this.#value;}
 set value(raw:SelectSelection){const next=selectSelection(raw),previous=this.#value;this.#dirty=!(this.#pending?.reason==='reset'&&this.#pending.serialized===selectRestoreState(next));this.#hide();this.#value=next;this.#pending=null;this.#sync();this.requestUpdate('value',previous);}
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
 blur():void{this.#hide();this.#control?.blur();}
 formDisabledCallback(disabled:boolean):void{this.#formDisabled=disabled;this.#sync();this.requestUpdate();}
 formResetCallback():void{this.#showValidation=false;this.#hide();this.#request(this.defaultValue,'reset');this.requestUpdate();}
 formStateRestoreCallback(raw:string|File|FormData,mode:'restore'|'autocomplete'):void{if(mode!=='restore'&&mode!=='autocomplete')throw new SelectInputError();const next=selectRestoreValue(raw);this.#hide();this.#request(next,mode);}
 #sync():void{
  const state=this.state,disabled=this.disabled||this.#formDisabled,entries=selectEntries(this.value,state),restoration=selectRestoreState(this.value),control=this.#control;
  if(disabled||!this.name||entries.length===0)this.#internals.setFormValue(null,restoration);
  else if(state.multiple){const data=new FormData();for(const value of entries)data.append(this.name,value);this.#internals.setFormValue(data,restoration);}
  else this.#internals.setFormValue(entries[0],restoration);
  const validity=selectValidity(this.value,state,this.#customError);this.#internals.setValidity(validity.flags,validity.message,control??undefined);
  if(disabled){this.#hide();this.#setHover(false);}
  if(control!==null)control.disabled=disabled;
  if(control instanceof HTMLSelectElement){
   control.multiple=state.multiple;control.size=state.size;
   const value=this.value,selected=typeof value==='object'?value??[]:[value],compatible=value===null||Array.isArray(value)===state.multiple;
   const indexes=new Set(compatible?state.options.flatMap((option,index)=>selected.includes(option.value)?[String(index)]:[]):[]);
   for(const option of control.options)option.selected=indexes.has(option.value);
   if(!state.multiple)control.value=indexes.values().next().value??'';
  }else if(control!==null)control.value=this.#selectedIndex<0?'':String(this.#selectedIndex);
 }
 protected updated():void{
  this.#sync();this.#renderedState=this.state;
  if(this.#opened){const surface=this.shadowRoot!.querySelector<HTMLElement>('#options')!,anchor=this.#control!;if(!this.#popup.opened)this.#popup.show(anchor,surface);else this.#popup.position();this.shadowRoot!.getElementById('option-'+this.#active)?.scrollIntoView({block:'nearest'});}
 }
 disconnectedCallback():void{this.#hide();this.#setHover(false);super.disconnectedCallback();}
 #setHover(value:boolean):void{if(value===this.#hovered)return;this.#hovered=value;this.requestUpdate();}
 #hover(event:PointerEvent):void{
  if(!this.isConnected||event.currentTarget!==this.shadowRoot!.querySelector('.picker')||!event.isPrimary||event.pointerType==='touch')return;
  this.#setHover(event.type==='pointerenter'&&!this.disabled&&!this.#formDisabled);
 }
 #hide():void{this.#popup.close();if(this.#opened){this.#opened=false;this.#active=-1;this.#search='';this.requestUpdate();}}
 #show(keyboard=false):void{
  if(!this.isConnected||this.disabled||this.#formDisabled||!this.#pickerMode||this.#renderedState!==this.state)return;
  this.#opened=true;this.#keyboard=keyboard;this.#active=moveSelectOption(this.state.options,this.#selectedIndex,'next');
  if(this.#selectedIndex>=0&&!this.state.options[this.#selectedIndex].disabled)this.#active=this.#selectedIndex;
  this.requestUpdate();
 }
 #toggle(event:MouseEvent):void{if(event.currentTarget!==this.#control)return;if(this.#opened)this.#hide();else this.#show();}
 #blur():void{this.#hide();this.#reveal();}
 #choose(index:number,state:SelectState,origin?:EventTarget|null):void{
  if(!this.isConnected||this.disabled||this.#formDisabled||state!==this.state||this.#renderedState!==state)return;
  if(origin!==undefined&&origin!==(index<0?this.shadowRoot!.querySelector('.clear'):this.shadowRoot!.getElementById('option-'+index)))return;
  if(index<0){if(!state.clearable||state.required||this.value===null)return;}
  else if(!this.#opened||!this.#popup.opened||state.options[index]?.disabled||state.options[index]===undefined)return;
  const value=index<0?null:state.options[index].value;this.#hide();this.focus();if(value===this.value)return;this.#dirty=true;this.#request(value,'change');
 }
 #key(event:KeyboardEvent):void{
  if(event.currentTarget!==this.#control||this.disabled||this.#formDisabled||!this.#pickerMode||event.altKey||event.ctrlKey||event.metaKey)return;
  const key=event.key,state=this.state;
  if(key==='Escape')return;
  if(key==='Tab'){if(this.#opened){if(this.#active>=0)this.#choose(this.#active,state);else this.#hide();}return;}
  if(key==='Enter'||key===' '){event.preventDefault();if(this.#opened){if(this.#active>=0)this.#choose(this.#active,state);else this.#hide();}else this.#show(true);return;}
  const movement=key==='ArrowDown'?'next':key==='ArrowUp'?'previous':key==='Home'?'first':key==='End'?'last':null;
  if(movement!==null){event.preventDefault();if(!this.#opened){this.#show(true);if(key==='ArrowUp'||key==='Home'||key==='End')this.#active=moveSelectOption(state.options,-1,movement);}else this.#active=moveSelectOption(state.options,this.#active,movement);this.#keyboard=true;this.requestUpdate();return;}
  if([...key].length===1){event.preventDefault();const now=performance.now();this.#search=now>this.#searchUntil?'':this.#search;this.#searchUntil=now+700;this.#search+=key;
   if(!this.#opened)this.#show(true);let query=this.#search;if([...query].every(letter=>letter===key))query=key;
   const index=matchSelectOption(state.options,this.#active,query);if(index>=0)this.#active=index;this.#keyboard=true;this.requestUpdate();}
 }
 #reveal():void{this.#showValidation=true;this.#sync();this.requestUpdate();}
 #request(raw:unknown,reason:SelectValueReason):void{
  try{const value=selectSelection(raw);this.#pending={reason,serialized:selectRestoreState(value)};this.dispatchEvent(new CustomEvent('ha-select-request',{detail:Object.freeze({value,reason}),bubbles:true,composed:true,cancelable:true}));}finally{this.#sync();}
 }
 #change():void{
  if(this.disabled||this.#formDisabled||this.#renderedState!==this.state){this.#sync();return;}
  try{
   const values=[];
   for(const option of (this.#control as HTMLSelectElement).selectedOptions){
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
  if(this.#pickerMode){
   const selected=this.#selectedIndex<0?null:state.options[this.#selectedIndex],clearable=state.clearable&&!state.required&&!this.disabled&&!this.#formDisabled&&selected!==null;
   return html`<div class="picker-field" part="field"><label class="accessible-label" for="control">${state.label}</label>
    <div class="picker" part="control" ?data-disabled=${this.disabled||this.#formDisabled} ?data-invalid=${!!message} ?data-open=${this.#opened} ?data-clearable=${clearable} ?data-hovered=${this.#hovered} @pointerenter=${this.#hover} @pointerleave=${this.#hover}>
     <button class="trigger" id="control" part="select" type="button" role="combobox" aria-label=${state.label} aria-haspopup="listbox" aria-expanded=${String(this.#opened)} aria-controls="options" aria-activedescendant=${this.#opened&&this.#active>=0?'option-'+this.#active:nothing} aria-required=${String(state.required)} aria-invalid=${String(!!message)} aria-describedby=${described||nothing} @click=${this.#toggle} @keydown=${this.#key} @blur=${this.#blur}>
      <span class="text">${selected!==null?html`<span class="overline" part="label">${state.label}${state.required?' *':''}</span>`:nothing}<span class="headline" part="value" ?data-placeholder=${selected===null}>${selected?.label??(state.placeholder||state.label)}${selected===null&&state.required?' *':''}</span></span>
      <span class="arrow" aria-hidden="true"><svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24"><g><path class="primary-path" d="M7,10L12,15L17,10H7Z"></path></g></svg></span>
     </button>
     ${clearable?html`<button class="clear" type="button" aria-label=${state.clearLabel} @click=${(event:MouseEvent)=>this.#choose(-1,state,event.currentTarget)}><svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24"><g><path class="primary-path" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></g></svg></button>`:nothing}
    </div>
    ${state.description?html`<div class="picker-help" id="help" part="help">${state.description}</div>`:nothing}
    ${message?html`<div class="picker-error" id="error" part="error" aria-live="polite">${message}</div>`:nothing}
    <div class="popup" id="options" part="popup" popover="manual" role="listbox" aria-label=${state.label}>
     ${state.options.map((option,index)=>html`<div class="option" id=${'option-'+index} part="option" role="option" aria-selected=${String(index===this.#selectedIndex)} aria-disabled=${String(option.disabled)} ?data-keyboard=${this.#keyboard&&index===this.#active} @pointerdown=${(event:PointerEvent)=>event.preventDefault()} @click=${(event:MouseEvent)=>this.#choose(index,state,event.currentTarget)}>${option.label}</div>`)}
     ${state.options.length===0?html`<div class="option" role="option" aria-disabled="true">${state.emptyMessage}</div>`:nothing}
    </div></div>`;
  }
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
