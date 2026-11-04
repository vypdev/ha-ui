import {afterAll,afterEach,beforeAll,expect,test} from 'vitest';
import {userEvent} from 'vitest/browser';
import {buttonState} from '../../packages/core/src/button-contracts.js';
import {registerButton} from '../../packages/core/src/components/button.js';
type Box={x:number;y:number;width:number;height:number};
type Row={platform:string;theme:string;name:string;variant:string;state:string;size:string;icon:string|null;box:Box;style:Record<string,string>;hostOpacity:string;focusVisible:boolean;text:Box|null;icons:Box[];labelOpacity:string;spinner:{box:Box}|null};
let reference:{glyph:string;themes:Record<string,Record<string,string>>;states:Row[]};const fonts:FontFace[]=[];
beforeAll(async()=>{
 reference=await(await fetch(new URL('../../docs/evidence/ha-button-reference.json',import.meta.url))).json();
 for(const[weight,url]of [['400',new URL('../../node_modules/roboto-fontface/fonts/roboto/Roboto-Regular.woff2',import.meta.url)],['500',new URL('../../node_modules/roboto-fontface/fonts/roboto/Roboto-Medium.woff2',import.meta.url)]] as const){const font=await new FontFace('Roboto',`url("${url.href}")`,{weight}).load();document.fonts.add(font);fonts.push(font);}
});
afterAll(()=>fonts.forEach(font=>document.fonts.delete(font)));
afterEach(()=>document.body.replaceChildren());
const names=['primary','neutral','danger','success','warning','plain','outlined','filled'].flatMap(variant=>['resting','hover','focus','disabled'].map(state=>variant+'-'+state)).concat(['size-small','size-large','size-extra-large','icon-leading','icon-trailing','icon-both','icon-only','loading']);
for(const theme of ['light','dark'])test.each(names)(`source matches original HA button ${theme}/%s`,async name=>{
 const platform=/Linux/u.test(navigator.userAgent)?'linux':'macos',row=reference.states.find(row=>row.platform===platform&&row.theme===theme&&row.name===name)!;expect(row).toBeDefined();registerButton();
 const proof=document.createElement('div');proof.style.cssText='position:fixed;left:32px;top:32px;padding:8px;display:inline-flex;-webkit-font-smoothing:antialiased';for(const[key,value]of Object.entries(reference.themes[theme]))proof.style.setProperty(key,value);proof.style.background='var(--card-background-color)';proof.style.color='var(--primary-text-color)';
 const hit=document.createElement('div');hit.style.cssText='display:flex;align-items:center;justify-content:center;min-width:44px;min-height:44px';const host=document.createElement('vyp-ha-button');host.state=buttonState({label:'Save task',variant:row.variant,size:row.size,loading:row.state==='loading',iconOnly:row.icon==='only'});host.disabled=row.state==='disabled';
 const icon=(slot:string)=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('slot',slot);svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','24');svg.setAttribute('height','24');svg.setAttribute('fill','currentColor');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',reference.glyph);svg.append(path);return svg;};
 if(row.icon==='leading'||row.icon==='both'||row.icon==='only')host.append(icon('leading'));if(row.icon==='trailing'||row.icon==='both')host.append(icon('trailing'));
 hit.append(host);proof.append(hit);document.body.append(proof);await host.updateComplete;await host.updateComplete;
 const button=host.shadowRoot!.querySelector('button')!,surface=host.shadowRoot!.querySelector<HTMLElement>('[part=surface]')!,label=host.shadowRoot!.querySelector<HTMLElement>('.label')!;
 const after=document.createElement('button');after.textContent='After';after.style.cssText='position:fixed;left:400px;top:200px';document.body.append(after);
 if(row.state==='hover')await userEvent.hover(button);else await userEvent.hover(after);
 if(row.state==='focus'){after.focus();await userEvent.keyboard('{Shift>}{Tab}{/Shift}');}
 await expect.poll(()=>getComputedStyle(surface).backgroundColor).toBe(row.style.backgroundColor);
 const css=getComputedStyle(surface);for(const key of ['fontFamily','fontSize','fontWeight','lineHeight','padding','backgroundColor','color','borderTopWidth','borderTopColor','borderRadius','boxShadow'])expect(css[key as keyof CSSStyleDeclaration],key).toBe(row.style[key]);
 expect(String(Number(getComputedStyle(host).opacity)*Number(css.opacity))).toBe(row.hostOpacity);expect(getComputedStyle(label).opacity).toBe(row.labelOpacity);expect(button.matches(':focus-visible')).toBe(row.focusVisible);
 if(row.state==='focus'){expect(css.outline).toBe(row.style.outline);expect(css.outlineOffset).toBe(row.style.outlineOffset);}
 const origin=proof.getBoundingClientRect();const near=(box:DOMRect,expected:Box)=>{for(const key of ['width','height'] as const)expect(Math.abs(box[key]-expected[key]),key).toBeLessThan(1);expect(Math.abs(box.x-origin.x-expected.x),'x').toBeLessThan(1);expect(Math.abs(box.y-origin.y-expected.y),'y').toBeLessThan(.1);};
 near(surface.getBoundingClientRect(),row.box);if(row.text){const range=document.createRange();range.selectNodeContents(label);near(range.getBoundingClientRect(),row.text);}
 const icons=host.querySelectorAll('svg');expect(icons.length).toBe(row.icons.length);icons.forEach((icon,n)=>near(icon.getBoundingClientRect(),row.icons[n]));if(row.spinner)near(host.shadowRoot!.querySelector('.spinner')!.getBoundingClientRect(),row.spinner.box);
 expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
});
