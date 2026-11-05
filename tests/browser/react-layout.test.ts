import {vi} from 'vitest';
import {act,createElement as h,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Grid,Row} from '../../packages/react/src/index.js';
import {layoutAdapterCases} from './layout-framework-fixture.js';

vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
layoutAdapterCases(async(target,initial)=>{
 const root=createRoot(target);let options=initial;
 const draw=()=>act(()=>root.render(h(StrictMode,null,h(Grid,{state:options.grid},
  h('div',{role:'list'},h(Row,{state:options.row,leading:options.project?h('span',null,'Prep'):undefined,
   trailing:options.project?h('button',{onClick:options.onReview},'Review row'):undefined}))))));
 await draw();
 return{update:async patch=>{options={...options,...patch};await draw();},unmount:async()=>{await act(()=>root.unmount());}};
});
