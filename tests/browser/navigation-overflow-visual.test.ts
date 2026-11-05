import {afterAll,afterEach,beforeAll,expect,test} from 'vitest';
import {userEvent} from 'vitest/browser';
import {navigationState} from '../../packages/core/src/contracts.js';
import {registerTabs} from '../../packages/core/src/components/tabs.js';
import {catalogPalettes} from '../../stories/catalog-state.js';
type Box={x:number;y:number;width:number;height:number};
type OverflowReference={platform:string;theme:string;rtl:boolean;state:string;scroll:{position:number;viewport:number;width:number};items:{label:string;box:Box}[];controls:{side:string;outer:Box;button:Box;icon:Box;focusVisible:boolean;background:string;borderRadius:string}[];};
let rows:OverflowReference[];const fonts:FontFace[]=[];
beforeAll(async()=>{
 const reference=await(await fetch(new URL('../../docs/evidence/ha-navigation-overflow-reference.json',import.meta.url))).json() as {states:OverflowReference[]};rows=reference.states.filter(row=>row.platform===(/Linux/u.test(navigator.userAgent)?'linux':'macos'));
 for(const[weight,url]of [['400',new URL('../../node_modules/roboto-fontface/fonts/roboto/Roboto-Regular.woff2',import.meta.url)],['500',new URL('../../node_modules/roboto-fontface/fonts/roboto/Roboto-Medium.woff2',import.meta.url)]] as const){const font=await new FontFace('Roboto',`url("${url.href}")`,{weight}).load();document.fonts.add(font);fonts.push(font);}
});
afterAll(()=>fonts.forEach(font=>document.fonts.delete(font)));
afterEach(()=>document.body.replaceChildren());
for(const kind of ['navigation','panels'] as const)for(const theme of ['light','dark'] as const)for(const rtl of [false,true])test.each(['start','middle','end','hover-next','focus-next'])(`source matches original HA overflow: ${kind}/${theme}/rtl=${rtl}/%s`,async state=>{
 const row=rows.find(row=>row.theme===theme&&row.rtl===rtl&&row.state===state)!;expect(row).toBeDefined();registerTabs();
 const host=document.createElement('vyp-ha-tabs');host.dir=rtl?'rtl':'ltr';host.style.cssText='width:240px;-webkit-font-smoothing:antialiased';for(const[key,value]of Object.entries(catalogPalettes[theme]))host.style.setProperty(key,value);
 host.state=navigationState({kind,label:'Sections',selected:'item-0',items:row.items.map((item,n)=>({id:'item-'+n,label:item.label,href:kind==='navigation'?'#'+n:null}))});document.body.append(host);await host.updateComplete;
 const bar=host.shadowRoot!.querySelector<HTMLElement>('.bar')!;await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));bar.scrollLeft=row.scroll.position;
 await expect.poll(()=>[...host.shadowRoot!.querySelectorAll<HTMLElement>('.scroll-control')].map(el=>el.dataset.scroll)).toEqual(row.controls.map(control=>control.side));
 const end=host.shadowRoot!.querySelector<HTMLButtonElement>('[data-scroll=end] button');
 if(state==='hover-next')await userEvent.hover(end!);
 if(state==='focus-next'){const after=document.createElement('button');after.textContent='After';document.body.append(after);after.focus();await userEvent.keyboard(kind==='panels'?'{Shift>}{Tab}{Tab}{/Shift}':'{Shift>}{Tab}{/Shift}');expect(host.shadowRoot!.activeElement).toBe(end);}
 expect({position:bar.scrollLeft,viewport:bar.clientWidth,width:bar.scrollWidth}).toEqual(row.scroll);
 const origin=host.getBoundingClientRect(),items=[...host.shadowRoot!.querySelectorAll<HTMLElement>('[part=item]')];
 for(const[index,item]of items.entries()){const box=item.getBoundingClientRect(),expected=row.items[index].box;expect(Math.abs(box.x-origin.x-expected.x)).toBeLessThan(1);expect(Math.abs(box.width-expected.width)).toBeLessThan(1);expect(box.height).toBe(expected.height);}
 for(const[index,control]of [...host.shadowRoot!.querySelectorAll<HTMLElement>('.scroll-control')].entries()){
  const expected=row.controls[index],button=control.querySelector('button')!,icon=control.querySelector('svg')!;
  expect(control.dataset.scroll).toBe(expected.side);expect(getComputedStyle(control).backgroundImage).toBe(expected.background);expect(getComputedStyle(button).borderRadius).toBe(expected.borderRadius);expect(button.matches(':focus-visible')).toBe(expected.focusVisible);
  for(const[element,box]of [[control,expected.outer],[button,expected.button],[icon,expected.icon]] as const){const actual=element.getBoundingClientRect();expect(Math.abs(actual.x-origin.x-box.x)).toBeLessThan(1);expect(Math.abs(actual.y-origin.y-box.y)).toBeLessThan(1);expect(Math.abs(actual.width-box.width)).toBeLessThan(1);expect(Math.abs(actual.height-box.height)).toBeLessThan(1);}
 }
});
