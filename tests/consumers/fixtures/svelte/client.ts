import {mount} from 'svelte';
import {registerTabs} from '@vypdev/ha-ui/tabs';
import {registerField} from '@vypdev/ha-ui/field';
import Consumer from './Consumer.svelte';
registerTabs();registerField();mount(Consumer,{target:document.querySelector('main')!});
