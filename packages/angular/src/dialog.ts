import {Component,ElementRef,EventEmitter,Input,Output,Renderer2,inject,type OnChanges,type OnDestroy} from '@angular/core';
import {dialogRequestDetail,type DialogRequestDetail,type DialogState} from '@vypdev/ha-ui/dialog-contracts';
import type {DialogRequestEvent,HaDialog} from '@vypdev/ha-ui/dialog';
@Component({selector:'vyp-ha-dialog',standalone:true,template:'<ng-content />'})
export class Dialog implements OnChanges,OnDestroy{
 @Input({required:true}) state!:DialogState;
 @Input({required:true}) open=false;
 @Output() readonly dialogRequest=new EventEmitter<DialogRequestEvent>(false);
 @Output() readonly dialogAction=new EventEmitter<DialogRequestDetail>(false);
 readonly #host=inject<ElementRef<HaDialog>>(ElementRef).nativeElement;
 readonly #renderer=inject(Renderer2);
 readonly #stop=this.#renderer.listen(this.#host,'ha-dialog-request',(event:DialogRequestEvent)=>{
  if(event.target!==this.#host)return;
  const detail=dialogRequestDetail(event.detail);this.dialogRequest.emit(event);if(!event.defaultPrevented)this.dialogAction.emit(detail);
 });
 ngOnChanges():void{this.#renderer.setProperty(this.#host,'state',this.state);this.#renderer.setProperty(this.#host,'open',this.open);}
 ngOnDestroy():void{this.#stop();}
}
