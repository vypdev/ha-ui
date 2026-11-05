import {vi} from 'vitest';
import {act,createElement,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Checkbox} from '../../packages/react/src/index.js';
import {checkboxAdapterCases} from './checkbox-framework-fixture.js';
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
checkboxAdapterCases(async(target,initial)=>{const root=createRoot(target);let options=initial;const render=()=>act(()=>root.render(createElement(StrictMode,null,createElement(Checkbox,{...options,id:'bound-checkbox',className:'choice',dir:'ltr',lang:'en'}))));await render();return {host:target.querySelector('vyp-ha-checkbox')!,update:async patch=>{options={...options,...patch};await render();},unmount:async()=>{await act(()=>root.unmount());}};});
