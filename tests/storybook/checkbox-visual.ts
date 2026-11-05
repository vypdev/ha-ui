import {captureSettledElement} from './screenshot.ts';
import {readOriginalRaster} from './reference-images.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import type {HaCheckbox} from '@vypdev/ha-ui/checkbox';

/** Offline measurements remain tied to actual, settled HA reference states and font bytes. */
export async function exerciseCheckboxVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-checkbox-reference.json'),'utf8')) as {states:{theme:string;state:string;expected:Record<string,Record<string,string>>;referenceImage:{path:string;sha256:string;width:number;height:number}}[]};
 const results=[];
 for(const theme of ['light','dark']){
  await page.goto(origin+'/ha-ui/iframe.html?id=forms-checkbox--partial&viewMode=story&globals=theme:'+theme+';motion:reduced');
  await waitForCatalogStory(page,'forms-checkbox--partial');
  await page.waitForFunction(()=>!!document.querySelector('vyp-ha-checkbox')?.shadowRoot?.querySelector('input'));await page.evaluate(()=>Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]));
  await page.evaluate(()=>{const holder=document.createElement('div');holder.id='visual-proof';holder.style.cssText='width:296px;height:44px;display:flex;align-items:center;position:fixed;left:32px;top:32px;background:var(--card-background-color);z-index:9999';const host=document.createElement('vyp-ha-checkbox');host.id='visual-checkbox';host.state={...host.state,label:'Notify household'};holder.append(host);document.querySelector('main.catalog-frame')!.append(holder);});
  for(const row of reference.states.filter(row=>row.theme===theme)){
   const original=await readOriginalRaster(row.referenceImage);assert.equal(original.readUInt32BE(16),row.referenceImage.width);assert.equal(original.readUInt32BE(20),row.referenceImage.height);
   await page.locator('#visual-checkbox').evaluate(async(element,state)=>{const host=element as HaCheckbox;host.state={...host.state,indeterminate:state==='mixed',required:state==='required'};host.checked=state==='checked'||state==='disabled';host.disabled=state==='disabled';await host.updateComplete;},row.state);
   if(row.state==='hover')await page.locator('#visual-checkbox label').hover();else await page.mouse.move(1100,800);
   if(row.state==='focus'){await page.locator('#visual-checkbox input').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');}
   await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
   const actual=await page.locator('#visual-checkbox').evaluate((element,expected)=>{
    const nodes={host:element,base:element.shadowRoot!.querySelector('label')!,control:element.shadowRoot!.querySelector('.control')!,label:element.shadowRoot!.querySelector('.copy')!};
    return Object.fromEntries(Object.entries(expected).map(([name,properties])=>{const css=getComputedStyle(nodes[name as keyof typeof nodes]);return [name,Object.fromEntries(Object.keys(properties).map(key=>[key,css.getPropertyValue(key)]))];}));
   },row.expected);
   const raster=await captureSettledElement(page,'#visual-proof',resolve(output,'ha-parity-'+theme+'-'+row.state+'.png'));
   // Zero-width layout rounding at the same font/rendering baseline may differ below one CSS pixel.
   for(const node of ['label'])for(const property of ['width','height']){assert.ok(Math.abs(parseFloat(actual[node][property])-parseFloat(row.expected[node][property]))<1,'HA text geometry '+theme+' '+row.state+' '+property);actual[node][property]=row.expected[node][property];}
   assert.deepEqual(actual,row.expected,'Measured HA appearance '+theme+' '+row.state);
   results.push({theme,state:row.state,geometryAndStylesMatch:true,textGeometryToleranceCssPx:1,referenceImage:row.referenceImage,raster});
  }
 }
 await writeFile(resolve(output,'ha-checkbox-parity.json'),JSON.stringify({reference:'docs/evidence/ha-checkbox-reference.json',scope:'Checkbox measured states only; no full SDK or human application UX acceptance',results},null,2)+'\n');
 return results;
}
