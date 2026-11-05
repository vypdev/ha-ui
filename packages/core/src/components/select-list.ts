import {css,html,nothing} from 'lit';
import {checkboxCheckPath} from '../checkbox-mark.js';
import type {SelectOption,SelectSelection,SelectState} from '../select-contracts.js';

export const selectListStyles=css`
 .visible-list{display:grid;min-width:0;}.choice-options{display:grid;min-width:0;}
 .visible-list[data-single] #list-label{margin-block-end:.5em;}.visible-list[data-single] .choice-options{gap:.75em;}
 .choice-row{position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;min-width:0;min-height:40px;cursor:pointer;user-select:none;}
 .visible-list[data-single] .choice-row{align-items:flex-start;gap:0;min-height:44px;}
 .choice-input{position:absolute;inset:0;width:100%;height:100%;box-sizing:border-box;margin:0;padding:0;opacity:0;cursor:inherit;}
 .choice-copy{min-width:0;line-height:1;overflow-wrap:anywhere;}.visible-list[data-single] .choice-copy{display:inline-flex;align-items:center;align-self:stretch;line-height:1.2;}
 .choice-mark{--choice-size:var(--ha-checkbox-size,20px);box-sizing:border-box;display:inline-flex;position:relative;flex:0 0 var(--choice-size);width:var(--choice-size);height:var(--choice-size);align-items:center;justify-content:center;border:var(--ha-checkbox-border-width,var(--ha-border-width-md,2px)) solid var(--ha-checkbox-border-color,var(--ha-color-border-neutral-normal,#989898));border-radius:var(--ha-checkbox-border-radius,var(--ha-border-radius-sm,4px));background:var(--ha-checkbox-background-color,var(--wa-form-control-background-color,transparent));pointer-events:none;}
 .visible-list[data-single] .choice-mark{--choice-size:var(--ha-radio-option-toggle-size,20px);margin:var(--ha-radio-option-control-margin,12px 8px 12px 12px);border-width:var(--ha-radio-option-border-width,var(--ha-border-width-md,2px));border-color:var(--ha-radio-option-border-color,var(--ha-color-border-neutral-normal,#989898));border-radius:50%;background:var(--ha-radio-option-background-color,var(--wa-form-control-background-color,transparent));}
 .choice-row:has(input:checked) .choice-mark{background:var(--ha-checkbox-checked-background-color,var(--ha-color-fill-primary-loud-resting,var(--primary-color,#009ac7)));border-color:var(--ha-checkbox-checked-background-color,var(--ha-color-fill-primary-loud-resting,var(--primary-color,#009ac7)));color:var(--ha-checkbox-checked-icon-color,var(--ha-color-on-primary-loud,#fff));}
 .visible-list[data-single] .choice-row:has(input:checked) .choice-mark{background:var(--ha-radio-option-checked-background-color,var(--ha-color-fill-primary-normal-resting,#dff3fc));color:var(--ha-radio-option-checked-icon-color,var(--ha-color-fill-primary-loud-resting,var(--primary-color,#009ac7)));border-color:currentColor;}
 .choice-row:hover:has(input:not(:checked):not(:disabled)) .choice-mark{background:var(--ha-checkbox-background-color-hover,var(--ha-color-form-background-hover,#e6e6e6));border-color:var(--ha-checkbox-border-color-hover,var(--ha-checkbox-border-color,var(--ha-color-border-neutral-loud,#5e5e5e)));}
 .choice-row:hover:has(input:checked:not(:disabled)) .choice-mark{background:var(--ha-checkbox-checked-background-color-hover,var(--ha-color-fill-primary-loud-hover,#006787));border-color:var(--ha-checkbox-checked-background-color-hover,var(--ha-color-fill-primary-loud-hover,#006787));}
 .visible-list[data-single] .choice-row:hover:has(input:not(:checked):not(:disabled)) .choice-mark{background:var(--ha-radio-option-background-color-hover,var(--ha-color-fill-neutral-quiet-hover,#e6e6e6));border-color:var(--ha-radio-option-border-color-hover,var(--ha-radio-option-border-color,var(--ha-color-border-neutral-loud,#5e5e5e)));}
 .visible-list[data-single] .choice-row:hover:has(input:checked:not(:disabled)) .choice-mark{background:var(--ha-radio-option-checked-background-color,var(--ha-color-fill-primary-normal-resting,#dff3fc));border-color:currentColor;}
 .choice-row:has(input:focus-visible) .choice-mark{outline:var(--vyp-ha-focus-ring,var(--wa-focus-ring,solid 2px #989898));outline-offset:var(--wa-focus-ring-offset,2px);}
 .choice-row:has(input:disabled){opacity:.5;cursor:not-allowed;}
 .choice-check-icon{display:flex;width:1.25em;height:1em;align-items:center;justify-content:center;scale:var(--ha-checkbox-checked-icon-scale,.9);}
 /* Preserve the Web Awesome checkbox icon's inline translation and overflow. */
 .choice-check-icon svg{display:block;width:auto;height:1em;overflow:visible;translate:.000976563em;}
 .choice-radio-icon{display:block;width:100%;height:20px;scale:var(--ha-radio-option-checked-icon-scale,.7);fill:currentColor;}
 .choice-row:has(input:not(:checked)) svg{visibility:hidden;}
 .list-field .picker-help{margin:0;}
`;

