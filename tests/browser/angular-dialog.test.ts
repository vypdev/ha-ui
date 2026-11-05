import '@angular/compiler';
import {afterEach} from 'vitest';
import {Component,signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {Dialog} from '../../packages/angular/src/index.js';
import {dialogAdapterCases,dialogModel,type DialogOptions} from './dialog-framework-fixture.js';
TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());
@Component({standalone:true,imports:[Dialog],template:`<vyp-ha-dialog [state]="options().state" [open]="options().open" (dialogRequest)="options().onRequest?.($event)" (dialogAction)="options().onAction?.($event)">
 <p data-details>Task details</p>@if(options().footer){<button slot="footer">Review</button>}</vyp-ha-dialog>`})
class Consumer{options=signal<DialogOptions>({state:dialogModel(),open:false});}
afterEach(()=>TestBed.resetTestingModule());
dialogAdapterCases(async(target,initial)=>{
 const fixture=TestBed.createComponent(Consumer);target.append(fixture.nativeElement);fixture.componentInstance.options.set(initial);
 fixture.detectChanges();await fixture.whenStable();return{host:target.querySelector('vyp-ha-dialog')!,update:async patch=>{fixture.componentInstance.options.update(value=>({...value,...patch}));fixture.detectChanges();await fixture.whenStable();},unmount:async()=>{fixture.destroy();}};
});
