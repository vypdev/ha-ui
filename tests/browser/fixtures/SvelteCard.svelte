<script lang="ts">
 import {untrack} from 'svelte';
 import Card from '../../../packages/svelte/src/Card.svelte';
 import type {CardOptions} from '../card-framework-fixture.js';
 let {options}:{options:CardOptions}=$props();let current=$state.raw(untrack(()=>options));
 export function update(patch:Partial<CardOptions>){current={...current,...patch};}
</script>
{#snippet actions()}{#if current.actions}<button onclick={current.onReview}>Review task</button>{/if}{/snippet}
<Card state={current.state} actions={current.supplyActions?actions:undefined}><p>Review household supplies.</p></Card>
