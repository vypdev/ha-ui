import {afterEach,expect,test,vi} from 'vitest';
import {page} from 'vitest/browser';
import {dialogState,type DialogRequestDetail,type DialogState} from '../../packages/core/src/dialog-contracts.js';
import {registerDialog,type DialogRequestEvent,type HaDialog} from '../../packages/core/src/components/dialog.js';

export interface DialogOptions {
 state:DialogState;open:boolean;footer?:boolean;
 onRequest?:(event:DialogRequestEvent)=>void;onAction?:(detail:DialogRequestDetail)=>void;
}
interface Mounted {host:HaDialog;update(patch:Partial<DialogOptions>):Promise<void>;unmount():Promise<void>;}
export const dialogModel=(patch:Record<string,unknown>={})=>dialogState({title:'Delete task?',confirmLabel:'Delete',...patch});
export function dialogAdapterCases(render:(target:HTMLElement,options:DialogOptions)=>Promise<Mounted>):void{
 const active=new Set<Mounted>();
 afterEach(async()=>{for(const item of active)await item.unmount();active.clear();document.body.replaceChildren();});
 const mount=async(options:DialogOptions)=>{registerDialog();const target=document.createElement('main');document.body.append(target);const item=await render(target,options);active.add(item);await item.host.updateComplete;return item;};
 const button=(host:HaDialog,name:string)=>page.elementLocator(host).getByRole('button',{name,exact:true});
 test('the binding projects real content, applies controlled properties and delivers a cancelable typed action',async()=>{
  const request=vi.fn((event:DialogRequestEvent)=>event.preventDefault()),accepted=vi.fn();
  const item=await mount({state:dialogModel(),open:false,onRequest:request,onAction:accepted});const {host}=item;
  expect(host.getAttribute('state')).toBeNull();expect(host.shadowRoot!.querySelector('dialog')!.open).toBe(false);
  await item.update({open:true});await expect.element(page.elementLocator(host).getByRole('dialog',{name:'Delete task?',exact:true})).toBeVisible();
  await expect.element(page.elementLocator(host).getByText('Task details', {exact:true})).toBeVisible();
  await button(host,'Delete').click();expect(request).toHaveBeenCalledTimes(1);expect(accepted).not.toHaveBeenCalled();expect(host.open).toBe(true);
  await item.update({onRequest:undefined,state:dialogModel({title:'Archive task?',confirmLabel:'Archive'})});
  await button(host,'Archive').click();expect(accepted).toHaveBeenCalledExactlyOnceWith({action:'confirm'});expect(host.open).toBe(true);
  await item.update({open:false});await host.updateComplete;expect(host.shadowRoot!.querySelector('dialog')!.open).toBe(false);
  expect(accepted).toHaveBeenCalledTimes(1);
 });
 test('projected footer and nested events respect the current binding, including after unmount',async()=>{
  const seen=vi.fn(),action=vi.fn();const item=await mount({state:dialogModel(),open:true,footer:true,onRequest:seen,onAction:action});
  const {host}=item;await expect.element(button(host,'Review')).toBeVisible();await expect.element(button(host,'Delete')).not.toBeInTheDocument();
  host.querySelector('[data-details]')!.dispatchEvent(new CustomEvent('ha-dialog-request',{detail:{action:'cancel'},bubbles:true,composed:true,cancelable:true}));
  expect(seen).not.toHaveBeenCalled();expect(action).not.toHaveBeenCalled();
  await button(host,'Close').click();expect(seen).toHaveBeenCalledTimes(1);expect(action).toHaveBeenCalledExactlyOnceWith({action:'close'});
  await item.unmount();active.delete(item);
  host.dispatchEvent(new CustomEvent('ha-dialog-request',{detail:{action:'confirm'},cancelable:true}));expect(seen).toHaveBeenCalledTimes(1);expect(action).toHaveBeenCalledTimes(1);
 });
}
