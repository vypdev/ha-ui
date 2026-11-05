import {expect,test} from 'vitest';
import {selectState} from '../../packages/core/src/select-contracts.js';
import {moveSelectOption,matchSelectOption} from '../../packages/core/src/select-navigation.js';
const options=selectState({label:'Category',options:[{value:1,label:'Alpha'},{value:'1',label:'Archived',disabled:true},{value:false,label:'ÁREA'},{value:'a',label:'Another'},{value:'z',label:'Zulu'}]}).options;
test('option movement skips disabled items, clamps at boundaries and handles absent/current-disabled options',()=>{
 expect(moveSelectOption(options,0,'next')).toBe(2);expect(moveSelectOption(options,2,'previous')).toBe(0);
 expect(moveSelectOption(options,4,'next')).toBe(4);expect(moveSelectOption(options,0,'previous')).toBe(0);
 expect(moveSelectOption(options,2,'first')).toBe(0);expect(moveSelectOption(options,2,'last')).toBe(4);
 expect(moveSelectOption(options,-1,'next')).toBe(0);expect(moveSelectOption(options,1,'previous')).toBe(4);
 expect(moveSelectOption([],0,'first')).toBe(-1);expect(moveSelectOption([{...options[0],disabled:true}],0,'last')).toBe(-1);
});
test('typeahead wraps and handles case, Unicode, empty input, disabled matches and missing results',()=>{
 expect(matchSelectOption(options,0,'a')).toBe(3);expect(matchSelectOption(options,3,'a')).toBe(0);
 expect(matchSelectOption(options,-1,'Ár')).toBe(2);expect(matchSelectOption(options,0,'AR')).toBe(-1);
 expect(matchSelectOption(options,0,'z')).toBe(4);expect(matchSelectOption(options,-1,'')).toBe(-1);
 expect(matchSelectOption([],0,'a')).toBe(-1);expect(matchSelectOption(options,4,'al')).toBe(0);
});
