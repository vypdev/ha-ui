import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {expect,userEvent,waitFor} from 'storybook/test';
import type {HaDialog} from '@vypdev/ha-ui/dialog';
import {renderExample,type Args} from './dialog.example.js';

const meta={title:'Overlays/Dialog',component:'vyp-ha-dialog',tags:['autodocs'],
 args:{open:false,kind:'standard',width:'medium',pending:false,guardDismiss:false,confirmDisabled:false,long:false,reject:false,lastAction:null},
 argTypes:{open:{control:'boolean'},kind:{control:'select',options:['standard','alert']},width:{control:'select',options:['small','medium','large','full']},pending:{control:'boolean'},guardDismiss:{control:'boolean'},confirmDisabled:{control:'boolean'},long:{control:'boolean'},reject:{control:'boolean'},lastAction:{table:{disable:true}}},
 parameters:{docs:{description:{component:'A native modal with a responsive Home Assistant surface, controlled open state and typed actions. Use the default slot for content and the footer slot to replace the default actions.'}}},
 render:renderExample} satisfies Meta<Args>;
export default meta;
type Story=StoryObj<Args>;

async function openDialog(canvas:HTMLElement){
 const opener=canvas.querySelector('#open-task-dialog')!,host=canvas.querySelector<HaDialog>('vyp-ha-dialog')!;
 await userEvent.click(opener.shadowRoot!.querySelector('button')!);await host.updateComplete;
 const modal=host.shadowRoot!.querySelector('dialog')!;await waitFor(()=>expect(modal.open).toBe(true));
 return {host,modal};
}
export const Default:Story={play:async({canvasElement})=>{
 const {host,modal}=await openDialog(canvasElement);await userEvent.click(host.shadowRoot!.querySelector('[data-action=confirm]')!.shadowRoot!.querySelector('button')!);
 await waitFor(()=>expect(modal.open).toBe(false));
 await waitFor(()=>expect(canvasElement.querySelector('[role=status]')!.textContent).toContain('confirm'));
}};
export const Alert:Story={args:{kind:'alert',width:'small'},play:async({canvasElement})=>{await openDialog(canvasElement);}};
export const Busy:Story={args:{pending:true,guardDismiss:true},play:async({canvasElement})=>{
 const {host}=await openDialog(canvasElement);const button=host.shadowRoot!.querySelector('[data-action=confirm]')!.shadowRoot!.querySelector('button')!;
 await expect(button).toHaveAttribute('aria-busy','true');
}};
export const LongContent:Story={args:{long:true,width:'large'},play:async({canvasElement})=>{await openDialog(canvasElement);}};
export const Canceled:Story={args:{reject:true},play:async({canvasElement})=>{
 const {host,modal}=await openDialog(canvasElement);await userEvent.click(host.shadowRoot!.querySelector('[data-action=cancel]')!.shadowRoot!.querySelector('button')!);
 await expect(modal.open).toBe(true);
}};
export const SpanishDarkNarrow:Story={args:{confirmDisabled:true},globals:{locale:'es',theme:'dark',width:'narrow',motion:'reduced'},play:async({canvasElement})=>{await openDialog(canvasElement);}};
