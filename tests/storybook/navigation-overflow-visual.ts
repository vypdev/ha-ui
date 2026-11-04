import {captureSettledElement} from './screenshot.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import type {HaTabs} from '@vypdev/ha-ui/tabs';
export type Box={x:number;y:number;width:number;height:number};
export type OverflowReference={platform:string;theme:string;rtl:boolean;state:string;scroll:{position:number;viewport:number;width:number};items:{label:string;box:Box}[];controls:{side:string;outer:Box;button:Box;icon:Box;focusVisible:boolean;background:string;borderRadius:string}[];image:{path:string;sha256:string;width:number;height:number}};
/** Inspect the built renderer independently of the original HA fixture and compare every measured box. */
export async function exerciseNavigationOverflowVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-navigation-overflow-reference.json'),'utf8')) as {states:OverflowReference[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform,'A measured platform is required');const rows=reference.states.filter(row=>row.platform===platform);assert.equal(rows.length,20);
 const results=[];await page.setViewportSize({width:1280,height:900});
 for(const kind of ['navigation','panels'] as const)for(const row of rows){
  const original=await readFile(resolve(row.image.path));assert.equal(createHash('sha256').update(original).digest('hex'),row.image.sha256);assert.equal(original.readUInt32BE(16),240);assert.equal(original.readUInt32BE(20),56);
  const story=kind==='navigation'?'navigation-household-sections--overflow':'tabs-local-panels--overflow';
  await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=theme:'+row.theme+';width:wide;motion:reduced');await waitForCatalogStory(page,story);
  await page.evaluate(()=>Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]));
  await page.evaluate(async({kind,row})=>{
   const holder=document.createElement('div');holder.id='overflow-proof';holder.style.cssText='position:fixed;left:32px;top:32px;width:240px;height:56px;overflow:hidden;z-index:9999';
   const host=document.createElement('vyp-ha-tabs');host.id='visual-overflow';host.dir=row.rtl?'rtl':'ltr';host.state={kind,label:'Sections',selected:'item-0',items:row.items.map((item,n)=>({id:'item-'+n,label:item.label,disabled:false,href:kind==='navigation'?'#'+n:null}))};holder.append(host);document.querySelector('main.catalog-frame')!.append(holder);
   const after=document.createElement('button');after.id='after-overflow';after.textContent='After';after.style.cssText='position:fixed;left:1000px;top:800px';holder.after(after);await host.updateComplete;
  },{kind,row});
  await page.locator('#visual-overflow').getByRole('button',{name:'Scroll to end',exact:true}).waitFor();
  await page.locator('#visual-overflow').evaluate(async(el,position)=>{const host=el as HaTabs;await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));host.shadowRoot!.querySelector<HTMLElement>('.bar')!.scrollLeft=position;},row.scroll.position);
  await page.waitForFunction(sides=>JSON.stringify([...document.querySelector('#visual-overflow')!.shadowRoot!.querySelectorAll<HTMLElement>('.scroll-control')].map(el=>el.dataset.scroll))===JSON.stringify(sides),row.controls.map(control=>control.side));
  if(row.state==='hover-next')await page.locator('#visual-overflow').getByRole('button',{name:'Scroll to end',exact:true}).hover();else await page.mouse.move(1100,800);
  if(row.state==='focus-next'){await page.locator('#after-overflow').focus();await page.keyboard.press('Shift+Tab');if(kind==='panels')await page.keyboard.press('Shift+Tab');}
  const actual=await page.locator('#visual-overflow').evaluate(host=>{
   const outer=host.getBoundingClientRect(),bar=host.shadowRoot!.querySelector<HTMLElement>('.bar')!;
   const box=(element:Element):Box=>{const r=element.getBoundingClientRect();return{x:r.x-outer.x,y:r.y-outer.y,width:r.width,height:r.height};};
   return{scroll:{position:bar.scrollLeft,viewport:bar.clientWidth,width:bar.scrollWidth},items:[...host.shadowRoot!.querySelectorAll<HTMLElement>('[part=item]')].map(el=>({label:el.textContent!,box:box(el)})),controls:[...host.shadowRoot!.querySelectorAll<HTMLElement>('.scroll-control')].map(el=>{const button=el.querySelector('button')!;return{side:el.dataset.scroll!,outer:box(el),button:box(button),icon:box(el.querySelector('svg')!),focusVisible:button.matches(':focus-visible'),background:getComputedStyle(el).backgroundImage,borderRadius:getComputedStyle(button).borderRadius};})};
  });
  assert.deepEqual(actual.scroll,row.scroll,kind+' '+row.theme+' '+row.rtl+' '+row.state+' scroll');assert.equal(actual.items.length,row.items.length);assert.equal(actual.controls.length,row.controls.length);
  const near=(actual:Box,expected:Box)=>{for(const key of ['x','y','width','height'] as const)assert.ok(Math.abs(actual[key]-expected[key])<1,`${kind} ${row.theme} ${row.rtl} ${row.state} ${key}: ${actual[key]} vs ${expected[key]}`);};
  actual.items.forEach((item,n)=>{assert.equal(item.label.trim(),row.items[n].label);near(item.box,row.items[n].box);});
  actual.controls.forEach((control,n)=>{const expected=row.controls[n];assert.equal(control.side,expected.side);assert.equal(control.background,expected.background);assert.equal(control.borderRadius,expected.borderRadius);assert.equal(control.focusVisible,expected.focusVisible);near(control.outer,expected.outer);near(control.button,expected.button);near(control.icon,expected.icon);});
  const raster=await captureSettledElement(page,'#overflow-proof',resolve(output,`ha-overflow-${kind}-${row.theme}-${row.rtl?'rtl':'ltr'}-${row.state}.png`));
  assert.equal(raster.sha256,row.image.sha256,'Original HA and candidate pixels must match for the measured platform/state');
  results.push({platform,kind,theme:row.theme,rtl:row.rtl,state:row.state,geometryMatch:true,identicalPixels:true,referenceImage:row.image,raster});
 }
 await writeFile(resolve(output,'ha-navigation-overflow-parity.json'),JSON.stringify({reference:'docs/evidence/ha-navigation-overflow-reference.json',results},null,2)+'\n');return results;
}
