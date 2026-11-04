import {afterEach,expect,test,vi} from 'vitest';
import {registerButton} from '../../packages/core/src/components/button.js';
import {registerTabs} from '../../packages/core/src/components/tabs.js';
test('does not define a tag or render on the server; registration rejects even a dependency DOM shim', () => {
  expect(typeof document).toBe('undefined');
  expect(globalThis.customElements?.get('vyp-ha-tabs')).toBeUndefined();
  expect(()=>registerTabs()).toThrow('registerTabs requires a browser CustomElementRegistry');
});

import {registerField} from '../../packages/core/src/components/field.js';
test('field registration rejects server rendering without defining its tag',()=>{
  expect(globalThis.customElements?.get('vyp-ha-field')).toBeUndefined();
  expect(()=>registerField()).toThrow('registerField requires a browser CustomElementRegistry');
});

afterEach(()=>vi.unstubAllGlobals());
test.each([
  ['vyp-ha-button',registerButton,'registerButton requires a browser CustomElementRegistry'],
  ['vyp-ha-tabs',registerTabs,'registerTabs requires a browser CustomElementRegistry'],
  ['vyp-ha-field',registerField,'registerField requires a browser CustomElementRegistry'],
] as const)('rejects %s registration with no registry at all',(tag,register,message)=>{
  vi.stubGlobal('customElements',undefined);
  expect(typeof document).toBe('undefined');
  expect(globalThis.customElements?.get(tag)).toBeUndefined();
  expect(()=>register()).toThrow(message);
  expect(globalThis.customElements?.get(tag)).toBeUndefined();
});

test('button registration rejects a server even with the dependency shim',()=>{expect(typeof document).toBe('undefined');expect(globalThis.customElements?.get('vyp-ha-button')).toBeUndefined();expect(()=>registerButton()).toThrow('registerButton requires a browser CustomElementRegistry');});
