import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteLayout.svelte';
import {layoutAdapterCases} from './layout-framework-fixture.js';
layoutAdapterCases(async(target,options)=>{
 const instance=mount(Consumer,{target,props:{options}});flushSync();
 return{update:async patch=>{flushSync(()=>instance.update(patch));},unmount:async()=>{await unmount(instance);}};
});
