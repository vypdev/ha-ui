import {afterAll,afterEach,beforeAll,expect,test} from 'vitest';
import {userEvent} from 'vitest/browser';
import {registerTabs} from '../../packages/core/src/components/tabs.js';
import {navigationState} from '../../packages/core/src/contracts.js';

type Appearance={fontFamily:string;fontSize:string;fontWeight:string;lineHeight:string;color:string;opacity:string;};
type Reference={states:{platform:string;theme:string;state:string;items:{geometry:{width:number;height:number;textX:number;textY:number;textWidth:number;textHeight:number};style:Appearance;base:{opacity:string;outline:string;outlineOffset:string;}}[]}[]};
let reference:Reference;
const fonts:FontFace[]=[];
beforeAll(async()=>{
 reference=await(await fetch(new URL('../../docs/evidence/ha-navigation-reference.json',import.meta.url))).json() as Reference;
 const font=await new FontFace('Roboto',`url("${new URL('../../node_modules/roboto-fontface/fonts/roboto/Roboto-Medium.woff2',import.meta.url).href}")`,{weight:'500'}).load();document.fonts.add(font);fonts.push(font);
});
afterAll(()=>{for(const font of fonts)document.fonts.delete(font);});
afterEach(()=>document.body.replaceChildren());
for(const kind of ['navigation','panels'] as const)for(const theme of ['light','dark'])test.each(['resting','hover','focus','disabled'])(`matches measured HA text-only dashboard ${kind}, ${theme}, %s`,async state=>{
 const platform=/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null;expect(platform,'A measured browser platform is required').not.toBeNull();
 const row=reference.states.find(row=>row.platform===platform&&row.theme===theme&&row.state===state);expect(row,'Missing measured HA platform/state').toBeDefined();if(!row)throw new Error('Missing measured HA reference');
 registerTabs();const element=document.createElement('vyp-ha-tabs');
 element.style.cssText=`width:600px;--app-header-text-color:${theme==='light'?'#141414':'#e1e1e1'};--app-header-background-color:${theme==='light'?'#fff':'#1c1c1c'};--wa-focus-ring:solid 2px #989898;-webkit-font-smoothing:antialiased`;
 element.state=navigationState({kind,label:'Household sections',selected:'overview',items:['Overview','Tasks','Inventory'].map((label,n)=>({id:['overview','tasks','inventory'][n],label,...(kind==='navigation'?{href:'#section-'+n}:{}),disabled:n===1&&state==='disabled'}))});
 document.body.append(element);await element.updateComplete;
 const controls=[...element.shadowRoot!.querySelectorAll<HTMLElement>('[part=item]')];
 if(state==='hover')await userEvent.hover(controls[1]);
 if(state==='focus'){controls[0].focus();await userEvent.keyboard('{Home}');}
 for(const[index,control]of controls.entries()){
  const expected=row.items[index],css=getComputedStyle(control),content=control.querySelector<HTMLElement>('[part=content]')??control,base=getComputedStyle(content);
  for(const key of ['fontFamily','fontSize','fontWeight','lineHeight','color','opacity'] as const)expect(css[key],key).toBe(expected.style[key]);
  expect(base.opacity).toBe(expected.base.opacity);
  const box=control.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(content.querySelector('[part=label]')??content);const text=range.getBoundingClientRect();
  const actual={width:box.width,height:box.height,textX:text.x-box.x,textY:text.y-box.y,textWidth:text.width,textHeight:text.height};
  for(const[key,value]of Object.entries(actual))expect(Math.abs(value-expected.geometry[key as keyof typeof actual]),key).toBeLessThan(key==='textY'?0.1:1);
  if(state==='focus'&&index===0){expect(control.matches(':focus-visible')).toBe(true);expect(base.outline).toBe(expected.base.outline);expect(base.outlineOffset).toBe(expected.base.outlineOffset);}
 }
 expect(element.getBoundingClientRect().height).toBe(56);
 expect(getComputedStyle(element.shadowRoot!.querySelector('.frame')!).backgroundColor).toBe(theme==='light'?'rgb(255, 255, 255)':'rgb(28, 28, 28)');
 if(state==='disabled'){expect(controls[1].tabIndex).toBe(-1);expect(controls[1].matches(':disabled,[aria-disabled=true]')).toBe(true);}
});

test('public HA header tokens and explicit library overrides update the same live controls',async()=>{
 registerTabs();const host=document.createElement('vyp-ha-tabs');host.state=navigationState({kind:'panels',label:'Sections',selected:'one',items:[{id:'one',label:'One'},{id:'two',label:'Two'}]});document.body.append(host);await host.updateComplete;
 const [current,other]=host.shadowRoot!.querySelectorAll<HTMLElement>('[part=item]'),bar=host.shadowRoot!.querySelector<HTMLElement>('.bar')!,surface=host.shadowRoot!.querySelector<HTMLElement>('.frame')!;
 host.style.cssText='--app-header-text-color:rgb(40,50,60);--app-header-background-color:rgb(230,240,250);--app-header-selection-bar-color:rgb(100,20,30);--ha-tab-indicator-color:rgb(20,100,30)';
 expect(getComputedStyle(bar).backgroundColor).toBe('rgba(0, 0, 0, 0)');expect(getComputedStyle(current).color).toBe('rgb(40, 50, 60)');expect(getComputedStyle(other).color).toBe('rgb(40, 50, 60)');expect(getComputedStyle(surface).backgroundColor).toBe('rgb(230, 240, 250)');expect(getComputedStyle(current).borderBottomColor).toBe('rgb(100, 20, 30)');
 host.style.cssText+=';--vyp-ha-text:rgb(20,30,40);--vyp-ha-text-secondary:rgb(50,60,70);--vyp-ha-surface:rgb(240,245,250);--vyp-ha-tab-indicator-color:rgb(80,90,100);--vyp-ha-focus-ring:solid 3px rgb(40,50,60);--vyp-ha-tab-padding:24px';
 expect(getComputedStyle(current).color).toBe('rgb(20, 30, 40)');expect(getComputedStyle(other).color).toBe('rgb(50, 60, 70)');expect(getComputedStyle(surface).backgroundColor).toBe('rgb(240, 245, 250)');expect(getComputedStyle(current).borderBottomColor).toBe('rgb(80, 90, 100)');
 current.focus();await userEvent.keyboard('{Home}');const content=getComputedStyle(current.querySelector('[part=content]')!);expect(content.outline).toBe('rgb(40, 50, 60) solid 3px');expect(content.paddingInlineStart).toBe('24px');expect(content.paddingInlineEnd).toBe('24px');expect(current.getBoundingClientRect().height).toBe(56);
});
