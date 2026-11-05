import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteSelect.svelte';
import {selectAdapterCases} from './select-framework-fixture.js';
selectAdapterCases(async(target,options)=>{const instance=mount(Consumer,{target,props:{options}});flushSync();return {host:target.querySelector('vyp-ha-select'),update:async patch=>{flushSync(()=>instance.update(patch));},unmount:async()=>{await unmount(instance);}};});
