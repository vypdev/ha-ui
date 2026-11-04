import assert from 'node:assert/strict';
import type {Page} from 'playwright';
/** Wait for automatic audits to finish before starting the independent full-rule DOM audit. */
export async function waitForCatalogStory(page:Pick<Page,'waitForFunction'|'evaluate'>,storyId:string,afterRevision=-1){
 await page.waitForFunction(({id,afterRevision})=>{const raw=document.documentElement.dataset.haUiCompletion;if(raw===undefined)return false;const result=JSON.parse(raw);return result.storyId===id&&Number.isSafeInteger(result.revision)&&result.revision>afterRevision;},{id:storyId,afterRevision});
 const result=await page.evaluate(()=>JSON.parse(document.documentElement.dataset.haUiCompletion!)) as {storyId:string;status:string;revision:number;reports:{type:string;status:string}[]};
 assert.equal(result.status,'success','Storybook automatic completion: '+storyId);const a11y=result.reports.filter(report=>report.type==='a11y');assert.ok(a11y.length>0,'A real automatic accessibility report is required: '+storyId);assert.ok(a11y.every(report=>report.status==='passed'),'Every automatic accessibility report must pass: '+storyId);
 return result;
}
