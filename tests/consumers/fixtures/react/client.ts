import {createElement,useState,type CSSProperties} from 'react';
import {createRoot} from 'react-dom/client';
import {Tabs} from '@vypdev/ha-ui-react';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {model} from './model.js';
registerTabs();
function Consumer() {
  const [state,setState]=useState(model()),[spanish,setSpanish]=useState(false),[dark,setDark]=useState(false),[disabled,setDisabled]=useState(false),[visible,setVisible]=useState(true),[count,setCount]=useState(0);
  const select=(event:NavigationSelectionEvent)=>{event.preventDefault();setState(model(spanish,event.detail.id,disabled));setCount(value=>value+1);};
  const language=()=>{setSpanish(!spanish);setState(model(!spanish,state.selected!,disabled));};
  const toggleDisabled=()=>{setDisabled(!disabled);setState(model(spanish,'overview',!disabled));};
  const style={'--primary-text-color':dark?'rgb(235,235,235)':'rgb(28,28,28)','--secondary-text-color':dark?'rgb(189,189,189)':'rgb(89,89,89)','--card-background-color':dark?'rgb(20,20,20)':'rgb(255,255,255)'} as CSSProperties;
  return createElement('section',{style},
    createElement('button',{onClick:language},'Switch language'),createElement('button',{onClick:()=>setDark(!dark)},'Toggle theme'),
    createElement('button',{onClick:toggleDisabled},'Toggle disabled'),createElement('button',{onClick:()=>setVisible(!visible)},'Toggle component'),
    createElement('output',{'aria-label':'Selection events'},String(count)),
    visible?createElement(Tabs,{state,onSelectionRequest:select},createElement('button',{slot:'tasks'},'Add task')):null);
}
createRoot(document.querySelector('main')!).render(createElement(Consumer));
