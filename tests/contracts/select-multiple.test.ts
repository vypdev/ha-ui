import {expect,test} from 'vitest';
import {selectState} from '../../packages/core/src/select-contracts.js';
import {multipleSelectOptions,changeMultipleSelection} from '../../packages/core/src/select-multiple.js';
const options=selectState({label:'Category',options:[{value:1,label:'Maintenance'},{value:'1',label:'Shopping'},{value:false,label:'Other'},{value:true,label:'Archived',disabled:true}]}).options;
test('search excludes only exact accepted values and keeps disabled matches visible',()=>{
 expect(multipleSelectOptions(options,[1,false],'')).toEqual([1,3]);expect(multipleSelectOptions(options,[1],'  SHOP  ')).toEqual([1]);expect(multipleSelectOptions(options,null,'arch')).toEqual([3]);expect(multipleSelectOptions(options,1,'')).toEqual([0,1,2,3]);expect(multipleSelectOptions(options,[],'missing')).toEqual([]);expect(Object.isFrozen(multipleSelectOptions(options,[],''))).toBe(true);
});
test('explicit addition preserves typed identity, model order and unavailable values',()=>{
 const current=Object.freeze([1,false,'missing']);const added=changeMultipleSelection(current,'1','add');expect(added).toEqual([1,false,'missing','1']);expect(current).toEqual([1,false,'missing']);expect(Object.isFrozen(added)).toBe(true);expect(changeMultipleSelection(current,1,'add')).toBe(null);expect(changeMultipleSelection(null,false,'add')).toEqual([false]);expect(changeMultipleSelection('wrong mode',1,'add')).toEqual([1]);
});
test('removal preserves other values and distinguishes literal false from the boolean',()=>{
 expect(changeMultipleSelection([false,'false','missing'],false,'remove')).toEqual(['false','missing']);expect(changeMultipleSelection([1],1,'remove')).toEqual([]);expect(changeMultipleSelection([1],'1','remove')).toBe(null);expect(changeMultipleSelection(null,1,'remove')).toBe(null);expect(changeMultipleSelection(1,1,'remove')).toBe(null);expect(Object.isFrozen(changeMultipleSelection([1],1,'remove'))).toBe(true);expect(changeMultipleSelection([-0],0,'add')).toBe(null);expect(changeMultipleSelection([-0],0,'remove')).toEqual([]);
});
test('the 256-value bound requires a removal before another addition',()=>{
 const full=Array.from({length:256},(_,index)=>index);expect(changeMultipleSelection(full,'next','add')).toBe(null);const reduced=changeMultipleSelection(full,0,'remove')!;expect(changeMultipleSelection(reduced,'next','add')).toHaveLength(256);expect(full).toHaveLength(256);
});
