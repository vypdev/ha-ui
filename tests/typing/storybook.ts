import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';
interface Args {value:string;disabled:boolean;}
const meta={args:{value:'Kitchen',disabled:false},render:(args:Args)=>html`${args.value}`} satisfies Meta<Args>;
const valid:StoryObj<Args>={args:{value:'Laundry',disabled:true}};
// @ts-expect-error A number is not a controlled text value.
const invalidValue:StoryObj<Args>={args:{value:42}};
// @ts-expect-error Disabled remains a real boolean.
const invalidDisabled:StoryObj<Args>={args:{disabled:'false'}};
// @ts-expect-error Render args must match the declared model.
const invalidRender:Meta<Args>={render:(args:{value:number})=>html`${args.value}`};
void [meta,valid,invalidValue,invalidDisabled,invalidRender];
