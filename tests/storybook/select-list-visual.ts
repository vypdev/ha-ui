import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import {selectState} from '@vypdev/ha-ui/select-contracts';
import {captureSettledElement} from './screenshot.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import {rasterAgreement,selectorRasterTolerance} from '../../tooling/raster.mjs';
type Box={x:number;y:number;width:number;height:number};
type Piece={box:Box;glyph:Box|null;style:Record<string,string>};
type Choice={row:Piece;label:Piece;indicator:Piece;glyph:Piece|null;labelGlyph:Box|null;checked:boolean;disabled:boolean;paintOpacity:string};
type Configuration={label:string;multiple:boolean;value:string|string[]|null;options:{value:string;label:string;disabled?:boolean}[];width:number;dir:string;disabled:boolean;required:boolean;helper:string;interaction:string};
type Row={platform:string;architecture:string;theme:string;name:string;configuration:Configuration;frame:Box;parts:{host:Piece;caption:Piece;choices:Choice[];helper:Piece|null};image:{path:string;sha256:string}};

async function comparePng(page:Page,original:Buffer,candidate:Buffer){
 const sameBytes=original.equals(candidate);
 // Identical encoded PNGs already prove equality of every decoded channel.
 if(sameBytes){
  assert.equal(original.toString('ascii',12,16),'IHDR');
  const width=original.readUInt32BE(16),height=original.readUInt32BE(20);
  assert.ok(width>0&&height>0&&Number.isSafeInteger(width*height));
  return {sameBytes,agreement:{pixels:width*height,changedPixels:0,peakChannelDelta:0,meanChannelDelta:0,changedFraction:0,alphaChanges:0,exact:true,accepted:true}};
 }
 const decoded=await page.evaluate(async sources=>Promise.all(sources.map(async source=>{
  const image=new Image();image.src=source;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const context=canvas.getContext('2d',{willReadFrequently:true})!;context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
  let binary='';for(let start=0;start<pixels.length;start+=8192)binary+=String.fromCharCode(...pixels.subarray(start,start+8192));
  return{width:canvas.width,height:canvas.height,base64:btoa(binary)};
 })),[original,candidate].map(bytes=>'data:image/png;base64,'+bytes.toString('base64')));
 const [first,second]=decoded.map(({width,height,base64})=>({width,height,pixels:Buffer.from(base64,'base64')}));
 return {sameBytes,agreement:rasterAgreement(first,second)};
}

