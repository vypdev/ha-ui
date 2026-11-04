import assert from 'node:assert/strict';
import {navigationIconPaths} from '../../stories/navigation-icons.ts';
import type {Page} from 'playwright';
import type {HaTabs} from '@vypdev/ha-ui/tabs';

/** Read the core actually installed by the selected framework's independent compiled consumer. */
export async function assertBoundNavigationIcons(page:Page,spanish=false){
 const actual=await page.locator('vyp-ha-tabs').evaluate(element=>[...element.shadowRoot!.querySelectorAll<HTMLButtonElement>('[role=tab]')].map(tab=>({name:tab.getAttribute('aria-label'),path:tab.querySelector('path')!.getAttribute('d'),hidden:tab.querySelector<HTMLElement>('[part=label]')!.hidden,iconSize:tab.querySelector('svg')!.getBoundingClientRect().width,decorative:tab.querySelector('svg')!.getAttribute('aria-hidden')})));
 assert.deepEqual(actual,[{name:spanish?'Resumen':'Overview',path:navigationIconPaths.overview,hidden:true,iconSize:24,decorative:'true'},{name:spanish?'Tareas':'Tasks',path:navigationIconPaths.tasks,hidden:false,iconSize:24,decorative:'true'}]);
 return {complexIconData:true,iconOnlyAccessibleName:true,visibleLabel:true,decorative:true};
}
/** Compiled direct DOM/Lit consumer: both semantics and all three local icon presentations. */
export async function exerciseInstalledNavigationIcons(page:Page){
 const results=[];
 for(const kind of ['navigation','panels'] as const)for(const presentation of ['icon-only','icon-and-title','mixed']){
  await page.evaluate(async({kind,presentation,paths})=>{
   const host=document.createElement('vyp-ha-tabs');host.id='installed-icon-proof';
   host.state={kind,label:'Icon sections',selected:'overview',items:['Overview','Tasks','Inventory'].map((label,n)=>({id:['overview','tasks','inventory'][n],label,href:kind==='navigation'?'#icon-'+n:null,disabled:false,iconPath:presentation==='mixed'&&n===1?null:[paths.overview,paths.tasks,paths.inventory][n],showLabel:presentation!=='icon-only'&&!(presentation==='mixed'&&n===0)}))};
   host.addEventListener('ha-selection-request',event=>{event.preventDefault();host.dataset.requests=String(Number(host.dataset.requests??0)+1);host.state={...host.state,selected:event.detail.id};});document.body.append(host);await host.updateComplete;
  },{kind,presentation,paths:navigationIconPaths});
  try{
   const host=page.locator('#installed-icon-proof'),role=kind==='navigation'?'link':'tab';
   await host.getByRole(role,{name:'Inventory',exact:true}).click();assert.equal(await host.getAttribute('data-requests'),'1');
   assert.equal(await host.getByRole(role,{name:'Inventory',exact:true}).getAttribute(kind==='navigation'?'aria-current':'aria-selected'),kind==='navigation'?'page':'true');
   await host.getByRole(role,{name:'Overview',exact:true}).focus();await page.keyboard.press(kind==='navigation'?'Tab':'End');
   const expected=kind==='navigation'?'Tasks':'Inventory';assert.equal(await host.getByRole(role,{name:expected,exact:true}).evaluate(el=>el===(el.getRootNode() as ShadowRoot).activeElement),true);
   await host.evaluate(async element=>{const h=element as HaTabs;h.state={...h.state,items:h.state.items.map((item,n)=>({...item,label:['Resumen','Tareas','Inventario'][n]}))};await h.updateComplete;});
   await host.getByRole(role,{name:'Inventario',exact:true}).click();assert.equal(await host.getAttribute('data-requests'),'2');
   const icons=await host.locator('svg').evaluateAll(elements=>elements.map(el=>({hidden:el.getAttribute('aria-hidden'),viewBox:el.getAttribute('viewBox'),namespace:el.namespaceURI})));
   assert.equal(icons.length,presentation==='mixed'?2:3);for(const icon of icons)assert.deepEqual(icon,{hidden:'true',viewBox:'0 0 24 24',namespace:'http://www.w3.org/2000/svg'});
   results.push({kind,presentation,nativeKeyboard:true,exactlyOneRequest:true,spanishNames:true,decorativeLocalSvg:true});
  }finally{await page.locator('#installed-icon-proof').evaluate(el=>el.remove());}
 }
 return results;
}
