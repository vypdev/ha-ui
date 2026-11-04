import '@angular/compiler';
import {afterEach,expect,test,vi} from 'vitest';
import {Component,signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {FormControl,FormGroup,ReactiveFormsModule,FormsModule,NgModel} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {registerCheckbox,type CheckboxChangeEvent} from '../../packages/core/src/components/checkbox.js';
import {Checkbox} from '../../packages/angular/src/index.js';
import {checkboxAdapterCases,checkboxModel,checkboxInput,type CheckboxOptions} from './checkbox-framework-fixture.js';
TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());
@Component({standalone:true,imports:[Checkbox],template:`<vyp-ha-checkbox [state]="options().state" [checked]="options().checked" [defaultChecked]="options().defaultChecked??false" [value]="options().value??'on'" [name]="options().name??''" [disabled]="options().disabled??false" [form]="options().form" (checkedRequest)="options().onCheckedRequest?.($event)" (checkedChange)="options().onCheckedChange?.($event)" id="bound-checkbox" class="choice" dir="ltr" lang="en" />`})
class Consumer {options=signal<CheckboxOptions>({state:checkboxModel(),checked:false});}
afterEach(()=>TestBed.resetTestingModule());
checkboxAdapterCases(async(target,initial)=>{const fixture=TestBed.createComponent(Consumer);target.append(fixture.nativeElement);fixture.componentInstance.options.set(initial);fixture.detectChanges();await fixture.whenStable();return {host:target.querySelector('vyp-ha-checkbox')!,update:async patch=>{fixture.componentInstance.options.update(value=>({...value,...patch}));fixture.detectChanges();await fixture.whenStable();},unmount:async()=>{fixture.destroy();}};});

