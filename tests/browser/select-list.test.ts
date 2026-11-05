import {afterEach,expect,test} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {selectState,type SelectSelection} from '../../packages/core/src/select-contracts.js';
import {registerSelect,type HaSelect,type SelectValueEvent} from '../../packages/core/src/components/select.js';

const options=[{value:1,label:'Maintenance'},{value:'1',label:'Shopping'},{value:false,label:'Other'},{value:'archived',label:'Archived',disabled:true}];
async function mount(multiple=false,value:SelectSelection=1,patch:Record<string,unknown>={}){
 registerSelect();const form=document.createElement('form'),host=document.createElement('vyp-ha-select');host.style.width='320px';host.name='category';host.state=selectState({mode:'list',label:'Category',options,multiple,...patch});host.defaultValue=value;form.append(host);document.body.append(form);await host.updateComplete;
 const seen:SelectValueEvent[]=[];host.addEventListener('ha-select-request',event=>seen.push(event));return{host,form,seen};
}
const choice=(host:HaSelect,name:string,role:'radio'|'checkbox'='radio')=>page.elementLocator(host).getByRole(role,{name,exact:true});
const accept=(host:HaSelect)=>host.addEventListener('ha-select-request',event=>{host.value=event.detail.value;});
afterEach(()=>document.body.replaceChildren());

test('an explicit single list exposes a named native radio group and preserves disabled options',async()=>{
 const{host,seen}=await mount();await expect.element(page.elementLocator(host).getByRole('radiogroup',{name:'Category',exact:true})).toBeVisible();expect(host.shadowRoot!.querySelector('select')).toBeNull();
 const selected=choice(host,'Maintenance');await expect.element(selected).toBeChecked();expect((selected.element() as HTMLInputElement).type).toBe('radio');await expect.element(choice(host,'Shopping')).not.toBeChecked();await expect.element(choice(host,'Archived')).toBeDisabled();expect(seen).toHaveLength(0);
});

test('radio pointer cancellation restores the accepted choice, then keyboard selection submits one typed value',async()=>{
 const{host,form,seen}=await mount();const reject=(event:SelectValueEvent)=>event.preventDefault();host.addEventListener('ha-select-request',reject);
 await choice(host,'Shopping').click();expect(seen[0].detail).toEqual({value:'1',reason:'change'});expect(host.value).toBe(1);await expect.element(choice(host,'Maintenance')).toBeChecked();await expect.element(choice(host,'Shopping')).not.toBeChecked();
 host.removeEventListener('ha-select-request',reject);accept(host);await choice(host,'Shopping').click();await host.updateComplete;expect(host.value).toBe('1');await userEvent.keyboard('{ArrowDown}');await host.updateComplete;expect(host.value).toBe(false);expect(seen.map(event=>event.detail.value)).toEqual(['1','1',false]);expect([...new FormData(form)]).toEqual([['category','false']]);
});

test('multiple list checkbox changes keep typed model order, native entry order and the controlled reset',async()=>{
 const{host,form,seen}=await mount(true,[false,1]);accept(host);await expect.element(page.elementLocator(host).getByRole('group',{name:'Category',exact:true})).toBeVisible();expect(host.shadowRoot!.querySelector('select')).toBeNull();
 const maintenance=choice(host,'Maintenance','checkbox'),shopping=choice(host,'Shopping','checkbox'),other=choice(host,'Other','checkbox');await expect.element(maintenance).toBeChecked();await expect.element(other).toBeChecked();
 const first=maintenance.element().getBoundingClientRect(),second=shopping.element().getBoundingClientRect();expect(first.height).toBeGreaterThanOrEqual(40);expect(first.width).toBeGreaterThanOrEqual(40);expect(first.bottom).toBeLessThanOrEqual(second.top);
 await shopping.click();await host.updateComplete;expect(host.value).toEqual([false,1,'1']);expect([...new FormData(form)]).toEqual([['category','1'],['category','1'],['category','false']]);
 await other.click();await host.updateComplete;expect(host.value).toEqual([1,'1']);form.reset();await host.updateComplete;expect(host.value).toEqual([false,1]);await expect.element(other).toBeChecked();await expect.element(shopping).not.toBeChecked();expect(seen.map(event=>event.detail.reason)).toEqual(['change','change','reset']);
});

test('a required empty list blocks submission and moves imperative focus to an enabled option',async()=>{
 const{host,form}=await mount(true,[],{required:true,requiredMessage:'Choose categories.'});accept(host);const submissions:Event[]=[];form.addEventListener('submit',event=>{event.preventDefault();submissions.push(event);});
 form.requestSubmit();await host.updateComplete;expect(submissions).toHaveLength(0);expect(host.validity.valueMissing).toBe(true);await expect.element(page.elementLocator(host).getByText('Choose categories.',{exact:true}).last()).toBeVisible();
 host.focus();expect(host.shadowRoot!.activeElement).toBe(choice(host,'Maintenance','checkbox').element());await userEvent.keyboard(' ');await host.updateComplete;expect(host.validity.valid).toBe(true);form.requestSubmit();expect(submissions).toHaveLength(1);expect([...new FormData(form)]).toEqual([['category','1']]);
});

