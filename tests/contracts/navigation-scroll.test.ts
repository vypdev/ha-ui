import {expect,test} from 'vitest';
import {navigationScrollGeometry,navigationPageScroll} from '../../packages/core/src/navigation-scroll.js';

test.each([
 [405,240,0,false,165,0,false,true],
 [670,240,240,false,430,240,true,true],
 [670,240,430,false,430,430,true,false],
 [670,240,-240,true,430,240,true,true],
 [670,240,-430,true,430,430,true,false],
 [670,240,0,true,430,0,false,true],
 [240,240,0,false,0,0,false,false],
 [240.5,240,0,false,.5,0,false,false],
 [241,240,0,false,1,0,false,false],
 [242,240,1,false,2,1,false,false],
 [670,240,-5,false,430,0,false,true],
 [670,240,500,false,430,430,true,false],
 [670,240,5,true,430,0,false,true],
 [670,240,-500,true,430,430,true,false],
 [0,0,0,false,0,0,false,false],
 [200,240,0,false,0,0,false,false],
] as const)('normalizes actual horizontal geometry %j/%j/%j/rtl=%j', (width,viewport,offset,rtl,maximum,position,start,end)=>{
 const value=navigationScrollGeometry(width,viewport,offset,rtl);expect(value).toEqual({maximum,position,viewport,rtl,start,end});expect(Object.isFrozen(value)).toBe(true);
});
test.each([[NaN,100,0],[100,Infinity,0],[100,10,NaN],[-1,10,0],[100,-1,0]])('rejects invalid internal geometry without logging values',(...args)=>expect(()=>navigationScrollGeometry(...args as [number,number,number],false)).toThrow('invalid_scroll_geometry'));
test.each([false,true])('pages logically and clamps both ends, rtl=%s',rtl=>{
 const sign=rtl?-1:1;const start=navigationScrollGeometry(670,240,0,rtl),middle=navigationScrollGeometry(670,240,240*sign,rtl),end=navigationScrollGeometry(670,240,430*sign,rtl);
 expect(navigationPageScroll(start,'end')).toBe(240*sign);expect(navigationPageScroll(start,'start')).toBe(0);expect(navigationPageScroll(middle,'end')).toBe(430*sign);expect(navigationPageScroll(middle,'start')).toBe(0);expect(navigationPageScroll(end,'start')).toBe(190*sign);
});
test('nonoverflowing geometry has one stable zero target',()=>expect(navigationPageScroll(navigationScrollGeometry(0,0,0,true),'end')).toBe(0));