export async function exerciseSelectListVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-select-list-reference.json'),'utf8')) as {themes:Record<string,Record<string,string>>;states:Row[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform);const architecture=process.arch,browser=page.context().browser()!.version();
 const rows=reference.states.filter(row=>row.platform===platform&&row.architecture===architecture);assert.equal(rows.length,40,'Complete original visible-list references are required for '+platform+'/'+architecture);
 await page.setViewportSize({width:1280,height:900});const results=[],problems:string[]=[];
 for(const row of rows){
  const config=row.configuration,story='forms-select--disabled';await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story');await waitForCatalogStory(page,story);
  const original=await readFile(resolve(row.image.path));
  assert.equal(createHash('sha256').update(original).digest('hex'),row.image.sha256);
  const state=selectState({mode:'list',label:config.label,options:config.options,multiple:config.multiple,description:config.helper,required:config.required});
  await page.evaluate(async({state,config,tokens,frame})=>{
   document.querySelector<HTMLElement>('main.catalog-frame')!.hidden=true;
   for(const[key,value]of Object.entries(tokens))document.body.style.setProperty(key,value);document.body.style.background='var(--card-background-color)';
   const proof=document.createElement('div');proof.id='list-proof';proof.style.cssText='position:fixed;left:32px;top:32px;padding:16px;display:inline-flex;align-items:flex-start;box-sizing:border-box;background:var(--card-background-color);color:var(--primary-text-color);font:400 14px/1.6 Roboto,Noto,sans-serif;-webkit-font-smoothing:antialiased';
   const host=document.createElement('vyp-ha-select');host.id='visual-list';host.state=state;host.value=config.value;host.style.width=config.width+'px';host.dir=config.dir;host.disabled=config.disabled;proof.append(host);document.body.append(proof);await host.updateComplete;
   const capture=document.createElement('div');capture.id='list-capture';capture.style.cssText=`position:fixed;pointer-events:none;left:${frame.x}px;top:${frame.y}px;width:${frame.width}px;height:${frame.height}px`;document.body.append(capture);
   await document.fonts.load('400 14px Roboto');await document.fonts.load('500 14px Roboto');await document.fonts.ready;
  },{state,config,tokens:reference.themes[row.theme],frame:row.frame});
  const host=page.locator('#visual-list');await page.mouse.move(1100,850);
  if(config.interaction==='hover'){
   if(config.multiple){const control=await host.locator('.choice-mark').nth(1).boundingBox();assert.ok(control);await page.mouse.move(control.x+control.width/2,control.y+control.height/2);}
   else await host.getByRole('radio',{name:'Shopping',exact:true}).hover();
  }
  if(config.interaction==='focus')await page.keyboard.press('Tab');
  await page.evaluate(()=>new Promise<void>((resolve,reject)=>{
   let previous='',stable=0,attempts=0;const root=document.querySelector('#visual-list')!.shadowRoot!;
   const step=()=>{const signature=JSON.stringify([...root.querySelectorAll('*')].map(node=>{const css=getComputedStyle(node),r=node.getBoundingClientRect();return[css.opacity,css.backgroundColor,css.color,r.x,r.y,r.width,r.height];}));stable=signature===previous?stable+1:0;previous=signature;if(stable>=8)resolve();else if(++attempts>240)reject(Error('Visible list did not settle'));else requestAnimationFrame(step);};requestAnimationFrame(step);
  }));
  const actual=await host.evaluate(host=>{
   const root=host.shadowRoot!,frame=document.querySelector('#list-capture')!.getBoundingClientRect(),box=(r:DOMRect):Box=>({x:r.x-frame.x,y:r.y-frame.y,width:r.width,height:r.height});
   const piece=(node:Element|null):Piece|null=>{if(!node)return null;const css=getComputedStyle(node),text=[...node.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent!.trim());let glyph:Box|null=null;if(text){const range=document.createRange();range.selectNodeContents(text);glyph=box(range.getBoundingClientRect());}return{box:box(node.getBoundingClientRect()),glyph,style:Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','border','borderRadius','opacity','outline','outlineOffset','fill'].map(key=>[key,css[key as keyof CSSStyleDeclaration]])) as Record<string,string>};};
   return{host:piece(host)!,caption:piece(root.querySelector('#list-label'))!,helper:piece(root.querySelector('.picker-help')),choices:[...root.querySelectorAll('.choice-row')].map(node=>{const input=node.querySelector('input')!,label=piece(node.querySelector('.choice-copy'))!;return{row:piece(node)!,label,indicator:piece(node.querySelector('.choice-mark'))!,glyph:input.checked?piece(node.querySelector('path,circle')):null,labelGlyph:label.glyph,checked:input.checked,disabled:input.disabled,paintOpacity:getComputedStyle(node).opacity,native:box(input.getBoundingClientRect()),type:input.type};})};
  });
  const local:string[]=[];const near=(a:Box,b:Box,label:string)=>{for(const key of ['x','y','width','height'] as const)if(Math.abs(a[key]-b[key])>.1)local.push(`${label}/${key}: ${a[key]} vs ${b[key]}`);};
  const style=(a:Piece,b:Piece,keys:string[],label:string)=>{for(const key of keys){const x=a.style[key],y=b.style[key];if(key==='outline'&&x.includes(' none ')&&y.includes(' none '))continue;if(x!==y)local.push(`${label}/${key}: ${x} vs ${y}`);}};
  const typography=['fontFamily','fontSize','fontWeight','lineHeight','color'];near(actual.host.box,row.parts.host.box,'host');near(actual.caption.box,row.parts.caption.box,'caption');style(actual.caption,row.parts.caption,typography,'caption');
  if(actual.caption.glyph&&row.parts.caption.glyph)near(actual.caption.glyph,row.parts.caption.glyph,'caption-glyph');
  if(actual.helper&&row.parts.helper){near(actual.helper.box,row.parts.helper.box,'helper');style(actual.helper,row.parts.helper,[...typography,'letterSpacing'],'helper');if(actual.helper.glyph&&row.parts.helper.glyph)near(actual.helper.glyph,row.parts.helper.glyph,'helper-glyph');}else if(actual.helper!==row.parts.helper)local.push('helper presence');
  assert.equal(actual.choices.length,row.parts.choices.length);
  for(let index=0;index<actual.choices.length;index++){
   const a=actual.choices[index],b=row.parts.choices[index],name='choice'+index;
   near(a.row.box,b.row.box,name);near(a.label.box,b.label.box,name+'/label');near(a.indicator.box,b.indicator.box,name+'/indicator');
   if(a.labelGlyph&&b.labelGlyph)near(a.labelGlyph,b.labelGlyph,name+'/label-glyph');if(a.glyph&&b.glyph){near(a.glyph.box,b.glyph.box,name+'/mark-glyph');style(a.glyph,b.glyph,['fill'],name+'/mark-glyph');}else if(a.glyph!==b.glyph)local.push(name+'/mark presence');
   style(a.label,b.label,typography,name+'/label');style(a.indicator,b.indicator,['backgroundColor','border','borderRadius','outline','outlineOffset'],name+'/indicator');
   if(a.paintOpacity!==b.paintOpacity)local.push(name+'/opacity');if(a.checked!==b.checked||a.disabled!==b.disabled)local.push(name+'/native state');
   assert.equal(a.type,config.multiple?'checkbox':'radio');assert.ok(a.native.width>=40&&a.native.height>=(config.multiple?40:44),'The entire choice row is a native target');
   if(index>0){const previous=actual.choices[index-1].native;assert.ok(previous.y+previous.height<=a.native.y,'Adjacent native targets cannot overlap');}
  }
  const path=resolve(output,'ha-select-'+row.theme+'-'+row.name+'.png'),raster=await captureSettledElement(page,'#list-capture',path);
  const {sameBytes,agreement}=await comparePng(page,original,await readFile(path));if(!agreement.accepted)local.push('Original HA raster exceeds selector quantization bounds');
  problems.push(...local.map(problem=>row.theme+'/'+row.name+'/'+problem));results.push({platform,architecture,browser,theme:row.theme,name:row.name,identicalPixels:sameBytes,rasterAgreement:agreement,problems:local,referenceImage:row.image,raster,actual});
 }
 await writeFile(resolve(output,'ha-select-list-parity.json'),JSON.stringify({reference:'docs/evidence/ha-select-list-reference.json',scope:'Explicit visible single and multiple lists; native row targets do not overlap.',selectorRasterTolerance,results,problems},null,2)+'\n');assert.deepEqual(problems,[],'Original HA visible-list geometry and paint');return results;
}
