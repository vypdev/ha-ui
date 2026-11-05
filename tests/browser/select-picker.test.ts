import {afterEach,expect,test,vi} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {selectState} from '../../packages/core/src/select-contracts.js';
import {registerSelect,type HaSelect,type SelectValueEvent} from '../../packages/core/src/components/select.js';
import {SelectionPopup} from '../../packages/core/src/components/selection-popup.js';

const options=[{value:1,label:'Maintenance'},{value:'1',label:'Shopping'},{value:false,label:'Other'},{value:'archived',label:'Archived',disabled:true}];
async function mount(patch:Record<string,unknown>={}){
 registerSelect();const form=document.createElement('form'),host=document.createElement('vyp-ha-select');host.style.width='320px';host.state=selectState({label:'Category',options,...patch});host.name='category';host.value=1;form.append(host);document.body.append(form);await host.updateComplete;
 const seen:SelectValueEvent[]=[];host.addEventListener('ha-select-request',event=>seen.push(event));return{host,form,seen};
}
const combo=(host:HaSelect)=>page.elementLocator(host).getByRole('combobox',{name:'Category',exact:true});
const list=(host:HaSelect)=>page.elementLocator(host).getByRole('listbox',{name:'Category',exact:true,includeHidden:true});
afterEach(()=>{document.body.replaceChildren();vi.restoreAllMocks();});

test('single picker paints the HA filled field and exposes a separate listbox',async()=>{
 const{host}=await mount();expect(combo(host).element().tagName).toBe('BUTTON');expect(combo(host).element().getBoundingClientRect().height).toBe(56);
 expect(combo(host).element().textContent).toContain('Maintenance');await expect.element(combo(host)).toHaveAttribute('aria-expanded','false');await expect.element(list(host)).not.toBeVisible();
 await combo(host).click();await expect.element(combo(host)).toHaveAttribute('aria-expanded','true');await expect.element(list(host)).toBeVisible();await expect.element(list(host).getByRole('option',{name:'Archived',exact:true})).toBeDisabled();
});
test('navigation previews typed options and Escape retains the accepted model without requests',async()=>{
 const{host,seen}=await mount();host.focus();await userEvent.keyboard('{ArrowDown}');await expect.element(list(host)).toBeVisible();const original=combo(host).element().getAttribute('aria-activedescendant');
 await userEvent.keyboard('{ArrowDown}');expect(combo(host).element().getAttribute('aria-activedescendant')).not.toBe(original);expect(host.value).toBe(1);expect(seen).toHaveLength(0);
 await userEvent.keyboard('{Escape}');await expect.element(list(host)).not.toBeVisible();expect(host.value).toBe(1);expect(seen).toHaveLength(0);expect(host.shadowRoot!.activeElement).toBe(combo(host).element());
});
test('typeahead followed by Tab commits one controlled typed request and leaves normal focus order',async()=>{
 const{host,form,seen}=await mount({clearable:false});host.addEventListener('ha-select-request',event=>{host.value=event.detail.value;});const after=document.createElement('button');after.textContent='After';form.append(after);host.focus();
 await userEvent.keyboard('o{Tab}');await host.updateComplete;expect(host.value).toBe(false);expect(seen).toHaveLength(1);expect(seen[0].detail).toEqual({value:false,reason:'change'});expect([...new FormData(form)]).toEqual([['category','false']]);expect(document.activeElement).toBe(after);
});
test('pointer selection preserves primitive identity and restores the controlled projection after cancellation',async()=>{
 const{host,seen}=await mount();host.addEventListener('ha-select-request',event=>event.preventDefault());await combo(host).click();await list(host).getByRole('option',{name:'Shopping',exact:true}).click();
 expect(seen).toHaveLength(1);expect(seen[0].detail.value).toBe('1');expect(host.value).toBe(1);await expect.element(combo(host)).toHaveAttribute('aria-expanded','false');expect(combo(host).element().textContent).toContain('Maintenance');
});
test('disabled fields and fieldsets cannot open the popup or emit requests',async()=>{
 const{host,form,seen}=await mount();const fieldset=document.createElement('fieldset');fieldset.disabled=true;form.append(fieldset);fieldset.append(host);await host.updateComplete;expect((combo(host).element() as HTMLButtonElement).disabled).toBe(true);
 combo(host).element().dispatchEvent(new MouseEvent('click',{bubbles:true}));host.focus();await userEvent.keyboard('{ArrowDown}');await expect.element(list(host)).not.toBeVisible();expect(seen).toHaveLength(0);expect([...new FormData(form)]).toEqual([]);
});

