import {afterEach,expect,test,vi} from 'vitest';
import {createApp,h,nextTick,shallowRef,type App,type Component} from 'vue';
import {Tabs,TextField,Button,Select,Checkbox} from '../../packages/vue/src/index.js';
import {navigationState} from '../../packages/core/src/contracts.js';
import {textFieldState} from '../../packages/core/src/field-contracts.js';
import {buttonState} from '../../packages/core/src/button-contracts.js';
import {selectState} from '../../packages/core/src/select-contracts.js';
import {checkboxState} from '../../packages/core/src/checkbox-contracts.js';
import {registerTabs} from '../../packages/core/src/components/tabs.js';
import {registerField} from '../../packages/core/src/components/field.js';
import {registerButton} from '../../packages/core/src/components/button.js';
import {registerSelect} from '../../packages/core/src/components/select.js';
import {registerCheckbox} from '../../packages/core/src/components/checkbox.js';

let app:App|undefined;
afterEach(()=>{app?.unmount();app=undefined;document.body.replaceChildren();});
const samples:{component:Component;tag:string;props:Record<string,unknown>}[]=[
  {component:Tabs,tag:'vyp-ha-tabs',props:{state:navigationState({kind:'navigation',label:'Sections',selected:null,items:[]})}},
  {component:TextField,tag:'vyp-ha-field',props:{state:textFieldState({label:'Task'}),modelValue:'Kitchen'}},
  {component:Button,tag:'vyp-ha-button',props:{state:buttonState({label:'Save'})}},
  {component:Select,tag:'vyp-ha-select',props:{state:selectState({label:'Category',options:[{value:1,label:'Maintenance'}]}),modelValue:1}},
  {component:Checkbox,tag:'vyp-ha-checkbox',props:{state:checkboxState({label:'Notify'}),modelValue:false}},
];
test.each(samples)('Vue forwards live native attributes without serializing controlled state: $tag',async sample=>{
  registerTabs();registerField();registerButton();registerSelect();registerCheckbox();
  const click=vi.fn(),attrs=shallowRef<Record<string,unknown>>({title:'Host help','aria-describedby':'host-description','data-proof':'first',tabindex:-1,hidden:true,onClick:click});
  const target=document.createElement('main'),description=document.createElement('p');description.id='host-description';description.textContent='Host description';document.body.append(description,target);
  app=createApp({render:()=>h(sample.component,{...sample.props,...attrs.value})});app.mount(target);
  const host=target.querySelector(sample.tag) as HTMLElement&{updateComplete:Promise<unknown>};await host.updateComplete;
  expect(host.getAttribute('title')).toBe('Host help');expect(host.getAttribute('aria-describedby')).toBe(description.id);expect(host.getAttribute('data-proof')).toBe('first');expect(host.tabIndex).toBe(-1);expect(host.hidden).toBe(true);expect(getComputedStyle(host).display).toBe('none');expect(host.hasAttribute('state')).toBe(false);
  attrs.value={title:'Updated host help','data-proof':'second',onClick:click,innerHTML:'<span data-unowned>Unowned content</span>',outerHTML:'<span data-unowned>Replacement</span>',textContent:'Unowned content','.innerText':'Unowned content'};await nextTick();await host.updateComplete;
  expect(host.title).toBe('Updated host help');expect(host.getAttribute('data-proof')).toBe('second');expect(host.hasAttribute('aria-describedby')).toBe(false);expect(host.hasAttribute('tabindex')).toBe(false);expect(host.hidden).toBe(false);expect(host.getBoundingClientRect().height).toBeGreaterThan(0);
  expect(host.isConnected).toBe(true);expect(host.querySelector('[data-unowned]')).toBeNull();expect(host.textContent).not.toContain('Unowned content');
  host.dispatchEvent(new MouseEvent('click',{bubbles:true}));expect(click).toHaveBeenCalledTimes(1);
  attrs.value={};await nextTick();expect(host.hasAttribute('title')).toBe(false);expect(host.hasAttribute('data-proof')).toBe(false);host.dispatchEvent(new MouseEvent('click',{bubbles:true}));expect(click).toHaveBeenCalledTimes(1);
});
