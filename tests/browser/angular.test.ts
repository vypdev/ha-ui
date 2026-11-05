import '@angular/compiler';
import {afterEach, expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {Component,signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule,platformBrowserTesting} from '@angular/platform-browser/testing';
import {Tabs} from '../../packages/angular/src/index.js';
import {registerTabs, type NavigationSelectionEvent} from '../../packages/core/src/components/tabs.js';
import {panelState,view,tab,expectNavigationIcons,exerciseNestedTabRequest} from './framework-fixture.js';
TestBed.initTestEnvironment(BrowserTestingModule,platformBrowserTesting());
@Component({standalone:true,imports:[Tabs],template:'<vyp-ha-tabs [state]="state()" (selectionRequest)="selected($event)"><button slot="tasks">Add task</button></vyp-ha-tabs>'})
class Consumer {
  state=signal(panelState()); selected=vi.fn((event:NavigationSelectionEvent)=>event.preventDefault());
}
afterEach(()=>{TestBed.resetTestingModule();document.body.replaceChildren();});
test('mounts the actual core tag as its host and preserves pre-upgrade properties',async()=>{
  const fixture=TestBed.createComponent(Consumer);fixture.detectChanges();const element=view();
  expect(customElements.get('vyp-ha-tabs')).toBeUndefined();expect(element.state.kind).toBe('panels');
  registerTabs();await element.updateComplete;expect(tab(element,'overview').textContent).toBe('Overview');expectNavigationIcons(element);
  expect(document.querySelectorAll('vyp-ha-tabs')).toHaveLength(1);expect(element.hasAttribute('state')).toBe(false);
});
test('Angular input/output and projected content delegate to the same controlled core',async()=>{
  registerTabs();const fixture=TestBed.createComponent(Consumer);fixture.detectChanges();const element=view();await element.updateComplete;
  fixture.componentInstance.state.set(panelState(true));fixture.detectChanges();await element.updateComplete;
  expectNavigationIcons(element,true);await exerciseNestedTabRequest(element);expect(fixture.componentInstance.selected).not.toHaveBeenCalled();
  await page.getByRole('tab',{name:'Tareas',exact:true}).click();
  expect(fixture.componentInstance.selected).toHaveBeenCalledTimes(1);
  const event=fixture.componentInstance.selected.mock.calls[0][0];expect(event.detail).toEqual({kind:'panels',id:'tasks'});expect(event.defaultPrevented).toBe(true);
  expect(element.state.selected).toBe('overview');
  fixture.componentInstance.state.set({...element.state,selected:'tasks'});fixture.detectChanges();await element.updateComplete;
  await expect.element(page.getByRole('button',{name:'Add task',exact:true})).toBeVisible();
});
test('destroy releases its renderer-owned listener before the old host can emit again',async()=>{
  registerTabs();const fixture=TestBed.createComponent(Consumer);fixture.detectChanges();const element=view();await element.updateComplete;
  const handler=fixture.componentInstance.selected;fixture.destroy();tab(element,'tasks').click();expect(handler).not.toHaveBeenCalled();
});
