import {defineComponent,h,onMounted,onBeforeUnmount,shallowRef,watch,type PropType} from 'vue';
import type {NavigationState} from '@vypdev/ha-ui/contracts';
import type {HaTabs,NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';

/** Vue owns props, slots and subscriptions; all visuals remain in the explicitly registered core. */
export const Tabs=defineComponent({
  name:'HaUiTabs', inheritAttrs:false,
  props:{state:{type:Object as PropType<NavigationState>,required:true}},
  emits:{selectionRequest:(_event:NavigationSelectionEvent)=>true},
  setup(props,{attrs,slots,emit}) {
    const element=shallowRef<HaTabs|null>(null);
    const handle=(event:NavigationSelectionEvent)=>emit('selectionRequest',event);
    onMounted(()=>{
      element.value!.state=props.state;
      element.value!.addEventListener('ha-selection-request',handle);
    });
    watch(()=>props.state,state=>{element.value!.state=state;},{flush:'post'});
    onBeforeUnmount(()=>{element.value!.removeEventListener('ha-selection-request',handle);});
    return ()=>h('vyp-ha-tabs',{ref:element,id:attrs.id,class:attrs.class,style:attrs.style,dir:attrs.dir,lang:attrs.lang},slots.default?.());
  },
});
