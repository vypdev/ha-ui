<script lang="ts">
  import {onMount} from 'svelte';
  import {fieldValueDetail} from '@vypdev/ha-ui/field-contracts';
  import type {HaTextField,FieldValueEvent} from '@vypdev/ha-ui/field';
  import type {TextFieldProps} from './types.js';
  let {state,value,name='',defaultValue='',disabled=false,form,onValueRequest,onValueChange,id,class:className,style,dir,lang}:TextFieldProps=$props();
  let element:HaTextField;
  onMount(()=>{
    const handle=(event:FieldValueEvent)=>{const detail=fieldValueDetail(event.detail);onValueRequest?.(event);if(!event.defaultPrevented)onValueChange?.(detail.value);};
    element.addEventListener('ha-value-request',handle);return ()=>element.removeEventListener('ha-value-request',handle);
  });
  $effect(()=>{
    element.state=state;element.name=name;element.defaultValue=defaultValue;element.disabled=disabled;
    if(form===undefined)element.removeAttribute('form');else element.setAttribute('form',form);
    element.value=value;
  });
</script>
<vyp-ha-field bind:this={element} {id} class={className} {style} {dir} {lang}></vyp-ha-field>
