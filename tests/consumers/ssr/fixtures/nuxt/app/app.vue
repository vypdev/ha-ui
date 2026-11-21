<script setup>
import {navigationState} from '@vypdev/ha-ui/contracts';
import {textAreaState} from '@vypdev/ha-ui/textarea-contracts';

const noteState=textAreaState({label:'Notes',maxLength:1000});
const initial=navigationState({kind:'panels',label:'Household sections',selected:'overview',
  items:[{id:'overview',label:'Overview'},{id:'tasks',label:'Tasks'}]});
</script>

<template>
  <main :data-note-limit="noteState.maxLength">
    <h1>Nuxt server shell</h1>
    <ClientOnly>
      <ClientTabs :initial="initial" />
      <template #fallback><p data-client-fallback>Loading household controls…</p></template>
    </ClientOnly>
  </main>
</template>
