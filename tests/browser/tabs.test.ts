import {afterEach, expect, test, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {navigationState, NavigationInputError} from '../../packages/core/src/contracts.js';
import {HaTabs, registerTabs, type NavigationSelectionEvent} from '../../packages/core/src/components/tabs.js';

const rows = [{id:'overview',label:'Overview',href:'#overview'}, {id:'locked',label:'Locked',href:'#locked',disabled:true}, {id:'tasks',label:'Tasks',href:'#tasks'}];
const model = (patch: Record<string, unknown> = {}) => navigationState({kind:'navigation',label:'Household sections',selected:'overview',items:rows,...patch});
const panels = (patch: Record<string, unknown> = {}) => model({kind:'panels',items:rows.map(({href, ...row}) => row),...patch});
async function mount(state = model()) {
  registerTabs(); const element = document.createElement('vyp-ha-tabs');
  element.state = state; document.body.append(element); await element.updateComplete; return element;
}
const root = (element: HaTabs) => element.shadowRoot!;
const controls = (element: HaTabs) => [...root(element).querySelectorAll<HTMLElement>('[part=item]')];
const intents = (element: HaTabs) => {
  const received: NavigationSelectionEvent[] = [];
  element.addEventListener('ha-selection-request', event => received.push(event)); return received;
};
afterEach(() => { document.body.replaceChildren(); });

test('upgrades an already connected property without replacing the caller state', async () => {
  const element = document.createElement('vyp-ha-tabs');
  element.state = model({label:'Secciones del hogar'}); document.body.append(element);
  registerTabs(); await element.updateComplete;
  expect(element).toBeInstanceOf(HaTabs);
  expect(root(element).querySelector('nav')!.getAttribute('aria-label')).toBe('Secciones del hogar');
  expect(element.state.label).toBe('Secciones del hogar');
});
test('registration is explicit, idempotent and rejects an incompatible constructor', () => {
  registerTabs(); registerTabs(customElements);
  expect(customElements.get('vyp-ha-tabs')).toBe(HaTabs);
  expect(() => registerTabs({get: () => HTMLElement} as unknown as CustomElementRegistry)).toThrow(/conflict/u);
});
test('has an empty labeled navigation before the app supplies state', async () => {
  registerTabs(); const element = document.createElement('vyp-ha-tabs'); document.body.append(element); await element.updateComplete;
  expect(root(element).querySelector('nav')!.getAttribute('aria-label')).toBe('Sections');
  expect(controls(element)).toHaveLength(0);
});
test('navigation exposes real links and current location without tab semantics or executable labels', async () => {
  const element = await mount(model({items:[{id:'overview',label:'<script>literal</script>',href:'#overview'}, ...rows.slice(1)]}));
  const links = controls(element);
  expect(links[0].getAttribute('href')).toBe('#overview'); expect(links[0].getAttribute('aria-current')).toBe('page');
  expect(links[0].textContent).toBe('<script>literal</script>'); expect(root(element).querySelector('script')).toBeNull();
  expect(links[1].getAttribute('href')).toBeNull(); expect(links[1].getAttribute('aria-disabled')).toBe('true'); expect(links[1].tabIndex).toBe(-1);
  expect(links[2].hasAttribute('aria-current')).toBe(false);
  expect(root(element).querySelector('[role=tablist],[role=tab],[role=tabpanel]')).toBeNull();
});
test('one user intent bubbles through a shadow host, is cancelable and does not mutate controlled selection', async () => {
  const container = document.createElement('div'); container.attachShadow({mode:'open'});
  document.body.append(container); const element = await mount(); container.shadowRoot!.append(element);
  const received: NavigationSelectionEvent[] = [];
  document.body.addEventListener('ha-selection-request', event => { received.push(event); event.preventDefault(); }, {once:true});
  const click = new MouseEvent('click',{bubbles:true,composed:true,cancelable:true,button:0});
  controls(element)[2].dispatchEvent(click);
  expect(received).toHaveLength(1); expect(received[0].detail).toEqual({kind:'navigation',id:'tasks'});
  expect(received[0].cancelable).toBe(true); expect(received[0].composed).toBe(true); expect(Object.isFrozen(received[0].detail)).toBe(true);
  expect(click.defaultPrevented).toBe(true); expect(element.state.selected).toBe('overview');
  element.state = model({selected:'tasks'}); await element.updateComplete;
  expect(controls(element)[2].getAttribute('aria-current')).toBe('page'); expect(received).toHaveLength(1);
});
test.each([{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}])('retains native modified navigation without emitting intent: %j', async options => {
  const element = await mount(); const received = intents(element);
  const click = new MouseEvent('click',{bubbles:true,cancelable:true,...options});
  // Stop the fixture navigating only after the component has observed the event.
  element.addEventListener('click', event => event.preventDefault(), {once:true}); controls(element)[2].dispatchEvent(click);
  expect(received).toHaveLength(0); expect(controls(element)[2].getAttribute('href')).toBe('#tasks');
});
test('respects an already canceled click and prevents even synthetic activation of disabled links', async () => {
  const element = await mount(); const received = intents(element);
  const canceled = new MouseEvent('click',{bubbles:true,cancelable:true}); canceled.preventDefault(); controls(element)[2].dispatchEvent(canceled);
  const disabled = new MouseEvent('click',{bubbles:true,cancelable:true}); controls(element)[1].dispatchEvent(disabled);
  expect(disabled.defaultPrevented).toBe(true); expect(received).toHaveLength(0);
});
test('uncanceled navigation keeps the real link default and current controlled location', async () => {
  const element = await mount(); const received = intents(element);
  const click = new MouseEvent('click',{bubbles:true,composed:true,cancelable:true});
  let canceledByComponent = true;
  element.addEventListener('click', event => { canceledByComponent = event.defaultPrevented; event.preventDefault(); }, {once:true});
  controls(element)[2].dispatchEvent(click);
  expect(canceledByComponent).toBe(false); expect(received).toHaveLength(1); expect(element.state.selected).toBe('overview');
});
test('panel tabs own real same-root labeled panels and keep hidden slot content out of focus', async () => {
  const element = await mount(panels());
  const content = document.createElement('button'); content.slot='tasks'; content.textContent='Task content'; element.append(content);
  const tabs = controls(element), sections = [...root(element).querySelectorAll<HTMLElement>('[role=tabpanel]')];
  expect(root(element).querySelector('[role=tablist]')!.getAttribute('aria-label')).toBe('Household sections');
  for (const [index, tab] of tabs.entries()) {
    expect(tab.getAttribute('role')).toBe('tab'); expect(tab.getAttribute('type')).toBe('button');
    expect(tab.getAttribute('aria-controls')).toBe(sections[index].id);
    expect(sections[index].getAttribute('aria-labelledby')).toBe(tab.id);
  }
  expect(tabs.map(tab=>tab.tabIndex)).toEqual([0,-1,-1]); expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  expect(sections.map(panel=>panel.hidden)).toEqual([false,true,true]); expect(content.checkVisibility()).toBe(false);
  element.state=panels({selected:'tasks'}); await element.updateComplete;
  expect(content.checkVisibility()).toBe(true); expect((root(element).querySelector('slot[name=tasks]') as HTMLSlotElement).assignedElements()).toEqual([content]);
});
test('manual keyboard movement skips disabled tabs, wraps, uses Home/End and activates once with Enter/Space', async () => {
  const element = await mount(panels()); const received = intents(element); controls(element)[0].focus();
  await userEvent.keyboard('{ArrowRight}'); await element.updateComplete;
  expect(root(element).activeElement).toBe(controls(element)[2]); expect(received).toHaveLength(0); expect(element.state.selected).toBe('overview');
  await userEvent.keyboard('{ArrowRight}'); expect(root(element).activeElement).toBe(controls(element)[0]);
  await userEvent.keyboard('{ArrowLeft}'); expect(root(element).activeElement).toBe(controls(element)[2]);
  await userEvent.keyboard('{Home}'); expect(root(element).activeElement).toBe(controls(element)[0]);
  await userEvent.keyboard('{End}'); expect(root(element).activeElement).toBe(controls(element)[2]);
  await userEvent.keyboard('{Enter}'); expect(received).toHaveLength(1);
  await userEvent.keyboard(' '); expect(received).toHaveLength(2); expect(received.map(event=>event.detail.id)).toEqual(['tasks','tasks']);
  expect(element.state.selected).toBe('overview');
});
test('RTL reverses horizontal arrow movement and ignores unrelated keys', async () => {
  const element = await mount(panels()); element.dir='rtl'; controls(element)[0].focus();
  await userEvent.keyboard('{ArrowRight}'); expect(root(element).activeElement).toBe(controls(element)[2]);
  await userEvent.keyboard('{ArrowLeft}'); expect(root(element).activeElement).toBe(controls(element)[0]);
  const ignored = new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}); controls(element)[0].dispatchEvent(ignored);
  expect(ignored.defaultPrevented).toBe(false); expect(root(element).activeElement).toBe(controls(element)[0]);
});
test('null selection keeps one enabled keyboard entry without selecting a panel; no enabled items stay inert', async () => {
  const element=await mount(panels({selected:null})); expect(controls(element).map(tab=>tab.tabIndex)).toEqual([0,-1,-1]);
  expect([...root(element).querySelectorAll<HTMLElement>('[role=tabpanel]')].every(panel=>panel.hidden)).toBe(true);
  element.state=panels({selected:null,items:[{id:'locked',label:'Locked',disabled:true}]}); await element.updateComplete;
  const key=new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}); controls(element)[0].dispatchEvent(key);
  expect(key.defaultPrevented).toBe(false); expect(controls(element)[0].tabIndex).toBe(-1);
  element.state=panels({selected:null,items:[]}); await element.updateComplete; expect(controls(element)).toHaveLength(0);
});
test('invalid assignments leave previous validated input and DOM intact', async () => {
  const element=await mount(); const previous=element.state;
  expect(()=>{element.state={...previous,selected:'absent'};}).toThrow(NavigationInputError);
  expect(element.state).toBe(previous); expect(controls(element)[0].getAttribute('aria-current')).toBe('page');
});
test('disconnect/reconnect does not retain duplicate subscriptions or emit property-change events', async () => {
  const element=await mount(panels()); const received=intents(element); element.remove(); document.body.append(element);
  element.state=panels({label:'Secciones',selected:'tasks'}); await element.updateComplete;
  expect(received).toHaveLength(0); await page.getByRole('tab',{name:'Overview',exact:true}).click();
  expect(received).toHaveLength(1); expect(received[0].detail).toEqual({kind:'panels',id:'overview'});
});
test('HA theme tokens update live, the 56px bar scrolls narrowly, and keyboard focus remains visible without motion', async () => {
  const element=await mount(panels({items:Array.from({length:10},(_,n)=>({id:'tab-'+n,label:'Household section '+n})),selected:'tab-0'}));
  element.style.cssText='display:block;width:240px;--primary-text-color:rgb(28,28,28);--card-background-color:rgb(255,255,255);--primary-color:rgb(0,110,180)';
  expect(getComputedStyle(controls(element)[0]).minHeight).toBe('56px');
  const bar=root(element).querySelector<HTMLElement>('.bar')!; expect(bar.scrollWidth).toBeGreaterThan(bar.clientWidth);
  expect(getComputedStyle(controls(element)[0]).color).toBe('rgb(28, 28, 28)');
  element.style.setProperty('--primary-text-color','rgb(235,235,235)'); element.style.setProperty('--card-background-color','rgb(20,20,20)');
  expect(getComputedStyle(controls(element)[0]).color).toBe('rgb(235, 235, 235)');
  expect(getComputedStyle(element.shadowRoot!.querySelector('.frame')!).backgroundColor).toBe('rgb(20, 20, 20)');
  controls(element)[0].focus(); await userEvent.keyboard('{End}');
  const current=root(element).activeElement!; expect(current).toBe(controls(element)[9]);
  expect(current.matches(':focus-visible')).toBe(true); expect(getComputedStyle(current.querySelector('[part=content]')!).outlineStyle).toBe('solid');
  expect(getComputedStyle(current).animationName).toBe('none'); expect(getComputedStyle(current).transitionDuration).toBe('0s');
  expect(bar.scrollLeft).toBeGreaterThan(0);
});

