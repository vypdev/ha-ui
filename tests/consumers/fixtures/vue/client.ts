import {createApp,h,shallowRef} from 'vue';
import {Tabs,TextField} from '@vypdev/ha-ui-vue';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {registerField,type FieldValueEvent} from '@vypdev/ha-ui/field';
import {model,fieldModel} from './model.js';
registerTabs();registerField();
createApp({setup(){
  const state=shallowRef(model()),spanish=shallowRef(false),dark=shallowRef(false),disabled=shallowRef(false),visible=shallowRef(true),count=shallowRef(0);
  const value=shallowRef('Kitchen'),fieldDisabled=shallowRef(false),fieldVisible=shallowRef(true),reject=shallowRef(false),fieldEvents=shallowRef(0),saved=shallowRef('');
  const observe=(event:FieldValueEvent)=>{fieldEvents.value++;if(reject.value)event.preventDefault();};
  const save=(event:Event)=>{event.preventDefault();const form=event.currentTarget as HTMLFormElement;if(form.reportValidity())saved.value=JSON.stringify([...new FormData(form,(event as SubmitEvent).submitter)]);};
  const select=(event:NavigationSelectionEvent)=>{event.preventDefault();state.value=model(spanish.value,event.detail.id,disabled.value);count.value++;};
  const language=()=>{spanish.value=!spanish.value;state.value=model(spanish.value,state.value.selected!,disabled.value);};
  const toggleDisabled=()=>{disabled.value=!disabled.value;state.value=model(spanish.value,'overview',disabled.value);};
  return ()=>h('section',{style:{backgroundColor:dark.value?'rgb(20,20,20)':'rgb(255,255,255)','--error-color':dark.value?'#f28b82':'#b3261e','--divider-color':dark.value?'rgb(66,66,66)':'rgb(224,224,224)','--primary-text-color':dark.value?'rgb(235,235,235)':'rgb(28,28,28)','--secondary-text-color':dark.value?'rgb(189,189,189)':'rgb(89,89,89)','--card-background-color':dark.value?'rgb(20,20,20)':'rgb(255,255,255)'}},[
    h('button',{onClick:language},'Switch language'),h('button',{onClick:()=>dark.value=!dark.value},'Toggle theme'),
    h('button',{onClick:toggleDisabled},'Toggle disabled'),h('button',{onClick:()=>visible.value=!visible.value},'Toggle component'),
    h('output',{'aria-label':'Selection events'},String(count.value)),
    visible.value?h(Tabs,{state:state.value,onSelectionRequest:select},{default:()=>h('button',{slot:'tasks'},'Add task')}):null,
    h('button',{onClick:()=>value.value='Programmatic'},'Set field value'),h('button',{onClick:()=>reject.value=!reject.value},'Reject field changes'),
    h('button',{onClick:()=>fieldDisabled.value=!fieldDisabled.value},'Toggle field disabled'),h('button',{onClick:()=>fieldVisible.value=!fieldVisible.value},'Toggle field'),
    h('output',{'aria-label':'Field model'},value.value),h('output',{'aria-label':'Field events'},String(fieldEvents.value)),h('output',{'aria-label':'Saved task'},saved.value),
    h('form',{'aria-label':'Task form',onSubmit:save},[fieldVisible.value?h(TextField,{state:fieldModel(spanish.value),modelValue:value.value,'onUpdate:modelValue':(next:string)=>value.value=next,name:'task',defaultValue:'Kitchen',disabled:fieldDisabled.value,onValueRequest:observe}):null,
      h('button',{type:'submit',name:'action',value:'save'},'Save task'),h('button',{type:'reset'},'Reset task')]),
  ]);
}}).mount(document.querySelector('main')!);
