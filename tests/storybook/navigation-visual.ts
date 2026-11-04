import {captureSettledElement} from './screenshot.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import type {HaTabs} from '@vypdev/ha-ui/tabs';

type Appearance={fontFamily:string;fontSize:string;fontWeight:string;lineHeight:string;color:string;opacity:string;};
type ReferenceState={platform:string;theme:string;state:string;items:Item[];image:{path:string;sha256:string;width:number;height:number}};
type Item={geometry:Record<'width'|'height'|'textX'|'textY'|'textWidth'|'textHeight',number>;style:Appearance;base:{opacity:string;outline:string;outlineOffset:string;}};
/** Offline built-package gate against unedited, independently captured HA component references. */
export async function exerciseNavigationVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-navigation-reference.json'),'utf8')) as {states:ReferenceState[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform,'A measured browser platform is required');
 const results=[];await page.setViewportSize({width:1280,height:900});
 for(const kind of ['navigation','panels'] as const)for(const theme of ['light','dark']){
  const story=kind==='navigation'?'navigation-household-sections--default':'tabs-local-panels--default';
  await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=theme:'+theme+';width:wide;motion:reduced');await waitForCatalogStory(page,story);
  await page.evaluate(()=>Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]));
  await page.evaluate(()=>{const holder=document.createElement('div');holder.id='navigation-proof';holder.style.cssText='position:fixed;left:32px;top:32px;width:600px;height:56px;overflow:hidden;z-index:9999';const host=document.createElement('vyp-ha-tabs');host.id='visual-navigation';holder.append(host);document.querySelector('main.catalog-frame')!.append(holder);});
  const states:ReferenceState[]=reference.states.filter(row=>row.platform===platform&&row.theme===theme);assert.equal(states.length,4,'All measured platform states are required');
  for(const row of states){
   const bytes=await readFile(resolve(row.image.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),row.image.sha256);assert.equal(bytes.readUInt32BE(16),row.image.width);assert.equal(bytes.readUInt32BE(20),row.image.height);
   await page.locator('#visual-navigation').evaluate(async(el,{kind,state})=>{const host=el as HaTabs;host.state={kind,label:'Household sections',selected:'overview',items:['Overview','Tasks','Inventory'].map((label,n)=>({id:['overview','tasks','inventory'][n],label,href:kind==='navigation'?'#section-'+n:null,disabled:n===1&&state==='disabled'}))};await host.updateComplete;host.shadowRoot!.querySelector<HTMLElement>('a,button')!.blur();},{kind,state:row.state});
   if(row.state==='hover')await page.locator('#visual-navigation a,#visual-navigation button').nth(1).hover();else await page.mouse.move(1100,800);
   if(row.state==='focus'){await page.locator('#visual-navigation a,#visual-navigation button').first().focus();await page.keyboard.press('Home');}
   const actual=await page.locator('#visual-navigation').evaluate(el=>[...el.shadowRoot!.querySelectorAll<HTMLElement>('a,button')].map(control=>{const css=getComputedStyle(control),content=control.querySelector<HTMLElement>('[part=content]')!,base=getComputedStyle(content),box=control.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(content.querySelector('[part=label]')??content);const text=range.getBoundingClientRect();return{geometry:{width:box.width,height:box.height,textX:text.x-box.x,textY:text.y-box.y,textWidth:text.width,textHeight:text.height},style:Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','color','opacity','borderBottomWidth','borderBottomColor'].map(key=>[key,css[key as keyof CSSStyleDeclaration]])),base:{opacity:base.opacity,outline:base.outline,outlineOffset:base.outlineOffset},focusVisible:control.matches(':focus-visible')};}));
   assert.equal(actual.length,row.items.length);
   for(const[index,item]of actual.entries()){
    const expected=row.items[index];assert.deepEqual(item.style,expected.style,kind+' '+theme+' '+row.state+' typography/state');assert.equal(item.base.opacity,expected.base.opacity);
    for(const[key,value]of Object.entries(item.geometry))assert.ok(Math.abs(value-expected.geometry[key as keyof typeof expected.geometry])<(key==='textY'?0.1:1),kind+' '+theme+' '+row.state+' '+key);
    if(row.state==='focus'&&index===0){assert.equal(item.focusVisible,true);assert.equal(item.base.outline,expected.base.outline);assert.equal(item.base.outlineOffset,expected.base.outlineOffset);}
   }
   const raster=await captureSettledElement(page,'#navigation-proof',resolve(output,'ha-navigation-'+kind+'-'+theme+'-'+row.state+'.png'));
   results.push({platform,kind,theme,state:row.state,typographyStateAndGeometryMatch:true,layoutToleranceCssPx:1,textVerticalToleranceCssPx:0.1,actual,referenceImage:row.image,raster});
  }
 }
 await writeFile(resolve(output,'ha-navigation-parity.json'),JSON.stringify({reference:'docs/evidence/ha-navigation-reference.json',scope:'Measured text-only controls; icons, overflow affordances and installed-application/human acceptance remain required',results},null,2)+'\n');return results;
}
