import {vi} from 'vitest';
import {act,createElement,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Select} from '../../packages/react/src/index.js';
import {selectAdapterCases} from './select-framework-fixture.js';
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
selectAdapterCases(async(target,initial)=>{const root=createRoot(target);let options=initial;const render=()=>act(()=>root.render(createElement(StrictMode,null,createElement(Select,{...options,id:'bound-select',className:'choice',dir:'ltr',lang:'en'}))));await render();return {host:target.querySelector('vyp-ha-select')!,update:async patch=>{options={...options,...patch};await render();},unmount:async()=>{await act(()=>root.unmount());}};});
