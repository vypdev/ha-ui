import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {renderExample,type GridArgs} from './grid.example.js';

const meta={title:'Layout/Grid',component:'vyp-ha-grid',tags:['autodocs'],
 args:{columns:3,responsive:true,square:false,rtl:false},
 argTypes:{columns:{control:{type:'range',min:1,max:6,step:1}},responsive:{control:'boolean'},square:{control:'boolean'},rtl:{control:'boolean'}},
 parameters:{docs:{description:{component:'Home Assistant grid tracks with optional responsive columns and square child boxes.'}}},
 render:renderExample} satisfies Meta<GridArgs>;
export default meta;type Story=StoryObj<GridArgs>;
export const Default:Story={};
export const Narrow:Story={globals:{width:'narrow'}};
export const Square:Story={args:{square:true}};
export const RightToLeft:Story={args:{rtl:true,columns:2,responsive:false}};
