<script lang="ts">
  import {untrack} from 'svelte';
  import Tabs from '../../../packages/svelte/src/Tabs.svelte';
  import type {NavigationState} from '@vypdev/ha-ui/contracts';
  import type {NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
  let {initial,observe}: {initial:NavigationState;observe?:(event:NavigationSelectionEvent)=>void}=$props();
  let viewState=$state.raw(untrack(()=>initial));
  let handler=$state(untrack(()=>observe));
  let showPanels=$state(true);
  export function update(value:NavigationState){viewState=value;}
  export function clearHandler(){handler=undefined;}
  export function clearPanels(){showPanels=false;}
</script>
{#snippet tasks()}<button>Add task</button>{/snippet}
<Tabs state={viewState} onSelectionRequest={handler} panels={showPanels?{tasks}:undefined} id="svelte-tabs" class="household" lang="en" dir="ltr" />
