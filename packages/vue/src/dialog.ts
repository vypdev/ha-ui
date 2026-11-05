import {defineComponent,h,onBeforeUnmount,onMounted,shallowRef,watch,type PropType} from 'vue';
import {dialogRequestDetail,type DialogRequestDetail,type DialogState} from '@vypdev/ha-ui/dialog-contracts';
import type {DialogRequestEvent,HaDialog} from '@vypdev/ha-ui/dialog';
import {nativeHostAttributes} from './native-host-attributes.js';
export const Dialog=defineComponent({
 name:'HaUiDialog',inheritAttrs:false,
 props:{state:{type:Object as PropType<DialogState>,required:true},open:{type:Boolean,required:true}},
 emits:{request:(_event:DialogRequestEvent)=>true,action:(_detail:DialogRequestDetail)=>true},
 setup(props,{attrs,slots,emit}){
  const ref=shallowRef<HaDialog|null>(null);
  const apply=()=>{const host=ref.value!;host.state=props.state;host.open=props.open;};
  const handle=(event:DialogRequestEvent)=>{if(event.target!==ref.value)return;const detail=dialogRequestDetail(event.detail);emit('request',event);if(!event.defaultPrevented)emit('action',detail);};
  onMounted(()=>{apply();ref.value!.addEventListener('ha-dialog-request',handle);});
  watch(()=>[props.state,props.open],apply,{flush:'post'});
  onBeforeUnmount(()=>ref.value!.removeEventListener('ha-dialog-request',handle));
  return()=>h('vyp-ha-dialog',{...nativeHostAttributes(attrs),ref},[slots.default?.(),slots.footer?h('div',{slot:'footer'},slots.footer()):null]);
 },
});
