import assert from 'node:assert/strict';
import {join} from 'node:path';
import type {Page} from 'playwright';
import type {HaFeedback} from '@vypdev/ha-ui/feedback';

export async function exerciseFrameworkFeedback(page:Page,root:string,framework:string){
 const host=page.locator('#bound-feedback'),action=host.getByRole('button',{name:'Continue after feedback',exact:true});
 await host.getByRole('alert').getByText('Try loading the list again.',{exact:true}).waitFor();
 assert.equal(await host.getAttribute('state'),null);
 await host.screenshot({path:join(root,'test-results','packed-'+framework+'-feedback.png')});
 await action.press('Enter');
 await host.getByRole('status').getByRole('heading',{name:'No tasks yet',level:2}).waitFor();
 assert.equal(await host.getByRole('alert').count(),0);
 assert.equal(await action.evaluate(button=>button===document.activeElement),true);
 return{assertiveError:true,nativeEmptyHeading:true,politeStatus:true,projectedAction:true,focusRetained:true};
}

export async function exerciseInstalledFeedback(page:Page){
 const id='packed-feedback-fixture';
 await page.evaluate(async id=>{
  const form=document.createElement('form'),feedback=document.createElement('vyp-ha-feedback') as HaFeedback,button=document.createElement('button');
  form.id=id;feedback.state={kind:'notice',tone:'error',title:'Unable to load tasks',message:'Try loading the list again.',narrow:false,icon:true};
  button.textContent='Retry installed feedback';button.slot='action';button.type='submit';button.name='retry';button.value='yes';
  form.addEventListener('submit',event=>{
   event.preventDefault();form.dataset.entries=JSON.stringify([...new FormData(form,event.submitter)]);
   feedback.state={kind:'empty',tone:'info',title:'No installed tasks',message:'',narrow:false,icon:false};
  });
  feedback.append(button);form.append(feedback);document.body.append(form);await feedback.updateComplete;
 },id);
 const fixture=page.locator('#'+id),action=fixture.getByRole('button',{name:'Retry installed feedback',exact:true});
 try{
  await fixture.getByRole('alert').getByText('Unable to load tasks',{exact:true}).waitFor();
  await action.press('Enter');
  await fixture.getByRole('status').getByRole('heading',{name:'No installed tasks',level:2}).waitFor();
  assert.equal(await fixture.getAttribute('data-entries'),'[["retry","yes"]]');
  assert.equal(await action.evaluate(button=>button===document.activeElement),true);
  return{nativeFormAction:true,assertiveError:true,politeEmptyState:true,nativeHeading:true,focusRetained:true};
 }finally{await fixture.evaluate(element=>element.remove());}
}
