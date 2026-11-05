import {expect,test} from 'vitest';
import {rasterAgreement,selectorRasterTolerance} from '../tooling/raster.mjs';
const image=(pixels=1000)=>({width:pixels,height:1,pixels:new Uint8Array(pixels*4).fill(255)});
test('exact RGBA agreement is immutable and retains both source buffers',()=>{
 const a=image(),b=image();expect(rasterAgreement(a,b)).toEqual({pixels:1000,changedPixels:0,peakChannelDelta:0,meanChannelDelta:0,changedFraction:0,alphaChanges:0,exact:true,accepted:true});
 expect(Object.isFrozen(rasterAgreement(a,b))).toBe(true);expect(Object.isFrozen(selectorRasterTolerance)).toBe(true);expect(a.pixels.every(value=>value===255)).toBe(true);expect(b.pixels).toEqual(a.pixels);
});
test('sparse low-level subpixel quantization is bounded in peak, mean and pixel count',()=>{
 const a=image(),b=image();b.pixels[0]-=6;b.pixels[1]-=6;b.pixels[2]-=6;const result=rasterAgreement(a,b);
 expect(result.accepted).toBe(true);expect(result.exact).toBe(false);expect(result.changedPixels).toBe(1);expect(result.meanChannelDelta).toBe(.006);expect(result.peakChannelDelta).toBe(6);expect(rasterAgreement(b,a)).toEqual(result);
});
test('one excessive channel, widespread small differences and a changed alpha each fail',()=>{
 const a=image(),peak=image();peak.pixels[0]-=7;expect(rasterAgreement(a,peak).accepted).toBe(false);
 const small=image(100),many=image(100);many.pixels[0]--;many.pixels[4]--;expect(rasterAgreement(small,many).meanChannelDelta).toBeLessThan(.01);expect(rasterAgreement(small,many).accepted).toBe(false);
 const mean=image(100);mean.pixels[0]-=3;mean.pixels[1]-=3;mean.pixels[2]-=3;expect(rasterAgreement(small,mean).changedFraction).toBe(.01);expect(rasterAgreement(small,mean).accepted).toBe(false);
 const alpha=image();alpha.pixels[3]--;expect(rasterAgreement(a,alpha).alphaChanges).toBe(1);expect(rasterAgreement(a,alpha).accepted).toBe(false);
});
test.each([null,[],{}, {width:0,height:1,pixels:new Uint8Array()}, {width:1.5,height:1,pixels:new Uint8Array(4)},
 {width:1,height:0,pixels:new Uint8Array()}, {width:1,height:1.5,pixels:new Uint8Array(4)},
 {width:Number.MAX_SAFE_INTEGER,height:2,pixels:new Uint8Array()}, {width:1,height:1,pixels:[0,0,0,0]},
 {width:1,height:1,pixels:new Uint8Array(3)}])('rejects malformed raster metadata or missing RGBA bytes: %#',value=>{
 expect(()=>rasterAgreement(value,image())).toThrow('invalid_raster');expect(()=>rasterAgreement(image(),value)).toThrow('invalid_raster');
});
test('equal byte lengths cannot conceal changed width or height',()=>{
 const a={width:1,height:2,pixels:new Uint8Array(8)},b={width:2,height:1,pixels:new Uint8Array(8)};
 expect(()=>rasterAgreement(a,b)).toThrow('raster_dimensions');expect(()=>rasterAgreement(image(2),{width:2,height:2,pixels:new Uint8Array(16)})).toThrow('raster_dimensions');
});
