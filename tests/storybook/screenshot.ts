import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import type {Page} from 'playwright';
/** Wait for real raster agreement; preserve frames and never synthesize or edit the image. */
export async function captureSettledElement(page:Page,selector:string,path:string){
 const clip=await page.locator(selector).boundingBox();assert.ok(clip);let previous:Buffer|undefined;
 for(let attempt=0;attempt<6;attempt++){
  const bytes=await page.screenshot({clip,animations:'disabled',path:path.replace(/\.png$/u,'.frame-'+attempt+'.png')});
  if(attempt>=2&&previous!.equals(bytes)){await writeFile(path,bytes);return {frames:attempt+1,twoConsecutiveEqual:true,sha256:createHash('sha256').update(bytes).digest('hex')};}
  previous=bytes;await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
 }
 throw Error('Component raster did not settle: '+selector);
}
