<script lang="ts">
  import {TextArea} from '@vypdev/ha-ui-svelte';
  import type {TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
  import {noteState,noteTheme,initialNote} from './textarea-model.js';
  let value=$state(initialNote),events=$state(0),saved=$state(''),disabled=$state(false),readOnly=$state(false),visible=$state(true),reject=$state(false),spanish=$state(false),dark=$state(false);
  function observe(event:TextAreaValueEvent){events++;if(reject)event.preventDefault();}
  function save(event:SubmitEvent){event.preventDefault();saved=JSON.stringify([...new FormData(event.currentTarget as HTMLFormElement)]);}
</script>
<section style={Object.entries(noteTheme(dark)).map(([name,value])=>`${name.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase())}:${value}`).join(';')}>
  <button onclick={()=>{reject=!reject;}}>Reject note changes</button><button onclick={()=>{disabled=!disabled;}}>Toggle note disabled</button>
  <button onclick={()=>{readOnly=!readOnly;}}>Toggle note readonly</button><button onclick={()=>{visible=!visible;}}>Toggle note</button>
  <button onclick={()=>{value='Programmatic\n😀';}}>Set note value</button><button onclick={()=>{spanish=!spanish;}}>Switch note language</button><button onclick={()=>{dark=!dark;}}>Toggle note theme</button>
  <output aria-label="Note model">{value}</output><output aria-label="Note events">{events}</output><output aria-label="Saved note">{saved}</output>
  <form aria-label="Note form" onsubmit={save}><fieldset>{#if visible}<TextArea state={noteState(spanish,readOnly)} {value} {disabled} name="note" defaultValue={initialNote} onValueRequest={observe} onValueChange={next=>{value=next;}} />{/if}</fieldset>
    <button type="submit">Save note</button><button type="reset">Reset note</button>
  </form>
</section>
