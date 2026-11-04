import {afterEach,expect,test,vi} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {navigationState} from '../../packages/core/src/contracts.js';
import {registerTabs,type HaTabs,type NavigationSelectionEvent} from '../../packages/core/src/components/tabs.js';

afterEach(()=>{document.body.replaceChildren();vi.restoreAllMocks();});
const labels=['Overview','Tasks','Inventory','Family','Settings','Calendar','Shopping','Rewards'];
async function mount(kind:'navigation'|'panels'='navigation',rtl=false,width=240){
 registerTabs();const host=document.createElement('vyp-ha-tabs');host.style.width=width+'px';host.dir=rtl?'rtl':'ltr';host.state=navigationState({kind,label:'Sections',selected:'item-0',items:labels.map((label,n)=>({id:'item-'+n,label,href:kind==='navigation'?'#'+n:null}))});document.body.append(host);await host.updateComplete;return host;
}
const viewport=(host:HaTabs)=>host.shadowRoot!.querySelector<HTMLElement>('.bar')!;
const items=(host:HaTabs)=>[...host.shadowRoot!.querySelectorAll<HTMLElement>('[part=item]')];
const next=(host:HaTabs)=>page.elementLocator(host).getByRole('button',{name:'Scroll to end',exact:true});
const previous=(host:HaTabs)=>page.elementLocator(host).getByRole('button',{name:'Scroll to start',exact:true});
function events(host:HaTabs){const out:NavigationSelectionEvent[]=[];host.addEventListener('ha-selection-request',event=>{event.preventDefault();out.push(event);});return out;}

for(const kind of ['navigation','panels'] as const)for(const rtl of [false,true])test(`${kind} pages through narrow overflow without changing selection, rtl=${rtl}`,async()=>{
 const host=await mount(kind,rtl),received=events(host),bar=viewport(host);await expect.element(next(host)).toBeVisible();await expect.element(previous(host)).not.toBeInTheDocument();
 await next(host).click();await expect.poll(()=>Math.abs(bar.scrollLeft)).toBeGreaterThan(0);expect(host.state.selected).toBe('item-0');expect(received).toHaveLength(0);
 await expect.element(previous(host)).toBeVisible();bar.scrollLeft=rtl?-(bar.scrollWidth-bar.clientWidth):bar.scrollWidth-bar.clientWidth;
 await expect.element(next(host)).toBeDisabled();items(host).at(-1)!.focus();await expect.element(next(host)).not.toBeInTheDocument();
 await previous(host).click();await expect.poll(()=>Math.abs(bar.scrollLeft)).toBeLessThan(bar.scrollWidth-bar.clientWidth);expect(received).toHaveLength(0);
});
test('resizing and changed labels add/remove arrows without duplicate or hidden keyboard targets',async()=>{
 const host=await mount();await expect.element(next(host)).toBeVisible();host.style.width='1000px';await expect.element(next(host)).not.toBeInTheDocument();await expect.element(previous(host)).not.toBeInTheDocument();
 host.style.width='240px';await expect.element(next(host)).toBeVisible();host.state=navigationState({...host.state,items:[{id:'item-0',label:'One',href:'#one'}]});await host.updateComplete;await expect.element(next(host)).not.toBeInTheDocument();
 expect(viewport(host).tabIndex).toBe(-1);expect(items(host)).toHaveLength(1);
});
test('programmatic selection is revealed without moving keyboard focus or emitting an intent',async()=>{
 const host=await mount('panels'),received=events(host);const outside=document.createElement('button');outside.textContent='Outside';document.body.append(outside);outside.focus();
 host.state=navigationState({...host.state,selected:'item-7'});await host.updateComplete;await expect.poll(()=>viewport(host).scrollLeft).toBeGreaterThan(0);expect(document.activeElement).toBe(outside);expect(received).toHaveLength(0);
 const r=items(host)[7].getBoundingClientRect(),b=viewport(host).getBoundingClientRect();expect(r.right).toBeLessThanOrEqual(b.right+1);
});
test('logical direction and localized control names update live in the same host',async()=>{
 const host=await mount();await expect.element(next(host)).toBeVisible();host.dir='rtl';await expect.poll(()=>host.shadowRoot!.querySelector('[data-scroll=end]')?.getAttribute('data-rtl')).toBe('true');
 host.state=navigationState({...host.state,scrollStartLabel:'Desplazar al inicio',scrollEndLabel:'Desplazar al final'});await host.updateComplete;await expect.element(page.elementLocator(host).getByRole('button',{name:'Desplazar al final',exact:true})).toBeVisible();
});
test('disabled navigation destinations keep link semantics and their name without a target',async()=>{
 const host=await mount();host.state=navigationState({...host.state,items:[{id:'locked',label:'Locked',href:'#locked',disabled:true}],selected:null});await host.updateComplete;
 const link=page.elementLocator(host).getByRole('link',{name:'Locked',exact:true});await expect.element(link).toBeDisabled();expect(items(host)[0].hasAttribute('href')).toBe(false);expect(items(host)[0].tabIndex).toBe(-1);
});

