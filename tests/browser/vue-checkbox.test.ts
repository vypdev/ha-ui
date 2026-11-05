import {createApp,h,nextTick,shallowRef} from 'vue';
import {Checkbox} from '../../packages/vue/src/index.js';
import {checkboxAdapterCases} from './checkbox-framework-fixture.js';
checkboxAdapterCases(async(target,initial)=>{const options=shallowRef(initial);const app=createApp({render:()=>{const {checked,onCheckedChange,...props}=options.value;return h(Checkbox,{...props,modelValue:checked,'onUpdate:modelValue':onCheckedChange,id:'bound-checkbox',class:'choice',dir:'ltr',lang:'en'});}});app.mount(target);return {host:target.querySelector('vyp-ha-checkbox')!,update:async patch=>{options.value={...options.value,...patch};await nextTick();},unmount:async()=>{app.unmount();}};});
