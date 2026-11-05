import {createElement,useState,StrictMode,type CSSProperties,type SyntheticEvent} from 'react';
import {createRoot} from 'react-dom/client';
import {Tabs,TextField,Button,Select,Checkbox} from '@vypdev/ha-ui-react';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {registerField,type FieldValueEvent} from '@vypdev/ha-ui/field';
import {registerButton,type ButtonPressEvent} from '@vypdev/ha-ui/button';
import {registerCheckbox,type CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
import {registerSelect,type SelectValueEvent} from '@vypdev/ha-ui/select';
import type {SelectSelection} from '@vypdev/ha-ui/select-contracts';
import {model,fieldModel,actionModel,resetModel,categoryModel,categoryAction,checkModel,checkAction} from './model.js';
registerTabs();registerField();registerButton();registerSelect();registerCheckbox();
function Consumer() {
  const [state,setState]=useState(model()),[spanish,setSpanish]=useState(false),[dark,setDark]=useState(false),[disabled,setDisabled]=useState(false),[visible,setVisible]=useState(true),[count,setCount]=useState(0);
  const [value,setValue]=useState('Kitchen'),[fieldDisabled,setFieldDisabled]=useState(false),[fieldVisible,setFieldVisible]=useState(true),[reject,setReject]=useState(false),[fieldEvents,setFieldEvents]=useState(0),[saved,setSaved]=useState('');
  const [busy,setBusy]=useState(false),[buttonDisabled,setButtonDisabled]=useState(false),[buttonVisible,setButtonVisible]=useState(true),[cancelPress,setCancelPress]=useState(false),[icons,setIcons]=useState(true),[presses,setPresses]=useState(0),[accepted,setAccepted]=useState(0),[submits,setSubmits]=useState(0),[metadata,setMetadata]=useState(false);
  const press=(event:ButtonPressEvent)=>{setPresses(count=>count+1);if(cancelPress)event.preventDefault();};
  const [category,setCategory]=useState<SelectSelection>(1),[categoryMultiple,setCategoryMultiple]=useState(false),[categoryDropdown,setCategoryDropdown]=useState(false),[categoryDisabled,setCategoryDisabled]=useState(false),[categoryVisible,setCategoryVisible]=useState(true),[categoryReject,setCategoryReject]=useState(false),[categoryAvailable,setCategoryAvailable]=useState(true),[categoryEvents,setCategoryEvents]=useState(0),[categorySaved,setCategorySaved]=useState(''),[categorySubmits,setCategorySubmits]=useState(0);
  const [checked,setChecked]=useState(false),[mixed,setMixed]=useState(true),[checkDisabled,setCheckDisabled]=useState(false),[checkVisible,setCheckVisible]=useState(true),[checkReject,setCheckReject]=useState(false),[checkPayload,setCheckPayload]=useState(false),[checkEvents,setCheckEvents]=useState(0),[checkSaved,setCheckSaved]=useState(''),[checkSubmits,setCheckSubmits]=useState(0);
  const checkRequest=(event:CheckboxChangeEvent)=>{setCheckEvents(count=>count+1);if(checkReject)event.preventDefault();};
  const checkAccept=(next:boolean)=>{setChecked(next);setMixed(false);};
  const checkSave=(event:SyntheticEvent<HTMLFormElement>)=>{event.preventDefault();setCheckSaved(JSON.stringify([...new FormData(event.currentTarget)]));setCheckSubmits(count=>count+1);};
  const categoryRequest=(event:SelectValueEvent)=>{setCategoryEvents(count=>count+1);if(categoryReject)event.preventDefault();};
  const categorySave=(event:SyntheticEvent<HTMLFormElement>)=>{event.preventDefault();setCategorySaved(JSON.stringify([...new FormData(event.currentTarget)]));setCategorySubmits(count=>count+1);};
  const observe=(event:FieldValueEvent)=>{setFieldEvents(count=>count+1);if(reject)event.preventDefault();};
  const save=(event:SyntheticEvent<HTMLFormElement>)=>{event.preventDefault();const form=event.currentTarget;if(form.reportValidity()){setSaved(JSON.stringify([...new FormData(form,(event.nativeEvent as SubmitEvent).submitter)]));setSubmits(count=>count+1);setMetadata((event.nativeEvent as SubmitEvent).submitter===form.querySelector('vyp-ha-button')!.submitter);}};
  const select=(event:NavigationSelectionEvent)=>{event.preventDefault();setState(model(spanish,event.detail.id,disabled));setCount(value=>value+1);};
  const language=()=>{setSpanish(!spanish);setState(model(!spanish,state.selected!,disabled));};
  const toggleDisabled=()=>{setDisabled(!disabled);setState(model(spanish,'overview',!disabled));};
  const style={backgroundColor:dark?'rgb(20,20,20)':'rgb(255,255,255)','--error-color':dark?'#f28b82':'#b3261e','--divider-color':dark?'rgb(66,66,66)':'rgb(224,224,224)','--primary-text-color':dark?'rgb(235,235,235)':'rgb(28,28,28)','--secondary-text-color':dark?'rgb(189,189,189)':'rgb(89,89,89)','--card-background-color':dark?'rgb(20,20,20)':'rgb(255,255,255)'} as CSSProperties;
  return createElement('section',{style},
    createElement('button',{onClick:language},'Switch language'),createElement('button',{onClick:()=>setDark(!dark)},'Toggle theme'),
    createElement('button',{onClick:toggleDisabled},'Toggle disabled'),createElement('button',{onClick:()=>setVisible(!visible)},'Toggle component'),
    createElement('output',{'aria-label':'Selection events'},String(count)),
    visible?createElement(Tabs,{state,onSelectionRequest:select},createElement('button',{slot:'tasks'},'Add task')):null,
    createElement('button',{onClick:()=>setValue('Programmatic')},'Set field value'),createElement('button',{onClick:()=>setReject(!reject)},'Reject field changes'),
    createElement('button',{onClick:()=>setFieldDisabled(!fieldDisabled)},'Toggle field disabled'),createElement('button',{onClick:()=>setFieldVisible(!fieldVisible)},'Toggle field'),
    createElement('output',{'aria-label':'Field model'},value),createElement('output',{'aria-label':'Field events'},String(fieldEvents)),createElement('output',{'aria-label':'Saved task'},saved),
    createElement('button',{onClick:()=>setBusy(!busy)},'Toggle button busy'),createElement('button',{onClick:()=>setButtonDisabled(!buttonDisabled)},'Toggle button disabled'),createElement('button',{onClick:()=>setCancelPress(!cancelPress)},'Cancel button request'),createElement('button',{onClick:()=>setIcons(!icons)},'Toggle button icons'),createElement('button',{onClick:()=>setButtonVisible(!buttonVisible)},'Toggle action button'),
    createElement('output',{'aria-label':'Press events'},String(presses)),createElement('output',{'aria-label':'Accepted presses'},String(accepted)),createElement('output',{'aria-label':'Submit events'},String(submits)),createElement('output',{'aria-label':'Button metadata'},String(metadata)),
    createElement('form',{'aria-label':'Task form',onSubmit:save},fieldVisible?createElement(TextField,{state:fieldModel(spanish),value,name:'task',defaultValue:'Kitchen',disabled:fieldDisabled,onValueRequest:observe,onValueChange:setValue}):null,
      buttonVisible?createElement(Button,{id:'bound-submit',state:actionModel(spanish,busy),type:'submit',name:'action',value:'save',disabled:buttonDisabled,onPressRequest:press,onPress:()=>setAccepted(count=>count+1),leading:icons?createElement('span',null,'+'):undefined}):null,createElement(Button,{state:resetModel(),type:'reset'})),
    createElement('button',{onClick:()=>{setCategoryMultiple(!categoryMultiple);setCategory(!categoryMultiple?[1,false]:1);}},'Toggle category mode'),createElement('button',{onClick:()=>setCategory(categoryMultiple?['1',false]:false)},'Set category value'),createElement('button',{onClick:()=>setCategory(categoryMultiple?[]:null)},'Clear category'),createElement('button',{onClick:()=>setCategoryReject(!categoryReject)},'Reject category changes'),createElement('button',{onClick:()=>setCategoryDisabled(!categoryDisabled)},'Toggle category disabled'),createElement('button',{onClick:()=>setCategoryAvailable(!categoryAvailable)},'Toggle category options'),createElement('button',{onClick:()=>setCategoryVisible(!categoryVisible)},'Toggle category'),createElement('button',{onClick:()=>setCategoryDropdown(true)},'Use category dropdown'),
    createElement('output',{'aria-label':'Category model'},JSON.stringify(category)),createElement('output',{'aria-label':'Category events'},String(categoryEvents)),createElement('output',{'aria-label':'Saved categories'},categorySaved),createElement('output',{'aria-label':'Category submits'},String(categorySubmits)),
    createElement('form',{'aria-label':'Category form',onSubmit:categorySave},categoryVisible?createElement(Select,{id:'bound-category',state:categoryModel(spanish,categoryMultiple,categoryAvailable,categoryDropdown),value:category,name:'category',defaultValue:categoryMultiple?[1,false]:1,disabled:categoryDisabled,onValueRequest:categoryRequest,onValueChange:setCategory}):null,createElement(Button,{state:categoryAction(spanish),type:'submit'}),createElement(Button,{state:categoryAction(spanish,true),type:'reset'})),
    createElement('button',{onClick:()=>setChecked(true)},'Set checked'),createElement('button',{onClick:()=>setMixed(!mixed)},'Toggle partial'),createElement('button',{onClick:()=>setCheckReject(!checkReject)},'Reject check changes'),createElement('button',{onClick:()=>setCheckDisabled(!checkDisabled)},'Toggle check disabled'),createElement('button',{onClick:()=>setCheckPayload(!checkPayload)},'Toggle check payload'),createElement('button',{onClick:()=>setCheckVisible(!checkVisible)},'Toggle checkbox'),
    createElement('output',{'aria-label':'Checkbox model'},String(checked)),createElement('output',{'aria-label':'Checkbox events'},String(checkEvents)),createElement('output',{'aria-label':'Saved checkbox'},checkSaved),createElement('output',{'aria-label':'Checkbox submits'},String(checkSubmits)),
    createElement('form',{'aria-label':'Checkbox form',onSubmit:checkSave},checkVisible?createElement(Checkbox,{id:'bound-checkbox',state:checkModel(spanish,mixed),checked,name:'notify',value:checkPayload?'confirmed':'on',disabled:checkDisabled,onCheckedRequest:checkRequest,onCheckedChange:checkAccept}):null,createElement(Button,{state:checkAction(spanish),type:'submit'}),createElement(Button,{state:checkAction(spanish,true),type:'reset'})));


}
createRoot(document.querySelector('main')!).render(createElement(StrictMode,null,createElement(Consumer)));
