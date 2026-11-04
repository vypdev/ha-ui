import type {Meta,StoryObj} from '@storybook/web-components-vite';
import {renderExample,type Args} from './panels.example.js';
import {expect} from 'storybook/test';
import type {HaTabs,NavigationSelectionEvent} from '@vypdev/ha-ui/tabs';
const meta={title:'Tabs/Local panels',component:'vyp-ha-tabs',tags:['autodocs'],args:{selected:'overview',icons:'none',disabled:false},
  argTypes:{icons:{control:'select',options:['none','icon-only','icon-and-title','mixed']},selected:{control:'select',options:['overview','tasks',null]},disabled:{control:'boolean'}},
  parameters:{docs:{description:{component:'The same core element with tab/tabpanel semantics and real named slots. Arrow/Home/End move focus; Enter/Space activate. App sections use the separate navigation mode.'}}},
  render:renderExample,
} satisfies Meta<Args>;
export default meta;
type Story=StoryObj<Args>;
export const Default:Story={play:async({canvasElement})=>{
  const host=canvasElement.querySelector<HaTabs>('vyp-ha-tabs')!;await host.updateComplete;
  const received:NavigationSelectionEvent[]=[];host.addEventListener('ha-selection-request',event=>received.push(event),{once:true});host.shadowRoot!.querySelectorAll<HTMLButtonElement>('[part=item]')[1].click();
  await expect(received).toHaveLength(1);await expect(received[0].detail.id).toBe('tasks');
}};
export const Disabled:Story={args:{disabled:true}};
export const Unselected:Story={args:{selected:null}};
export const SpanishDarkNarrow:Story={globals:{locale:'es',theme:'dark',width:'narrow',motion:'reduced'}};

export const IconOnly:Story={args:{icons:'icon-only'}};
export const IconAndTitle:Story={args:{icons:'icon-and-title'}};
export const Mixed:Story={args:{icons:'mixed'}};

export const Overflow:Story={args:{overflow:true},globals:{width:'narrow',motion:'reduced'}};