test('arrows, Home/End and Space preview only enabled options, then commit once',async()=>{
 const{host,seen}=await mount();host.addEventListener('ha-select-request',event=>{host.value=event.detail.value;});host.focus();await userEvent.keyboard('{ArrowUp}');
 await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-2');await userEvent.keyboard('{Home}');await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-0');
 await userEvent.keyboard('{End}{ArrowDown}');await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-2');expect(host.value).toBe(1);expect(seen).toHaveLength(0);
 await userEvent.keyboard(' ');expect(host.value).toBe(false);expect(seen).toHaveLength(1);await expect.element(list(host)).not.toBeVisible();
 await userEvent.keyboard('{Enter}{Enter}');expect(seen).toHaveLength(1);await expect.element(list(host)).not.toBeVisible();await userEvent.keyboard('{Escape}{Tab}');expect(seen).toHaveLength(1);
});
test('closed Home, End and Space open the corresponding keyboard preview without changing the model',async()=>{
 const{host,seen}=await mount();host.focus();await userEvent.keyboard('{End}');await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-2');
 await userEvent.keyboard('{Escape}{Home}');await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-0');await userEvent.keyboard('{Escape} ');await expect.element(list(host)).toBeVisible();expect(seen).toHaveLength(0);expect(host.value).toBe(1);
});
test('empty/all-disabled menus preserve unavailable models when Tab or Enter cannot choose a value',async()=>{
 const{host,seen}=await mount({options:[],emptyMessage:'No categories.'});const after=document.createElement('button');after.textContent='After';document.body.append(after);host.focus();
 await userEvent.keyboard('{Enter}');await expect.element(list(host).getByRole('option',{name:'No categories.',exact:true})).toBeDisabled();await expect.element(combo(host)).not.toHaveAttribute('aria-activedescendant');
 await userEvent.keyboard('{Tab}');expect(host.value).toBe(1);expect(seen).toHaveLength(0);await expect.element(list(host)).not.toBeVisible();
 host.focus();await userEvent.keyboard('{Enter}{Enter}');await expect.element(list(host)).not.toBeVisible();expect(host.value).toBe(1);
 host.state=selectState({label:'Category',options:options.map(option=>({...option,disabled:true}))});await host.updateComplete;host.focus();await userEvent.keyboard('{ArrowUp}{ArrowDown}{Tab}');expect(host.value).toBe(1);expect(seen).toHaveLength(0);
});
test('the localized clear action is keyboard accessible, controlled and omitted when required or disabled',async()=>{
 const{host,form,seen}=await mount({clearLabel:'Borrar selección'});const clear=page.elementLocator(host).getByRole('button',{name:'Borrar selección',exact:true});host.focus();await userEvent.keyboard('{Tab}');expect(host.shadowRoot!.activeElement).toBe(clear.element());
 expect(clear.element().getBoundingClientRect().height).toBe(44);expect(clear.element().getBoundingClientRect().width).toBe(44);await userEvent.keyboard('{Enter}');expect(seen).toHaveLength(1);expect(seen[0].detail).toEqual({value:null,reason:'change'});expect(host.value).toBe(1);expect([...new FormData(form)]).toEqual([['category','1']]);
 host.addEventListener('ha-select-request',event=>{host.value=event.detail.value;});await clear.click();await host.updateComplete;expect(host.value).toBe(null);expect(seen).toHaveLength(2);expect([...new FormData(form)]).toEqual([]);await expect.element(clear).not.toBeInTheDocument();
 host.value=1;host.state=selectState({...host.state,required:true});await host.updateComplete;await expect.element(clear).not.toBeInTheDocument();host.state=selectState({...host.state,required:false});host.disabled=true;await host.updateComplete;await expect.element(clear).not.toBeInTheDocument();
});
test('clicking the trigger again, an outside pointer, blur, reset and restoration close without stray changes',async()=>{
 const{host,form,seen}=await mount();await combo(host).click();await combo(host).click();await expect.element(list(host)).not.toBeVisible();
 await combo(host).click();const outside=document.createElement('button');outside.textContent='Outside';outside.style.cssText='position:fixed;right:8px;bottom:8px';document.body.append(outside);await userEvent.click(outside);await expect.element(list(host)).not.toBeVisible();expect(seen).toHaveLength(0);expect(document.activeElement).toBe(outside);
 await combo(host).click();host.blur();await expect.element(list(host)).not.toBeVisible();expect(seen).toHaveLength(0);
 await combo(host).click();form.reset();await expect.element(list(host)).not.toBeVisible();expect(seen).toHaveLength(1);expect(seen[0].detail.reason).toBe('reset');
 await combo(host).click();host.formStateRestoreCallback('false','restore');await expect.element(list(host)).not.toBeVisible();expect(seen).toHaveLength(2);expect(seen[1].detail).toEqual({value:false,reason:'restore'});
});
test('native popup closure reconciles aria-expanded and disconnect removes listeners before reconnect',async()=>{
 const{host,seen}=await mount();await combo(host).click();const surface=host.shadowRoot!.getElementById('options')!;surface.hidePopover();await expect.element(combo(host)).toHaveAttribute('aria-expanded','false');
 await combo(host).click();const old=combo(host).element();host.remove();expect(surface.matches(':popover-open')).toBe(false);old.dispatchEvent(new MouseEvent('click',{bubbles:true}));window.dispatchEvent(new Event('resize'));expect(seen).toHaveLength(0);
 document.body.append(host);await host.updateComplete;await expect.element(combo(host)).toHaveAttribute('aria-expanded','false');await combo(host).click();await expect.element(list(host)).toBeVisible();expect(seen).toHaveLength(0);
});
test('retained option and trigger nodes cannot act on a replacement configuration or renderer',async()=>{
 const{host,seen}=await mount();await combo(host).click();const oldOption=host.shadowRoot!.getElementById('option-1')!,oldControl=combo(host).element() as HTMLButtonElement;
 host.state=selectState({label:'Category',options:[{value:'new',label:'New'}]});oldOption.click();expect(seen).toHaveLength(0);await host.updateComplete;
 host.state=selectState({...host.state,size:4});await host.updateComplete;host.state=selectState({...host.state,size:1});await host.updateComplete;
 oldControl.click();oldControl.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await expect.element(combo(host)).toHaveAttribute('aria-expanded','false');expect(seen).toHaveLength(0);
 await combo(host).click();oldOption.click();expect(seen).toHaveLength(0);await list(host).getByRole('option',{name:'New',exact:true}).click();expect(seen).toHaveLength(1);expect(seen[0].detail.value).toBe('new');
});
test('retained disabled and removed option nodes cannot bypass current option eligibility',async()=>{
 const{host,seen}=await mount();await combo(host).click();const disabled=host.shadowRoot!.getElementById('option-3')!,retired=host.shadowRoot!.getElementById('option-1')!;
 disabled.click();expect(seen).toHaveLength(0);retired.remove();retired.click();expect(seen).toHaveLength(0);
 host.disabled=true;await host.updateComplete;disabled.click();await expect.element(list(host)).not.toBeVisible();expect(seen).toHaveLength(0);
});
test('typeahead supports prefixes and repeated keys, ignores modifiers and expires its previous query',async()=>{
 const{host,seen}=await mount({options:[{value:1,label:'Maintenance'},{value:'1',label:'More'},{value:false,label:'Other'}]});const clock=vi.spyOn(performance,'now').mockReturnValue(1000);host.focus();
 await userEvent.keyboard('m');await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-1');await userEvent.keyboard('m');await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-0');
 await userEvent.keyboard('{Escape}');clock.mockReturnValue(2000);await userEvent.keyboard('ma');await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-0');
 clock.mockReturnValue(3000);await userEvent.keyboard('o');await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-2');
 await userEvent.keyboard('zz{F2}{ArrowLeft}{Control>}m{/Control}{Alt>}m{/Alt}{Meta>}m{/Meta}');await expect.element(combo(host)).toHaveAttribute('aria-activedescendant','option-2');expect(seen).toHaveLength(0);await userEvent.keyboard('{Escape}');expect(host.value).toBe(1);
});
test('disabled/stale keyboard events never reopen the picker or submit the enclosing form',async()=>{
 const{host,form,seen}=await mount();const submit=vi.fn((event:Event)=>event.preventDefault());form.addEventListener('submit',submit);const trigger=combo(host).element() as HTMLButtonElement;
 host.disabled=true;trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));trigger.dispatchEvent(new MouseEvent('click',{bubbles:true}));await host.updateComplete;expect(seen).toHaveLength(0);expect(submit).not.toHaveBeenCalled();
 host.disabled=false;await host.updateComplete;host.focus();await userEvent.keyboard('{Enter}{Escape}');expect(submit).not.toHaveBeenCalled();
 host.state=selectState({...host.state,options:[{value:'new',label:'New'}]});trigger.click();await host.updateComplete;await expect.element(combo(host)).toHaveAttribute('aria-expanded','false');expect(seen).toHaveLength(0);
});
test('popup positioning flips above a low anchor, clamps a wide menu and responds to scrolling/resize',async()=>{
 const{host,seen}=await mount({options:[{value:1,label:'A deliberately long option label that exceeds the trigger width'},{value:2,label:'Second'}]});host.style.cssText='position:fixed;inset-inline-end:0;bottom:8px;width:160px';host.dir='rtl';await combo(host).click();
 const surface=host.shadowRoot!.getElementById('options')!;expect(surface.dataset.placement).toBe('top');let box=surface.getBoundingClientRect();expect(box.left).toBeGreaterThanOrEqual(8);expect(box.right).toBeLessThanOrEqual(innerWidth-8);
 host.style.bottom='auto';host.style.top='8px';window.dispatchEvent(new Event('resize'));expect(surface.dataset.placement).toBe('bottom');box=surface.getBoundingClientRect();expect(box.top).toBe(64);
 host.style.top='20px';window.dispatchEvent(new Event('scroll'));expect(surface.getBoundingClientRect().top).toBe(76);expect(seen).toHaveLength(0);
});
test('popup lifetime ignores detached anchors/surfaces and repeated close is harmless',async()=>{
 const{host}=await mount();const dismiss=vi.fn(),popup=new SelectionPopup(host,dismiss),anchor=document.createElement('button'),surface=document.createElement('div');surface.popover='manual';surface.textContent='Surface';
 popup.position();popup.close();popup.show(anchor,surface);expect(popup.opened).toBe(false);document.body.append(anchor);popup.show(anchor,surface);expect(popup.opened).toBe(false);document.body.append(surface);
 popup.show(anchor,surface);expect(popup.opened).toBe(true);anchor.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));surface.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));expect(dismiss).not.toHaveBeenCalled();
 popup.show(anchor,surface);expect(surface.matches(':popover-open')).toBe(true);host.remove();expect(popup.opened).toBe(false);expect(surface.matches(':popover-open')).toBe(false);popup.position();popup.close();expect(dismiss).not.toHaveBeenCalled();
});
test('two immediate clear activations emit one request after a synchronous application acknowledgement',async()=>{
 const{host,form,seen}=await mount();host.addEventListener('ha-select-request',event=>{host.value=event.detail.value;});const clear=host.shadowRoot!.querySelector<HTMLButtonElement>('.clear')!;clear.click();clear.click();await host.updateComplete;
 expect(host.value).toBe(null);expect(seen).toHaveLength(1);expect([...new FormData(form)]).toEqual([]);
});
test('an empty label-only required picker paints one marker while keeping its accessible name stable',async()=>{
 const{host,seen}=await mount({placeholder:'',required:true});host.value=null;await host.updateComplete;expect(host.shadowRoot!.querySelector('.headline')!.textContent).toBe('Category *');await expect.element(combo(host)).toHaveAccessibleName('Category');
 expect(host.validity.valueMissing).toBe(true);expect(seen).toHaveLength(0);
});
test('the hover layer follows primary mouse/pen pointers and clears on disable or disconnect',async()=>{
 const{host,seen}=await mount(),surface=host.shadowRoot!.querySelector<HTMLElement>('.picker')!;
 const pointer=(type:string,patch:PointerEventInit={})=>surface.dispatchEvent(new PointerEvent(type,{isPrimary:true,pointerType:'mouse',...patch}));
 pointer('pointerenter',{pointerType:'touch'});pointer('pointerenter',{isPrimary:false});await host.updateComplete;expect(surface.hasAttribute('data-hovered')).toBe(false);
 pointer('pointerenter');pointer('pointerenter');await host.updateComplete;expect(surface.hasAttribute('data-hovered')).toBe(true);pointer('pointerleave');await host.updateComplete;expect(surface.hasAttribute('data-hovered')).toBe(false);
 pointer('pointerenter',{pointerType:'pen'});host.disabled=true;await host.updateComplete;expect(surface.hasAttribute('data-hovered')).toBe(false);pointer('pointerenter');await host.updateComplete;expect(surface.hasAttribute('data-hovered')).toBe(false);
 host.disabled=false;host.formDisabledCallback(true);pointer('pointerenter');await host.updateComplete;expect(surface.hasAttribute('data-hovered')).toBe(false);host.formDisabledCallback(false);await host.updateComplete;pointer('pointerenter');host.remove();pointer('pointerenter');document.body.append(host);await host.updateComplete;expect(surface.hasAttribute('data-hovered')).toBe(false);expect(seen).toHaveLength(0);
 host.state=selectState({...host.state,size:4});await host.updateComplete;host.state=selectState({...host.state,size:1});await host.updateComplete;pointer('pointerenter');expect(host.shadowRoot!.querySelector('.picker')!.hasAttribute('data-hovered')).toBe(false);
});
