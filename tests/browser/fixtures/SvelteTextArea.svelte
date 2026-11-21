<script lang="ts">
  import {untrack} from 'svelte';
  import TextArea from '../../../packages/svelte/src/TextArea.svelte';
  import type {TextAreaValueEvent} from '@vypdev/ha-ui/textarea';
  import type {TextAreaState} from '@vypdev/ha-ui/textarea-contracts';
  import {textAreaModel} from '../textarea-framework-fixture.js';
  let {observe}:{observe?:(event:TextAreaValueEvent)=>void}=$props();
  let value=$state('Kitchen'),viewState=$state.raw(textAreaModel()),disabled=$state(false),external=$state(false),ack=$state(true);
  let handler=$state(untrack(()=>observe));
  export function update(next:string){value=next;}
  export function configure(next:TextAreaState){viewState=next;}
  export function setDisabled(next:boolean){disabled=next;}
  export function setExternal(next:boolean){external=next;}
  export function setHandler(next:((event:TextAreaValueEvent)=>void)|undefined){handler=next;}
  export function stopAcknowledging(){ack=false;}
  export function current(){return value;}
</script>
<form id="svelte-form"><TextArea state={viewState} {value} {disabled} name="task" defaultValue="Initial" form={external?'svelte-form':undefined}
  onValueRequest={handler} onValueChange={ack?(next)=>{value=next;}:undefined} id="svelte-field" class="field" lang="en" dir="ltr" /></form>
