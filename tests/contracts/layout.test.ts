import {expect,test} from 'vitest';
import {gridState,LayoutInputError,rowState} from '../../packages/core/src/layout-contracts.js';

test('a passive row keeps immutable, bounded inert presentation text',()=>{
 const row=rowState({label:'<b>Shopping 🧹</b>',description:'Review the shared list.'});
 expect(row).toEqual({label:'<b>Shopping 🧹</b>',description:'Review the shared list.'});expect(Object.isFrozen(row)).toBe(true);
 expect(rowState({label:'x'.repeat(256)}).description).toBe('');
 for(const raw of [null,[],42,{},{label:''},{label:' '},{label:'x'.repeat(257)},{label:'Tasks',description:'\u0085'},{label:'Tasks',description:'x'.repeat(513)},{label:'Tasks',href:'#unrecognized'},{label:'Tasks',[Symbol()]:true}]){
  expect(()=>rowState(raw)).toThrow(LayoutInputError);
 }
});

test('grid columns and responsive sizes are bounded and the default grid remains presentation-only',()=>{
 expect(gridState({})).toEqual({columns:3,minColumnWidth:0,square:false,label:''});expect(Object.isFrozen(gridState({}))).toBe(true);
 expect(gridState({columns:6,minColumnWidth:720,square:true,label:'Kitchen'})).toEqual({columns:6,minColumnWidth:720,square:true,label:'Kitchen'});
 expect(gridState({columns:1,minColumnWidth:96}).minColumnWidth).toBe(96);
 for(const raw of [null,[],0,{unknown:true},{columns:'3'},{columns:0},{columns:7},{columns:2.5},{minColumnWidth:'150'},{minColumnWidth:95},{minColumnWidth:721},{minColumnWidth:120.5},{square:'yes'},{label:4},{label:'x'.repeat(257)}]){
  expect(()=>gridState(raw)).toThrow(LayoutInputError);
 }
});
