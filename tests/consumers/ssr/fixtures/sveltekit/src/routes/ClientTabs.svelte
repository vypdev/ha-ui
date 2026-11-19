<script>
  import {Tabs,TextField} from '@vypdev/ha-ui-svelte';
  import {registerTabs} from '@vypdev/ha-ui/tabs';

  import {registerField} from '@vypdev/ha-ui/field';
  import {textFieldState} from '@vypdev/ha-ui/field-contracts';
  registerTabs();registerField();
  const barcodeState=textFieldState({label:'Barcode number',inputMode:'numeric'});
  let barcode=$state('00012345');
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
<button type="button" onclick={()=>{mounted=!mounted;}}>Toggle controls</button>
<output aria-label="Selection requests">{count}</output>
{#if mounted}<Tabs {state} onSelectionRequest={select} panels={{overview,tasks}} />{/if}
