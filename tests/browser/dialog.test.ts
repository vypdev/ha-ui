import {afterEach,expect,test} from 'vitest';
import {page,userEvent} from 'vitest/browser';
import {DialogInputError,dialogState} from '../../packages/core/src/dialog-contracts.js';
import {registerDialog,type DialogRequestEvent,type HaDialog} from '../../packages/core/src/components/dialog.js';

const action=(host:HaDialog,name:string)=>page.elementLocator(host).getByRole('button',{name,exact:true});
const surface=(host:HaDialog)=>host.shadowRoot!.querySelector('dialog')!;
async function mount(patch:Record<string,unknown>={},content?:HTMLElement){
 registerDialog();const opener=document.createElement('button'),host=document.createElement('vyp-ha-dialog');
 opener.textContent='Open task dialog';opener.addEventListener('click',()=>{host.open=true;});host.state=dialogState({title:'Delete task?',description:'Remove the reminder?',confirmLabel:'Delete',confirmTone:'danger',...patch});
 if(content)host.append(content);const seen:DialogRequestEvent[]=[];host.addEventListener('ha-dialog-request',event=>{if(event.target===host)seen.push(event);});
 document.body.append(opener,host);await host.updateComplete;return{opener,host,seen};
}
afterEach(()=>document.body.replaceChildren());

test('a real modal is named, opens silently, and returns focus after accepted confirmation',async()=>{
 const {host,opener,seen}=await mount();const modal=page.elementLocator(host).getByRole('dialog',{name:'Delete task?',exact:true});
 await expect.element(modal).not.toBeInTheDocument();expect(surface(host).open).toBe(false);await page.elementLocator(opener).click();await expect.element(modal).toBeVisible();
 expect(surface(host).matches(':modal')).toBe(true);await expect.element(modal).toHaveAccessibleDescription('Remove the reminder?');expect(seen).toHaveLength(0);
 host.addEventListener('ha-dialog-request',event=>{if(!event.defaultPrevented)host.open=false;});
 await action(host,'Delete').click();await expect.element(modal).not.toBeInTheDocument();expect(surface(host).open).toBe(false);expect(document.activeElement).toBe(opener);
 expect(seen.map(event=>event.detail)).toEqual([{action:'confirm'}]);expect(seen[0].cancelable&&seen[0].bubbles&&seen[0].composed&&Object.isFrozen(seen[0].detail)).toBe(true);
});

test('Escape, cancel and close emit distinct requests while an unacknowledged modal stays open',async()=>{
 const {host,opener,seen}=await mount();await page.elementLocator(opener).click();
 host.addEventListener('ha-dialog-request',event=>event.preventDefault());
 await userEvent.keyboard('{Escape}');await action(host,'Cancel').click();await action(host,'Close').click();
 expect(seen.map(event=>event.detail.action)).toEqual(['escape','cancel','close']);expect(seen.every(event=>event.defaultPrevented)).toBe(true);
 expect(host.open&&surface(host).open).toBe(true);host.open=false;await host.updateComplete;expect(surface(host).open).toBe(false);
 expect(seen).toHaveLength(3);
});

test('alert modal preserves application autofocus and removes native inertness on disconnect',async()=>{
 const input=document.createElement('input');input.autofocus=true;input.setAttribute('aria-label','Reason');
 const {host,opener,seen}=await mount({kind:'alert'},input);await page.elementLocator(opener).click();
 await expect.element(page.elementLocator(host).getByRole('alertdialog',{name:'Delete task?',exact:true})).toBeVisible();
 expect(document.activeElement).toBe(input);expect(surface(host).matches(':modal')).toBe(true);
 host.remove();expect(surface(host).matches(':modal')).toBe(false);expect(document.activeElement).toBe(opener);expect(seen).toHaveLength(0);
});

test('projected autofocus is restored when the browser focuses an internal button first',async()=>{
 const content=document.createElement('div'),disabled=document.createElement('input'),target=document.createElement('input');
 disabled.autofocus=true;disabled.disabled=true;target.autofocus=true;target.setAttribute('aria-label','Preferred control');content.append(disabled,target);
 const {host,opener}=await mount({},content),modal=surface(host);
 modal.showModal=()=>{HTMLDialogElement.prototype.showModal.call(modal);host.shadowRoot!.querySelector('vyp-ha-button')!.focus();};
 await page.elementLocator(opener).click();expect(document.activeElement).toBe(target);expect(disabled.matches(':focus')).toBe(false);
});

