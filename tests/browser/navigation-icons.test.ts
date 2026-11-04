import {render as renderLit} from 'lit';
import {renderExample as renderNavigationExample} from '../../stories/foundation.example.js';
import {afterAll,afterEach,beforeAll,expect,test} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {navigationState} from '../../packages/core/src/contracts.js';
import {registerTabs,type HaTabs} from '../../packages/core/src/components/tabs.js';
import {navigationIconPaths} from '../../stories/navigation-icons.js';

type Box={x:number;y:number;width:number;height:number};
type Reference={states:{platform:string;theme:string;presentation:string;state:string;items:{geometry:{width:number;height:number;content:Box;icon:Box|null;label:Box|null;text:Box|null};style:{fontFamily:string;fontSize:string;fontWeight:string;lineHeight:string;color:string;opacity:string};base:{opacity:string;padding:string;outline:string;outlineOffset:string};icon:{path:string;fill:string}|null}[]}[]};
let reference:Reference;const fonts:FontFace[]=[];
beforeAll(async()=>{
 reference=await(await fetch(new URL('../../docs/evidence/ha-navigation-icons-reference.json',import.meta.url))).json() as Reference;
 const font=await new FontFace('Roboto',`url("${new URL('../../node_modules/roboto-fontface/fonts/roboto/Roboto-Medium.woff2',import.meta.url).href}")`,{weight:'500'}).load();document.fonts.add(font);fonts.push(font);
});
afterAll(()=>{for(const font of fonts)document.fonts.delete(font);});
afterEach(()=>document.body.replaceChildren());
for(const kind of ['navigation','panels'] as const)for(const theme of ['light','dark'])for(const presentation of ['icon-only','icon-and-title','mixed'])test.each(['resting','hover','focus','disabled'])(`matches actual HA ${presentation} ${kind}, ${theme}, %s`,async state=>{
 const platform=/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null;expect(platform,'A measured platform is required').not.toBeNull();
 const row=reference.states.find(row=>row.platform===platform&&row.theme===theme&&row.presentation===presentation&&row.state===state);expect(row).toBeDefined();if(!row)throw new Error('Missing measured HA icon reference');
 registerTabs();const host=document.createElement('vyp-ha-tabs');host.style.cssText=`width:600px;--app-header-text-color:${theme==='light'?'#141414':'#e1e1e1'};--app-header-background-color:${theme==='light'?'#fff':'#1c1c1c'};--wa-focus-ring:solid 2px #989898;-webkit-font-smoothing:antialiased`;
 host.state=navigationState({kind,label:'Sections',selected:'overview',items:['Overview','Tasks','Inventory'].map((label,n)=>({id:['overview','tasks','inventory'][n],label,href:kind==='navigation'?'#'+n:null,disabled:n===1&&state==='disabled',iconPath:row.items[n].icon?.path??null,showLabel:row.items[n].geometry.text!==null}))});
 document.body.append(host);await host.updateComplete;const controls=[...host.shadowRoot!.querySelectorAll<HTMLElement>('a,button')];
 if(state==='hover')await userEvent.hover(controls[1]);if(state==='focus'){controls[0].focus();await userEvent.keyboard('{Home}');}
 for(const[n,control]of controls.entries()){
  const expected=row.items[n],content=control.querySelector<HTMLElement>('[part=content]')!,label=control.querySelector<HTMLElement>('[part=label]'),icon=control.querySelector<SVGSVGElement>('[part=icon]'),r=control.getBoundingClientRect();
  const box=(element:Element|null):Box|null=>{if(!element||element.hasAttribute('hidden'))return null;const b=element.getBoundingClientRect();return{x:b.x-r.x,y:b.y-r.y,width:b.width,height:b.height};};
  let text:Box|null=null;if(label&&!label.hidden){const range=document.createRange();range.selectNodeContents(label);const b=range.getBoundingClientRect();text={x:b.x-r.x,y:b.y-r.y,width:b.width,height:b.height};}
  const geometry={width:r.width,height:r.height,content:box(content),icon:box(icon),label:box(label),text};
  for(const key of ['width','height'] as const)expect(Math.abs(geometry[key]-expected.geometry[key]),key).toBeLessThan(1);
  for(const key of ['content','icon','label','text'] as const){
   if(expected.geometry[key]===null){expect(geometry[key],key).toBeNull();continue;}
   expect(geometry[key],key).not.toBeNull();for(const dimension of ['x','y','width','height'] as const)expect(Math.abs(geometry[key]![dimension]-expected.geometry[key]![dimension]),key+'.'+dimension).toBeLessThan(dimension==='y'?0.1:1);
  }
  const css=getComputedStyle(control),base=getComputedStyle(content);
  for(const key of ['fontFamily','fontSize','fontWeight','lineHeight','color','opacity'] as const)expect(css[key],key).toBe(expected.style[key]);
  expect(base.opacity).toBe(expected.base.opacity);expect(base.padding).toBe(expected.base.padding);
  if(expected.icon){expect(icon!.getAttribute('viewBox')).toBe('0 0 24 24');expect(icon!.getAttribute('aria-hidden')).toBe('true');expect(icon!.getAttribute('focusable')).toBe('false');expect(icon!.querySelector('path')!.getAttribute('d')).toBe(expected.icon.path);expect(getComputedStyle(icon!).fill).toBe(expected.icon.fill);}
  expect(control.getAttribute('aria-label')).toBe(['Overview','Tasks','Inventory'][n]);
  if(state==='focus'&&n===0){expect(control.matches(':focus-visible')).toBe(true);expect(base.outline).toBe(expected.base.outline);expect(base.outlineOffset).toBe(expected.base.outlineOffset);}
 }
 expect(host.getBoundingClientRect().height).toBe(56);
});

