import {afterEach,expect,test} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {feedbackState,type FeedbackState} from '../../packages/core/src/feedback-contracts.js';
import {registerFeedback} from '../../packages/core/src/components/feedback.js';

afterEach(()=>document.body.replaceChildren());
async function mount(raw:unknown){
 registerFeedback();const feedback=document.createElement('vyp-ha-feedback');feedback.state=feedbackState(raw);document.body.append(feedback);
 await feedback.updateComplete;return feedback;
}

test('status and error change the announcement without replacing the projected action or focusing the surface',async()=>{
 const feedback=await mount({kind:'notice',title:'Review',message:'<b>Kitchen</b>'});
 const status=page.getByRole('status'),root=feedback.shadowRoot!,original=root.querySelector('[part=message]');
 await expect.element(status.getByText('<b>Kitchen</b>',{exact:true})).toBeVisible();expect(root.querySelector('b')).toBeNull();
 const action=document.createElement('button');action.type='button';action.slot='action';action.textContent='Retry task';feedback.append(action);
 await expect.element(page.getByRole('button',{name:'Retry task'})).toBeVisible();action.focus();
 feedback.state=feedbackState({kind:'notice',tone:'error',title:'Unable to save',message:'Try again.',narrow:true});await feedback.updateComplete;
 expect(root.querySelector('[part=message]')).toBe(original);expect(document.activeElement).toBe(action);
 await expect.element(page.getByRole('alert').getByText('Try again.')).toBeVisible();
 expect(root.querySelector('[part=message]')!.contains(action)).toBe(false);
 let clicks=0;action.addEventListener('click',()=>clicks++);await userEvent.keyboard('{Enter}');expect(clicks).toBe(1);expect(feedback.tabIndex).toBe(-1);
});

test('loading is announced as status and empty uses a native heading, optional description and decorative icon',async()=>{
 const feedback=await mount({kind:'loading',message:'Loading tasks…'});
 await expect.element(page.getByRole('status').getByText('Loading tasks…')).toBeVisible();
 expect(feedback.shadowRoot!.querySelector('[part=spinner]')?.getAttribute('aria-hidden')).toBe('true');
 feedback.state=feedbackState({kind:'empty',title:'No tasks',message:'Add a task to get started.'});await feedback.updateComplete;
 await expect.element(page.getByRole('status').getByRole('heading',{name:'No tasks',level:2})).toBeVisible();
 await expect.element(page.getByText('Add a task to get started.')).toBeVisible();
 expect(feedback.shadowRoot!.querySelector('[part=icon]')?.getAttribute('aria-hidden')).toBe('true');
 const icon=document.createElement('span');icon.slot='icon';icon.textContent='Decorative symbol';feedback.append(icon);await feedback.updateComplete;
 expect(feedback.shadowRoot!.querySelector<HTMLSlotElement>('slot[name=icon]')!.assignedElements()).toEqual([icon]);
 feedback.state=feedbackState({kind:'empty',title:'No tasks',icon:false});await feedback.updateComplete;
 expect(feedback.shadowRoot!.querySelector('[part=icon]')).toBeNull();
 expect(feedback.shadowRoot!.querySelector('p')).toBeNull();
});

test('an optional action keeps its native form owner and the state setter rejects invalid data',async()=>{
 const feedback=await mount({kind:'notice',message:'Check the task.',icon:false}),form=document.createElement('form');
 const input=document.createElement('input');input.type='hidden';input.name='task';input.value='Kitchen';
 const submit=document.createElement('button');submit.type='submit';submit.slot='action';submit.name='action';submit.value='review';submit.textContent='Review';
 form.append(input,feedback);feedback.append(submit);document.body.append(form);
 const entries:unknown[]=[];form.addEventListener('submit',event=>{event.preventDefault();entries.push([...new FormData(form,(event as SubmitEvent).submitter)]);});
 await userEvent.keyboard('{Tab}');expect(document.activeElement).toBe(submit);await userEvent.keyboard('{Enter}');
 expect(entries).toEqual([[['task','Kitchen'],['action','review']]]);
 expect(()=>{feedback.state={...feedback.state,message:33} as unknown as FeedbackState;}).toThrow(/invalid_feedback/u);
});

test('registration is idempotent and an unconfigured host does not announce empty content',async()=>{
 registerFeedback();registerFeedback(customElements);
 const feedback=document.createElement('vyp-ha-feedback');document.body.append(feedback);await feedback.updateComplete;
 expect(feedback.shadowRoot!.querySelector('[part=message]')).toBeNull();
 class ForeignFeedback extends HTMLElement {}
 const registry={get:()=>ForeignFeedback} as unknown as CustomElementRegistry;
 expect(()=>registerFeedback(registry)).toThrow(/registration conflict/u);
});
