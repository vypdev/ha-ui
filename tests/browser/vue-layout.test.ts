import {createApp,h,nextTick,shallowRef} from 'vue';
import {Grid,Row} from '../../packages/vue/src/index.js';
import {layoutAdapterCases} from './layout-framework-fixture.js';

layoutAdapterCases(async(target,initial)=>{
 const options=shallowRef(initial);
 const app=createApp({render:()=>h(Grid,{state:options.value.grid},{default:()=>h('div',{role:'list'},[
  h(Row,{state:options.value.row},options.value.project?{leading:()=>h('span','Prep'),trailing:()=>h('button',{onClick:options.value.onReview},'Review row')}:{})])})});
 app.mount(target);
 return{update:async patch=>{options.value={...options.value,...patch};await nextTick();},unmount:async()=>{app.unmount();}};
});