@Component({standalone:true,imports:[Checkbox,ReactiveFormsModule],template:`<form ngNativeValidate [formGroup]="group"><vyp-ha-checkbox [state]="state()" name="done" [defaultChecked]="true" formControlName="done" (checkedRequest)="observe($event)" /></form>`})
class ReactiveConsumer {group=new FormGroup({done:new FormControl(false,{nonNullable:true})});state=signal(checkboxModel({required:true}));observe=vi.fn((_event:CheckboxChangeEvent)=>{});}
@Component({standalone:true,imports:[Checkbox,FormsModule],template:`<form ngNativeValidate><vyp-ha-checkbox [state]="state" [(ngModel)]="value" name="done" [defaultChecked]="true" /></form>`})
class ModelConsumer {state=checkboxModel();value:boolean|null=false;}
const host=()=>document.querySelector('vyp-ha-checkbox')!;
async function reactive(strategy:'change'|'blur'|'submit'='change'){
 const fixture=TestBed.createComponent(ReactiveConsumer);fixture.componentInstance.group=new FormGroup({done:new FormControl(false,{nonNullable:true,updateOn:strategy})});fixture.detectChanges();await fixture.whenStable();await host().updateComplete;return fixture;
}
test('CVA preserves one accepted boolean, dirty/touched and programmatic writes',async()=>{
 registerCheckbox();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.done,changes=vi.fn();control.valueChanges.subscribe(changes);field.click();fixture.detectChanges();await field.updateComplete;expect(control.value).toBe(true);expect(control.dirty).toBe(true);expect(changes).toHaveBeenCalledExactlyOnceWith(true);field.focus();field.blur();expect(control.touched).toBe(true);control.setValue(false);await field.updateComplete;expect(field.checked).toBe(false);expect(checkboxInput(field).checked).toBe(false);
});
test('shared Angular validation follows checked while mixed presentation remains independent',async()=>{
 registerCheckbox();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.done;expect(control.errors?.['haCheckbox'].valueMissing).toBe(true);fixture.componentInstance.state.set(checkboxModel({required:true,indeterminate:true}));fixture.detectChanges();control.setValue(true);await field.updateComplete;expect(control.valid).toBe(true);expect(checkboxInput(field).indeterminate).toBe(true);fixture.componentInstance.state.set(checkboxModel({error:'Review'}));fixture.detectChanges();expect(control.errors?.['haCheckbox'].customError).toBe(true);fixture.componentInstance.state.set(checkboxModel());fixture.detectChanges();control.setValue(false);expect(control.valid).toBe(true);
});
test('canceled requests leave the Angular control pristine and the view unchecked',async()=>{
 registerCheckbox();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.done;fixture.componentInstance.observe.mockImplementation(event=>event.preventDefault());field.click();expect(control.value).toBe(false);expect(control.pristine).toBe(true);expect(checkboxInput(field).checked).toBe(false);
});
test('Angular disable/enable and nonnullable native/model resets preserve its model default',async()=>{
 registerCheckbox();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.done;control.disable();await field.updateComplete;expect(checkboxInput(field).disabled).toBe(true);expect([...new FormData(field.form!)]).toEqual([]);control.enable();await field.updateComplete;field.click();field.focus();field.blur();document.querySelector('form')!.reset();fixture.detectChanges();await field.updateComplete;expect(control.value).toBe(false);expect(field.checked).toBe(false);expect(control.pristine).toBe(true);expect(control.untouched).toBe(true);control.setValue(true);control.reset();await field.updateComplete;expect(field.checked).toBe(false);
});
test('updateOn blur retains the checked draft until touch commits the boolean',async()=>{
 registerCheckbox();const fixture=await reactive('blur'),field=host(),control=fixture.componentInstance.group.controls.done;field.focus();field.click();expect(control.value).toBe(false);expect(field.checked).toBe(true);field.blur();expect(control.value).toBe(true);expect(control.touched).toBe(true);
});
test('updateOn submit commits through the real Angular form directive',async()=>{
 registerCheckbox();const fixture=await reactive('submit'),field=host(),control=fixture.componentInstance.group.controls.done;field.click();expect(control.value).toBe(false);const form=document.querySelector('form')!;form.addEventListener('submit',event=>event.preventDefault());form.requestSubmit();fixture.detectChanges();await field.updateComplete;expect(control.value).toBe(true);expect(field.checked).toBe(true);
});
test('ngModel accepts booleans and nullable reset renders unchecked without coercing the nullable model',async()=>{
 registerCheckbox();const fixture=TestBed.createComponent(ModelConsumer);fixture.detectChanges();await fixture.whenStable();await host().updateComplete;expect(host().checked).toBe(false);host().click();fixture.detectChanges();await fixture.whenStable();expect(fixture.componentInstance.value).toBe(true);const directive=fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);directive.control.reset();fixture.detectChanges();await fixture.whenStable();await host().updateComplete;expect(host().checked).toBe(false);expect(directive.control.value).toBe(null);expect(directive.control.pristine).toBe(true);
});
test('CVA snapshots a foreign boolean before observer mutation and destroys model/touch listeners',async()=>{
 registerCheckbox();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.done;fixture.componentInstance.observe.mockImplementation(event=>Reflect.set(event.detail,'checked',false));field.dispatchEvent(new CustomEvent('ha-check-request',{detail:{checked:true,reason:'change'},cancelable:true}));expect(control.value).toBe(true);const observer=fixture.componentInstance.observe;observer.mockClear();control.markAsUntouched();fixture.destroy();field.dispatchEvent(new CustomEvent('ha-check-request',{detail:{checked:false,reason:'change'},cancelable:true}));field.dispatchEvent(new FocusEvent('focusout'));expect(observer).not.toHaveBeenCalled();expect(control.value).toBe(true);expect(control.untouched).toBe(true);
});
test('native validation blocks unchecked required controls before ngSubmit',async()=>{
 registerCheckbox();const fixture=await reactive(),field=host(),control=fixture.componentInstance.group.controls.done,form=document.querySelector('form')!,submits=vi.fn((event:Event)=>event.preventDefault());form.addEventListener('submit',submits);field.addEventListener('invalid',event=>event.preventDefault());form.requestSubmit();expect(submits).not.toHaveBeenCalled();control.setValue(true);form.requestSubmit();expect(submits).toHaveBeenCalledTimes(1);expect([...new FormData(form)]).toEqual([['done','on']]);
});
