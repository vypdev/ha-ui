import {vi} from 'vitest';
import {act,createElement,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Card} from '../../packages/react/src/index.js';
import {cardAdapterCases} from './card-framework-fixture.js';
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
cardAdapterCases(async(target,initial)=>{
 const root=createRoot(target);let options=initial;
 const draw=()=>act(()=>root.render(createElement(StrictMode,null,createElement(Card,{state:options.state,actions:options.actions?createElement('button',{onClick:options.onReview},'Review task'):options.supplyActions?null:undefined},createElement('p',null,'Review household supplies.')))));
 await draw();return{host:target.querySelector('vyp-ha-card')!,update:async patch=>{options={...options,...patch};await draw();},unmount:async()=>{await act(()=>root.unmount());}};
});
