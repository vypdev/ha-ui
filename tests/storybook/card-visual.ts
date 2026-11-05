import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {cardState} from '@vypdev/ha-ui/card-contracts';
import {selectorRasterTolerance} from '../../tooling/raster.mjs';
import {waitForCatalogStory} from './lifecycle.ts';
import {compareVisualPng} from './raster-comparison.ts';
import {captureSettledElement} from './screenshot.ts';

type Box={x:number;y:number;width:number;height:number};
type Piece={box:Box;glyph:Box|null;style:Record<string,string>};
type Config={name:string;header?:string;raised?:boolean;actions?:boolean;width?:number;dir?:string;copy?:string;custom?:boolean;empty?:boolean};
type Row={platform:string;architecture:string;theme:string;config:Config;geometry:Record<string,Piece|null>;image:{path:string;sha256:string}};

export async function exerciseCardVisual(page:Page,origin:string,output:string){
 const referencePath='docs/evidence/ha-card-reference.json';
 const reference=JSON.parse(await readFile(resolve(referencePath),'utf8')) as {themes:Record<string,Record<string,string>>;states:Row[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform);
 const architecture=process.arch,browser=page.context().browser()!.version(),rows=reference.states.filter(row=>row.platform===platform&&row.architecture===architecture);
 assert.equal(rows.length,16,'All independent HA card captures are required for '+platform+'/'+architecture);
 await page.setViewportSize({width:1280,height:900});
 const results=[],problems:string[]=[];
 for(const row of rows){
  const config=row.config,story='surfaces-card--default';
  await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story');await waitForCatalogStory(page,story);
  const original=await readFile(resolve(row.image.path));assert.equal(createHash('sha256').update(original).digest('hex'),row.image.sha256);
  await page.evaluate(async({tokens,config,state,command})=>{
   document.querySelector<HTMLElement>('main.catalog-frame')!.hidden=true;
   document.body.style.cssText='margin:0;font:400 14px/1.6 Roboto,Noto,sans-serif;-webkit-font-smoothing:antialiased;';
   for(const[k,v]of Object.entries(tokens))document.body.style.setProperty(k,v);
   const proof=document.createElement('div');proof.id='card-proof';proof.style.cssText='position:fixed;left:32px;top:32px;padding:24px;display:inline-flex;align-items:flex-start;box-sizing:border-box;background:var(--primary-background-color);color:var(--primary-text-color)';
   const card=document.createElement('vyp-ha-card');card.id='candidate-card';card.state=state;card.style.width=(config.width??320)+'px';card.dir=config.dir??'ltr';
   if(config.custom){card.style.setProperty('--ha-card-border-radius','4px');card.style.setProperty('--ha-card-border-width','2px');card.style.setProperty('--ha-card-background','var(--secondary-background-color)');}
   if(!config.empty){const body=document.createElement('div');body.textContent=config.copy??'Review the kitchen supplies before shopping.';card.append(body);}
   if(config.actions){const button=document.createElement('vyp-ha-button');button.slot='actions';button.state=command;card.append(button);}
   proof.append(card);document.body.append(proof);await card.updateComplete;
   await Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]);await document.fonts.ready;
  },{tokens:reference.themes[row.theme],config,state:cardState({title:config.header,raised:config.raised}),command:buttonState({label:'Review task',variant:'plain'})});
  const host=page.locator('#candidate-card');await page.mouse.move(1100,850);
  if(!config.empty)await host.locator('[part=body]').waitFor();
  if(config.actions)await host.getByRole('button',{name:'Review task'}).waitFor();
  const actual=await host.evaluate(element=>{
   const origin=document.querySelector('#card-proof')!.getBoundingClientRect(),root=element.shadowRoot!;
   const properties=['backgroundColor','border','borderRadius','boxShadow','padding','margin','fontFamily','fontSize','fontWeight','color','lineHeight','letterSpacing','direction','textAlign','borderTop'];
   const relative=(box:DOMRect):Box=>({x:box.x-origin.x,y:box.y-origin.y,width:box.width,height:box.height});
   const part=(node:Element|null|undefined,textNode:Element|null|undefined=node):Piece|null=>{
    if(!node||node.getBoundingClientRect().height===0)return null;
    const css=getComputedStyle(node),direct=[...textNode?.childNodes??[]].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent!.trim());
    let glyph:Box|null=null;if(direct){const range=document.createRange();range.selectNodeContents(direct);glyph=relative(range.getBoundingClientRect());}
    return{box:relative(node.getBoundingClientRect()),glyph,style:Object.fromEntries(properties.map(key=>[key,css[key as keyof CSSStyleDeclaration]])) as Record<string,string>};
   };
   const button=element.querySelector('vyp-ha-button')?.shadowRoot;
   return{host:part(root.querySelector('article')),header:part(root.querySelector('h2')),content:part(root.querySelector('[part=body]'),element.querySelector('div')),actions:part(root.querySelector('[part=actions]')),button:part(button?.querySelector('[part=surface]')),target:part(button?.querySelector('button'))};
  });
  const local:string[]=[];
  const near=(measured:Box,expected:Box,label:string)=>{
   for(const key of ['x','y','width','height'] as const)if(Math.abs(measured[key]-expected[key])>.1)local.push(label+'/'+key+': '+measured[key]+' vs '+expected[key]);
  };
  const typography=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','direction','textAlign'];
  const properties:Record<string,string[]>={host:[...typography,'backgroundColor','border','borderRadius','boxShadow'],header:[...typography,'padding'],content:[...typography,'padding','margin'],actions:['borderTop'],button:['color','backgroundColor','border','borderRadius','padding']};
  for(const name of ['host','header','content','actions','button'] as const){
   const measured=actual[name],expected=row.geometry[name];
   if(!measured||!expected){if(measured!==expected)local.push(name+'/presence');continue;}
   near(measured.box,expected.box,name);
   if(measured.glyph&&expected.glyph)near(measured.glyph,expected.glyph,name+'/text');
   else if(measured.glyph!==expected.glyph)local.push(name+'/text presence');
   for(const property of properties[name])if(measured.style[property]!==expected.style[property])local.push(name+'/'+property+': '+measured.style[property]+' vs '+expected.style[property]);
  }
  if(config.actions)assert.ok(actual.target&&actual.target.box.height>=44&&actual.target.box.width>=44,'The native card command keeps its 44px minimum hit target');
  const path=resolve(output,'ha-card-'+row.theme+'-'+config.name+'.png'),raster=await captureSettledElement(page,'#card-proof',path);
  const {sameBytes,agreement}=await compareVisualPng(page,original,await readFile(path));if(!agreement.accepted)local.push('Original HA card raster exceeds approved quantization bounds');
  problems.push(...local.map(problem=>row.theme+'/'+config.name+'/'+problem));results.push({platform,architecture,browser,theme:row.theme,name:config.name,identicalPng:sameBytes,rasterAgreement:agreement,problems:local,referenceImage:row.image,raster,actual});
 }
 await writeFile(resolve(output,'ha-card-parity.json'),JSON.stringify({reference:referencePath,scope:'Original HA card compared with the compiled shared renderer and its native command.',tolerance:selectorRasterTolerance,results,problems},null,2)+'\n');
 assert.deepEqual(problems,[],'Original HA card geometry and paint');return results;
}
