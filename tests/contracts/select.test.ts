import {expect,test} from 'vitest';
import {selectState,selectSelection,selectEntries,selectName,selectValidity,selectValueDetail,selectRestoreState,selectRestoreValue,SelectInputError} from '../../packages/core/src/select-contracts.js';
const options=[{value:1,label:'One'},{value:'1',label:'String one'},{value:false,label:'False'},{value:'',label:'Empty literal'}];
const state=(patch:Record<string,unknown>={})=>selectState({label:'Category',options,...patch});
const invalid=(fn:()=>unknown)=>{try{fn();throw Error('Expected rejection');}catch(error){expect(error).toBeInstanceOf(SelectInputError);expect((error as SelectInputError).code).toBe('invalid_select');expect((error as Error).message).toBe('invalid_select');}};
test('closed defaults keep one typed frozen configuration and multiple defaults use a native listbox',()=>{
 const value=state();expect(value).toEqual({label:'Category',options:options.map(option=>({...option,disabled:false})),description:'',placeholder:'Select an option',emptyMessage:'No options available.',error:'',required:false,multiple:false,size:1,requiredMessage:'Select an option.',unavailableMessage:'Select an available option.'});
 expect(Object.isFrozen(value)).toBe(true);expect(Object.isFrozen(value.options)).toBe(true);expect(value.options.every(Object.isFrozen)).toBe(true);expect(state({multiple:true}).size).toBe(4);expect(state({multiple:true,size:8}).size).toBe(8);expect(state({options:[]}).options).toEqual([]);
});
test('explicit localized state and literal markup stay inert and preserve primitive types',()=>{
 const value=state({label:'Categoría 🧹 <b>literal</b>',description:'Description',placeholder:'',emptyMessage:'No hay opciones.',error:'Review',required:true,multiple:true,size:20,requiredMessage:'Elige una opción.',unavailableMessage:'Elige una opción disponible.'});
 expect(value.label).toBe('Categoría 🧹 <b>literal</b>');expect(value.options.map(item=>item.value)).toEqual([1,'1',false,'']);expect(value.required).toBe(true);expect(value.placeholder).toBe('');
});
test.each([null,[],1,true,{}, {options}, {label:'Missing'}, {label:'Secret',options,extra:true}].map(raw=>({raw})))('rejects missing and malformed state: case %#',({raw})=>invalid(()=>selectState(raw)));
test.each([null,{},'options',Array(1),[{value:1,label:'One'},{value:1,label:'Duplicate'}],[{value:0,label:'Zero'},{value:-0,label:'Duplicate zero'}],[{value:1}],[{value:1,label:'One',extra:1}],Array.from({length:257},(_,value)=>({value,label:'Option'}))].map(raw=>({raw})))('rejects malformed options: case %#',({raw})=>invalid(()=>state({options:raw})));
test.each(['required','multiple'])('rejects nonboolean %s without coercion',key=>invalid(()=>state({[key]:'false'})));
test.each([0,21,1.5,NaN,Infinity,'1',null])('rejects invalid size %j',size=>invalid(()=>state({size})));
test.each(['label','description','placeholder','emptyMessage','error','requiredMessage','unavailableMessage'])('rejects unsafe %s presentation',key=>invalid(()=>state({[key]:'Secret\ntext'})));
test('rejects symbol/nonenumerable own keys and extra array properties',()=>{
 for(const raw of [Object.assign({label:'Category',options},{[Symbol('extra')]:1}),Object.defineProperty({label:'Category',options},'extra',{value:true})])invalid(()=>selectState(raw));
 invalid(()=>state({options:Object.assign([...options],{extra:true})}));invalid(()=>state({options:[{value:1,label:'One',disabled:'false'}]}));
 invalid(()=>state({options:[{value:1,label:'One\u0080'}]}));invalid(()=>state({options:[{value:1,label:''}]}));
});
test('bounds names, labels, option count and literal model text without normalizing',()=>{
 expect(state({label:'🧹'.repeat(256),options:Array.from({length:256},(_,value)=>({value,label:'Option'}))}).options).toHaveLength(256);
 invalid(()=>state({label:'x'.repeat(257)}));invalid(()=>state({description:'x'.repeat(513)}));expect(selectName('n'.repeat(128))).toHaveLength(128);expect(selectName('')).toBe('');invalid(()=>selectName('n'.repeat(129)));invalid(()=>selectName(42));
 expect(selectSelection('\n<script>literal</script>')).toBe('\n<script>literal</script>');expect(selectSelection('x'.repeat(1024))).toHaveLength(1024);
});
test.each([undefined,{},NaN,Infinity,-Infinity,1n,new String('one'),'x'.repeat(1025),'\ud800',[1,1],[false,false],Array(1),[null],[[1]],Array.from({length:257},(_,value)=>value),Object.assign([1],{extra:true})].map(raw=>({raw})))('rejects malformed selection: case %#',({raw})=>invalid(()=>selectSelection(raw)));
test('snapshots unique selections without conflating numeric/string/boolean/empty values',()=>{
 expect(selectSelection(null)).toBe(null);expect(selectSelection(true)).toBe(true);expect(selectSelection(1.25)).toBe(1.25);expect(selectSelection(-0)).toBe(-0);
 const input=[1,'1',false,''],value=selectSelection(input);input.push('later');expect(value).toEqual([1,'1',false,'']);expect(Object.isFrozen(value)).toBe(true);expect(selectSelection([])).toEqual([]);
});
test('validity preserves unmatched models, mode mismatches and disabled values as explicit invalid states',()=>{
 expect(selectValidity(null,state()).flags).toEqual({valueMissing:false,customError:false});expect(selectValidity('',state()).message).toBe('');expect(selectValidity(false,state()).message).toBe('');
 expect(selectValidity(null,state({required:true}))).toEqual({flags:{valueMissing:true,customError:false},message:'Select an option.'});expect(selectValidity([],state({multiple:true,required:true})).flags.valueMissing).toBe(true);
 for(const value of ['missing',[1],true])expect(selectValidity(value,state())).toEqual({flags:{valueMissing:false,customError:true},message:'Select an available option.'});
 expect(selectValidity(1,state({multiple:true})).flags.customError).toBe(true);expect(selectValidity([1,'1'],state({multiple:true})).flags.customError).toBe(false);expect(selectValidity(null,state({multiple:true})).flags.customError).toBe(false);
 expect(selectValidity(1,state({options:[{value:1,label:'One',disabled:true}]})).flags.customError).toBe(true);
 expect(selectValidity(null,state({required:true,error:'State error'})).message).toBe('State error');expect(selectValidity(null,state({required:true,error:'State error'}),'Custom error').message).toBe('Custom error');
 expect(Object.isFrozen(selectValidity(null,state()))).toBe(true);expect(Object.isFrozen(selectValidity(null,state()).flags)).toBe(true);invalid(()=>selectValidity(null,state(),42));
});
test('request payloads use closed typed snapshots and accepted reasons',()=>{
 for(const reason of ['change','reset','restore','autocomplete'])expect(selectValueDetail({value:1,reason})).toEqual({value:1,reason});
 const input=[1,'1'],detail=selectValueDetail({value:input,reason:'change'});input.push('later');expect(detail.value).toEqual([1,'1']);expect(Object.isFrozen(detail)).toBe(true);expect(Object.isFrozen(detail.value)).toBe(true);
 for(const raw of [null,[],{}, {value:1,reason:'input'}, {value:{},reason:'change'}, {value:1,reason:'change',extra:1},Object.assign({value:1,reason:'change'},{[Symbol('x')]:1})])invalid(()=>selectValueDetail(raw));
});
test('restoration round trips typed values and rejects malformed/unbounded foreign state without echo',()=>{
 for(const value of [null,1,false,'1','\n<script>',[1,'1',false,''],[]])expect(selectRestoreValue(selectRestoreState(value))).toEqual(value);
 for(const raw of [42,{},'not JSON','{"value":"secret"}','[1,1]','"\\ud800"','x'.repeat(2000001)])invalid(()=>selectRestoreValue(raw));
 invalid(()=>selectRestoreState({}));
});

test('native entries keep option order, typed distinctions and disabled/unknown omissions',()=>{
 const config=state({multiple:true,options:[...options,{value:true,label:'Disabled',disabled:true}]});
 expect(selectEntries(['1',1,false,'',true,'missing'],config)).toEqual(['1','1','false','']);expect(selectEntries([1],state())).toEqual([]);expect(selectEntries(null,state())).toEqual([]);expect(selectEntries('',state())).toEqual(['']);expect(Object.isFrozen(selectEntries(1,state()))).toBe(true);
});

test('rejects all unsupported array own keys, missing option values and malformed restore strings',()=>{
 invalid(()=>selectSelection(Object.assign([1],{[Symbol('x')]:1})));invalid(()=>selectSelection(Object.assign([1],{'4294967295':1})));invalid(()=>state({options:[{label:'Missing value'}]}));invalid(()=>selectName(undefined));invalid(()=>selectRestoreValue('\ud800'));
});
