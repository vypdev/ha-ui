<script lang="ts">
 import type {HaGrid} from '@vypdev/ha-ui/layout';
 import type {GridProps} from './types.js';
 let {state,children,id,class:className,style,dir,lang}:GridProps=$props();
 let host:HaGrid;
 $effect(()=>{host.state=state;});
</script>
<vyp-ha-grid bind:this={host} {id} class={className} {style} {dir} {lang}>
 {@render children?.()}
</vyp-ha-grid>
