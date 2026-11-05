import '@angular/compiler';
import {afterEach} from 'vitest';
import {Component,signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {Grid,Row} from '../../packages/angular/src/index.js';
import {gridState,rowState} from '../../packages/core/src/layout-contracts.js';
import {layoutAdapterCases,type LayoutOptions} from './layout-framework-fixture.js';

TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());
@Component({standalone:true,imports:[Grid,Row],template:`<vyp-ha-grid [state]="options().grid">
 <div role="list"><vyp-ha-row [state]="options().row">
 @if(options().project){<span slot="leading">Prep</span><button slot="trailing" (click)="options().onReview()">Review row</button>}
 </vyp-ha-row></div></vyp-ha-grid>`})
class Consumer{options=signal<LayoutOptions>({grid:gridState({}),row:rowState({label:'Tasks'}),project:false,onReview:()=>{}});}
afterEach(()=>TestBed.resetTestingModule());
layoutAdapterCases(async(target,initial)=>{
 const fixture=TestBed.createComponent(Consumer);target.append(fixture.nativeElement);fixture.componentInstance.options.set(initial);
 fixture.detectChanges();await fixture.whenStable();
 return{update:async patch=>{fixture.componentInstance.options.update(options=>({...options,...patch}));fixture.detectChanges();await fixture.whenStable();},unmount:async()=>{fixture.destroy();fixture.nativeElement.remove();}};
});
