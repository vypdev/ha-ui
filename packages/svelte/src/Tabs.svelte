<script lang="ts">
  import {onMount} from 'svelte';
  import type {HaTabs,NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
  import type {TabsProps} from './types.js';
  let {state,onSelectionRequest,panels,id,class:className,style,dir,lang}:TabsProps=$props();
  let element:HaTabs;
  onMount(()=>{
    const handle=(event:NavigationSelectionEvent)=>{if(event.composedPath()[0]===element)onSelectionRequest?.(event);};
    element.addEventListener('ha-selection-request',handle);
    return ()=>element.removeEventListener('ha-selection-request',handle);
  });
  $effect(()=>{element.state=state;});
</script>
<vyp-ha-tabs bind:this={element} {id} class={className} {style} {dir} {lang}>
  {#each Object.entries(panels ?? {}) as [id,content] (id)}
    <div slot={id}>{@render content()}</div>
  {/each}
</vyp-ha-tabs>
