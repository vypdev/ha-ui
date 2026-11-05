import '@angular/compiler';
import {afterEach,expect,test,vi} from 'vitest';
import {Component,signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {FormControl,FormGroup,ReactiveFormsModule,FormsModule,NgModel} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {registerSelect,type SelectValueEvent} from '../../packages/core/src/components/select.js';
import type {SelectSelection} from '../../packages/core/src/select-contracts.js';
import {Select} from '../../packages/angular/src/index.js';
import {selectAdapterCases,selectModel,selectPropose,selectControl,type SelectOptions} from './select-framework-fixture.js';
TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());
@Component({standalone:true,imports:[Select],template:`<vyp-ha-select [state]="options().state" [value]="options().value" [defaultValue]="options().defaultValue??null" [name]="options().name??''" [disabled]="options().disabled??false" [form]="options().form" (valueRequest)="options().onValueRequest?.($event)" (valueChange)="options().onValueChange?.($event)" id="bound-select" class="choice" dir="ltr" lang="en" />`})
class Consumer {options=signal<SelectOptions>({state:selectModel(),value:null});}
afterEach(()=>TestBed.resetTestingModule());
selectAdapterCases(async(target,initial)=>{const fixture=TestBed.createComponent(Consumer);target.append(fixture.nativeElement);fixture.componentInstance.options.set(initial);fixture.detectChanges();await fixture.whenStable();return {host:target.querySelector('vyp-ha-select')!,update:async patch=>{fixture.componentInstance.options.update(value=>({...value,...patch}));fixture.detectChanges();await fixture.whenStable();},unmount:async()=>{fixture.destroy();}};});

