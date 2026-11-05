import {afterEach,expect,test,vi} from 'vitest';
import {page} from 'vitest/browser';
import {feedbackState,type FeedbackState} from '../../packages/core/src/feedback-contracts.js';
import {registerFeedback} from '../../packages/core/src/components/feedback.js';

export interface FeedbackOptions{state:FeedbackState;show:boolean;onAction:()=>void;}
type Mount={update(patch:Partial<FeedbackOptions>):Promise<void>;unmount():Promise<void>;};

export function feedbackAdapterCases(mount:(target:HTMLElement,initial:FeedbackOptions)=>Promise<Mount>):void{
 afterEach(()=>document.body.replaceChildren());
 test('announces updated feedback through one renderer and preserves native projected action focus',async()=>{
  registerFeedback();const target=document.createElement('main'),onAction=vi.fn();target.dataset.testid='feedback-app';document.body.append(target);
  const app=await mount(target,{state:feedbackState({kind:'loading',message:'Loading household tasks…'}),show:false,onAction});
  try{
   const scope=page.getByTestId('feedback-app'),host=target.querySelector('vyp-ha-feedback')!;
   await expect.element(scope.getByRole('status').getByText('Loading household tasks…')).toBeVisible();
   expect(host.hasAttribute('state')).toBe(false);
   await app.update({state:feedbackState({kind:'notice',tone:'error',message:'Unable to load the tasks.'}),show:true});
   await expect.element(scope.getByRole('alert').getByText('Unable to load the tasks.')).toBeVisible();
   const retry=scope.getByRole('button',{name:'Retry'});await retry.click();expect(onAction).toHaveBeenCalledTimes(1);
   const command=retry.element();
   await app.update({state:feedbackState({kind:'empty',title:'No household tasks'})});
   await expect.element(scope.getByRole('status').getByRole('heading',{name:'No household tasks',level:2})).toBeVisible();
   expect(target.querySelector('vyp-ha-feedback')).toBe(host);expect(retry.element()).toBe(command);expect(document.activeElement).toBe(command);
   await app.update({show:false});await expect.element(retry).not.toBeInTheDocument();
  }finally{await app.unmount();}
  expect(target.querySelector('vyp-ha-feedback')).toBeNull();
 });
}
