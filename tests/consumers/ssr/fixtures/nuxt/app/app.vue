<script setup>
import {navigationState} from '@vypdev/ha-ui/contracts';

const initial=navigationState({kind:'panels',label:'Household sections',selected:'overview',
  items:[{id:'overview',label:'Overview'},{id:'tasks',label:'Tasks'}]});
</script>

<template>
  <main>
    <h1>Nuxt server shell</h1>
    <ClientOnly>
      <ClientTabs :initial="initial" />
      <template #fallback><p data-client-fallback>Loading household controls…</p></template>
    </ClientOnly>
  </main>
</template>
