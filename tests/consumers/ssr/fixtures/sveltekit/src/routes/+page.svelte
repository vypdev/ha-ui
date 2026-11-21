<script>
  import {onMount} from 'svelte';
  import {navigationState} from '@vypdev/ha-ui/contracts';
import {textAreaState} from '@vypdev/ha-ui/textarea-contracts';

  const noteState=textAreaState({label:'Notes',maxLength:1000});
  const initial=navigationState({kind:'panels',label:'Household sections',selected:'overview',
    items:[{id:'overview',label:'Overview'},{id:'tasks',label:'Tasks'}]});
  let ClientTabs=$state(null);
  onMount(()=>{void import('./ClientTabs.svelte').then(module=>{ClientTabs=module.default;});});
</script>

<main data-note-limit={noteState.maxLength}>
  <h1>SvelteKit server shell</h1>
  {#if ClientTabs}
    <ClientTabs {initial} />
  {:else}
    <p data-client-fallback>Loading household controls…</p>
  {/if}
</main>
