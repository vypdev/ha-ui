import '@angular/compiler';
import {Component,signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {Button} from '../../packages/angular/src/index.js';
import {buttonAdapterCases,buttonModel,type ButtonOptions} from './button-framework-fixture.js';
TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());
@Component({standalone:true,imports:[Button],template:`<vyp-ha-button [state]="options().state" [type]="options().type??'button'" [name]="options().name??''" [value]="options().value??''" [disabled]="options().disabled??false" [formNoValidate]="options().formNoValidate??false" [form]="options().form" (pressRequest)="options().onPressRequest?.($event)" (press)="options().onPress?.($event)" id="bound-button" class="action" lang="en" dir="ltr">@if(options().icons){<span slot="leading">+</span><span slot="trailing">→</span>}</vyp-ha-button>`})
class Consumer {options=signal<ButtonOptions>({state:buttonModel()});}
buttonAdapterCases(async(target,initial)=>{
  const fixture=TestBed.createComponent(Consumer);target.append(fixture.nativeElement);fixture.componentInstance.options.set(initial);fixture.detectChanges();await fixture.whenStable();
  return {host:target.querySelector('vyp-ha-button')!,update:async patch=>{fixture.componentInstance.options.update(value=>({...value,...patch}));fixture.detectChanges();await fixture.whenStable();},unmount:async()=>{fixture.destroy();TestBed.resetTestingModule();}};
});
