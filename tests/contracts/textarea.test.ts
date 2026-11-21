import {expect,test} from 'vitest';
import {TextAreaInputError,textAreaState,textAreaValue,textAreaName,textAreaValidity,textAreaValueDetail} from '../../packages/core/src/textarea-contracts.js';
import {textFieldValue,fieldValueDetail} from '../../packages/core/src/field-contracts.js';
const state=(patch:Record<string,unknown>={})=>({label:'Task title',...patch});
function reject(action:()=>unknown){expect(action).toThrow(TextAreaInputError);try{action();}catch(error){expect((error as TextAreaInputError).code).toBe('invalid_textarea');expect((error as Error).message).toBe('invalid_textarea');}}
test('field contracts import without DOM and return immutable independent configuration',()=>{
  expect(typeof document).toBe('undefined');const input=state(),value=textAreaState(input);input.label='Changed';
  expect(value.label).toBe('Task title');expect(Object.isFrozen(value)).toBe(true);
  expect(value).toEqual({label:'Task title',description:'',placeholder:'',required:false,readOnly:false,minLength:0,maxLength:16384,rows:3,error:'',requiredMessage:'Enter a value.',tooShortMessage:'Enter more characters.',tooLongMessage:'Enter fewer characters.'});
});
test('explicit valid values and literal multilingual text remain intact',()=>{
  const input=state({label:'Título 🧹 <script>literal</script>',description:'Description',placeholder:'A title',required:true,readOnly:true,minLength:2,maxLength:32,rows:5,error:'Review this value',requiredMessage:'Introduce un valor.',tooShortMessage:'Introduce más caracteres.',tooLongMessage:'Introduce menos caracteres.'});
  expect(textAreaState(input)).toEqual(input);
});
test.each([null,undefined,[],true,'field',{},Object.create({label:'Inherited'}),state({html:'unsafe'})])('rejects malformed or extended configuration',value=>reject(()=>textAreaState(value)));
test.each(['', ' ', 3, null, '\u0000', '\u007f', '\ud800', 'a'.repeat(257)])('rejects an invalid accessible label',label=>reject(()=>textAreaState(state({label}))));
test.each(Array.from({length:32},(_,n)=>String.fromCodePoint(0x80+n)))('rejects every C1 label control',control=>reject(()=>textAreaState(state({label:'A'+control+'B'}))));
test.each(['description','placeholder','error'])('optional %s preserves an explicit empty string and has bounded inert text',field=>{
 expect(textAreaState(state({[field]:''}))[field as 'description']).toBe('');
 for(const value of [null,3,' ','\udfff','x'.repeat(513)])reject(()=>textAreaState(state({[field]:value})));
});
test.each(['requiredMessage','tooShortMessage','tooLongMessage'])('requires a nonempty bounded %s',field=>{
 for(const value of ['',null,' ','x'.repeat(513),'\u0085'])reject(()=>textAreaState(state({[field]:value})));
});
test.each(['required','readOnly'])('does not coerce %s to a boolean',field=>{
 for(const value of [null,1,'false'])reject(()=>textAreaState(state({[field]:value})));
});
test.each(['minLength','maxLength'])('validates %s as a bounded integer',field=>{
 for(const value of [null,'3',-1,1.5,Infinity,NaN,16385])reject(()=>textAreaState(state({[field]:value})));
});
test('rejects inverted length limits but preserves zero and the exact upper bound',()=>{
 reject(()=>textAreaState(state({minLength:3,maxLength:2})));
 expect(textAreaState(state({maxLength:0})).maxLength).toBe(0);
 expect(textAreaState(state({minLength:16384})).minLength).toBe(16384);
});
test.each(['','Title',' Título 🧹 ','<script>literal</script>','x'.repeat(16384),'\t','a\r\nb','😀'.repeat(16384)])('preserves a valid literal textarea value',value=>expect(textAreaValue(value)).toBe(value));
test.each([null,undefined,3,{},'a\0b','a\x7fb','\ud800','x'.repeat(16385)])('rejects an invalid value without diagnostics containing it',value=>reject(()=>textAreaValue(value)));
test.each(['','task_title','Título de tarea','items[]'])('preserves a valid form name',name=>expect(textAreaName(name)).toBe(name));
test.each([null,undefined,{},' ','x'.repeat(129),'a\u0085b'])('rejects an invalid form name',name=>reject(()=>textAreaName(name)));
test('validity is immutable and distinguishes optional empty, required, short, long and explicit errors',()=>{
 const config=state({required:true,minLength:3,maxLength:5});
 const missing=textAreaValidity('',config);expect(missing.flags).toEqual({valueMissing:true,tooShort:false,tooLong:false,customError:false});expect(missing.message).toBe('Enter a value.');
 expect(textAreaValidity('a',config).message).toBe('Enter more characters.');expect(textAreaValidity('longer',config).message).toBe('Enter fewer characters.');
 expect(textAreaValidity('good',config).message).toBe('');expect(textAreaValidity('',state({minLength:3})).message).toBe('');
 expect(textAreaValidity('',{...config,error:'Server error'}).message).toBe('Server error');expect(textAreaValidity('',config,'Custom error').message).toBe('Custom error');
 expect(Object.isFrozen(missing)).toBe(true);expect(Object.isFrozen(missing.flags)).toBe(true);
});
test('public validity inputs keep the same bounded validation contract',()=>{
 reject(()=>textAreaValidity(null,state()));reject(()=>textAreaValidity('ok',null));reject(()=>textAreaValidity('ok',state(),'\u0000'));
});

