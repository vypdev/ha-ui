import {vi} from 'vitest';
import {act,createElement as h,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Feedback} from '../../packages/react/src/index.js';
import {feedbackAdapterCases} from './feedback-framework-fixture.js';

vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
feedbackAdapterCases(async(target,initial)=>{
 const root=createRoot(target);let options=initial;
 const draw=()=>act(()=>root.render(h(StrictMode,null,h(Feedback,{state:options.state,
  icon:options.show?h('span',null,'!'):false,action:options.show?h('button',{onClick:options.onAction},'Retry'):undefined}))));
 await draw();
 return{update:async patch=>{options={...options,...patch};await draw();},unmount:async()=>{await act(()=>root.unmount());}};
});
