import {mount} from 'svelte';
import {registerTabs} from '@vypdev/ha-ui/tabs';
import {registerField} from '@vypdev/ha-ui/field';
import {registerButton} from '@vypdev/ha-ui/button';
import {registerSelect} from '@vypdev/ha-ui/select';
import Consumer from './Consumer.svelte';
registerTabs();registerField();registerButton();registerSelect();mount(Consumer,{target:document.querySelector('main')!});
