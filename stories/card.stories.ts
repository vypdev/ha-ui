import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {expect,userEvent,waitFor} from 'storybook/test';
import {renderExample,type Args} from './card.example.js';

const meta={title:'Surfaces/Card',component:'vyp-ha-card',tags:['autodocs'],
 args:{raised:false,actions:false,untitled:false,empty:false,long:false,rtl:false,reviewed:false},
 argTypes:{raised:{control:'boolean'},actions:{control:'boolean'},untitled:{control:'boolean'},empty:{control:'boolean'},long:{control:'boolean'},rtl:{control:'boolean'},reviewed:{table:{disable:true}}},
 parameters:{docs:{description:{component:'A Home Assistant card surface with a semantic heading, application content and an optional actions slot.'}}},
 render:renderExample} satisfies Meta<Args>;
export default meta;type Story=StoryObj<Args>;
export const Default:Story={};
export const Raised:Story={args:{raised:true}};
export const Untitled:Story={args:{untitled:true}};
export const HeadingOnly:Story={args:{empty:true}};
export const Narrow:Story={args:{long:true},globals:{width:'narrow'}};
export const RightToLeft:Story={args:{rtl:true,actions:true}};
export const WithActions:Story={args:{actions:true},play:async({canvasElement})=>{
 const command=canvasElement.querySelector('#card-review')!;
 await userEvent.click(command.shadowRoot!.querySelector('button')!);
 await waitFor(()=>expect(canvasElement.querySelector('[role=status]')!.textContent).not.toBe(''));
}};
