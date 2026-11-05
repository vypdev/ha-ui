import {createApp,h,nextTick,shallowRef} from 'vue';
import {Dialog} from '../../packages/vue/src/index.js';
import {dialogAdapterCases} from './dialog-framework-fixture.js';
dialogAdapterCases(async(target,initial)=>{
 const options=shallowRef(initial);const app=createApp({render:()=>{const {footer,...props}=options.value;return h(Dialog,props,{default:()=>h('p',{'data-details':''},'Task details'),...(footer?{footer:()=>h('button','Review')}:{})});}});
 app.mount(target);return{host:target.querySelector('vyp-ha-dialog')!,update:async patch=>{options.value={...options.value,...patch};await nextTick();},unmount:async()=>{app.unmount();}};
});
