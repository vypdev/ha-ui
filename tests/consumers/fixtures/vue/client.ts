import {createApp,h,shallowRef} from 'vue';
import {Tabs,TextField,Button,Select,Checkbox,Dialog,Card,Grid,Row} from '@vypdev/ha-ui-vue';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {registerField,type FieldValueEvent} from '@vypdev/ha-ui/field';
import {registerButton,type ButtonPressEvent} from '@vypdev/ha-ui/button';
import {registerCheckbox,type CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
import {registerSelect,type SelectValueEvent} from '@vypdev/ha-ui/select';
import type {SelectMode,SelectSelection} from '@vypdev/ha-ui/select-contracts';
import {model,fieldModel,actionModel,resetModel,categoryModel,categoryAction,checkModel,checkAction} from './model.js';
import {registerDialog,type DialogRequestEvent} from '@vypdev/ha-ui/dialog';
import {dialogState,type DialogRequestDetail} from '@vypdev/ha-ui/dialog-contracts';
import {registerCard} from '@vypdev/ha-ui/card';
import {cardState} from '@vypdev/ha-ui/card-contracts';
import {registerGrid,registerRow} from '@vypdev/ha-ui/layout';
import {gridState,rowState} from '@vypdev/ha-ui/layout-contracts';
registerTabs();registerField();registerButton();registerSelect();registerCheckbox();registerDialog();registerCard();registerGrid();registerRow();
const taskDialog=dialogState({title:'Review household task',description:'Review the task before making changes.',confirmLabel:'Confirm task'});
const nativeHostAttributes={title:'Vue host attributes','aria-description':'Installed Vue host attributes','data-host-attributes':'forwarded'};
createApp({setup(){
  const state=shallowRef(model()),spanish=shallowRef(false),dark=shallowRef(false),disabled=shallowRef(false),visible=shallowRef(true),count=shallowRef(0);
  const dialogOpen=shallowRef(false),dialogMounted=shallowRef(true),dialogReject=shallowRef(false),dialogAction=shallowRef(''),dialogRequests=shallowRef(0);
  const cardReviewed=shallowRef(false),cardVisible=shallowRef(true);
  const layoutReviewed=shallowRef(false);
  const showDialog=()=>{dialogMounted.value=true;dialogAction.value='';dialogOpen.value=true;};
  const dialogRequest=(event:DialogRequestEvent)=>{dialogRequests.value++;if(dialogReject.value&&event.detail.action==='confirm')event.preventDefault();};
  const acceptDialog=({action}:DialogRequestDetail)=>{dialogAction.value=action;dialogOpen.value=false;};
  const value=shallowRef('Kitchen'),fieldDisabled=shallowRef(false),fieldVisible=shallowRef(true),reject=shallowRef(false),fieldEvents=shallowRef(0),saved=shallowRef('');
  const busy=shallowRef(false),buttonDisabled=shallowRef(false),buttonVisible=shallowRef(true),cancelPress=shallowRef(false),icons=shallowRef(true),presses=shallowRef(0),accepted=shallowRef(0),submits=shallowRef(0),metadata=shallowRef(false);
  const press=(event:ButtonPressEvent)=>{presses.value++;if(cancelPress.value)event.preventDefault();};
  const category=shallowRef<SelectSelection>(1),categoryMultiple=shallowRef(false),categoryPresentation=shallowRef<SelectMode>('auto'),categoryDisabled=shallowRef(false),categoryVisible=shallowRef(true),categoryReject=shallowRef(false),categoryAvailable=shallowRef(true),categoryEvents=shallowRef(0),categorySaved=shallowRef(''),categorySubmits=shallowRef(0);
  const checked=shallowRef(false),mixed=shallowRef(true),checkDisabled=shallowRef(false),checkVisible=shallowRef(true),checkReject=shallowRef(false),checkPayload=shallowRef(false),checkEvents=shallowRef(0),checkSaved=shallowRef(''),checkSubmits=shallowRef(0);
  const checkRequest=(event:CheckboxChangeEvent)=>{checkEvents.value++;if(checkReject.value)event.preventDefault();};
  const checkAccept=(next:boolean)=>{checked.value=next;mixed.value=false;};
  const checkSave=(event:Event)=>{event.preventDefault();checkSaved.value=JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)]);checkSubmits.value++;};
  const categoryRequest=(event:SelectValueEvent)=>{categoryEvents.value++;if(categoryReject.value)event.preventDefault();};
  const categorySave=(event:Event)=>{event.preventDefault();categorySaved.value=JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)]);categorySubmits.value++;};
  const observe=(event:FieldValueEvent)=>{fieldEvents.value++;if(reject.value)event.preventDefault();};
  const save=(event:Event)=>{event.preventDefault();const form=event.currentTarget as HTMLFormElement;if(form.reportValidity()){saved.value=JSON.stringify([...new FormData(form,(event as SubmitEvent).submitter)]);submits.value++;metadata.value=(event as SubmitEvent).submitter===form.querySelector('vyp-ha-button')!.submitter;}};
  const select=(event:NavigationSelectionEvent)=>{event.preventDefault();state.value=model(spanish.value,event.detail.id,disabled.value);count.value++;};
  const language=()=>{spanish.value=!spanish.value;state.value=model(spanish.value,state.value.selected!,disabled.value);};
  const toggleDisabled=()=>{disabled.value=!disabled.value;state.value=model(spanish.value,'overview',disabled.value);};
  return ()=>h('section',{style:{backgroundColor:dark.value?'rgb(20,20,20)':'rgb(255,255,255)','--error-color':dark.value?'#f28b82':'#b3261e','--divider-color':dark.value?'rgb(66,66,66)':'rgb(224,224,224)','--primary-text-color':dark.value?'rgb(235,235,235)':'rgb(28,28,28)','--secondary-text-color':dark.value?'rgb(189,189,189)':'rgb(89,89,89)','--card-background-color':dark.value?'rgb(20,20,20)':'rgb(255,255,255)'}},[
    h('button',{onClick:language},'Switch language'),h('button',{onClick:()=>dark.value=!dark.value},'Toggle theme'),
    h('button',{onClick:toggleDisabled},'Toggle disabled'),h('button',{onClick:()=>visible.value=!visible.value},'Toggle component'),
    h('output',{'aria-label':'Selection events'},String(count.value)),
    visible.value?h(Tabs,{...nativeHostAttributes,state:state.value,onSelectionRequest:select},{default:()=>h('button',{slot:'tasks'},'Add task')}):null,
    h('button',{onClick:()=>value.value='Programmatic'},'Set field value'),h('button',{onClick:()=>reject.value=!reject.value},'Reject field changes'),
    h('button',{onClick:()=>fieldDisabled.value=!fieldDisabled.value},'Toggle field disabled'),h('button',{onClick:()=>fieldVisible.value=!fieldVisible.value},'Toggle field'),
    h('output',{'aria-label':'Field model'},value.value),h('output',{'aria-label':'Field events'},String(fieldEvents.value)),h('output',{'aria-label':'Saved task'},saved.value),
    h('button',{onClick:()=>busy.value=!busy.value},'Toggle button busy'),h('button',{onClick:()=>buttonDisabled.value=!buttonDisabled.value},'Toggle button disabled'),h('button',{onClick:()=>cancelPress.value=!cancelPress.value},'Cancel button request'),h('button',{onClick:()=>icons.value=!icons.value},'Toggle button icons'),h('button',{onClick:()=>buttonVisible.value=!buttonVisible.value},'Toggle action button'),
    h('output',{'aria-label':'Press events'},String(presses.value)),h('output',{'aria-label':'Accepted presses'},String(accepted.value)),h('output',{'aria-label':'Submit events'},String(submits.value)),h('output',{'aria-label':'Button metadata'},String(metadata.value)),
    h('form',{'aria-label':'Task form',onSubmit:save},[fieldVisible.value?h(TextField,{...nativeHostAttributes,state:fieldModel(spanish.value),modelValue:value.value,'onUpdate:modelValue':(next:string)=>value.value=next,name:'task',defaultValue:'Kitchen',disabled:fieldDisabled.value,onValueRequest:observe}):null,
      buttonVisible.value?h(Button,{...nativeHostAttributes,id:'bound-submit',state:actionModel(spanish.value,busy.value),type:'submit',name:'action',value:'save',disabled:buttonDisabled.value,onPressRequest:press,onPress:()=>accepted.value++},icons.value?{leading:()=>h('span','+')}:{}):null,h(Button,{...nativeHostAttributes,state:resetModel(),type:'reset'})]),
    h(Grid,{id:'bound-layout',style:{width:'480px'},state:gridState({columns:layoutReviewed.value?2:3,minColumnWidth:150,label:layoutReviewed.value?'Reviewed layout':'Household layout'})},
      {default:()=>h('div',{role:'list'},[h(Row,{state:rowState({label:layoutReviewed.value?'Reviewed supplies':'Inspect supplies',description:'Shopping list'})},
       {trailing:()=>h('button',{onClick:()=>layoutReviewed.value=true},'Review list row')})])}),
    h('button',{onClick:()=>cardVisible.value=!cardVisible.value},'Toggle task card'),
    cardVisible.value?h(Card,{id:'bound-card',state:cardState({title:cardReviewed.value?'Reviewed tasks':'Household tasks',headingLevel:cardReviewed.value?3:2,raised:cardReviewed.value})},
      {default:()=>h('p','Check the shared shopping list.'),actions:()=>cardReviewed.value?null:h('button',{onClick:()=>cardReviewed.value=true},'Review card task')}):null,
    h('button',{onClick:showDialog},'Open task dialog'),h('button',{onClick:()=>dialogReject.value=!dialogReject.value},'Toggle confirmation rejection'),
    h('output',{'aria-label':'Dialog action'},dialogAction.value),h('output',{'aria-label':'Dialog requests'},String(dialogRequests.value)),
    dialogMounted.value?h(Dialog,{id:'bound-dialog',state:taskDialog,open:dialogOpen.value,onRequest:dialogRequest,onAction:acceptDialog},{default:()=>[
      h('p','Task details'),h('button',{onClick:()=>{dialogOpen.value=false;dialogMounted.value=false;}},'Remove task dialog')]}):null,
    h('button',{onClick:()=>{categoryMultiple.value=!categoryMultiple.value;category.value=categoryMultiple.value?[1,false]:1;}},'Toggle category mode'),h('button',{onClick:()=>category.value=categoryMultiple.value?['1',false]:false},'Set category value'),h('button',{onClick:()=>category.value=categoryMultiple.value?[]:null},'Clear category'),h('button',{onClick:()=>categoryReject.value=!categoryReject.value},'Reject category changes'),h('button',{onClick:()=>categoryDisabled.value=!categoryDisabled.value},'Toggle category disabled'),h('button',{onClick:()=>categoryAvailable.value=!categoryAvailable.value},'Toggle category options'),h('button',{onClick:()=>categoryVisible.value=!categoryVisible.value},'Toggle category'),h('button',{onClick:()=>categoryPresentation.value='dropdown'},'Use category dropdown'),h('button',{onClick:()=>categoryPresentation.value='list'},'Use category list'),
    h('output',{'aria-label':'Category model'},JSON.stringify(category.value)),h('output',{'aria-label':'Category events'},String(categoryEvents.value)),h('output',{'aria-label':'Saved categories'},categorySaved.value),h('output',{'aria-label':'Category submits'},String(categorySubmits.value)),
    h('form',{'aria-label':'Category form',onSubmit:categorySave},[categoryVisible.value?h(Select,{...nativeHostAttributes,id:'bound-category',state:categoryModel(spanish.value,categoryMultiple.value,categoryAvailable.value,categoryPresentation.value),modelValue:category.value,'onUpdate:modelValue':(next:SelectSelection)=>category.value=next,name:'category',defaultValue:categoryMultiple.value?[1,false]:1,disabled:categoryDisabled.value,onValueRequest:categoryRequest}):null,h(Button,{...nativeHostAttributes,state:categoryAction(spanish.value),type:'submit'}),h(Button,{...nativeHostAttributes,state:categoryAction(spanish.value,true),type:'reset'})]),
    h('button',{onClick:()=>checked.value=true},'Set checked'),h('button',{onClick:()=>mixed.value=!mixed.value},'Toggle partial'),h('button',{onClick:()=>checkReject.value=!checkReject.value},'Reject check changes'),h('button',{onClick:()=>checkDisabled.value=!checkDisabled.value},'Toggle check disabled'),h('button',{onClick:()=>checkPayload.value=!checkPayload.value},'Toggle check payload'),h('button',{onClick:()=>checkVisible.value=!checkVisible.value},'Toggle checkbox'),
    h('output',{'aria-label':'Checkbox model'},String(checked.value)),h('output',{'aria-label':'Checkbox events'},String(checkEvents.value)),h('output',{'aria-label':'Saved checkbox'},checkSaved.value),h('output',{'aria-label':'Checkbox submits'},String(checkSubmits.value)),
    h('form',{'aria-label':'Checkbox form',onSubmit:checkSave},[checkVisible.value?h(Checkbox,{...nativeHostAttributes,id:'bound-checkbox',state:checkModel(spanish.value,mixed.value),modelValue:checked.value,'onUpdate:modelValue':checkAccept,name:'notify',value:checkPayload.value?'confirmed':'on',disabled:checkDisabled.value,onCheckedRequest:checkRequest}):null,h(Button,{...nativeHostAttributes,state:checkAction(spanish.value),type:'submit'}),h(Button,{...nativeHostAttributes,state:checkAction(spanish.value,true),type:'reset'})]),
  ]);
}}).mount(document.querySelector('main')!);
