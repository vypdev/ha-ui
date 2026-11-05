import {captureSettledElement} from './screenshot.ts';
import {waitForCatalogStory} from './lifecycle.ts';
import {textFieldState} from '@vypdev/ha-ui/field-contracts';
import type {HaTextField} from '@vypdev/ha-ui/field';
import assert from 'node:assert/strict';
import {readOriginalRaster} from './reference-images.ts';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {Page} from 'playwright';
type Box={x:number;y:number;width:number;height:number};
type Piece={box:Box;style:Record<string,string>};
type Configuration={label:string;value:string;width:number;disabled:boolean;readOnly:boolean;required:boolean;hint:string;invalid:boolean;validationMessage:string;placeholder:string;state:string};
type Row={platform:string;theme:string;name:string;configuration:Configuration;host:Piece;base:Piece;input:Piece&{focusVisible:boolean};label:Piece&{text:Box};hint:Piece&{content:string;contentStyle:Record<string,string>};underline:Record<string,string>;image:{path:string;sha256:string}};
const properties=['fontFamily','fontSize','fontWeight','lineHeight','padding','backgroundColor','color','borderTopWidth','borderRadius','opacity','margin','height','minHeight'] as const;
function luminance(value:string){const rgb=value.match(/[\d.]+/gu)!.slice(0,3).map(Number).map(channel=>{const scaled=channel/255;return scaled<=.04045?scaled/12.92:((scaled+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function contrast(foreground:string,background:string){const a=luminance(foreground),b=luminance(background);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
/** Original HA tokens/pixels and accessible demonstration palettes are verified separately. */
export async function exerciseFieldVisual(page:Page,origin:string,output:string){
 const reference=JSON.parse(await readFile(resolve('docs/evidence/ha-field-reference.json'),'utf8')) as {themes:Record<string,Record<string,string>>;states:Row[]};
 const platform=await page.evaluate(()=>/Linux/u.test(navigator.userAgent)?'linux':/Mac OS X/u.test(navigator.userAgent)?'macos':null);assert.ok(platform,'A measured platform is required');const rows=reference.states.filter(row=>row.platform===platform);assert.equal(rows.length,44);const results=[],palettes=[];await page.setViewportSize({width:1280,height:900});
 await page.goto(origin+'/ha-ui/iframe.html?id=forms-text-field--default&viewMode=story');await waitForCatalogStory(page,'forms-text-field--default');
 await page.evaluate(async()=>{const field=document.createElement('vyp-ha-field');field.id='motion-field';document.body.append(field);await field.updateComplete;});
 const durations=()=>page.locator('#motion-field').evaluate(host=>{const root=host.shadowRoot!,control=root.querySelector('[part=control]')!;return[getComputedStyle(control).transitionDuration,getComputedStyle(control,'::after').transitionDuration,getComputedStyle(root.querySelector('label')!).transitionDuration].flatMap(value=>value.split(',').map(part=>parseFloat(part)));});
 await page.emulateMedia({reducedMotion:'no-preference'});const ordinary=await durations();assert.ok(ordinary.every(value=>value===.25));
 await page.emulateMedia({reducedMotion:'reduce'});const reduced=await durations();assert.ok(reduced.every(value=>value<=.001));
 await page.locator('#motion-field').evaluate(host=>(host as HTMLElement).style.setProperty('--vyp-ha-motion-duration','0ms'));assert.ok((await durations()).every(value=>value===0));
 const motion={ordinary,reduced,explicitZeroPreserved:true};
 for(const theme of ['light','dark']){
  const story='forms-text-field--focused-optional';await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=theme:'+theme+';motion:reduced');await waitForCatalogStory(page,story);
  const state=textFieldState({label:'Palette proof',placeholder:'Example: kitchen',description:'Choose a task name.'});
  await page.evaluate(async state=>{const host=document.createElement('vyp-ha-field');host.id='palette-field';host.state=state;host.style.width='320px';document.querySelector('main.catalog-frame')!.append(host);await host.updateComplete;const after=document.createElement('button');after.id='after-palette';after.textContent='After';after.style.cssText='position:fixed;left:1000px;top:800px';document.body.append(after);},state);
  const paletteInput=page.locator('#palette-field').getByRole('textbox',{name:'Palette proof',exact:true});
  for(const error of [false,true]){
   await page.locator('#palette-field').evaluate(async(host,error)=>{const field=host as HaTextField;field.state={...field.state,error:error?'Use another task name.':''};await field.updateComplete;},error);
   for(const mode of ['resting','hover','focus','focus-hover']){
    await page.locator('#after-palette').focus();await page.mouse.move(1100,800);if(mode.includes('focus'))await page.keyboard.press('Shift+Tab');if(mode.includes('hover'))await paletteInput.hover();
    const colors=await page.locator('#palette-field').evaluate(async host=>{const label=host.shadowRoot!.querySelector('label')!,control=host.shadowRoot!.querySelector('[part=control]')!,input=host.shadowRoot!.querySelector('input')!,error=host.shadowRoot!.querySelector('#error');getComputedStyle(control).backgroundColor;await Promise.all([...label.getAnimations(),...control.getAnimations()].map(animation=>animation.finished));return{label:getComputedStyle(label).color,input:getComputedStyle(input).color,placeholder:getComputedStyle(input,'::placeholder').color,surface:getComputedStyle(control).backgroundColor,error:error?getComputedStyle(error).color:null,background:getComputedStyle(document.querySelector('main.catalog-frame')!).backgroundColor};});
    const ratios={label:contrast(colors.label,colors.surface),input:contrast(colors.input,colors.surface),placeholder:contrast(colors.placeholder,colors.surface),error:colors.error?contrast(colors.error,colors.background):null};for(const[key,value]of Object.entries(ratios))if(value!==null)assert.ok(value>=4.5,`${theme}/${mode}/${error?'error':'normal'}/${key} contrast: ${value}`);palettes.push({theme,mode,error,colors,ratios});
   }
  }
 }
 for(const row of rows){
  const story='forms-text-field--default';await page.goto(origin+'/ha-ui/iframe.html?id='+story+'&viewMode=story&globals=theme:'+row.theme+';motion:reduced');await waitForCatalogStory(page,story);await page.evaluate(()=>document.fonts.load('400 14px Roboto'));
  const original=await readOriginalRaster(row.image);const config=row.configuration,state=textFieldState({label:config.label,description:config.hint,placeholder:config.placeholder,required:config.required,readOnly:config.readOnly,error:config.invalid?config.validationMessage:''});
  await page.evaluate(async({config,state,tokens})=>{
   const proof=document.createElement('div');proof.id='field-proof';proof.style.cssText='position:fixed;left:32px;top:32px;padding:8px;display:inline-flex;z-index:9999;-webkit-font-smoothing:antialiased';for(const[key,value]of Object.entries(tokens))proof.style.setProperty(key,value);proof.style.background='var(--card-background-color)';proof.style.color='var(--primary-text-color)';
   const field=document.createElement('vyp-ha-field');field.id='visual-field';field.state=state;field.value=config.value;field.disabled=config.disabled;field.style.width=config.width+'px';proof.append(field);document.body.append(proof);await field.updateComplete;const after=document.createElement('button');after.id='after-field';after.textContent='After';after.style.cssText='position:fixed;left:1000px;top:800px';document.body.append(after);
  },{config,state,tokens:reference.themes[row.theme]});
  const input=page.locator('#visual-field').getByRole('textbox',{name:config.label,exact:true});if(config.state==='hover')await input.hover();else await page.mouse.move(1100,800);if(config.state==='focus'){await page.locator('#after-field').focus();await page.keyboard.press('Shift+Tab');}
  await page.waitForFunction(expected=>{const host=document.querySelector('#visual-field')!,control=host.shadowRoot!.querySelector('[part=control]')!,label=host.shadowRoot!.querySelector('label')!;return getComputedStyle(control).backgroundColor===expected.background&&getComputedStyle(label).color===expected.color&&getComputedStyle(label).fontSize===expected.font&&getComputedStyle(control,'::after').height===expected.line;},{background:row.base.style.backgroundColor,color:row.label.style.color,font:row.label.style.fontSize,line:row.underline.height});
  const actual=await page.locator('#visual-field').evaluate((host,properties)=>{
   const field=host as HaTextField,root=host.shadowRoot!,input=root.querySelector('input')!,label=root.querySelector('label')!,control=root.querySelector('[part=control]')!,hint=root.querySelector('.hint')!,text=root.querySelector(field.state.error?'#error':'#help'),origin=document.querySelector('#field-proof')!.getBoundingClientRect();
   const box=(element:Element):Box=>{const r=element.getBoundingClientRect();return{x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height};},style=(element:Element,pseudo?:string)=>{const css=getComputedStyle(element,pseudo);return Object.fromEntries(properties.map(key=>[key,css[key]]));};const range=document.createRange();range.selectNodeContents([...label.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent!.trim().length>0)!);const r=range.getBoundingClientRect();
   return{host:{box:box(host)},base:{box:box(control),style:style(control)},input:{box:box(input),style:style(input),value:input.value,disabled:input.disabled,readOnly:input.readOnly,required:input.required,focusVisible:input.matches(':focus-visible')},label:{box:box(label),text:{x:r.x-origin.x,y:r.y-origin.y,width:r.width,height:r.height},style:style(label)},hint:{box:box(hint),style:style(hint),content:text?.textContent??'',contentColor:text?getComputedStyle(text).color:null},underline:style(control,'::after')};
  },properties);
  const equal=(part:'base'|'input'|'label'|'hint',keys:string[])=>{for(const key of keys)assert.equal(actual[part].style[key],row[part].style[key],`${row.theme}/${row.name}/${part}/${key}`);};
  equal('base',['fontFamily','fontSize','fontWeight','lineHeight','padding','backgroundColor','borderTopWidth','borderRadius','opacity']);equal('input',['fontFamily','fontSize','fontWeight','lineHeight','padding','color','borderTopWidth','borderRadius']);equal('label',['fontFamily','fontSize','fontWeight','lineHeight','padding','color','opacity','margin']);equal('hint',['fontFamily','fontSize','fontWeight','lineHeight','minHeight','height','margin','color']);for(const key of ['height','backgroundColor'])assert.equal(actual.underline[key],row.underline[key]);
  const near=(a:Box,b:Box)=>{for(const key of ['x','y','width','height'] as const)assert.ok(Math.abs(a[key]-b[key])<(key==='y'?.1:1),`${row.theme}/${row.name}/${key}: ${a[key]} vs ${b[key]}`);};for(const key of ['host','base','input','label','hint'] as const)near(actual[key].box,row[key].box);near(actual.label.text,row.label.text);
  assert.equal(actual.input.value,config.value);assert.equal(actual.input.disabled,config.disabled);assert.equal(actual.input.readOnly,config.readOnly);assert.equal(actual.input.required,config.required);assert.equal(actual.input.focusVisible,row.input.focusVisible);assert.equal(actual.hint.content,row.hint.content);if(config.hint||config.invalid)assert.equal(actual.hint.contentColor,row.hint.contentStyle.color);
  const raster=await captureSettledElement(page,'#field-proof',resolve(output,'ha-field-'+row.theme+'-'+row.name+'.png'));assert.equal(raster.sha256,row.image.sha256,`${row.theme}/${row.name} original HA pixels`);results.push({platform,theme:row.theme,name:row.name,geometryMatch:true,identicalPixels:true,referenceImage:row.image,raster});
 }
 await writeFile(resolve(output,'ha-field-parity.json'),JSON.stringify({reference:'docs/evidence/ha-field-reference.json',scope:'Exact configured original HA tokens and one required marker matching the live application. Accessible demonstration palettes are separate; full-library/application acceptance remains incomplete.',motion,palettes,results},null,2)+'\n');return results;
}
