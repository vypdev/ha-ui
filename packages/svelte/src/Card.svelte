<script lang="ts">
 import type {HaCard} from '@vypdev/ha-ui/card';
 import type {CardProps} from './types.js';
 let {state,children,actions,id,class:className,style,dir,lang}:CardProps=$props();
 let host:HaCard;
 $effect(()=>{host.state=state;});
</script>
<vyp-ha-card bind:this={host} {id} class={className} {style} {dir} {lang}>
 {@render children?.()}
 {#if actions}<div slot="actions" data-vyp-ha-card-projection>{@render actions()}</div>{/if}
</vyp-ha-card>
