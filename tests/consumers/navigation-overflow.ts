import assert from 'node:assert/strict';
import type {Page} from 'playwright';
import type {HaTabs} from '@vypdev/ha-ui/tabs';
/** Real mouse/keyboard input against the installed archive, independent of source-browser events. */
export async function exerciseInstalledNavigationOverflow(page:Page){
 const results=[];
 for(const kind of ['navigation','panels'] as const)for(const rtl of [false,true]){
  await page.evaluate(async({kind,rtl})=>{
   const host=document.createElement('vyp-ha-tabs');host.id='installed-overflow';host.dir=rtl?'rtl':'ltr';host.style.cssText='position:fixed;left:0;top:0;width:240px;z-index:9999;--vyp-ha-motion-duration:0ms';
   host.state={kind,label:'Sections',selected:'item-0',items:['Overview','Tasks','Inventory','Family','Settings','Calendar','Shopping','Rewards'].map((label,n)=>({id:'item-'+n,label,disabled:false,href:kind==='navigation'?'#'+n:null}))};
   host.addEventListener('ha-selection-request',event=>{event.preventDefault();host.dataset.requests=String(Number(host.dataset.requests??0)+1);});document.body.append(host);await host.updateComplete;
  },{kind,rtl});
  const host=page.locator('#installed-overflow'),bar=host.locator('.bar'),role=kind==='navigation'?'link':'tab';
  try{
   await host.getByRole('button',{name:'Scroll to end',exact:true}).waitFor();
   await page.mouse.move(rtl?170:70,28);await page.mouse.down();await page.mouse.move(rtl?220:20,28,{steps:5});await page.mouse.up();
   assert.ok(Math.abs(await bar.evaluate(el=>(el as HTMLElement).scrollLeft))>=49,'Real mouse panning must cross the measured threshold');assert.equal(await host.getAttribute('data-requests'),null,'The native drag click must be suppressed');
   await host.getByRole(role,{name:'Overview',exact:true}).click();assert.equal(await host.getAttribute('data-requests'),'1');
   await host.getByRole(role,{name:'Overview',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await host.getAttribute('data-requests'),'2');
   assert.equal(await host.evaluate(el=>(el as HaTabs).state.selected),'item-0');
   results.push({kind,rtl,realMousePan:true,nativeDragClickSuppressed:true,nextPointerAndKeyboardActivate:true,selectionControlled:true});
  }finally{await host.evaluate(el=>el.remove());}
 }
 return results;
}
