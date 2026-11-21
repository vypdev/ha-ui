import {createApp,h,shallowRef} from 'vue';
import {TextArea} from '@vypdev/ha-ui-vue';
import {registerTextArea,type TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
import {noteState,noteTheme,initialNote} from './textarea-model.js';
registerTextArea();
const value=shallowRef(initialNote),events=shallowRef(0),saved=shallowRef(''),disabled=shallowRef(false),readOnly=shallowRef(false),visible=shallowRef(true),reject=shallowRef(false),spanish=shallowRef(false),dark=shallowRef(false);
const observe=(event:TextAreaValueEvent)=>{events.value++;if(reject.value)event.preventDefault();};
createApp({render:()=>h('section',{style:noteTheme(dark.value)},[
  h('button',{onClick:()=>{reject.value=!reject.value;}},'Reject note changes'),h('button',{onClick:()=>{disabled.value=!disabled.value;}},'Toggle note disabled'),
  h('button',{onClick:()=>{readOnly.value=!readOnly.value;}},'Toggle note readonly'),h('button',{onClick:()=>{visible.value=!visible.value;}},'Toggle note'),
  h('button',{onClick:()=>{value.value='Programmatic\n😀';}},'Set note value'),h('button',{onClick:()=>{spanish.value=!spanish.value;}},'Switch note language'),h('button',{onClick:()=>{dark.value=!dark.value;}},'Toggle note theme'),
  h('output',{'aria-label':'Note model'},value.value),h('output',{'aria-label':'Note events'},String(events.value)),h('output',{'aria-label':'Saved note'},saved.value),
  h('form',{'aria-label':'Note form',onSubmit:(event:SubmitEvent)=>{event.preventDefault();saved.value=JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)]);}},[
    h('fieldset',null,[visible.value?h(TextArea,{state:noteState(spanish.value,readOnly.value),modelValue:value.value,'onUpdate:modelValue':(next:string)=>{value.value=next;},name:'note',defaultValue:initialNote,disabled:disabled.value,onValueRequest:observe}):null]),
    h('button',{type:'submit'},'Save note'),h('button',{type:'reset'},'Reset note'),
  ]),
])}).mount('main');
