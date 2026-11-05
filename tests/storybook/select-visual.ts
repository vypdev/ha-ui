import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {readOriginalRaster} from './reference-images.ts';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import type {Page} from 'playwright';
import type {AxeResults} from 'axe-core';
import {selectState} from '@vypdev/ha-ui/select-contracts';
import type {HaSelect} from '@vypdev/ha-ui/select';
import {captureSettledElement} from './screenshot.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import {rasterAgreement,selectorRasterTolerance} from '../../tooling/raster.mjs';
type Box={x:number;y:number;width:number;height:number};
type Piece={box:Box;style:Record<string,string>;after:Record<string,string>;glyph:Box|null};
type Configuration={name:string;multiple:boolean;label:string;value:string|null;options:{value:string;label:string;disabled?:boolean}[];width:number;dir:string;disabled:boolean;required:boolean;helper:string;error:string;placeholder:string;clearable:boolean;opened:boolean;opener:'keyboard'|'pointer';interaction:string};
type Row={platform:string;architecture:string;theme:string;name:string;configuration:Configuration;frame:Box;parts:{base:Piece;trigger:Piece;overline:Piece|null;headline:Piece;arrow:Piece;helper:Piece|null;menu:Piece|null;options:Piece[]};image:{path:string;sha256:string}};
/** Original component paint is independent of the authored combobox/listbox semantic projection. */
export async function exerciseSelectVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-select-reference.json'),'utf8')) as {themes:Record<string,Record<string,string>>;states:Row[];referenceRepeatsComplete:boolean};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform);const architecture=process.arch,browser=page.context().browser()!.version();
 const rows=reference.states.filter(row=>row.platform===platform&&row.architecture===architecture);assert.equal(rows.length,38,'A complete original HA reference is required for '+platform+'/'+architecture);
 assert.equal(reference.referenceRepeatsComplete,true);
 const results=[],problems:string[]=[],palettes=[];await page.setViewportSize({width:1280,height:900});const require=createRequire(import.meta.url);
 await page.goto(origin+'/ha-ui/iframe.html?id=forms-select--default&viewMode=story');await waitForCatalogStory(page,'forms-select--default');
 await page.evaluate(async state=>{const host=document.createElement('vyp-ha-select');host.id='motion-select';host.state=state;document.body.append(host);await host.updateComplete;},selectState({label:'Motion proof',options:[]}));
 const duration=()=>page.locator('#motion-select').evaluate(host=>parseFloat(getComputedStyle(host.shadowRoot!.querySelector('.picker')!,'::before').transitionDuration));
 await page.emulateMedia({reducedMotion:'no-preference'});const ordinary=await duration();assert.equal(ordinary,.015);
 await page.emulateMedia({reducedMotion:'reduce'});const reduced=await duration();assert.ok(reduced<=.001);
 await page.locator('#motion-select').evaluate(host=>(host as HTMLElement).style.setProperty('--vyp-ha-motion-duration','0ms'));assert.equal(await duration(),0);
 const motion={ordinary,reduced,explicitZeroPreserved:true};
 for(const theme of ['light','dark'])for(const mode of ['pointer','keyboard','error','empty']){
  const story=mode==='error'?'forms-select--error':mode==='empty'?'forms-select--empty':'forms-select--default';
  await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=theme:'+theme+';motion:reduced');const automatic=await waitForCatalogStory(page,story);
  const trigger=page.getByRole('combobox',{name:'Category',exact:true});
  if(mode==='keyboard'){await trigger.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('End');}else await trigger.click();
  await page.getByRole('listbox',{name:'Category',exact:true}).waitFor();await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>{const axe=(window as unknown as {axe:{reset:()=>void;run:(root:Element)=>Promise<AxeResults>}}).axe;axe.reset();return(await axe.run(document.querySelector('main')!)).violations.map(result=>({id:result.id,impact:result.impact,nodes:result.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}));});
  palettes.push({theme,mode,automatic,violations});problems.push(...violations.map(result=>`${theme}/${mode}/axe/${result.id}`));
 }
 await writeFile(resolve(output,'ha-select-accessibility.json'),JSON.stringify({scope:'Default-rule independent axe scans of actual catalog palettes with open pointer/keyboard/error/empty menus. Original HA token parity is separate.',palettes},null,2)+'\n');
 for(const row of rows){
  const config=row.configuration,story='forms-select--disabled';await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story');await waitForCatalogStory(page,story);
  const original=await readOriginalRaster(row.image);
  const state=selectState({label:config.label,options:config.options,placeholder:config.placeholder,description:config.helper,error:config.error,required:config.required,clearable:config.clearable});
  await page.evaluate(async({state,config,tokens,frame})=>{
   document.querySelector<HTMLElement>('main.catalog-frame')!.hidden=true;
   for(const[key,value]of Object.entries(tokens))document.body.style.setProperty(key,value);document.body.style.background='var(--card-background-color)';
   const proof=document.createElement('div');proof.id='select-proof';proof.style.cssText='position:fixed;left:32px;top:32px;padding:16px;display:inline-flex;align-items:flex-start;box-sizing:border-box;background:var(--card-background-color);color:var(--primary-text-color);font:400 14px/1.6 Roboto,Noto,sans-serif;-webkit-font-smoothing:antialiased';
   const host=document.createElement('vyp-ha-select');host.id='visual-select';host.state=state;host.value=config.value;host.style.width=config.width+'px';host.dir=config.dir;host.disabled=config.disabled;proof.append(host);document.body.append(proof);await host.updateComplete;
   const after=document.createElement('button');after.id='after-select';after.textContent='After';after.style.cssText='position:fixed;left:1000px;top:800px';document.body.append(after);
   const capture=document.createElement('div');capture.id='select-capture';capture.style.cssText=`position:fixed;pointer-events:none;left:${frame.x}px;top:${frame.y}px;width:${frame.width}px;height:${frame.height}px`;document.body.append(capture);
   await document.fonts.load('400 14px Roboto');await document.fonts.load('500 14px Roboto');await document.fonts.ready;
  },{state,config,tokens:reference.themes[row.theme],frame:row.frame});
  const host=page.locator('#visual-select'),trigger=host.getByRole('combobox',{name:config.label,exact:true});await page.mouse.move(1100,850);
  if(config.interaction==='hover')await trigger.hover();
  if(config.interaction==='focus'){await page.locator('#after-select').focus();await page.keyboard.press('Shift+Tab');}
  if(config.opened){
   if(config.opener==='keyboard'){await page.locator('#after-select').focus();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Enter');}
   else await trigger.click();
   await host.getByRole('listbox',{name:config.label,exact:true}).waitFor();
   if(config.interaction==='option-hover')await host.getByRole('option',{name:'Shopping',exact:true}).hover();
   if(config.interaction==='option-keyboard'){await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');}
  }
  await page.evaluate(()=>new Promise<void>((resolve,reject)=>{
   let previous='',stable=0,attempts=0;const root=document.querySelector('#visual-select')!.shadowRoot!;
   const step=()=>{const signature=JSON.stringify([...root.querySelectorAll('*')].map(node=>{const css=getComputedStyle(node),r=node.getBoundingClientRect();return[css.opacity,css.backgroundColor,css.color,r.x,r.y,r.width,r.height]}));stable=signature===previous?stable+1:0;previous=signature;if(stable>=8)resolve();else if(++attempts>240)reject(Error('Candidate select did not settle'));else requestAnimationFrame(step);};requestAnimationFrame(step);
  }));
  const actual=await host.evaluate(host=>{
   const root=host.shadowRoot!,origin=document.querySelector('#select-capture')!.getBoundingClientRect();
   const piece=(node:Element|null):Piece|null=>{if(!node)return null;const r=node.getBoundingClientRect(),css=getComputedStyle(node),after=getComputedStyle(node,'::after');const range=document.createRange();range.selectNodeContents(node);const text=range.getBoundingClientRect();return{box:{x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height},glyph:{x:text.x-origin.x,y:text.y-origin.y,width:text.width,height:text.height},style:Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','padding','margin','color','backgroundColor','border','borderRadius','opacity','boxShadow','outline','outlineOffset'].map(key=>[key,css[key as keyof CSSStyleDeclaration]])) as Record<string,string>,after:{height:after.height,backgroundColor:after.backgroundColor}};};
   return{base:piece(root.querySelector('.picker')),trigger:piece(root.querySelector('#control')),overline:piece(root.querySelector('.overline')),headline:piece(root.querySelector('.headline')),arrow:piece(root.querySelector('.arrow')),helper:piece(root.querySelector('.picker-error,.picker-help')),menu:root.querySelector('.popup')!.matches(':popover-open')?piece(root.querySelector('.popup')):null,options:[...root.querySelectorAll('.option')].map(node=>piece(node)!)};
  });
  const prefix=row.theme+'/'+row.name,local:string[]=[];
  const near=(a:Box,b:Box,label:string)=>{for(const key of ['x','y','width','height'] as const)if(Math.abs(a[key]-b[key])>.1)local.push(`${label}/${key}: ${a[key]} vs ${b[key]}`);};
  for(const name of ['base','trigger','overline','headline','arrow','helper','menu'] as const){
   const a=actual[name],b=row.parts[name];if(!a||!b){if(a!==b)local.push(name+' presence');continue;}near(a.box,b.box,name);
   const keys=name==='trigger'?[]:name==='base'?['backgroundColor','borderRadius','opacity']:name==='arrow'?['color']:name==='menu'?['backgroundColor','border','borderRadius','boxShadow']:['fontFamily','fontSize','fontWeight','lineHeight','color'];
   for(const key of keys)if(a.style[key]!==b.style[key])local.push(`${name}/${key}: ${a.style[key]} vs ${b.style[key]}`);
  }
  for(const key of ['height','backgroundColor'])if(actual.base!.after[key]!==row.parts.base.after[key])local.push(`underline/${key}: ${actual.base!.after[key]} vs ${row.parts.base.after[key]}`);
  if(config.opened){assert.equal(actual.options.length,row.parts.options.length);for(let i=0;i<actual.options.length;i++)near(actual.options[i].box,row.parts.options[i].box,'option'+i);}
  const path=resolve(output,'ha-select-'+row.theme+'-'+row.name+'.png'),raster=await captureSettledElement(page,'#select-capture',path);
  const decoded=await page.evaluate(async sources=>Promise.all(sources.map(async source=>{
   const image=new Image();image.src=source;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true})!;context.drawImage(image,0,0);return{width:canvas.width,height:canvas.height,pixels:Array.from(context.getImageData(0,0,canvas.width,canvas.height).data)};
  })),[original,await readFile(path)].map(bytes=>'data:image/png;base64,'+bytes.toString('base64')));
  const agreement=rasterAgreement({...decoded[0],pixels:Uint8Array.from(decoded[0].pixels)},{...decoded[1],pixels:Uint8Array.from(decoded[1].pixels)});if(!agreement.accepted)local.push('original HA raster exceeds selector quantization bounds');
  problems.push(...local.map(problem=>prefix+'/'+problem));results.push({platform,architecture,browser,theme:row.theme,name:row.name,geometryMatch:local.every(p=>!/^\w+\/(x|y|width|height):/u.test(p)),identicalPixels:raster.sha256===row.image.sha256,rasterAgreement:agreement,problems:local,referenceImage:row.image,raster,actual});
 }
 await writeFile(resolve(output,'ha-select-parity.json'),JSON.stringify({reference:'docs/evidence/ha-select-reference.json',scope:'Single filled select and menu only; multiple/chips, full browser/framework breadth and application acceptance remain pending.',selectorRasterTolerance,motion,palettes,results,problems},null,2)+'\n');assert.deepEqual(problems,[],'Original HA select paint and geometry');return results;
}
