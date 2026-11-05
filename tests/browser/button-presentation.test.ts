import axe from 'axe-core';
import {afterEach,expect,test} from 'vitest';
import {userEvent} from 'vitest/browser';
import {buttonState} from '../../packages/core/src/button-contracts.js';
import {registerButton,type HaButton} from '../../packages/core/src/components/button.js';
afterEach(()=>document.body.replaceChildren());
const painted=(host:HaButton)=>host.shadowRoot!.querySelector<HTMLElement>('[part=surface]')!;
async function mount(patch:Record<string,unknown>={}){registerButton();const host=document.createElement('vyp-ha-button');host.state=buttonState({label:'Save task',...patch});document.body.append(host);await host.updateComplete;return host;}
test.each([['small',32,14],['medium',40,14],['large',48,16],['extra-large',56,16]])('HA %s visual geometry retains a native accessible hit target',async(size,height,font)=>{
 const host=await mount({size}),surface=painted(host),button=host.shadowRoot!.querySelector('button')!;
 expect(surface).not.toBeNull();expect(surface.getBoundingClientRect().height).toBe(height);expect(getComputedStyle(surface).fontSize).toBe(font+'px');expect(getComputedStyle(surface).lineHeight).toBe(font+'px');
 expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);expect(button.contains(surface)).toBe(true);
});
test('public HA size and shape tokens update the painted control without reducing its native hit area',async()=>{
 const host=await mount();host.style.cssText='--ha-button-height:28px;--ha-button-border-radius:6px';expect(painted(host)).not.toBeNull();expect(painted(host).getBoundingClientRect().height).toBe(28);expect(getComputedStyle(painted(host)).borderRadius).toBe('6px');expect(host.shadowRoot!.querySelector('button')!.getBoundingClientRect().height).toBe(44);
 host.style.cssText+=';--vyp-ha-button-height:36px;--vyp-ha-button-radius:8px';expect(painted(host).getBoundingClientRect().height).toBe(36);expect(getComputedStyle(painted(host)).borderRadius).toBe('8px');
});
test('the visible focus ring follows the painted HA boundary while native keyboard activation stays singular',async()=>{
 const host=await mount();let requests=0;host.addEventListener('ha-press-request',()=>requests++);await userEvent.tab();expect(painted(host)).not.toBeNull();expect(getComputedStyle(painted(host)).outlineStyle).toBe('solid');await userEvent.keyboard('{Enter}');expect(requests).toBe(1);
});
test('loading preserves geometry, hides the label visually and centers a local SVG spinner without stealing focus',async()=>{
 const host=await mount();host.focus();expect(painted(host)).not.toBeNull();const before=painted(host).getBoundingClientRect();host.state=buttonState({...host.state,loading:true});await host.updateComplete;
 const after=painted(host).getBoundingClientRect(),spinner=host.shadowRoot!.querySelector<SVGSVGElement>('.spinner svg')!;expect(after.width).toBe(before.width);expect(after.height).toBe(before.height);expect(getComputedStyle(host.shadowRoot!.querySelector('.label')!).opacity).toBe('0');
 expect(spinner.namespaceURI).toBe('http://www.w3.org/2000/svg');const box=spinner.getBoundingClientRect();expect(Math.abs(box.x+box.width/2-after.x-after.width/2)).toBeLessThan(.1);expect(Math.abs(box.y+box.height/2-after.y-after.height/2)).toBeLessThan(.1);expect(host.shadowRoot!.activeElement).toBe(host.shadowRoot!.querySelector('button'));
});
test('real icon projection updates spacing after replacement, removal and disconnected edits',async()=>{
 const host=await mount();expect(painted(host)).not.toBeNull();const baseline=painted(host).getBoundingClientRect().width;
 const icon=document.createElement('span');icon.slot='leading';icon.textContent='+';host.append(icon);await expect.poll(()=>painted(host).getBoundingClientRect().width).toBeGreaterThan(baseline);
 icon.slot='trailing';await expect.poll(()=>host.shadowRoot!.querySelector('button')!.dataset.trailing).toBe('true');await expect.poll(()=>host.shadowRoot!.querySelector('button')!.dataset.leading).toBe('false');
 host.remove();icon.remove();document.body.append(host);await expect.poll(()=>painted(host).getBoundingClientRect().width).toBe(baseline);
 const blank=document.createTextNode(' ');host.append(blank);await host.updateComplete;expect(painted(host).getBoundingClientRect().width).toBe(baseline);
});

test('standalone fallback colors retain text contrast without a host theme',async()=>{
 const holder=document.createElement('main');holder.style.cssText='background:#fff;color:#141414;padding:16px';document.body.append(holder);
 for(const variant of ['primary','neutral','danger','success','warning','plain','outlined','filled']){const host=await mount({variant});holder.append(host);await host.updateComplete;}
 const result=await axe.run(holder,{runOnly:{type:'rule',values:['color-contrast']}});expect(result.violations.map(({id,nodes})=>({id,targets:nodes.map(node=>node.target)}))).toEqual([]);
});
test.each(['neutral','outlined','filled'])('existing border and text overrides retain precedence in the %s presentation',async variant=>{
 const host=await mount({variant});host.style.cssText='--vyp-ha-surface:rgb(230,240,250);--vyp-ha-surface-raised:rgb(230,240,250);--vyp-ha-border:rgb(40,50,60);--vyp-ha-text:rgb(20,30,40)';const css=getComputedStyle(painted(host));expect(css.backgroundColor).toBe(variant==='outlined'?'rgba(0, 0, 0, 0)':'rgb(230, 240, 250)');expect(css.borderColor).toBe(variant==='filled'?'rgba(0, 0, 0, 0)':'rgb(40, 50, 60)');expect(css.color).toBe('rgb(20, 30, 40)');
});
test('icon-only mode preserves trailing-only and dual decorative projection without clipping',async()=>{
 const host=await mount({iconOnly:true});const trailing=document.createElement('span');trailing.slot='trailing';trailing.textContent='T';host.append(trailing);await expect.poll(()=>host.shadowRoot!.querySelector('button')!.dataset.trailing).toBe('true');
 expect(getComputedStyle(host.shadowRoot!.querySelector('.trailing')!).display).not.toBe('none');expect(trailing.getBoundingClientRect().width).toBeGreaterThan(0);
 const leading=document.createElement('span');leading.slot='leading';leading.textContent='L';host.append(leading);await expect.poll(()=>host.shadowRoot!.querySelector('button')!.dataset.leading).toBe('true');
 const surface=painted(host).getBoundingClientRect();for(const icon of [leading,trailing]){const box=icon.getBoundingClientRect();expect(box.left).toBeGreaterThanOrEqual(surface.left);expect(box.right).toBeLessThanOrEqual(surface.right);}
});
