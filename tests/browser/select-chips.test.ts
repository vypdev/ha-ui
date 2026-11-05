import {afterEach,expect,test,vi} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {selectState} from '../../packages/core/src/select-contracts.js';
import {registerSelect,type HaSelect,type SelectValueEvent} from '../../packages/core/src/components/select.js';
import {SelectionDialog} from '../../packages/core/src/components/selection-dialog.js';
const options=[{value:1,label:'Maintenance'},{value:'1',label:'Shopping'},{value:false,label:'Other'},{value:'archived',label:'Archived',disabled:true}];
async function mount(patch:Record<string,unknown>={}){
 registerSelect();const form=document.createElement('form'),host=document.createElement('vyp-ha-select');host.style.width='320px';host.state=selectState({label:'Category',multiple:true,mode:'dropdown',options,...patch});host.name='category';host.value=[1,false];form.append(host);document.body.append(form);await host.updateComplete;
 const seen:SelectValueEvent[]=[];host.addEventListener('ha-select-request',event=>seen.push(event));return{host,form,seen};
}
const add=(host:HaSelect)=>page.elementLocator(host).getByRole('button',{name:'Category',exact:true});
const dialog=(host:HaSelect)=>page.elementLocator(host).getByRole('dialog',{name:'Category',exact:true,includeHidden:true});
const search=(host:HaSelect)=>page.elementLocator(host).getByRole('combobox',{name:'Search options',exact:true});
afterEach(()=>{document.body.replaceChildren();vi.restoreAllMocks();});
test('multiple dropdown paints selected chips and opens a named modal search without a hidden native select',async()=>{
 const{host,seen}=await mount();expect(host.shadowRoot!.querySelector('select')).toBe(null);
 const remove=page.elementLocator(host).getByRole('button',{name:'Remove Maintenance',exact:true});expect(remove.element().getBoundingClientRect().height).toBeGreaterThanOrEqual(44);expect(remove.element().getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
 await expect.element(dialog(host)).not.toBeVisible();await add(host).click();await expect.element(dialog(host)).toBeVisible();expect(host.shadowRoot!.activeElement).toBe(search(host).element());
 await expect.element(page.elementLocator(host).getByRole('option',{name:'Maintenance',exact:true})).not.toBeInTheDocument();await expect.element(page.elementLocator(host).getByRole('option',{name:'Archived',exact:true})).toBeDisabled();expect(seen).toHaveLength(0);
});
test('search and keyboard commit propose one immutable typed addition without accepting it for the app',async()=>{
 const{host,seen,form}=await mount();await add(host).click();await search(host).fill('shop');await userEvent.keyboard('{ArrowDown}{Enter}');
 expect(seen).toHaveLength(1);expect(seen[0].detail).toEqual({value:[1,false,'1'],reason:'change'});expect(Object.isFrozen(seen[0].detail.value)).toBe(true);expect(host.value).toEqual([1,false]);expect([...new FormData(form)]).toEqual([['category','1'],['category','false']]);await expect.element(dialog(host)).not.toBeVisible();expect(host.shadowRoot!.activeElement).toBe(add(host).element());
});
test('chip removal stays cancelable and successful entries follow option order after accepted changes',async()=>{
 const{host,seen,form}=await mount();const remove=page.elementLocator(host).getByRole('button',{name:'Remove Maintenance',exact:true});const cancel=(event:SelectValueEvent)=>event.preventDefault();host.addEventListener('ha-select-request',cancel);
 await remove.click();expect(seen[0].detail).toEqual({value:[false],reason:'change'});expect(host.value).toEqual([1,false]);host.removeEventListener('ha-select-request',cancel);host.addEventListener('ha-select-request',event=>{host.value=event.detail.value;});await remove.click();await host.updateComplete;expect(host.value).toEqual([false]);
 await add(host).click();await page.elementLocator(host).getByRole('option',{name:'Maintenance',exact:true}).click();await host.updateComplete;expect(host.value).toEqual([false,1]);expect([...new FormData(form)]).toEqual([['category','1'],['category','false']]);expect(seen).toHaveLength(3);
});
test('disabled fieldsets block every action and omit successful entries',async()=>{
 const{host,seen,form}=await mount();const fieldset=document.createElement('fieldset');fieldset.disabled=true;form.append(fieldset);fieldset.append(host);await host.updateComplete;
 expect((add(host).element() as HTMLButtonElement).disabled).toBe(true);const remove=page.elementLocator(host).getByRole('button',{name:'Remove Maintenance',exact:true});expect((remove.element() as HTMLButtonElement).disabled).toBe(true);add(host).element().dispatchEvent(new MouseEvent('click',{bubbles:true}));remove.element().dispatchEvent(new MouseEvent('click',{bubbles:true}));await expect.element(dialog(host)).not.toBeVisible();expect(seen).toHaveLength(0);expect([...new FormData(form)]).toEqual([]);
});
test('Escape, reset, restoration and disconnection retire the modal without a stray selection request',async()=>{
 const{host,seen,form}=await mount();await add(host).click();await userEvent.keyboard('{Tab}');expect(host.shadowRoot!.activeElement).toBe(search(host).element());await userEvent.keyboard('{Escape}');await expect.element(dialog(host)).not.toBeVisible();expect(host.shadowRoot!.activeElement).toBe(add(host).element());expect(seen).toHaveLength(0);
 await add(host).click();form.reset();await expect.element(dialog(host)).not.toBeVisible();expect(seen).toHaveLength(1);expect(seen[0].detail.reason).toBe('reset');
 await add(host).click();host.formStateRestoreCallback('["1"]','restore');await expect.element(dialog(host)).not.toBeVisible();expect(seen).toHaveLength(2);expect(seen[1].detail.value).toEqual(['1']);
 await add(host).click();const old=search(host).element(),modal=dialog(host).element() as HTMLDialogElement;host.remove();old.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));expect(modal.open).toBe(false);expect(seen).toHaveLength(2);
});
test('localized search and empty results preserve the controlled model when there is no choice',async()=>{
 const{host,seen}=await mount({searchLabel:'Buscar categorías',searchPlaceholder:'Buscar',notFoundMessage:'Sin coincidencias.',removeLabel:'Eliminar'});await expect.element(page.elementLocator(host).getByRole('button',{name:'Eliminar Maintenance',exact:true})).toBeVisible();await add(host).click();const input=page.elementLocator(host).getByRole('combobox',{name:'Buscar categorías',exact:true});await input.fill('unmatched');await expect.element(page.elementLocator(host).getByRole('status')).toHaveTextContent('Sin coincidencias.');await userEvent.keyboard('{ArrowDown}{Enter}');expect(host.value).toEqual([1,false]);expect(seen).toHaveLength(0);await expect.element(dialog(host)).toBeVisible();
});

