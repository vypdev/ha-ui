import {nativeHostAttributes} from './native-host-attributes.js';
import {defineComponent,h,onMounted,onBeforeUnmount,shallowRef,watch,type PropType} from 'vue';
import {fieldValueDetail} from '@vypdev/ha-ui/field-contracts';
import type {TextFieldState} from '@vypdev/ha-ui/field-contracts';
import type {HaTextField,FieldValueEvent} from '@vypdev/ha-ui/field';
/** Vue's v-model acknowledges the shared core request; cancellation stays synchronous. */
export const TextField=defineComponent({
  name:'HaUiTextField',inheritAttrs:false,
  props:{state:{type:Object as PropType<TextFieldState>,required:true},modelValue:{type:String,required:true},
    name:{type:String,default:''},defaultValue:{type:String,default:''},disabled:{type:Boolean,default:false},form:{type:String}},
  emits:{valueRequest:(_event:FieldValueEvent)=>true,'update:modelValue':(_value:string)=>true},
  setup(props,{attrs,emit}){
    const element=shallowRef<HaTextField|null>(null);
    const apply=()=>{
      const host=element.value!;host.state=props.state;host.name=props.name;host.defaultValue=props.defaultValue;host.disabled=props.disabled;
      if(props.form===undefined)host.removeAttribute('form');else host.setAttribute('form',props.form);
      host.value=props.modelValue;
    };
    const handle=(event:FieldValueEvent)=>{const detail=fieldValueDetail(event.detail);emit('valueRequest',event);if(!event.defaultPrevented)emit('update:modelValue',detail.value);};
    onMounted(()=>{apply();element.value!.addEventListener('ha-value-request',handle);});
    watch(()=>[props.state,props.modelValue,props.name,props.defaultValue,props.disabled,props.form],apply,{flush:'post'});
    onBeforeUnmount(()=>element.value!.removeEventListener('ha-value-request',handle));
    return ()=>h('vyp-ha-field',{...nativeHostAttributes(attrs),ref:element});
  },
});
