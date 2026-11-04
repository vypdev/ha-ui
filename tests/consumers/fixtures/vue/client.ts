import {createApp,h,shallowRef} from 'vue';
import {Tabs,TextField,Button} from '@vypdev/ha-ui-vue';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {registerField,type FieldValueEvent} from '@vypdev/ha-ui/field';
import {registerButton,type ButtonPressEvent} from '@vypdev/ha-ui/button';
import {model,fieldModel,actionModel,resetModel} from './model.js';
registerTabs();registerField();registerButton();
createApp({setup(){
  const state=shallowRef(model()),spanish=shallowRef(false),dark=shallowRef(false),disabled=shallowRef(false),visible=shallowRef(true),count=shallowRef(0);
  const value=shallowRef('Kitchen'),fieldDisabled=shallowRef(false),fieldVisible=shallowRef(true),reject=shallowRef(false),fieldEvents=shallowRef(0),saved=shallowRef('');
  const busy=shallowRef(false),buttonDisabled=shallowRef(false),buttonVisible=shallowRef(true),cancelPress=shallowRef(false),icons=shallowRef(true),presses=shallowRef(0),accepted=shallowRef(0),submits=shallowRef(0),metadata=shallowRef(false);
  const press=(event:ButtonPressEvent)=>{presses.value++;if(cancelPress.value)event.preventDefault();};
  const observe=(event:FieldValueEvent)=>{fieldEvents.value++;if(reject.value)event.preventDefault();};
  const save=(event:Event)=>{event.preventDefault();const form=event.currentTarget as HTMLFormElement;if(form.reportValidity()){saved.value=JSON.stringify([...new FormData(form,(event as SubmitEvent).submitter)]);submits.value++;metadata.value=(event as SubmitEvent).submitter===form.querySelector('vyp-ha-button')!.submitter;}};
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
    h('button',{onClick:()=>busy.value=!busy.value},'Toggle button busy'),h('button',{onClick:()=>buttonDisabled.value=!buttonDisabled.value},'Toggle button disabled'),h('button',{onClick:()=>cancelPress.value=!cancelPress.value},'Cancel button request'),h('button',{onClick:()=>icons.value=!icons.value},'Toggle button icons'),h('button',{onClick:()=>buttonVisible.value=!buttonVisible.value},'Toggle action button'),
    h('output',{'aria-label':'Press events'},String(presses.value)),h('output',{'aria-label':'Accepted presses'},String(accepted.value)),h('output',{'aria-label':'Submit events'},String(submits.value)),h('output',{'aria-label':'Button metadata'},String(metadata.value)),
    h('form',{'aria-label':'Task form',onSubmit:save},[fieldVisible.value?h(TextField,{state:fieldModel(spanish.value),modelValue:value.value,'onUpdate:modelValue':(next:string)=>value.value=next,name:'task',defaultValue:'Kitchen',disabled:fieldDisabled.value,onValueRequest:observe}):null,
      buttonVisible.value?h(Button,{id:'bound-submit',state:actionModel(spanish.value,busy.value),type:'submit',name:'action',value:'save',disabled:buttonDisabled.value,onPressRequest:press,onPress:()=>accepted.value++},icons.value?{leading:()=>h('span','+')}:{}):null,h(Button,{state:resetModel(),type:'reset'})]),
  ]);
}}).mount(document.querySelector('main')!);
