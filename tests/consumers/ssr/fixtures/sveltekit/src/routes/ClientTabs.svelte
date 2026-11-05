<script>
  import {Tabs} from '@vypdev/ha-ui-svelte';
  import {registerTabs} from '@vypdev/ha-ui/tabs';

  registerTabs();
  let {initial}=$props();
  let state=$state.raw(initial),count=$state(0),mounted=$state(true);
  function select(event) {
    count++;
    state={...state,selected:event.detail.id};
  }
</script>

{#snippet overview()}<span>Household overview</span>{/snippet}
{#snippet tasks()}<span>Household tasks</span>{/snippet}
<button type="button" onclick={()=>{mounted=!mounted;}}>Toggle controls</button>
<output aria-label="Selection requests">{count}</output>
{#if mounted}<Tabs {state} onSelectionRequest={select} panels={{overview,tasks}} />{/if}
