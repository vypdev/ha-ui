import {createApp,h,nextTick,shallowRef} from 'vue';
import {Feedback} from '../../packages/vue/src/index.js';
import {feedbackAdapterCases} from './feedback-framework-fixture.js';

feedbackAdapterCases(async(target,initial)=>{
 const options=shallowRef(initial),app=createApp({render:()=>h(Feedback,{state:options.value.state},options.value.show?{
  icon:()=>h('span','!'),action:()=>h('button',{onClick:options.value.onAction},'Retry'),
 }:{})});
 app.mount(target);
 return{update:async patch=>{options.value={...options.value,...patch};await nextTick();},unmount:async()=>{app.unmount();}};
});
