import {createApp,h,nextTick,shallowRef} from 'vue';
import {Button} from '../../packages/vue/src/index.js';
import {buttonAdapterCases} from './button-framework-fixture.js';
buttonAdapterCases(async(target,initial)=>{
  const options=shallowRef(initial);const app=createApp({render:()=>h(Button,{...options.value,id:'bound-button',class:'action',lang:'en',dir:'ltr'},options.value.icons?{leading:()=>h('span','+'),trailing:()=>h('span','→')}:{} )});app.mount(target);
  return {host:target.querySelector('vyp-ha-button')!,update:async patch=>{options.value={...options.value,...patch};await nextTick();},unmount:async()=>{app.unmount();}};
});
