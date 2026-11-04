<script lang="ts">
  import {Tabs,TextField} from '@vypdev/ha-ui-svelte';
  import type {NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
  import type {FieldValueEvent} from '@vypdev/ha-ui/field';
  import {model,fieldModel} from './model.js';
  let viewState=$state.raw(model()),spanish=$state(false),dark=$state(false),disabled=$state(false),visible=$state(true),count=$state(0);
  let value=$state('Kitchen'),fieldDisabled=$state(false),fieldVisible=$state(true),reject=$state(false),fieldEvents=$state(0),saved=$state('');
  function observe(event:FieldValueEvent){fieldEvents++;if(reject)event.preventDefault();}
  function save(event:SubmitEvent){event.preventDefault();const form=event.currentTarget as HTMLFormElement;if(form.reportValidity())saved=JSON.stringify([...new FormData(form,event.submitter)]);}
  function select(event:NavigationSelectionEvent){event.preventDefault();viewState=model(spanish,event.detail.id,disabled);count++;}
  function language(){spanish=!spanish;viewState=model(spanish,viewState.selected!,disabled);}
  function toggleDisabled(){disabled=!disabled;viewState=model(spanish,'overview',disabled);}
</script>
{#snippet tasks()}<button>Add task</button>{/snippet}
<section style:background-color={dark?'rgb(20,20,20)':'rgb(255,255,255)'} style:--divider-color={dark?'rgb(66,66,66)':'rgb(224,224,224)'} style:--primary-text-color={dark?'rgb(235,235,235)':'rgb(28,28,28)'} style:--secondary-text-color={dark?'rgb(189,189,189)':'rgb(89,89,89)'} style:--card-background-color={dark?'rgb(20,20,20)':'rgb(255,255,255)'}>
  <button onclick={language}>Switch language</button><button onclick={()=>dark=!dark}>Toggle theme</button>
  <button onclick={toggleDisabled}>Toggle disabled</button><button onclick={()=>visible=!visible}>Toggle component</button>
  <output aria-label="Selection events">{count}</output>
  {#if visible}<Tabs state={viewState} onSelectionRequest={select} panels={{tasks}} />{/if}
  <button onclick={()=>value='Programmatic'}>Set field value</button><button onclick={()=>reject=!reject}>Reject field changes</button>
  <button onclick={()=>fieldDisabled=!fieldDisabled}>Toggle field disabled</button><button onclick={()=>fieldVisible=!fieldVisible}>Toggle field</button>
  <output aria-label="Field model">{value}</output><output aria-label="Field events">{fieldEvents}</output><output aria-label="Saved task">{saved}</output>
  <form aria-label="Task form" onsubmit={save}>
    {#if fieldVisible}<TextField state={fieldModel(spanish)} {value} name="task" defaultValue="Kitchen" disabled={fieldDisabled} onValueRequest={observe} onValueChange={(next)=>value=next} />{/if}
    <button type="submit" name="action" value="save">Save task</button><button type="reset">Reset task</button>
  </form>
</section>
