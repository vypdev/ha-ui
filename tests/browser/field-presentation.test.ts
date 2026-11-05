import axe from 'axe-core';
import {afterEach,expect,test} from 'vitest';
import {userEvent} from 'vitest/browser';
import {textFieldState} from '../../packages/core/src/field-contracts.js';
import {registerField,type HaTextField} from '../../packages/core/src/components/field.js';
afterEach(()=>document.body.replaceChildren());
async function mount(patch:Record<string,unknown>={}){registerField();const field=document.createElement('vyp-ha-field');field.state=textFieldState({label:'Task name',...patch});document.body.append(field);await field.updateComplete;return field;}
const label=(field:HaTextField)=>field.shadowRoot!.querySelector('label')!;
test('the label floats on keyboard focus and accepted values without emitting model intent',async()=>{
 const field=await mount();let requests=0;field.addEventListener('ha-value-request',()=>requests++);
 expect(getComputedStyle(label(field)).fontSize).toBe('14px');await userEvent.tab();await expect.poll(()=>getComputedStyle(label(field)).fontSize).toBe('10px');
 field.blur();await expect.poll(()=>getComputedStyle(label(field)).fontSize).toBe('14px');field.value='Kitchen';await field.updateComplete;await expect.poll(()=>getComputedStyle(label(field)).fontSize).toBe('10px');
 field.value='';await field.updateComplete;await expect.poll(()=>getComputedStyle(label(field)).fontSize).toBe('14px');expect(requests).toBe(0);
});
test('a visible placeholder raises the label before focus and removing it restores the empty label',async()=>{
 const field=await mount({placeholder:'Example: kitchen'});expect(field.shadowRoot!.querySelector('input')!.placeholder).toBe('Example: kitchen');expect(getComputedStyle(label(field)).fontSize).toBe('10px');
 field.state=textFieldState({label:'Task name'});await field.updateComplete;await expect.poll(()=>getComputedStyle(label(field)).fontSize).toBe('14px');
});
test('required presentation keeps a stable accessible name and reserves the HA hint row',async()=>{
 const field=await mount(),ordinary=field.getBoundingClientRect().height;field.state=textFieldState({label:'Task name',required:true});await field.updateComplete;
 expect(label(field).textContent).toBe('Task name*');expect(field.shadowRoot!.querySelector('input')!.getAttribute('aria-label')).toBe('Task name');expect(field.getBoundingClientRect().height-ordinary).toBe(20);
});
test('help and validation text stay separately associated when both are needed',async()=>{
 const field=await mount({description:'Choose a short name.',error:'Use another name.'}),input=field.shadowRoot!.querySelector('input')!;
 expect(input.getAttribute('aria-describedby')).toBe('help error');expect(field.shadowRoot!.querySelector('#help')!.textContent).toBe('Choose a short name.');expect(field.shadowRoot!.querySelector('#error')!.textContent).toBe('Use another name.');
 expect(field.shadowRoot!.querySelector('#help')!.getBoundingClientRect().bottom).toBeLessThanOrEqual(field.shadowRoot!.querySelector('#error')!.getBoundingClientRect().top);
});
test('the native hidden attribute removes the field visually while retaining controlled form state',async()=>{
 const field=await mount();field.name='task';field.value='Kitchen';const form=document.createElement('form');form.append(field);document.body.append(form);field.hidden=true;
 expect(getComputedStyle(field).display).toBe('none');expect(field.shadowRoot!.querySelector('input')!.getClientRects()).toHaveLength(0);expect([...new FormData(form)]).toEqual([['task','Kitchen']]);field.hidden=false;expect(field.getBoundingClientRect().height).toBeGreaterThanOrEqual(56);expect(field.value).toBe('Kitchen');
});
test('public outer spacing and legacy surface/shape tokens update the actual painted control',async()=>{
 const field=await mount();field.style.cssText='--ha-input-padding-top:4px;--ha-input-padding-bottom:12px;--vyp-ha-surface:rgb(30,40,50);--vyp-ha-field-radius:8px';
 const control=field.shadowRoot!.querySelector<HTMLElement>('[part=control]');expect(control).not.toBeNull();expect(getComputedStyle(control!).backgroundColor).toBe('rgb(30, 40, 50)');expect(getComputedStyle(control!).borderRadius).toBe('8px');expect(field.getBoundingClientRect().height).toBe(72);
});
test.each(['enabled','readonly','disabled'])('clicking the painted padding preserves native focus behavior: %s',async mode=>{
 const field=await mount({readOnly:mode==='readonly'});field.disabled=mode==='disabled';await field.updateComplete;const control=field.shadowRoot!.querySelector<HTMLElement>('[part=control]')!,input=field.shadowRoot!.querySelector('input')!;let target:EventTarget|null=null,requests=0;
 // The measured click point is inside the painted horizontal padding, before the input.
 expect(input.getBoundingClientRect().left).toBeGreaterThan(control.getBoundingClientRect().left+4);
 control.addEventListener('click',event=>{target=event.target;});field.addEventListener('ha-value-request',()=>requests++);await userEvent.click(control,{position:{x:4,y:4}});expect(target).toBe(control);expect(field.shadowRoot!.activeElement===input).toBe(mode!=='disabled');expect(requests).toBe(0);
});
test('standalone focused, placeholder and error text retain contrast without a host theme',async()=>{
 const main=document.createElement('main');main.style.cssText='background:#fff;color:#141414;padding:16px';document.body.append(main);
 const field=await mount({placeholder:'Example: kitchen'});main.append(field);const invalid=await mount({label:'Other task',error:'Use a different name.'});main.append(invalid);field.focus();
 const result=await axe.run(main,{runOnly:{type:'rule',values:['color-contrast']}});expect(result.violations.map(({id,nodes})=>({id,targets:nodes.map(node=>node.target)}))).toEqual([]);
 const luminance=(value:string)=>{const rgb=value.match(/[\d.]+/gu)!.slice(0,3).map(Number).map(channel=>{const scaled=channel/255;return scaled<=.04045?scaled/12.92:((scaled+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};const foreground=luminance(getComputedStyle(field.shadowRoot!.querySelector('input')!,'::placeholder').color),background=luminance(getComputedStyle(field.shadowRoot!.querySelector('[part=control]')!).backgroundColor);expect((Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05)).toBeGreaterThanOrEqual(4.5);
 const control=field.shadowRoot!.querySelector<HTMLElement>('[part=control]')!;await userEvent.hover(field.shadowRoot!.querySelector('input')!);getComputedStyle(control).backgroundColor;await Promise.all([...label(field).getAnimations(),...control.getAnimations()].map(animation=>animation.finished));const focused=luminance(getComputedStyle(label(field)).color),hovered=luminance(getComputedStyle(control).backgroundColor);expect((Math.max(focused,hovered)+.05)/(Math.min(focused,hovered)+.05)).toBeGreaterThanOrEqual(4.5);
});
