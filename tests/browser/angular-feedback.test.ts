import '@angular/compiler';
import {afterEach} from 'vitest';
import {Component,signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {Feedback} from '../../packages/angular/src/index.js';
import {feedbackState} from '../../packages/core/src/feedback-contracts.js';
import {feedbackAdapterCases,type FeedbackOptions} from './feedback-framework-fixture.js';

TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());
@Component({standalone:true,imports:[Feedback],template:`<vyp-ha-feedback [state]="options().state">
 @if(options().show){<span slot="icon">!</span><button slot="action" (click)="options().onAction()">Retry</button>}
 </vyp-ha-feedback>`})
class Consumer{options=signal<FeedbackOptions>({state:feedbackState({kind:'loading',message:'Loading tasks…'}),show:false,onAction:()=>{}});}
afterEach(()=>TestBed.resetTestingModule());
feedbackAdapterCases(async(target,initial)=>{
 const fixture=TestBed.createComponent(Consumer);target.append(fixture.nativeElement);fixture.componentInstance.options.set(initial);
 fixture.detectChanges();await fixture.whenStable();
 return{update:async patch=>{fixture.componentInstance.options.update(options=>({...options,...patch}));fixture.detectChanges();await fixture.whenStable();},unmount:async()=>{fixture.destroy();fixture.nativeElement.remove();}};
});
