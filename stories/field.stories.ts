import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {renderExample,type Args} from './field.example.js';
import {expect,waitFor} from 'storybook/test';
import type {HaTextField} from '@vypdev/ha-ui/field';
const meta={title:'Forms/Text field',component:'vyp-ha-field',tags:['autodocs'],
  args:{value:'Kitchen',defaultValue:'Kitchen',disabled:false,readOnly:false,required:true,error:false,submitted:null},
  argTypes:{value:{control:'text'},defaultValue:{control:'text'},disabled:{control:'boolean'},readOnly:{control:'boolean'},required:{control:'boolean'},error:{control:'boolean'},submitted:{table:{disable:true}}},
  parameters:{docs:{description:{component:'A real form-associated @vypdev/ha-ui/field. Values are controlled, never serialized into HTML. Native form actions below are example scaffolding, not the pending shared button family. Each framework bridge delegates to this element.'}}},
  render:renderExample,
} satisfies Meta<Args>;
export default meta;
type Story=StoryObj<Args>;
export const Default:Story={play:async({canvasElement})=>{
  const host=canvasElement.querySelector<HaTextField>('vyp-ha-field')!;await host.updateComplete;const control=host.shadowRoot!.querySelector('input')!;
  control.value='Laundry';control.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}));
  await waitFor(()=>expect(host.value).toBe('Laundry'));
  const form=canvasElement.querySelector('form')!;form.reset();await waitFor(()=>expect(host.value).toBe('Kitchen'));
  form.querySelector<HTMLButtonElement>('button[type=submit]')!.click();await waitFor(()=>expect(form.querySelector('output')!.textContent).toContain('Kitchen'));
}};
export const EmptyRequired:Story={args:{value:''},play:async({canvasElement})=>{
  const host=canvasElement.querySelector<HaTextField>('vyp-ha-field')!;await host.updateComplete;host.addEventListener('invalid',event=>event.preventDefault(),{once:true});
  await expect(host.reportValidity()).toBe(false);await host.updateComplete;await expect(host.shadowRoot!.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
}};
export const Disabled:Story={args:{disabled:true}};
export const ReadOnly:Story={args:{readOnly:true}};
export const Error:Story={args:{error:true}};
export const SpanishDarkNarrow:Story={globals:{locale:'es',theme:'dark',width:'narrow',motion:'reduced'}};
export const EnglishFallback:Story={globals:{locale:'fr'}};
