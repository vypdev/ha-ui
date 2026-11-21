import {html,render} from 'lit';
import {registerTextArea,type TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
import {textAreaState,textAreaValueDetail} from '@vypdev/ha-ui/textarea-contracts';

registerTextArea();
const initial='Lit first\n😀',baseline='Lit baseline\n😀';
let value=initial,events=0;
const target=document.querySelector('main')!;
function paint(){
  render(html`<form aria-label="Installed Lit form">
    <vyp-ha-textarea .state=${textAreaState({label:'Lit notes',required:true,maxLength:1000})}
      .value=${value} .defaultValue=${baseline} .name=${'note'}
      @ha-value-request=${(event:TextAreaValueEvent)=>{const detail=textAreaValueDetail(event.detail);value=detail.value;events++;paint();}}></vyp-ha-textarea>
    <button type="reset">Reset Lit note</button>
  </form><div role="status" aria-label="Lit note model">${value}</div><div aria-label="Lit note events">${events}</div>`,target);
}
paint();
