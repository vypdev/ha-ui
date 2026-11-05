import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {expect,userEvent,waitFor} from 'storybook/test';
import {renderExample,type RowArgs} from './row.example.js';

const meta={title:'Layout/Row',component:'vyp-ha-row',tags:['autodocs'],
 args:{description:true,actions:false,long:false,rtl:false,reviewed:false},
 argTypes:{description:{control:'boolean'},actions:{control:'boolean'},long:{control:'boolean'},rtl:{control:'boolean'},reviewed:{table:{disable:true}}},
 parameters:{docs:{description:{component:'A passive Home Assistant list row with inert text and optional leading and trailing content.'}}},
 render:renderExample} satisfies Meta<RowArgs>;
export default meta;type Story=StoryObj<RowArgs>;
export const Default:Story={};
export const SingleLine:Story={args:{description:false}};
export const NarrowRightToLeft:Story={args:{long:true,rtl:true},globals:{width:'narrow'}};
export const WithAction:Story={args:{actions:true},play:async({canvasElement})=>{
 const button=canvasElement.querySelector('vyp-ha-row vyp-ha-button')!.shadowRoot!.querySelector('button')!;
 await userEvent.click(button);
 await waitFor(()=>expect(canvasElement.querySelector('[role=status]')!.textContent).not.toBe(''));
}};
