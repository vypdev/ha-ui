import {Component,ElementRef,EventEmitter,Input,Output,Renderer2,inject,type OnChanges,type OnDestroy} from '@angular/core';
import {buttonPressDetail,type ButtonState,type ButtonType,type ButtonPressDetail} from '@vypdev/ha-ui/button-contracts';
import type {HaButton,ButtonPressEvent} from '@vypdev/ha-ui/button';
/** A command is not a value control; the core alone implements the browser form action. */
@Component({selector:'vyp-ha-button',standalone:true,template:'<ng-content />'})
export class Button implements OnChanges,OnDestroy {
  @Input({required:true}) state!:ButtonState;
  @Input() type:ButtonType='button';@Input() name='';@Input() value='';@Input() disabled=false;@Input() formNoValidate=false;@Input() form?:string;
  @Output() readonly pressRequest=new EventEmitter<ButtonPressEvent>(false);
  @Output() readonly press=new EventEmitter<ButtonPressDetail>(false);
  readonly #host=inject<ElementRef<HaButton>>(ElementRef).nativeElement;
  readonly #renderer=inject(Renderer2);
  readonly #stop=this.#renderer.listen(this.#host,'ha-press-request',(event:ButtonPressEvent)=>{
    const detail=buttonPressDetail(event.detail);this.pressRequest.emit(event);if(!event.defaultPrevented)this.press.emit(detail);
  });
  ngOnChanges():void{
    for(const [key,value] of Object.entries({state:this.state,type:this.type,name:this.name,value:this.value,disabled:this.disabled,formNoValidate:this.formNoValidate}))this.#renderer.setProperty(this.#host,key,value);
    if(this.form===undefined)this.#renderer.removeAttribute(this.#host,'form');else this.#renderer.setAttribute(this.#host,'form',this.form);
  }
  ngOnDestroy():void{this.#stop();}
}
