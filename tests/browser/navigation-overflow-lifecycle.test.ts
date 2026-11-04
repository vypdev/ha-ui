import {afterEach,expect,test,vi} from 'vitest';
import type {LitElement} from 'lit';
import {NavigationOverflowController} from '../../packages/core/src/components/navigation-overflow.js';

const controllers:NavigationOverflowController[]=[];
afterEach(()=>{controllers.splice(0).forEach(controller=>controller.hostDisconnected());document.body.replaceChildren();vi.restoreAllMocks();vi.unstubAllGlobals();});
function harness(content=true){
 const element=document.createElement('div'),root=element.attachShadow({mode:'open'}),requestUpdate=vi.fn();
 element.style.cssText='display:block;width:240px;font-size:14px';
 const host=Object.assign(element,{renderRoot:root,addController:vi.fn(),requestUpdate}) as unknown as LitElement;
 const controller=new NavigationOverflowController(host);controllers.push(controller);
 if(content)root.innerHTML='<div class="bar" style="width:240px;overflow:auto"><div class="items" style="width:800px;height:56px"><button>One</button></div></div>';
 return{host,root,controller,requestUpdate,bar:root.querySelector<HTMLElement>('.bar')!};
}
function scheduler(){
 const frames:FrameRequestCallback[]=[],resize:ResizeObserverCallback[]=[],styles:MutationCallback[]=[];
 vi.stubGlobal('requestAnimationFrame',vi.fn((cb:FrameRequestCallback)=>frames.push(cb)));
 vi.stubGlobal('cancelAnimationFrame',vi.fn());
 vi.stubGlobal('ResizeObserver',class{constructor(cb:ResizeObserverCallback){resize.push(cb);}observe(){}disconnect(){}});
 vi.stubGlobal('MutationObserver',class{constructor(cb:MutationCallback){styles.push(cb);}observe(){}disconnect(){}});
 return{frames,resize,styles,resizeNow:(n=0)=>resize[n]([],{} as ResizeObserver),stylesNow:(n=0)=>styles[n]([],{} as MutationObserver)};
}
test('controller waits for a connected render tree and tolerates missing layout during replacement',()=>{
 const {host,controller,root,requestUpdate}=harness(false);controller.update(null);expect(requestUpdate).not.toHaveBeenCalled();
 document.body.append(host);controller.hostConnected();expect(requestUpdate).toHaveBeenCalledOnce();controller.update(null);
 root.innerHTML='<div class="bar"></div>';controller.update(null);expect(controller.geometry.maximum).toBe(0);
 controller.page('end');controller.reveal(document.body);expect(controller.geometry.position).toBe(0);
});
test('queued observer and animation callbacks from a retired layout cannot mutate its replacement',()=>{
 const clock=scheduler(),{host,controller,bar,requestUpdate}=harness();document.body.append(host);controller.update(null);controller.update(null);
 expect(clock.frames).toHaveLength(1);controller.hostDisconnected();controller.update(null);expect(clock.frames).toHaveLength(2);
 clock.resizeNow();clock.stylesNow();clock.frames[0](0);expect(controller.geometry.maximum).toBe(0);
 clock.frames[1](0);expect(controller.geometry.maximum).toBe(560);expect(controller.geometry.end).toBe(true);
 const updates=requestUpdate.mock.calls.length;clock.resizeNow(1);clock.stylesNow(1);expect(clock.frames).toHaveLength(3);clock.frames[2](0);expect(requestUpdate).toHaveBeenCalledTimes(updates);
 controller.reveal(document.body);expect(bar.scrollLeft).toBe(0);controller.page('start');expect(bar.scrollLeft).toBe(0);
});
test('callbacks delivered after physical removal are inert even before the host lifecycle notification',()=>{
 const clock=scheduler(),{host,controller,bar}=harness();document.body.append(host);controller.update(null);
 bar.dispatchEvent(new MouseEvent('mousedown',{clientX:180,bubbles:true}));host.remove();clock.frames[0](0);
 controller.page('end');controller.update(null);window.dispatchEvent(new MouseEvent('mousemove',{clientX:40,buttons:1}));expect(bar.scrollLeft).toBe(0);
});
test('retained native listener callbacks become harmless when their layout is detached',()=>{
 const {host,controller,bar}=harness();document.body.append(host);const registrations=vi.spyOn(bar,'addEventListener'),global=vi.spyOn(window,'addEventListener');controller.update(null);
 const down=registrations.mock.calls.find(([name])=>name==='mousedown')![1] as EventListener;down(new MouseEvent('mousedown',{clientX:180}));
 const move=global.mock.calls.find(([name])=>name==='mousemove')![1] as EventListener;
 controller.hostDisconnected();down(new MouseEvent('mousedown'));move(new MouseEvent('mousemove',{clientX:40,buttons:1}));controller.reveal(bar);controller.page('end');expect(bar.scrollLeft).toBe(0);
});
