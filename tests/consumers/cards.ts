import assert from 'node:assert/strict';
import {join} from 'node:path';
import type {Page} from 'playwright';
import type {HaCard} from '@vypdev/ha-ui/card';

export async function exerciseFrameworkCard(page:Page,root:string,framework:string){
 const host=page.locator('#bound-card'),review=host.getByRole('button',{name:'Review card task',exact:true});
 await host.getByRole('heading',{name:'Household tasks',level:2}).waitFor();
 await host.getByText('Check the shared shopping list.',{exact:true}).waitFor();
 assert.equal(await host.getAttribute('state'),null);
 await page.locator('#bound-card').screenshot({path:join(root,'test-results','packed-'+framework+'-card.png')});
 await review.press('Enter');
 await host.getByRole('heading',{name:'Reviewed tasks',level:3}).waitFor();
 await review.waitFor({state:'detached'});await host.locator('[part=actions]').waitFor({state:'hidden'});
 assert.equal(await host.locator('[part=card]').getAttribute('data-raised'),'');
 const toggle=page.getByRole('button',{name:'Toggle task card',exact:true});
 await toggle.click();await host.waitFor({state:'detached'});
 await toggle.click();await host.getByRole('heading',{name:'Reviewed tasks',level:3}).waitFor();
 return{namedArticle:true,projectedBody:true,nativeProjectedKeyboardCommand:true,typedStateUpdate:true,optionalActions:true,remount:true};
}

export async function exerciseInstalledCard(page:Page){
 // Some platforms require full keyboard access before Tab includes native buttons.
 await page.evaluate(()=>{
  const probe=document.createElement('div');probe.id='native-card-tab-probe';
  const field=document.createElement('input'),button=document.createElement('button');
  button.textContent='Native card tab probe';probe.append(field,button);document.body.append(probe);field.focus();
 });
 await page.keyboard.press('Tab');
 const nativeTab=await page.locator('#native-card-tab-probe').evaluate(probe=>{
  const focused=probe.querySelector('button')===document.activeElement;probe.remove();return focused;
 });
 const id='packed-card-fixture';
 await page.evaluate(async id=>{
  const form=document.createElement('form'),card=document.createElement('vyp-ha-card') as HaCard,input=document.createElement('input'),command=document.createElement('button');
  form.id=id;card.state={title:'Installed household tasks',headingLevel:3,raised:false};
  input.name='task';input.value='Supplies';input.setAttribute('aria-label','Installed task');
  command.slot='actions';command.textContent='Review installed card';command.name='review';command.value='yes';
  form.addEventListener('submit',event=>{event.preventDefault();form.dataset.submitted=JSON.stringify([...new FormData(form,event.submitter)]);});
  card.append(input,command);form.append(card);document.body.append(form);await card.updateComplete;
 },id);
 const form=page.locator('#'+id),host=form.locator('vyp-ha-card');
 const article=host.getByRole('article',{name:'Installed household tasks',exact:true});
 try{
  await article.getByRole('heading',{name:'Installed household tasks',level:3}).waitFor();
  await host.getByRole('textbox',{name:'Installed task',exact:true}).focus();
  await page.keyboard.press('Tab');
  const command=host.getByRole('button',{name:'Review installed card',exact:true});
  assert.equal(await command.evaluate(element=>element===document.activeElement),nativeTab,'Projected actions follow the browser’s native Tab policy');
  if(!nativeTab)await command.focus();
  await page.keyboard.press('Enter');
  assert.equal(await form.getAttribute('data-submitted'),'[["task","Supplies"],["review","yes"]]');
  await command.evaluate(element=>element.remove());
  await article.locator('[part=actions]').waitFor({state:'hidden'});
  return{nativeHeading:true,projection:true,nativeTabAndSubmit:nativeTab,nativeTabPolicyMatch:true,keyboardSubmit:true,nativeSubmitter:true,emptyActionsCollapse:true};
 }finally{await form.evaluate(element=>element.remove());}
}
