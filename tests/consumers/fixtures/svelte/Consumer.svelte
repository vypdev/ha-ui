<script lang="ts">
  import {Tabs} from '@vypdev/ha-ui-svelte';
  import type {NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
  import {model} from './model.js';
  let viewState=$state.raw(model()),spanish=$state(false),dark=$state(false),disabled=$state(false),visible=$state(true),count=$state(0);
  function select(event:NavigationSelectionEvent){event.preventDefault();viewState=model(spanish,event.detail.id,disabled);count++;}
  function language(){spanish=!spanish;viewState=model(spanish,viewState.selected!,disabled);}
  function toggleDisabled(){disabled=!disabled;viewState=model(spanish,'overview',disabled);}
</script>
{#snippet tasks()}<button>Add task</button>{/snippet}
<section style:--primary-text-color={dark?'rgb(235,235,235)':'rgb(28,28,28)'} style:--secondary-text-color={dark?'rgb(189,189,189)':'rgb(89,89,89)'} style:--card-background-color={dark?'rgb(20,20,20)':'rgb(255,255,255)'}>
  <button onclick={language}>Switch language</button><button onclick={()=>dark=!dark}>Toggle theme</button>
  <button onclick={toggleDisabled}>Toggle disabled</button><button onclick={()=>visible=!visible}>Toggle component</button>
  <output aria-label="Selection events">{count}</output>
  {#if visible}<Tabs state={viewState} onSelectionRequest={select} panels={{tasks}} />{/if}
</section>
