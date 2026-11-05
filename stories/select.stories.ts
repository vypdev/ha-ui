import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {expect,waitFor,userEvent} from 'storybook/test';
import {renderExample,type Args} from './select.example.js';
import type {HaSelect} from '@vypdev/ha-ui/select';
import type {HaButton} from '@vypdev/ha-ui/button';
const meta={title:'Forms/Select',component:'vyp-ha-select',tags:['autodocs'],args:{value:1,defaultValue:false,multiple:false,mode:'auto',required:false,disabled:false,error:false,empty:false,cancel:false,submitted:null},argTypes:{value:{control:'object'},defaultValue:{control:'object'},multiple:{control:'boolean'},mode:{control:'select',options:['auto','dropdown','list']},required:{control:'boolean'},disabled:{control:'boolean'},error:{control:'boolean'},empty:{control:'boolean'},cancel:{control:'boolean'},submitted:{table:{disable:true}}},parameters:{docs:{description:{component:'A typed select with a filled picker, a multiple dropdown with chips and search, and explicit radio and checkbox lists. Automatic mode retains its size-based behavior. The app owns its model; all framework bindings reuse this renderer. ElementInternals serializes successful primitives as strings in FormData.'}}},render:renderExample} satisfies Meta<Args>;
export default meta;type Story=StoryObj<Args>;
export const Default:Story={play:async({canvasElement})=>{
 const host=canvasElement.querySelector<HaSelect>('vyp-ha-select')!;await host.updateComplete;await userEvent.click(host.shadowRoot!.querySelector('#control')!);await host.updateComplete;await userEvent.click(host.shadowRoot!.querySelector('#option-3')!);await waitFor(()=>expect(host.value).toBe(''));
 canvasElement.querySelector('form')!.reset();await waitFor(()=>expect(host.value).toBe(false));canvasElement.querySelector<HaButton>('vyp-ha-button[type=submit]')!.click();await waitFor(()=>expect(canvasElement.querySelector('[role=status]')!.textContent).toContain('[["category","false"]]'));
}};
export const Multiple:Story={args:{multiple:true,mode:'dropdown',value:[1,false],defaultValue:[1]},play:async({canvasElement})=>{const host=canvasElement.querySelector<HaSelect>('vyp-ha-select')!;await host.updateComplete;await userEvent.click(host.shadowRoot!.querySelector('#multi-remove-1')!);await waitFor(()=>expect(host.value).toEqual([1]));await userEvent.click(host.shadowRoot!.querySelector('#control')!);await host.updateComplete;await userEvent.type(host.shadowRoot!.querySelector('#multi-search')!,host.state.options[1].label);await host.updateComplete;await userEvent.click(host.shadowRoot!.querySelector('#multi-option-1')!);await waitFor(()=>expect(host.value).toEqual([1,'1']));}};
export const SingleList:Story={args:{mode:'list',required:true},play:async({canvasElement})=>{
 const host=canvasElement.querySelector<HaSelect>('vyp-ha-select')!;await host.updateComplete;
 const choice=host.shadowRoot!.querySelector<HTMLInputElement>('#list-option-1')!;await userEvent.click(choice);
 await waitFor(()=>{expect(host.value).toBe('1');expect(choice).toBeChecked();});
 canvasElement.querySelector('form')!.reset();await waitFor(()=>expect(host.value).toBe(false));
}};
export const MultipleList:Story={args:{mode:'list',multiple:true,value:[1,false],defaultValue:[1]},play:async({canvasElement})=>{
 const host=canvasElement.querySelector<HaSelect>('vyp-ha-select')!;await host.updateComplete;
 const choice=host.shadowRoot!.querySelector<HTMLInputElement>('#list-option-1')!;await userEvent.click(choice);
 await waitFor(()=>{expect(host.value).toEqual([1,false,'1']);expect(choice).toBeChecked();});
 canvasElement.querySelector<HaButton>('vyp-ha-button[type=submit]')!.click();
 await waitFor(()=>expect(canvasElement.querySelector('[role=status]')!.textContent).toContain('[["category","1"],["category","1"],["category","false"]]'));
}};
export const Required:Story={args:{required:true,value:null},play:async({canvasElement})=>{const host=canvasElement.querySelector<HaSelect>('vyp-ha-select')!;await host.updateComplete;host.addEventListener('invalid',event=>event.preventDefault());expect(host.reportValidity()).toBe(false);await host.updateComplete;expect(host.shadowRoot!.querySelector('#control')!.getAttribute('aria-invalid')).toBe('true');}};
export const Disabled:Story={args:{disabled:true}};
export const Error:Story={args:{error:true}};
export const Unavailable:Story={args:{value:'missing'}};
export const DisabledOption:Story={args:{value:'archived'}};
export const Empty:Story={args:{value:null,empty:true}};
export const EmptyMultiple:Story={args:{value:[],multiple:true,mode:'dropdown',empty:true}};
export const Canceled:Story={args:{cancel:true},play:async({canvasElement})=>{const host=canvasElement.querySelector<HaSelect>('vyp-ha-select')!;await host.updateComplete;await userEvent.click(host.shadowRoot!.querySelector('#control')!);await host.updateComplete;await userEvent.click(host.shadowRoot!.querySelector('#option-2')!);expect(host.value).toBe(1);expect((host.shadowRoot!.querySelector('#control') as HTMLButtonElement).value).toBe('0');}};
export const SpanishDarkNarrow:Story={globals:{locale:'es',theme:'dark',width:'narrow',motion:'reduced'}};
