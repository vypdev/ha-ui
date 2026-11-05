import {expect,test} from 'vitest';
import {ButtonInputError,buttonState,buttonType,buttonName,buttonValue,buttonPressDetail} from '../../packages/core/src/button-contracts.js';

test('snapshots a closed button state with inert labels and explicit defaults',()=>{
 const source={label:'Save <b>task</b>'};const state=buttonState(source);source.label='Changed';
 expect(state).toEqual({label:'Save <b>task</b>',variant:'neutral',size:'medium',loading:false,loadingLabel:'Working…',iconOnly:false,pressed:null});expect(Object.isFrozen(state)).toBe(true);
});
test.each(['primary','neutral','danger','success','warning','plain','outlined','filled'])('accepts the documented %s variant',variant=>expect(buttonState({label:'Save',variant}).variant).toBe(variant));
test.each(['small','medium','large','extra-large'])('accepts the documented %s size',size=>expect(buttonState({label:'Save',size}).size).toBe(size));
test.each([true,false,null])('preserves controlled pressed %s without inventing a toggle',pressed=>expect(buttonState({label:'Save',pressed,loading:true,loadingLabel:'Guardando…',iconOnly:true})).toMatchObject({pressed,loading:true,loadingLabel:'Guardando…',iconOnly:true}));
test.each([null,[],42,undefined,{}, {label:''},{label:'x',extra:1},{label:'x',variant:'unknown'},{label:'x',variant:42},{label:'x',size:'tiny'},{label:'x',loading:'false'},{label:'x',iconOnly:0},{label:'x',pressed:'mixed'},{label:'x',loadingLabel:''},{label:'x'.repeat(257)},{label:'x',loadingLabel:'x'.repeat(513)},{label:'\ud800'},{label:'x\nsecret'},{label:'x',loadingLabel:'\u0085'}])('rejects invalid button state atomically without diagnostic echo (%#)',raw=>{
 expect(()=>buttonState(raw)).toThrow(ButtonInputError);try{buttonState(raw);}catch(error){expect((error as ButtonInputError).code).toBe('invalid_button');expect((error as Error).message).toBe('invalid_button');}
});
test('rejects symbol and non-enumerable unexpected state keys',()=>{for(const key of [Symbol('extra'),'extra']){const raw={label:'Save'};Object.defineProperty(raw,key,{value:true});expect(()=>buttonState(raw)).toThrow(ButtonInputError);}});
test('accepts boundary labels, well-formed supplementary characters and explicit optional undefined',()=>{
 expect(buttonState({label:'x'.repeat(256),loadingLabel:'y'.repeat(512),variant:undefined,size:undefined,pressed:undefined}).label).toHaveLength(256);expect(buttonState({label:'🧹'}).label).toBe('🧹');
});
test.each(['button','submit','reset'])('validates the explicit %s action type',value=>expect(buttonType(value)).toBe(value));
test.each([undefined,null,'','SUBMIT','image',42])('rejects unsupported action type (%#)',value=>expect(()=>buttonType(value)).toThrow(ButtonInputError));
test('validates names independently of literal form values',()=>{
 expect(buttonName('')).toBe('');expect(buttonName('x'.repeat(128))).toHaveLength(128);expect(buttonValue('')).toBe('');expect(buttonValue('<b>literal</b>\nvalue')).toBe('<b>literal</b>\nvalue');expect(buttonValue('x'.repeat(16384))).toHaveLength(16384);
 for(const value of [null,42,'x'.repeat(129),'invalid\nname','\ud800'])expect(()=>buttonName(value)).toThrow(ButtonInputError);
 for(const value of [null,42,'x'.repeat(16385),'\ud800'])expect(()=>buttonValue(value)).toThrow(ButtonInputError);
});
test('validates and freezes closed press snapshots before framework observers',()=>{const raw={type:'submit'};const detail=buttonPressDetail(raw);raw.type='reset';expect(detail).toEqual({type:'submit'});expect(Object.isFrozen(detail)).toBe(true);});
test.each([null,[],{},42,{type:'button',extra:true},{type:'image'},{type:42},Object.create({type:'button'})])('rejects malformed press detail (%#)',value=>expect(()=>buttonPressDetail(value)).toThrow(ButtonInputError));
test('rejects hidden and symbol press-detail extras',()=>{for(const key of [Symbol('extra'),'extra']){const raw={type:'button'};Object.defineProperty(raw,key,{value:true});expect(()=>buttonPressDetail(raw)).toThrow(ButtonInputError);}});
