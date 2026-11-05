<script lang="ts">
 import {untrack} from 'svelte';
 import Grid from '../../../packages/svelte/src/Grid.svelte';
 import Row from '../../../packages/svelte/src/Row.svelte';
 import type {LayoutOptions} from '../layout-framework-fixture.js';
 let {options}:{options:LayoutOptions}=$props();let current=$state.raw(untrack(()=>options));
 export function update(patch:Partial<LayoutOptions>){current={...current,...patch};}
</script>
{#snippet leading()}<span>Prep</span>{/snippet}
{#snippet trailing()}<button onclick={current.onReview}>Review row</button>{/snippet}
<Grid state={current.grid}><div role="list">
 <Row state={current.row} leading={current.project?leading:undefined} trailing={current.project?trailing:undefined} />
</div></Grid>
