import {expect,test} from 'vitest';
import {feedbackState,FeedbackInputError} from '../../packages/core/src/feedback-contracts.js';

test('notices keep inert, bounded text and one allowed tone',()=>{
 const text='<b>Shopping 🧹</b>',model=feedbackState({kind:'notice',message:text});
 expect(model).toEqual({kind:'notice',tone:'info',title:'',message:text,narrow:false,icon:true});
 expect(Object.isFrozen(model)).toBe(true);
 expect(feedbackState({kind:'notice',tone:'error',title:'Review',message:'Try again.',narrow:true})).toEqual({kind:'notice',tone:'error',title:'Review',message:'Try again.',narrow:true,icon:true});
 for(const tone of ['success','warning'])expect(feedbackState({kind:'notice',message:'Check',tone}).tone).toBe(tone);
});

test('empty and loading have distinct content requirements and round-trip immutable state',()=>{
 const empty=feedbackState({kind:'empty',title:'No household tasks'});
 expect(empty).toEqual({kind:'empty',title:'No household tasks',message:'',tone:'info',narrow:false,icon:true});
 expect(feedbackState(empty)).toEqual(empty);
 expect(feedbackState({kind:'empty',title:'No tasks',icon:false}).icon).toBe(false);
 const loading=feedbackState({kind:'loading',message:'Loading tasks…'});
 expect(loading).toEqual({kind:'loading',title:'',message:'Loading tasks…',tone:'info',narrow:false,icon:true});
 expect(feedbackState(loading)).toEqual(loading);
});

test('rejects unknown modes, invalid fields and mixed presentation state',()=>{
 for(const raw of [
  null,[],42,{},{kind:'other',message:'Checking'},{kind:'notice',message:''},{kind:'notice',message:' '},
  {kind:'notice',message:'Checking',tone:'fatal'},{kind:'notice',message:'Checking',tone:0},{kind:'notice',message:'Checking',icon:'no'},{kind:'notice',message:'Checking',narrow:'yes'},
  {kind:'notice',message:'Checking',title:'x'.repeat(257)},{kind:'notice',message:'x'.repeat(513)},
  {kind:'notice',message:'\u0085'},{kind:'notice',message:'Checking',href:'#extra'},{kind:'notice',message:'Checking',[Symbol()]:true},
  {kind:'empty',message:'Try again'},{kind:'empty',title:'No tasks',narrow:true},{kind:'empty',title:'No tasks',tone:'success'},
  {kind:'loading',message:'Loading',title:'Busy'},{kind:'loading',message:''},{kind:'loading',message:'Loading',tone:'error'},{kind:'loading',message:'Loading',narrow:true},{kind:'loading',message:'Loading',icon:false},
 ])expect(()=>feedbackState(raw)).toThrow(FeedbackInputError);
});
