import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteDialog.svelte';
import {dialogAdapterCases} from './dialog-framework-fixture.js';
dialogAdapterCases(async(target,options)=>{
 const instance=mount(Consumer,{target,props:{options}});flushSync();
 return{host:target.querySelector('vyp-ha-dialog'),update:async patch=>{flushSync(()=>instance.update(patch));},unmount:async()=>{await unmount(instance);}};
});
