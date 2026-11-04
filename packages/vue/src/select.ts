import {defineComponent,h,onMounted,onBeforeUnmount,shallowRef,watch,type PropType} from 'vue';
import {selectValueDetail,type SelectState,type SelectSelection} from '@vypdev/ha-ui/select-contracts';
import type {HaSelect,SelectValueEvent} from '@vypdev/ha-ui/select';
/** Vue v-model preserves primitive/array types and the original synchronous request. */
export const Select=defineComponent({name:'HaUiSelect',inheritAttrs:false,
 props:{state:{type:Object as PropType<SelectState>,required:true},modelValue:{type:[String,Number,Boolean,Array,null] as PropType<SelectSelection>,required:true},name:{type:String,default:''},defaultValue:{type:[String,Number,Boolean,Array,null] as PropType<SelectSelection>,default:null},disabled:{type:Boolean,default:false},form:{type:String}},
 emits:{valueRequest:(_event:SelectValueEvent)=>true,'update:modelValue':(_value:SelectSelection)=>true},
 setup(props,{attrs,emit}){
  const element=shallowRef<HaSelect|null>(null);
  const apply=()=>{const host=element.value!;host.state=props.state;host.name=props.name;host.defaultValue=props.defaultValue;host.disabled=props.disabled;if(props.form===undefined)host.removeAttribute('form');else host.setAttribute('form',props.form);host.value=props.modelValue;};
  const handle=(event:SelectValueEvent)=>{const detail=selectValueDetail(event.detail);emit('valueRequest',event);if(!event.defaultPrevented)emit('update:modelValue',detail.value);};
  onMounted(()=>{apply();element.value!.addEventListener('ha-select-request',handle);});watch(()=>[props.state,props.modelValue,props.name,props.defaultValue,props.disabled,props.form],apply,{flush:'post'});onBeforeUnmount(()=>element.value!.removeEventListener('ha-select-request',handle));
  return ()=>h('vyp-ha-select',{ref:element,id:attrs.id,class:attrs.class,style:attrs.style,dir:attrs.dir,lang:attrs.lang});
 },
});
