import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {renderExample,type Args} from './textarea.example.js';
import {expect,waitFor} from 'storybook/test';
import type {HaTextArea} from '@vypdev/ha-ui/textarea';
import type {HaButton} from '@vypdev/ha-ui/button';
const initial='First line\nDetails 😀';
const meta={title:'Forms/Text area',component:'vyp-ha-textarea',tags:['autodocs'],
  args:{value:initial,defaultValue:initial,disabled:false,readOnly:false,required:true,error:false,rows:3,minLength:0,maxLength:16384,submitted:null},
  argTypes:{value:{control:'text'},defaultValue:{control:'text'},disabled:{control:'boolean'},readOnly:{control:'boolean'},required:{control:'boolean'},error:{control:'boolean'},rows:{control:{type:'number',min:2,max:20,step:1}},minLength:{control:{type:'number',min:0,max:16384,step:1}},maxLength:{control:{type:'number',min:0,max:16384,step:1}},submitted:{table:{disable:true}}},
  parameters:{docs:{description:{component:'A controlled form-associated multiline textarea. Lengths count Unicode codepoints. Programmatic text stays literal; native user edits use LF line endings. Enter adds a newline. Registration, framework adapters and the existing single-line field remain independent.'}}},
  render:renderExample,
} satisfies Meta<Args>;
export default meta;
type Story=StoryObj<Args>;
export const Default:Story={play:async({canvasElement})=>{
  const host=canvasElement.querySelector<HaTextArea>('vyp-ha-textarea')!;await host.updateComplete;const control=host.shadowRoot!.querySelector('textarea')!;
  control.value='Updated\n😀';control.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}));await waitFor(()=>expect(host.value).toBe('Updated\n😀'));
  const form=canvasElement.querySelector('form')!;form.reset();await waitFor(()=>expect(host.value).toBe(initial));
  form.querySelector<HaButton>('vyp-ha-button[type=submit]')!.click();await waitFor(()=>expect(form.querySelector('[role=status]')!.textContent).toContain(initial));
}};
export const UnicodeCodepoints:Story={args:{value:'😀'.repeat(1000),maxLength:1000},play:async({canvasElement})=>{
  const host=canvasElement.querySelector<HaTextArea>('vyp-ha-textarea')!;await host.updateComplete;await expect(host.checkValidity()).toBe(true);await expect(host.value.length).toBe(2000);
}};
export const EmptyRequired:Story={args:{value:''},play:async({canvasElement})=>{
  const host=canvasElement.querySelector<HaTextArea>('vyp-ha-textarea')!;await host.updateComplete;host.addEventListener('invalid',event=>event.preventDefault(),{once:true});
  await expect(host.reportValidity()).toBe(false);await host.updateComplete;await expect(host.shadowRoot!.querySelector('textarea')!.getAttribute('aria-invalid')).toBe('true');
}};
export const Disabled:Story={args:{disabled:true}};
export const ReadOnly:Story={args:{readOnly:true}};
export const Error:Story={args:{error:true}};
export const SpanishDarkNarrow:Story={globals:{locale:'es',theme:'dark',width:'narrow',motion:'reduced'}};
export const EnglishFallback:Story={globals:{locale:'fr'}};
