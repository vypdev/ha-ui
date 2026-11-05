import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {feedbackState,type FeedbackKind,type FeedbackTone} from '@vypdev/ha-ui/feedback-contracts';
import {selectorRasterTolerance} from '../../tooling/raster.mjs';
import {waitForCatalogStory} from './lifecycle.ts';
import {readOriginalRaster} from './reference-images.ts';
import {compareVisualPng} from './raster-comparison.ts';
import {captureSettledElement} from './screenshot.ts';

type Box={x:number;y:number;width:number;height:number};
type Piece={box:Box;style:Record<string,string>};
type Config={name:string;kind:FeedbackKind;tone?:FeedbackTone;title?:string;message?:string;width:number;dir?:string;narrow?:boolean;action?:boolean;noDescription?:boolean;noIcon?:boolean};
type Measurement={parts:Record<string,Piece|null>;title:Box|null;message:Box|null};
type Row={platform:string;architecture:string;theme:string;config:Config;measurement:Measurement;image:{path:string;sha256:string}};

export async function exerciseFeedbackVisual(page:Page,origin:string,output:string){
 const pathToReference='docs/evidence/ha-feedback-reference.json';
 const reference=JSON.parse(await readFile(resolve(pathToReference),'utf8')) as {themes:Record<string,Record<string,string>>;states:Row[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform);
 const architecture=process.arch,browser=page.context().browser()!.version(),rows=reference.states.filter(row=>row.platform===platform&&row.architecture===architecture);
 assert.equal(rows.length,22,'Every original HA feedback state is required for '+platform+'/'+architecture);
 await page.setViewportSize({width:1280,height:900});
 const results=[],problems:string[]=[];
 for(const row of rows){
  const config=row.config,story='feedback-status--default';
  await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story');await waitForCatalogStory(page,story);
  const original=await readOriginalRaster(row.image);
  const state=feedbackState({kind:config.kind,tone:config.tone,title:config.title,message:config.message,narrow:config.narrow,icon:!config.noIcon});
  const command=buttonState({label:config.kind==='empty'?'Add task':'Retry',variant:'plain'});
  await page.evaluate(async({config,state,command,tokens})=>{
   document.querySelector<HTMLElement>('main.catalog-frame')!.hidden=true;
   document.body.style.cssText='margin:0;font:400 14px/1.6 Roboto,Noto,sans-serif;-webkit-font-smoothing:antialiased;';
   for(const[k,v]of Object.entries(tokens))document.body.style.setProperty(k,v);
   const proof=document.createElement('div');proof.id='feedback-proof';proof.dir=config.dir??'ltr';
   proof.style.cssText='position:fixed;left:24px;top:24px;padding:24px;display:block;background:var(--primary-background-color);color:var(--primary-text-color);width:'+config.width+'px';
   if(config.kind==='empty')proof.style.height='280px';
   if(config.dir==='rtl'){
    const loaded=await document.fonts.load('400 16px Noto','راجع التذكير');
    if(!loaded.length||loaded.some(face=>face.status!=='loaded'))throw Error('Pinned Arabic fallback is missing');
   }
   const feedback=document.createElement('vyp-ha-feedback');feedback.id='candidate-feedback';feedback.state=state;
   if(config.kind==='empty')feedback.style.height='100%';
   if(config.action){const button=document.createElement('vyp-ha-button');button.slot='action';button.state=command;feedback.append(button);}
   proof.append(feedback);document.body.append(proof);await feedback.updateComplete;
   await Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]);await document.fonts.ready;
  },{config,state,command,tokens:reference.themes[row.theme]});
  const host=page.locator('#candidate-feedback');await host.waitFor();await page.mouse.move(1100,850);
  const measured=await host.evaluate((el,kind)=>{
   const origin=document.querySelector('#feedback-proof')!.getBoundingClientRect();
   const keys=['backgroundColor','borderRadius','border','padding','gap','fontFamily','fontSize','fontWeight','lineHeight','color','direction','opacity','stroke','strokeWidth','strokeDasharray','strokeDashoffset','textAlign','margin'] as const;
   const box=(r:DOMRect):Box=>({x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height});
   const part=(node:Element|null|undefined,pseudo?:string):Piece|null=>{
    if(!node)return null;const style=getComputedStyle(node,pseudo);return{box:box(node.getBoundingClientRect()),style:Object.fromEntries(keys.map(k=>[k,style[k]]))};
   };
   const glyph=(node:Element|null):Box|null=>{
    const text=[...node?.childNodes??[]].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent!.trim());if(!text)return null;
    const range=document.createRange();range.selectNodeContents(text);return box(range.getBoundingClientRect());
   };
   const root=el.shadowRoot!,surface=root.querySelector('[part=surface]'),title=root.querySelector('.title'),button=el.querySelector('vyp-ha-button')?.shadowRoot;
   const action=part(button?.querySelector('[part=surface]')),target=part(button?.querySelector('button'));
   if(kind==='empty')return{parts:{host:part(el),content:part(root.querySelector('.content')),icon:part(root.querySelector('[part=icon]')),heading:part(root.querySelector('h2')),description:part(root.querySelector('p')),button:action},title:null,message:null,target};
   if(kind==='loading')return{parts:{surface:part(surface),spinner:part(root.querySelector('[part=spinner]')),track:part(root.querySelector('.track')),indicator:part(root.querySelector('.indicator'))},title:null,message:glyph(root.querySelector('.text span')),target};
   return{parts:{surface:part(surface),overlay:part(surface,'::after'),icon:part(root.querySelector('[part=icon]')),title:part(title),button:action},title:glyph(title),message:glyph(root.querySelector('.text span')),target};
  },config.kind);
  const issues:string[]=[];
  const near=(actual:Box|null,expected:Box|null,name:string)=>{
   if(!actual||!expected){if(actual!==expected)issues.push(name+'/presence');return;}
   for(const key of ['x','y','width','height'] as const)if(Math.abs(actual[key]-expected[key])>.1)issues.push(name+'/'+key+': '+actual[key]+' vs '+expected[key]);
  };
  const typography=['fontFamily','fontSize','fontWeight','lineHeight','color'];
  const styles:Record<string,string[]>={surface:['padding','direction'],overlay:['backgroundColor','borderRadius','opacity'],icon:['color'],title:typography,button:config.kind==='empty'?['color','fontFamily','fontSize','fontWeight','lineHeight','padding']:['color','backgroundColor','borderRadius'],spinner:[],track:['stroke','strokeWidth'],indicator:['stroke','strokeWidth','strokeDasharray','strokeDashoffset'],host:typography,content:['padding','gap','textAlign'],heading:typography,description:typography};
  for(const [name,actual] of Object.entries(measured.parts)){
   const expected=row.measurement.parts[name];
   if(!actual||!expected){if(actual!==expected)issues.push(name+'/presence');continue;}
   near(actual.box,expected.box,name);
   for(const key of styles[name])if(actual.style[key]!==expected.style[key])issues.push(name+'/'+key+': '+actual.style[key]+' vs '+expected.style[key]);
  }
  near(measured.title,row.measurement.title,'title text');near(measured.message,row.measurement.message,'message text');
  if(config.action)assert.ok(measured.target&&measured.target.box.height>=44&&measured.target.box.width>=44,'Projected shared commands retain the 44px native target');
  const path=resolve(output,'ha-feedback-'+row.theme+'-'+config.name+'.png'),raster=await captureSettledElement(page,'#feedback-proof',path);
  const candidate=await readFile(path);
  const dimensions=(png:Buffer)=>[png.readUInt32BE(16),png.readUInt32BE(20)].join('x');
  const originalSize=dimensions(original),candidateSize=dimensions(candidate);
  const comparison=originalSize===candidateSize?await compareVisualPng(page,original,candidate):null;
  if(!comparison)issues.push('Raster dimensions: '+candidateSize+' vs '+originalSize);
  else if(!comparison.agreement.accepted)issues.push('Original HA feedback raster exceeds approved quantization bounds');
  problems.push(...issues.map(issue=>row.theme+'/'+config.name+'/'+issue));
  results.push({platform,architecture,browser,theme:row.theme,name:config.name,identicalPng:comparison?.sameBytes??false,rasterAgreement:comparison?.agreement??null,problems:issues,referenceImage:row.image,raster,actual:measured});
 }
 await writeFile(resolve(output,'ha-feedback-parity.json'),JSON.stringify({reference:pathToReference,scope:'Actual HA notices, loading and empty state compared to the compiled renderer.',tolerance:selectorRasterTolerance,results,problems},null,2)+'\n');
 assert.deepEqual(problems,[],'Original HA feedback geometry and paint');return results;
}
