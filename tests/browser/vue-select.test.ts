import {createApp,h,nextTick,shallowRef} from 'vue';
import {Select} from '../../packages/vue/src/index.js';
import {selectAdapterCases} from './select-framework-fixture.js';
selectAdapterCases(async(target,initial)=>{const options=shallowRef(initial);const app=createApp({render:()=>{const {value,onValueChange,...props}=options.value;return h(Select,{...props,modelValue:value,'onUpdate:modelValue':onValueChange,id:'bound-select',class:'choice',dir:'ltr',lang:'en'});}});app.mount(target);return {host:target.querySelector('vyp-ha-select')!,update:async patch=>{options.value={...options.value,...patch};await nextTick();},unmount:async()=>{app.unmount();}};});
