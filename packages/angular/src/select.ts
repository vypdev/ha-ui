import {Component,ElementRef,EventEmitter,Input,Output,Renderer2,forwardRef,inject,type OnChanges,type OnDestroy} from '@angular/core';
import {NG_VALUE_ACCESSOR,NG_VALIDATORS,type ControlValueAccessor,type Validator,type AbstractControl,type ValidationErrors} from '@angular/forms';
import {selectSelection,selectValidity,selectValueDetail,type SelectState,type SelectSelection} from '@vypdev/ha-ui/select-contracts';
import type {HaSelect,SelectValueEvent} from '@vypdev/ha-ui/select';
/** Angular Forms or explicit two-way value binding; the core remains the only native/visual controller. */
@Component({selector:'vyp-ha-select',standalone:true,template:'',providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>Select),multi:true},{provide:NG_VALIDATORS,useExisting:forwardRef(()=>Select),multi:true}]})
export class Select implements ControlValueAccessor,Validator,OnChanges,OnDestroy {
 @Input({required:true}) state!:SelectState;
 @Input() value:SelectSelection=null;@Input() name='';@Input() defaultValue:SelectSelection=null;@Input() disabled=false;@Input() form?:string;
 @Output() readonly valueRequest=new EventEmitter<SelectValueEvent>(false);
 @Output() readonly valueChange=new EventEmitter<SelectSelection>(false);
 readonly #host=inject<ElementRef<HaSelect>>(ElementRef).nativeElement;readonly #renderer=inject(Renderer2);
 #modelValue:SelectSelection=null;#change:((value:SelectSelection)=>void)|undefined;#touched:(()=>void)|undefined;#validatorChanged:(()=>void)|undefined;
 readonly #stopValue=this.#renderer.listen(this.#host,'ha-select-request',(event:SelectValueEvent)=>{
  if(event.composedPath()[0]!==this.#host)return;
  const detail=selectValueDetail(event.detail);this.valueRequest.emit(event);if(event.defaultPrevented)return;
  if(this.#change===undefined){this.valueChange.emit(detail.value);return;}
  // The Angular form directive has already reset its nullable/nonnullable model before this native callback.
  if(detail.reason==='reset'){this.writeValue(this.#modelValue);return;}this.writeValue(detail.value);this.#change(detail.value);
 });
 readonly #stopTouch=this.#renderer.listen(this.#host,'focusout',()=>this.#touched?.());
 ngOnChanges():void{
  for(const [key,value] of Object.entries({state:this.state,name:this.name,defaultValue:this.defaultValue}))this.#renderer.setProperty(this.#host,key,value);
  if(this.form===undefined)this.#renderer.removeAttribute(this.#host,'form');else this.#renderer.setAttribute(this.#host,'form',this.form);
  if(this.#change===undefined){this.#renderer.setProperty(this.#host,'disabled',this.disabled);this.writeValue(this.value);}this.#validatorChanged?.();
 }
 writeValue(raw:unknown):void{const value=selectSelection(raw??null);this.#modelValue=value;this.#renderer.setProperty(this.#host,'value',value);}
 registerOnChange(fn:(value:SelectSelection)=>void):void{this.#change=fn;}
 registerOnTouched(fn:()=>void):void{this.#touched=fn;}
 setDisabledState(disabled:boolean):void{this.#renderer.setProperty(this.#host,'disabled',disabled);}
 validate(control:AbstractControl):ValidationErrors|null{const validity=selectValidity(control.value??null,this.state);return Object.values(validity.flags).some(Boolean)?{haSelect:validity.flags}:null;}
 registerOnValidatorChange(fn:()=>void):void{this.#validatorChanged=fn;}
 ngOnDestroy():void{this.#stopValue();this.#stopTouch();}
}
