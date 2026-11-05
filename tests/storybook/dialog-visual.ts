import assert from 'node:assert/strict';
import {readOriginalRaster} from './reference-images.ts';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
import {dialogState,type DialogKind,type DialogWidth} from '@vypdev/ha-ui/dialog-contracts';
import type {HaDialog} from '@vypdev/ha-ui/dialog';
import {selectorRasterTolerance} from '../../tooling/raster.mjs';
import {waitForCatalogStory} from './lifecycle.ts';
import {compareVisualPng} from './raster-comparison.ts';
import {captureSettledElement} from './screenshot.ts';

type Box={x:number;y:number;width:number;height:number};
type Piece={box:Box;glyph:Box|null;style:Record<string,string>};
type Configuration={name:string;viewport:{width:number;height:number};type:DialogKind;width:DialogWidth;dir:string;subtitle?:string;interaction?:string;pending?:boolean;disabled?:boolean;noFooter?:boolean;long?:boolean};
type Row={platform:string;architecture:string;theme:string;config:Configuration;scrollTop:number;parts:Record<string,Piece|null>;image:{path:string;sha256:string}};

export async function exerciseDialogVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-dialog-reference.json'),'utf8')) as {themes:Record<string,Record<string,string>>;states:Row[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform);
 const architecture=process.arch,browser=page.context().browser()!.version(),rows=reference.states.filter(row=>row.platform===platform&&row.architecture===architecture);
 assert.equal(rows.length,32,'Complete original dialog references are required for '+platform+'/'+architecture);
 const results=[],problems:string[]=[];
 for(const row of rows){
  const config=row.config,story='overlays-dialog--default';await page.setViewportSize(config.viewport);
  await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story');await waitForCatalogStory(page,story);
  const original=await readOriginalRaster(row.image);
  const state=dialogState({title:'Delete task?',subtitle:config.subtitle,description:'Remove the reminder to check the kitchen supplies?',kind:config.type,width:config.width,cancelLabel:config.noFooter?'':'Cancel',confirmLabel:config.noFooter?'':'Delete',confirmTone:'danger',pending:config.pending,confirmDisabled:config.disabled});
  await page.evaluate(async({tokens,config,state})=>{
   document.querySelector<HTMLElement>('main.catalog-frame')!.hidden=true;
   document.body.style.cssText='margin:0;font:400 14px/1.6 Roboto,Noto,sans-serif;-webkit-font-smoothing:antialiased;';
   for(const[k,v]of Object.entries(tokens))document.body.style.setProperty(k,v);
   document.body.style.background='var(--primary-background-color,var(--card-background-color))';
   const proof=document.createElement('main');proof.id='dialog-proof';proof.style.cssText='box-sizing:border-box;width:100vw;height:100vh;padding:24px;color:var(--primary-text-color);';
   const heading=document.createElement('h1');heading.textContent='Household tasks';heading.style.font='500 20px/1.2 Roboto,Noto,sans-serif';
   const opener=document.createElement('button');opener.id='opener';opener.textContent='Open dialog';
   const dialog=document.createElement('vyp-ha-dialog') as HaDialog;dialog.id='candidate-dialog';dialog.state=state;dialog.dir=config.dir;
   if(config.long)for(let i=0;i<24;i++){const line=document.createElement('p');line.textContent='Reminder '+(i+1)+': Check shared household supplies.';dialog.append(line);}
   proof.append(heading,opener,dialog);document.body.append(proof);
   opener.addEventListener('click',()=>{dialog.open=true;});await dialog.updateComplete;
   await Promise.all([document.fonts.load('400 14px Roboto'),document.fonts.load('500 14px Roboto')]);await document.fonts.ready;
  },{tokens:reference.themes[row.theme],config,state});
  const opener=page.getByRole('button',{name:'Open dialog',exact:true});
  if(config.interaction==='focus')await opener.press('Enter');else await opener.click();
  const host=page.locator('#candidate-dialog'),modal=host.getByRole(config.type==='alert'?'alertdialog':'dialog',{name:'Delete task?',exact:true}),close=modal.getByRole('button',{name:'Close',exact:true});
  await modal.waitFor();await page.mouse.move(config.viewport.width-2,config.viewport.height-2);
  if(config.interaction==='hover')await close.hover();
  if(config.interaction==='focus'){
   const focused=()=>close.evaluate(button=>button.matches(':focus-visible'));
   for(let key=0;key<6&&!await focused();key++)await page.keyboard.press('Tab');
   assert.equal(await focused(),true);
  }
  const body=host.locator('[part=body]');
  if(config.interaction==='scroll'){
   await body.hover();await page.mouse.wheel(0,96);
   await page.waitForFunction(()=>document.querySelector('#candidate-dialog')!.shadowRoot!.querySelector('.body')!.scrollTop===96);
   await page.mouse.move(config.viewport.width-2,config.viewport.height-2);
  }
  if(config.interaction==='bottom')await body.evaluate(element=>{element.scrollTop=element.scrollHeight;});
  const actual=await host.evaluate(async element=>{
   const root=element.shadowRoot!,dialog=root.querySelector('dialog')!,body=root.querySelector<HTMLElement>('.body')!;
   const close=root.querySelector('.close')!.shadowRoot!,cancel=root.querySelector('[data-action=cancel]')?.shadowRoot,confirm=root.querySelector('[data-action=confirm]')?.shadowRoot;
   const keys=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','borderRadius','border','boxShadow','margin','padding','gap','overflow','backdropFilter','outline','outlineOffset','display','maxHeight','minHeight','opacity'];
   const piece=(node:Element|null|undefined,pseudo?:string):Piece|null=>{
    if(!node||node.getBoundingClientRect().height<=0)return null;
    const css=getComputedStyle(node,pseudo),text=[...node.childNodes].find(item=>item.nodeType===Node.TEXT_NODE&&item.textContent!.trim());
    let glyph:Box|null=null;if(text){const range=document.createRange();range.selectNodeContents(text);glyph=range.getBoundingClientRect().toJSON();}
    return{box:node.getBoundingClientRect().toJSON(),glyph,style:Object.fromEntries(keys.map(key=>[key,css[key as keyof CSSStyleDeclaration]])) as Record<string,string>};
   };
   const snapshot=()=>({scrollTop:body.scrollTop,modal:dialog.matches(':modal'),parts:{
    surface:piece(dialog),backdrop:piece(dialog,'::backdrop'),header:piece(root.querySelector('header')),close:piece(close.querySelector('.surface')),
    closeGlyph:piece(root.querySelector('.close path')),title:piece(root.querySelector('.title')),subtitle:piece(root.querySelector('.subtitle')),body:piece(body),description:piece(root.querySelector('.description')),
    footer:piece(root.querySelector('footer')),cancel:piece(cancel?.querySelector('.surface')),confirm:piece(confirm?.querySelector('.surface')),
    top:piece(root.querySelector('.fade-top')),bottom:piece(root.querySelector('.fade-bottom')),
   },targets:{close:piece(close.querySelector('button')),cancel:piece(cancel?.querySelector('button')),confirm:piece(confirm?.querySelector('button'))}});
   await new Promise<void>((resolve,reject)=>{
    let previous='',stable=0,attempts=0;const step=()=>{const next=JSON.stringify(snapshot());stable=next===previous?stable+1:0;previous=next;
     if(stable>=8)resolve();else if(++attempts>240)reject(Error('Visible dialog did not settle'));else requestAnimationFrame(step);};requestAnimationFrame(step);
   });
   return snapshot();
  });
  assert.equal(actual.modal,true);
  for(const target of Object.values(actual.targets))if(target!==null)assert.ok(target.box.width>=44&&target.box.height>=44,'Each dialog command has a native target of at least 44px');
  const local:string[]=[];
  const near=(a:Box,b:Box,label:string)=>{for(const key of ['x','y','width','height'] as const)if(Math.abs(a[key]-b[key])>.1)local.push(label+'/'+key+': '+a[key]+' vs '+b[key]);};
  const style=(a:Piece,b:Piece,keys:string[],label:string)=>{for(const key of keys){const x=a.style[key],y=b.style[key];if(key.startsWith('outline')&&a.style.outline.includes(' none ')&&b.style.outline.includes(' none '))continue;if(x!==y)local.push(label+'/'+key+': '+x+' vs '+y);}};
  const typography=['fontFamily','fontSize','fontWeight','lineHeight','color'];
  const paint:Record<string,string[]>={surface:[...typography,'backgroundColor','borderRadius','boxShadow','padding','backdropFilter'],backdrop:['backgroundColor','backdropFilter'],header:[],close:['color','outline','outlineOffset'],closeGlyph:['color'],title:typography,subtitle:typography,body:['padding'],description:typography,footer:[],cancel:['color','backgroundColor','borderRadius','border'],confirm:['color','backgroundColor','borderRadius','border'],top:['opacity'],bottom:['opacity']};
  for(const [name,measured] of Object.entries(actual.parts)){
   const source=row.parts[name];if(!measured||!source){if(measured!==source)local.push(name+'/presence');continue;}
   if(name==='title'||name==='subtitle'||name==='description'){
    if(measured.glyph&&source.glyph)near(measured.glyph,source.glyph,name+'/glyph');
    else if(measured.glyph!==source.glyph)local.push(name+'/glyph presence');
   }else near(measured.box,source.box,name);
   style(measured,source,paint[name],name);
  }
  if(Math.abs(actual.scrollTop-row.scrollTop)>1)local.push('scrollTop: '+actual.scrollTop+' vs '+row.scrollTop);
  const path=resolve(output,'ha-dialog-'+row.theme+'-'+config.name+'.png'),raster=await captureSettledElement(page,'#dialog-proof',path);
  const {sameBytes,agreement}=await compareVisualPng(page,original,await readFile(path));if(!agreement.accepted)local.push('Original HA dialog raster exceeds approved quantization bounds');
  problems.push(...local.map(problem=>row.theme+'/'+config.name+'/'+problem));results.push({platform,architecture,browser,theme:row.theme,name:config.name,identicalPixels:sameBytes,rasterAgreement:agreement,problems:local,referenceImage:row.image,raster,actual});
 }
 await writeFile(resolve(output,'ha-dialog-parity.json'),JSON.stringify({reference:'docs/evidence/ha-dialog-reference.json',scope:'Original HA dialogs compared to the compiled native renderer. Native command hit targets are measured separately from paint.',tolerance:selectorRasterTolerance,results,problems},null,2)+'\n');
 assert.deepEqual(problems,[],'Original HA dialog geometry and paint');return results;
}
