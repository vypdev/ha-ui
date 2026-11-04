<script lang="ts">
  import {onMount} from 'svelte';
  import {buttonPressDetail} from '@vypdev/ha-ui/button-contracts';
  import type {HaButton,ButtonPressEvent} from '@vypdev/ha-ui/button';
  import type {ButtonProps} from './types.js';
  let {state,type='button',name='',value='',disabled=false,formNoValidate=false,form,onPressRequest,onPress,leading,trailing,id,class:className,style,dir,lang}:ButtonProps=$props();
  let element:HaButton;
  onMount(()=>{
    const handle=(event:ButtonPressEvent)=>{const detail=buttonPressDetail(event.detail);onPressRequest?.(event);if(!event.defaultPrevented)onPress?.(detail);};
    element.addEventListener('ha-press-request',handle);return ()=>element.removeEventListener('ha-press-request',handle);
  });
  $effect(()=>{
    element.state=state;element.type=type;element.name=name;element.value=value;element.disabled=disabled;element.formNoValidate=formNoValidate;
    if(form===undefined)element.removeAttribute('form');else element.setAttribute('form',form);
  });
</script>
<vyp-ha-button bind:this={element} {id} class={className} {style} {dir} {lang}>
  {#if leading}<span slot="leading">{@render leading()}</span>{/if}
  {#if trailing}<span slot="trailing">{@render trailing()}</span>{/if}
</vyp-ha-button>
