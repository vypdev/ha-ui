import type {ReactiveController,ReactiveControllerHost} from 'lit';
import {selectionScrollRoots} from './selection-events.js';
/** Native modal focus/inertness with a separately positioned painted picker body. */
export class SelectionDialog implements ReactiveController {
 #target:{anchor:HTMLElement;dialog:HTMLDialogElement;surface:HTMLElement;minimum:number}|null=null;#listeners:AbortController|null=null;
 constructor(host:ReactiveControllerHost,private readonly dismiss:()=>void){host.addController(this);}
 get opened():boolean{return this.#target!==null;}
 show(anchor:HTMLElement,dialog:HTMLDialogElement,surface:HTMLElement):void{
  this.close();if(!anchor.isConnected||!dialog.isConnected||!surface.isConnected)return;
  const target={anchor,dialog,surface,minimum:0};this.#target=target;dialog.showModal();
  // Native autofocus may synchronously close, replace or detach its owner.
  if(this.#target!==target)return;
  if(!anchor.isConnected||!dialog.isConnected||!surface.isConnected||!dialog.open){this.close();this.dismiss();return;}
  this.position();target.minimum=surface.getBoundingClientRect().height;this.position();
  const listeners=new AbortController();this.#listeners=listeners;const options={signal:listeners.signal,capture:true};
  window.addEventListener('resize',this.position,options);
  for(const root of selectionScrollRoots(anchor))root.addEventListener('scroll',this.position,options);
  dialog.addEventListener('cancel',event=>{event.preventDefault();this.dismiss();},options);
  dialog.addEventListener('click',event=>{if(event.target===dialog){event.preventDefault();this.dismiss();}},options);
  dialog.addEventListener('close',()=>{if(!dialog.open)this.dismiss();},options);
  dialog.addEventListener('keydown',event=>{
   if(event.key!=='Tab'||event.altKey||event.ctrlKey||event.metaKey)return;
   const controls=[...surface.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex]')].filter(element=>element.tabIndex>=0&&!element.matches(':disabled')&&element.getClientRects().length>0),first=controls[0],last=controls[controls.length-1];
   if(first===undefined){event.preventDefault();dialog.focus();return;}
   const active=(dialog.getRootNode() as Document|ShadowRoot).activeElement;
   if(active===(event.shiftKey?first:last)){event.preventDefault();(event.shiftKey?last:first).focus();}
  },options);
 }
 close():void{
  this.#listeners?.abort();this.#listeners=null;
  if(this.#target?.dialog.open)this.#target.dialog.close();
  this.#target=null;
 }
 position=():void=>{
  const target=this.#target;if(target===null)return;const {anchor,surface}=target,box=anchor.getBoundingClientRect(),width=window.innerWidth,height=window.innerHeight;
  surface.style.width=Math.min(Math.max(250,box.width),Math.max(0,width-32))+'px';surface.style.maxHeight=Math.max(40,height-32)+'px';
  const rectangle=surface.getBoundingClientRect(),below=height-box.bottom-8,above=box.top-8,down=below>=rectangle.height||below>=above;
  const available=Math.max(40,down?below:above);surface.style.maxHeight=available+'px';surface.style.minHeight=Math.min(target.minimum,available)+'px';surface.style.left=Math.max(16,Math.min(width-rectangle.width-16,box.left+(box.width-rectangle.width)/2))+'px';surface.style.top=(down?box.bottom:Math.max(8,box.top-Math.min(rectangle.height,above)))+'px';surface.dataset.placement=down?'bottom':'top';
 };
 hostDisconnected():void{this.close();}
}
