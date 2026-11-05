<script lang="ts">
  import {untrack} from 'svelte';
  import Button from '../../../packages/svelte/src/Button.svelte';
  import type {ButtonOptions} from '../button-framework-fixture.js';
  let {options}:{options:ButtonOptions}=$props();
  let current=$state.raw(untrack(()=>options));
  export function update(patch:Partial<ButtonOptions>){current={...current,...patch};}
</script>
{#snippet leading()}<span>+</span>{/snippet}
{#snippet trailing()}<span>→</span>{/snippet}
<Button {...current} leading={current.icons?leading:undefined} trailing={current.icons?trailing:undefined} id="bound-button" class="action" lang="en" dir="ltr" />
