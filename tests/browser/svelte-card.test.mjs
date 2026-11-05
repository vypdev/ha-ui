import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteCard.svelte';
import {cardAdapterCases} from './card-framework-fixture.js';
cardAdapterCases(async(target,options)=>{
 const instance=mount(Consumer,{target,props:{options}});flushSync();
 return{host:target.querySelector('vyp-ha-card'),update:async patch=>{flushSync(()=>instance.update(patch));},unmount:async()=>{await unmount(instance);}};
});