test('imperative focus, blur and native modal closure preserve the model and reconcile expanded state',async()=>{
 const{host,seen}=await mount({description:'Choose categories.',error:'Review categories.'});host.focus();expect(host.shadowRoot!.activeElement).toBe(add(host).element());
 await expect.element(page.elementLocator(host).getByText('Choose categories.',{exact:true})).toBeVisible();await expect.element(page.elementLocator(host).getByText('Review categories.',{exact:true})).toBeVisible();await expect.element(add(host)).toHaveAttribute('aria-invalid','true');
 await add(host).click();host.focus();expect(host.shadowRoot!.activeElement).toBe(search(host).element());host.blur();await expect.element(dialog(host)).not.toBeVisible();expect(seen).toHaveLength(0);
 await add(host).click();(dialog(host).element() as HTMLDialogElement).close();await expect.element(add(host)).toHaveAttribute('aria-expanded','false');expect(host.value).toEqual([1,false]);expect(seen).toHaveLength(0);
});
test('empty and wrong-mode models remain untouched until an explicit available addition',async()=>{
 const{host,seen}=await mount({options:[],emptyMessage:'No categories.'});host.value=null;await host.updateComplete;await add(host).click();await expect.element(page.elementLocator(host).getByRole('status')).toHaveTextContent('No categories.');await userEvent.keyboard('{ArrowDown}{ArrowUp}{Home}{End}{Enter}');await expect.element(search(host)).not.toHaveAttribute('aria-activedescendant');expect(host.value).toBe(null);expect(seen).toHaveLength(0);
 host.state=selectState({label:'Category',multiple:true,mode:'dropdown',options});host.value='wrong mode';await host.updateComplete;expect(host.checkValidity()).toBe(false);await add(host).click();await page.elementLocator(host).getByRole('option',{name:'Maintenance',exact:true}).click();expect(seen).toHaveLength(1);expect(seen[0].detail.value).toEqual([1]);expect(host.value).toBe('wrong mode');
});
test('search navigation skips disabled choices, clamps, and preserves browser command modifiers',async()=>{
 const{host,seen}=await mount({options:[...options,{value:true,label:'Extra'}]});await add(host).click();await userEvent.keyboard('{ArrowDown}');await expect.element(search(host)).toHaveAttribute('aria-activedescendant','multi-option-1');await userEvent.keyboard('{End}{ArrowDown}');await expect.element(search(host)).toHaveAttribute('aria-activedescendant','multi-option-4');await userEvent.keyboard('{Home}{ArrowUp}');await expect.element(search(host)).toHaveAttribute('aria-activedescendant','multi-option-1');
 for(const modifier of ['altKey','ctrlKey','metaKey'])for(const key of ['Tab','ArrowDown']){const event=new KeyboardEvent('keydown',{key,[modifier]:true,bubbles:true,cancelable:true});search(host).element().dispatchEvent(event);expect(event.defaultPrevented).toBe(false);}
 await expect.element(search(host)).toHaveAttribute('aria-activedescendant','multi-option-1');await userEvent.keyboard('{Enter}');expect(seen).toHaveLength(1);expect(seen[0].detail.value).toEqual([1,false,'1']);
});
test('the maximum model count cannot overflow through a forged available-option activation',async()=>{
 const{host,seen}=await mount({options:[{value:999,label:'Next'}]});host.value=Array.from({length:256},(_,index)=>index);await host.updateComplete;await add(host).click();const option=page.elementLocator(host).getByRole('option',{name:'Next',exact:true});await expect.element(option).toHaveAttribute('aria-disabled','true');(option.element() as HTMLElement).click();await userEvent.keyboard('{ArrowDown}{Enter}');expect(host.value).toHaveLength(256);expect(seen).toHaveLength(0);
});
test('replaced state, values and modes reject retired controls and reconnect requires a fresh render',async()=>{
 const{host,seen}=await mount();await add(host).click();const oldInput=search(host).element(),oldOption=page.elementLocator(host).getByRole('option',{name:'Shopping',exact:true}).element() as HTMLElement,oldRemove=host.shadowRoot!.getElementById('multi-remove-0')!;
 host.state=selectState({...host.state,description:'Replacement'});oldOption.click();oldInput.dispatchEvent(new Event('input',{bubbles:true}));oldInput.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));expect(seen).toHaveLength(0);await host.updateComplete;
 host.value=[false];oldRemove.click();expect(seen).toHaveLength(0);await host.updateComplete;
 const retiredAdd=add(host).element() as HTMLButtonElement;host.state=selectState({...host.state,mode:'list'});await host.updateComplete;retiredAdd.click();expect(seen).toHaveLength(0);expect(host.shadowRoot!.querySelector('select')).not.toBe(null);
 host.state=selectState({...host.state,mode:'dropdown'});await host.updateComplete;retiredAdd.click();expect(seen).toHaveLength(0);const beforeReconnect=add(host).element() as HTMLButtonElement;host.remove();beforeReconnect.click();document.body.append(host);beforeReconnect.click();expect(seen).toHaveLength(0);await host.updateComplete;await add(host).click();await expect.element(dialog(host)).toBeVisible();
});
test('removed current nodes cannot replay option, removal, search or opening events',async()=>{
 const{host,seen}=await mount();await add(host).click();const option=page.elementLocator(host).getByRole('option',{name:'Shopping',exact:true}).element() as HTMLElement;option.remove();option.click();expect(seen).toHaveLength(0);
 const remove=host.shadowRoot!.getElementById('multi-remove-0')!;remove.remove();remove.click();expect(seen).toHaveLength(0);
 const input=search(host).element() as HTMLInputElement;input.remove();input.value='shop';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));host.focus();expect(seen).toHaveLength(0);host.blur();
 const trigger=add(host).element() as HTMLButtonElement;trigger.remove();trigger.click();expect(seen).toHaveLength(0);
});
test.each(['disabled','fieldset','value','state','disconnect'])('a synchronous focus observer can retire a chip-removal intent through %s',async action=>{
 const{host,form,seen}=await mount();const fieldset=document.createElement('fieldset');form.append(fieldset);fieldset.append(host);await host.updateComplete;
 add(host).element().addEventListener('focus',()=>{if(action==='disabled')host.disabled=true;else if(action==='fieldset')fieldset.disabled=true;else if(action==='value')host.value=['1'];else if(action==='state')host.state=selectState({...host.state,description:'New configuration'});else host.remove();},{once:true});
 await page.elementLocator(host).getByRole('button',{name:'Remove Maintenance',exact:true}).click();expect(seen).toHaveLength(0);
});
test('model ownership survives a synchronous focus observer when a chosen option closes the dialog',async()=>{
 const{host,seen}=await mount();await add(host).click();add(host).element().addEventListener('focus',()=>{host.value=[false];},{once:true});await search(host).fill('shop');await userEvent.keyboard('{ArrowDown}{Enter}');expect(seen).toHaveLength(0);expect(host.value).toEqual([false]);await expect.element(dialog(host)).not.toBeVisible();
});