test('reports a missing browser registry without silently falling back to another implementation', () => {
  vi.stubGlobal('customElements', undefined);
  try { expect(()=>registerTabs()).toThrow('registerTabs requires a browser CustomElementRegistry'); }
  finally { vi.unstubAllGlobals(); }
});
test('rejects stale click/key handlers before a replacement input has rendered', async () => {
  const element=await mount(panels()); const old=controls(element)[0], received=intents(element);
  element.state=panels({selected:'tasks'});
  const click=new MouseEvent('click',{bubbles:true,cancelable:true}); old.dispatchEvent(click);
  const key=new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}); old.dispatchEvent(key);
  expect(click.defaultPrevented).toBe(true); expect(key.defaultPrevented).toBe(false); expect(received).toHaveLength(0);
  await element.updateComplete;
});
test.each([{ctrlKey:true},{metaKey:true},{altKey:true}])('does not trap modified keyboard navigation: %j', async options => {
  const element=await mount(panels()); controls(element)[0].focus();
  const key=new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true,...options}); controls(element)[0].dispatchEvent(key);
  expect(key.defaultPrevented).toBe(false); expect(root(element).activeElement).toBe(controls(element)[0]);
});
test('retains a previously canceled keyboard event', async () => {
  const element=await mount(panels()); controls(element)[0].focus();
  const key=new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}); key.preventDefault(); controls(element)[0].dispatchEvent(key);
  expect(root(element).activeElement).toBe(controls(element)[0]);
});