test.each(['input','reset','restore','autocomplete'])('field request %s is validated and independently frozen',reason=>{
 const input={value:'Kitchen',reason},detail=textAreaValueDetail(input);input.value='Changed';expect(detail).toEqual({value:'Kitchen',reason});expect(Object.isFrozen(detail)).toBe(true);
});
test.each([null,undefined,[],false,'event',{}, {value:'Kitchen'}, {reason:'input'}, {value:'Kitchen',reason:'other'}, {value:42,reason:'input'}, {value:'x',reason:'input',extra:true},Object.assign(Object.create({value:'Inherited'}),{reason:'input',other:true}),Object.assign(Object.create({reason:'input'}),{value:'Kitchen',other:true})])('rejects malformed field intent detail before model use',detail=>reject(()=>textAreaValueDetail(detail)));

test('rows default to three and accept only reviewed integers from two to twenty',()=>{
  expect(textAreaState(state()).rows).toBe(3);
  for(const rows of [2,3,20])expect(textAreaState(state({rows})).rows).toBe(rows);
  for(const rows of [null,true,'3',1,21,3.5,Infinity,NaN])reject(()=>textAreaState(state({rows})));
});
test('supplementary codepoints meet exact configured bounds without UTF-16 truncation',()=>{
  const value='😀'.repeat(1000),config=state({minLength:1000,maxLength:1000});
  expect(value.length).toBe(2000);expect(textAreaValidity(value,config).message).toBe('');
  expect(textAreaValidity(value.slice(2),config).flags.tooShort).toBe(true);
  expect(textAreaValidity(value+'😀',config).flags.tooLong).toBe(true);
  reject(()=>textAreaValue('😀'.repeat(16385)));
});
test('the multiline model bridge leaves the established single-line API unchanged',()=>{
  const value='Literal\r\n\t😀 <img src=x onerror=alert(1)>';
  expect(textAreaValueDetail({value,reason:'input'})).toEqual({value,reason:'input'});
  expect(()=>textFieldValue(value)).toThrow();expect(()=>fieldValueDetail({value,reason:'input'})).toThrow();
  for(let point=0;point<32;point++)if(![9,10,13].includes(point))reject(()=>textAreaValue(String.fromCodePoint(point)));
});
