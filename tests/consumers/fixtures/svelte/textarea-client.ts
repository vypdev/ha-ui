import {mount} from 'svelte';
import {registerTextArea} from '@vypdev/ha-ui/textarea';
import Consumer from './TextAreaConsumer.svelte';
registerTextArea();mount(Consumer,{target:document.querySelector('main')!});