test.each(['navigation','panels'] as const)('icon-only %s retains names, cancellation and focused identity across live presentation updates',async kind=>{
 registerTabs();const host=document.createElement('vyp-ha-tabs');
 const input={kind,label:'Sections',selected:'overview',items:[{id:'overview',label:'Resumen',href:kind==='navigation'?'#overview':null,iconPath:navigationIconPaths.overview,showLabel:false}]};host.state=navigationState(input);document.body.append(host);await host.updateComplete;
 const control=host.shadowRoot!.querySelector<HTMLElement>('a,button')!;control.focus();const events:CustomEvent[]=[];host.addEventListener('ha-selection-request',event=>{event.preventDefault();events.push(event);});
 await page.getByRole(kind==='navigation'?'link':'tab',{name:'Resumen',exact:true}).click();expect(events).toHaveLength(1);expect(events[0].detail).toEqual({kind,id:'overview'});expect(events[0].defaultPrevented).toBe(true);
 expect(control.title).toBe('Resumen');expect(host.shadowRoot!.querySelectorAll('[tabindex="0"]')).toHaveLength(kind==='panels'?2:0);
 host.state=navigationState({...input,items:[{...input.items[0],showLabel:true,label:'Overview'}]});await host.updateComplete;
 expect(host.shadowRoot!.querySelector('a,button')).toBe(control);expect(host.shadowRoot!.activeElement).toBe(control);expect(control.title).toBe('');expect(control.querySelector<HTMLElement>('[part=label]')!.hidden).toBe(false);expect(control.getAttribute('aria-label')).toBe('Overview');expect(events).toHaveLength(1);
 host.state=navigationState({...input,items:[{...input.items[0],iconPath:null,showLabel:true}]});await host.updateComplete;expect(control.querySelector('svg')).toBeNull();expect(events).toHaveLength(1);
});
test('SVG data stays decorative, follows live theme tokens and uses logical icon/text spacing in RTL',async()=>{
 registerTabs();const host=document.createElement('vyp-ha-tabs');host.dir='rtl';host.state=navigationState({kind:'panels',label:'Sections',selected:'one',items:[{id:'one',label:'Home',iconPath:navigationIconPaths.overview}]});document.body.append(host);await host.updateComplete;
 const icon=host.shadowRoot!.querySelector<SVGSVGElement>('svg')!,label=host.shadowRoot!.querySelector<HTMLElement>('[part=label]')!;
 expect(icon.getBoundingClientRect().left-label.getBoundingClientRect().right).toBe(8);expect(icon.querySelector('a,image,use,script,foreignObject')).toBeNull();expect(icon.hasAttribute('tabindex')).toBe(false);
 host.style.cssText='--icon-primary-opactity:.6;--icon-primary-color:rgb(11,22,33);--mdc-icon-size:30px;--vyp-ha-tab-icon-gap:12px';expect(getComputedStyle(icon).fill).toBe('rgb(11, 22, 33)');expect(getComputedStyle(icon.querySelector('path')!).opacity).toBe('0.6');expect(icon.getBoundingClientRect().width).toBe(30);expect(icon.getBoundingClientRect().left-label.getBoundingClientRect().right).toBe(12);
 host.style.setProperty('--vyp-ha-tab-icon-size','20px');expect(icon.getBoundingClientRect().width).toBe(20);
});

test('catalog callers without the new presentation control retain visible text-only sections',async()=>{
 registerTabs();const target=document.createElement('div');document.body.append(target);
 renderLit(renderNavigationExample({selected:'overview',disabled:false,empty:false,longLabels:false},{globals:{locale:'en'}}),target);
 const host=target.querySelector<HaTabs>('vyp-ha-tabs')!;await host.updateComplete;
 expect(host.shadowRoot!.querySelectorAll('svg')).toHaveLength(0);expect(host.shadowRoot!.querySelectorAll('[part=label]:not([hidden])')).toHaveLength(5);
 await expect.element(page.getByRole('link',{name:'Overview',exact:true})).toBeVisible();
});