test('leaving a manually focused tab restores the active tab as the next keyboard entry', async () => {
  const element=await mount(panels()); const outside=document.createElement('button'); outside.textContent='Outside'; document.body.append(outside);
  controls(element)[0].focus(); await userEvent.keyboard('{End}'); await element.updateComplete;
  expect(controls(element).map(tab=>tab.tabIndex)).toEqual([-1,-1,0]);
  outside.focus(); await element.updateComplete;
  expect(controls(element).map(tab=>tab.tabIndex)).toEqual([0,-1,-1]); expect(element.state.selected).toBe('overview');
});

test('blur without a related focus target also resets the roving keyboard entry', async () => {
  const element=await mount(panels()); controls(element)[0].focus(); await userEvent.keyboard('{End}'); await element.updateComplete;
  controls(element)[2].blur(); await element.updateComplete;
  expect(controls(element).map(tab=>tab.tabIndex)).toEqual([0,-1,-1]);
});
test('runtime Spanish labels keep the same identities, relationships and single user event', async () => {
  const element=await mount(panels()); const received=intents(element);
  element.state=panels({label:'Secciones del hogar',items:[{id:'overview',label:'Resumen'},{id:'locked',label:'Bloqueado',disabled:true},{id:'tasks',label:'Tareas'}]});
  await element.updateComplete;
  expect(root(element).querySelector('[role=tablist]')!.getAttribute('aria-label')).toBe('Secciones del hogar');
  expect(received).toHaveLength(0); await page.getByRole('tab',{name:'Tareas',exact:true}).click();
  expect(received).toHaveLength(1); expect(received[0].detail.id).toBe('tasks');
  const disabled=new MouseEvent('click',{bubbles:true,cancelable:true}); controls(element)[1].dispatchEvent(disabled);
  expect(disabled.defaultPrevented).toBe(true); expect(received).toHaveLength(1);
});

test('reveals the complete focused destination even when it was already partially visible',async()=>{
  registerTabs();const element=document.createElement('vyp-ha-tabs');element.style.width='400px';
  element.state=navigationState({kind:'navigation',label:'Sections',selected:'one',items:[{id:'one',label:'First long household section',href:'#one'},{id:'two',label:'Second long household section',href:'#two'}]});
  document.body.append(element);await element.updateComplete;
  const bar=element.shadowRoot!.querySelector<HTMLElement>('.bar')!,last=element.shadowRoot!.querySelectorAll<HTMLAnchorElement>('a')[1];
  const before=last.getBoundingClientRect(),boundary=bar.getBoundingClientRect();expect(before.left).toBeLessThan(boundary.right);expect(before.right).toBeGreaterThan(boundary.right);
  last.focus();expect(last.getBoundingClientRect().right).toBeLessThanOrEqual(boundary.right+1);
  last.blur();bar.dispatchEvent(new FocusEvent('focusin',{bubbles:true}));
});
