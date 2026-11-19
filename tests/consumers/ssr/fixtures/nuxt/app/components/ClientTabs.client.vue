<script setup>
import {ref,shallowRef} from 'vue';
import {Tabs,TextField} from '@vypdev/ha-ui-vue';
import {registerTabs} from '@vypdev/ha-ui/tabs';

import {registerField} from '@vypdev/ha-ui/field';
import {textFieldState} from '@vypdev/ha-ui/field-contracts';
registerTabs();registerField();
const barcodeState=textFieldState({label:'Barcode number',inputMode:'numeric'});
const barcode=ref('00012345');
const props=defineProps({initial:{type:Object,required:true}});
const state=shallowRef(props.initial),count=ref(0),mounted=ref(true);
function select(event) {
  count.value++;
  state.value={...state.value,selected:event.detail.id};
}
</script>

<template>
  <form aria-label="Barcode form"><TextField :state="barcodeState" v-model="barcode" name="barcode" /></form>
  <button type="button" @click="mounted=!mounted">Toggle controls</button>
  <output aria-label="Selection requests">{{count}}</output>
  <Tabs v-if="mounted" :state="state" @selection-request="select">
    <span slot="overview">Household overview</span><span slot="tasks">Household tasks</span>
  </Tabs>
</template>
