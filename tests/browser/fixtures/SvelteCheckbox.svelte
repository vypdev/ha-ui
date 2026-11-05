<script lang="ts">
 import {untrack} from 'svelte';
 import Checkbox from '../../../packages/svelte/src/Checkbox.svelte';
 import type {CheckboxOptions} from '../checkbox-framework-fixture.js';
 let {options}:{options:CheckboxOptions}=$props();let current=$state.raw(untrack(()=>options));
 export function update(patch:Partial<CheckboxOptions>){current={...current,...patch};}
</script>
<Checkbox {...current} id="bound-checkbox" class="choice" dir="ltr" lang="en" />
