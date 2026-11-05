import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteButton.svelte';
import {buttonAdapterCases} from './button-framework-fixture.js';
buttonAdapterCases(async(target,options)=>{
  const instance=mount(Consumer,{target,props:{options}});flushSync();
  return {host:target.querySelector('vyp-ha-button'),update:async patch=>flushSync(()=>instance.update(patch)),unmount:async()=>{await unmount(instance);}};
});
