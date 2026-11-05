<script lang="ts">
 import {untrack} from 'svelte';
 import Feedback from '../../../packages/svelte/src/Feedback.svelte';
 import type {FeedbackOptions} from '../feedback-framework-fixture.js';
 let {options}:{options:FeedbackOptions}=$props();let current=$state.raw(untrack(()=>options));
 export function update(patch:Partial<FeedbackOptions>){current={...current,...patch};}
</script>
{#snippet icon()}<span>!</span>{/snippet}
{#snippet action()}<button onclick={current.onAction}>Retry</button>{/snippet}
<Feedback state={current.state} icon={current.show?icon:undefined} action={current.show?action:undefined} />
