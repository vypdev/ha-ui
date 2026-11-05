import '@angular/compiler';
import {afterEach} from 'vitest';
import {Component,signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {Card} from '../../packages/angular/src/index.js';
import {cardState} from '../../packages/core/src/card-contracts.js';
import {cardAdapterCases,type CardOptions} from './card-framework-fixture.js';
TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());
@Component({standalone:true,imports:[Card],template:`<vyp-ha-card [state]="options().state">
 <p>Review household supplies.</p>@if(options().actions){<button slot="actions" (click)="options().onReview()">Review task</button>}</vyp-ha-card>`})
class Consumer{options=signal<CardOptions>({state:cardState({}),actions:false,supplyActions:true,onReview:()=>{}});}
afterEach(()=>TestBed.resetTestingModule());
cardAdapterCases(async(target,initial)=>{
 const fixture=TestBed.createComponent(Consumer);target.append(fixture.nativeElement);fixture.componentInstance.options.set(initial);
 fixture.detectChanges();await fixture.whenStable();return{host:target.querySelector('vyp-ha-card')!,update:async patch=>{fixture.componentInstance.options.update(value=>({...value,...patch}));fixture.detectChanges();await fixture.whenStable();},unmount:async()=>{fixture.destroy();fixture.nativeElement.remove();}};
});
