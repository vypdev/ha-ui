import {defineComponent,h,onMounted,shallowRef,watch,type PropType} from 'vue';
import type {GridState,RowState} from '@vypdev/ha-ui/layout-contracts';
import type {HaGrid,HaRow} from '@vypdev/ha-ui/layout';
import {nativeHostAttributes} from './native-host-attributes.js';

function useHost<T extends HTMLElement&{state:S|undefined},S>(state:()=>S){
 const ref=shallowRef<T|null>(null);
 const apply=()=>{ref.value!.state=state();};onMounted(apply);
 watch(state,apply,{flush:'post'});
 return ref;
}
export const Row=defineComponent({
 name:'HaUiRow',inheritAttrs:false,props:{state:{type:Object as PropType<RowState>,required:true}},
 setup(props,{attrs,slots}){
  const ref=useHost<HaRow,RowState>(()=>props.state);
  const project=(name:'leading'|'trailing')=>slots[name]?h('div',{slot:name,'data-vyp-ha-row-projection':''},slots[name]()):null;
  return()=>h('vyp-ha-row',{...nativeHostAttributes(attrs),ref},[project('leading'),project('trailing')]);
 },
});
export const Grid=defineComponent({
 name:'HaUiGrid',inheritAttrs:false,props:{state:{type:Object as PropType<GridState>,required:true}},
 setup(props,{attrs,slots}){
  const ref=useHost<HaGrid,GridState>(()=>props.state);
  return()=>h('vyp-ha-grid',{...nativeHostAttributes(attrs),ref},slots.default?.());
 },
});
