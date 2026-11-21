import {createElement,useState,StrictMode,type CSSProperties,type SyntheticEvent} from 'react';
import {createRoot} from 'react-dom/client';
import {TextArea} from '@vypdev/ha-ui-react';
import {registerTextArea,type TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
import {noteState,noteTheme,initialNote} from './textarea-model.js';
registerTextArea();
function Consumer(){
  const [value,setValue]=useState(initialNote),[events,setEvents]=useState(0),[saved,setSaved]=useState('');
  const [disabled,setDisabled]=useState(false),[readOnly,setReadOnly]=useState(false),[visible,setVisible]=useState(true),[reject,setReject]=useState(false),[spanish,setSpanish]=useState(false),[dark,setDark]=useState(false);
  const observe=(event:TextAreaValueEvent)=>{setEvents(count=>count+1);if(reject)event.preventDefault();};
  const save=(event:SyntheticEvent<HTMLFormElement>)=>{event.preventDefault();setSaved(JSON.stringify([...new FormData(event.currentTarget)]));};
  return createElement('section',{style:noteTheme(dark) as CSSProperties},
    createElement('button',{onClick:()=>setReject(!reject)},'Reject note changes'),createElement('button',{onClick:()=>setDisabled(!disabled)},'Toggle note disabled'),
    createElement('button',{onClick:()=>setReadOnly(!readOnly)},'Toggle note readonly'),createElement('button',{onClick:()=>setVisible(!visible)},'Toggle note'),
    createElement('button',{onClick:()=>setValue('Programmatic\n😀')},'Set note value'),createElement('button',{onClick:()=>setSpanish(!spanish)},'Switch note language'),createElement('button',{onClick:()=>setDark(!dark)},'Toggle note theme'),
    createElement('output',{'aria-label':'Note model'},value),createElement('output',{'aria-label':'Note events'},String(events)),createElement('output',{'aria-label':'Saved note'},saved),
    createElement('form',{'aria-label':'Note form',onSubmit:save},createElement('fieldset',null,visible?createElement(TextArea,{state:noteState(spanish,readOnly),value,name:'note',defaultValue:initialNote,disabled,onValueRequest:observe,onValueChange:setValue}):null),
      createElement('button',{type:'submit'},'Save note'),createElement('button',{type:'reset'},'Reset note')),
  );
}
createRoot(document.querySelector('main')!).render(createElement(StrictMode,null,createElement(Consumer)));
