import type {LitElement,ReactiveController} from 'lit';
import {navigationPageScroll,navigationScrollGeometry,type NavigationScrollGeometry} from '../navigation-scroll.js';

/** Client-only layout and gesture adapter; it never chooses a destination or emits selection. */
export class NavigationOverflowController implements ReactiveController {
  #viewport:HTMLElement|null=null;
  #resize:ResizeObserver|null=null;
  #styles:MutationObserver|null=null;
  #frame:number|null=null;
  #epoch=0;
  #selected:string|null|undefined;
  #revealSelection=false;
  #geometry=navigationScrollGeometry(0,0,0,false);
  #drag:{viewport:HTMLElement;start:number;offset:number}|null=null;
  #suppressClick=false;
  constructor(readonly host:LitElement){host.addController(this);}
  get geometry():NavigationScrollGeometry{return this.#geometry;}
  hostConnected():void {this.host.requestUpdate();}
  hostDisconnected():void {this.#detach();}

  update(selected:string|null):void {
    if(!this.host.isConnected)return;
    const viewport=this.host.renderRoot.querySelector<HTMLElement>('.bar');
    const content=this.host.renderRoot.querySelector<HTMLElement>('.items');
    if(!viewport||!content){this.#detach();return;}
    if(this.#viewport!==viewport){
      this.#detach();this.#viewport=viewport;
      viewport.addEventListener('scroll',this.#schedule,{passive:true});
      viewport.addEventListener('mousedown',this.#down);
      viewport.addEventListener('dragstart',this.#nativeDrag);
      const epoch=this.#epoch;
      this.#resize=new ResizeObserver(()=>{if(epoch===this.#epoch)this.#schedule();});
      this.#resize.observe(viewport);this.#resize.observe(content);
      this.#styles=new MutationObserver(()=>{if(epoch===this.#epoch)this.#schedule();});
      let ancestor:Element|null=this.host;
      while(ancestor){
        this.#styles.observe(ancestor,{attributes:true,attributeFilter:['dir','style','class','lang']});
        const parent:Element|null=ancestor.parentElement;
        ancestor=parent??(ancestor.getRootNode() instanceof ShadowRoot?(ancestor.getRootNode() as ShadowRoot).host:null);
      }
    }
    if(this.#selected!==selected){this.#selected=selected;this.#revealSelection=true;}
    this.#schedule();
  }
  #read():NavigationScrollGeometry {
    const v=this.#viewport!;
    return navigationScrollGeometry(v.scrollWidth,v.clientWidth,v.scrollLeft,getComputedStyle(this.host).direction==='rtl');
  }
  #store(value:NavigationScrollGeometry):void {
    const before=this.#geometry;this.#geometry=value;
    if(before.start!==value.start||before.end!==value.end||before.rtl!==value.rtl)this.host.requestUpdate();
  }
  #schedule=():void=>{
    if(this.#frame!==null||!this.#viewport||!this.host.isConnected)return;
    const epoch=this.#epoch;
    const frame=requestAnimationFrame(()=>{
      if(this.#frame!==frame||epoch!==this.#epoch)return;
      this.#frame=null;
      if(!this.host.isConnected||!this.#viewport)return;
      if(this.#revealSelection){
        this.#revealSelection=false;
        const selected=this.#viewport.querySelector<HTMLElement>('[aria-current=page],[aria-selected=true]');
        if(selected)this.reveal(selected);
      }
      this.#store(this.#read());
    });
    this.#frame=frame;
  };
  reveal(item:HTMLElement):void {
    const viewport=this.#viewport;if(!viewport||!viewport.contains(item))return;
    // A newer keyboard focus takes precedence over an earlier deferred selection reveal.
    this.#revealSelection=false;
    const geometry=this.#read(),frame=viewport.getBoundingClientRect(),target=item.getBoundingClientRect();
    const gutter=Number.parseFloat(getComputedStyle(this.host).fontSize)*1.5;
    const left=frame.left+((geometry.rtl?geometry.end:geometry.start)?gutter:0);
    const right=frame.right-((geometry.rtl?geometry.start:geometry.end)?gutter:0);
    const delta=target.width>right-left?(geometry.rtl?target.right-right:target.left-left):target.left<left?target.left-left:target.right>right?target.right-right:0;
    if(delta!==0)viewport.scrollTo({left:viewport.scrollLeft+delta,behavior:'instant'});
    this.#store(this.#read());
  }
  page(side:'start'|'end'):void {
    const viewport=this.#viewport;if(!viewport||!this.host.isConnected)return;
    const geometry=this.#read();if(!geometry[side])return;
    const duration=getComputedStyle(this.host).getPropertyValue('--vyp-ha-motion-duration').trim();
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||Number.parseFloat(duration)===0;
    viewport.scrollTo({left:navigationPageScroll(geometry,side),behavior:reduced?'instant':'smooth'});
    this.#schedule();
  }
  consumeClick(event:MouseEvent):boolean {
    if(!this.#suppressClick||event.detail===0)return false;
    this.#suppressClick=false;return true;
  }
  #down=(event:MouseEvent):void=>{
    this.#finishDrag();
    if(event.defaultPrevented||event.button!==0||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!this.#viewport)return;
    this.#drag={viewport:this.#viewport,start:event.clientX,offset:this.#viewport.scrollLeft};
    window.addEventListener('mousemove',this.#move);window.addEventListener('mouseup',this.#up);window.addEventListener('blur',this.#blur);
  };
  #move=(event:MouseEvent):void=>{
    const drag=this.#drag;if(!drag)return;
    if(event.buttons===0||drag.viewport!==this.#viewport||!this.host.isConnected){this.#finishDrag();return;}
    const distance=event.clientX-drag.start;
    if(!this.#suppressClick&&Math.abs(distance)<=1)return;
    this.#suppressClick=true;event.preventDefault();drag.viewport.scrollLeft=drag.offset-distance;this.#schedule();
  };
  #nativeDrag=(event:DragEvent):void=>{if(this.#drag)event.preventDefault();};
  #up=():void=>{this.#finishDrag(true);};
  #blur=():void=>{this.#finishDrag();};
  #finishDrag(preserveClick=false):void {
    if(this.#drag){window.removeEventListener('mousemove',this.#move);window.removeEventListener('mouseup',this.#up);window.removeEventListener('blur',this.#blur);this.#drag=null;}
    if(!preserveClick)this.#suppressClick=false;
  }
  #detach():void {
    this.#epoch++;if(this.#frame!==null){cancelAnimationFrame(this.#frame);this.#frame=null;}
    this.#resize?.disconnect();this.#styles?.disconnect();this.#resize=null;this.#styles=null;
    this.#viewport?.removeEventListener('scroll',this.#schedule);this.#viewport?.removeEventListener('mousedown',this.#down);this.#viewport?.removeEventListener('dragstart',this.#nativeDrag);
    this.#finishDrag();this.#viewport=null;this.#selected=undefined;this.#revealSelection=false;this.#geometry=navigationScrollGeometry(0,0,0,false);
  }
}