function dialogPorts(){
 registerSelect();const host=document.createElement('vyp-ha-select'),anchor=document.createElement('button'),modal=document.createElement('dialog'),surface=document.createElement('div');anchor.textContent='Port anchor';anchor.style.cssText='position:fixed;right:0;bottom:8px';modal.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0';surface.style.cssText='position:fixed;height:100px;background:white';
 const first=document.createElement('input'),last=document.createElement('button');first.autofocus=true;last.textContent='Last';surface.append(first,last);return{host,anchor,modal,surface,first,last};
}
test('modal adapter guards detached ports, flips/clamps and removes every observer on close/disconnect',async()=>{
 const{host,anchor,modal,surface,first,last}=dialogPorts();const dismiss=vi.fn(()=>controller.close()),controller=new SelectionDialog(host,dismiss);controller.position();controller.close();controller.show(anchor,modal,surface);expect(controller.opened).toBe(false);
 document.body.append(host,anchor);controller.show(anchor,modal,surface);expect(controller.opened).toBe(false);document.body.append(modal);controller.show(anchor,modal,surface);expect(controller.opened).toBe(false);modal.append(surface);
 anchor.focus();controller.show(anchor,modal,surface);expect(controller.opened).toBe(true);expect(surface.dataset.placement).toBe('top');expect(surface.getBoundingClientRect().width).toBe(250);expect(parseFloat(surface.style.left)).toBeGreaterThanOrEqual(16);expect(surface.getBoundingClientRect().right).toBeLessThanOrEqual(innerWidth-16);expect(document.activeElement).toBe(first);
 anchor.style.bottom='auto';anchor.style.top='8px';window.dispatchEvent(new Event('resize'));expect(surface.dataset.placement).toBe('bottom');expect(parseFloat(surface.style.top)).toBe(anchor.getBoundingClientRect().bottom);anchor.style.top='20px';window.dispatchEvent(new Event('scroll'));expect(parseFloat(surface.style.top)).toBe(anchor.getBoundingClientRect().bottom);
 surface.click();expect(controller.opened).toBe(true);await userEvent.click(modal);expect(controller.opened).toBe(false);expect(dismiss).toHaveBeenCalledTimes(1);const top=surface.style.top;anchor.style.top='40px';window.dispatchEvent(new Event('resize'));expect(surface.style.top).toBe(top);
 controller.show(anchor,modal,surface);modal.close();controller.show(anchor,modal,surface);await new Promise(requestAnimationFrame);expect(controller.opened).toBe(true);expect(dismiss).toHaveBeenCalledTimes(1);
 await userEvent.keyboard('{Escape}');expect(controller.opened).toBe(false);expect(dismiss).toHaveBeenCalledTimes(2);controller.show(anchor,modal,surface);host.remove();expect(modal.open).toBe(false);expect(controller.opened).toBe(false);controller.position();controller.close();expect(last.isConnected).toBe(true);
});
test('modal focus navigation cycles only visible enabled controls and keeps browser shortcuts intact',async()=>{
 const{host,anchor,modal,surface,first,last}=dialogPorts();const disabled=document.createElement('input'),hidden=document.createElement('button'),negative=document.createElement('input');disabled.disabled=true;hidden.hidden=true;negative.tabIndex=-1;surface.append(disabled,hidden,negative);modal.append(surface);document.body.append(host,anchor,modal);
 const controller=new SelectionDialog(host,()=>controller.close());controller.show(anchor,modal,surface);first.focus();await userEvent.keyboard('{Tab}');expect(document.activeElement).toBe(last);await userEvent.keyboard('{Tab}');expect(document.activeElement).toBe(first);await userEvent.keyboard('{Shift>}{Tab}{/Shift}');expect(document.activeElement).toBe(last);
 surface.replaceChildren();modal.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));expect(document.activeElement).toBe(modal);controller.close();
});
test('synchronous native autofocus closure does not register orphaned modal listeners',()=>{
 const{host,anchor,modal,surface,first}=dialogPorts();modal.append(surface);document.body.append(host,anchor,modal);const controller=new SelectionDialog(host,()=>controller.close());first.addEventListener('focus',()=>controller.close(),{once:true});const listeners=vi.spyOn(window,'addEventListener');controller.show(anchor,modal,surface);expect(controller.opened).toBe(false);expect(modal.open).toBe(false);expect(listeners.mock.calls.filter(([type])=>type==='resize')).toHaveLength(0);
});
test.each(['anchor','modal','surface','native-close'])('autofocus retiring the %s port reconciles without listeners',retired=>{
 const ports=dialogPorts();ports.modal.append(ports.surface);document.body.append(ports.host,ports.anchor,ports.modal);const dismiss=vi.fn(()=>controller.close()),controller=new SelectionDialog(ports.host,dismiss);ports.first.addEventListener('focus',()=>{if(retired==='native-close')ports.modal.close();else ports[retired as 'anchor'|'modal'|'surface'].remove();},{once:true});const listeners=vi.spyOn(window,'addEventListener');controller.show(ports.anchor,ports.modal,ports.surface);expect(controller.opened).toBe(false);expect(dismiss).toHaveBeenCalledTimes(1);expect(listeners.mock.calls.filter(([type])=>type==='resize')).toHaveLength(0);
});

