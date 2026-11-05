import {captureSettledElement} from './screenshot.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import {readOriginalRaster} from './reference-images.ts';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import type {HaTabs} from '@vypdev/ha-ui/tabs';
type Box={x:number;y:number;width:number;height:number};
type Item={geometry:{width:number;height:number;content:Box;icon:Box|null;label:Box|null;text:Box|null};style:Record<string,string>;base:{opacity:string;padding:string;outline:string;outlineOffset:string};icon:{path:string;fill:string}|null};
type Row={platform:string;theme:string;presentation:string;state:string;items:Item[];image:{path:string;sha256:string;width:number;height:number}};
/** Actual compiled renderer versus original HA components, without regenerating expected images. */
export async function exerciseNavigationIconsVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-navigation-icons-reference.json'),'utf8')) as {states:Row[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform,'A measured platform is required');
 const results=[];await page.setViewportSize({width:1280,height:900});
 for(const kind of ['navigation','panels'] as const)for(const theme of ['light','dark']){
  const story=kind==='navigation'?'navigation-household-sections--mixed':'tabs-local-panels--mixed';
  await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=theme:'+theme+';width:wide;motion:reduced');await waitForCatalogStory(page,story);
  await page.evaluate(()=>Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]));
  await page.evaluate(()=>{const holder=document.createElement('div');holder.id='icon-proof';holder.style.cssText='position:fixed;left:32px;top:32px;width:600px;height:56px;overflow:hidden;z-index:9999';const host=document.createElement('vyp-ha-tabs');host.id='visual-icons';holder.append(host);document.querySelector('main.catalog-frame')!.append(holder);});
  const rows:Row[]=reference.states.filter(row=>row.platform===platform&&row.theme===theme);assert.equal(rows.length,12,'All three presentations and four states are required');
  for(const row of rows){
   const original=await readOriginalRaster(row.image);assert.equal(original.readUInt32BE(16),row.image.width);assert.equal(original.readUInt32BE(20),row.image.height);
   await page.locator('#visual-icons').evaluate(async(element,{kind,row})=>{
    const host=element as HaTabs;host.state={kind,label:'Icon sections',selected:'overview',items:['Overview','Tasks','Inventory'].map((label,n)=>({id:['overview','tasks','inventory'][n],label,href:kind==='navigation'?'#'+n:null,disabled:n===1&&row.state==='disabled',iconPath:row.items[n].icon?.path??null,showLabel:row.items[n].geometry.text!==null}))};await host.updateComplete;host.shadowRoot!.querySelector<HTMLElement>('[part=item]')!.blur();
   },{kind,row});
   if(row.state==='hover')await page.locator('#visual-icons a,#visual-icons button').nth(1).hover();else await page.mouse.move(1100,800);
   if(row.state==='focus'){await page.locator('#visual-icons a,#visual-icons button').first().focus();await page.keyboard.press('Home');}
   const actual=await page.locator('#visual-icons').evaluate(element=>[...element.shadowRoot!.querySelectorAll<HTMLElement>('[part=item]')].map(control=>{
    const r=control.getBoundingClientRect(),content=control.querySelector<HTMLElement>('[part=content]')!,label=control.querySelector<HTMLElement>('[part=label]')!,icon=control.querySelector<SVGSVGElement>('svg'),css=getComputedStyle(control),b=getComputedStyle(content);
    const box=(element:Element|null):Box|null=>{if(!element||element.hasAttribute('hidden'))return null;const n=element.getBoundingClientRect();return{x:n.x-r.x,y:n.y-r.y,width:n.width,height:n.height};};
    let text:Box|null=null;if(!label.hidden){const range=document.createRange();range.selectNodeContents(label);const n=range.getBoundingClientRect();text={x:n.x-r.x,y:n.y-r.y,width:n.width,height:n.height};}
    return{geometry:{width:r.width,height:r.height,content:box(content),icon:box(icon),label:box(label),text},style:Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','color','opacity','borderBottomWidth','borderBottomColor'].map(key=>[key,css[key as keyof CSSStyleDeclaration]])),base:{opacity:b.opacity,padding:b.padding,outline:b.outline,outlineOffset:b.outlineOffset},icon:icon?{path:icon.querySelector('path')!.getAttribute('d'),fill:getComputedStyle(icon).fill}:null,accessibleName:control.getAttribute('aria-label'),focusVisible:control.matches(':focus-visible')};
   }));
   assert.equal(actual.length,row.items.length);
   for(const[n,item]of actual.entries()){
    const expected=row.items[n];assert.deepEqual(item.style,expected.style);assert.equal(item.base.opacity,expected.base.opacity);assert.equal(item.base.padding,expected.base.padding);assert.deepEqual(item.icon,expected.icon===null?null:{path:expected.icon.path,fill:expected.icon.fill});assert.equal(item.accessibleName,['Overview','Tasks','Inventory'][n]);
    for(const key of ['width','height'] as const)assert.ok(Math.abs(item.geometry[key]-expected.geometry[key])<1,key);
    for(const key of ['content','icon','label','text'] as const){
     if(expected.geometry[key]===null){assert.equal(item.geometry[key],null);continue;}
     assert.ok(item.geometry[key]);for(const dimension of ['x','y','width','height'] as const)assert.ok(Math.abs(item.geometry[key][dimension]-expected.geometry[key]![dimension])<(dimension==='y'?0.1:1),kind+' '+theme+' '+row.presentation+' '+row.state+' '+key+'.'+dimension);
    }
    if(row.state==='focus'&&n===0){assert.equal(item.focusVisible,true);assert.equal(item.base.outline,expected.base.outline);assert.equal(item.base.outlineOffset,expected.base.outlineOffset);}
   }
   const raster=await captureSettledElement(page,'#icon-proof',resolve(output,'ha-icons-'+kind+'-'+theme+'-'+row.presentation+'-'+row.state+'.png'));
   results.push({platform,kind,theme,presentation:row.presentation,state:row.state,geometryAndStateMatch:true,layoutToleranceCssPx:1,verticalToleranceCssPx:0.1,actual,referenceImage:row.image,raster});
  }
 }
 await writeFile(resolve(output,'ha-navigation-icons-parity.json'),JSON.stringify({reference:'docs/evidence/ha-navigation-icons-reference.json',scope:'Three icon/text presentations; overflow, other visual families and installed app/human acceptance remain pending.',results},null,2)+'\n');return results;
}