test('an application focus observer can immediately withdraw a pending open',async()=>{
 const input=document.createElement('input');input.autofocus=true;
 const {host,opener,seen}=await mount({},input);
 input.addEventListener('focus',()=>{host.open=false;},{once:true});
 await page.elementLocator(opener).click();await expect.poll(()=>surface(host).open).toBe(false);
 expect(host.open).toBe(false);expect(document.activeElement).toBe(opener);expect(seen).toHaveLength(0);
});

test('busy and disabled confirmation cannot propose a command; a replacement footer owns its actions',async()=>{
 const {host,opener,seen}=await mount({pending:true,pendingLabel:'Deleting task…'});await page.elementLocator(opener).click();
 await expect.element(action(host,'Delete')).toHaveAttribute('aria-busy','true');await expect.element(page.elementLocator(host).getByRole('status')).toHaveTextContent('Deleting task…');
 host.shadowRoot!.querySelector<HTMLElement>('[data-action=confirm]')!.click();expect(seen).toHaveLength(0);
 host.state=dialogState({...host.state,pending:false,confirmDisabled:true});await host.updateComplete;await expect.element(action(host,'Delete')).toBeDisabled();
 const custom=document.createElement('button');custom.textContent='Review task';custom.slot='footer';host.append(custom);
 await expect.element(action(host,'Review task')).toBeVisible();await expect.element(action(host,'Delete')).not.toBeInTheDocument();
 custom.remove();await expect.element(action(host,'Cancel')).toBeVisible();expect(seen).toHaveLength(0);
});

test('a guarded alert keeps Escape and native close from proposing dismissal',async()=>{
 const {host,opener,seen}=await mount({guardDismiss:true});await page.elementLocator(opener).click();
 await userEvent.keyboard('{Escape}');expect(surface(host).open).toBe(true);
 surface(host).close();await expect.poll(()=>surface(host).matches(':modal')).toBe(true);
 expect(seen).toHaveLength(0);await action(host,'Cancel').click();expect(seen.map(event=>event.detail.action)).toEqual(['cancel']);
});

test('a native close is reconciled if the application does not accept the request',async()=>{
 const {host,opener,seen}=await mount();await page.elementLocator(opener).click();
 surface(host).close();await expect.poll(()=>seen.length).toBe(1);expect(seen[0].detail.action).toBe('native');await expect.poll(()=>surface(host).matches(':modal')).toBe(true);
 host.addEventListener('ha-dialog-request',()=>{host.open=false;});surface(host).close();await expect.poll(()=>seen.length).toBe(2);await expect.poll(()=>host.open).toBe(false);expect(surface(host).open).toBe(false);
});

test('markup-looking copy remains inert and invalid property writes preserve the accepted configuration',async()=>{
 const title='<img src=x onerror=alert(1)>',{host,opener,seen}=await mount({title,description:''});
 expect(()=>{host.open='true' as unknown as boolean;}).toThrow(DialogInputError);
 expect(()=>{host.state={...host.state,width:'invalid'} as unknown as HaDialog['state'];}).toThrow(DialogInputError);
 await page.elementLocator(opener).click();await expect.element(page.elementLocator(host).getByRole('dialog',{name:title,exact:true})).toBeVisible();
 expect(host.shadowRoot!.querySelector('img')).toBeNull();expect(surface(host).getAttribute('aria-describedby')).toBeNull();expect(seen).toHaveLength(0);
});

test('scrim dismissal requires a primary pointer to begin and end outside the surface',async()=>{
 const {host,opener,seen}=await mount();await page.elementLocator(opener).click();const modal=surface(host),{left,top}=modal.getBoundingClientRect();
 const down=(x:number,y:number,patch:PointerEventInit={})=>modal.dispatchEvent(new PointerEvent('pointerdown',{isPrimary:true,button:0,clientX:x,clientY:y,...patch}));
 const click=(x:number,y:number)=>modal.dispatchEvent(new MouseEvent('click',{clientX:x,clientY:y}));
 const inside=[left+2,top+2] as const,outside=[left-2,top+2] as const;
 down(...inside);click(...outside);down(...outside);click(...inside);down(...outside,{isPrimary:false});click(...outside);down(...outside,{button:1});click(...outside);
 down(...outside);modal.dispatchEvent(new PointerEvent('pointercancel'));click(...outside);expect(seen).toHaveLength(0);
 down(...outside);click(...outside);expect(seen.map(event=>event.detail.action)).toEqual(['scrim']);expect(modal.open).toBe(true);
 host.state=dialogState({...host.state,guardDismiss:true});await host.updateComplete;down(...outside);click(...outside);expect(seen).toHaveLength(1);
});

