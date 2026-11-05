import {nativeHostAttributes} from './native-host-attributes.js';
import {defineComponent,h,onMounted,onBeforeUnmount,shallowRef,watch,type PropType} from 'vue';
import {checkboxChangeDetail,type CheckboxState} from '@vypdev/ha-ui/checkbox-contracts';
import type {HaCheckbox,CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
/** Boolean v-model and synchronous original events reuse the shared native form control. */
export const Checkbox=defineComponent({name:'HaUiCheckbox',inheritAttrs:false,
 props:{state:{type:Object as PropType<CheckboxState>,required:true},modelValue:{type:Boolean,required:true},defaultChecked:{type:Boolean,default:false},value:{type:String,default:'on'},name:{type:String,default:''},disabled:{type:Boolean,default:false},form:{type:String}},
 emits:{checkedRequest:(_event:CheckboxChangeEvent)=>true,'update:modelValue':(_checked:boolean)=>true},
 setup(props,{attrs,emit}){
  const element=shallowRef<HaCheckbox|null>(null);
  const apply=()=>{const host=element.value!;host.state=props.state;host.name=props.name;host.value=props.value;host.defaultChecked=props.defaultChecked;host.disabled=props.disabled;if(props.form===undefined)host.removeAttribute('form');else host.setAttribute('form',props.form);host.checked=props.modelValue;};
  const handle=(event:CheckboxChangeEvent)=>{
    if(event.composedPath()[0]!==element.value)return;
    const detail=checkboxChangeDetail(event.detail);
    emit('checkedRequest',event);
    if(!event.defaultPrevented)emit('update:modelValue',detail.checked);
  };
  onMounted(()=>{apply();element.value!.addEventListener('ha-check-request',handle);});watch(()=>[props.state,props.modelValue,props.defaultChecked,props.value,props.name,props.disabled,props.form],apply,{flush:'post'});onBeforeUnmount(()=>element.value!.removeEventListener('ha-check-request',handle));
  return ()=>h('vyp-ha-checkbox',{...nativeHostAttributes(attrs),ref:element});
 },
});
