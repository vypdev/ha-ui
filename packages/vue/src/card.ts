import {defineComponent,h,onMounted,shallowRef,watch,type PropType} from 'vue';
import type {CardState} from '@vypdev/ha-ui/card-contracts';
import type {HaCard} from '@vypdev/ha-ui/card';
import {nativeHostAttributes} from './native-host-attributes.js';
export const Card=defineComponent({
 name:'HaUiCard',inheritAttrs:false,props:{state:{type:Object as PropType<CardState>,required:true}},
 setup(props,{attrs,slots}){
  const ref=shallowRef<HaCard|null>(null);
  const apply=()=>{ref.value!.state=props.state;};onMounted(apply);
  watch(()=>props.state,apply,{flush:'post'});
  return()=>h('vyp-ha-card',{...nativeHostAttributes(attrs),ref},[slots.default?.(),slots.actions?h('div',{slot:'actions','data-vyp-ha-card-projection':''},slots.actions()):null]);
 },
});