test('reconnect renders fresh actions and a closed host stays closed after a queued native event',async()=>{
 const {host,opener,seen}=await mount();await page.elementLocator(opener).click();
 host.remove();document.body.append(host);await host.updateComplete;expect(surface(host).matches(':modal')).toBe(true);
 host.open=false;await host.updateComplete;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
 expect(seen).toHaveLength(0);expect(surface(host).open).toBe(false);expect(document.activeElement).toBe(opener);
});

test('a detached state update and retired button events cannot request changes',async()=>{
 const {host,opener,seen}=await mount();await page.elementLocator(opener).click();
 const button=host.shadowRoot!.querySelector<HTMLElement>('[data-action=confirm]')!;
 const request=()=>new CustomEvent('ha-press-request',{detail:{type:'button'},bubbles:true,cancelable:true});
 const rejected=request();rejected.preventDefault();button.dispatchEvent(rejected);
 button.querySelector('button')!.dispatchEvent(request());expect(seen).toHaveLength(0);
 host.state=dialogState({...host.state,pending:true});button.dispatchEvent(request());await host.updateComplete;button.dispatchEvent(request());expect(seen).toHaveLength(0);
 host.open=false;await host.updateComplete;button.dispatchEvent(request());expect(seen).toHaveLength(0);
 host.remove();host.open=true;await host.updateComplete;expect(surface(host).open).toBe(false);
 document.body.append(host);await host.updateComplete;expect(surface(host).matches(':modal')).toBe(true);
});

test('omitting both optional actions hides the footer until an application projects one',async()=>{
 const {host,opener}=await mount({cancelLabel:'',confirmLabel:'',subtitle:'Household settings'});await page.elementLocator(opener).click();
 expect(host.shadowRoot!.querySelector('footer')!.hidden).toBe(true);
 await expect.element(page.elementLocator(host).getByText('Household settings',{exact:true})).toBeVisible();
 const first=document.createElement('button');first.slot='footer';first.textContent='First review';host.append(first);
 await expect.element(action(host,'First review')).toBeVisible();
 const second=document.createElement('button');second.slot='footer';second.textContent='Second review';host.append(second);
 await expect.element(action(host,'Second review')).toBeVisible();
 first.remove();second.remove();await expect.poll(()=>host.shadowRoot!.querySelector('footer')!.hidden).toBe(true);
});

test('dialog registration is repeatable and rejects a conflicting cohort',()=>{
 registerDialog();registerDialog(customElements);
 class ForeignDialog extends HTMLElement{}
 const conflict={get:()=>ForeignDialog} as unknown as CustomElementRegistry;
 expect(()=>registerDialog(conflict)).toThrow(/registration conflict/u);
});

test('scrollable content keeps its header and actions visible and updates both edge cues',async()=>{
 const content=document.createElement('div'),{host,opener}=await mount({},content);
 host.style.setProperty('--ha-dialog-max-height','300px');host.style.setProperty('--vyp-ha-motion-duration','0ms');
 await page.elementLocator(opener).click();
 const body=host.shadowRoot!.querySelector<HTMLElement>('[part=body]')!,header=host.shadowRoot!.querySelector<HTMLElement>('[part=header]')!,footer=host.shadowRoot!.querySelector<HTMLElement>('[part=footer]')!;
 const opacity=(edge:string)=>getComputedStyle(host.shadowRoot!.querySelector('.fade-'+edge)!).opacity;
 expect(body.scrollHeight).toBe(body.clientHeight);expect(opacity('top')).toBe('0');expect(opacity('bottom')).toBe('0');
 for(let index=0;index<24;index++){const line=document.createElement('p');line.textContent='Reminder '+(index+1);content.append(line);}
 await expect.poll(()=>opacity('bottom')).toBe('1');expect(opacity('top')).toBe('0');
 const foot=footer.getBoundingClientRect().bottom;body.scrollTop=60;await expect.poll(()=>opacity('top')).toBe('1');expect(opacity('bottom')).toBe('1');
 expect(getComputedStyle(header).borderBottomWidth).toBe('1px');expect(footer.getBoundingClientRect().bottom).toBe(foot);
 body.scrollTop=body.scrollHeight;await expect.poll(()=>opacity('bottom')).toBe('0');expect(opacity('top')).toBe('1');
 content.replaceChildren();await expect.poll(()=>opacity('top')).toBe('0');expect(opacity('bottom')).toBe('0');
 host.open=false;await host.updateComplete;expect(surface(host).open).toBe(false);
 body.dispatchEvent(new Event('scroll'));expect(opacity('top')).toBe('0');expect(opacity('bottom')).toBe('0');
});
