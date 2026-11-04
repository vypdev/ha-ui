import {expect,test} from 'vitest';
import {FieldInputError,textFieldState,textFieldValue,textFieldName,textFieldValidity,fieldValueDetail} from '../../packages/core/src/field-contracts.js';
const state=(patch:Record<string,unknown>={})=>({label:'Task title',...patch});
function reject(action:()=>unknown){expect(action).toThrow(FieldInputError);try{action();}catch(error){expect((error as FieldInputError).code).toBe('invalid_field');expect((error as Error).message).toBe('invalid_field');}}
test('field contracts import without DOM and return immutable independent configuration',()=>{
  expect(typeof document).toBe('undefined');const input=state(),value=textFieldState(input);input.label='Changed';
  expect(value.label).toBe('Task title');expect(Object.isFrozen(value)).toBe(true);
  expect(value).toEqual({label:'Task title',description:'',placeholder:'',required:false,readOnly:false,minLength:0,maxLength:16384,error:'',requiredMessage:'Enter a value.',tooShortMessage:'Enter more characters.',tooLongMessage:'Enter fewer characters.'});
});
test('explicit valid values and literal multilingual text remain intact',()=>{
  const input=state({label:'Título 🧹 <script>literal</script>',description:'Description',placeholder:'A title',required:true,readOnly:true,minLength:2,maxLength:32,error:'Review this value',requiredMessage:'Introduce un valor.',tooShortMessage:'Introduce más caracteres.',tooLongMessage:'Introduce menos caracteres.'});
  expect(textFieldState(input)).toEqual(input);
});
test.each([null,undefined,[],true,'field',{},Object.create({label:'Inherited'}),state({html:'unsafe'})])('rejects malformed or extended configuration',value=>reject(()=>textFieldState(value)));
test.each(['', ' ', 3, null, '\u0000', '\u007f', '\ud800', 'a'.repeat(257)])('rejects an invalid accessible label',label=>reject(()=>textFieldState(state({label}))));
test.each(Array.from({length:32},(_,n)=>String.fromCodePoint(0x80+n)))('rejects every C1 label control',control=>reject(()=>textFieldState(state({label:'A'+control+'B'}))));
test.each(['description','placeholder','error'])('optional %s preserves an explicit empty string and has bounded inert text',field=>{
 expect(textFieldState(state({[field]:''}))[field as 'description']).toBe('');
 for(const value of [null,3,' ','\udfff','x'.repeat(513)])reject(()=>textFieldState(state({[field]:value})));
});
test.each(['requiredMessage','tooShortMessage','tooLongMessage'])('requires a nonempty bounded %s',field=>{
 for(const value of ['',null,' ','x'.repeat(513),'\u0085'])reject(()=>textFieldState(state({[field]:value})));
});
test.each(['required','readOnly'])('does not coerce %s to a boolean',field=>{
 for(const value of [null,1,'false'])reject(()=>textFieldState(state({[field]:value})));
});
test.each(['minLength','maxLength'])('validates %s as a bounded integer',field=>{
 for(const value of [null,'3',-1,1.5,Infinity,NaN,16385])reject(()=>textFieldState(state({[field]:value})));
});
test('rejects inverted length limits but preserves zero and the exact upper bound',()=>{
 reject(()=>textFieldState(state({minLength:3,maxLength:2})));
 expect(textFieldState(state({maxLength:0})).maxLength).toBe(0);
 expect(textFieldState(state({minLength:16384})).minLength).toBe(16384);
});
test.each(['','Title',' Título 🧹 ','<script>literal</script>','x'.repeat(16384),'\t'])('preserves a valid single-line field value',value=>expect(textFieldValue(value)).toBe(value));
test.each([null,undefined,3,{},'a\nb','a\rb','\ud800','x'.repeat(16385)])('rejects an invalid value without diagnostics containing it',value=>reject(()=>textFieldValue(value)));
test.each(['','task_title','Título de tarea','items[]'])('preserves a valid form name',name=>expect(textFieldName(name)).toBe(name));
test.each([null,undefined,{},' ','x'.repeat(129),'a\u0085b'])('rejects an invalid form name',name=>reject(()=>textFieldName(name)));
test('validity is immutable and distinguishes optional empty, required, short, long and explicit errors',()=>{
 const config=state({required:true,minLength:3,maxLength:5});
 const missing=textFieldValidity('',config);expect(missing.flags).toEqual({valueMissing:true,tooShort:false,tooLong:false,customError:false});expect(missing.message).toBe('Enter a value.');
 expect(textFieldValidity('a',config).message).toBe('Enter more characters.');expect(textFieldValidity('longer',config).message).toBe('Enter fewer characters.');
 expect(textFieldValidity('good',config).message).toBe('');expect(textFieldValidity('',state({minLength:3})).message).toBe('');
 expect(textFieldValidity('',{...config,error:'Server error'}).message).toBe('Server error');expect(textFieldValidity('',config,'Custom error').message).toBe('Custom error');
 expect(Object.isFrozen(missing)).toBe(true);expect(Object.isFrozen(missing.flags)).toBe(true);
});
test('public validity inputs keep the same bounded validation contract',()=>{
 reject(()=>textFieldValidity(null,state()));reject(()=>textFieldValidity('ok',null));reject(()=>textFieldValidity('ok',state(),'\u0000'));
});

test.each(['input','reset','restore','autocomplete'])('field request %s is validated and independently frozen',reason=>{
 const input={value:'Kitchen',reason},detail=fieldValueDetail(input);input.value='Changed';expect(detail).toEqual({value:'Kitchen',reason});expect(Object.isFrozen(detail)).toBe(true);
});
test.each([null,undefined,[],false,'event',{}, {value:'Kitchen'}, {reason:'input'}, {value:'Kitchen',reason:'other'}, {value:42,reason:'input'}, {value:'x',reason:'input',extra:true},Object.assign(Object.create({value:'Inherited'}),{reason:'input',other:true}),Object.assign(Object.create({reason:'input'}),{value:'Kitchen',other:true})])('rejects malformed field intent detail before model use',detail=>reject(()=>fieldValueDetail(detail)));
