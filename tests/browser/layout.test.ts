import {afterEach,expect,test} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {gridState,rowState} from '../../packages/core/src/layout-contracts.js';
import {registerGrid,registerRow} from '../../packages/core/src/components/layout.js';

afterEach(()=>document.body.replaceChildren());

test('rows use list-item semantics, wrap labels and preserve native projected controls',async()=>{
 registerRow();const list=document.createElement('div'),row=document.createElement('vyp-ha-row'),button=document.createElement('button');
 list.setAttribute('role','list');list.style.cssText='width:180px;font:400 14px/1.6 sans-serif;';
 row.state=rowState({label:'Review kitchen supplies',description:'Check the shared shopping list.'});button.slot='trailing';button.textContent='Review';
 let clicks=0;button.addEventListener('click',()=>clicks++);row.append(button);list.append(row);document.body.append(list);await row.updateComplete;
 const semantics=page.getByRole('list').getByRole('listitem');
 await expect.element(semantics.getByText('Review kitchen supplies',{exact:true})).toBeVisible();
 await expect.element(semantics.getByText('Check the shared shopping list.',{exact:true})).toBeVisible();
 expect(row.scrollWidth).toBe(180);
 await userEvent.keyboard('{Tab}');expect(document.activeElement).toBe(button);await userEvent.keyboard('{Enter}');expect(clicks).toBe(1);
 row.state=rowState({label:'Supplies'});await row.updateComplete;
 expect(row.shadowRoot!.querySelector('[part=description]')).toBeNull();expect(row.tabIndex).toBe(-1);
});

test('a responsive grid reduces columns without rebuilding or reordering focused children',async()=>{
 registerGrid();const grid=document.createElement('vyp-ha-grid');
 grid.style.width='480px';grid.state=gridState({columns:3,minColumnWidth:150,label:'Household tasks'});
 const children=['Supplies','Cleaning','Plants','Review'].map(label=>Object.assign(document.createElement('button'),{textContent:label}));
 grid.append(...children);document.body.append(grid);await grid.updateComplete;
 const surface=grid.shadowRoot!.querySelector<HTMLElement>('[part=grid]')!;
 await expect.element(page.getByRole('region',{name:'Household tasks'})).toBeVisible();
 expect(getComputedStyle(surface).gridTemplateColumns.split(' ')).toHaveLength(3);
 children[1].focus();grid.style.width='300px';
 expect(getComputedStyle(surface).gridTemplateColumns).toBe('300px');
 expect(document.activeElement).toBe(children[1]);await userEvent.keyboard('{Tab}');expect(document.activeElement).toBe(children[2]);
 expect(Array.from(grid.children)).toEqual(children);
 grid.state=gridState({columns:2,square:true});await grid.updateComplete;
 expect(surface.getAttribute('role')).toBeNull();
 expect(getComputedStyle(surface).gridTemplateColumns.split(' ')).toHaveLength(2);
 expect(children[0].getBoundingClientRect().width).toBeCloseTo(children[0].getBoundingClientRect().height,1);
});

test('an unconfigured row exposes no empty list item, then upgrades without replacing the host',async()=>{
 registerRow();const row=document.createElement('vyp-ha-row');document.body.append(row);await row.updateComplete;
 expect(row.shadowRoot!.querySelector('[role=listitem]')).toBeNull();
 row.state=rowState({label:'<b>Tasks</b>'});await row.updateComplete;
 expect(row.shadowRoot!.querySelector('[part=label]')!.textContent).toBe('<b>Tasks</b>');
 expect(row.shadowRoot!.querySelector('b')).toBeNull();
 row.hidden=true;expect(getComputedStyle(row).display).toBe('none');
});

test('registration is idempotent and an incompatible constructor stays untouched',()=>{
 registerRow();registerGrid();registerRow(customElements);registerGrid(customElements);
 class ForeignLayout extends HTMLElement {}
 const registry={get:()=>ForeignLayout} as unknown as CustomElementRegistry;
 expect(()=>registerRow(registry)).toThrow(/vyp-ha-row registration conflict/u);
 expect(()=>registerGrid(registry)).toThrow(/vyp-ha-grid registration conflict/u);
});
