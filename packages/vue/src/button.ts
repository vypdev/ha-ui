import {nativeHostAttributes} from './native-host-attributes.js';
import {defineComponent,h,onMounted,onBeforeUnmount,shallowRef,watch,type PropType} from 'vue';
import {buttonPressDetail,type ButtonState,type ButtonType,type ButtonPressDetail} from '@vypdev/ha-ui/button-contracts';
import type {HaButton,ButtonPressEvent} from '@vypdev/ha-ui/button';
/** Vue slots and synchronous events bind the one registered native-form renderer. */
export const Button=defineComponent({
  name:'HaUiButton',inheritAttrs:false,
  props:{state:{type:Object as PropType<ButtonState>,required:true},type:{type:String as PropType<ButtonType>,default:'button'},
    name:{type:String,default:''},value:{type:String,default:''},disabled:{type:Boolean,default:false},formNoValidate:{type:Boolean,default:false},form:{type:String}},
  emits:{pressRequest:(_event:ButtonPressEvent)=>true,press:(_detail:ButtonPressDetail)=>true},
  setup(props,{attrs,slots,emit}){
    const element=shallowRef<HaButton|null>(null);
    const apply=()=>{
      const host=element.value!;host.state=props.state;host.type=props.type;host.name=props.name;host.value=props.value;host.disabled=props.disabled;host.formNoValidate=props.formNoValidate;
      if(props.form===undefined)host.removeAttribute('form');else host.setAttribute('form',props.form);
    };
    const handle=(event:ButtonPressEvent)=>{const detail=buttonPressDetail(event.detail);emit('pressRequest',event);if(!event.defaultPrevented)emit('press',detail);};
    onMounted(()=>{apply();element.value!.addEventListener('ha-press-request',handle);});
    watch(()=>[props.state,props.type,props.name,props.value,props.disabled,props.formNoValidate,props.form],apply,{flush:'post'});
    onBeforeUnmount(()=>element.value!.removeEventListener('ha-press-request',handle));
    return ()=>h('vyp-ha-button',{...nativeHostAttributes(attrs),ref:element},[slots.leading?h('span',{slot:'leading'},slots.leading()):null,slots.trailing?h('span',{slot:'trailing'},slots.trailing()):null]);
  },
});
