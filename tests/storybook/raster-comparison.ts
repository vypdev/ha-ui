import assert from 'node:assert/strict';
import type {Page} from 'playwright';
import {rasterAgreement} from '../../tooling/raster.mjs';

export async function compareVisualPng(page:Page,original:Buffer,candidate:Buffer){
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
