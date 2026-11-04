<script lang="ts">
 import {onMount} from 'svelte';
 import {checkboxChangeDetail} from '@vypdev/ha-ui/checkbox-contracts';
 import type {HaCheckbox,CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
 import type {CheckboxProps} from './types.js';
 let {state,checked,defaultChecked=false,value='on',name='',disabled=false,form,onCheckedRequest,onCheckedChange,id,class:className,style,dir,lang}:CheckboxProps=$props();
 let element:HaCheckbox;
 onMount(()=>{const handle=(event:CheckboxChangeEvent)=>{const detail=checkboxChangeDetail(event.detail);onCheckedRequest?.(event);if(!event.defaultPrevented)onCheckedChange?.(detail.checked);};element.addEventListener('ha-check-request',handle);return ()=>element.removeEventListener('ha-check-request',handle);});
 $effect(()=>{element.state=state;element.name=name;element.value=value;element.defaultChecked=defaultChecked;element.disabled=disabled;if(form===undefined)element.removeAttribute('form');else element.setAttribute('form',form);element.checked=checked;});
</script>
<vyp-ha-checkbox bind:this={element} {id} class={className} {style} {dir} {lang}></vyp-ha-checkbox>
