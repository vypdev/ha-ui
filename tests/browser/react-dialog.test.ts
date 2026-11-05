import {vi} from 'vitest';
import {act,createElement,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Dialog} from '../../packages/react/src/index.js';
import {dialogAdapterCases} from './dialog-framework-fixture.js';
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
dialogAdapterCases(async(target,initial)=>{
 const root=createRoot(target);let options=initial;
 const draw=()=>act(()=>root.render(createElement(StrictMode,null,createElement(Dialog,{state:options.state,open:options.open,onRequest:options.onRequest,onAction:options.onAction,footer:options.footer?createElement('button',null,'Review'):undefined},createElement('p',{'data-details':''},'Task details')))));
 await draw();return{host:target.querySelector('vyp-ha-dialog')!,update:async patch=>{options={...options,...patch};await draw();},unmount:async()=>{await act(()=>root.unmount());}};
});
