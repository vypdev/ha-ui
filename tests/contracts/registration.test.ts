import {expect, test} from 'vitest';
import {registerTabs} from '../../packages/core/src/components/tabs.js';
test('does not define a tag or render on the server; registration rejects even a dependency DOM shim', () => {
  expect(typeof document).toBe('undefined');
  expect(globalThis.customElements.get('vyp-ha-tabs')).toBeUndefined();
  expect(()=>registerTabs()).toThrow('registerTabs requires a browser CustomElementRegistry');
});
