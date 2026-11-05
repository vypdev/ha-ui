/** @typedef {{width:number,height:number,pixels:Uint8Array}} Raster */
/** Selector-only quantization bounds; existing exact visual gates remain exact. */
export const selectorRasterTolerance=Object.freeze({peakChannelDelta:6,meanChannelDelta:.01,changedFraction:.01});
/** @param {unknown} raw @returns {raw is Raster} */
function raster(raw){
 if(typeof raw!=='object'||raw===null||Array.isArray(raw))return false;
 const value=/** @type {Raster} */(raw);
 return Number.isSafeInteger(value.width)&&value.width>0&&Number.isSafeInteger(value.height)&&value.height>0
  &&Number.isSafeInteger(value.width*value.height)&&value.pixels instanceof Uint8Array&&value.pixels.length===value.width*value.height*4;
}
/** Compare every unmodified RGBA pixel, with no masking, resampling, blur or alpha substitution.
 * @param {Raster} reference @param {Raster} actual
 */
export function rasterAgreement(reference,actual){
 if(!raster(reference)||!raster(actual))throw new TypeError('invalid_raster');
 if(reference.width!==actual.width||reference.height!==actual.height)throw new RangeError('raster_dimensions');
 const pixels=reference.width*reference.height;let changedPixels=0,peakChannelDelta=0,totalChannelDelta=0,alphaChanges=0;
 for(let index=0;index<reference.pixels.length;index+=4){
  let changed=false;
  for(let channel=0;channel<4;channel++){
   const delta=Math.abs(reference.pixels[index+channel]-actual.pixels[index+channel]);
   if(delta!==0){changed=true;peakChannelDelta=Math.max(peakChannelDelta,delta);if(channel===3)alphaChanges++;else totalChannelDelta+=delta;}
  }
  if(changed)changedPixels++;
 }
 const meanChannelDelta=totalChannelDelta/(pixels*3),changedFraction=changedPixels/pixels;
 return Object.freeze({pixels,changedPixels,peakChannelDelta,meanChannelDelta,changedFraction,alphaChanges,exact:changedPixels===0,
  accepted:alphaChanges===0&&peakChannelDelta<=selectorRasterTolerance.peakChannelDelta&&meanChannelDelta<=selectorRasterTolerance.meanChannelDelta&&changedFraction<=selectorRasterTolerance.changedFraction});
}
