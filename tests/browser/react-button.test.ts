import {vi} from 'vitest';
import {act,createElement,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Button} from '../../packages/react/src/index.js';
import {buttonAdapterCases} from './button-framework-fixture.js';
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
buttonAdapterCases(async(target,initial)=>{
  const root=createRoot(target);let options=initial;
  const render=()=>act(()=>root.render(createElement(StrictMode,null,createElement(Button,{...options,id:'bound-button',className:'action',lang:'en',dir:'ltr',leading:options.icons?createElement('span',null,'+'):undefined,trailing:options.icons?createElement('span',null,'→'):undefined}))));
  await render();return {host:target.querySelector('vyp-ha-button')!,update:async patch=>{options={...options,...patch};await render();},unmount:async()=>{await act(()=>root.unmount());}};
});
