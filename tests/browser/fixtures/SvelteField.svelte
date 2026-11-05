<script lang="ts">
  import {untrack} from 'svelte';
  import TextField from '../../../packages/svelte/src/Field.svelte';
  import type {FieldValueEvent} from '@vypdev/ha-ui/field';
  import type {TextFieldState} from '@vypdev/ha-ui/field-contracts';
  import {fieldModel} from '../field-framework-fixture.js';
  let {observe}:{observe?:(event:FieldValueEvent)=>void}=$props();
  let value=$state('Kitchen'),viewState=$state.raw(fieldModel()),disabled=$state(false),external=$state(false),ack=$state(true);
  let handler=$state(untrack(()=>observe));
  export function update(next:string){value=next;}
  export function configure(next:TextFieldState){viewState=next;}
  export function setDisabled(next:boolean){disabled=next;}
  export function setExternal(next:boolean){external=next;}
  export function setHandler(next:((event:FieldValueEvent)=>void)|undefined){handler=next;}
  export function stopAcknowledging(){ack=false;}
  export function current(){return value;}
</script>
<form id="svelte-form"><TextField state={viewState} {value} {disabled} name="task" defaultValue="Initial" form={external?'svelte-form':undefined}
  onValueRequest={handler} onValueChange={ack?(next)=>{value=next;}:undefined} id="svelte-field" class="field" lang="en" dir="ltr" /></form>