@Component({standalone:true,imports:[Select,ReactiveFormsModule],template:`<form ngNativeValidate [formGroup]="group"><vyp-ha-select [state]="state()" name="category" [defaultValue]="false" formControlName="category" (valueRequest)="observe($event)" /></form>`})
class ReactiveConsumer {group=new FormGroup({category:new FormControl<SelectSelection>(1,{nonNullable:true})});state=signal(selectModel({required:true}));observe=vi.fn((_event:SelectValueEvent)=>{});}
@Component({standalone:true,imports:[Select,FormsModule],template:`<form><vyp-ha-select [state]="state" [(ngModel)]="value" name="category" [defaultValue]="1" /></form>`})
class ModelConsumer {state=selectModel();value:SelectSelection=false;}
const host=()=>document.querySelector('vyp-ha-select')!;
async function reactive(strategy:'change'|'blur'|'submit'='change',initial:SelectSelection=1,multiple=false){
 const fixture=TestBed.createComponent(ReactiveConsumer);fixture.componentInstance.group=new FormGroup({category:new FormControl<SelectSelection>(initial,{nonNullable:true,updateOn:strategy})});fixture.componentInstance.state.set(selectModel({required:true,multiple}));fixture.detectChanges();await fixture.whenStable();await host().updateComplete;return fixture;
}
test('Angular CVA preserves primitive types, one dirty change, touched state and programmatic writes',async()=>{
 registerSelect();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.category,changes=vi.fn();control.valueChanges.subscribe(changes);await selectPropose(field,['2']);fixture.detectChanges();await field.updateComplete;expect(control.value).toBe(false);expect(control.dirty).toBe(true);expect(changes).toHaveBeenCalledExactlyOnceWith(false);field.focus();field.blur();expect(control.touched).toBe(true);control.setValue('1');await field.updateComplete;expect(field.value).toBe('1');expect(selectControl(field).value).toBe('1');
});
test('Angular shared validation follows required, unavailable options, mode and state-error changes',async()=>{
 registerSelect();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.category;control.setValue(null);expect(control.errors?.['haSelect'].valueMissing).toBe(true);control.setValue('missing');expect(control.errors?.['haSelect'].customError).toBe(true);control.setValue(1);expect(control.valid).toBe(true);fixture.componentInstance.state.set(selectModel({error:'Review'}));fixture.detectChanges();expect(control.errors?.['haSelect'].customError).toBe(true);fixture.componentInstance.state.set(selectModel({multiple:true}));fixture.detectChanges();control.setValue([1,false]);await field.updateComplete;expect(control.valid).toBe(true);
});
test('canceled Angular requests leave the control pristine and preserve native selection',async()=>{
 registerSelect();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.category;fixture.componentInstance.observe.mockImplementation(event=>event.preventDefault());await selectPropose(field,['2']);expect(control.value).toBe(1);expect(control.pristine).toBe(true);expect(selectControl(field).value).toBe('0');
});
test('Angular disable/enable and nonnullable native/model reset preserve the framework default',async()=>{
 registerSelect();const fixture=await reactive('change',[1,false],true),field=host(),control=fixture.componentInstance.group.controls.category;control.disable();await field.updateComplete;expect(selectControl(field).disabled).toBe(true);expect([...new FormData(field.form!)]).toEqual([]);control.enable();await field.updateComplete;await selectPropose(field,['1']);field.focus();field.blur();document.querySelector('form')!.reset();fixture.detectChanges();await field.updateComplete;expect(control.value).toEqual([1,false]);expect(field.value).toEqual([1,false]);expect(control.pristine).toBe(true);expect(control.untouched).toBe(true);control.setValue([]);control.reset();await field.updateComplete;expect(field.value).toEqual([1,false]);
});
test('Angular updateOn blur keeps the draft until touch commits it',async()=>{
 registerSelect();const fixture=await reactive('blur'),field=host(),control=fixture.componentInstance.group.controls.category;field.focus();await selectPropose(field,['2']);expect(control.value).toBe(1);expect(field.value).toBe(false);field.blur();expect(control.value).toBe(false);expect(control.touched).toBe(true);
});
test('Angular updateOn submit commits through the real form directive',async()=>{
 registerSelect();const fixture=await reactive('submit'),field=host(),control=fixture.componentInstance.group.controls.category;await selectPropose(field,['2']);expect(control.value).toBe(1);const form=document.querySelector('form')!;form.addEventListener('submit',event=>event.preventDefault());form.requestSubmit();fixture.detectChanges();await field.updateComplete;expect(control.value).toBe(false);expect(field.value).toBe(false);
});
test('ngModel preserves boolean values and nullable reset instead of the native default',async()=>{
 registerSelect();const fixture=TestBed.createComponent(ModelConsumer);fixture.detectChanges();await fixture.whenStable();await host().updateComplete;expect(host().value).toBe(false);await selectPropose(host(),['0']);fixture.detectChanges();await fixture.whenStable();expect(fixture.componentInstance.value).toBe(1);const directive=fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);directive.control.reset();fixture.detectChanges();await fixture.whenStable();await host().updateComplete;expect(host().value).toBe(null);expect(directive.control.pristine).toBe(true);
});
test('Angular CVA snapshots foreign requests before mutation and destroy removes model/touch listeners',async()=>{
 registerSelect();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.category;fixture.componentInstance.observe.mockImplementation(event=>Reflect.set(event.detail,'value','tampered'));field.dispatchEvent(new CustomEvent('ha-select-request',{detail:{value:false,reason:'change'},cancelable:true}));expect(control.value).toBe(false);const observer=fixture.componentInstance.observe;observer.mockClear();control.markAsUntouched();fixture.destroy();field.dispatchEvent(new CustomEvent('ha-select-request',{detail:{value:1,reason:'change'},cancelable:true}));field.dispatchEvent(new FocusEvent('focusout'));expect(observer).not.toHaveBeenCalled();expect(control.value).toBe(false);expect(control.untouched).toBe(true);
});

test('reactive native validation blocks an empty required selection before ngSubmit',async()=>{
 registerSelect();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.category,form=document.querySelector('form')!,submits=vi.fn((event:Event)=>event.preventDefault());form.addEventListener('submit',submits);field.addEventListener('invalid',event=>event.preventDefault());control.setValue(null);form.requestSubmit();expect(submits).not.toHaveBeenCalled();control.setValue(false);form.requestSubmit();expect(submits).toHaveBeenCalledTimes(1);expect([...new FormData(form)]).toEqual([['category','false']]);
});
