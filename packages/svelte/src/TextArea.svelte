<script lang="ts">
  import {onMount} from 'svelte';
  import {textAreaValueDetail} from '@vypdev/ha-ui/textarea-contracts';
  import type {HaTextArea,TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
  import type {TextAreaProps} from './types.js';
  let {state,value,name='',defaultValue='',disabled=false,form,onValueRequest,onValueChange,id,class:className,style,dir,lang}:TextAreaProps=$props();
  let element:HaTextArea;
  onMount(()=>{
    const handle=(event:TextAreaValueEvent)=>{
      if(event.composedPath()[0]!==element)return;
      const detail=textAreaValueDetail(event.detail);
      onValueRequest?.(event);
      if(!event.defaultPrevented)onValueChange?.(detail.value);
    };
    element.addEventListener('ha-value-request',handle);
    return ()=>element.removeEventListener('ha-value-request',handle);
  });
  $effect(()=>{
    element.state=state;element.name=name;element.defaultValue=defaultValue;element.disabled=disabled;
    if(form===undefined)element.removeAttribute('form');else element.setAttribute('form',form);
    element.value=value;
  });
</script>
<vyp-ha-textarea bind:this={element} {id} class={className} {style} {dir} {lang}></vyp-ha-textarea>
