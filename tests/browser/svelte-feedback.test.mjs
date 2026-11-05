import {mount,unmount,flushSync} from 'svelte';
import Consumer from './fixtures/SvelteFeedback.svelte';
import {feedbackAdapterCases} from './feedback-framework-fixture.js';
feedbackAdapterCases(async(target,options)=>{
 const instance=mount(Consumer,{target,props:{options}});flushSync();
 return{update:async patch=>{flushSync(()=>instance.update(patch));},unmount:async()=>{await unmount(instance);}};
});
