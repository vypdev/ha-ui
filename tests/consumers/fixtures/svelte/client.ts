import {mount} from 'svelte';
import {registerTabs} from '@vypdev/ha-ui/tabs';
import {registerField} from '@vypdev/ha-ui/field';
import {registerButton} from '@vypdev/ha-ui/button';
import {registerCheckbox} from '@vypdev/ha-ui/checkbox';
import {registerSelect} from '@vypdev/ha-ui/select';
import Consumer from './Consumer.svelte';
registerTabs();registerField();registerButton();registerSelect();registerCheckbox();mount(Consumer,{target:document.querySelector('main')!});
