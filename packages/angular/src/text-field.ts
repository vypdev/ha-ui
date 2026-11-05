import {Component,ElementRef,EventEmitter,Input,Output,Renderer2,forwardRef,inject,type OnChanges,type OnDestroy} from '@angular/core';
import {NG_VALUE_ACCESSOR,NG_VALIDATORS,type ControlValueAccessor,type Validator,type AbstractControl,type ValidationErrors} from '@angular/forms';
import {textFieldValue,textFieldValidity,fieldValueDetail,type TextFieldState} from '@vypdev/ha-ui/field-contracts';
import type {HaTextField,FieldValueEvent} from '@vypdev/ha-ui/field';

/** Angular maps model and validation ports; the core host owns the only visual implementation. */
@Component({selector:'vyp-ha-field',standalone:true,template:'',providers:[
  {provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>TextField),multi:true},
  {provide:NG_VALIDATORS,useExisting:forwardRef(()=>TextField),multi:true},
]})
export class TextField implements ControlValueAccessor,Validator,OnChanges,OnDestroy {
  @Input({required:true}) state!:TextFieldState;
  @Input() value='';@Input() name='';@Input() defaultValue='';@Input() disabled=false;@Input() form?:string;
  @Output() readonly valueRequest=new EventEmitter<FieldValueEvent>(false);
  readonly #host=inject<ElementRef<HaTextField>>(ElementRef).nativeElement;
  readonly #renderer=inject(Renderer2);
  #modelValue='';#change:((value:string)=>void)|undefined;#touched:(()=>void)|undefined;#validatorChanged:(()=>void)|undefined;
  readonly #stopValue=this.#renderer.listen(this.#host,'ha-value-request',(event:FieldValueEvent)=>{
    if(event.composedPath()[0]!==this.#host)return;
    const detail=fieldValueDetail(event.detail);this.valueRequest.emit(event);if(event.defaultPrevented||this.#change===undefined)return;
    // Angular's form reset already wrote the correct nullable/nonnullable default before the native callback.
    if(detail.reason==='reset'){this.writeValue(this.#modelValue);return;}
    this.writeValue(detail.value);this.#change(detail.value);
  });
  readonly #stopTouch=this.#renderer.listen(this.#host,'focusout',()=>this.#touched?.());
  ngOnChanges():void{
    for(const [key,value] of Object.entries({state:this.state,name:this.name,defaultValue:this.defaultValue}))this.#renderer.setProperty(this.#host,key,value);
    if(this.form===undefined)this.#renderer.removeAttribute(this.#host,'form');else this.#renderer.setAttribute(this.#host,'form',this.form);
    if(this.#change===undefined){this.#renderer.setProperty(this.#host,'disabled',this.disabled);this.writeValue(this.value);}
    this.#validatorChanged?.();
  }
  writeValue(value:unknown):void{const next=textFieldValue(value??'');this.#modelValue=next;this.#renderer.setProperty(this.#host,'value',next);}
  registerOnChange(fn:(value:string)=>void):void{this.#change=fn;}
  registerOnTouched(fn:()=>void):void{this.#touched=fn;}
  setDisabledState(disabled:boolean):void{this.#renderer.setProperty(this.#host,'disabled',disabled);}
  validate(control:AbstractControl):ValidationErrors|null{
    const result=textFieldValidity(control.value??'',this.state);
    return !this.state.readOnly&&Object.values(result.flags).some(Boolean)?{haField:result.flags}:null;
  }
  registerOnValidatorChange(fn:()=>void):void{this.#validatorChanged=fn;}
  ngOnDestroy():void{this.#stopValue();this.#stopTouch();}
}