test('stale native list inputs cannot propose a value after configuration replacement or disconnect',async()=>{
 const{host,form,seen}=await mount(true,[1]);const retired=choice(host,'Shopping','checkbox').element() as HTMLInputElement;host.state=selectState({...host.state,options:[{value:2,label:'Replacement'}]});retired.click();await host.updateComplete;expect(seen).toHaveLength(0);expect(host.value).toEqual([1]);
 const current=choice(host,'Replacement','checkbox').element() as HTMLInputElement;host.remove();current.click();expect(seen).toHaveLength(0);form.append(host);current.click();expect(seen).toHaveLength(0);await host.updateComplete;accept(host);await choice(host,'Replacement','checkbox').click();await host.updateComplete;expect(seen).toHaveLength(1);expect(host.value).toEqual([1,2]);expect([...new FormData(form)]).toEqual([['category','2']]);
});

test('disabled fieldsets block native choices and switching back to auto preserves the legacy select',async()=>{
 const{host,form,seen}=await mount(false,1,{description:'Choose a household category.'});const fieldset=document.createElement('fieldset');form.append(fieldset);fieldset.append(host);fieldset.disabled=true;await host.updateComplete;await expect.element(choice(host,'Maintenance')).toBeDisabled();expect([...new FormData(form)]).toEqual([]);expect(seen).toHaveLength(0);
 fieldset.disabled=false;host.state=selectState({...host.state,mode:'auto',size:4});await host.updateComplete;const legacy=page.elementLocator(host).getByRole('listbox',{name:'Category',exact:true});await expect.element(legacy).toBeVisible();expect(legacy.element()).toBeInstanceOf(HTMLSelectElement);expect(legacy.element().getAttribute('aria-describedby')).toBe('help');expect(host.value).toBe(1);expect([...new FormData(form)]).toEqual([['category','1']]);
});

test('an empty visible list retains the group name, announces its status and has no focus target',async()=>{
 const{host,form}=await mount(false,null,{options:[],emptyMessage:'No categories available.'});
 const group=page.elementLocator(host).getByRole('radiogroup',{name:'Category',exact:true});
 await expect.element(group.getByRole('status')).toHaveTextContent('No categories available.');expect(group.element().querySelector('input')).toBeNull();
 host.focus();host.blur();expect(host.shadowRoot!.activeElement).toBeNull();expect([...new FormData(form)]).toEqual([]);
});

test('blur leaves the currently focused choice and reveals required guidance',async()=>{
 const{host}=await mount(false,null,{required:true,requiredMessage:'Choose a category.'});
 const focused=choice(host,'Other').element() as HTMLInputElement;focused.focus();expect(host.shadowRoot!.activeElement).toBe(focused);
 host.blur();await host.updateComplete;expect(host.shadowRoot!.activeElement).toBeNull();
 const group=page.elementLocator(host).getByRole('radiogroup',{name:'Category',exact:true});await expect.element(group).toHaveAttribute('aria-invalid','true');
 await expect.element(page.elementLocator(host).getByText('Choose a category.',{exact:true})).toBeVisible();
});

test('native change events from retired or unchanged choices cannot propose a replacement',async()=>{
 const{host,seen}=await mount();const selected=choice(host,'Maintenance').element() as HTMLInputElement,other=choice(host,'Other').element() as HTMLInputElement,disabled=choice(host,'Archived').element() as HTMLInputElement;
 const change=(input:HTMLInputElement,checked:boolean)=>{input.checked=checked;input.dispatchEvent(new Event('change',{bubbles:true}));};
 change(selected,true);change(selected,false);change(disabled,true);expect(selected.checked).toBe(true);expect(disabled.checked).toBe(false);expect(seen).toHaveLength(0);
 host.disabled=true;change(other,true);expect(other.checked).toBe(false);host.disabled=false;await host.updateComplete;
 host.value='1';change(other,true);await host.updateComplete;expect(host.value).toBe('1');expect(seen).toHaveLength(0);
 other.remove();change(other,true);expect(seen).toHaveLength(0);
 host.state=selectState({...host.state,mode:'dropdown'});change(selected,true);await host.updateComplete;expect(seen).toHaveLength(0);
});

test('a full visible checklist permits removal and retains unknown values without overflowing',async()=>{
 const full=Array.from({length:256},(_,index)=>index),{host,form,seen}=await mount(true,full);accept(host);
 const maintenance=choice(host,'Maintenance','checkbox'),shopping=choice(host,'Shopping','checkbox');
 await expect.element(shopping).toBeDisabled();await expect.element(maintenance).toBeEnabled();
 const blocked=shopping.element() as HTMLInputElement;blocked.checked=true;blocked.dispatchEvent(new Event('change',{bubbles:true}));expect(blocked.checked).toBe(false);expect(seen).toHaveLength(0);
 await maintenance.click();await host.updateComplete;expect(host.value).toEqual(full.filter(value=>value!==1));
 await shopping.click();await host.updateComplete;expect(host.value).toEqual([...full.filter(value=>value!==1),'1']);expect([...new FormData(form)]).toEqual([['category','1']]);
});
