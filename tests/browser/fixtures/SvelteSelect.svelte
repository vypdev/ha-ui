<script lang="ts">
 import {untrack} from 'svelte';
 import Select from '../../../packages/svelte/src/Select.svelte';
 import type {SelectOptions} from '../select-framework-fixture.js';
 let {options}:{options:SelectOptions}=$props();let current=$state.raw(untrack(()=>options));
 export function update(patch:Partial<SelectOptions>){current={...current,...patch};}
</script>
<Select {...current} id="bound-select" class="choice" dir="ltr" lang="en" />
