import assert from 'node:assert/strict';
import {join} from 'node:path';
import type {Page} from 'playwright';
import type {HaGrid,HaRow} from '@vypdev/ha-ui/layout';

export async function exerciseFrameworkLayout(page:Page,root:string,framework:string){
 const host=page.locator('#bound-layout'),row=host.locator('vyp-ha-row');
 const action=row.getByRole('button',{name:'Review list row',exact:true});
 await host.getByRole('region',{name:'Household layout',exact:true}).waitFor();
 await row.getByRole('listitem').getByText('Inspect supplies',{exact:true}).waitFor();
 await row.getByText('Shopping list',{exact:true}).waitFor();
 assert.equal(await host.getAttribute('state'),null);assert.equal(await row.getAttribute('state'),null);
 await host.screenshot({path:join(root,'test-results','packed-'+framework+'-layout.png')});
 await action.press('Enter');
 await host.getByRole('region',{name:'Reviewed layout',exact:true}).waitFor();
 await row.getByText('Reviewed supplies',{exact:true}).waitFor();
 assert.equal(await action.evaluate(button=>button===document.activeElement),true);
 const surface=host.locator('[part=grid]');
 assert.equal(await surface.evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').length),2);
 await host.evaluate(element=>{(element as HTMLElement).style.width='300px';});
 assert.equal(await surface.evaluate(element=>getComputedStyle(element).gridTemplateColumns),'300px');
 assert.equal(await action.evaluate(button=>button===document.activeElement),true);
 return{namedRegion:true,listItem:true,projection:true,keyboardAction:true,controlledResize:true,focusRetained:true};
}

export async function exerciseInstalledLayout(page:Page){
 const id='packed-layout-fixture';
 await page.evaluate(async id=>{
  const grid=document.createElement('vyp-ha-grid') as HaGrid,list=document.createElement('div'),row=document.createElement('vyp-ha-row') as HaRow;
  const first=document.createElement('button'),trailing=document.createElement('button');
  grid.id=id;grid.style.width='480px';grid.state={columns:3,minColumnWidth:150,label:'Installed layout',square:false};
  list.setAttribute('role','list');row.state={label:'Check kitchen supplies',description:'Review shopping.'};
  first.textContent='First grid item';trailing.textContent='Review installed row';trailing.slot='trailing';
  trailing.addEventListener('click',()=>{row.state={label:'Reviewed kitchen supplies',description:''};});
  row.append(trailing);list.append(row);grid.append(first,list);document.body.append(grid);
  await Promise.all([grid.updateComplete,row.updateComplete]);
 },id);
 const grid=page.locator('#'+id),row=grid.locator('vyp-ha-row'),surface=grid.locator('[part=grid]');
 const first=grid.getByRole('button',{name:'First grid item',exact:true}),action=grid.getByRole('button',{name:'Review installed row',exact:true});
 try{
  await grid.getByRole('region',{name:'Installed layout',exact:true}).waitFor();
  assert.equal(await surface.evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').length),3);
  await first.focus();await page.keyboard.press('Tab');
  assert.equal(await action.evaluate(button=>button===document.activeElement),true);
  await grid.evaluate(element=>{(element as HTMLElement).style.width='300px';});
  assert.equal(await surface.evaluate(element=>getComputedStyle(element).gridTemplateColumns),'300px');
  assert.equal(await action.evaluate(button=>button===document.activeElement),true);
  await page.keyboard.press('Enter');await row.getByText('Reviewed kitchen supplies',{exact:true}).waitFor();
  assert.equal(await action.evaluate(button=>button===document.activeElement),true);
  assert.equal(await row.getByRole('listitem').count(),1);assert.equal(await row.locator('[part=description]').count(),0);
  return{semanticRow:true,nativeKeyboard:true,responsiveColumns:true,focusRetained:true,liveRowState:true};
 }finally{await grid.evaluate(element=>element.remove());}
}
