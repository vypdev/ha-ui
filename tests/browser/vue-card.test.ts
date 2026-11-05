import {createApp,h,nextTick,shallowRef} from 'vue';
import {Card} from '../../packages/vue/src/index.js';
import {cardAdapterCases} from './card-framework-fixture.js';
cardAdapterCases(async(target,initial)=>{
 const options=shallowRef(initial);const app=createApp({render:()=>h(Card,{state:options.value.state},{default:()=>h('p','Review household supplies.'),...(options.value.supplyActions?{actions:()=>options.value.actions?h('button',{onClick:options.value.onReview},'Review task'):null}:{})})});
 app.mount(target);return{host:target.querySelector('vyp-ha-card')!,update:async patch=>{options.value={...options.value,...patch};await nextTick();},unmount:async()=>{app.unmount();}};
});
