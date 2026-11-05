import {captureSettledElement} from './screenshot.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import type {HaButton} from '@vypdev/ha-ui/button';
import assert from 'node:assert/strict';
import {readOriginalRaster} from './reference-images.ts';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
type Box={x:number;y:number;width:number;height:number};
type Row={platform:string;theme:string;name:string;variant:string;state:string;size:string;icon:string|null;box:Box;style:Record<string,string>;hostOpacity:string;focusVisible:boolean;text:Box|null;icons:Box[];labelOpacity:string;spinner:{box:Box}|null;image:{path:string;sha256:string}};
/** Compiled core versus unchanged original HA modules; native hit area and painted surface are measured independently. */
export async function exerciseButtonVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-button-reference.json'),'utf8')) as {glyph:string;themes:Record<string,Record<string,string>>;states:Row[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform,'A measured platform is required');const rows=reference.states.filter(row=>row.platform===platform);assert.equal(rows.length,96);
 const results=[];await page.setViewportSize({width:1280,height:900});
 await page.goto(origin+'/ha-ui/iframe.html?id=buttons-actions--variants&viewMode=story');await waitForCatalogStory(page,'buttons-actions--variants');
 await page.evaluate(async()=>{const host=document.createElement('vyp-ha-button');host.id='motion-proof';document.body.append(host);await host.updateComplete;});
 const duration=()=>page.locator('#motion-proof').evaluate(host=>parseFloat(getComputedStyle(host.shadowRoot!.querySelector('.surface')!).transitionDuration));
 await page.emulateMedia({reducedMotion:'no-preference'});const regularDuration=await duration();assert.equal(regularDuration,.15,'Standalone ordinary motion');
 await page.emulateMedia({reducedMotion:'reduce'});const reducedDuration=await duration();assert.ok(reducedDuration<=.001&&reducedDuration<regularDuration,'OS reduced motion applies without a host theme');

 for(const theme of ['light','dark']){
  for(const row of rows.filter(row=>row.theme===theme)){
  const story='buttons-actions--variants';await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=theme:'+theme+';motion:reduced');await waitForCatalogStory(page,story);
  await page.evaluate(()=>Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]));
   const original=await readOriginalRaster(row.image);
   const state=buttonState({label:'Save task',variant:row.variant,size:row.size,loading:row.state==='loading',iconOnly:row.icon==='only'});
   await page.evaluate(async({row,state,tokens,glyph})=>{
    document.querySelector('#button-proof')?.remove();document.querySelector('#after-button')?.remove();
    const proof=document.createElement('div');proof.id='button-proof';proof.style.cssText='position:fixed;left:32px;top:32px;padding:8px;display:inline-flex;z-index:9999;-webkit-font-smoothing:antialiased';for(const[key,value]of Object.entries(tokens))proof.style.setProperty(key,value);proof.style.background='var(--card-background-color)';proof.style.color='var(--primary-text-color)';
    const hit=document.createElement('div');hit.style.cssText='display:flex;align-items:center;justify-content:center;min-width:44px;min-height:44px';const host=document.createElement('vyp-ha-button');host.id='visual-button';host.state=state;host.disabled=row.state==='disabled';
    const icon=(slot:string)=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');for(const[k,v]of Object.entries({slot,viewBox:'0 0 24 24',width:'24',height:'24',fill:'currentColor','aria-hidden':'true'}))svg.setAttribute(k,v);const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',glyph);svg.append(path);return svg;};
    if(row.icon==='leading'||row.icon==='both'||row.icon==='only')host.append(icon('leading'));if(row.icon==='trailing'||row.icon==='both')host.append(icon('trailing'));
    hit.append(host);proof.append(hit);document.body.append(proof);const after=document.createElement('button');after.id='after-button';after.textContent='After';after.style.cssText='position:fixed;left:1000px;top:800px';document.body.append(after);await host.updateComplete;await host.updateComplete;
   },{row,state,tokens:reference.themes[theme],glyph:reference.glyph});
   const button=page.locator('#visual-button').getByRole('button',{name:'Save task',exact:true});
   if(row.state==='hover')await button.hover();else await page.mouse.move(1100,800);
   if(row.state==='focus'){await page.locator('#after-button').focus();await page.keyboard.press('Shift+Tab');}
   if(row.state==='active'){await button.hover();await page.mouse.down();}
   await page.waitForFunction(color=>getComputedStyle(document.querySelector('#visual-button')!.shadowRoot!.querySelector('[part=surface]')!).backgroundColor===color,row.style.backgroundColor);
   const actual=await page.locator('#visual-button').evaluate(element=>{
    const host=element as HaButton,button=host.shadowRoot!.querySelector('button')!,surface=host.shadowRoot!.querySelector<HTMLElement>('[part=surface]')!,label=host.shadowRoot!.querySelector<HTMLElement>('.label')!,css=getComputedStyle(surface),origin=document.querySelector('#button-proof')!.getBoundingClientRect();
    const box=(el:Element):Box=>{const r=el.getBoundingClientRect();return{x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height};};let text:Box|null=null;
    if(!host.state.iconOnly){const range=document.createRange();range.selectNodeContents(label);const r=range.getBoundingClientRect();text={x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height};}
    const spinner=host.shadowRoot!.querySelector('.spinner');return{box:box(surface),style:Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','padding','backgroundColor','color','borderTopWidth','borderTopColor','borderRadius','boxShadow','outline','outlineOffset'].map(key=>[key,css[key as keyof CSSStyleDeclaration]])),opacity:Number(getComputedStyle(host).opacity)*Number(css.opacity),focusVisible:button.matches(':focus-visible'),text,icons:[...host.querySelectorAll('svg')].map(box),labelOpacity:getComputedStyle(label).opacity,spinner:spinner?box(spinner):null,hitArea:box(button),reducedMotion:matchMedia('(prefers-reduced-motion:reduce)').matches,transitionDuration:css.transitionDuration};
   });
   for(const key of ['fontFamily','fontSize','fontWeight','lineHeight','padding','backgroundColor','color','borderTopWidth','borderTopColor','borderRadius','boxShadow'])assert.equal(actual.style[key],row.style[key],`${theme}/${row.name}/${key}`);
   assert.equal(String(actual.opacity),row.hostOpacity);assert.equal(actual.labelOpacity,row.labelOpacity);assert.equal(actual.focusVisible,row.focusVisible);
   if(row.state==='focus'){assert.equal(actual.style.outline,row.style.outline);assert.equal(actual.style.outlineOffset,row.style.outlineOffset);}
   const near=(a:Box,b:Box)=>{for(const key of ['x','y','width','height'] as const)assert.ok(Math.abs(a[key]-b[key])<(key==='y'?.1:1),`${theme}/${row.name}/${key}: ${a[key]} vs ${b[key]}`);};
   near(actual.box,row.box);if(row.text){assert.ok(actual.text);near(actual.text,row.text);}assert.equal(actual.icons.length,row.icons.length);actual.icons.forEach((icon,n)=>near(icon,row.icons[n]));if(row.spinner){assert.ok(actual.spinner);near(actual.spinner,row.spinner.box);}
   assert.ok(actual.hitArea.width>=44&&actual.hitArea.height>=44,'Native target must remain at least 44px');
   if(actual.reducedMotion)assert.ok(parseFloat(actual.transitionDuration)<=.001,'OS reduced motion bounds transitions to one imperceptible millisecond');
   const raster=await captureSettledElement(page,'#button-proof',resolve(output,'ha-button-'+theme+'-'+row.name+'.png'));
   if(row.state==='active')await page.mouse.up();
   assert.equal(raster.sha256,row.image.sha256,`${theme}/${row.name} original HA pixels`);
   results.push({platform,theme,name:row.name,geometryMatch:true,identicalPixels:true,hitArea:actual.hitArea,referenceImage:row.image,raster});
  }
 }
 await writeFile(resolve(output,'ha-button-parity.json'),JSON.stringify({reference:'docs/evidence/ha-button-reference.json',scope:'Exact original token calibration. The visible catalog has explicit accessible accent overrides; those differences are documented separately. Full-library/application acceptance is not implied.',results},null,2)+'\n');return results;
}