function choiceProjection(state:SelectState,value:SelectSelection,option:SelectOption,disabled:boolean){
 const checked=state.multiple?Array.isArray(value)&&value.includes(option.value):value===option.value;
 return{checked,disabled:disabled||option.disabled||!checked&&state.multiple&&Array.isArray(value)&&value.length>=256};
}

/** Restore the controlled native properties immediately after a native selection attempt. */
export function syncSelectList(root:ShadowRoot|null,state:SelectState,value:SelectSelection,disabled:boolean):void{
 root?.querySelectorAll<HTMLInputElement>('.choice-input').forEach((input,index)=>{
  const option=state.options[index];
  if(option===undefined){input.disabled=true;input.checked=false;return;}
  const current=choiceProjection(state,value,option,disabled);input.disabled=current.disabled;input.checked=current.checked;
 });
}

export function renderSelectList(state:SelectState,value:SelectSelection,disabled:boolean,described:string,invalid:boolean,change:(index:number,event:Event)=>void){
 const description=[described,state.multiple&&state.required?'list-required':''].filter(Boolean).join(' ');
 return html`<div class="visible-list" part="list" ?data-single=${!state.multiple} role=${state.multiple?'group':'radiogroup'} aria-labelledby="list-label" aria-required=${state.multiple?nothing:String(state.required)} aria-invalid=${String(invalid)} aria-disabled=${String(disabled)} aria-describedby=${description||nothing}>
  <div id="list-label" part="list-label">${state.label}</div>
  ${state.multiple&&state.required?html`<span class="accessible-label" id="list-required">${state.requiredMessage}</span>`:nothing}
  ${state.options.length===0?html`<span class="accessible-label" role="status">${state.emptyMessage}</span>`:html`<div class="choice-options">${state.options.map((option,index)=>{
   const current=choiceProjection(state,value,option,disabled);
   return html`<label class="choice-row" part="option"><input class="choice-input" id=${'list-option-'+index} type=${state.multiple?'checkbox':'radio'} name=${state.multiple?nothing:'visible-choice'} .value=${String(index)} .checked=${current.checked} ?disabled=${current.disabled} aria-describedby=${description||nothing} @change=${(event:Event)=>change(index,event)}>
    <span class="choice-mark" part="indicator" aria-hidden="true">${state.multiple?html`<span class="choice-check-icon"><svg viewBox="0 0 448 512"><path fill="currentColor" d=${checkboxCheckPath}></path></svg></span>`:html`<svg class="choice-radio-icon" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>`}</span><span class="choice-copy">${option.label}</span></label>`;
  })}</div>`}
 </div>`;
}
