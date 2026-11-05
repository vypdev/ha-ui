<script lang="ts">
 import {untrack} from 'svelte';
 import Dialog from '../../../packages/svelte/src/Dialog.svelte';
 import type {DialogOptions} from '../dialog-framework-fixture.js';
 let {options}:{options:DialogOptions}=$props();let current=$state.raw(untrack(()=>options));
 export function update(patch:Partial<DialogOptions>){current={...current,...patch};}
</script>
{#snippet footer()}<button>Review</button>{/snippet}
<Dialog state={current.state} open={current.open} onRequest={current.onRequest} onAction={current.onAction} footer={current.footer?footer:undefined}>
 <p data-details>Task details</p>
</Dialog>