const frame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
const mouse=(target:EventTarget,type:string,init:MouseEventInit={})=>{const event=new MouseEvent(type,{bubbles:true,cancelable:true,...init});target.dispatchEvent(event);return event;};
test('keyboard focus wins over a queued initial selection reveal and clears both overlay gutters',async()=>{
 const host=await mount('panels'),received=events(host);items(host)[0].focus();await userEvent.keyboard('{End}');await frame();await frame();
 expect(viewport(host).scrollLeft).toBeGreaterThan(0);expect(host.shadowRoot!.activeElement).toBe(items(host)[7]);expect(received).toHaveLength(0);
 await userEvent.keyboard('{ArrowLeft}');const bounds=viewport(host).getBoundingClientRect(),focused=items(host)[6].getBoundingClientRect();
 expect(focused.left).toBeGreaterThanOrEqual(bounds.left+21-1);expect(focused.right).toBeLessThanOrEqual(bounds.right-21+1);
});
for(const rtl of [false,true])test(`oversized labels align their logical start without scrolling the document, rtl=${rtl}`,async()=>{
 const host=await mount('panels',rtl);host.state=navigationState({...host.state,items:host.state.items.map(item=>({...item,label:item.label.repeat(12)}))});await host.updateComplete;await frame();
 const before=window.scrollY;items(host)[3].focus();const target=items(host)[3].getBoundingClientRect(),bounds=viewport(host).getBoundingClientRect();
 expect(Math.abs(rtl?target.right-(bounds.right-21):target.left-(bounds.left+21))).toBeLessThan(1);expect(window.scrollY).toBe(before);
});
test('ancestor styles, shadow-host direction and late font geometry are observed',async()=>{
 const outer=document.createElement('div'),shadow=outer.attachShadow({mode:'open'});document.body.append(outer);const host=await mount();host.removeAttribute('dir');shadow.append(host);await host.updateComplete;
 outer.dir='rtl';await expect.poll(()=>host.shadowRoot!.querySelector('[data-scroll=end]')?.getAttribute('data-rtl')).toBe('true');
 outer.style.direction='ltr';await expect.poll(()=>host.shadowRoot!.querySelector('[data-scroll=end]')?.getAttribute('data-rtl')).toBe('false');
 outer.style.fontFamily='monospace';host.style.setProperty('--vyp-ha-font-family','monospace');await frame();expect(viewport(host).scrollWidth).toBeGreaterThan(viewport(host).clientWidth);
});
test('motion policy chooses smooth paging or immediate reduced-motion/token paging',async()=>{
 const host=await mount();await expect.element(next(host)).toBeVisible();const bar=viewport(host),scroll=vi.spyOn(bar,'scrollTo').mockImplementation(()=>{});
 const media=vi.spyOn(window,'matchMedia').mockReturnValue({matches:false} as MediaQueryList);
 await next(host).click();expect(scroll).toHaveBeenLastCalledWith({left:240,behavior:'smooth'});
 host.style.setProperty('--vyp-ha-motion-duration','0ms');await next(host).click();expect(scroll).toHaveBeenLastCalledWith({left:240,behavior:'instant'});
 host.style.removeProperty('--vyp-ha-motion-duration');media.mockReturnValue({matches:true} as MediaQueryList);await next(host).click();expect(scroll).toHaveBeenLastCalledWith({left:240,behavior:'instant'});
});
test('mouse panning uses the measured threshold, cancels native drag and only suppresses the following pointer activation',async()=>{
 const host=await mount(),received=events(host),bar=viewport(host);await frame();
 mouse(items(host)[0],'mousedown',{clientX:180});expect(mouse(items(host)[0],'dragstart').defaultPrevented).toBe(true);
 expect(mouse(window,'mousemove',{clientX:179,buttons:1}).defaultPrevented).toBe(false);expect(bar.scrollLeft).toBe(0);
 expect(mouse(window,'mousemove',{clientX:100,buttons:1}).defaultPrevented).toBe(true);expect(bar.scrollLeft).toBe(80);mouse(window,'mouseup');
 mouse(items(host)[0],'click',{detail:0});expect(received).toHaveLength(1);
 const click=mouse(items(host)[0],'click',{detail:1});expect(click.defaultPrevented).toBe(true);expect(received).toHaveLength(1);
 mouse(items(host)[0],'click',{detail:1});expect(received).toHaveLength(2);
});
test.each([{altKey:true},{ctrlKey:true},{metaKey:true},{shiftKey:true},{button:1}])('modified mouse input keeps native behavior: %j',async modifier=>{
 const host=await mount(),bar=viewport(host);await frame();mouse(items(host)[0],'mousedown',{clientX:180,...modifier});mouse(window,'mousemove',{clientX:100,buttons:1});expect(bar.scrollLeft).toBe(0);expect(mouse(items(host)[0],'dragstart').defaultPrevented).toBe(false);
});
test('cancelled input, lost buttons and window blur retire global gesture listeners',async()=>{
 const host=await mount(),bar=viewport(host);await frame();
 items(host)[0].addEventListener('mousedown',event=>event.preventDefault(),{once:true});mouse(items(host)[0],'mousedown',{clientX:180});mouse(window,'mousemove',{clientX:100,buttons:1});expect(bar.scrollLeft).toBe(0);
 mouse(bar,'mousedown',{clientX:180});mouse(window,'mousemove',{clientX:100,buttons:0});mouse(window,'mousemove',{clientX:40,buttons:1});expect(bar.scrollLeft).toBe(0);
 mouse(bar,'mousedown',{clientX:180});window.dispatchEvent(new Event('blur'));mouse(window,'mousemove',{clientX:40,buttons:1});expect(bar.scrollLeft).toBe(0);
 mouse(bar,'mousedown',{clientX:180});mouse(window,'mousemove',{clientX:100,buttons:1});mouse(window,'mouseup');
 mouse(items(host)[0],'mousedown',{clientX:100,ctrlKey:true});expect(mouse(items(host)[0],'click',{detail:1,ctrlKey:true}).defaultPrevented).toBe(false);
});
test('disconnect during a gesture and replacement of the navigation kind retire old targets',async()=>{
 const host=await mount(),received=events(host),oldBar=viewport(host);await expect.element(next(host)).toBeVisible();const oldButton=host.shadowRoot!.querySelector<HTMLButtonElement>('.scroll-button')!;
 mouse(oldBar,'mousedown',{clientX:180});host.remove();mouse(window,'mousemove',{clientX:100,buttons:1});expect(oldBar.scrollLeft).toBe(0);oldButton.click();oldButton.focus();expect(received).toHaveLength(0);
 document.body.append(host);await host.updateComplete;await expect.element(next(host)).toBeVisible();host.state=navigationState({...host.state,kind:'panels',items:host.state.items.map(item=>({...item,href:null}))});await host.updateComplete;expect(viewport(host)).not.toBe(oldBar);
 mouse(oldBar,'mousedown',{clientX:180});mouse(window,'mousemove',{clientX:100,buttons:1});expect(viewport(host).scrollLeft).toBe(0);expect(oldBar.scrollLeft).toBe(0);
});
test('retained arrow focus and blur notifications cannot revive a detached edge control',async()=>{
 const host=await mount();await expect.element(next(host)).toBeVisible();const arrow=host.shadowRoot!.querySelector<HTMLButtonElement>('.scroll-button')!;
 arrow.dispatchEvent(new FocusEvent('blur'));host.remove();arrow.dispatchEvent(new FocusEvent('focus'));document.body.append(host);host.style.width='1000px';await host.updateComplete;
 await expect.element(next(host)).not.toBeInTheDocument();
});
test('late events from a removed arrow cannot replace the current focused control',async()=>{
 const host=await mount();await expect.element(next(host)).toBeVisible();const retired=host.shadowRoot!.querySelector<HTMLButtonElement>('.scroll-button')!;
 host.style.width='1000px';await expect.element(next(host)).not.toBeInTheDocument();host.style.width='240px';await expect.element(next(host)).toBeVisible();
 const current=host.shadowRoot!.querySelector<HTMLButtonElement>('.scroll-button')!;current.focus();retired.dispatchEvent(new FocusEvent('focus'));retired.dispatchEvent(new FocusEvent('blur'));
 const scroll=vi.spyOn(viewport(host),'scrollTo');retired.click();expect(scroll).not.toHaveBeenCalled();
 viewport(host).scrollLeft=viewport(host).scrollWidth-viewport(host).clientWidth;await expect.element(next(host)).toBeDisabled();expect(host.shadowRoot!.activeElement).toBe(current);
});