test('required collection instructions and native validity follow the accepted selection, separately from search text',async()=>{
 const{host,form}=await mount({required:true,requiredMessage:'Choose at least one category.'});host.value=[];host.addEventListener('ha-select-request',event=>{host.value=event.detail.value;});await host.updateComplete;host.addEventListener('invalid',event=>event.preventDefault());expect(form.checkValidity()).toBe(false);await expect.element(add(host)).toHaveAttribute('aria-describedby','error multi-required');
 await add(host).click();await expect.element(search(host)).toHaveAttribute('aria-required','true');await expect.element(search(host)).toHaveAttribute('aria-describedby','error multi-required');await page.elementLocator(host).getByRole('option',{name:'Maintenance',exact:true}).click();await host.updateComplete;expect(form.checkValidity()).toBe(true);await add(host).click();await expect.element(search(host)).toHaveAttribute('aria-required','false');await userEvent.keyboard('{Escape}');expect(host.value).toEqual([1]);
});

test('leaving an empty required collection reveals validation without emitting a selection request',async()=>{
 const{host,form,seen}=await mount({required:true,requiredMessage:'Choose a category.'});host.value=[];await host.updateComplete;expect(host.shadowRoot!.getElementById('error')).toBe(null);const outside=document.createElement('button');outside.textContent='Continue';form.append(outside);host.focus();await userEvent.keyboard('{Tab}');expect(document.activeElement).toBe(outside);await expect.element(page.elementLocator(host).getByText('Choose a category.',{exact:true}).last()).toBeVisible();expect(host.shadowRoot!.getElementById('error')!.textContent).toBe('Choose a category.');expect(host.validity.valueMissing).toBe(true);expect(seen).toHaveLength(0);
});
test('search clear preserves the accepted value, restores options and traps focus across the temporary clear action',async()=>{
 const{host,seen,form}=await mount({clearLabel:'Clear query'});await add(host).click();const popup=host.shadowRoot!.querySelector<HTMLElement>('.multi-popup')!,height=popup.getBoundingClientRect().height;await search(host).fill('unmatched');await host.updateComplete;expect(popup.getBoundingClientRect().height).toBe(height);
 const clear=page.elementLocator(host).getByRole('button',{name:'Clear query',exact:true}),target=clear.element().getBoundingClientRect();expect(target.width).toBeGreaterThanOrEqual(44);expect(target.height).toBeGreaterThanOrEqual(44);await userEvent.keyboard('{Tab}');expect(host.shadowRoot!.activeElement).toBe(clear.element());await userEvent.keyboard('{Tab}');expect(host.shadowRoot!.activeElement).toBe(search(host).element());await clear.click();await expect.element(search(host)).toHaveValue('');await expect.element(page.elementLocator(host).getByRole('option',{name:'Shopping',exact:true})).toBeVisible();expect(host.shadowRoot!.activeElement).toBe(search(host).element());expect(host.value).toEqual([1,false]);expect([...new FormData(form)]).toEqual([['category','1'],['category','false']]);expect(seen).toHaveLength(0);
});
test('retired clear controls and synchronous focus observers cannot alter a replacement query or model',async()=>{
 const{host,seen}=await mount();await add(host).click();await search(host).fill('shop');const retired=host.shadowRoot!.querySelector<HTMLButtonElement>('.multi-search-clear')!;host.state=selectState({...host.state,description:'Replacement'});retired.click();await host.updateComplete;await expect.element(dialog(host)).not.toBeVisible();await add(host).click();await search(host).fill('other');retired.click();expect((search(host).element() as HTMLInputElement).value).toBe('other');
 const current=host.shadowRoot!.querySelector<HTMLButtonElement>('.multi-search-clear')!;current.focus();search(host).element().addEventListener('focus',()=>{host.disabled=true;},{once:true});current.click();await host.updateComplete;await expect.element(dialog(host)).not.toBeVisible();expect(host.value).toEqual([1,false]);expect(seen).toHaveLength(0);
});
test.each(['ltr','rtl'])('modal search uses the whole %s field as its anchor and reserves the initial result height',async dir=>{
 const{host}=await mount();host.dir=dir;host.style.width='180px';await add(host).click();const popup=host.shadowRoot!.querySelector<HTMLElement>('.multi-popup')!,anchor=host.shadowRoot!.querySelector<HTMLElement>('.multi-add-wrap')!,box=anchor.getBoundingClientRect(),rectangle=popup.getBoundingClientRect();expect(rectangle.width).toBe(250);expect(rectangle.left).toBe(Math.max(16,box.left+(box.width-250)/2));expect(rectangle.top).toBe(box.bottom);await search(host).fill('shop');await host.updateComplete;expect(popup.getBoundingClientRect().height).toBe(rectangle.height);
});
