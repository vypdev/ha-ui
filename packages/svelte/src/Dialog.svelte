<script lang="ts">
 import {onMount} from 'svelte';
 import {dialogRequestDetail} from '@vypdev/ha-ui/dialog-contracts';
 import type {DialogRequestEvent,HaDialog} from '@vypdev/ha-ui/dialog';
 import type {DialogProps} from './types.js';
 let {state,open,children,footer,onRequest,onAction,id,class:className,style,dir,lang}:DialogProps=$props();
 let host:HaDialog;
 onMount(()=>{
  const current=host;
  const handle=(event:DialogRequestEvent)=>{if(event.target!==current)return;const detail=dialogRequestDetail(event.detail);onRequest?.(event);if(!event.defaultPrevented)onAction?.(detail);};
  current.addEventListener('ha-dialog-request',handle);return()=>current.removeEventListener('ha-dialog-request',handle);
 });
 $effect(()=>{host.state=state;host.open=open;});
</script>
<vyp-ha-dialog bind:this={host} {id} class={className} {style} {dir} {lang}>
 {@render children?.()}
 {#if footer}<div slot="footer">{@render footer()}</div>{/if}
</vyp-ha-dialog>
