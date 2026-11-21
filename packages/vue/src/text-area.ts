import {nativeHostAttributes} from './native-host-attributes.js';
import {defineComponent,h,onMounted,onBeforeUnmount,shallowRef,watch,type PropType} from 'vue';
import {textAreaValueDetail} from '@vypdev/ha-ui/textarea-contracts';
import type {TextAreaState} from '@vypdev/ha-ui/textarea-contracts';
import type {HaTextArea,TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
/** Vue's v-model acknowledges the shared core request; cancellation stays synchronous. */
export const TextArea=defineComponent({
  name:'HaUiTextArea',inheritAttrs:false,
  props:{state:{type:Object as PropType<TextAreaState>,required:true},modelValue:{type:String,required:true},
    name:{type:String,default:''},defaultValue:{type:String,default:''},disabled:{type:Boolean,default:false},form:{type:String}},
  emits:{valueRequest:(_event:TextAreaValueEvent)=>true,'update:modelValue':(_value:string)=>true},
  setup(props,{attrs,emit}){
    const element=shallowRef<HaTextArea|null>(null);
    const apply=()=>{
      const host=element.value!;host.state=props.state;host.name=props.name;host.defaultValue=props.defaultValue;host.disabled=props.disabled;
      if(props.form===undefined)host.removeAttribute('form');else host.setAttribute('form',props.form);
      host.value=props.modelValue;
    };
    const handle=(event:TextAreaValueEvent)=>{
      if(event.composedPath()[0]!==element.value)return;
      const detail=textAreaValueDetail(event.detail);
      emit('valueRequest',event);
      if(!event.defaultPrevented)emit('update:modelValue',detail.value);
    };
    onMounted(()=>{apply();element.value!.addEventListener('ha-value-request',handle);});
    watch(()=>[props.state,props.modelValue,props.name,props.defaultValue,props.disabled,props.form],apply,{flush:'post'});
    onBeforeUnmount(()=>element.value!.removeEventListener('ha-value-request',handle));
    return ()=>h('vyp-ha-textarea',{...nativeHostAttributes(attrs),ref:element});
  },
});
