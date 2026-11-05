import {afterEach,expect,test,vi} from 'vitest';
import {registerCheckbox} from '../../packages/core/src/components/checkbox.js';
import {registerSelect} from '../../packages/core/src/components/select.js';
import {registerButton} from '../../packages/core/src/components/button.js';
import {registerDialog} from '../../packages/core/src/components/dialog.js';
import {registerCard} from '../../packages/core/src/components/card.js';
import {registerGrid,registerRow} from '../../packages/core/src/components/layout.js';
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
  ['vyp-ha-checkbox',registerCheckbox,'registerCheckbox requires a browser CustomElementRegistry'],
  ['vyp-ha-select',registerSelect,'registerSelect requires a browser CustomElementRegistry'],
  ['vyp-ha-button',registerButton,'registerButton requires a browser CustomElementRegistry'],
  ['vyp-ha-tabs',registerTabs,'registerTabs requires a browser CustomElementRegistry'],
  ['vyp-ha-field',registerField,'registerField requires a browser CustomElementRegistry'],
  ['vyp-ha-dialog',registerDialog,'registerDialog requires a browser CustomElementRegistry'],
  ['vyp-ha-card',registerCard,'registerCard requires a browser CustomElementRegistry'],
  ['vyp-ha-row',registerRow,'Layout registration requires a browser CustomElementRegistry'],
  ['vyp-ha-grid',registerGrid,'Layout registration requires a browser CustomElementRegistry'],
] as const)('rejects %s registration with no registry at all',(tag,register,message)=>{
  vi.stubGlobal('customElements',undefined);
  expect(typeof document).toBe('undefined');
  expect(globalThis.customElements?.get(tag)).toBeUndefined();
  expect(()=>register()).toThrow(message);
  expect(globalThis.customElements?.get(tag)).toBeUndefined();
});

test('button registration rejects a server even with the dependency shim',()=>{expect(typeof document).toBe('undefined');expect(globalThis.customElements?.get('vyp-ha-button')).toBeUndefined();expect(()=>registerButton()).toThrow('registerButton requires a browser CustomElementRegistry');});

test('select registration rejects a server even with the dependency shim',()=>{expect(typeof document).toBe('undefined');expect(globalThis.customElements?.get('vyp-ha-select')).toBeUndefined();expect(()=>registerSelect()).toThrow('registerSelect requires a browser CustomElementRegistry');});

test('checkbox registration rejects a server even with a dependency registry shim',()=>{expect(typeof document).toBe('undefined');expect(globalThis.customElements?.get('vyp-ha-checkbox')).toBeUndefined();expect(()=>registerCheckbox()).toThrow('registerCheckbox requires a browser CustomElementRegistry');});

test('dialog registration rejects a server without registering its button dependency',()=>{expect(typeof document).toBe('undefined');expect(()=>registerDialog()).toThrow('registerDialog requires a browser CustomElementRegistry');expect(globalThis.customElements?.get('vyp-ha-dialog')).toBeUndefined();expect(globalThis.customElements?.get('vyp-ha-button')).toBeUndefined();});

test('card registration rejects server rendering without defining its tag',()=>{expect(typeof document).toBe('undefined');expect(()=>registerCard()).toThrow('registerCard requires a browser CustomElementRegistry');expect(globalThis.customElements?.get('vyp-ha-card')).toBeUndefined();});


test('layout imports leave both tags unregistered in a DOM-free process with a registry shim',()=>{
 expect(typeof document).toBe('undefined');
 expect(()=>registerRow()).toThrow('Layout registration requires a browser CustomElementRegistry');
 expect(()=>registerGrid()).toThrow('Layout registration requires a browser CustomElementRegistry');
 expect(globalThis.customElements?.get('vyp-ha-row')).toBeUndefined();
 expect(globalThis.customElements?.get('vyp-ha-grid')).toBeUndefined();
});
