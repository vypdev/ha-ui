<script lang="ts">
 import type {HaFeedback} from '@vypdev/ha-ui/feedback';
 import type {FeedbackProps} from './types.js';
 let {state,action,icon,id,class:className,style,dir,lang}:FeedbackProps=$props();
 let host:HaFeedback;
 $effect(()=>{host.state=state;});
</script>
<vyp-ha-feedback bind:this={host} {id} class={className} {style} {dir} {lang}>
 {#if icon}<div slot="icon" data-vyp-ha-feedback-projection>{@render icon()}</div>{/if}
 {#if action}<div slot="action" data-vyp-ha-feedback-projection>{@render action()}</div>{/if}
</vyp-ha-feedback>
