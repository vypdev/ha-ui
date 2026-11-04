import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteCheckbox.svelte';
import {checkboxAdapterCases} from './checkbox-framework-fixture.js';
checkboxAdapterCases(async(target,options)=>{const instance=mount(Consumer,{target,props:{options}});flushSync();return {host:target.querySelector('vyp-ha-checkbox'),update:async patch=>{flushSync(()=>instance.update(patch));},unmount:async()=>{await unmount(instance);}};});
