import assert from 'node:assert/strict';
import {join} from 'node:path';
import type {Page} from 'playwright';
import type {HaDialog} from '@vypdev/ha-ui/dialog';

export async function exerciseFrameworkDialog(page:Page,root:string,framework:string){
 const host=page.locator('#bound-dialog'),opener=page.getByRole('button',{name:'Open task dialog',exact:true});
 const modal=host.getByRole('dialog',{name:'Review household task',exact:true});
 const action=page.getByLabel('Dialog action',{exact:true}),events=page.getByLabel('Dialog requests',{exact:true});
 const reject=page.getByRole('button',{name:'Toggle confirmation rejection',exact:true});
 await reject.click();await opener.click();await modal.waitFor();await host.getByText('Task details', {exact:true}).waitFor();
 assert.equal(await host.getAttribute('state'),null);
 await modal.getByRole('button',{name:'Confirm task',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('output[aria-label="Dialog requests"]')!.textContent==='1');
 assert.equal(await action.textContent(),'');assert.equal(await modal.isVisible(),true);
 await page.keyboard.press('Escape');await modal.waitFor({state:'hidden'});assert.equal(await action.textContent(),'escape');
 assert.equal(await opener.evaluate(element=>element===document.activeElement),true);
 await reject.click();await opener.click();await modal.waitFor();
 await page.screenshot({path:join(root,'test-results','packed-'+framework+'-dialog.png')});
 await modal.getByRole('button',{name:'Confirm task',exact:true}).click();await modal.waitFor({state:'hidden'});assert.equal(await action.textContent(),'confirm');assert.equal(await events.textContent(),'3');
 await opener.click();await host.getByRole('button',{name:'Remove task dialog',exact:true}).click();await host.waitFor({state:'detached'});
 assert.equal(await opener.evaluate(element=>element===document.activeElement),true);assert.equal(await events.textContent(),'3');
 await opener.click();await modal.waitFor();await modal.getByRole('button',{name:'Cancel',exact:true}).click();await modal.waitFor({state:'hidden'});
 assert.equal(await action.textContent(),'cancel');assert.equal(await events.textContent(),'4');
 return{namedNativeModal:true,projectedContent:true,cancelableConfirm:true,escapeAndFocusReturn:true,acceptedConfirmAndCancel:true,disconnectAndRemount:true};
}

/** Real installed core interactions; browser input exercises top-layer pointer and focus behavior. */
export async function exerciseInstalledDialog(page:Page){
 const previous=page.viewportSize();await page.setViewportSize({width:960,height:700});
 await page.evaluate(async()=>{
  const fixture=document.createElement('div'),opener=document.createElement('button'),dialog=document.createElement('vyp-ha-dialog') as HaDialog,input=document.createElement('input');
  fixture.id='packed-dialog-fixture';opener.textContent='Open installed dialog';input.autofocus=true;input.setAttribute('aria-label','Reason');
  dialog.state={...dialog.state,title:'Confirm installed task',description:'Review the changes.',confirmLabel:'Confirm task'};
  dialog.addEventListener('ha-dialog-request',event=>{fixture.dataset.actions=JSON.stringify([...(JSON.parse(fixture.dataset.actions??'[]') as string[]),event.detail.action]);if(fixture.dataset.accept==='true')dialog.open=false;else event.preventDefault();});
  opener.addEventListener('click',()=>{dialog.open=true;});dialog.append(input);fixture.append(opener,dialog);document.body.append(fixture);await dialog.updateComplete;
 });
 const fixture=page.locator('#packed-dialog-fixture'),opener=fixture.getByRole('button',{name:'Open installed dialog',exact:true}),host=fixture.locator('vyp-ha-dialog');
 const modal=host.getByRole('dialog',{name:'Confirm installed task',exact:true}),actions=async()=>JSON.parse((await fixture.getAttribute('data-actions'))??'[]');
 try{
  await opener.press('Enter');await modal.waitFor();assert.equal(await host.getByRole('textbox',{name:'Reason',exact:true}).evaluate(input=>input===document.activeElement),true);
  assert.equal(await host.evaluate(element=>element.shadowRoot!.querySelector('dialog')!.matches(':modal')),true);
  const box=await modal.boundingBox();assert.ok(box&&box.x>8);
  await page.mouse.move(box.x+4,box.y+4);await page.mouse.down();await page.mouse.move(4,4);await page.mouse.up();
  assert.deepEqual(await actions(),[]);
  await page.mouse.click(4,4);assert.deepEqual(await actions(),['scrim']);assert.equal(await modal.isVisible(),true);
  await page.keyboard.press('Escape');assert.deepEqual(await actions(),['scrim','escape']);assert.equal(await modal.isVisible(),true);
  await fixture.evaluate(element=>(element as HTMLElement).dataset.accept='true');
  await modal.getByRole('button',{name:'Confirm task',exact:true}).click();await modal.waitFor({state:'hidden'});
  assert.deepEqual(await actions(),['scrim','escape','confirm']);assert.equal(await opener.evaluate(element=>element===document.activeElement),true);
  await opener.press('Enter');await modal.waitFor();await host.evaluate(element=>element.remove());await modal.waitFor({state:'hidden'});
  assert.equal(await opener.evaluate(element=>element===document.activeElement),true);assert.deepEqual(await actions(),['scrim','escape','confirm']);
  return{nativeModal:true,autofocus:true,dragOutDoesNotDismiss:true,realScrimAndEscape:true,cancelableActions:true,focusRestored:true,disconnect:true};
 }finally{await fixture.evaluate(element=>element.remove());if(previous)await page.setViewportSize(previous);}
}
