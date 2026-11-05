<script lang="ts">
 import type {HaRow} from '@vypdev/ha-ui/layout';
 import type {RowProps} from './types.js';
 let {state,leading,trailing,id,class:className,style,dir,lang}:RowProps=$props();
 let host:HaRow;
 $effect(()=>{host.state=state;});
</script>
<vyp-ha-row bind:this={host} {id} class={className} {style} {dir} {lang}>
 {#if leading}<div slot="leading" data-vyp-ha-row-projection>{@render leading()}</div>{/if}
 {#if trailing}<div slot="trailing" data-vyp-ha-row-projection>{@render trailing()}</div>{/if}
</vyp-ha-row>
