import {Component,ElementRef,EventEmitter,Input,Output,Renderer2,forwardRef,inject,type OnChanges,type OnDestroy} from '@angular/core';
import {NG_VALUE_ACCESSOR,NG_VALIDATORS,type ControlValueAccessor,type Validator,type AbstractControl,type ValidationErrors} from '@angular/forms';
import {checkboxChecked,checkboxValidity,checkboxChangeDetail,type CheckboxState} from '@vypdev/ha-ui/checkbox-contracts';
import type {HaCheckbox,CheckboxChangeEvent} from '@vypdev/ha-ui/checkbox';
/** Angular Forms or standalone checked binding; the shared core owns native visuals and forms. */
@Component({selector:'vyp-ha-checkbox',standalone:true,template:'',providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>Checkbox),multi:true},{provide:NG_VALIDATORS,useExisting:forwardRef(()=>Checkbox),multi:true}]})
export class Checkbox implements ControlValueAccessor,Validator,OnChanges,OnDestroy {
 @Input({required:true}) state!:CheckboxState;
 @Input() checked=false;@Input() defaultChecked=false;@Input() value='on';@Input() name='';@Input() disabled=false;@Input() form?:string;
 @Output() readonly checkedRequest=new EventEmitter<CheckboxChangeEvent>(false);@Output() readonly checkedChange=new EventEmitter<boolean>(false);
 readonly #host=inject<ElementRef<HaCheckbox>>(ElementRef).nativeElement;readonly #renderer=inject(Renderer2);
 #modelChecked=false;#change:((checked:boolean)=>void)|undefined;#touched:(()=>void)|undefined;#validatorChanged:(()=>void)|undefined;
 readonly #stopChecked=this.#renderer.listen(this.#host,'ha-check-request',(event:CheckboxChangeEvent)=>{
  if(event.composedPath()[0]!==this.#host)return;
  const detail=checkboxChangeDetail(event.detail);this.checkedRequest.emit(event);if(event.defaultPrevented)return;
  if(this.#change===undefined){this.checkedChange.emit(detail.checked);return;}
  if(detail.reason==='reset'){this.writeValue(this.#modelChecked);return;}this.writeValue(detail.checked);this.#change(detail.checked);
 });
 readonly #stopTouch=this.#renderer.listen(this.#host,'focusout',()=>this.#touched?.());
 ngOnChanges():void{
  for(const [key,value] of Object.entries({state:this.state,name:this.name,value:this.value,defaultChecked:this.defaultChecked}))this.#renderer.setProperty(this.#host,key,value);
  if(this.form===undefined)this.#renderer.removeAttribute(this.#host,'form');else this.#renderer.setAttribute(this.#host,'form',this.form);
  if(this.#change===undefined){this.#renderer.setProperty(this.#host,'disabled',this.disabled);this.writeValue(this.checked);}this.#validatorChanged?.();
 }
 writeValue(raw:unknown):void{const checked=checkboxChecked(raw??false);this.#modelChecked=checked;this.#renderer.setProperty(this.#host,'checked',checked);}
 registerOnChange(fn:(checked:boolean)=>void):void{this.#change=fn;}
 registerOnTouched(fn:()=>void):void{this.#touched=fn;}
 setDisabledState(disabled:boolean):void{this.#renderer.setProperty(this.#host,'disabled',disabled);}
 validate(control:AbstractControl):ValidationErrors|null{const validity=checkboxValidity(control.value??false,this.state);return Object.values(validity.flags).some(Boolean)?{haCheckbox:validity.flags}:null;}
 registerOnValidatorChange(fn:()=>void):void{this.#validatorChanged=fn;}
 ngOnDestroy():void{this.#stopChecked();this.#stopTouch();}
}
