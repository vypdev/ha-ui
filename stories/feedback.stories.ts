import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {expect,userEvent,waitFor} from 'storybook/test';
import {renderExample,type FeedbackArgs} from './feedback.example.js';

const meta={title:'Feedback/Status',component:'vyp-ha-feedback',tags:['autodocs'],
 args:{kind:'notice',tone:'info',titled:true,icon:true,action:false,narrow:false,rtl:false,reviewed:false},
 argTypes:{kind:{control:'select',options:['notice','empty','loading']},tone:{control:'select',options:['info','success','warning','error']},
  titled:{control:'boolean'},icon:{control:'boolean'},action:{control:'boolean'},narrow:{control:'boolean'},rtl:{control:'boolean'},reviewed:{table:{disable:true}}},
 parameters:{docs:{description:{component:'Application-owned notices, errors, empty states and reduced-motion loading with optional native actions.'}}},
 render:renderExample} satisfies Meta<FeedbackArgs>;
export default meta;type Story=StoryObj<FeedbackArgs>;
export const Default:Story={};
export const Success:Story={args:{tone:'success'}};
export const Warning:Story={args:{tone:'warning',action:true,narrow:true},globals:{width:'narrow'}};
export const ErrorNotice:Story={args:{tone:'error',action:true},play:async({canvasElement})=>{
 const command=canvasElement.querySelector('#feedback-command')!.shadowRoot!.querySelector('button')!;
 await userEvent.click(command);await waitFor(()=>expect(canvasElement.querySelector('#feedback-action-result')!.textContent).not.toBe(''));
}};
export const Untitled:Story={args:{titled:false}};
export const Empty:Story={args:{kind:'empty',action:true}};
export const HeadingOnly:Story={args:{kind:'empty',titled:false,icon:false}};
export const Loading:Story={args:{kind:'loading'}};
export const RightToLeft:Story={args:{rtl:true,tone:'warning'}};
