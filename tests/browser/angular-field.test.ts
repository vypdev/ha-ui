import '@angular/compiler';
import {afterEach,expect,test,vi} from 'vitest';
import {Component,signal} from '@angular/core';
import {TestBed,type ComponentFixture} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {FormControl,FormGroup,ReactiveFormsModule,FormsModule,NgModel} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {TextField} from '../../packages/angular/src/index.js';
import {registerField,type FieldValueEvent} from '../../packages/core/src/components/field.js';
import {fieldModel,fieldHost,fieldInput,propose,formEntries,malformedRequest,mutableRequest} from './field-framework-fixture.js';
TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());
@Component({standalone:true,imports:[TextField,ReactiveFormsModule],template:`<form [formGroup]="group"><vyp-ha-field name="task" defaultValue="Native baseline" [state]="state()" formControlName="task" (valueRequest)="observe($event)" /><button type="reset">Reset</button></form>`})
class ReactiveConsumer {
  group=new FormGroup({task:new FormControl('Kitchen',{nonNullable:true})});state=signal(fieldModel());observe=vi.fn((_event:FieldValueEvent)=>{});
}
@Component({standalone:true,imports:[TextField,FormsModule],template:'<form><vyp-ha-field [state]="state" [(ngModel)]="value" name="task" /></form>'})
class ModelConsumer {state=fieldModel();value:string|null='Kitchen';}
@Component({standalone:true,imports:[TextField],template:`<form id="plain-form"><vyp-ha-field [state]="state()" [value]="value()" [disabled]="disabled()" [form]="external()" (valueRequest)="observe($event)" name="task" /></form>`})
class PlainConsumer {state=signal(fieldModel());value=signal('Kitchen');disabled=signal(false);external=signal<string|undefined>(undefined);observe=vi.fn((_event:FieldValueEvent)=>{});}
function reactive(strategy:'change'|'blur'|'submit'='change'){
  const fixture=TestBed.createComponent(ReactiveConsumer);fixture.componentInstance.group=new FormGroup({task:new FormControl('Kitchen',{nonNullable:true,updateOn:strategy})});fixture.detectChanges();return fixture;
}
async function settle(fixture:ComponentFixture<unknown>){fixture.detectChanges();await fixture.whenStable();await fieldHost().updateComplete;}
afterEach(()=>{TestBed.resetTestingModule();document.body.replaceChildren();});
test('CVA validates and preserves a model written before explicit element upgrade',async()=>{
  const fixture=reactive();const field=fieldHost();expect(customElements.get('vyp-ha-field')).toBeUndefined();expect(field.value).toBe('Kitchen');expect(fixture.componentInstance.group.valid).toBe(true);
  registerField();await settle(fixture);expect(fieldInput(field).value).toBe('Kitchen');expect(field.getAttribute('value')).toBe('Native baseline');expect(field.hasAttribute('state')).toBe(false);expect(document.querySelectorAll('vyp-ha-field')).toHaveLength(1);
});
test('reactive controls receive exactly one accepted change, dirty/touched and programmatic writes',async()=>{
  registerField();const fixture=reactive(),field=fieldHost(),control=fixture.componentInstance.group.controls.task;await settle(fixture);const values=vi.fn();control.valueChanges.subscribe(values);
  propose(field,'Laundry');await settle(fixture);expect(control.value).toBe('Laundry');expect(control.dirty).toBe(true);expect(values).toHaveBeenCalledExactlyOnceWith('Laundry');expect(formEntries()).toEqual([['task','Laundry']]);expect(fixture.componentInstance.observe).toHaveBeenCalledTimes(1);
  field.focus();field.blur();expect(control.touched).toBe(true);control.setValue('Programmatic');await settle(fixture);expect(fieldInput(field).value).toBe('Programmatic');expect(fixture.componentInstance.observe).toHaveBeenCalledTimes(1);
});
test('canceled requests never change Angular model/view state',async()=>{
  registerField();const fixture=reactive(),field=fieldHost();await settle(fixture);fixture.componentInstance.observe.mockImplementation(event=>event.preventDefault());propose(field,'Rejected');
  expect(fixture.componentInstance.group.controls.task.value).toBe('Kitchen');expect(fieldInput(field).value).toBe('Kitchen');expect(fixture.componentInstance.group.pristine).toBe(true);
});
test('shared constraints update Angular validation without copying presentation policy',async()=>{
  registerField();const fixture=reactive(),field=fieldHost(),control=fixture.componentInstance.group.controls.task;await settle(fixture);
  control.setValue('');expect(control.errors?.['haField'].valueMissing).toBe(true);control.setValue('a');expect(control.errors?.['haField'].tooShort).toBe(true);control.setValue('Long'.repeat(6));expect(control.errors?.['haField'].tooLong).toBe(true);
  control.setValue('Kitchen');fixture.componentInstance.state.set(fieldModel({error:'Review this value.'}));await settle(fixture);expect(control.errors?.['haField'].customError).toBe(true);
  fixture.componentInstance.state.set(fieldModel({readOnly:true,error:'Review this value.'}));await settle(fixture);expect(control.valid).toBe(true);expect(field.willValidate).toBe(false);
  fixture.componentInstance.state.set(fieldModel());await settle(fixture);expect(control.valid).toBe(true);
});
test('enable/disable and native/model resets preserve Angular defaults and pristine state',async()=>{
  registerField();const fixture=reactive(),field=fieldHost(),control=fixture.componentInstance.group.controls.task;await settle(fixture);control.disable();await settle(fixture);expect(fieldInput(field).disabled).toBe(true);expect(formEntries()).toEqual([]);
  control.enable();await settle(fixture);propose(field,'Laundry');field.focus();field.blur();document.querySelector('form')!.reset();await settle(fixture);
  expect(control.value).toBe('Kitchen');expect(field.value).toBe('Kitchen');expect(control.pristine).toBe(true);expect(control.untouched).toBe(true);
  control.setValue('Changed');control.reset();await settle(fixture);expect(fieldInput(field).value).toBe('Kitchen');
});
test('updateOn blur preserves the draft until touch commits the model',async()=>{
  registerField();const fixture=reactive('blur'),field=fieldHost(),control=fixture.componentInstance.group.controls.task;await settle(fixture);field.focus();propose(field,'Laundry');
  expect(control.value).toBe('Kitchen');expect(fieldInput(field).value).toBe('Laundry');field.blur();await settle(fixture);expect(control.value).toBe('Laundry');expect(control.touched).toBe(true);
});
test('updateOn submit commits through the actual Angular form directive',async()=>{
  registerField();const fixture=reactive('submit'),field=fieldHost(),control=fixture.componentInstance.group.controls.task;await settle(fixture);propose(field,'Laundry');expect(control.value).toBe('Kitchen');
  const form=document.querySelector('form')!;form.addEventListener('submit',event=>event.preventDefault());form.requestSubmit();await settle(fixture);expect(control.value).toBe('Laundry');expect(field.value).toBe('Laundry');
});
test('ngModel supports nullable programmatic reset and user changes',async()=>{
  registerField();const fixture=TestBed.createComponent(ModelConsumer);await settle(fixture);const field=fieldHost();expect(field.value).toBe('Kitchen');propose(field,'Laundry');await settle(fixture);expect(fixture.componentInstance.value).toBe('Laundry');
  const directive=fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);directive.control.reset();await settle(fixture);expect(field.value).toBe('');expect(directive.control.pristine).toBe(true);
});
test('standalone value/output, disabled/external owner and no registered callbacks remain safe',async()=>{
  registerField();const fixture=TestBed.createComponent(PlainConsumer);await settle(fixture);const field=fieldHost();propose(field,'Unhandled');expect(field.value).toBe('Kitchen');field.focus();field.blur();
  fixture.componentInstance.external.set('plain-form');fixture.componentInstance.disabled.set(true);await settle(fixture);expect(field.form?.id).toBe('plain-form');expect(fieldInput(field).disabled).toBe(true);fixture.componentInstance.disabled.set(false);fixture.componentInstance.external.set(undefined);fixture.componentInstance.value.set('Acknowledged');await settle(fixture);expect(field.hasAttribute('form')).toBe(false);expect(field.value).toBe('Acknowledged');
});
test('destroy removes both field and touch subscriptions from a retained host',async()=>{
  registerField();const fixture=reactive(),field=fieldHost(),control=fixture.componentInstance.group.controls.task;await settle(fixture);const observer=fixture.componentInstance.observe;fixture.destroy();propose(field,'Retained');field.dispatchEvent(new FocusEvent('focusout'));
  expect(observer).not.toHaveBeenCalled();expect(control.value).toBe('Kitchen');expect(control.untouched).toBe(true);
});

test('rejects malformed native request detail before Angular output or model changes',async()=>{registerField();const fixture=reactive(),field=fieldHost();await settle(fixture);fixture.componentInstance.observe.mockImplementation(event=>event.preventDefault());expect(malformedRequest(field)).toHaveLength(1);expect(fixture.componentInstance.observe).not.toHaveBeenCalled();expect(fixture.componentInstance.group.controls.task.value).toBe('Kitchen');});

test('CVA uses its validated snapshot after a foreign payload is mutated',async()=>{registerField();const fixture=reactive(),field=fieldHost();await settle(fixture);fixture.componentInstance.observe.mockImplementation(event=>{Reflect.set(event.detail,'value',42);});mutableRequest(field);await settle(fixture);expect(fixture.componentInstance.group.controls.task.value).toBe('Snapshot');expect(field.value).toBe('Snapshot');});
