import {expect,test} from 'vitest';
import {checkboxState,checkboxChecked,checkboxName,checkboxValue,checkboxValidity,checkboxChangeDetail,checkboxRestoreState,checkboxRestoreValue,CheckboxInputError} from '../../packages/core/src/checkbox-contracts.js';
const state=(patch:Record<string,unknown>={})=>checkboxState({label:'Completed',...patch});
const invalid=(action:()=>unknown)=>{try{action();throw Error('Expected rejection');}catch(error){expect(error).toBeInstanceOf(CheckboxInputError);expect((error as CheckboxInputError).code).toBe('invalid_checkbox');expect((error as Error).message).toBe('invalid_checkbox');}};
test('defaults and localized explicit inputs stay frozen without changing label text',()=>{
 expect(state()).toEqual({label:'Completed',description:'',error:'',required:false,indeterminate:false,requiredMessage:'Select this option.'});expect(Object.isFrozen(state())).toBe(true);
 const value=state({label:'Completada 🧹 <b>literal</b>',description:'A description',error:'Review',required:true,indeterminate:true,requiredMessage:'Marca esta opción.'});expect(value.label).toBe('Completada 🧹 <b>literal</b>');expect(value.required).toBe(true);expect(value.indeterminate).toBe(true);
});
test.each([null,[],true,1,'label',{}, {label:''},{label:'Label',extra:true},Object.assign({label:'Label'},{[Symbol('x')]:true}),Object.defineProperty({label:'Label'},'extra',{value:1})].map(raw=>({raw})))('rejects malformed state case %#',({raw})=>invalid(()=>checkboxState(raw)));
test.each(['label','description','error','requiredMessage'])('rejects unsafe or excessive %s presentation',key=>{invalid(()=>state({[key]:'secret\ntext'}));invalid(()=>state({[key]:'x'.repeat(513)}));});
test.each(['required','indeterminate'])('rejects nonboolean %s instead of coercing it',key=>invalid(()=>state({[key]:'false'})));
test.each([undefined,null,0,1,'true',{},new Boolean(false)].map(raw=>({raw})))('rejects a malformed checked model case %#',({raw})=>invalid(()=>checkboxChecked(raw)));
test('boolean model, literal submission payload and name bounds preserve their separate semantics',()=>{
 expect(checkboxChecked(false)).toBe(false);expect(checkboxChecked(true)).toBe(true);expect(checkboxName('')).toBe('');expect(checkboxName('n'.repeat(128))).toHaveLength(128);invalid(()=>checkboxName('n'.repeat(129)));invalid(()=>checkboxName(undefined));
 expect(checkboxValue('')).toBe('');expect(checkboxValue('\n<script>literal</script>')).toBe('\n<script>literal</script>');expect(checkboxValue('x'.repeat(16384))).toHaveLength(16384);invalid(()=>checkboxValue('x'.repeat(16385)));invalid(()=>checkboxValue('\ud800'));invalid(()=>checkboxValue(1));
 expect(state({label:'🧹'.repeat(256)}).label).toBe('🧹'.repeat(256));invalid(()=>state({label:'x'.repeat(257)}));
});
test('native validity depends on checked rather than the controlled visual indeterminate flag',()=>{
 expect(checkboxValidity(false,state())).toEqual({flags:{valueMissing:false,customError:false},message:''});expect(checkboxValidity(false,state({required:true}))).toEqual({flags:{valueMissing:true,customError:false},message:'Select this option.'});
 expect(checkboxValidity(true,state({required:true,indeterminate:true})).flags.valueMissing).toBe(false);expect(checkboxValidity(false,state({required:true,indeterminate:true})).flags.valueMissing).toBe(true);
 expect(checkboxValidity(true,state({error:'State error'})).message).toBe('State error');expect(checkboxValidity(false,state({required:true,error:'State error'}),'Custom error').message).toBe('Custom error');expect(Object.isFrozen(checkboxValidity(true,state()).flags)).toBe(true);expect(Object.isFrozen(checkboxValidity(true,state()))).toBe(true);invalid(()=>checkboxValidity(false,state(),42));
});
test('request payloads keep closed frozen boolean snapshots and only the documented reasons',()=>{
 for(const reason of ['change','reset','restore','autocomplete']){const value=checkboxChangeDetail({checked:true,reason});expect(value).toEqual({checked:true,reason});expect(Object.isFrozen(value)).toBe(true);}
 for(const raw of [null,[],{}, {checked:'true',reason:'change'},{checked:false,reason:'input'},{checked:false,reason:'change',extra:1},Object.assign({checked:true,reason:'change'},{[Symbol('x')]:1})])invalid(()=>checkboxChangeDetail(raw));
});
test('restoration uses exact closed boolean text and rejects malformed or coerced state',()=>{
 for(const value of [true,false])expect(checkboxRestoreValue(checkboxRestoreState(value))).toBe(value);
 for(const raw of [true,1,null,{},'', ' true','false ','1','True','secret'])invalid(()=>checkboxRestoreValue(raw));invalid(()=>checkboxRestoreState('true'));
});
