import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {readOriginalRaster} from './reference-images.ts';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import type {Page} from 'playwright';
import type {AxeResults} from 'axe-core';
import {selectState} from '@vypdev/ha-ui/select-contracts';
import {captureSettledElement} from './screenshot.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import {rasterAgreement,selectorRasterTolerance} from '../../tooling/raster.mjs';
type Box={x:number;y:number;width:number;height:number};
type Piece={box:Box;style:Record<string,string>};
type Parts={host:Piece;chipset:Piece|null;chips:{surface:Piece;label:Piece;remove:Piece;icon:Piece}[];trigger:Piece;triggerLabel:Piece;dialog:Piece|null;searchBox:Piece|null;searchInput:Piece|null;rows:Piece[];rowLabels:Piece[];message:Piece|null;helper:Piece|null};
type Configuration={name:string;label:string;value:string[];options:{value:string;label:string;disabled:boolean}[];width:number;dir:string;disabled:boolean;required:boolean;helper:string;opened:boolean;interaction:string;search:string};
type Row={platform:string;architecture:string;theme:string;name:string;configuration:Configuration;frame:Box;parts:Parts;image:{path:string;sha256:string}};
/** The real catalog palette is independently scanned with every default axe rule enabled. */
export async function exerciseSelectMultipleAccessibility(page:Page,origin:string,output:string){
 const require=createRequire(import.meta.url),results=[];
 for(const theme of ['light','dark'])for(const mode of ['choices','filtered','no-matches','empty']){
  const story=mode==='empty'?'forms-select--empty-multiple':'forms-select--multiple';await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=theme:'+theme+';motion:reduced');const automatic=await waitForCatalogStory(page,story);
  await page.locator('vyp-ha-select').getByRole('button',{name:'Category',exact:true}).click();const search=page.getByRole('combobox',{name:'Search categories',exact:true});
  if(mode==='filtered')await search.fill('other');if(mode==='no-matches')await search.fill('unmatched');if(mode==='choices')await page.keyboard.press('ArrowDown');
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});const violations=await page.evaluate(async()=>{const axe=(window as unknown as {axe:{reset:()=>void;run:(root:Element)=>Promise<AxeResults>}}).axe;axe.reset();return(await axe.run(document.querySelector('main')!)).violations.map(result=>({id:result.id,impact:result.impact,nodes:result.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}));});
  results.push({theme,mode,automatic,violations});
 }
 await writeFile(resolve(output,'ha-select-multiple-accessibility.json'),JSON.stringify({scope:'Independent default-rule scans of the real catalog palette with open multiple-search dialogs.',results},null,2)+'\n');assert.deepEqual(results.flatMap(row=>row.violations),[],'Open multiple dialog accessibility');return results;
}
/** Independent original chip/search references; native 44px targets reserve 12px beyond the unchanged 32px action paint. */
export async function exerciseSelectMultipleVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-select-multiple-reference.json'),'utf8')) as {themes:Record<string,Record<string,string>>;states:Row[];referenceRepeatsComplete:boolean};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform);const architecture=process.arch,browser=page.context().browser()!.version();
 const rows=reference.states.filter(row=>row.platform===platform&&row.architecture===architecture);assert.equal(rows.length,30,'Complete original multiple references are required for '+platform+'/'+architecture);assert.equal(reference.referenceRepeatsComplete,true);
 const results=[],problems:string[]=[];await page.setViewportSize({width:1280,height:900});const accessibility=await exerciseSelectMultipleAccessibility(page,origin,output);
 for(const row of rows){
  const config=row.configuration,story='forms-select--disabled';await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story');await waitForCatalogStory(page,story);
  const original=await readOriginalRaster(row.image);
  const state=selectState({multiple:true,mode:'dropdown',label:config.label,options:config.options,description:config.helper,required:config.required});
  await page.evaluate(async({state,config,tokens,frame})=>{
   document.querySelector<HTMLElement>('main.catalog-frame')!.hidden=true;
   for(const[key,value]of Object.entries(tokens))document.body.style.setProperty(key,value);document.body.style.background='var(--card-background-color)';
   const proof=document.createElement('div');proof.id='select-proof';proof.style.cssText='position:fixed;left:32px;top:32px;padding:16px;display:inline-flex;align-items:flex-start;box-sizing:border-box;background:var(--card-background-color);color:var(--primary-text-color);font:400 14px/1.6 Roboto,Noto,sans-serif;-webkit-font-smoothing:antialiased';
   const host=document.createElement('vyp-ha-select');host.id='visual-multiple';host.state=state;host.value=config.value;host.style.width=config.width+'px';host.dir=config.dir;host.disabled=config.disabled;proof.append(host);document.body.append(proof);await host.updateComplete;
   const capture=document.createElement('div');capture.id='select-capture';capture.style.cssText=`position:fixed;pointer-events:none;left:${frame.x}px;top:${frame.y}px;width:${frame.width}px;height:${frame.height}px`;document.body.append(capture);
   await document.fonts.load('400 14px Roboto');await document.fonts.load('500 14px Roboto');await document.fonts.ready;
  },{state,config,tokens:reference.themes[row.theme],frame:row.frame});
  const host=page.locator('#visual-multiple');await page.mouse.move(1100,850);
  if(config.interaction==='remove-hover')await host.getByRole('button',{name:'Remove Maintenance',exact:true}).hover();
  if(config.interaction==='remove-focus'){await page.keyboard.press('Tab');await host.getByRole('button',{name:'Remove Maintenance',exact:true}).focus();}
  if(config.opened){await host.getByRole('button',{name:config.label,exact:true}).click();await page.mouse.move(1100,850);if(config.search)await host.getByRole('combobox',{name:'Search options',exact:true}).fill(config.search);if(config.interaction==='option-keyboard')await page.keyboard.press('ArrowDown');}
  await page.evaluate(()=>new Promise<void>((resolve,reject)=>{
   let previous='',stable=0,attempts=0;const root=document.querySelector('#visual-multiple')!.shadowRoot!;
   const step=()=>{const signature=JSON.stringify([...root.querySelectorAll('*')].map(node=>{const css=getComputedStyle(node),r=node.getBoundingClientRect();return[css.opacity,css.backgroundColor,css.color,r.x,r.y,r.width,r.height]}));stable=signature===previous?stable+1:0;previous=signature;if(stable>=8)resolve();else if(++attempts>240)reject(Error('Candidate multiple select did not settle'));else requestAnimationFrame(step);};requestAnimationFrame(step);
  }));
  const actual=await host.evaluate(host=>{
   const root=host.shadowRoot!,origin=document.querySelector('#select-capture')!.getBoundingClientRect();
   const piece=(node:Element|null):Piece|null=>{if(!node)return null;const r=node.getBoundingClientRect(),css=getComputedStyle(node);return{box:{x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height},style:Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','border','borderRadius','opacity','boxShadow'].map(key=>[key,css[key as keyof CSSStyleDeclaration]])) as Record<string,string>};};
   const opened=root.querySelector('dialog')!.open;
   return{host:piece(root.querySelector('.multiple-paint'))!,nativeHost:piece(host)!,chipset:piece(root.querySelector('.multi-chips')),chips:[...root.querySelectorAll('.multi-chip')].map(node=>({surface:piece(node)!,label:piece(node.querySelector('.multi-chip-label'))!,remove:piece(node.querySelector('.multi-remove-paint'))!,icon:piece(node.querySelector('svg'))!})),trigger:piece(root.querySelector('.multi-add-paint'))!,nativeTrigger:piece(root.querySelector('#control'))!,nativeRemovals:[...root.querySelectorAll('.multi-remove')].map(node=>piece(node)!),triggerLabel:piece(root.querySelector('.multi-add-label'))!,dialog:opened?piece(root.querySelector('.multi-popup')):null,searchBox:opened?piece(root.querySelector('.multi-search-box')):null,searchInput:opened?piece(root.querySelector('.multi-search-input')):null,rows:opened?[...root.querySelectorAll('.multi-option,.multi-empty')].map(node=>piece(node)!):[],rowLabels:opened?[...root.querySelectorAll('.multi-option-label')].map(node=>piece(node)!):[],message:opened?piece(root.querySelector('.multi-empty-label')):null,helper:piece(root.querySelector('.picker-help'))};
  });
  const local:string[]=[];const near=(a:Box,b:Box,label:string)=>{for(const key of ['x','y','width','height'] as const)if(Math.abs(a[key]-b[key])>.1)local.push(`${label}/${key}: ${a[key]} vs ${b[key]}`);};
  for(const name of ['host','chipset','trigger','triggerLabel','dialog','searchBox','searchInput','message','helper'] as const){
   const a=actual[name],b=row.parts[name];if(!a||!b){if(a!==b)local.push(name+' presence');continue;}near(a.box,b.box,name);
   const keys=name==='trigger'||name==='searchBox'?['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','border','borderRadius']:name==='dialog'?['backgroundColor','border','borderRadius','boxShadow']:name==='triggerLabel'||name==='helper'||name==='searchInput'||name==='message'?['fontFamily','fontSize','fontWeight','lineHeight','color']:[];
   for(const key of keys)if(a.style[key]!==b.style[key])local.push(`${name}/${key}: ${a.style[key]} vs ${b.style[key]}`);
  }
  assert.equal(actual.chips.length,row.parts.chips.length);for(let i=0;i<actual.chips.length;i++)for(const part of ['surface','label','remove','icon'] as const)near(actual.chips[i][part].box,row.parts.chips[i][part].box,`chip${i}/${part}`);
  for(const name of ['rows','rowLabels'] as const){if(actual[name].length!==row.parts[name].length)local.push(name+' count');else for(let i=0;i<actual[name].length;i++)near(actual[name][i].box,row.parts[name][i].box,name+i);}
  assert.equal(actual.nativeHost.box.height-actual.host.box.height,12,'Explicit native hit reservation');for(const piece of [actual.nativeTrigger,...actual.nativeRemovals])assert.ok(piece.box.width>=44&&piece.box.height>=44,'Native touch targets must remain 44px');
  const path=resolve(output,'ha-select-'+row.theme+'-'+row.name+'.png'),raster=await captureSettledElement(page,'#select-capture',path);
  const decoded=await page.evaluate(async sources=>Promise.all(sources.map(async source=>{const image=new Image();image.src=source;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true})!;context.drawImage(image,0,0);return{width:canvas.width,height:canvas.height,pixels:Array.from(context.getImageData(0,0,canvas.width,canvas.height).data)};})),[original,await readFile(path)].map(bytes=>'data:image/png;base64,'+bytes.toString('base64')));
  const agreement=rasterAgreement({...decoded[0],pixels:Uint8Array.from(decoded[0].pixels)},{...decoded[1],pixels:Uint8Array.from(decoded[1].pixels)});if(!agreement.accepted)local.push('Original HA raster exceeds selector quantization bounds');
  problems.push(...local.map(problem=>row.theme+'/'+row.name+'/'+problem));results.push({platform,architecture,browser,theme:row.theme,name:row.name,identicalPixels:raster.sha256===row.image.sha256,rasterAgreement:agreement,problems:local,referenceImage:row.image,raster,actual});
 }
 await writeFile(resolve(output,'ha-select-multiple-parity.json'),JSON.stringify({reference:'docs/evidence/ha-select-multiple-reference.json',scope:'Multiple dropdown chips and search only. Painted layout is compared independently from the explicit 12px native touch-target reservation.',selectorRasterTolerance,accessibility,results,problems},null,2)+'\n');assert.deepEqual(problems,[],'Original HA multiple select paint and geometry');return results;
}
