<script lang="ts">
 import {onMount} from 'svelte';
 import {selectValueDetail} from '@vypdev/ha-ui/select-contracts';
 import type {HaSelect,SelectValueEvent} from '@vypdev/ha-ui/select';
 import type {SelectProps} from './types.js';
 let {state,value,name='',defaultValue=null,disabled=false,form,onValueRequest,onValueChange,id,class:className,style,dir,lang}:SelectProps=$props();
 let element:HaSelect;
 onMount(()=>{
  const handle=(event:SelectValueEvent)=>{
    if(event.composedPath()[0]!==element)return;
    const detail=selectValueDetail(event.detail);
    onValueRequest?.(event);
    if(!event.defaultPrevented)onValueChange?.(detail.value);
  };
  element.addEventListener('ha-select-request',handle);
  return ()=>element.removeEventListener('ha-select-request',handle);
 });
 $effect(()=>{element.state=state;element.name=name;element.defaultValue=defaultValue;element.disabled=disabled;if(form===undefined)element.removeAttribute('form');else element.setAttribute('form',form);element.value=value;});
</script>
<vyp-ha-select bind:this={element} {id} class={className} {style} {dir} {lang}></vyp-ha-select>
