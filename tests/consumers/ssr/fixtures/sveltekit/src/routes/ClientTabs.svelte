<script>
  import {Tabs,TextField,TextArea} from '@vypdev/ha-ui-svelte';
  import {registerTextArea} from '@vypdev/ha-ui/textarea';
  import {textAreaState} from '@vypdev/ha-ui/textarea-contracts';
  import {registerTabs} from '@vypdev/ha-ui/tabs';

  import {registerField} from '@vypdev/ha-ui/field';
  import {textFieldState} from '@vypdev/ha-ui/field-contracts';
  registerTabs();registerField();registerTextArea();
  const barcodeState=textFieldState({label:'Barcode number',inputMode:'numeric'});
  let barcode=$state('00012345'),note=$state('Initial\n😀'),noteEvents=$state(0);
  const noteState=textAreaState({label:'Notes',required:true,maxLength:1000});
  let {initial}=$props();
  let state=$state.raw(initial),count=$state(0),mounted=$state(true);
  function select(event) {
    count++;
    state={...state,selected:event.detail.id};
  }
</script>

<form aria-label="Barcode form"><TextField state={barcodeState} value={barcode} name="barcode" onValueChange={value=>{barcode=value;}} /></form>
{#snippet overview()}<span>Household overview</span>{/snippet}
{#snippet tasks()}<span>Household tasks</span>{/snippet}
<output aria-label="Multiline requests">{noteEvents}</output>
{#if mounted}<form aria-label="Multiline form"><TextArea state={noteState} value={note} name="note" defaultValue={'Initial\n😀'} onValueChange={value=>{note=value;}} onValueRequest={()=>{noteEvents++;}} /><button type="reset">Reset multiline note</button></form>{/if}
<button type="button" onclick={()=>{mounted=!mounted;}}>Toggle controls</button>
<output aria-label="Selection requests">{count}</output>
{#if mounted}<Tabs {state} onSelectionRequest={select} panels={{overview,tasks}} />{/if}
