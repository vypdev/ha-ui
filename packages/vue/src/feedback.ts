import {defineComponent,h,onMounted,shallowRef,watch,type PropType} from 'vue';
import type {FeedbackState} from '@vypdev/ha-ui/feedback-contracts';
import type {HaFeedback} from '@vypdev/ha-ui/feedback';
import {nativeHostAttributes} from './native-host-attributes.js';

export const Feedback=defineComponent({
 name:'HaUiFeedback',inheritAttrs:false,props:{state:{type:Object as PropType<FeedbackState>,required:true}},
 setup(props,{attrs,slots}){
  const ref=shallowRef<HaFeedback|null>(null),apply=()=>{ref.value!.state=props.state;};
  onMounted(apply);watch(()=>props.state,apply,{flush:'post'});
  const project=(slot:'action'|'icon')=>slots[slot]?h('div',{slot,'data-vyp-ha-feedback-projection':''},slots[slot]()):null;
  return()=>h('vyp-ha-feedback',{...nativeHostAttributes(attrs),ref},[project('icon'),project('action')]);
 },
});
