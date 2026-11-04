import {describe, expect, test} from 'vitest';
import {NavigationInputError, navigationState} from '../../packages/core/src/index.js';

const section = (patch: Record<string, unknown> = {}) => ({id: 'tasks', label: 'Tasks', href: '#tasks', ...patch});
const state = (patch: Record<string, unknown> = {}) => ({kind: 'navigation', label: 'Household sections', selected: 'tasks', items: [section()], ...patch});

function rejected(value: unknown) {
  expect(() => navigationState(value)).toThrow(NavigationInputError);
  try { navigationState(value); } catch (error) {
    expect(error).toBeInstanceOf(NavigationInputError);
    expect((error as NavigationInputError).code).toBe('invalid_navigation');
    expect((error as Error).message).toBe('invalid_navigation');
  }
}

describe('framework-neutral navigation contracts', () => {
  test('imports and validates without browser globals or application identity', () => {
    expect(typeof document).toBe('undefined');
    expect(navigationState(state())).toEqual({...state(),scrollStartLabel:'Scroll to start',scrollEndLabel:'Scroll to end', items: [{...section(), disabled: false, iconPath:null, showLabel:true}]});
  });
  test('takes immutable independent snapshots without altering caller objects', () => {
    const source = state(), value = navigationState(source);
    expect(value).not.toBe(source); expect(value.items).not.toBe(source.items);
    expect(value.items[0]).not.toBe(source.items[0]);
    source.items[0].label = 'Changed'; source.items.push(section({id: 'other'}));
    expect(value.items).toHaveLength(1); expect(value.items[0].label).toBe('Tasks');
    expect(Object.isFrozen(value)).toBe(true); expect(Object.isFrozen(value.items)).toBe(true);
    expect(Object.isFrozen(value.items[0])).toBe(true);
  });
  test('retains literal multilingual labels and valid supplementary code points', () => {
    const label = 'Tareas 🧹 <script>literal</script>';
    expect(navigationState(state({label, items: [section({label})]})).label).toBe(label);
    expect(navigationState(state({label: '🧹'.repeat(256)})).label).toHaveLength(512);
    expect(navigationState(state({items: [section({id: 'a'.repeat(128)})], selected: 'a'.repeat(128)})).selected).toHaveLength(128);
  });
  test('supports an explicit empty state and no automatic destination selection', () => {
    expect(navigationState(state({items: [], selected: null})).items).toEqual([]);
    expect(navigationState(state({selected: null})).selected).toBeNull();
  });
  test('panel mode uses IDs for slots and accepts no link target', () => {
    const value = navigationState(state({kind: 'panels', items: [{id: 'tasks', label: 'Tasks'}]}));
    expect(value.items[0]).toEqual({id: 'tasks', label: 'Tasks', disabled: false, href: null, iconPath:null, showLabel:true});
    expect(navigationState(state({kind: 'panels', items: [section({href: null})]}))).toEqual(value);
  });
  test('disabled items remain identifiable but cannot become selected', () => {
    const value = navigationState(state({selected: null, items: [section({disabled: true})]}));
    expect(value.items[0].disabled).toBe(true);
    rejected(state({items: [section({disabled: true})]}));
  });
  test.each(['#tasks', '/tasks?status=open', './tasks', '../tasks', '?view=agenda', 'https://example.invalid/tasks', 'http://example.invalid:8123/tasks'])('preserves the application-owned safe link %s', href => {
    expect(navigationState(state({items: [section({href})]})).items[0].href).toBe(href);
  });
  test('accepts exactly sixty-four distinct items without truncating the model', () => {
    const items = Array.from({length: 64}, (_, n) => section({id: 'section-' + n}));
    expect(navigationState(state({items, selected: 'section-63'})).items).toHaveLength(64);
  });
  test.each([null, undefined, true, 'navigation', [], {}, {...state(), userId: 'private'}, {...state(), kind: 'unknown'}, {...state(), selected: undefined}])('rejects invalid or extended state %j', rejected);
  test.each([null, [], true, {}, {...section(), html: '<button>unsafe</button>'}])('rejects invalid or extended items %j', item => rejected(state({items: [item]})));
  test.each([null, {}, 'items', Array.from({length: 65}, (_, n) => section({id: 'i-' + n}))])('rejects malformed or excessive item lists', items => rejected(state({items})));
  test('rejects duplicate identifiers without choosing one arbitrarily', () => rejected(state({items: [section(), section()]})));
  test.each(['', ' ', 'a b', 'a/b', 'a'.repeat(129), 'á', 'a:b'])('rejects unsupported identifier %j', id => rejected(state({items: [section({id})], selected: id})));
  test.each(['missing', 3, false, {}])('rejects a missing or malformed current destination %j', selected => rejected(state({selected})));
  test.each(['', ' ', 3, null, '\u0000bad', '\u007Fbad', '\ud800', '🧹'.repeat(257)])('rejects invalid accessible label %j', label => rejected(state({label})));
  test.each(['', null, 3, '\u0001', '\udfff', 'x'.repeat(257)])('rejects invalid item label %j', label => rejected(state({items: [section({label})]})));
  test.each([null, 1, 'false'])('does not coerce disabled %j to a boolean', disabled => rejected(state({items: [section({disabled})]})));
  test.each(['javascript:alert(1)', 'data:text/html,unsafe', 'file:///private/data', '//example.invalid', '\\example.invalid', 'https://user:password@example.invalid', 'https://user@example.invalid', 'https://:password@example.invalid', 'http://[invalid', ' #tasks', '#tasks ', '', null, 3, 'x'.repeat(2049)])('rejects unsafe or malformed links %j', href => rejected(state({items: [section({href})]})));
  test('rejects a link in panel mode instead of silently changing interaction semantics', () => rejected(state({kind: 'panels'})));
});

