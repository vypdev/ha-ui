import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import {buttonState} from '@vypdev/ha-ui/button-contracts';
import {cardState} from '@vypdev/ha-ui/card-contracts';
import {gridState,rowState} from '@vypdev/ha-ui/layout-contracts';
import {selectorRasterTolerance} from '../../tooling/raster.mjs';
import {waitForCatalogStory} from './lifecycle.ts';
import {readOriginalRaster} from './reference-images.ts';
import {compareVisualPng} from './raster-comparison.ts';
import {captureSettledElement} from './screenshot.ts';

type Box={x:number;y:number;width:number;height:number};
type Piece={box:Box;glyph:Box|null;style:Record<string,string>};
type Config={name:string;kind:'row'|'grid';width:number;dir?:string;actions?:boolean;wrapped?:boolean;columns?:number;responsive?:boolean;square?:boolean;gap?:number};
type Measurement={layout:Piece;items:Record<string,Piece|null>[]};
type Row={platform:string;architecture:string;theme:string;config:Config;measurement:Measurement;image:{path:string;sha256:string}};

export async function exerciseLayoutVisual(page:Page,origin:string,output:string){
 const referencePath='docs/evidence/ha-layout-reference.json';
 const reference=JSON.parse(await readFile(resolve(referencePath),'utf8')) as {themes:Record<string,Record<string,string>>;states:Row[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform);
 const architecture=process.arch,browser=page.context().browser()!.version(),rows=reference.states.filter(row=>row.platform===platform&&row.architecture===architecture);
 assert.equal(rows.length,16,'Complete original HA layout references are required for '+platform+'/'+architecture);
 await page.setViewportSize({width:1280,height:900});
 const results=[],problems:string[]=[];
 for(const row of rows){
  const config=row.config,story='layout-'+config.kind+'--default';
  await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story');await waitForCatalogStory(page,story);
  const original=await readOriginalRaster(row.image);
  const labels=config.dir==='rtl'?[['راجع لوازم المطبخ','راجع قائمة التسوق.'],['اسق النباتات','']]:
   config.wrapped?[['Review the kitchen and maintenance supplies','Check the shared household list.']]:
   config.actions?[['Review kitchen supplies','Shopping']]:
   [['Review kitchen supplies','Shopping'],['Check the hallway','Maintenance'],['Water the plants','']];
  const cards=[['Shopping','Review supplies.'],['Cleaning','Check the hallway.'],['Plants','Water the plants.']].map(([title,copy])=>({state:cardState({title}),copy}));
  await page.evaluate(async({tokens,config,rows,cards,gridState,buttonState})=>{
   document.querySelector<HTMLElement>('main.catalog-frame')!.hidden=true;
   document.body.style.cssText='margin:0;font:400 14px/1.6 Roboto,Noto,sans-serif;-webkit-font-smoothing:antialiased;';
   for(const[k,v]of Object.entries(tokens))document.body.style.setProperty(k,v);
   const proof=document.createElement('div');proof.id='layout-proof';proof.dir=config.dir??'ltr';
   proof.style.cssText='position:fixed;left:24px;top:24px;padding:24px;display:block;background:var(--primary-background-color);color:var(--primary-text-color);width:'+config.width+'px';
   if(config.dir==='rtl'){
    const font=await document.fonts.load('400 16px Noto','مهام المنزل');
    if(!font.length||font.some(face=>face.status!=='loaded'))throw Error('Pinned Arabic reference font did not load');
   }
   if(config.kind==='row'){
    const list=document.createElement('div');list.id='candidate-layout';list.setAttribute('role','list');
    for(const state of rows){
     const row=document.createElement('vyp-ha-row');row.state=state;
     if(config.actions){
      const svgNamespace='http://www.w3.org/2000/svg',leading=document.createElementNS(svgNamespace,'svg');
      leading.setAttribute('slot','leading');leading.setAttribute('aria-hidden','true');leading.setAttribute('width','16');leading.setAttribute('height','16');
      leading.setAttribute('viewBox','0 0 16 16');leading.setAttribute('style','display:block');leading.setAttribute('fill','currentColor');
      const diamond=document.createElementNS(svgNamespace,'path');diamond.setAttribute('d','M8 2 14 8 8 14 2 8Z');leading.append(diamond);row.append(leading);
      const button=document.createElement('vyp-ha-button');button.slot='trailing';button.state=buttonState;row.append(button);
     }
     list.append(row);
    }
    proof.append(list);
   }else{
    const grid=document.createElement('vyp-ha-grid');grid.id='candidate-layout';grid.state=gridState;
    if(config.gap)grid.style.setProperty('--grid-card-gap',config.gap+'px');
    for(const item of cards){
     const cell=document.createElement('div');cell.className='cell';
     const card=document.createElement('vyp-ha-card');card.state=item.state;
     const text=document.createElement('div');text.textContent=item.copy;card.append(text);cell.append(card);grid.append(cell);
    }
    proof.append(grid);
   }
   document.body.append(proof);
   await Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]);await document.fonts.ready;
  },{tokens:reference.themes[row.theme],config,rows:labels.map(([label,description])=>rowState({label,description})),cards,gridState:gridState({columns:config.responsive?3:config.columns,minColumnWidth:config.responsive?150:undefined,square:config.square}),buttonState:buttonState({label:'Review',variant:'plain'})});
  const proof=page.locator('#layout-proof');await page.mouse.move(1100,850);
  if(config.kind==='row')await proof.getByRole('listitem').first().waitFor();
  else await proof.locator('vyp-ha-card [part=body]').first().waitFor();
  const measured=await proof.evaluate((proof,config)=>{
   const origin=proof.getBoundingClientRect();
   const properties=['display','gridTemplateColumns','gap','padding','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','direction','color','border','borderRadius','backgroundColor'] as const;
   const relative=(r:DOMRect):Box=>({x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height});
   const part=(node:Element|null|undefined):Piece|null=>{
    if(!node)return null;const css=getComputedStyle(node),text=[...node.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent!.trim());
    let glyph:Box|null=null;if(text){const range=document.createRange();range.selectNodeContents(text);glyph=relative(range.getBoundingClientRect());}
    return{box:relative(node.getBoundingClientRect()),glyph,style:Object.fromEntries(properties.map(k=>[k,css[k]]))};
   };
   const root=proof.querySelector('#candidate-layout')!;
   if(config.kind==='row')return{layout:part(root)!,items:[...root.children].map(row=>({surface:part(row.shadowRoot!.querySelector('[part=row]')),label:part(row.shadowRoot!.querySelector('[part=label]')),description:part(row.shadowRoot!.querySelector('[part=description]')),leading:part(row.querySelector('[slot=leading]')),command:part(row.querySelector('[slot=trailing]')?.shadowRoot?.querySelector('[part=surface]'))}))};
   return{layout:part(root.shadowRoot!.querySelector('[part=grid]'))!,items:[...root.querySelectorAll('.cell')].map(cell=>({cell:part(cell),card:part(cell.querySelector('vyp-ha-card'))}))};
  },config);
  const issues:string[]=[];
  const near=(actual:Box,expected:Box,name:string)=>{for(const key of ['x','y','width','height'] as const)if(Math.abs(actual[key]-expected[key])>.1)issues.push(name+'/'+key+': '+actual[key]+' vs '+expected[key]);};
  const compare=(actual:Piece|null,expected:Piece|null,name:string,keys:string[])=>{
   if(!actual||!expected){if(actual!==expected)issues.push(name+'/presence');return;}
   near(actual.box,expected.box,name);
   if(actual.glyph&&expected.glyph)near(actual.glyph,expected.glyph,name+'/glyph');
   else if(actual.glyph!==expected.glyph)issues.push(name+'/glyph presence');
   for(const key of keys)if(actual.style[key]!==expected.style[key])issues.push(name+'/'+key+': '+actual.style[key]+' vs '+expected.style[key]);
  };
  const typography=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','direction','color'];
  const properties:Record<string,string[]>={surface:[...typography,'gap','padding'],label:typography,description:typography,leading:typography,command:['color','border','borderRadius','backgroundColor'],cell:[],card:[]};
  compare(measured.layout,row.measurement.layout,'layout',config.kind==='grid'?['gridTemplateColumns','gap','direction']:['direction']);
  assert.equal(measured.items.length,row.measurement.items.length);
  for(const [i,item] of measured.items.entries())for(const [name,piece] of Object.entries(item))compare(piece,row.measurement.items[i][name],name+i,properties[name]);
  const path=resolve(output,'ha-layout-'+row.theme+'-'+config.name+'.png'),raster=await captureSettledElement(page,'#layout-proof',path);
  const {sameBytes,agreement}=await compareVisualPng(page,original,await readFile(path));if(!agreement.accepted)issues.push('Original HA layout raster exceeds approved quantization bounds');
  problems.push(...issues.map(issue=>row.theme+'/'+config.name+'/'+issue));
  results.push({platform,architecture,browser,theme:row.theme,name:config.name,identicalPng:sameBytes,rasterAgreement:agreement,problems:issues,referenceImage:row.image,raster,actual:measured});
 }
 await writeFile(resolve(output,'ha-layout-parity.json'),JSON.stringify({reference:referencePath,scope:'Original passive HA rows and Lovelace grid with projected shared cards.',tolerance:selectorRasterTolerance,results,problems},null,2)+'\n');
 assert.deepEqual(problems,[],'Original HA row and grid geometry and paint');return results;
}
