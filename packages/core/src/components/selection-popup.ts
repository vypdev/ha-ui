import type {ReactiveController,ReactiveControllerHost} from 'lit';
/** A browser-only positioning/lifetime adapter; selection and validation remain with the owner. */
export class SelectionPopup implements ReactiveController {
 #target:{anchor:HTMLElement;surface:HTMLElement}|null=null;#listeners:AbortController|null=null;
 constructor(host:ReactiveControllerHost,private readonly dismiss:()=>void){host.addController(this);}
 get opened():boolean{return this.#target!==null;}
 show(anchor:HTMLElement,surface:HTMLElement):void{
  this.close();if(!anchor.isConnected||!surface.isConnected)return;
  this.#target={anchor,surface};surface.showPopover();this.position();
  const listeners=new AbortController();this.#listeners=listeners;const options={signal:listeners.signal,capture:true};
  window.addEventListener('resize',this.position,options);
  // Scroll is not composed: capture at each root in the anchor's composed ancestry.
  const roots=new Set<Window|ShadowRoot>([window]);
  for(let node:Node|null=anchor;node;node=node instanceof Element&&node.assignedSlot?node.assignedSlot:node.parentNode??(node instanceof ShadowRoot?node.host:null)){
   if(node instanceof ShadowRoot)roots.add(node);
  }
  for(const root of roots)root.addEventListener('scroll',this.position,options);
  document.addEventListener('pointerdown',event=>{const path=event.composedPath();if(!path.includes(anchor)&&!path.includes(surface))this.dismiss();},options);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();this.dismiss();}},options);
  surface.addEventListener('toggle',()=>{if(!surface.matches(':popover-open'))this.dismiss();},options);
 }
 close():void{
  this.#listeners?.abort();this.#listeners=null;
  if(this.#target?.surface.matches(':popover-open'))this.#target.surface.hidePopover();
  this.#target=null;
 }
 position=():void=>{
  const target=this.#target;if(target===null)return;const{anchor,surface}=target;
  const box=anchor.getBoundingClientRect(),width=window.innerWidth,height=window.innerHeight;
  surface.style.minWidth=Math.min(box.width,width-16)+'px';surface.style.maxWidth=width-16+'px';
  surface.style.maxHeight=Math.max(40,height-16)+'px';
  const rectangle=surface.getBoundingClientRect(),below=height-box.bottom-8,above=box.top-8;
  const top=below>=rectangle.height||below>=above;
  surface.style.maxHeight=Math.max(40,top?below:above)+'px';
  surface.style.left=Math.max(8,Math.min(width-rectangle.width-8,box.left+(box.width-rectangle.width)/2))+'px';
  surface.style.top=(top?box.bottom:Math.max(8,box.top-Math.min(rectangle.height,above)))+'px';surface.dataset.placement=top?'bottom':'top';
 };
 hostDisconnected():void{this.close();}
}
