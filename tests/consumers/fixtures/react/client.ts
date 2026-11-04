import {createElement,useState,StrictMode,type CSSProperties,type SyntheticEvent} from 'react';
import {createRoot} from 'react-dom/client';
import {Tabs,TextField} from '@vypdev/ha-ui-react';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {registerField,type FieldValueEvent} from '@vypdev/ha-ui/field';
import {model,fieldModel} from './model.js';
registerTabs();registerField();
function Consumer() {
  const [state,setState]=useState(model()),[spanish,setSpanish]=useState(false),[dark,setDark]=useState(false),[disabled,setDisabled]=useState(false),[visible,setVisible]=useState(true),[count,setCount]=useState(0);
  const [value,setValue]=useState('Kitchen'),[fieldDisabled,setFieldDisabled]=useState(false),[fieldVisible,setFieldVisible]=useState(true),[reject,setReject]=useState(false),[fieldEvents,setFieldEvents]=useState(0),[saved,setSaved]=useState('');
  const observe=(event:FieldValueEvent)=>{setFieldEvents(count=>count+1);if(reject)event.preventDefault();};
  const save=(event:SyntheticEvent<HTMLFormElement>)=>{event.preventDefault();const form=event.currentTarget;if(form.reportValidity())setSaved(JSON.stringify([...new FormData(form,(event.nativeEvent as SubmitEvent).submitter)]));};
  const select=(event:NavigationSelectionEvent)=>{event.preventDefault();setState(model(spanish,event.detail.id,disabled));setCount(value=>value+1);};
  const language=()=>{setSpanish(!spanish);setState(model(!spanish,state.selected!,disabled));};
  const toggleDisabled=()=>{setDisabled(!disabled);setState(model(spanish,'overview',!disabled));};
  const style={backgroundColor:dark?'rgb(20,20,20)':'rgb(255,255,255)','--divider-color':dark?'rgb(66,66,66)':'rgb(224,224,224)','--primary-text-color':dark?'rgb(235,235,235)':'rgb(28,28,28)','--secondary-text-color':dark?'rgb(189,189,189)':'rgb(89,89,89)','--card-background-color':dark?'rgb(20,20,20)':'rgb(255,255,255)'} as CSSProperties;
  return createElement('section',{style},
    createElement('button',{onClick:language},'Switch language'),createElement('button',{onClick:()=>setDark(!dark)},'Toggle theme'),
    createElement('button',{onClick:toggleDisabled},'Toggle disabled'),createElement('button',{onClick:()=>setVisible(!visible)},'Toggle component'),
    createElement('output',{'aria-label':'Selection events'},String(count)),
    visible?createElement(Tabs,{state,onSelectionRequest:select},createElement('button',{slot:'tasks'},'Add task')):null,
    createElement('button',{onClick:()=>setValue('Programmatic')},'Set field value'),createElement('button',{onClick:()=>setReject(!reject)},'Reject field changes'),
    createElement('button',{onClick:()=>setFieldDisabled(!fieldDisabled)},'Toggle field disabled'),createElement('button',{onClick:()=>setFieldVisible(!fieldVisible)},'Toggle field'),
    createElement('output',{'aria-label':'Field model'},value),createElement('output',{'aria-label':'Field events'},String(fieldEvents)),createElement('output',{'aria-label':'Saved task'},saved),
    createElement('form',{'aria-label':'Task form',onSubmit:save},fieldVisible?createElement(TextField,{state:fieldModel(spanish),value,name:'task',defaultValue:'Kitchen',disabled:fieldDisabled,onValueRequest:observe,onValueChange:setValue}):null,
      createElement('button',{type:'submit',name:'action',value:'save'},'Save task'),createElement('button',{type:'reset'},'Reset task')));
}
createRoot(document.querySelector('main')!).render(createElement(StrictMode,null,createElement(Consumer)));
