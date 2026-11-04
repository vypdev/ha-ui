import {createApp,h,shallowRef} from 'vue';
import {Tabs} from '@vypdev/ha-ui-vue';
import {registerTabs,type NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
import {model} from './model.js';
registerTabs();
createApp({setup(){
  const state=shallowRef(model()),spanish=shallowRef(false),dark=shallowRef(false),disabled=shallowRef(false),visible=shallowRef(true),count=shallowRef(0);
  const select=(event:NavigationSelectionEvent)=>{event.preventDefault();state.value=model(spanish.value,event.detail.id,disabled.value);count.value++;};
  const language=()=>{spanish.value=!spanish.value;state.value=model(spanish.value,state.value.selected!,disabled.value);};
  const toggleDisabled=()=>{disabled.value=!disabled.value;state.value=model(spanish.value,'overview',disabled.value);};
  return ()=>h('section',{style:{'--primary-text-color':dark.value?'rgb(235,235,235)':'rgb(28,28,28)','--secondary-text-color':dark.value?'rgb(189,189,189)':'rgb(89,89,89)','--card-background-color':dark.value?'rgb(20,20,20)':'rgb(255,255,255)'}},[
    h('button',{onClick:language},'Switch language'),h('button',{onClick:()=>dark.value=!dark.value},'Toggle theme'),
    h('button',{onClick:toggleDisabled},'Toggle disabled'),h('button',{onClick:()=>visible.value=!visible.value},'Toggle component'),
    h('output',{'aria-label':'Selection events'},String(count.value)),
    visible.value?h(Tabs,{state:state.value,onSelectionRequest:select},{default:()=>h('button',{slot:'tasks'},'Add task')}):null,
  ]);
}}).mount(document.querySelector('main')!);
