import {mount} from 'svelte';
import {registerTabs} from '@vypdev/ha-ui/tabs';
import Consumer from './Consumer.svelte';
registerTabs();mount(Consumer,{target:document.querySelector('main')!});
