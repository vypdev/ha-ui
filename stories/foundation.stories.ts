import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {renderExample,type Args} from './foundation.example.js';
import {expect} from 'storybook/test';
import type {HaTabs,NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
const sections=['overview','tasks','inventory','family','settings'] as const;
const meta={title:'Navigation/Household sections',component:'vyp-ha-tabs',tags:['autodocs'],
  args:{selected:'overview',icons:'none',disabled:false,empty:false,longLabels:false},
  argTypes:{icons:{control:'select',options:['none','icon-only','icon-and-title','mixed']},selected:{control:'select',options:sections},disabled:{control:'boolean'},empty:{control:'boolean'},longLabels:{control:'boolean'}},
  parameters:{docs:{description:{component:'Real app-section links from @vypdev/ha-ui/tabs, with current-location semantics. The example owns selection and intercepts navigation; the component never invents a route. React, Vue, Angular and Svelte use this same renderer.'}}},
  render:renderExample,
} satisfies Meta<Args>;
export default meta;
type Story=StoryObj<Args>;
export const Default:Story={play:async({canvasElement})=>{
  const host=canvasElement.querySelector<HaTabs>('vyp-ha-tabs')!;await host.updateComplete;
  const received:NavigationSelectionEvent[]=[];host.addEventListener('ha-selection-request',event=>received.push(event),{once:true});
  host.shadowRoot!.querySelectorAll<HTMLAnchorElement>('a')[1].click();await expect(received).toHaveLength(1);await expect(received[0].defaultPrevented).toBe(true);
}};
export const Disabled:Story={args:{disabled:true}};
export const Empty:Story={args:{empty:true}};
export const LongLabels:Story={args:{longLabels:true}};
export const SpanishDarkNarrow:Story={globals:{locale:'es',theme:'dark',width:'narrow',motion:'reduced'}};

export const IconOnly:Story={args:{icons:'icon-only'}};
export const IconAndTitle:Story={args:{icons:'icon-and-title'}};
export const Mixed:Story={args:{icons:'mixed'}};

export const Overflow:Story={args:{overflow:true},globals:{width:'narrow',motion:'reduced'}};