// Regression for the reviewed Unicode control boundary.
test.each(Array.from({length: 32}, (_, index) => (0x80 + index).toString(16)))(
  'rejects Unicode C1 control U+%s in labels and links', code => {
    const control = String.fromCodePoint(Number.parseInt(code, 16));
    rejected(state({label: 'A' + control + 'B'}));
    rejected(state({items: [section({label: 'A' + control + 'B'})]}));
    rejected(state({items: [section({href: '#A' + control + 'B'})]}));
  },
);
test('preserves visible Unicode just beyond the C1 boundary', () => {
  const label = 'A\u00a0¡B';
  expect(navigationState(state({label, items: [section({label})]})).items[0].label).toBe(label);
});

test('navigation icons default to visible labels and no path without changing selection authority',()=>{
 const value=navigationState(state());expect(value.items[0].iconPath).toBeNull();expect(value.items[0].showLabel).toBe(true);
});
test('local path data and the visible-label choice survive immutable snapshots in either semantic mode',()=>{
 for(const kind of ['navigation','panels']){
  const item:Record<string,unknown>=section({href:kind==='navigation'?'#tasks':null,iconPath:'M3 11L12 3L21 11V21H3Z',showLabel:false});
  const value=navigationState(state({kind,items:[item]}));item.iconPath='M0 0H1V1Z';item.showLabel=true;
  expect(value.items[0].iconPath).toBe('M3 11L12 3L21 11V21H3Z');expect(value.items[0].showLabel).toBe(false);
  expect(value.items[0].label).toBe('Tasks');expect(Object.isFrozen(value.items[0])).toBe(true);
 }
});
test.each([undefined,null])('an omitted/null path keeps the text presentation: %s',iconPath=>{
 expect(navigationState(state({items:[section({iconPath})]})).items[0].iconPath).toBeNull();
});
test('accepts bounded local SVG path command data, including relative/arc/exponent forms',()=>{
 for(const iconPath of ['M0 0L24 24Z','m1.5 2e-1c0 1 2 3 4 5s1 2 3 4q1 2 3 4t1 2a1 1 0 0 1 2 2z','M0 0'+' L0 0'.repeat(3276)])
  expect(navigationState(state({items:[section({iconPath,showLabel:true})]})).items[0].iconPath).toBe(iconPath);
});
test.each(['', ' ', 'M', '0 0L1 1', '<svg onload="alert(1)">', 'https://example.invalid/icon.svg', 'javascript:alert(1)', 'M0 0\u0080L1 1', 'M0 0\nL1 1', 'M0 0'+' L0 0'.repeat(3277), 3, false, {}, []])('rejects malformed/local-path boundary %j',iconPath=>rejected(state({items:[section({iconPath})]})));
test.each([null,0,1,'false',{}])('does not coerce visible-label choice %j',showLabel=>rejected(state({items:[section({iconPath:'M0 0H24V24Z',showLabel})]})));
test.each([undefined,null])('cannot hide a label without a local icon: %s',iconPath=>rejected(state({items:[section({iconPath,showLabel:false})]})));
test('an icon-only item still requires its full nonempty accessible label',()=>rejected(state({items:[section({label:'',iconPath:'M0 0H24V24Z',showLabel:false})]})));

test('navigation scroll labels have an English fallback and accept localized controlled text',()=>{
 const fallback=navigationState(state());expect(fallback.scrollStartLabel).toBe('Scroll to start');expect(fallback.scrollEndLabel).toBe('Scroll to end');
 const value=navigationState(state({scrollStartLabel:'Desplazar al inicio',scrollEndLabel:'Desplazar al final'}));expect(value.scrollStartLabel).toBe('Desplazar al inicio');expect(value.scrollEndLabel).toBe('Desplazar al final');
});
test.each(['', ' ', null, false, 3, '\u0080', 'x'.repeat(257)])('rejects invalid scroll control labels %j',label=>{
 rejected(state({scrollStartLabel:label}));rejected(state({scrollEndLabel:label}));
});
