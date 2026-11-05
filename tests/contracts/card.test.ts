import {expect,test} from 'vitest';
import {CardInputError,cardState} from '../../packages/core/src/card-contracts.js';

test('normalizes independent immutable card presentation without interpreting text',()=>{
 expect(cardState({})).toEqual({title:'',headingLevel:2,raised:false});
 const source={title:'<b>Household tasks</b>',headingLevel:4,raised:true},accepted=cardState(source);
 expect(accepted).toEqual(source);expect(Object.isFrozen(accepted)).toBe(true);
 source.title='Changed';expect(accepted.title).toBe('<b>Household tasks</b>');
 for(const headingLevel of [1,2,3,4,5,6])expect(cardState({headingLevel}).headingLevel).toBe(headingLevel);
 expect(cardState({title:'😀'.repeat(256)}).title).toHaveLength(512);
});

test.each([null,[],true,'card',{extra:true},{[Symbol('field')]:true},{title:null},{title:' '},{title:'\udfff'},{title:'😀'.repeat(257)},{title:'Kitchen\nLaundry'},{headingLevel:0},{headingLevel:7},{headingLevel:2.5},{headingLevel:'2'},{raised:'true'},{raised:null}])('rejects invalid card state %j',raw=>{
 expect(()=>cardState(raw)).toThrow(CardInputError);
});
